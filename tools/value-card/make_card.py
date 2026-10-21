"""價值文配圖產生器(筆記紙手寫風格,1080x1350,4:5)

用法:
  python3 make_card.py cards.json 輸出資料夾
cards.json 範例:
  [{"header": "段考後的訂正",
    "lines": ["訂正完，", "再看錯題擠在哪幾週。"],
    "underline": [0, 0, 2],          # [第幾行, 起始字, 結束字(不含)]
    "circle": [1, 6, 9],             # 同上;圈選字前後會自動留空
    "notes": ["每道錯題寫上章節……", "……", "……"],   # 三行灰字做法摘要
    "file": "fb-value-1021-訂正找斷點.png", "seed": 11}]

規則:
  - 主句兩行、每行最多約 10 字(字級 80);灰字每行最多約 22 字
  - 手寫字型缺「・」,「來」會顯示成簡體:兩者都不要用(腳本會擋)
  - 不放 LINE、網址、招生字眼;署名與 logo 由腳本固定放右下
字型:AbbrFesFont(justfont,SIL OFL 1.1),首次執行自動下載到 ~/.cache/yucheng-font
"""
import sys, os, json, math, random, subprocess
import numpy as np
from PIL import Image, ImageDraw, ImageFont
from fontTools.ttLib import TTFont

HERE = os.path.dirname(os.path.abspath(__file__))
CACHE = os.path.expanduser('~/.cache/yucheng-font')
FONT = os.path.join(CACHE, 'font', 'AbbrFesFont.ttf')
if not os.path.exists(FONT):
    subprocess.run(['git', 'clone', '--depth', '1', 'https://github.com/justfont/AbbrFesFont', CACHE], check=True)

W, H = 1080, 1350
RED, INK, GREY, RULE = (192, 50, 46), (34, 38, 52), (112, 108, 100), (192, 207, 220)
NAVY = (23, 37, 61)
X0, GAP, TOP = 168, 112, 200

def hf(size):  # BASIC layout:不套 GSUB,避免字型內建的縮寫連字
    return ImageFont.truetype(FONT, size, layout_engine=ImageFont.Layout.BASIC)

def rule(n): return TOP + GAP * n

def paper(seed):
    rnd = np.random.default_rng(seed)
    base = np.ones((H, W, 3), np.float32) * np.array((249, 247, 241), np.float32)
    base += rnd.normal(0, 2.4, (H, W, 1))
    img = Image.fromarray(np.clip(base, 0, 255).astype(np.uint8)).convert('RGBA')
    d = ImageDraw.Draw(img)
    for y in range(TOP, H - 140, GAP):
        d.line([(0, y), (W, y)], fill=RULE, width=2)
    d.line([(128, 0), (128, H)], fill=(228, 156, 150), width=2)
    return img, d

def wobble_line(d, p1, p2, color, width, amp, seed):
    rnd = random.Random(seed)
    n = max(8, int(math.dist(p1, p2) / 18)); pts = []
    for i in range(n + 1):
        t = i / n
        x, y = p1[0] + (p2[0] - p1[0]) * t, p1[1] + (p2[1] - p1[1]) * t
        nx, ny = -(p2[1] - p1[1]), (p2[0] - p1[0]); L = math.hypot(nx, ny) or 1
        off = math.sin(t * math.pi * rnd.uniform(1, 2.5)) * amp + rnd.uniform(-amp, amp) * 0.5
        pts.append((x + nx / L * off, y + ny / L * off))
    d.line(pts, fill=color, width=width, joint='curve')

def ellipse(d, box, color, seed, width=4):
    rnd = random.Random(seed)
    x0, y0, x1, y1 = box
    cx, cy, rx, ry = (x0 + x1) / 2, (y0 + y1) / 2, (x1 - x0) / 2, (y1 - y0) / 2
    start = rnd.uniform(0, math.pi); pts = []
    for i in range(76):
        t = start + i / 70 * 2 * math.pi
        k = 1 + rnd.uniform(-0.03, 0.03) + 0.04 * (i / 76)
        pts.append((cx + rx * k * math.cos(t), cy + ry * k * math.sin(t)))
    d.line(pts, fill=color, width=width, joint='curve')

def card(c, out, size=80, gap=16):
    lines, notes, seed = c['lines'], c['notes'], c.get('seed', 1)
    ul, ci = c.get('underline'), c.get('circle')
    img, d = paper(seed); f = hf(size)
    d.text((X0, rule(1) - 14), c['header'], font=hf(46), fill=RED, anchor='ls')
    rows = [3, 4, 5][:len(lines)]
    def xpos(ri, k):
        x = X0 + d.textlength(lines[ri][:k], font=f)
        if ci and ci[0] == ri:
            if k >= ci[1] and ci[1] > 0: x += gap
            if k >= ci[2]: x += gap
        return x
    for ri, (row, s) in enumerate(zip(rows, lines)):
        for k, ch in enumerate(s):
            d.text((xpos(ri, k), rule(row) - 12), ch, font=f, fill=INK, anchor='ls')
    if ci:
        ri, a, b = ci
        xa = xpos(ri, a); xb = X0 + d.textlength(lines[ri][:b], font=f) + (gap if a > 0 else 0)
        y = rule(rows[ri]); ellipse(d, (xa - 12, y - size - 4, xb + 4, y + 4), RED, seed + 3)
    if ul:
        ri, a, b = ul
        xa = xpos(ri, a); xb = xpos(ri, b - 1) + d.textlength(lines[ri][b - 1], font=f); y = rule(rows[ri])
        wobble_line(d, (xa - 4, y + 4), (xb + 6, y), RED, 5, 2.2, seed + 5)
        wobble_line(d, (xa + 10, y + 16), (xb - 10, y + 13), RED, 4, 2.0, seed + 6)
    for i, s in enumerate(notes):
        d.text((X0, rule(6 + i) - 14), s, font=hf(38), fill=GREY, anchor='ls')
    logo = Image.open(os.path.join(HERE, 'logo.png')).convert('RGBA').resize((104, 104), Image.LANCZOS)
    m = Image.new('L', (104, 104), 0); ImageDraw.Draw(m).ellipse([0, 0, 103, 103], fill=255); logo.putalpha(m)
    lx, ly = W - 174, H - 164
    img.alpha_composite(logo, (lx, ly)); d = ImageDraw.Draw(img)
    d.text((lx - 22, ly + 44), '宇誠文理家教團', font=hf(44), fill=NAVY, anchor='rs')
    d.text((lx - 22, ly + 92), '孩子的專屬家教團隊', font=hf(32), fill=NAVY, anchor='rs')
    img.convert('RGB').save(out)

def check(c):
    cmap = TTFont(FONT).getBestCmap()
    texts = [c['header']] + c['lines'] + c['notes']
    miss = {ch for s in texts for ch in s if ord(ch) not in cmap and ch != ' '}
    assert not miss, f'字型缺字:{miss}'
    assert not any('來' in s for s in texts), '「來」會顯示成簡體,請改寫'
    d = ImageDraw.Draw(Image.new('RGB', (10, 10)))
    for s in c['lines']:
        assert X0 + d.textlength(s, font=hf(80)) + 32 < 1060, f'主句太長:{s}'
    for s in c['notes']:
        assert X0 + d.textlength(s, font=hf(38)) < 1040, f'灰字太長:{s}'

if __name__ == '__main__':
    cards = json.load(open(sys.argv[1], encoding='utf-8'))
    outdir = sys.argv[2] if len(sys.argv) > 2 else '.'
    for c in cards:
        check(c); card(c, os.path.join(outdir, c['file'])); print('ok', c['file'])
