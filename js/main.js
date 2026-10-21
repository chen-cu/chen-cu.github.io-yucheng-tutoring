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
