"""Claude 端語音審核:用 faster-whisper 逐句聽,跟 lines.json 比對(不在使用者電腦跑)

  python3 check_voice.py lines.json audio資料夾 [report.json]

輸出每句的辨識文字與相似度;< 0.85 標 ⚠️。數字(六、56)統一轉阿拉伯數字再比。
若給 report.json,另核對:音檔指紋是否和報告一致、程式版本、git 是否被改過。
"""
import sys, os, json, re, glob, hashlib, subprocess, difflib
import numpy as np

CN = {'零': 0, '一': 1, '二': 2, '兩': 2, '三': 3, '四': 4, '五': 5, '六': 6, '七': 7, '八': 8, '九': 9}


def cn2num(s):
    def rep(m):
        t = m.group(0)
        if '十' in t:
            a, _, b = t.partition('十')
            return str((CN.get(a, 1) if a else 1) * 10 + (CN.get(b, 0) if b else 0))
        return ''.join(str(CN[c]) for c in t)
    return re.sub(r'[零一二兩三四五六七八九十]+', rep, s)


def norm(s):
    s = re.sub(r'[，。！？、：；「」…\s,.!?"\'()（）]', '', s)
    return cn2num(s.replace('他們', '它們').replace('她們', '它們'))


def main():
    cfg = json.load(open(sys.argv[1], encoding='utf-8')); adir = sys.argv[2]
    rep = json.load(open(sys.argv[3], encoding='utf-8')) if len(sys.argv) > 3 else None
    from faster_whisper import WhisperModel
    m = WhisperModel('small', device='cpu', compute_type='int8')
    bad = 0
    for ln in cfg['lines']:
        p = os.path.join(adir, ln['file'])
        if not os.path.exists(p): print('缺檔', ln['file']); bad += 1; continue
        a = np.frombuffer(subprocess.run(['ffmpeg', '-v', 'error', '-i', p, '-ac', '1', '-ar', '16000', '-f', 'f32le', '-'], capture_output=True).stdout, np.float32)
        seg, _ = m.transcribe(a, language='zh', initial_prompt='以下是繁體中文的句子。')
        heard = ''.join(s.text for s in seg)
        r = difflib.SequenceMatcher(None, norm(ln['text']), norm(heard)).ratio()
        mark = '✅' if r >= .85 else '⚠️'; bad += r < .85
        extra = ''
        if rep:
            e = next((x for x in rep['lines'] if x['file'] == ln['file']), None)
            if e and e.get('sha') and e['sha'] != hashlib.sha256(open(p, 'rb').read()).hexdigest()[:16]: extra = ' 指紋不符'; bad += 1
        print(f"{mark} {ln['file']} {r:.2f}  台詞:{ln['text']}  聽到:{heard}{extra}")
    if rep:
        print('git_dirty', rep.get('git_dirty'), 'tool_sha', rep.get('tool_sha'), 'stopped', rep.get('stopped'))
    print('需處理' if bad else '全部通過', bad)


if __name__ == '__main__':
    main()
