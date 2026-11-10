"""Reels 語音一鍵生成(給 Antigravity 在使用者電腦上跑)

  python make_voice.py no004            依 reels/no004/lines.json 生成缺少或台詞已改的句子
  python make_voice.py no004 --max 6    本次最多呼叫幾次語音 API(預設 12,防止燒光額度)
  python make_voice.py no004 --redo 03,07   指定句子重生(舊檔搬到 audio_backup/)

規則:
- 金鑰只從環境變數 GEMINI_API_KEY 讀,任何輸出都不顯示金鑰
- 只寫 reels/<集數>/audio、audio_backup、report.json;不刪檔,舊檔一律搬到 audio_backup/<時間>/
- 台詞改過的句子(和 audio/manifest.json 記錄的文字不同)自動重生
- 額度用完(HTTP 429)立刻停止,報告列出還缺哪幾句
- 結束時寫 report.json,交給 Claude 審核(語音辨識檢查由 Claude 在雲端做)
"""
import os, sys, json, wave, shutil, hashlib, subprocess, datetime, argparse
import numpy as np

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import gemini_tts  # noqa: E402

PUNC = set('，。！？、：；「」…　 ,.!?')


def sha(path):
    return hashlib.sha256(open(path, 'rb').read()).hexdigest()[:16]


def git(*args):
    try:
        return subprocess.run(['git', *args], cwd=HERE, capture_output=True, text=True, timeout=20).stdout.strip()
    except Exception:
        return ''


def measure(path, text):
    with wave.open(path) as w:
        sr = w.getframerate(); a = np.frombuffer(w.readframes(w.getnframes()), np.int16).astype(np.float32) / 32768
    dur = len(a) / sr
    peak = 20 * np.log10(np.abs(a).max() + 1e-9)
    win = int(sr * .02); n = len(a) // win
    db = 20 * np.log10(np.sqrt((a[:n * win].reshape(n, win) ** 2).mean(1)) + 1e-9)
    voiced = (db > -40).sum() * .02
    chars = len([c for c in text if c not in PUNC])
    cps = chars / max(voiced, .1)
    flags = []
    if peak > -0.3: flags.append('音量爆掉')
    if peak < -20: flags.append('音量太小')
    if cps > 7.5: flags.append('語速太快,可能吃字')
    if cps < 2.5: flags.append('語速太慢或有長空白')
    return {'dur': round(dur, 2), 'peak_db': round(float(peak), 1), 'chars_per_sec': round(cps, 2), 'flags': flags}


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('ep'); ap.add_argument('--max', type=int, default=12); ap.add_argument('--redo', default='')
    o = ap.parse_args()
    if not os.environ.get('GEMINI_API_KEY'):
        print('找不到環境變數 GEMINI_API_KEY,停止。'); sys.exit(1)
    ep = os.path.join(HERE, 'reels', o.ep)
    cfg = json.load(open(os.path.join(ep, 'lines.json'), encoding='utf-8'))
    adir = os.path.join(ep, 'audio'); os.makedirs(adir, exist_ok=True)
    mpath = os.path.join(adir, 'manifest.json')
    man = json.load(open(mpath, encoding='utf-8')) if os.path.exists(mpath) else {}
    stamp = datetime.datetime.now().strftime('%Y%m%d-%H%M%S')
    bdir = os.path.join(ep, 'audio_backup', stamp)
    redo = {r.strip() for r in o.redo.split(',') if r.strip()}

    def backup(fn):
        os.makedirs(bdir, exist_ok=True); shutil.move(os.path.join(adir, fn), os.path.join(bdir, fn))

    calls, stopped, lines = 0, None, []
    for ln in cfg['lines']:
        fn, text = ln['file'], ln['text']; p = os.path.join(adir, fn)
        tag = fn.split('-')[0]
        if os.path.exists(p) and (tag in redo or man.get(fn, {}).get('text') not in (None, text)):
            backup(fn)  # 指定重生或台詞改過:舊檔搬走
        status = 'kept'
        if not os.path.exists(p):
            if stopped or calls >= o.max:
                stopped = stopped or f'達到本次上限 {o.max} 次'; lines.append({'file': fn, 'text': text, 'status': 'pending'}); continue
            v = cfg['voices'][ln['who']]
            try:
                calls += 1; gemini_tts.say(text, v['voice'], v.get('style', '') + ln.get('style', ''), p)
                status = 'new'; man[fn] = {'text': text, 'voice': v['voice'], 'at': stamp}
            except RuntimeError as e:
                msg = str(e); stopped = '額度用完(429)' if '429' in msg else '語音 API 錯誤'
                lines.append({'file': fn, 'text': text, 'status': 'pending', 'error': msg[:120]}); continue
        elif fn not in man:
            man[fn] = {'text': text, 'voice': cfg['voices'][ln['who']]['voice'], 'at': 'unknown'}
        lines.append({'file': fn, 'text': text, 'status': status, 'sha': sha(p), **measure(p, text)})
        print(f"{status:5} {fn}  {lines[-1]['dur']}s  {' '.join(lines[-1]['flags'])}")

    json.dump(man, open(mpath, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
    rep = {
        'episode': o.ep, 'at': stamp, 'api_calls': calls, 'stopped': stopped,
        'git_head': git('rev-parse', '--short', 'HEAD'),
        'git_dirty': bool(git('status', '--porcelain', '--untracked-files=no', '--', '.')),
        'tool_sha': {f: sha(os.path.join(HERE, f)) for f in ('make_voice.py', 'gemini_tts.py')},
        'lines': lines,
    }
    json.dump(rep, open(os.path.join(ep, 'report.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
    pend = [l['file'] for l in lines if l['status'] == 'pending']
    print(f"\n完成:呼叫 {calls} 次;{'尚缺 ' + ', '.join(pend) + '(' + stopped + ')' if pend else '全部到齊'}")
    if rep['git_dirty']: print('注意:tools/value-card 有未提交的修改,Claude 會作廢這批結果。請不要改程式。')
    print('請回 Claude:「好了」')


if __name__ == '__main__':
    main()
