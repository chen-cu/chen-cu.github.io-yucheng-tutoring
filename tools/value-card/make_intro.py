"""Reels 開頭品牌小動畫(約 2.2 秒,1080x1920,無聲)

  python3 make_intro.py 輸出.mp4

風格參考 IG easyenglishclass_1:純白底、上方彩色手寫關鍵字、黑色手寫句子、紅色手繪箭頭、下半部火柴人,沒有格線和框。
畫面:「宇誠」(紅)「文理」(深藍)兩個字彈出 → 小宇從左邊跑進來、停下揮手 → 紅箭頭畫下指向小宇 → 手寫標語浮現
小宇由 stick.py 程式繪製(頭部用 xiaoyu_head.png)。
"""
import sys, subprocess, math
import numpy as np
from PIL import Image, ImageDraw
import make_card as mc
import stick

W, H, FPS, DUR = 1080, 1920, 30, 2.2
RED, NAVY, BLACK = (206, 38, 38, 255), (24, 70, 150, 255), (25, 25, 25, 255)
ez = lambda k: k * k * (3 - 2 * k)
back = lambda k: 1 + 2.7 * (k - 1) ** 3 + 1.7 * (k - 1) ** 2
cl = lambda v: min(max(v, 0.0), 1.0)


def word(text, size, color):
    f = mc.hf(size); d = ImageDraw.Draw(Image.new('L', (1, 1)))
    w = int(d.textlength(text, font=f)) + 40
    im = Image.new('RGBA', (w, int(size * 1.5)), (0, 0, 0, 0))
    ImageDraw.Draw(im).text((w / 2, size * 1.05), text, font=f, fill=color, anchor='ms')
    return im


def put(fr, im, cx, cy, s=1.0, rot=0.0, alpha=1.0):
    if s <= 0.01 or alpha <= 0: return
    im = im.resize((max(int(im.width * s), 1), max(int(im.height * s), 1)), Image.LANCZOS)
    if rot: im = im.rotate(rot, resample=Image.BICUBIC, expand=True)
    if alpha < 1: im.putalpha(im.split()[3].point(lambda v: int(v * alpha)))
    fr.alpha_composite(im, (int(cx - im.width / 2), int(cy - im.height / 2)))


def main(out):
    bg = Image.new('RGBA', (W, H), (255, 255, 255, 255))
    w1, w2 = word('宇誠', 190, RED), word('文理', 190, NAVY)
    slogan = word('孩子的專屬家教團隊', 70, BLACK)
    p = subprocess.Popen(['ffmpeg', '-loglevel', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', f'{W}x{H}',
                          '-r', str(FPS), '-i', '-', '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '18',
                          '-preset', 'veryfast', '-movflags', '+faststart', out], stdin=subprocess.PIPE)
    feet, x_end, h = 1450, W // 2, 560
    for fi in range(int(DUR * FPS)):
        t = fi / FPS; fr = bg.copy()
        # 1. 兩個關鍵字依序彈出(稍微歪一點,像手寫貼上去)
        for i, (im, x, t0, rot) in enumerate([(w1, 370, 0.0, 4), (w2, 710, 0.15, -3)]):
            k = cl((t - t0) / 0.4)
            if k > 0: put(fr, im, x, 330, back(k), rot * (1 - k) + rot * 0.4)
        # 2. 小宇從左邊跑進來 0.3~1.05s,停下後揮手
        k = cl((t - 0.3) / 0.75)
        if k > 0:
            x = -160 + (x_end + 160) * (1 - (1 - k) ** 2)
            pose = stick.mix(stick.run_pose(t * 2 * math.pi * 2.6), stick.STAND, ez(cl((k - 0.75) / 0.25)))
            if t > 1.15:
                pose = dict(pose, wave=True, wave_f=-42 + 16 * math.sin((t - 1.15) * 14), mouth='open')
            stick.draw_xiaoyu(fr, x, feet, h, pose)
        # 3. 紅色手繪箭頭從標語下方畫向小宇 0.95~1.3s
        k = ez(cl((t - 0.95) / 0.35))
        if k > 0:
            d = ImageDraw.Draw(fr); x0, y0, y1 = x_end, 640, 800
            pts = [(x0 + 6 * math.sin(i / 6), y0 + (y1 - y0) * i / 30) for i in range(int(31 * k))]
            if len(pts) > 1: d.line(pts, fill=RED, width=10, joint='curve')
            if k >= 1:
                d.line([(x0 - 34, y1 - 40), (x0, y1), (x0 + 34, y1 - 40)], fill=RED, width=10, joint='curve')
        # 4. 手寫標語淡入 0.55~0.95s
        k = ez(cl((t - 0.55) / 0.4))
        if k > 0: put(fr, slogan, W // 2, 540 + (1 - k) * 20, 1.0, 0, k)
        p.stdin.write(np.asarray(fr.convert('RGB')).tobytes())
    p.stdin.close(); p.wait()


if __name__ == '__main__':
    main(sys.argv[1] if len(sys.argv) > 1 else 'intro.mp4')
