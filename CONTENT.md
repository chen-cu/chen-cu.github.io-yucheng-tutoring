# 內容維護說明(CONTENT.md)

本網站為多頁式招生網站(2026-10-20 由單頁改版),純靜態 HTML,無建置流程。

## 零、檔案與頁面

| 網址 | 檔案 | 內容 |
|------|------|------|
| `/` | `index.html` | 首頁:Hero、痛點、四大優勢+服務概況、師資預覽、四步驟、免費資料預覽、常見問題(3 題)、表單 |
| `/teachers/` | `teachers/index.html` | 師資完整介紹、老師怎麼安排 |
| `/courses/` | `courses/index.html` | 課程分班、英語口說・發音課程、上課方式、收費方式、四步驟 |
| `/resources/` | `resources/index.html` | 《錯題,不是粗心。》介紹與試讀、段考考卷免費分析 |
| `/faq/` | `faq/index.html` | 完整九題常見問題 |
| — | `css/style.css` | 全站樣式 |
| — | `js/main.js` | 手機浮動按鈕自動隱藏、GA4 點擊事件 |
| — | `sitemap.xml` | 給 Google 的頁面清單(新增頁面時要加) |

**五頁共用、改一處要改五頁的部分:**
- `<head>`(GA4、og 預覽、字型)
- 頁首導覽(`<!-- 頁首導覽 -->`)與頁尾(`<!-- 頁尾 -->`)
- 手機底部浮動按鈕列

子頁在資料夾裡,所以子頁的 css/js/圖示路徑前面要加 `../`(首頁不用)。目前所在頁面的選單項目有 `aria-current="page"`,會顯示金色底線。

**同一內容出現在兩頁的地方(改一邊記得改另一邊):**

| 內容 | 位置 1 | 位置 2 |
|------|--------|--------|
| 老師 | `teachers/` 完整卡片 | 首頁師資預覽一行簡介(`teacher-mini`) |
| 常見問題 Q1、Q3、Q8 | `faq/` | 首頁常見問題預覽 |
| 四步驟 | 首頁 | `courses/` |
| 免費資料說明 | 首頁 `#freebie` | `resources/` |

## 一、文字位置

每個區塊前都有 `<!-- ============ 區塊名稱 ============ -->` 註解,在對應檔案中搜尋即可。

**Google 表單網址**(`…viewform?usp=pp_url&entry.1670616827=%E5%AE%98%E6%96%B9%E7%B6%B2%E7%AB%99`,來源預填「官方網站」)與 **LINE 連結**(`https://lin.ee/oPeCDkw`)散在五頁,更換時請對整個資料夾全域搜尋取代。

> 表單 iframe 只在首頁 `#contact`。高度在 `css/style.css` 的 `.form-embed iframe { height: 1150px; }`。

---

## 二、如何新增一位老師

1. `teachers/index.html`:複製任一個 `<article class="teacher-card">…</article>`,貼在最後一張之後,改姓名、科目、介紹。
2. `index.html` 師資預覽:複製一個 `<li class="teacher-mini">`,寫一行 20 字內簡介。
3. `index.html` 服務概況:「授課師資」人數 +1。

---

## 二之二、英語口說・發音課程

位於 `courses/index.html` 的「課程規劃」區塊內,結構為 `<h3 class="subsection-title">` + `.course-subtitle` + `.course-desc` + 按鈕。刪除或新增類似課程時,整組複製或刪除即可。

---

## 三、如何修改 FAQ

完整九題在 `faq/index.html`,首頁另有三題預覽(Q1 費用、Q8 試教、Q3 請假)。每一題是一個 `<details class="faq-item">`:

```html
<details class="faq-item">
  <summary>Q1:費用怎麼計算?</summary>
  <div class="faq-answer"><p>答案文字寫在這裡。</p></div>
</details>
```

新增、刪除題目直接操作 `<details>` 區塊,題號需手動調整。展開收合為瀏覽器原生行為,不需要 JavaScript。

---

## 四、常用樣式調整(css/style.css)

- **配色**:檔案最上方 `:root` 內的 CSS 變數。主色 `--ink`(深墨藍)、底色 `--paper`(米白)、點綴色 `--accent`(深金)。
- **手機底部浮動按鈕列**:`.mobile-cta-bar` 區段;僅在寬度 767px 以下顯示,固定於底部,「加 LINE 諮詢」+「預約試教」並列。捲動到表單區塊時會自動滑出隱藏(由 `js/main.js` 控制)。
- **信任標語(先上課,後收費)**:`.trust-badge`,細金框標籤樣式。

---

## 服務概況(區塊 3 下方)

位置:`index.html` 搜尋 `class="record"`(只在首頁)。三項各為一個 `<div class="record-item">`,桌機三欄、手機單欄。

目前放的是**服務範圍事實**,不是業績數字:授課師資人數、上課方式、授課科目。

**對外文案規則(重要):**

- **不寫成績進步幅度**(例:「數學從 58 到 76」)。成績登記表屬內部追蹤用途,不對外publish。
- **不寫續課相關說法**(例:「續課率 100%」)。依規則文件 v2.4,學生母數小,百分比易被視為誇大。
- 新增老師時,記得同步更新「授課師資」的人數。

教學實績類的數字(累計時數等)目前已移除。若日後要放回,數字取自記帳表「業務成長」分頁的「宣傳可用數字」,只寫實際紀錄、不往上四捨五入,並採門檻寫法(例:300 小時以上)以免每月維護。

---

## 學習諮詢(已移除)

2026-10-20 使用者決定:Mike 不對外露出,網站不放學習諮詢區塊、不列入師資陣容。CSS 中的 `.consult-*` 樣式保留未刪,日後如需類似區塊可沿用。

---

## 免費資料

位置:首頁 `#freebie`(精簡版)與 `resources/index.html`(完整介紹、目錄、試讀、考卷分析)。

用途:提供免費資料作為誘因,引導家長加 LINE(與 IG 導流共用同一個入口)。領取方式是加 LINE 後索取,網站本身不放 PDF 檔。

- **換一份資料**:改 `.leadmag-title`(書名)與 `.leadmag-body` 內的段落即可,按鈕與樣式不用動
- `resources/` 的目錄與試讀內容摘自 PDF《錯題,不是粗心。》,換資料時要一起改
- 按鈕連的是 LINE 官方帳號,與全站其他 LINE 連結相同

---

## 五、流量追蹤(Google Analytics 4)

追蹤碼位於**每一頁**的 `<head>` 最上方,評估 ID 為 `G-68QYFS7PCG`,每頁出現**兩處**(script 網址與 `gtag('config', ...)`),更換 GA4 資源時五頁共十處都要改。

**點擊事件(`js/main.js`):** 點任何 LINE 連結送出 `line_click`,點任何預約表單連結送出 `booking_click`,附帶按鈕文字(`link_text`)與所在頁面(`page_path`)。要在 GA4 計算轉換,需到「管理 → 事件」把這兩個事件標記為「關鍵事件」(一次性設定,事件要先被觸發過一次才會出現在清單裡)。

- IG、FB 連結帶的 `utm_source`、`utm_medium` 等參數,GA4 會自動歸類到「流量開發」報表,不需額外設定
- 查看即時數據:GA4 後台 →「報表」→「即時」
- 新資源通常要等 24–48 小時才會有完整的報表數據,但即時報表馬上就看得到

---

## 六、短網址轉址頁

四個轉址頁,點進去會自動跳轉到目的地並帶上追蹤參數。每個頁面是一個資料夾下的 `index.html`。

| 路徑 | 檔案 | 跳轉到 | 用途 |
|------|------|--------|------|
| `/a1` | `a1/index.html` | 首頁 + `utm_campaign=a1` | FB 社團貼文 A1 |
| `/a2` | `a2/index.html` | 首頁 + `utm_campaign=a2` | FB 社團貼文 A2 |
| `/c` | `c/index.html` | 首頁 + `utm_campaign=c_level` | FB 社團貼文 C |
| `/book` | `book/index.html` | 預約表單(來源預填「地區社團」) | 直接導到表單 |

前三個的 utm 參數同為 `utm_source=facebook`、`utm_medium=group`,只有 `utm_campaign` 不同,在 GA4「流量開發」報表中可依此區分成效。

`/book` 不帶 utm——它直接跳到 Google 表單,來源是靠表單本身的預填欄位(`entry.1670616827=地區社團`)記錄。

**新增一個轉址頁:** 複製任一資料夾(例如 `a1/`),改資料夾名稱,再修改 `index.html` 中的**三處**網址——`meta refresh`、`location.replace`、以及備用連結的 `href`。三處要一致,否則不同瀏覽器會跳到不同地方。

> 注意:HTML 屬性裡的 `&` 要寫成 `&amp;`(meta refresh 與 href),但 `<script>` 內的字串用一般的 `&`。

**轉址頁不載入 GA4**,避免重複計算瀏覽量;追蹤是由目的地(首頁)負責。因此目前無法得知 `/book` 被點了幾次,若需要這個數字再另外處理。

---

## 七、圖片資產與分享預覽

| 檔案 | 用途 |
|------|------|
| `og-image.png` | 連結貼到 LINE、Facebook 時顯示的預覽圖卡(1200×630) |
| `favicon-32.png`、`favicon-512.png` | 瀏覽器分頁圖示 |
| `apple-touch-icon.png` | iOS 加入主畫面時的圖示(180×180) |

**網址設定:** 每一頁的 `<head>` 內有三處絕對網址(`canonical`、`og:url`、`og:image`),目前指向 `https://chen-cu.github.io/chen-cu.github.io-yucheng-tutoring/`。若日後改用自訂網域,五頁都要更新,`sitemap.xml`、`robots.txt` 與四個短網址轉址頁也要一起改。

**重做圖片:** 這些圖是用網站同一套字型(Noto Serif TC)與配色算出來的。要改內容的話,重新產圖即可,原始樣板在對話紀錄中。
