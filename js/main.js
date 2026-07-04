/* ==========================================================================
   宇誠文理家教團 — 網站腳本
   ========================================================================== */

/* --------------------------------------------------------------------------
   師資資料(區塊 5)
   新增老師:複製一組 { name, subject, bio } 物件,貼在陣列最後即可,
   卡片會自動產生,無須修改 HTML 或 CSS。
   -------------------------------------------------------------------------- */
const TEACHERS = [
  {
    name: "Andy 老師",
    subject: "數學・社會科",
    bio: "台南一中、台師大地理系暨研究所。具數學、地理、社會、公民、心理輔導等多張教師證,曾任高中教師與知名補習班講師。"
  },
  {
    name: "Joanna 老師",
    subject: "英語",
    bio: "加拿大維多利亞大學教學專業發展、台中科技大學應用商學系。教育部英語教學示範講師,具 TOEIC、GEPT 教學專長,現任私立高中學測、多益、英檢教師。"
  },
  {
    name: "Louis 老師",
    subject: "英語",
    bio: "東吳大學英文系(師資生)。曾任補習班與偏鄉英語教師,具雙北、桃園多所國高中教學經驗。"
  },
  {
    name: "Mike 老師",
    subject: "國文・社會科",
    bio: "學測國文、社會達前標水準,擔任國語文專業輔導與家教教師。"
  },
  {
    name: "Alison 老師",
    subject: "英語",
    bio: "主修英文相關領域,對語言學習與文學皆有深入涉獵。擅長將困難、抽象的知識以淺顯易懂的方式講解,依學生程度調整教學,引導學生循序建立觀念,並營造輕鬆、願意主動發問的學習環境——目標不只是提升成績,更是建立自信與自主學習的能力。"
  },
  {
    name: "詹凱仰 老師",
    subject: "英語",
    bio: "東吳大學英文系,受過扎實的閱讀、寫作與文本分析訓練。擅長將複雜觀念拆解成小步驟,搭配生活化例子與題目練習,由淺入深建立觀念——不只告訴學生答案,更帶他理解「為什麼這樣寫、為什麼這樣選、錯誤從哪一步開始」。教學細心、有耐心,重視雙向溝通,依學生程度調整節奏:基礎較弱先補強核心觀念,已有基礎則帶入進階題型;並營造安心的學習氣氛,讓學生敢問問題、敢說出不懂的地方。目標是陪伴學生建立穩定的學習方法與自信,每堂課後都清楚知道自己學會了什麼、下一步如何進步。"
  }
];

/* 產生師資卡片 */
(function renderTeachers() {
  const grid = document.getElementById("teacher-grid");
  if (!grid) return;

  TEACHERS.forEach(function (t) {
    const card = document.createElement("article");
    card.className = "teacher-card";

    const name = document.createElement("h3");
    name.className = "teacher-name";
    name.textContent = t.name;

    const subject = document.createElement("span");
    subject.className = "teacher-subject";
    subject.textContent = t.subject;

    const bio = document.createElement("p");
    bio.className = "teacher-bio";
    bio.textContent = t.bio;

    card.appendChild(name);
    card.appendChild(subject);
    card.appendChild(bio);
    grid.appendChild(card);
  });
})();

/* --------------------------------------------------------------------------
   手機版底部固定按鈕:捲動到最終 CTA(表單)區塊時自動隱藏,避免重複
   -------------------------------------------------------------------------- */
(function mobileCtaVisibility() {
  const bar = document.getElementById("mobile-cta");
  const contact = document.getElementById("contact");
  if (!bar || !contact || !("IntersectionObserver" in window)) return;

  const observer = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        bar.classList.toggle("is-hidden", entry.isIntersecting);
      });
    },
    { threshold: 0.1 }
  );

  observer.observe(contact);
})();
