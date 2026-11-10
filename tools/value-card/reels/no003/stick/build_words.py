"""依台詞與音檔長度產生 web/words.js(字幕分段+每句起訖),並把音檔接成 audio/vo.wav。
沒有音檔時用每字 0.23 秒估算(先做畫面用)。
  python3 build_words.py lines.json [音檔資料夾]
"""
import sys, os, json, re, wave, subprocess
cfg = json.load(open(sys.argv[1], encoding='utf-8')); adir = sys.argv[2] if len(sys.argv) > 2 else None
GAP, LEAD = 0.28, 0.6
words, lines, t, parts = [], [], LEAD, []
for i, ln in enumerate(cfg['lines']):
    txt = ln['text']; n = len(re.sub(r'[，。！？、：；「」\s]', '', txt))
    wav = os.path.join(adir, ln['file']) if adir else None
    if wav and os.path.exists(wav):
        with wave.open(wav) as w: dur = w.getnframes() / w.getframerate()
        parts.append((t, wav))
    else:
        dur = 0.23 * n + 0.3
    lines.append({'s': round(t, 3), 'e': round(t + dur, 3), 'who': ln['who'], 'text': txt})
    # 字幕:在標點處切,每段最多 8 個字
    chunks = []
    for seg in re.split(r'(?<=[，。！？：；、])|(?<=……)', txt):
        seg = seg.strip()
        while len(seg) > 13: chunks.append(seg[:12]); seg = seg[12:]
        if seg: chunks.append(seg)
    tot = sum(len(c) for c in chunks); u = t
    for c in chunks:
        d = dur * len(c) / tot; words.append({'w': c, 's': round(u, 3), 'e': round(u + d, 3), 'line': i}); u += d
    t += dur + GAP
here = os.path.dirname(os.path.abspath(__file__))
open(os.path.join(here, 'web', 'words.js'), 'w', encoding='utf-8').write(
    'const WORDS=' + json.dumps(words, ensure_ascii=False) + ';\nconst LINES=' + json.dumps(lines, ensure_ascii=False) + ';\n')
if parts:   # 依時間點把各句混成一條旁白
    os.makedirs(os.path.join(here, 'audio'), exist_ok=True)
    cmd = ['ffmpeg', '-v', 'error', '-y']
    for _, w in parts: cmd += ['-i', w]
    fl = ''.join(f'[{k}]adelay={int(st*1000)}|{int(st*1000)}[a{k}];' for k, (st, _) in enumerate(parts))
    fl += ''.join(f'[a{k}]' for k in range(len(parts))) + f'amix=inputs={len(parts)}:normalize=0[o]'
    subprocess.run(cmd + ['-filter_complex', fl, '-map', '[o]', '-ar', '44100', os.path.join(here, 'audio', 'vo.wav')], check=True)
# 嘴型用:每格(1/30 秒)的人聲音量 0~1
import numpy as np
vo = os.path.join(here, 'audio', 'vo.wav')
if os.path.exists(vo):
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', vo, '-ac', '1', '-ar', '24000', '-f', 'f32le', '-'], capture_output=True).stdout
    a = np.frombuffer(raw, np.float32); n = len(a) // 800
    e = np.sqrt((a[:n * 800].reshape(n, 800) ** 2).mean(1))
    for l in lines:   # 每句各自正規化(兩個角色音量不同)
        i0, i1 = int(l['s'] * 30), min(int(l['e'] * 30) + 1, n); e[i0:i1] = e[i0:i1] / (np.percentile(e[i0:i1], 90) + 1e-9)
    e = np.clip(e, 0, 1)
    open(os.path.join(here, 'web', 'words.js'), 'a', encoding='utf-8').write('const ENV=' + json.dumps([round(float(x), 2) for x in e]) + ';\n')
print('lines', [(l['s'], l['e']) for l in lines], 'end', round(t, 2))
