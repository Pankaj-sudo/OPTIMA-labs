/* ================================================================
   OPTIMA LABS — Luxury interaction layer  (presentation only)
   ----------------------------------------------------------------
   Progressive enhancement that makes the whole site feel calmer and
   more refined — scroll reveals, image fade-in, gentle desktop
   momentum scrolling, and soft page transitions. It changes NO
   markup, routing, Firebase, auth, cart, or business logic; every
   effect is additive and fully removed under prefers-reduced-motion.

   Design intent (Apple / Aesop / Linear restraint):
     • transform + opacity only  → GPU-friendly, no layout thrash
     • ease-out / expo curves, 150–700ms, once on enter
     • never hide content that is already on screen (no flash, LCP-safe)
     • pages that already ship curated reveals (reveal.js) keep theirs
   ================================================================ */
(function () {
  if (window.__luxLoaded) return;
  window.__luxLoaded = true;

  var html = document.documentElement;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  var hasRevealJs = !!document.querySelector('script[src*="reveal.js"]');
  var IOok = 'IntersectionObserver' in window;
  html.classList.add('lux');

  function ready(fn) {
    if (document.readyState !== 'loading') fn();
    else document.addEventListener('DOMContentLoaded', fn);
  }
  function inView(el) {
    var r = el.getBoundingClientRect();
    var h = window.innerHeight || html.clientHeight;
    return r.top < h * 0.92 && r.bottom > 0;   // 8% buffer → only truly below-fold animates
  }
  function closestSel(el, sel) { return el.closest ? el.closest(sel) : null; }

  /* ---------- 1 · Scroll reveals ---------------------------------------
     Curated, non-nesting selectors. Grouped siblings stagger softly. */
  var REVEAL_SEL = '.sec-head, .page-intro, .strip, .assess-band, .closing,' +
                   ' .quality-inner, .product, .card, .step, .detail-art, .detail-info,' +
                   ' .oc-card, .lab-hero-inner';
  var EXCLUDE = '#asvApp, .co-overlay, .drawer, .coa-overlay, .coa-modal, .m-nav-overlay, header, footer, nav';
  var revealIO = null;

  function reveal(el) {
    el.classList.add('lux-in');
    el.addEventListener('transitionend', function te() {
      el.style.willChange = ''; el.style.transitionDelay = '';
      el.removeEventListener('transitionend', te);
    });
  }
  function setupReveals(root) {
    if (hasRevealJs || reduce.matches || !IOok) return;
    if (!revealIO) revealIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { reveal(en.target); revealIO.unobserve(en.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.05 });

    [].slice.call((root || document).querySelectorAll(REVEAL_SEL)).forEach(function (el) {
      if (el.__lux || closestSel(el, EXCLUDE)) return;
      el.__lux = true;
      if (inView(el)) { el.classList.add('lux-reveal', 'lux-in'); return; }  // visible now → show, no motion
      var p = el.parentNode;
      if (!p.__luxG) { p.__luxG = 0; }
      var i = p.__luxG++;                        // stagger within the same grid/row
      el.style.transitionDelay = Math.min(i, 6) * 70 + 'ms';
      el.classList.add('lux-reveal');
      revealIO.observe(el);
    });
  }

  /* ---------- 2 · Image fade-in (LCP-safe) -----------------------------
     Only below-the-fold, not-yet-loaded images fade; anything already
     painted (cached / above the fold) stays instant so LCP is untouched. */
  function setupImages(root) {
    if (reduce.matches) return;
    [].slice.call((root || document).querySelectorAll('img')).forEach(function (img) {
      if (img.__lux || img.hasAttribute('data-nolux') || closestSel(img, EXCLUDE)) return;
      img.__lux = true;
      try { img.decoding = 'async'; } catch (e) {}
      var loaded = img.complete && img.naturalWidth > 0;
      if (loaded || inView(img)) { img.classList.add('lux-img', 'lux-loaded'); return; }
      img.classList.add('lux-img');
      img.addEventListener('load', function () { img.classList.add('lux-loaded'); }, { once: true });
      img.addEventListener('error', function () { img.classList.add('lux-loaded'); }, { once: true });
    });
  }

  /* ---------- 3 · Gentle desktop momentum scroll -----------------------
     Softens the wheel on precise pointers only. Touch keeps its native
     momentum; reduced-motion turns this off. It animates the REAL scroll
     position (no transform wrapper), so fixed/sticky headers, the cart
     drawer and overlays keep working — and it bails whenever the body is
     scroll-locked or the pointer is over an inner scroll area. */
  function setupSmoothScroll() {
    if (reduce.matches) return;
    if (!window.matchMedia('(pointer:fine)').matches) return;
    if ('ontouchstart' in window || navigator.maxTouchPoints > 0) return;

    var LERP = 0.14, current = sy(), target = current, running = false, self = false;
    function sy() { return window.scrollY || html.scrollTop || 0; }
    function maxY() {
      var se = document.scrollingElement || html;
      return Math.max(0, se.scrollHeight - window.innerHeight);
    }
    function locked() {
      var s = getComputedStyle(document.body).overflow;
      return s === 'hidden' || getComputedStyle(html).overflow === 'hidden';
    }
    function innerScrolls(node, dy) {
      while (node && node.nodeType === 1 && node !== document.body && node !== html) {
        if (node.scrollHeight > node.clientHeight + 1) {
          var oy = getComputedStyle(node).overflowY;
          if (oy === 'auto' || oy === 'scroll') {
            if (dy < 0 && node.scrollTop > 0) return true;
            if (dy > 0 && node.scrollTop < node.scrollHeight - node.clientHeight - 1) return true;
          }
        }
        node = node.parentNode;
      }
      return false;
    }
    function loop() {
      current += (target - current) * LERP;
      if (Math.abs(target - current) < 0.5) { current = target; running = false; }
      self = true; window.scrollTo(0, Math.round(current)); self = false;
      if (running) requestAnimationFrame(loop);
    }
    window.addEventListener('wheel', function (e) {
      if (e.ctrlKey || e.metaKey) return;                 // pinch-zoom → native
      if (locked()) { current = target = sy(); return; }  // drawer/overlay open → native
      if (innerScrolls(e.target, e.deltaY)) return;        // scrollable inner region → native
      var unit = e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? window.innerHeight : 1;
      e.preventDefault();
      if (!running) current = sy();
      target = Math.max(0, Math.min(maxY(), target + e.deltaY * unit));
      if (!running) { running = true; requestAnimationFrame(loop); }
    }, { passive: false });
    // keep target in sync with keyboard / scrollbar / anchor-driven scrolls
    window.addEventListener('scroll', function () { if (!self && !running) { current = target = sy(); } }, { passive: true });
    window.addEventListener('resize', function () { target = Math.max(0, Math.min(maxY(), target)); }, { passive: true });
  }

  /* ---------- 4 · Soft page transitions --------------------------------
     Same-origin, left-click, same-tab navigations fade the page out
     briefly (no white flash). Everything else (new tab, downloads,
     hashes, external, modified clicks, JS buttons) is untouched. */
  function setupPageTransition() {
    if (reduce.matches) return;
    document.addEventListener('click', function (e) {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      var a = e.target && e.target.closest ? e.target.closest('a[href]') : null;
      if (!a) return;
      if (a.target && a.target !== '_self') return;
      if (a.hasAttribute('download')) return;
      var raw = a.getAttribute('href') || '';
      if (/^(#|mailto:|tel:|javascript:)/i.test(raw)) return;
      var url; try { url = new URL(a.href, location.href); } catch (_) { return; }
      if (url.origin !== location.origin) return;
      if (url.pathname === location.pathname && url.hash) return;   // in-page anchor
      e.preventDefault();
      html.classList.add('lux-leaving');
      setTimeout(function () { window.location.href = a.href; }, 170);
    }, false);
    window.addEventListener('pageshow', function (ev) { if (ev.persisted) html.classList.remove('lux-leaving'); });
  }

  /* ---------- init ---------- */
  ready(function () {
    setupReveals(document);
    setupImages(document);
    setupSmoothScroll();
    setupPageTransition();

    // Catch async-injected content (Firestore product grids, related items).
    if (!reduce.matches && 'MutationObserver' in window) {
      var scheduled = false;
      new MutationObserver(function () {
        if (scheduled) return; scheduled = true;
        requestAnimationFrame(function () { scheduled = false; setupReveals(document); setupImages(document); });
      }).observe(document.body, { childList: true, subtree: true });
    }
  });

  // If the visitor enables reduced motion mid-session, drop everything gracefully.
  var onReduce = function () {
    if (!reduce.matches) return;
    [].slice.call(document.querySelectorAll('.lux-reveal')).forEach(function (el) { el.classList.add('lux-in'); });
    [].slice.call(document.querySelectorAll('.lux-img')).forEach(function (img) { img.classList.add('lux-loaded'); });
    html.classList.remove('lux-leaving');
  };
  if (reduce.addEventListener) reduce.addEventListener('change', onReduce);
  else if (reduce.addListener) reduce.addListener(onReduce);
})();
