/* ==========================================================================
   宇誠文理家教團 — 網站腳本
   ========================================================================== */

/* --------------------------------------------------------------------------
   手機版右下角浮動泡泡按鈕:捲動到最終 CTA(表單)區塊時自動隱藏,避免重複
   -------------------------------------------------------------------------- */
(function mobileCtaVisibility() {
  var bar = document.getElementById("mobile-cta");
  var contact = document.getElementById("contact");
  if (!bar || !contact || !("IntersectionObserver" in window)) return;

  var observer = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        bar.classList.toggle("is-hidden", entry.isIntersecting);
      });
    },
    { threshold: 0.1 }
  );

  observer.observe(contact);
})();

/* --------------------------------------------------------------------------
   GA4 轉換事件:點 LINE、點預約表單時各送一個事件
   - line_click:所有 lin.ee 連結
   - booking_click:所有 Google 表單連結
   - ig_click:所有 Instagram 連結
   兩個事件會自動出現在 GA4「事件」報表;要當成「關鍵事件」計算轉換,
   需到 GA4 後台「管理 → 事件」把這兩個事件標記為關鍵事件(一次性設定)。
   -------------------------------------------------------------------------- */
(function trackCtaClicks() {
  document.addEventListener("click", function (e) {
    var a = e.target.closest ? e.target.closest("a[href]") : null;
    if (!a || typeof window.gtag !== "function") return;
    var href = a.getAttribute("href") || "";
    var name = null;
    if (href.indexOf("lin.ee/") !== -1) name = "line_click";
    else if (href.indexOf("docs.google.com/forms") !== -1) name = "booking_click";
    else if (href.indexOf("instagram.com/") !== -1) name = "ig_click";
    if (!name) return;
    window.gtag("event", name, {
      link_text: (a.textContent || "").trim().slice(0, 40),
      page_path: location.pathname
    });
  });
})();

/* --------------------------------------------------------------------------
   捲動進場動畫(僅首頁 body[data-reveal];減少動態效果或不支援時完全不啟用)
   -------------------------------------------------------------------------- */
(function scrollReveal() {
  if (!document.body.hasAttribute("data-reveal")) return;
  if (!("IntersectionObserver" in window)) return;
  if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  var groups = [
    ".section-title", ".section-lead", ".freebie", ".pain-item", ".hand-note",
    ".method-item", ".teacher-mini", ".step-item", ".faq-item", ".more-link"
  ];
  var targets = [];
  groups.forEach(function (sel) {
    var list = document.querySelectorAll("section:not(.hero) " + sel);
    Array.prototype.forEach.call(list, function (el, i) {
      var sibIndex = Array.prototype.indexOf.call(el.parentNode.children, el);
      el.style.setProperty("--reveal-delay", Math.min(sibIndex, 5) * 0.08 + "s");
      el.classList.add("reveal");
      targets.push(el);
    });
  });

  document.documentElement.classList.add("reveal-ready");
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) { e.target.classList.add("is-in"); io.unobserve(e.target); }
    });
  }, { threshold: 0.12, rootMargin: "0px 0px -6% 0px" });
  targets.forEach(function (el) { io.observe(el); });
})();
