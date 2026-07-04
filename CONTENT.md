# 內容維護說明(CONTENT.md)

本網站為單頁式招生網站,共 3 個主要檔案:

| 檔案 | 內容 |
|------|------|
| `index.html` | 全部頁面文字(區塊 1–8)與版面結構 |
| `css/style.css` | 全站樣式(配色、字體、排版) |
| `js/main.js` | 師資資料陣列(區塊 5 的老師卡片由此產生)、手機底部按鈕行為 |

---

## 一、每個區塊的文字位置

所有區塊都在 `index.html`,由上而下依序排列,每個區塊前有 `<!-- 區塊 N -->` 註解可供搜尋:

| 區塊 | 位置(搜尋關鍵字) | 說明 |
|------|--------------------|------|
| 區塊 1|首屏 Hero | `<!-- ============ 區塊 1` | 主標題在 `<h1 class="hero-title">`,副標題在 `.hero-sub`,信任標語在 `.trust-badge`,按鈕小字在 `.cta-note` |
| 區塊 2|痛點共鳴 | `<!-- ============ 區塊 2` | 三個情境各為一個 `<div class="pain-item">`,收尾句在 `.section-closing` |
| 區塊 3|四大核心優勢 | `<!-- ============ 區塊 3` | 四項優勢各為一個 `<div class="advantage-item">` |
| 區塊 4|課程規劃 | `<!-- ============ 區塊 4` | 國中/高中分班在兩個 `<div class="course-col">`,收費方式在 `.pricing-list` |
| 區塊 5|師資陣容 | `<!-- ============ 區塊 5` | 老師卡片「不在 HTML 裡」,改到 `js/main.js` 的 `TEACHERS` 陣列(見下方說明) |
| 區塊 6|試教流程 | `<!-- ============ 區塊 6` | 四步驟各為一個 `<li class="step-item">` |
| 區塊 7|常見問題 | `<!-- ============ 區塊 7` | 每題為一個 `<details class="faq-item">`(見下方說明) |
| 區塊 8|最終 CTA | `<!-- ============ 區塊 8` | 主文案、副文案、Google 表單 iframe;頁尾文字在 `<footer class="site-footer">` |

Google 表單網址(`https://forms.gle/YUFZk5ZuCSZWK1hw6`)出現在多處:頁首按鈕、Hero 按鈕、區塊 4 按鈕、區塊 8 iframe 與按鈕、手機底部固定按鈕。若日後更換表單,請在 `index.html` 全域搜尋取代此網址。

> 表單嵌入備註:目前 iframe 直接使用 forms.gle 短網址。若表單在某些瀏覽器無法顯示,請到 Google 表單後台 →「傳送」→「< >」取得正式嵌入網址(格式為 `https://docs.google.com/forms/d/e/…/viewform?embedded=true`),替換 `index.html` 中 iframe 的 `src` 即可。iframe 高度可在 `css/style.css` 的 `.form-embed iframe { height: 1150px; }` 調整。

---

## 二、如何新增一位老師

打開 `js/main.js`,找到最上方的 `TEACHERS` 陣列。每位老師是一個物件:

```js
{
  name: "Andy 老師",        // 姓名
  subject: "數學・社會科",   // 科目(顯示在姓名下方的金色小標)
  bio: "台南一中、台師大……"  // 介紹文字
}
```

**新增步驟:**

1. 複製陣列中任一組 `{ ... }`(含前後大括號)。
2. 貼到陣列最後一個物件之後,並確認物件之間以逗號 `,` 分隔。
3. 修改 `name`、`subject`、`bio` 三個欄位。
4. 存檔並推送,卡片會自動出現在師資區,無須改動 HTML 或 CSS。

範例(新增「Cindy 老師」):

```js
const TEACHERS = [
  // ……原有老師……
  {
    name: "Alison 老師",
    subject: "英語",
    bio: "……"
  },   // ← 記得這裡要有逗號
  {
    name: "Cindy 老師",
    subject: "數學",
    bio: "介紹文字寫在這裡。"
  }
];
```

刪除或調整老師順序,同樣只需在此陣列操作。

---

## 三、如何修改 FAQ(區塊 7)

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
- **手機底部固定按鈕**:`.mobile-cta` 區段;僅在寬度 767px 以下顯示,捲動到表單區塊時會自動隱藏(由 `js/main.js` 控制)。
- **信任標語(先上課,後收費)**:`.trust-badge`,細金框標籤樣式。
