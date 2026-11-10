# No.003 火柴人版(小宇 × 宇誠老師)

動畫引擎改自 artemnovitckii/claude-animation-skills 的 /stick-figure(MIT,見 LICENSE-engine)。
畫面全部用程式畫(canvas),由 Playwright 逐格輸出。

1. 生語音(在有 GEMINI_API_KEY 的電腦):`python gemini_tts.py reels/no003/lines.json reels/no003/audio`
2. 對時:`python3 build_words.py ../lines.json ../audio`(沒音檔時用估計時間)
3. 出片:`node render.js video no003-silent.mp4`,再用 ffmpeg 把 audio/vo.wav 合進去

檔案:web/shots.js(分鏡)、web/classroom.js(教室與白板)、web/chars.js(角色,加了小宇頭髮、老師眼鏡領帶、指揮棒)、web/main.js(中文字幕)
