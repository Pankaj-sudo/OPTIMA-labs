/* ================================================================
   OPTIMA LABS — Mobile navigation
   On small screens the desktop nav-links are hidden; this injects an
   accessible hamburger + full-screen menu built from the SAME links,
   so mobile users can reach every page. Presentation only — it reuses
   the existing links and adds no routes or logic.
   ================================================================ */
(function () {
  var header = document.querySelector('header');
  if (!header) return;
  var navLinks = header.querySelector('.nav-links');
  var navRow = header.querySelector('.nav') || header.firstElementChild;
  if (!navLinks || !navRow) return;

  // hamburger toggle
  var toggle = document.createElement('button');
  toggle.className = 'm-nav-toggle';
  toggle.type = 'button';
  toggle.setAttribute('aria-label', 'Open menu');
  toggle.setAttribute('aria-expanded', 'false');
  toggle.setAttribute('aria-controls', 'mNavOverlay');
  toggle.innerHTML = '<span></span><span></span><span></span>';
  navRow.appendChild(toggle);

  // full-screen menu built from the real links
  var links = '';
  [].slice.call(navLinks.querySelectorAll('a')).forEach(function (a, i) {
    links += '<a href="' + a.getAttribute('href') + '"' + (a.classList.contains('active') ? ' class="active"' : '') +
             ' style="--i:' + i + '">' + a.textContent.trim() + '</a>';
  });
  var overlay = document.createElement('div');
  overlay.className = 'm-nav-overlay';
  overlay.id = 'mNavOverlay';
  overlay.setAttribute('role', 'dialog');
  overlay.setAttribute('aria-modal', 'true');
  overlay.setAttribute('aria-label', 'Menu');
  overlay.hidden = true;
  overlay.innerHTML =
    '<div class="m-nav-panel">' +
      '<button class="m-nav-close" type="button" aria-label="Close menu">&times;</button>' +
      '<nav class="m-nav-links" aria-label="Mobile">' + links + '</nav>' +
      '<a class="btn btn-primary m-nav-cta" href="products.html">Shop the system</a>' +
    '</div>';
  document.body.appendChild(overlay);

  var closeBtn = overlay.querySelector('.m-nav-close');
  function open() {
    overlay.hidden = false;
    requestAnimationFrame(function () { overlay.classList.add('open'); });
    toggle.classList.add('open'); toggle.setAttribute('aria-expanded', 'true'); toggle.setAttribute('aria-label', 'Close menu');
    document.body.style.overflow = 'hidden';
    closeBtn.focus();
    document.addEventListener('keydown', onKey);
  }
  function close() {
    overlay.classList.remove('open');
    toggle.classList.remove('open'); toggle.setAttribute('aria-expanded', 'false'); toggle.setAttribute('aria-label', 'Open menu');
    document.body.style.overflow = '';
    document.removeEventListener('keydown', onKey);
    setTimeout(function () { if (!overlay.classList.contains('open')) overlay.hidden = true; }, 320);
    toggle.focus();
  }
  function onKey(e) {
    if (e.key === 'Escape') { close(); return; }
    if (e.key === 'Tab') { // simple focus trap
      var f = overlay.querySelectorAll('a[href], button');
      if (!f.length) return;
      var first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  }
  toggle.addEventListener('click', function () { overlay.classList.contains('open') ? close() : open(); });
  closeBtn.addEventListener('click', close);
  overlay.addEventListener('click', function (e) { if (e.target === overlay) close(); });
  [].slice.call(overlay.querySelectorAll('a')).forEach(function (a) { a.addEventListener('click', close); });
})();
