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
