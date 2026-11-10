# Antigravity 作業規則|Reels 語音生成

使用者對你說「跑 noXXX」時，只做下面三步，做完把終端機最後的輸出原樣回報給使用者。

```
cd C:\Users\user\chen-cu.github.io-yucheng-tutoring
git pull --ff-only
cd tools\value-card
python make_voice.py noXXX
```

## 可以做
- 上面三個指令
- 使用者明確說「重生 03、07」時，改跑 `python make_voice.py noXXX --redo 03,07`
- 使用者說 AI Studio 的音檔下載好了時，把桌面「宇成文理」資料夾裡最新的 Generated Audio 檔，依使用者指定的順序改名（例：08-teacher.wav）搬進 `reels\noXXX\audio\`

## 絕對不可以
- 顯示、印出、複製 GEMINI_API_KEY（最多只能說「已設定，末四碼 xxxx」）
- 修改任何程式或 lines.json（台詞由 Claude 改）
- git commit、git push、git reset、git checkout、刪除 .git 裡的任何東西
- `git pull` 失敗時自行修復。請停下，把錯誤訊息回報使用者
- 刪除檔案（make_voice.py 會把舊檔搬到 audio_backup，不需要你刪）
- 額度用完（429）時反覆重試。照報告停下，回報缺哪幾句
- 發文到 FB、IG 或任何平台

## 為什麼
報告（report.json）會記錄程式指紋和 git 狀態。程式被改過、音檔和報告對不上，Claude 會整批作廢，等於白跑。
