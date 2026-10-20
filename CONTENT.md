# 內容維護說明(CONTENT.md)

本網站為單頁式招生網站,共 3 個主要檔案:

| 檔案 | 內容 |
|------|------|
| `index.html` | 全部頁面文字(區塊 1–8)與版面結構 |
| `css/style.css` | 全站樣式(配色、字體、排版) |
| `js/main.js` | 手機浮動按鈕的自動隱藏行為 |

---

## 一、每個區塊的文字位置

所有區塊都在 `index.html`,由上而下依序排列,每個區塊前有 `<!-- 區塊 N -->` 註解可供搜尋:

| 區塊 | 位置(搜尋關鍵字) | 說明 |
|------|--------------------|------|
| 區塊 1|首屏 Hero | `<!-- ============ 區塊 1` | 主標題在 `<h1 class="hero-title">`,副標題在 `.hero-sub`,信任標語在 `.trust-badge`,按鈕小字在 `.cta-note` |
| 區塊 2|痛點共鳴 | `<!-- ============ 區塊 2` | 三個情境各為一個 `<div class="pain-item">`,收尾句在 `.section-closing` |
| 區塊 3|四大核心優勢 | `<!-- ============ 區塊 3` | 四項優勢各為一個 `<div class="advantage-item">` |
| 區塊 4|課程規劃 | `<!-- ============ 區塊 4` | 國中/高中分班在兩個 `<div class="course-col">`,收費方式在 `.pricing-list`,英語口說・發音課程在 `.course-desc`(見下方說明) |
| 區塊 5|師資陣容 | `<!-- ============ 區塊 5` | 每位老師為一個 `<article class="teacher-card">`,直接在 HTML 中新增或修改(見下方說明) |
| 區塊 6|試教流程 | `<!-- ============ 區塊 6` | 四步驟各為一個 `<li class="step-item">` |
| 區塊 7|常見問題 | `<!-- ============ 區塊 7` | 每題為一個 `<details class="faq-item">`(見下方說明) |
| 區塊 8|最終 CTA | `<!-- ============ 區塊 8` | 主文案、副文案、Google 表單 iframe;頁尾文字在 `<footer class="site-footer">` |

**Google 表單網址**(`https://docs.google.com/forms/d/e/1FAIpQLSfV0DgDnflbURkFvsO0v_cIA_NW4LYOoRU7bpcnkXyn4XZO6g/viewform?usp=pp_url&entry.1670616827=%E5%AE%98%E6%96%B9%E7%B6%B2%E7%AB%99`)出現在以下位置,更換時請全域搜尋取代:
- 頁首按鈕、Hero 區次按鈕、區塊 4 按鈕、區塊 8 iframe 與次按鈕、手機底部浮動按鈕列「預約試教」

**LINE 加好友連結**(`https://lin.ee/oPeCDkw`)出現在以下位置,更換時同樣全域搜尋取代:
- Hero 區主按鈕「加 LINE 免費諮詢」、區塊 8 主按鈕「加 LINE 免費諮詢」、手機底部浮動按鈕列「加 LINE 諮詢」、頁尾「加好友」連結

> 表單嵌入備註:目前 iframe 使用完整 docs.google.com 網址(含 `entry.` 預填參數)。iframe 高度可在 `css/style.css` 的 `.form-embed iframe { height: 1150px; }` 調整。若日後更換表單,請在 `index.html` 全域搜尋取代整條連結(含 `?usp=…&entry.…` 參數)。

---

## 二、如何新增一位老師

打開 `index.html`,搜尋 `區塊 5`,找到 `<div class="teacher-grid">` 內的老師卡片。每位老師是一個 `<article>` 區塊:

```html
<article class="teacher-card">
  <h3 class="teacher-name">Andy 老師</h3>
  <span class="teacher-subject">數學・社會科</span>
  <p class="teacher-bio">介紹文字寫在這裡。</p>
</article>
```

**新增步驟:**

1. 複製上方任一個 `<article class="teacher-card">…</article>` 區塊。
2. 貼在最後一張卡片的 `</article>` 之後(仍在 `<div class="teacher-grid">` 裡面)。
3. 修改 `teacher-name`(姓名)、`teacher-subject`(科目)、`teacher-bio`(介紹)三處文字。
4. 存檔並推送,卡片就會出現在師資區,無須改動 CSS 或 JS。

刪除或調整老師順序,同樣直接在 HTML 中操作即可。

---

## 二之二、英語口說・發音課程（區塊 4）

此課程項目位於區塊 4「課程規劃」內,在「收費方式」之後、section CTA 之前。結構如下:

```html
<h3 class="subsection-title">英語口說・發音課程</h3>
<p class="course-subtitle">線上一對一 ｜ 國小・國中</p>
<div class="course-desc">
  <p>課程介紹段落……</p>
</div>
<div class="btn-group course-cta-buttons">
  <a class="btn btn-primary" href="LINE 連結">加 LINE 免費諮詢</a>
  <a class="btn btn-outline" href="表單連結">免費預約試教</a>
</div>
```

- **修改課程介紹**:編輯 `.course-desc` 內各 `<p>` 段落的文字。
- **修改副標**:編輯 `.course-subtitle` 的文字（如調整適用年級）。
- **刪除此課程**:刪除從 `<h3 class="subsection-title">英語口說・發音課程</h3>` 到 `</div><!-- course-cta-buttons -->` 之間的所有內容。
- **新增類似的獨立課程**:複製上方整組結構（`<h3>` + `.course-subtitle` + `.course-desc` + `.btn-group`），貼在收費方式區塊之後,修改標題、副標與內容即可。

---

## 三、如何修改 FAQ（區塊 7）

FAQ 在 `index.html` 的區塊 7,每一題是一個 `<details>` 元素:

```html
<details class="faq-item">
  <summary>Q1:費用怎麼計算?</summary>
  <div class="faq-answer"><p>答案文字寫在這裡。</p></div>
</details>
```

- **修改問題**:改 `<summary>` 內的文字。
- **修改答案**:改 `.faq-answer` 內 `<p>` 的文字;答案若有多段,可放多個 `<p>`。
- **新增一題**:複製整個 `<details class="faq-item">…</details>` 區塊,貼在最後一題之後,再修改文字。題號(Q1、Q2……)需手動調整。
- **刪除一題**:刪除該題整個 `<details>` 區塊即可。

手風琴的展開/收合為瀏覽器原生行為(`<details>` 標籤),不需要 JavaScript,新增題目不會壞。

---

## 四、常用樣式調整(css/style.css)

- **配色**:檔案最上方 `:root` 內的 CSS 變數。主色 `--ink`(深墨藍)、底色 `--paper`(米白)、點綴色 `--accent`(深金)。
- **手機底部浮動按鈕列**:`.mobile-cta-bar` 區段;僅在寬度 767px 以下顯示,固定於底部,「加 LINE 諮詢」+「預約試教」並列。捲動到表單區塊時會自動滑出隱藏(由 `js/main.js` 控制)。
- **信任標語(先上課,後收費)**:`.trust-badge`,細金框標籤樣式。

---

## 服務概況(區塊 3 下方)

位置:`index.html` 搜尋 `class="record"`。三項各為一個 `<div class="record-item">`,桌機三欄、手機單欄。

目前放的是**服務範圍事實**,不是業績數字:授課師資人數、上課方式、授課科目。

**對外文案規則(重要):**

- **不寫成績進步幅度**(例:「數學從 58 到 76」)。成績登記表屬內部追蹤用途,不對外publish。
- **不寫續課相關說法**(例:「續課率 100%」)。依規則文件 v2.4,學生母數小,百分比易被視為誇大。
- 新增老師時,記得同步更新「授課師資」的人數。

教學實績類的數字(累計時數等)目前已移除。若日後要放回,數字取自記帳表「業務成長」分頁的「宣傳可用數字」,只寫實際紀錄、不往上四捨五入,並採門檻寫法(例:300 小時以上)以免每月維護。

---

## 學習諮詢(區塊 4.5)

位置:`index.html` 搜尋 `class="consult-card"`,位於課程規劃與師資陣容之間。

這是 Mike 的角色說明,**不是授課老師**。內容寫的是實際負責的工作(諮詢、媒合老師、整理聯絡簿與學習總結),不寫教學資歷。

- 修改內文:改 `.consult-body` 內的段落
- 角色標籤在 `.consult-role`,與師資卡片的科目標籤樣式相同但意義不同
- 卡片有金色頂邊(`border-top: 2px solid var(--accent)`),用來與一般師資卡片區隔
- **Mike 不列入「授課師資」人數**。新增或移除授課老師時,記得同步更新服務概況的人數

---

## 免費資料(區塊 6.5)

位置:`index.html` 搜尋 `class="leadmag"`,位於試教流程與常見問題之間。

用途:提供免費資料作為誘因,引導家長加 LINE(與 IG 導流共用同一個入口)。領取方式是加 LINE 後索取,網站本身不放 PDF 檔。

- **換一份資料**:改 `.leadmag-title`(書名)與 `.leadmag-body` 內的段落即可,按鈕與樣式不用動
- **目前文案為初版草稿**,請依 PDF 實際內容調整
- 按鈕連的是 LINE 官方帳號,與全站其他 LINE 連結相同

---

## 五、流量追蹤(Google Analytics 4)

追蹤碼位於 `index.html` 的 `<head>` 最上方,評估 ID 為 `G-68QYFS7PCG`,在該段落中出現**兩處**(script 網址與 `gtag('config', ...)`),更換 GA4 資源時兩處都要改。

- IG、FB 連結帶的 `utm_source`、`utm_medium` 等參數,GA4 會自動歸類到「流量開發」報表,不需額外設定
- 查看即時數據:GA4 後台 →「報表」→「即時」
- 新資源通常要等 24–48 小時才會有完整的報表數據,但即時報表馬上就看得到

---

## 六、圖片資產與分享預覽

| 檔案 | 用途 |
|------|------|
| `og-image.png` | 連結貼到 LINE、Facebook 時顯示的預覽圖卡(1200×630) |
| `favicon-32.png`、`favicon-512.png` | 瀏覽器分頁圖示 |
| `apple-touch-icon.png` | iOS 加入主畫面時的圖示(180×180) |

**網址設定:** `index.html` 的 `<head>` 內有三處絕對網址(`canonical`、`og:url`、`og:image`),目前指向 `https://chen-cu.github.io/chen-cu.github.io-yucheng-tutoring/`。若日後改用自訂網域,這三處都要一併更新,否則分享預覽圖會失效。

**重做圖片:** 這些圖是用網站同一套字型(Noto Serif TC)與配色算出來的。要改內容的話,重新產圖即可,原始樣板在對話紀錄中。
