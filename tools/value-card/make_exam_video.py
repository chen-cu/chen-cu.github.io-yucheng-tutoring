"""真題 Reels「這題錯在哪」手寫動畫(1080x1920,無聲,音樂請在 IG 加)

用法:
  python3 make_exam_video.py exam.json 輸出資料夾
exam.json:單題物件或陣列,格式見 Google 文件「宇誠 真題 Reels 規則（Gemini 用）」第五節。
有 narration(4 段:開場、錯誤、正解、判斷法)時自動配旁白,畫面等旁白念完才往下。
畫面順序:hook → 題目(整行掃出) → 選項(停頓) → 錯誤算法 + 紅 ✗ → 正解 → 圈正確選項 → 判斷法紅底線 → 署名
"""
import sys, os, json, random
import numpy as np
from PIL import Image, ImageDraw
from fontTools.ttLib import TTFont
import make_card as mc
import make_video as mv

W, H, FPS = mv.W, mv.H, mv.FPS
GAP, TOP = 82, 150
X0 = mc.X0


def rule_y(n): return TOP + GAP * n


# ---- 旁白(Piper 本機語音 zh_CN-chaowen-medium,溫和男聲) ----
VOICE_DIR = os.path.expanduser('~/.cache/yucheng-voice')
VOICE = os.path.join(VOICE_DIR, 'zh_CN-chaowen-medium.onnx')
KOKORO = os.path.join(VOICE_DIR, 'kokoro-multi-lang-v1_1')
KOKORO_URL = 'https://github.com/k2-fsa/sherpa-onnx/releases/download/tts-models/kokoro-multi-lang-v1_1.tar.bz2'
SPEAKER, SPEED = 58, 1.05          # 2026-11-01 使用者試聽 4 個男聲後選定(溫和、像國中數學老師)
_tts = None


def tts(text, out):
    """sherpa-onnx + Kokoro 多語模型:中文與英文字母(x、y、a、C、D)同一個男聲念。回傳秒數。"""
    global _tts
    import wave
    if _tts is None:
        if not os.path.exists(KOKORO):
            os.makedirs(VOICE_DIR, exist_ok=True)
            subprocess.run(f'curl -sSL {KOKORO_URL} | tar xj -C {VOICE_DIR}', shell=True, check=True)
        import sherpa_onnx as so
        D = KOKORO + '/'
        cfg = so.OfflineTtsConfig(model=so.OfflineTtsModelConfig(kokoro=so.OfflineTtsKokoroModelConfig(
            model=D + 'model.onnx', voices=D + 'voices.bin', tokens=D + 'tokens.txt', data_dir=D + 'espeak-ng-data',
            dict_dir=D + 'dict', lexicon=D + 'lexicon-us-en.txt,' + D + 'lexicon-zh.txt'), num_threads=4),
            rule_fsts=D + 'phone-zh.fst,' + D + 'date-zh.fst,' + D + 'number-zh.fst')
        _tts = so.OfflineTts(cfg)
    g = _tts.generate(text, sid=SPEAKER, speed=SPEED)
    a = np.array(g.samples, np.float32)
    pcm = (np.clip(a, -1, 1) * 32767).astype(np.int16)
    with wave.open(out, 'wb') as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(g.sample_rate); w.writeframes(pcm.tobytes())
    return len(pcm) / g.sample_rate


def paper(seed):
    rnd = np.random.default_rng(seed)
    a = np.ones((H, W, 3), np.float32) * np.array((249, 247, 241), np.float32)
    a += rnd.normal(0, 2.4, (H, W, 1))
    img = Image.fromarray(np.clip(a, 0, 255).astype(np.uint8)); d = ImageDraw.Draw(img)
    for y in range(TOP, H - 30, GAP):
        d.line([(0, y), (W, y)], fill=mc.RULE, width=2)
    d.line([(128, 0), (128, H)], fill=(228, 156, 150), width=2)
    return np.asarray(img).astype(np.float32)


def check(q):
    cmap = TTFont(mc.FONT).getBestCmap()
    texts = [q['hook'], q['series'], q['exam'], q['q_no'], q['rule']] + q['question'] + q['options'] \
        + q['steps'] + q['wrong']['steps']
    miss = {ch for s in texts for ch in s if ord(ch) not in cmap and ch != ' '}
    assert not miss, f'字型缺字:{miss}(減號請用半形 -)'
    assert not any('來' in s or '・' in s for s in texts), '不要用「來」「・」'
    d = ImageDraw.Draw(Image.new('RGB', (10, 10)))
    for s in q['question'] + q['steps'] + q['wrong']['steps'] + [q['rule']]:
        assert X0 + d.textlength(s, font=mc.hf(50)) < 1050, f'太長:{s}'


def build(q, tmp=None):
    nar = q.get('narration') if tmp else None
    cues = []

    def say(k, t):
        if not nar: return t
        wav = os.path.join(tmp, f'n{k}.wav'); d = tts(nar[k], wav); cues.append((t, wav)); return t + d

    seed = q.get('no', 1) * 7; rnd = random.Random(seed)
    ink = mv.Ink(); dm = ImageDraw.Draw(Image.new('RGB', (10, 10)))
    pos = lambda s, f: [X0 + dm.textlength(s[:k], font=f) for k in range(len(s))]

    def write(s, row, size, color, t, pc, g, x=X0):
        f = mc.hf(size)
        xs = [x + dm.textlength(s[:k], font=f) for k in range(len(s))]
        return mv.write_text(ink, s, xs, rule_y(row) - 12, f, color, t, rnd, pc, g, (0.004, 0.015))

    def wipe(s, row, size, color, t, x=X0, dur=0.35):
        """題目與選項:整行由左往右快速掃出(手寫留給錯誤算法與正解)"""
        f = mc.hf(size); lay = Image.new('RGBA', (W, H), (0, 0, 0, 0))
        ImageDraw.Draw(lay).text((x, rule_y(row) - 12), s, font=f, fill=color, anchor='ls')
        w = max(dm.textlength(s, font=f), 1)
        tp = np.tile(t + np.clip((np.arange(W, dtype=np.float32) - x) / w, 0, 1) * dur, (H, 1))
        ink.add(lay, tp)
        return t + dur

    t = 0.3
    e0 = say(0, t)
    t = write(q['hook'], 1, 66, mc.RED, t, 0.04, 0.05) + 0.25
    t = wipe(f"{q['series']} No.{q['no']:03d}  {q['exam']} {q['q_no']}", 2, 34, mc.GREY, t) + 0.3
    row = 3
    brace = []
    for s in q['question']:
        if s.startswith('{'):
            if not brace:          # 聯立方程式:先畫一個跨行的大括號
                n = sum(1 for z in q['question'] if z.startswith('{'))
                x, top, bot = X0 + 12, rule_y(row) - 66 - mv.OFF, rule_y(row + n - 1) + 4 - mv.OFF
                mid = (top + bot) / 2
                pts = [(x + 16, top), (x + 5, top + 12), (x + 5, mid - 12), (x - 7, mid), (x + 5, mid + 12),
                       (x + 5, bot - 12), (x + 16, bot)]
                t = mv.draw_path(ink, pts, mc.INK, 4, t, 0.3) + 0.05
            brace.append(row)
            t = wipe(s.lstrip('{ '), row, 50, mc.INK, t, X0 + 44) + 0.05
        else:
            t = wipe(s, row, 50, mc.INK, t) + 0.05
        row += 1
    # 選項:兩欄
    f50 = mc.hf(50); opt_xy = {}
    for i, s in enumerate(q['options']):
        r, x = row + i // 2, X0 + (i % 2) * 400
        opt_xy[s[1]] = (x, rule_y(r), x + dm.textlength(s, font=f50))
        t = wipe(s, r, 50, mc.INK, t, x, 0.25) + 0.05
    row += (len(q['options']) + 1) // 2
    t = max(t + 1.5, e0 + 0.6)                 # 讓觀眾想一下
    # 錯誤算法
    e1 = say(1, t)
    t = write('錯誤算法', row, 40, mc.RED, t, 0.02, 0.02) + 0.15; row += 1
    wr0 = row; wmax = 0
    for s in q['wrong']['steps']:
        t = write(s, row, 48, mc.GREY, t, 0.014, 0.01) + 0.05
        wmax = max(wmax, dm.textlength(s, font=mc.hf(48))); row += 1
    # 紅 ✗:錯誤算法右側 + 錯誤選項旁
    def cross(cx, cy, r, t, sd):
        t = mv.draw_path(ink, mv.wobble_pts((cx - r, cy - r - mv.OFF), (cx + r, cy + r - mv.OFF), 1.5, sd), mc.RED, 6, t, 0.18) + 0.05
        return mv.draw_path(ink, mv.wobble_pts((cx + r, cy - r - mv.OFF), (cx - r, cy + r - mv.OFF), 1.5, sd + 1), mc.RED, 6, t, 0.18)
    cy = (rule_y(wr0) + rule_y(row - 1)) / 2 - 30
    t = cross(min(X0 + wmax + 70, 1000), cy, 40, t + 0.1, seed + 1) + 0.15
    wo = q['wrong']['option']
    if wo in opt_xy:
        x0, y, x1 = opt_xy[wo]
        t = cross(x1 + 40, y - 30, 22, t, seed + 3) + 0.5
    t = max(t, e1 + 0.3)
    # 正解
    e2 = say(2, t)
    t = write('正解', row, 40, mc.RED, t, 0.02, 0.02) + 0.15; row += 1
    for s in q['steps']:
        t = write(s, row, 48, mc.INK, t, 0.016, 0.01) + 0.08; row += 1
    a = q['answer']
    if a in opt_xy:
        x0, y, x1 = opt_xy[a]
        t = mv.draw_path(ink, mv.ellipse_pts((x0 - 16, y - 72 - mv.OFF, x1 + 14, y + 6 - mv.OFF), seed + 5), mc.RED, 5, t + 0.1, 0.6) + 0.4
    t = max(t, e2 + 0.3)
    # 判斷法 + 紅底線
    e3 = say(3, t)
    t = write(q['rule'], row, 50, mc.INK, t, 0.02, 0.02) + 0.15
    y = rule_y(row) - mv.OFF; x1 = X0 + dm.textlength(q['rule'], font=f50)
    t = mv.draw_path(ink, mv.wobble_pts((X0 - 4, y + 2), (x1 + 6, y - 1), 2.2, seed + 7), mc.RED, 5, t, 0.4) + 0.3
    t = max(t, e3 + 0.3)
    return ink, t, cues


def signature():
    lay = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    logo = Image.open(os.path.join(mc.HERE, 'logo.png')).convert('RGBA').resize((96, 96), Image.LANCZOS)
    m = Image.new('L', (96, 96), 0); ImageDraw.Draw(m).ellipse([0, 0, 95, 95], fill=255); logo.putalpha(m)
    lx, ly = W - 160, H - 140
    lay.alpha_composite(logo, (lx, ly)); d = ImageDraw.Draw(lay)
    d.text((lx - 20, ly + 42), '宇誠文理家教團', font=mc.hf(40), fill=mc.NAVY, anchor='rs')
    d.text((lx - 20, ly + 86), '孩子的專屬家教團隊', font=mc.hf(30), fill=mc.NAVY, anchor='rs')
    arr = np.asarray(lay).astype(np.float32)
    return arr[..., :3], arr[..., 3] / 255


def render(q, out, hold=3.0, still=None):
    check(q)
    import tempfile
    tmp = None if still else tempfile.mkdtemp()
    bg = paper(q.get('no', 1)); ink, t_end, cues = build(q, tmp)
    silent = out.rsplit('.', 1)[0] + '-silent.mp4' if cues else out
    sig_rgb, sig_a = signature()
    total = t_end + 0.6 + hold
    frames = [int(total * FPS) - 1] if still else range(int(total * FPS))
    p = None if still else subprocess.Popen(
        ['ffmpeg', '-loglevel', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', f'{W}x{H}', '-r', str(FPS),
         '-i', '-', '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '18', '-preset', 'veryfast',
         '-movflags', '+faststart', silent], stdin=subprocess.PIPE)
    for fi in frames:
        now = fi / FPS; frame = bg.copy()
        for y0, x0, rgb, a, tp in ink.items:
            vis = a * np.clip((now - tp) * 25 + 1, 0, 1)
            h, w = a.shape; reg = frame[y0:y0 + h, x0:x0 + w]
            reg[:] = reg * (1 - vis[..., None]) + rgb * vis[..., None]
        k = np.clip((now - t_end) / 0.6, 0, 1)
        if k > 0:
            av = sig_a * k; frame = frame * (1 - av[..., None]) + sig_rgb * av[..., None]
        img = np.clip(frame, 0, 255).astype(np.uint8)
        if still: Image.fromarray(img).save(still)
        else: p.stdin.write(img.tobytes())
    if p: p.stdin.close(); p.wait()
    if cues:   # 旁白依時間點混進影片(鋼琴請在 IG/剪映另外加,音量建議壓低)
        cmd = ['ffmpeg', '-loglevel', 'error', '-y', '-i', silent]
        for _, w in cues: cmd += ['-i', w]
        fl = ''.join(f'[{i+1}]adelay={int(st*1000)}|{int(st*1000)}[a{i}];' for i, (st, _) in enumerate(cues))
        fl += ''.join(f'[a{i}]' for i in range(len(cues))) + f'amix=inputs={len(cues)}:normalize=0,apad[out]'
        cmd += ['-filter_complex', fl, '-map', '0:v', '-map', '[out]', '-c:v', 'copy', '-c:a', 'aac', '-b:a', '160k',
                '-shortest', out]
        subprocess.run(cmd, check=True); os.remove(silent)
    return total


import subprocess
if __name__ == '__main__':
    data = json.load(open(sys.argv[1], encoding='utf-8'))
    outdir = sys.argv[2] if len(sys.argv) > 2 else '.'
    still = '--still' in sys.argv
    for q in (data if isinstance(data, list) else [data]):
        out = os.path.join(outdir, q['file'])
        r = render(q, out, still=out.rsplit('.', 1)[0] + '-last.png' if still else None)
        print('ok', out, f'{r:.1f}s')
