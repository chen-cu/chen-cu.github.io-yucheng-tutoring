"""Gemini 語音(和 Flow 角色頁、AI Studio 同一套聲音)

需要環境變數 GEMINI_API_KEY(在 aistudio.google.com 申請;只存在自己電腦,不要寫進程式或上傳)。
可選:GEMINI_TTS_MODEL 指定模型名稱(預設依序嘗試下方 MODELS)。

單獨使用(批次生成台詞音檔,不用到 AI Studio 一段段下載):
  python3 gemini_tts.py lines.json 輸出資料夾 [--redo]   (已存在的音檔預設跳過)
lines.json:
  {"voices": {"小宇": {"voice": "Leda", "style": "13 歲台灣小男孩……"},
              "老師": {"voice": "Charon", "style": "溫和的國中自然老師……"}},
   "lines": [{"who": "小宇", "text": "咦？鐵做的船怎麼浮起來了？", "file": "s2-xiaoyu.wav"}]}
"""
import os, sys, json, base64, wave, time, urllib.request, urllib.error

MODELS = [m for m in [os.environ.get('GEMINI_TTS_MODEL')] if m] + [
    'gemini-3.1-flash-tts-preview',       # 2026-11 現行模型,未綁帳單的專案有免費額度
    'gemini-2.5-flash-preview-tts', 'gemini-2.5-pro-preview-tts']
URL = 'https://generativelanguage.googleapis.com/v1beta/models/{m}:generateContent'
SR = 24000   # 回傳格式:16-bit PCM、單聲道、24 kHz

TW = '台灣國語口音，不要捲舌、不要兒化音。'


def say(text, voice='Leda', style='', out=None):
    """回傳 PCM bytes;給 out 就另存成 wav。style 是語氣指示(例:13 歲台灣小男孩、語氣好奇)"""
    key = os.environ.get('GEMINI_API_KEY')
    assert key, '請先設定環境變數 GEMINI_API_KEY'
    prompt = f'用以下語氣念出引號內的文字，只念引號內的字，不要加字：{style}{TW}\n「{text}」'
    body = json.dumps({
        'contents': [{'parts': [{'text': prompt}]}],
        'generationConfig': {'responseModalities': ['AUDIO'],
                             'speechConfig': {'voiceConfig': {'prebuiltVoiceConfig': {'voiceName': voice}}}},
    }).encode()
    last = None
    for m in MODELS:
        for attempt in range(4):
            req = urllib.request.Request(URL.format(m=m), body, {
                'Content-Type': 'application/json', 'x-goog-api-key': key})
            try:
                r = json.load(urllib.request.urlopen(req, timeout=120))
                pcm = base64.b64decode(r['candidates'][0]['content']['parts'][0]['inlineData']['data'])
                if out:
                    with wave.open(out, 'wb') as w:
                        w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes(pcm)
                return pcm
            except urllib.error.HTTPError as e:
                last = f'{m}: HTTP {e.code} {e.read()[:300]!r}'
                if e.code == 404: break          # 模型名稱不存在 → 換下一個
                time.sleep(3 * (attempt + 1))    # 429 額度/500 暫時錯誤 → 等一下再試
            except (KeyError, IndexError) as e:
                last = f'{m}: 回傳格式不符 {e}'; time.sleep(2)
    raise RuntimeError(f'Gemini 語音生成失敗:{last}')


if __name__ == '__main__':
    cfg = json.load(open(sys.argv[1], encoding='utf-8'))
    outdir = sys.argv[2] if len(sys.argv) > 2 else '.'
    os.makedirs(outdir, exist_ok=True)
    for ln in cfg['lines']:
        v = cfg['voices'][ln['who']]
        p = os.path.join(outdir, ln['file'])
        if os.path.exists(p) and '--redo' not in sys.argv:     # 已生成的跳過,省額度;要重生加 --redo
            print('skip', p); continue
        pcm = say(ln['text'], v['voice'], v.get('style', ''), p)
        print('ok', p, f'{len(pcm) / 2 / SR:.1f}s')
