"""依分鏡時間點排音效(音效來自 earshot 音效庫 sfxbank/*.wav,MIT),輸出 audio/sfx.wav
  python3 sfx.py 片長秒數
"""
import json, re, sys, subprocess, wave, numpy as np
SR = 44100
s = open('web/words.js', encoding='utf-8').read()
L = json.loads(re.search(r'const LINES=(.*?);\n', s).group(1))
P = re.compile(r'[，。！？、：；「」…\s]'); cnt = lambda x: len([c for c in x if not P.match(c)])
def tAt(i, sub):
    t = L[i]['text']; k = t.find(sub); return L[i]['s'] + (L[i]['e'] - L[i]['s']) * cnt(t[:k]) / cnt(t)
Ls = lambda i: L[i]['s']; Le = lambda i: L[i]['e']
def ld(name, gain=1.0):
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', f'sfxbank/{name}.wav', '-ac', '1', '-ar', str(SR), '-f', 'f32le', '-'], capture_output=True).stdout
    a = np.frombuffer(raw, np.float32).copy(); return a / (np.abs(a).max() + 1e-9) * gain
def sad():   # 悲傷喇叭(笑點用,自製)
    out = []
    for f, d in [(392, .42), (370, .42), (349, .42), (330, 1.1)]:
        t = np.arange(int(SR * d)) / SR; vib = 1 + (.02 * np.sin(2 * np.pi * 6 * t) if d > 1 else 0); ph = np.cumsum(f * vib) / SR * 2 * np.pi
        y = sum(np.sin(k * ph) / k for k in range(1, 7)); e = np.minimum(1, t / .03) * np.minimum(1, (d - t) / .08); out.append(.16 * y * e)
    return np.concatenate(out)
pop, pop2, ding, ding2, whoosh, swish, tap, bounce, thud, coin, fall, rumble, zipu = [ld(n, g) for n, g in
    [('pop', .5), ('pop2', .45), ('ding', .4), ('ding2', .4), ('whoosh', .35), ('swish', .3), ('tap', .4), ('bounce', .35), ('thud', .7), ('coin', .35), ('fall', .4), ('rumble', .5), ('zip', .3)]]
ev = [(.05, swish), (tAt(0, '送分題'), pop), (tAt(0, '六分之一'), pop), (tAt(0, '收工'), ding2)]
ev += [(Ls(1) - .12, whoosh), (tAt(1, '第三行'), swish)]
ev += [(Ls(2) - .15, whoosh), (tAt(2, '然後呢'), zipu)]
ev += [(Ls(3) - .15, whoosh)]
dt = (Le(3) - Ls(3) - .2) / 9
for j, ch in enumerate('WRWWRWRWR'):
    st = Ls(3) - .08 + .25 + j * dt
    ev.append((st, bounce * .7 if ch == 'W' else pop2)); 
    if ch == 'R': ev.append((st + dt * .95, tap))
ev += [(Ls(4), zipu), (Ls(4) + .02, pop2)]
tz = tAt(5, '零用錢'); ev += [(tz, coin), (tz + .1, coin * .7), (tz + .35, thud), (tz + .38, rumble)]
ev += [(Ls(6) - .15, whoosh), (tAt(6, '六顆'), pop), (tAt(6, '五十六'), pop), (tAt(6, '五十六') + .04, ding)]
t3 = tAt(7, '二十八分之三'); ev += [(t3, pop), (t3 + .04, ding2), (t3 + .9, swish)]
ev += [(Ls(8) - .15, whoosh), (Ls(8) + .1, sad()), (tAt(8, '跟零用錢'), fall)]
ev += [(tAt(9, '留言'), pop), (Le(9) + .1, zipu), (Le(9) + .45, ding)]
dur = float(sys.argv[1]); out = np.zeros(int(SR * dur) + SR * 6)
for st, x in ev:
    i = max(int(st * SR), 0); out[i:i + len(x)] += x
out = np.clip(out * .8, -1, 1)[:int(SR * dur)]
w = wave.open('audio/sfx.wav', 'wb'); w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes((out * 32767).astype(np.int16).tobytes())
print('events', len(ev))
