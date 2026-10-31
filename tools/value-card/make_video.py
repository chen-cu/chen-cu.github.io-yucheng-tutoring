"""紅筆／價值文卡片 → 手寫動畫短影音(1080x1920,9:16,無聲,音樂請在 IG 加)

用法:
  python3 make_video.py cards.json 輸出資料夾
cards.json 與 make_card.py 相同格式;輸出檔名把 .png 換成 .mp4。

做法:每個字依字型筆畫的連通區塊,一塊一塊「寫」出來(橫向的由左到右、直向的由上到下),
字與字之間有不規則停頓;紅筆底線與圈選沿著筆跡路徑畫出,不是淡入。
"""
import sys, os, json, math, random, subprocess
import numpy as np
from PIL import Image, ImageDraw
from scipy import ndimage
import make_card as mc

W, H = 1080, 1920
OFF = (H - mc.H) // 2          # 卡片內容往下平移,上下延伸成 9:16 筆記紙
FPS = 30


def base_paper(seed):
    rnd = np.random.default_rng(seed)
    a = np.ones((H, W, 3), np.float32) * np.array((249, 247, 241), np.float32)
    a += rnd.normal(0, 2.4, (H, W, 1))
    img = Image.fromarray(np.clip(a, 0, 255).astype(np.uint8))
    d = ImageDraw.Draw(img)
    for y in range(OFF + mc.TOP - mc.GAP * 2, H - 40, mc.GAP):
        d.line([(0, y), (W, y)], fill=mc.RULE, width=2)
    d.line([(128, 0), (128, H)], fill=(228, 156, 150), width=2)
    return np.asarray(img).astype(np.float32)


class Ink:
    """一個要被「寫出來」的元素:彩色像素 + 每個像素出現的時間(秒)"""
    def __init__(self):
        self.items = []   # (y0, x0, rgb(h,w,3), alpha(h,w), t(h,w))

    def add(self, layer, t_of_pixel):
        a = np.asarray(layer)[..., 3].astype(np.float32) / 255
        ys, xs = np.nonzero(a > 0)
        if len(ys) == 0: return
        y0, y1, x0, x1 = ys.min(), ys.max() + 1, xs.min(), xs.max() + 1
        rgb = np.asarray(layer)[y0:y1, x0:x1, :3].astype(np.float32)
        self.items.append((y0, x0, rgb, a[y0:y1, x0:x1], t_of_pixel[y0:y1, x0:x1]))


def glyph_layer(ch, xy, font, color):
    lay = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    ImageDraw.Draw(lay).text(xy, ch, font=font, fill=color, anchor='ls')
    return lay


def write_text(ink, s, xs, y, font, color, t, rnd, per_comp=0.07, gap=0.05, jit=(0.01, 0.04)):
    """逐字逐筆畫寫出;xs 為每個字的 x 座標。回傳寫完的時間。"""
    for ch, x in zip(s, xs):
        if ch.strip() == '':
            t += gap; continue
        lay = glyph_layer(ch, (x, y), font, color)
        a = np.asarray(lay)[..., 3]
        lab, n = ndimage.label(a > 0)
        if n == 0: continue
        objs = ndimage.find_objects(lab)
        order = sorted(range(n), key=lambda i: (objs[i][0].start // 18, objs[i][1].start))
        tp = np.full(a.shape, np.inf, np.float32)
        for i in order:
            sl = objs[i]; m = lab[sl] == i + 1
            h, w = m.shape
            size = max(h, w)
            dur = per_comp * (0.5 + size / font.size) * rnd.uniform(0.8, 1.2)
            if w >= h:
                prog = np.tile(np.arange(w, dtype=np.float32) / max(w - 1, 1), (h, 1))
            else:
                prog = np.tile((np.arange(h, dtype=np.float32) / max(h - 1, 1))[:, None], (1, w))
            sub = tp[sl]; sub[m] = t + prog[m] * dur; tp[sl] = sub
            t += dur + rnd.uniform(*jit)
        # 反鋸齒邊緣:歸給最近的筆畫
        idx = ndimage.distance_transform_edt(~np.isfinite(tp), return_distances=False, return_indices=True)
        tp = tp[idx[0], idx[1]]
        ink.add(lay, tp)
        t += gap * rnd.uniform(0.6, 1.6)
    return t


def draw_path(ink, pts, color, width, t, dur):
    """沿路徑畫線:每一小段在對應時間出現"""
    pts = [(x, y + OFF) for x, y in pts]
    L = [0.0]
    for p, q in zip(pts, pts[1:]): L.append(L[-1] + math.dist(p, q))
    tp = np.full((H, W), np.inf, np.float32)
    lay = Image.new('RGBA', (W, H), (0, 0, 0, 0)); d = ImageDraw.Draw(lay)
    for i, (p, q) in enumerate(zip(pts, pts[1:])):
        seg = Image.new('L', (W, H), 0)
        ImageDraw.Draw(seg).line([p, q], fill=255, width=width + 2)
        m = np.asarray(seg) > 0
        tp[m] = np.minimum(tp[m], t + L[i] / L[-1] * dur)
    d.line(pts, fill=color, width=width, joint='curve')
    tp[~np.isfinite(tp)] = t + dur
    ink.add(lay, tp)
    return t + dur


def wobble_pts(p1, p2, amp, seed):
    rnd = random.Random(seed)
    n = max(8, int(math.dist(p1, p2) / 18)); pts = []
    for i in range(n + 1):
        t = i / n
        x, y = p1[0] + (p2[0] - p1[0]) * t, p1[1] + (p2[1] - p1[1]) * t
        nx, ny = -(p2[1] - p1[1]), (p2[0] - p1[0]); Ln = math.hypot(nx, ny) or 1
        off = math.sin(t * math.pi * rnd.uniform(1, 2.5)) * amp + rnd.uniform(-amp, amp) * 0.5
        pts.append((x + nx / Ln * off, y + ny / Ln * off))
    return pts


def ellipse_pts(box, seed):
    rnd = random.Random(seed)
    x0, y0, x1, y1 = box
    cx, cy, rx, ry = (x0 + x1) / 2, (y0 + y1) / 2, (x1 - x0) / 2, (y1 - y0) / 2
    start = rnd.uniform(0, math.pi); pts = []
    for i in range(76):
        t = start + i / 70 * 2 * math.pi
        k = 1 + rnd.uniform(-0.03, 0.03) + 0.04 * (i / 76)
        pts.append((cx + rx * k * math.cos(t), cy + ry * k * math.sin(t)))
    return pts


def build(c):
    seed = c.get('seed', 1); rnd = random.Random(seed)
    lines, notes = c['lines'], c['notes']
    ul, ci = c.get('underline'), c.get('circle')
    f, gap, size = mc.hf(80), 16, 80
    dm = ImageDraw.Draw(Image.new('RGB', (10, 10)))
    rows = [3, 4, 5][:len(lines)]

    def xpos(ri, k):
        x = mc.X0 + dm.textlength(lines[ri][:k], font=f)
        if ci and ci[0] == ri:
            if k >= ci[1] and ci[1] > 0: x += gap
            if k >= ci[2]: x += gap
        return x

    ink = Ink(); t = 0.4
    hfnt = mc.hf(46)
    xs = [mc.X0 + dm.textlength(c['header'][:k], font=hfnt) for k in range(len(c['header']))]
    t = write_text(ink, c['header'], xs, mc.rule(1) - 14 + OFF, hfnt, mc.RED, t, rnd, 0.022, 0.015) + 0.3
    for ri, (row, s) in enumerate(zip(rows, lines)):
        xs = [xpos(ri, k) for k in range(len(s))]
        t = write_text(ink, s, xs, mc.rule(row) - 12 + OFF, f, mc.INK, t, rnd, 0.045, 0.04) + 0.2
    t += 0.2
    if ul:
        ri, a, b = ul
        xa = xpos(ri, a); xb = xpos(ri, b - 1) + dm.textlength(lines[ri][b - 1], font=f); y = mc.rule(rows[ri])
        t = draw_path(ink, wobble_pts((xa - 4, y + 4), (xb + 6, y), 2.2, seed + 5), mc.RED, 5, t, 0.35) + 0.08
        t = draw_path(ink, wobble_pts((xa + 10, y + 16), (xb - 10, y + 13), 2.0, seed + 6), mc.RED, 4, t, 0.3) + 0.25
    if ci:
        ri, a, b = ci
        xa = xpos(ri, a); xb = mc.X0 + dm.textlength(lines[ri][:b], font=f) + (gap if a > 0 else 0)
        y = mc.rule(rows[ri])
        t = draw_path(ink, ellipse_pts((xa - 12, y - size - 4, xb + 4, y + 4), seed + 3), mc.RED, 4, t, 0.7) + 0.4
    nf = mc.hf(38)
    for i, s in enumerate(notes):
        xs = [mc.X0 + dm.textlength(s[:k], font=nf) for k in range(len(s))]
        t = write_text(ink, s, xs, mc.rule(6 + i) - 14 + OFF, nf, mc.GREY, t, rnd, 0.011, 0.006) + 0.1
    return ink, t + 0.2


def signature(seed):
    lay = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    logo = Image.open(os.path.join(mc.HERE, 'logo.png')).convert('RGBA').resize((104, 104), Image.LANCZOS)
    m = Image.new('L', (104, 104), 0); ImageDraw.Draw(m).ellipse([0, 0, 103, 103], fill=255); logo.putalpha(m)
    lx, ly = W - 174, mc.H - 164 + OFF
    lay.alpha_composite(logo, (lx, ly)); d = ImageDraw.Draw(lay)
    d.text((lx - 22, ly + 44), '宇誠文理家教團', font=mc.hf(44), fill=mc.NAVY, anchor='rs')
    d.text((lx - 22, ly + 92), '孩子的專屬家教團隊', font=mc.hf(32), fill=mc.NAVY, anchor='rs')
    arr = np.asarray(lay).astype(np.float32)
    return arr[..., :3], arr[..., 3] / 255


def render(c, out, hold=2.5):
    mc.check(c)
    bg = base_paper(c.get('seed', 1))
    ink, t_end = build(c)
    sig_rgb, sig_a = signature(c.get('seed', 1))
    total = t_end + 0.6 + hold
    nframes = int(total * FPS)
    cmd = ['ffmpeg', '-loglevel', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', f'{W}x{H}',
           '-r', str(FPS), '-i', '-', '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '18',
           '-preset', 'medium', '-movflags', '+faststart', out]
    p = subprocess.Popen(cmd, stdin=subprocess.PIPE)
    for fi in range(nframes):
        now = fi / FPS
        frame = bg.copy()
        for y0, x0, rgb, a, tp in ink.items:
            vis = a * np.clip((now - tp) * 25 + 1, 0, 1)   # 每個像素約 0.04 秒內上墨
            h, w = a.shape
            reg = frame[y0:y0 + h, x0:x0 + w]
            reg[:] = reg * (1 - vis[..., None]) + rgb * vis[..., None]
        k = np.clip((now - t_end) / 0.6, 0, 1)
        if k > 0:
            av = sig_a * k
            frame = frame * (1 - av[..., None]) + sig_rgb * av[..., None]
        p.stdin.write(np.clip(frame, 0, 255).astype(np.uint8).tobytes())
    p.stdin.close(); p.wait()
    return total


if __name__ == '__main__':
    cards = json.load(open(sys.argv[1], encoding='utf-8'))
    outdir = sys.argv[2] if len(sys.argv) > 2 else '.'
    for c in cards:
        out = os.path.join(outdir, c['file'].rsplit('.', 1)[0] + '.mp4')
        print('ok', out, f'{render(c, out):.1f}s')
