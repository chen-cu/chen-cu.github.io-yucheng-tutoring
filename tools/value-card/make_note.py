"""IG 限動「夾在書裡」便條紙(1080x1920)

用法:
  python3 make_note.py note.json 輸出資料夾
note.json:單則或陣列,欄位:
  header   "夾在書裡 No.17"
  lines    手寫主句(中文,每行 12 字內)
  orig     原文(外文或日文等,可省略;字串自動斷行,或給清單手動斷行);中文原作可改用 note 放白話
  note     白話說明(可省略,最多 2 行)
  src      出處,例:"——福澤諭吉《學問之勸》初編，1872"
  file     輸出檔名(不含副檔名)
  seed, tilt  紙張紋理與傾斜角度(度)
2026-11-09 重建(原檔只存在暫存區,環境重置後遺失),版面依 No.14~16 成品重做。
"""
import sys, os, json, textwrap
import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageFont
from fontTools.ttLib import TTFont
import make_card as mc

W, H = 1080, 1920
NOTE = (250, 243, 212)
SERIF = '/usr/share/fonts/opentype/noto/NotoSerifCJK-Regular.ttc'
if not os.path.exists(SERIF):
    SERIF = '/usr/share/fonts/opentype/noto/NotoSerifCJK-Medium.ttc'


def serif(size, lang='TC'):
    """Noto Serif CJK:依語言挑字集(TC 繁中、JP 日文、KR 韓文)"""
    for i in range(10):
        try:
            f = ImageFont.truetype(SERIF, size, index=i)
        except OSError:
            break
        if lang in f.getname()[0]:
            return f
    return ImageFont.truetype(SERIF, size)


def check(c):
    cmap = TTFont(mc.FONT).getBestCmap()
    hand = c['lines'] + c.get('note', [])
    miss = {ch for s in hand for ch in s if ord(ch) not in cmap and ch != ' '}
    bad = [s for s in hand if '來' in s or '・' in s]
    d = ImageDraw.Draw(Image.new('RGB', (10, 10)))
    wide = [s for s in c['lines'] if d.textlength(s, font=mc.hf(64)) > 700]
    return miss, bad, wide


def make(c, out):
    rnd = np.random.default_rng(c.get('seed', 1))
    a = np.ones((H, W, 3), np.float32) * np.array((233, 231, 227), np.float32)
    a += rnd.normal(0, 2.0, (H, W, 1))
    img = Image.fromarray(np.clip(a, 0, 255).astype(np.uint8)).convert('RGBA')
    d = ImageDraw.Draw(img)
    d.text((110, 380), c['header'], font=serif(36), fill=(96, 92, 86), anchor='ls')

    # 便條紙內容先畫在獨立圖層,再整張旋轉
    nw, pad = 860, 80
    lay = Image.new('RGBA', (nw, 1400), (0, 0, 0, 0)); ld = ImageDraw.Draw(lay)
    y = 170
    for s in c['lines']:
        ld.text((pad, y), s, font=mc.hf(64), fill=mc.INK, anchor='ls'); y += 116
    y += 40
    if c.get('orig'):
        lang = c.get('lang', 'EN')
        if isinstance(c['orig'], list):          # 已手動斷行(日文、韓文建議在標點後斷)
            f = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSerif-Italic.ttf', 31) if lang == 'EN' else serif(34, lang)
            wrap = c['orig']
        elif lang == 'EN':
            f = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSerif-Italic.ttf', 31)
            wrap = textwrap.wrap(c['orig'], 42)
        else:
            f = serif(34, lang); wrap, cur = [], ''
            for ch in c['orig']:
                if ld.textlength(cur + ch, font=f) > nw - 2 * pad:
                    wrap.append(cur); cur = ''
                cur += ch
            wrap.append(cur)
        y += 30
        for s in wrap:
            ld.text((pad + 6, y), s, font=f, fill=(112, 106, 96), anchor='ls'); y += 54
        y += 20
    if c.get('note'):
        y += 30
        for s in c['note']:
            ld.text((pad, y), s, font=mc.hf(38), fill=mc.GREY, anchor='ls'); y += 62
        y += 10
    y += 60
    ld.text((pad, y), c['src'], font=serif(30), fill=(112, 106, 96), anchor='ls')
    nh = y + 90

    paper = Image.new('RGBA', (nw, nh), NOTE + (255,))
    pn = np.asarray(paper).astype(np.float32)
    pn[..., :3] += rnd.normal(0, 1.6, (nh, nw, 1))
    paper = Image.fromarray(np.clip(pn, 0, 255).astype(np.uint8))
    paper.alpha_composite(lay.crop((0, 0, nw, nh)))
    tilt = c.get('tilt', -1.2)
    rot = paper.rotate(tilt, resample=Image.BICUBIC, expand=True)
    sh = Image.new('RGBA', rot.size, (0, 0, 0, 0))
    sh.putalpha(rot.split()[3].point(lambda v: int(v * 0.22)))
    sh = sh.filter(ImageFilter.GaussianBlur(20))
    x0, y0 = (W - rot.width) // 2, 470
    img.alpha_composite(sh, (x0 + 6, y0 + 12))
    img.alpha_composite(rot, (x0, y0))

    # 署名
    logo = Image.open(os.path.join(mc.HERE, 'logo.png')).convert('RGBA').resize((84, 84), Image.LANCZOS)
    m = Image.new('L', (84, 84), 0); ImageDraw.Draw(m).ellipse([0, 0, 83, 83], fill=255); logo.putalpha(m)
    ly = max(y0 + rot.height + 40, 1500)
    img.alpha_composite(logo, (880, ly))
    ImageDraw.Draw(img).text((856, ly + 54), '宇誠文理家教團', font=mc.hf(40), fill=mc.NAVY, anchor='rs')
    img = img.convert('RGB')
    img.save(out)
    return rot.size


if __name__ == '__main__':
    data = json.load(open(sys.argv[1], encoding='utf-8'))
    outdir = sys.argv[2] if len(sys.argv) > 2 else '.'
    for c in (data if isinstance(data, list) else [data]):
        miss, bad, wide = check(c)
        assert not miss, f'手寫字型缺字:{miss}'
        assert not bad, f'不要用「來」「・」:{bad}'
        assert not wide, f'太長:{wide}'
        p = os.path.join(outdir, c['file'] + '.png'); make(c, p)
        Image.open(p).save(p[:-4] + '.jpg', quality=92); print('ok', p)
