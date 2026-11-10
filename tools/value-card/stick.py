"""程式繪製的小宇(火柴人),可動關節,任意解析度都清晰。造型依 2026-11-09 角色設定圖。

draw_xiaoyu(img, x, feet_y, h, pose)  在 RGBA 圖上畫小宇;x 是身體中線,feet_y 是腳底,h 是全身高度
pose:dict,角度單位為度(0 = 垂直向下,正值往前/右)
  lean 身體前傾、bob 上下位移(px)
  la/ra 左右上臂、lf/rf 左右前臂(相對上臂)
  ll/rl 左右大腿、lk/rk 左右膝蓋彎曲(相對大腿,往後彎為負)
  mouth 'smile' / 'open'、wave 揮手(右手舉高)
"""
import math
from PIL import Image, ImageDraw

NAVY = (23, 37, 61, 255)
WHITE = (255, 255, 255, 255)
SHADOW = (200, 214, 228, 255)
SS = 3   # 超取樣倍率,畫大再縮小 = 線條平滑
import os
# 頭部用設定圖切下的素材(頭髮、五官跟設定圖一模一樣);圓心與半徑是素材上的像素位置
HEAD = {'file': os.path.join(os.path.dirname(os.path.abspath(__file__)), 'xiaoyu_head.png'), 'cx': 161, 'cy': 205, 'r': 157}
_head = None


def run_pose(phase, lean=10):
    s = math.sin(phase)
    return dict(lean=lean, bob=abs(math.cos(phase)) * 14,
                ll=30 * s, rl=-30 * s, lk=-65 * max(0, -s) - 12, rk=-65 * max(0, s) - 12,
                la=-40 * s, ra=40 * s, lf=70, rf=70, mouth='open')


STAND = dict(lean=0, bob=0, ll=-3, rl=3, lk=0, rk=0, la=24, ra=-24, lf=-8, rf=8, mouth='smile', hipw=20)


def mix(a, b, k):
    out = {}
    for key in set(a) | set(b):
        va, vb = a.get(key, 0), b.get(key, 0)
        out[key] = va + (vb - va) * k if isinstance(vb, (int, float)) and isinstance(va, (int, float)) else (vb if k > 0.5 else va)
    return out


def draw_xiaoyu(img, x, feet_y, h, pose):
    s = h / 600 * SS                        # 以 600px 高為基準設計
    W, H = int(420 * s), int(700 * s)
    lay = Image.new('RGBA', (W, H), (0, 0, 0, 0)); d = ImageDraw.Draw(lay)
    lw = max(int(9 * s), 2)
    fx, fy = W / 2, H - 30 * s - pose.get('bob', 0) * s       # 腳底基準
    # 影子(不跟著彈跳)
    d.ellipse([W / 2 - 95 * s, H - 42 * s, W / 2 + 95 * s, H - 18 * s], fill=SHADOW)
    hip = (fx, fy - 205 * s)
    lean = math.radians(pose.get('lean', 0))
    neck = (hip[0] + 150 * s * math.sin(lean), hip[1] - 150 * s * math.cos(lean))
    shoulder = (hip[0] + 128 * s * math.sin(lean), hip[1] - 128 * s * math.cos(lean))

    def limb(start, a1, a2, l1, l2, end_circle=False):
        a1r = math.radians(a1); a2r = math.radians(a1 + a2)
        j = (start[0] + l1 * s * math.sin(a1r), start[1] + l1 * s * math.cos(a1r))
        e = (j[0] + l2 * s * math.sin(a2r), j[1] + l2 * s * math.cos(a2r))
        d.line([start, j, e], fill=NAVY, width=lw, joint='curve')
        r = 3.5 * s; d.ellipse([j[0] - r, j[1] - r, j[0] + r, j[1] + r], fill=NAVY)
        if end_circle:
            r = 21 * s; d.ellipse([e[0] - r, e[1] - r, e[0] + r, e[1] + r], fill=WHITE, outline=NAVY, width=int(lw * 0.8))
        else:   # 腳掌
            d.line([e, (e[0] + 26 * s, e[1] + 2 * s)], fill=NAVY, width=lw)
        return e

    # 後腳、後手先畫(被身體擋在後面)
    hw = pose.get('hipw', 0) * s          # 正面站姿:兩腿從左右兩點出發,像設定圖的褲管
    hipL, hipR = (hip[0] - hw, hip[1]), (hip[0] + hw, hip[1])
    limb(hipR, pose['rl'], pose['rk'], 103, 103)
    if not pose.get('wave'):
        limb(shoulder, pose['ra'], pose['rf'], 72, 68, True)
    d.line([hip, neck], fill=NAVY, width=lw)
    limb(hipL, pose['ll'], pose['lk'], 103, 103)
    if hw: d.line([hipL, hipR], fill=NAVY, width=lw)
    limb(shoulder, pose['la'], pose['lf'], 72, 68, True)
    # 頭
    hr = 84 * s; hc = (neck[0] + 6 * s * math.sin(lean), neck[1] - hr + 4 * s)
    global _head
    if pose.get('head', True) and os.path.exists(HEAD['file']):
        if _head is None: _head = Image.open(HEAD['file']).convert('RGBA')
        k = hr / HEAD['r']
        hd = _head.resize((int(_head.width * k), int(_head.height * k)), Image.LANCZOS)
        hd = hd.rotate(-math.degrees(lean) * 0.5, resample=Image.BICUBIC, expand=True,
                       center=(HEAD['cx'] * k, HEAD['cy'] * k))
        lay.alpha_composite(hd, (int(hc[0] - HEAD['cx'] * k), int(hc[1] - HEAD['cy'] * k)))
        if pose.get('wave'):     # 揮手的手畫在頭前面:上臂往外上舉,前臂朝上左右擺(wave_f 是前臂相對角度)
            limb(shoulder, -105, pose.get('wave_f', -55), 80, 72, True)
        lay = lay.resize((W // SS, H // SS), Image.LANCZOS)
        img.alpha_composite(lay, (int(x - lay.width / 2), int(feet_y - lay.height + 30 * s / SS)))
        return
    # 頭髮(頭頂幾撮尖角)
    top = hc[1] - hr
    tuft = [(hc[0] - 22 * s, top + 16 * s), (hc[0] - 10 * s, top - 26 * s), (hc[0] + 2 * s, top - 6 * s),
            (hc[0] + 20 * s, top - 52 * s), (hc[0] + 24 * s, top - 14 * s), (hc[0] + 50 * s, top - 30 * s),
            (hc[0] + 34 * s, top + 4 * s), (hc[0] + 40 * s, top + 22 * s)]
    d.polygon(tuft, fill=WHITE, outline=NAVY, width=int(lw * 0.75))
    d.ellipse([hc[0] - hr, hc[1] - hr, hc[0] + hr, hc[1] + hr], fill=WHITE, outline=NAVY, width=lw)
    # 頭部左下淡淡的陰影(設定圖上的月牙)
    d.chord([hc[0] - hr + lw, hc[1] - hr + lw, hc[0] + hr - lw, hc[1] + hr - lw], 110, 230, fill=(214, 224, 236, 255))
    d.ellipse([hc[0] - hr * 0.8, hc[1] - hr * 0.86, hc[0] + hr * 0.95, hc[1] + hr * 0.8], fill=WHITE)
    # 臉(朝右稍偏)
    ex = hc[0] + 16 * s; ey = hc[1] - 8 * s; er = 7 * s
    for dx in (-24 * s, 22 * s):
        d.ellipse([ex + dx - er, ey - er * 1.3, ex + dx + er, ey + er * 1.3], fill=NAVY)
    if pose.get('mouth') == 'open':
        d.ellipse([ex - 12 * s, hc[1] + 18 * s, ex + 12 * s, hc[1] + 38 * s], fill=NAVY)
    else:
        d.arc([ex - 22 * s, hc[1] + 4 * s, ex + 22 * s, hc[1] + 34 * s], 20, 160, fill=NAVY, width=int(lw * 0.7))
    lay = lay.resize((W // SS, H // SS), Image.LANCZOS)
    img.alpha_composite(lay, (int(x - lay.width / 2), int(feet_y - lay.height + 30 * s / SS)))
