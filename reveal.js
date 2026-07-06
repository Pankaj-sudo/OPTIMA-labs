/* OPTIMA LABS — scroll reveal (lightweight, resilient).
   Content is visible by default; this only enhances. Elements already in the
   viewport reveal immediately (no flash); the rest animate in on scroll.
   Falls back to fully-visible if IntersectionObserver is missing or errors. */
(function () {
  var d = document;
  function run() {
    var els = [].slice.call(d.querySelectorAll('.reveal'));
    if (!els.length) return;
    d.documentElement.classList.add('reveal-ready');
    function showAll() { els.forEach(function (e) { e.classList.add('in'); }); }
    if (!('IntersectionObserver' in window)) { showAll(); return; }
    var io;
    try {
      io = new IntersectionObserver(function (ents) {
        ents.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } });
      }, { threshold: 0.1, rootMargin: '0px 0px -8% 0px' });
    } catch (e) { showAll(); return; }
    var vh = window.innerHeight || d.documentElement.clientHeight;
    els.forEach(function (e) {
      if (e.getBoundingClientRect().top < vh * 0.92) e.classList.add('in'); // already visible → show now
      else io.observe(e);
    });
  }
  if (d.readyState === 'loading') d.addEventListener('DOMContentLoaded', run); else run();
})();
