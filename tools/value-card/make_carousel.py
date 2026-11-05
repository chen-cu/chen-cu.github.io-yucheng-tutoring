"""老師的紅筆|多頁輪播版(1080x1350,每頁同一張筆記紙)。

用法:python3 make_carousel.py carousel.json 輸出資料夾
JSON:{"no": "016", "seed": 16, "pages": [{"header": "...", "lines": [...], "notes": [...],
       "circle": [行, 起, 迄], "underline": [行, 起, 迄], "size": 80}, ...]}
第一頁自動加「往左滑」提示,最後一頁自動加品牌署名;每頁右上角標頁碼。
"""
import json, os, sys
from PIL import Image, ImageDraw
from fontTools.ttLib import TTFont
from make_card import (paper, hf, rule, ellipse, wobble_line, FONT, HERE,
                       W, H, X0, RED, INK, GREY, NAVY)

def page(p, i, n, seed, out):
    img, d = paper(seed + i)
    size = p.get('size', 80); f = hf(size); gap = 16
    lines, notes = p.get('lines', []), p.get('notes', [])
    ci, ul = p.get('circle'), p.get('underline')
    d.text((X0, rule(1) - 14), p['header'], font=hf(46), fill=RED, anchor='ls')
    d.text((W - 70, rule(1) - 14), f'{i + 1} / {n}', font=hf(36), fill=GREY, anchor='rs')
    start = p.get('row', 3)
    rows = [start + k for k in range(len(lines))]
    def xpos(ri, k):
        x = X0 + d.textlength(lines[ri][:k], font=f)
        if ci and ci[0] == ri:
            if k >= ci[1] and ci[1] > 0: x += gap
            if k >= ci[2]: x += gap
        return x
    for ri, s in enumerate(lines):
        for k, ch in enumerate(s):
            d.text((xpos(ri, k), rule(rows[ri]) - 12), ch, font=f, fill=INK, anchor='ls')
    if ci:
        ri, a, b = ci
        xa = xpos(ri, a); xb = X0 + d.textlength(lines[ri][:b], font=f) + (gap if a > 0 else 0)
        y = rule(rows[ri]); ellipse(d, (xa - 12, y - size - 4, xb + 4, y + 4), RED, seed + i + 3)
    if ul:
        ri, a, b = ul
        xa = xpos(ri, a); xb = xpos(ri, b - 1) + d.textlength(lines[ri][b - 1], font=f); y = rule(rows[ri])
        wobble_line(d, (xa - 4, y + 4), (xb + 6, y), RED, 5, 2.2, seed + i + 5)
        wobble_line(d, (xa + 10, y + 16), (xb - 10, y + 13), RED, 4, 2.0, seed + i + 6)
    nr = rows[-1] + 2 if rows else 3
    for k, s in enumerate(notes):
        d.text((X0, rule(nr + k) - 14), s, font=hf(40), fill=GREY, anchor='ls')
    if i == 0:  # 往左滑提示(手畫箭頭,不用符號字元)
        y = H - 110; xr = W - 80
        d.text((xr - 90, y + 14), '往左滑', font=hf(40), fill=RED, anchor='rs')
        wobble_line(d, (xr - 76, y), (xr, y), RED, 4, 1.2, seed + 9)
        d.line([(xr - 18, y - 14), (xr, y), (xr - 18, y + 14)], fill=RED, width=4, joint='curve')
    if i == n - 1:
        logo = Image.open(os.path.join(HERE, 'logo.png')).convert('RGBA').resize((104, 104), Image.LANCZOS)
        m = Image.new('L', (104, 104), 0); ImageDraw.Draw(m).ellipse([0, 0, 103, 103], fill=255); logo.putalpha(m)
        lx, ly = W - 174, H - 164
        img.alpha_composite(logo, (lx, ly)); d = ImageDraw.Draw(img)
        d.text((lx - 22, ly + 44), '宇誠文理家教團', font=hf(44), fill=NAVY, anchor='rs')
        d.text((lx - 22, ly + 92), '孩子的專屬家教團隊', font=hf(32), fill=NAVY, anchor='rs')
    img.convert('RGB').save(out, quality=92)

def check(c):
    cmap = TTFont(FONT).getBestCmap(); bad = []
    for i, p in enumerate(c['pages']):
        texts = [p['header']] + p.get('lines', []) + p.get('notes', [])
        miss = {ch for s in texts for ch in s if ord(ch) not in cmap and ch != ' '}
        if miss: bad.append(f'第{i + 1}頁缺字:{"".join(sorted(miss))}')
        for s in texts:
            if '來' in s or '・' in s: bad.append(f'第{i + 1}頁含禁用字:{s}')
        f = hf(p.get('size', 80))
        for s in p.get('lines', []):
            if f.getlength(s) > W - X0 - 70: bad.append(f'第{i + 1}頁主句過寬:{s}')
        for s in p.get('notes', []):
            if hf(40).getlength(s) > W - X0 - 70: bad.append(f'第{i + 1}頁小字過寬:{s}')
    return bad

if __name__ == '__main__':
    c = json.load(open(sys.argv[1], encoding='utf-8')); out = sys.argv[2]
    os.makedirs(out, exist_ok=True)
    bad = check(c)
    if bad: print('\n'.join(bad)); sys.exit(1)
    n = len(c['pages'])
    for i, p in enumerate(c['pages']):
        page(p, i, n, c.get('seed', 1), os.path.join(out, f'ig-redpen-{c["no"]}-{i + 1}.jpg'))
    print('ok', n)
