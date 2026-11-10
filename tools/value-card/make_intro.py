"""Reels 開頭品牌小動畫(約 1.8 秒,1080x1920,無聲)

  python3 make_intro.py 小宇正面圖.png 輸出.mp4

畫面:筆記紙 → logo 彈出 → 紅筆圈起 logo → 小宇從下方探頭 → 手寫「宇誠文理」與標語
小宇圖:白底即可,程式會從四角去背(頭部內的白色保留)。
"""
import sys, subprocess, math
import numpy as np
from PIL import Image, ImageDraw
import make_card as mc

W, H, FPS, DUR = 1080, 1920, 30, 1.8
ez = lambda k: k * k * (3 - 2 * k)
back = lambda k: 1 + 2.7 * (k - 1) ** 3 + 1.7 * (k - 1) ** 2   # 彈一下的緩動


def cutout(path, h):
    im = Image.open(path).convert('RGB')
    m = Image.new('L', im.size, 0)
    g = im.convert('L').point(lambda v: 255 if v > 235 else 0)       # 接近白色的區域
    flood = g.copy()
    for xy in [(0, 0), (im.width - 1, 0), (0, im.height - 1), (im.width - 1, im.height - 1)]:
        ImageDraw.floodfill(flood, xy, 128)                          # 只把和四角相連的白色當背景
    a = flood.point(lambda v: 0 if v == 128 else 255)
    # 腿和身體圍起的白色區塊也去掉,只保留頭部(上方 40%)裡的白色
    an = np.array(a); gn = np.array(g); cut = int(im.height * 0.4)
    an[cut:][gn[cut:] == 255] = 0
    a = Image.fromarray(an)
    out = im.convert('RGBA'); out.putalpha(a)
    out = out.crop(out.getbbox())
    return out.resize((int(out.width * h / out.height), h), Image.LANCZOS)


def paper():
    rnd = np.random.default_rng(7)
    a = np.ones((H, W, 3), np.float32) * np.array((249, 247, 241), np.float32) + rnd.normal(0, 2.4, (H, W, 1))
    img = Image.fromarray(np.clip(a, 0, 255).astype(np.uint8)); d = ImageDraw.Draw(img)
    for y in range(150, H - 30, 82): d.line([(0, y), (W, y)], fill=mc.RULE, width=2)
    d.line([(128, 0), (128, H)], fill=(228, 156, 150), width=2)
    return img


def main(xy_path, out):
    bg = paper()
    logo = Image.open(f'{mc.HERE}/logo.png').convert('RGBA').resize((340, 340), Image.LANCZOS)
    m = Image.new('L', logo.size, 0); ImageDraw.Draw(m).ellipse([0, 0, 339, 339], fill=255); logo.putalpha(m)
    xy = cutout(xy_path, 520)
    cx, cy = W // 2, 760
    # 文字圖層(由左往右掃出)
    txt = Image.new('RGBA', (W, H), (0, 0, 0, 0)); d = ImageDraw.Draw(txt)
    d.text((cx, cy + 330), '宇誠文理', font=mc.hf(110), fill=mc.NAVY, anchor='ms')
    d.text((cx, cy + 420), '孩子的專屬家教團隊', font=mc.hf(54), fill=mc.NAVY, anchor='ms')
    tb = txt.getbbox()
    p = subprocess.Popen(['ffmpeg', '-loglevel', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', f'{W}x{H}',
                          '-r', str(FPS), '-i', '-', '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '18',
                          '-preset', 'veryfast', '-movflags', '+faststart', out], stdin=subprocess.PIPE)
    rnd = np.random.default_rng(3)
    wob = rnd.normal(0, 4, 400)
    for fi in range(int(DUR * FPS)):
        t = fi / FPS; fr = bg.copy().convert('RGBA')
        # 1. logo 彈出 0.05~0.45s
        k = min(max((t - 0.05) / 0.4, 0), 1)
        if k > 0:
            s = max(back(k), 0.01); L = logo.resize((int(340 * s), int(340 * s)), Image.LANCZOS)
            fr.alpha_composite(L, (cx - L.width // 2, cy - L.height // 2))
        # 2. 紅筆圈 0.35~0.85s(手畫感:半徑抖動、頭尾略交疊)
        k = ez(min(max((t - 0.35) / 0.5, 0), 1))
        if k > 0:
            n = int(400 * k); pts = []
            for i in range(n):
                a = -math.pi * 0.6 + 2.15 * math.pi * i / 400
                r = 225 + wob[i] * 0.6 + 8 * math.sin(a * 3)
                pts.append((cx + r * 1.08 * math.cos(a), cy + r * 0.92 * math.sin(a)))
            if len(pts) > 1: ImageDraw.Draw(fr).line(pts, fill=mc.RED + (255,), width=9, joint='curve')
        # 3. 小宇從左下探頭 0.55~1.0s
        k = min(max((t - 0.55) / 0.45, 0), 1)
        if k > 0:
            y = int(H - 40 - xy.height * 0.78 * back(k)) + int(xy.height * 0.0)
            fr.alpha_composite(xy, (150, max(y, cy + 470)))
        # 4. 文字掃出 0.8~1.3s
        k = ez(min(max((t - 0.8) / 0.5, 0), 1))
        if k > 0:
            x1 = int(tb[0] + (tb[2] - tb[0]) * k)
            fr.alpha_composite(txt.crop((0, 0, x1, H)), (0, 0))
        p.stdin.write(np.asarray(fr.convert('RGB')).tobytes())
    p.stdin.close(); p.wait()


if __name__ == '__main__':
    main(sys.argv[1], sys.argv[2] if len(sys.argv) > 2 else 'intro.mp4')
