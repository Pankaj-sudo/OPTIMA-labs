/* ================================================================
   OPTIMA LABS — ViberFloatingButton
   A self-contained, reusable floating "Chat on Viber" component.
   Drop <script src="js/viber-button.js" defer></script> on any page.

   • Fixed bottom-right, circular, premium glow + hover lift.
   • Inline SVG icon (no network request → lightweight, CSP-safe).
   • z-index 50: sits above content but UNDER the cart drawer (70) /
     checkout (80) / toast (90), so it never overlaps those overlays.
   • Click → a small modal with the greeting message + Copy + Open Viber
     (deep link, graceful fallback to the Viber download page).
   • First-visit welcome bubble, hover tooltip, full a11y + keyboard.

   To change the number/message later, edit CONFIG below (one place).
   ================================================================ */
(function () {
  if (window.__viberFabLoaded) return;            // guard against double-inject
  window.__viberFabLoaded = true;

  var CONFIG = {
    number: '+639761831910',                       // ← change here if it ever moves
    greeting:
      'Hello OPTIMA Labs 👋\n\n' +
      "I'm interested in learning more about your peptide products. " +
      "I'd appreciate your guidance in choosing the most suitable option for my needs. Thank you!",
    tooltip: 'Chat with us on Viber',
    welcome: {
      enabled: true,
      title: '👋 Welcome to OPTIMA Labs!',
      body: 'Have questions about our peptide products? Chat with one of our specialists on Viber.',
      delayMs: 1400
    }
  };

  var digits = CONFIG.number.replace(/[^0-9]/g, '');            // 639761831910
  var DEEP_LINK = 'viber://chat?number=%2B' + digits;          // open chat with the number
  var GET_VIBER = 'https://www.viber.com/download/';
  var SEEN_KEY = 'optima_viber_welcome_seen';

  // ---- Official-style Viber glyph (white bubble + purple phone) ----------
  var ICON =
    '<svg class="vb-ico" viewBox="0 0 32 32" width="30" height="30" aria-hidden="true" focusable="false">' +
      '<path fill="#fff" d="M16.9 3c-3.8 0-7.9.6-9.6 2.1C5.3 6.9 4.8 10.3 4.8 14.5s.5 7.6 2.5 9.4c.8.7 1.9 1.2 3.1 1.6l.02 3.6c0 .5.6.8 1 .45l3.05-3.15c.55.05 1.1.07 1.65.07 3.8 0 7.9-.6 9.6-2.1 2-1.8 2.5-5.2 2.5-9.4s-.5-7.6-2.5-9.4C24-.6 20.7 3 16.9 3z"/>' +
      '<path fill="#7360F2" d="M21 18.3c-.32-.2-.66-.22-.95.02l-.62.72c-.2.2-.5.18-.5.18-2.62-.72-3.34-3.36-3.34-3.36s-.02-.3.18-.5l.72-.62c.24-.29.22-.63.02-.95a10 10 0 0 0-.9-1.18c-.16-.18-.44-.2-.64-.06-.5.32-.98.74-1.28 1.24-.18.3-.2.68-.08 1.02.28.78.86 1.94 1.92 3 1.06 1.06 2.22 1.64 3 1.92.34.12.72.1 1.02-.08.5-.3.92-.78 1.24-1.28.14-.2.12-.48-.06-.64-.36-.34-.76-.66-1.18-.9z"/>' +
      '<path fill="none" stroke="#7360F2" stroke-width="1.1" stroke-linecap="round" d="M17.4 8.1c1.25 0 2.3.42 3.12 1.2.8.78 1.22 1.82 1.24 3.08M17.6 10.3c.72 0 1.28.22 1.7.64.42.42.64.98.66 1.72"/>' +
    '</svg>';

  // ---- Styles (scoped under .vb-* classes) --------------------------------
  var CSS = ''
    + '.vb-root{position:fixed;right:24px;bottom:24px;z-index:50;display:flex;flex-direction:column;align-items:flex-end;gap:12px;font-family:"Mulish","Segoe UI",system-ui,sans-serif;}'
    + '@media (max-width:520px){.vb-root{right:16px;bottom:16px;}}'
    + '.vb-fab{position:relative;width:60px;height:60px;border:none;border-radius:50%;cursor:pointer;'
    + 'background:radial-gradient(120% 120% at 30% 25%,#8f7cf6 0%,#7360f2 45%,#5b4fd6 100%);color:#fff;'
    + 'display:flex;align-items:center;justify-content:center;padding:0;'
    + 'box-shadow:0 12px 30px -8px rgba(91,79,214,.6),0 0 0 6px rgba(115,96,242,.12);'
    + 'opacity:0;transform:translateY(18px) scale(.85);'
    + 'transition:transform .3s cubic-bezier(.22,.61,.36,1),box-shadow .3s ease,opacity .5s ease;'
    + 'animation:vbIn .6s cubic-bezier(.22,.61,.36,1) .5s forwards;}'
    + '@media (max-width:520px){.vb-fab{width:56px;height:56px;}}'
    + '@keyframes vbIn{to{opacity:1;transform:translateY(0) scale(1);}}'
    + '.vb-fab::after{content:"";position:absolute;inset:0;border-radius:50%;box-shadow:0 0 0 0 rgba(115,96,242,.5);animation:vbPulse 2.6s ease-out infinite;}'
    + '@keyframes vbPulse{0%{box-shadow:0 0 0 0 rgba(115,96,242,.45);}70%{box-shadow:0 0 0 16px rgba(115,96,242,0);}100%{box-shadow:0 0 0 0 rgba(115,96,242,0);}}'
    + '.vb-fab:hover,.vb-fab:focus-visible{transform:translateY(-3px) scale(1.06);box-shadow:0 20px 42px -10px rgba(91,79,214,.72),0 0 0 8px rgba(115,96,242,.16);}'
    + '.vb-fab:focus-visible{outline:3px solid #fff;outline-offset:3px;}'
    + '.vb-fab:active{transform:translateY(-1px) scale(.98);}'
    + '.vb-ico{position:relative;z-index:1;pointer-events:none;}'
    + '@media (prefers-reduced-motion:reduce){.vb-fab{animation:none;opacity:1;transform:none;}.vb-fab::after{animation:none;}.vb-fab:hover{transform:none;}}'
    // tooltip
    + '.vb-tip{position:absolute;right:74px;top:50%;transform:translateY(-50%) translateX(6px);white-space:nowrap;'
    + 'background:#3A2E29;color:#FBF3EC;font-size:13px;font-weight:600;padding:8px 14px;border-radius:10px;'
    + 'box-shadow:0 10px 24px -12px rgba(58,46,41,.5);opacity:0;visibility:hidden;transition:.2s ease;pointer-events:none;}'
    + '.vb-tip::after{content:"";position:absolute;right:-5px;top:50%;transform:translateY(-50%) rotate(45deg);width:10px;height:10px;background:#3A2E29;}'
    + '.vb-fab:hover .vb-tip,.vb-fab:focus-visible .vb-tip{opacity:1;visibility:visible;transform:translateY(-50%) translateX(0);}'
    + '@media (max-width:820px){.vb-tip{display:none;}}'
    // welcome bubble
    + '.vb-welcome{position:relative;max-width:270px;background:#fff;color:#3A2E29;border:1px solid rgba(183,154,107,.28);'
    + 'border-radius:16px;padding:16px 18px 15px;box-shadow:0 24px 50px -20px rgba(58,46,41,.4);'
    + 'opacity:0;transform:translateY(10px) scale(.96);transform-origin:bottom right;transition:.3s cubic-bezier(.22,.61,.36,1);pointer-events:none;}'
    + '.vb-welcome.show{opacity:1;transform:translateY(0) scale(1);pointer-events:auto;}'
    + '.vb-welcome h4{margin:0 0 5px;font-family:"Prata",Georgia,serif;font-weight:400;font-size:16px;color:#3A2E29;}'
    + '.vb-welcome p{margin:0;font-size:13px;line-height:1.55;color:#6B5A52;}'
    + '.vb-welcome::after{content:"";position:absolute;right:22px;bottom:-8px;width:16px;height:16px;background:#fff;border-right:1px solid rgba(183,154,107,.28);border-bottom:1px solid rgba(183,154,107,.28);transform:rotate(45deg);}'
    + '.vb-welcome-x{position:absolute;top:8px;right:10px;background:none;border:none;color:#B0A198;font-size:18px;line-height:1;cursor:pointer;padding:2px 4px;border-radius:6px;}'
    + '.vb-welcome-x:hover{color:#8F5545;}'
    + '.vb-welcome-x:focus-visible{outline:2px solid #A96A58;outline-offset:1px;}'
    // modal
    + '.vb-overlay{position:fixed;inset:0;z-index:9999;background:rgba(30,22,18,.55);-webkit-backdrop-filter:blur(4px);backdrop-filter:blur(4px);'
    + 'display:flex;align-items:center;justify-content:center;padding:20px;opacity:0;visibility:hidden;transition:opacity .25s ease,visibility .25s ease;}'
    + '.vb-overlay.open{opacity:1;visibility:visible;}'
    + '.vb-modal{width:100%;max-width:400px;background:#FBF7F3;border:1px solid rgba(183,154,107,.3);border-radius:22px;'
    + 'padding:26px 26px 24px;position:relative;box-shadow:0 40px 90px -30px rgba(58,46,41,.5);'
    + 'transform:translateY(14px) scale(.97);transition:transform .28s cubic-bezier(.22,.61,.36,1);font-family:"Mulish","Segoe UI",system-ui,sans-serif;}'
    + '.vb-overlay.open .vb-modal{transform:none;}'
    + '.vb-modal-x{position:absolute;top:14px;right:16px;background:none;border:none;color:#8A7A70;font-size:24px;line-height:1;cursor:pointer;padding:4px 8px;border-radius:8px;}'
    + '.vb-modal-x:hover{color:#8F5545;}.vb-modal-x:focus-visible{outline:2px solid #A96A58;outline-offset:2px;}'
    + '.vb-modal-head{display:flex;align-items:center;gap:12px;}'
    + '.vb-badge{width:46px;height:46px;border-radius:50%;flex:none;display:flex;align-items:center;justify-content:center;'
    + 'background:radial-gradient(120% 120% at 30% 25%,#8f7cf6,#6a4fe0);box-shadow:0 8px 20px -6px rgba(91,79,214,.6);}'
    + '.vb-modal h3{margin:0;font-family:"Prata",Georgia,serif;font-weight:400;font-size:20px;color:#3A2E29;}'
    + '.vb-modal-sub{margin:14px 0 10px;font-size:13.5px;line-height:1.55;color:#6B5A52;}'
    + '.vb-msg{background:#fff;border:1px solid rgba(183,154,107,.3);border-radius:12px;padding:14px 15px;'
    + 'font-size:13.5px;line-height:1.6;color:#3A2E29;white-space:pre-wrap;max-height:150px;overflow:auto;}'
    + '.vb-note{margin:11px 0 18px;font-size:12px;line-height:1.5;color:#8A7A70;}'
    + '.vb-actions{display:flex;gap:10px;}'
    + '.vb-btn{flex:1;display:inline-flex;align-items:center;justify-content:center;gap:7px;padding:12px 16px;border-radius:999px;'
    + 'font-family:inherit;font-size:14px;font-weight:700;cursor:pointer;text-decoration:none;transition:transform .2s ease,filter .2s ease,background .2s ease;}'
    + '.vb-btn:active{transform:scale(.97);}'
    + '.vb-btn-primary{background:#7360f2;color:#fff;border:none;box-shadow:0 12px 26px -12px rgba(91,79,214,.7);}'
    + '.vb-btn-primary:hover{filter:brightness(1.06);}'
    + '.vb-btn-ghost{background:transparent;color:#8F5545;border:1px solid rgba(169,106,88,.45);}'
    + '.vb-btn-ghost:hover{background:rgba(192,141,128,.12);}'
    + '.vb-btn:focus-visible{outline:2px solid #7360f2;outline-offset:2px;}'
    + '.vb-get{display:block;text-align:center;margin-top:14px;font-size:12.5px;color:#8A7A70;text-decoration:none;}'
    + '.vb-get:hover{color:#8F5545;text-decoration:underline;}'
    + '.vb-copied{position:absolute;left:50%;bottom:16px;transform:translateX(-50%);background:#3A2E29;color:#fff;font-size:12.5px;'
    + 'font-weight:600;padding:7px 14px;border-radius:999px;opacity:0;transition:opacity .2s ease;pointer-events:none;}'
    + '.vb-copied.show{opacity:1;}';

  // ---- Build DOM ----------------------------------------------------------
  function el(html) { var d = document.createElement('div'); d.innerHTML = html.trim(); return d.firstChild; }

  function init() {
    if (document.getElementById('vbRoot')) return;

    var style = document.createElement('style');
    style.id = 'vbStyles';
    style.textContent = CSS;
    document.head.appendChild(style);

    var welcome = CONFIG.welcome.enabled
      ? '<div class="vb-welcome" id="vbWelcome" role="status" aria-live="polite">' +
          '<button class="vb-welcome-x" id="vbWelcomeX" type="button" aria-label="Dismiss welcome message">×</button>' +
          '<h4>' + CONFIG.welcome.title + '</h4><p>' + CONFIG.welcome.body + '</p>' +
        '</div>'
      : '';

    var root = el(
      '<div class="vb-root" id="vbRoot">' + welcome +
        '<button class="vb-fab" id="vbFab" type="button" aria-haspopup="dialog" aria-label="' + CONFIG.tooltip + '">' +
          ICON + '<span class="vb-tip" role="tooltip">' + CONFIG.tooltip + '</span>' +
        '</button>' +
      '</div>'
    );
    document.body.appendChild(root);

    var overlay = el(
      '<div class="vb-overlay" id="vbOverlay" role="dialog" aria-modal="true" aria-labelledby="vbTitle" aria-describedby="vbMsg">' +
        '<div class="vb-modal">' +
          '<button class="vb-modal-x" id="vbClose" type="button" aria-label="Close dialog">×</button>' +
          '<div class="vb-modal-head"><span class="vb-badge">' + ICON + '</span><h3 id="vbTitle">Chat with us on Viber</h3></div>' +
          '<p class="vb-modal-sub">We usually reply within business hours. Here’s a message to get you started:</p>' +
          '<div class="vb-msg" id="vbMsg">' + escapeHtml(CONFIG.greeting) + '</div>' +
          '<p class="vb-note">Viber can’t pre-fill messages for personal chats. After Viber opens, simply <b>paste this message</b> (we’ll copy it for you) or press Send if your client supports it.</p>' +
          '<div class="vb-actions">' +
            '<button class="vb-btn vb-btn-ghost" id="vbCopy" type="button">Copy message</button>' +
            '<a class="vb-btn vb-btn-primary" id="vbOpen" href="' + DEEP_LINK + '">Open Viber →</a>' +
          '</div>' +
          '<a class="vb-get" href="' + GET_VIBER + '" target="_blank" rel="noopener">Don’t have Viber? Get the app →</a>' +
          '<div class="vb-copied" id="vbCopied" role="status" aria-live="polite">Message copied ✓</div>' +
        '</div>' +
      '</div>'
    );
    document.body.appendChild(overlay);

    var fab = document.getElementById('vbFab');
    var lastFocus = null;

    // open / close modal
    function openModal() {
      lastFocus = document.activeElement;
      overlay.classList.add('open');
      dismissWelcome();
      document.getElementById('vbCopy').focus();
      document.addEventListener('keydown', onKey);
    }
    function closeModal() {
      overlay.classList.remove('open');
      document.removeEventListener('keydown', onKey);
      if (lastFocus && lastFocus.focus) lastFocus.focus();
    }
    function onKey(e) {
      if (e.key === 'Escape') { closeModal(); return; }
      if (e.key === 'Tab') {                       // simple focus trap
        var f = overlay.querySelectorAll('button, a[href]');
        if (!f.length) return;
        var first = f[0], last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    }

    fab.addEventListener('click', openModal);
    document.getElementById('vbClose').addEventListener('click', closeModal);
    overlay.addEventListener('click', function (e) { if (e.target === overlay) closeModal(); });

    // copy helper
    function copyMsg() {
      var done = function () { var c = document.getElementById('vbCopied'); c.classList.add('show'); setTimeout(function () { c.classList.remove('show'); }, 1900); };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(CONFIG.greeting).then(done).catch(fallbackCopy);
      } else fallbackCopy();
      function fallbackCopy() {
        try {
          var ta = document.createElement('textarea'); ta.value = CONFIG.greeting;
          ta.style.position = 'fixed'; ta.style.opacity = '0'; document.body.appendChild(ta);
          ta.select(); document.execCommand('copy'); document.body.removeChild(ta); done();
        } catch (e) {}
      }
    }
    document.getElementById('vbCopy').addEventListener('click', copyMsg);

    // Open Viber: copy first (best-effort), then hand off to the deep link.
    document.getElementById('vbOpen').addEventListener('click', function (e) {
      e.preventDefault();
      copyMsg();
      setTimeout(function () { window.location.href = DEEP_LINK; }, 180);
    });

    // welcome bubble (first visit)
    if (CONFIG.welcome.enabled) {
      var w = document.getElementById('vbWelcome');
      var seen; try { seen = localStorage.getItem(SEEN_KEY); } catch (e) {}
      if (!seen) {
        setTimeout(function () { w.classList.add('show'); }, CONFIG.welcome.delayMs);
        setTimeout(function () { w.classList.remove('show'); }, CONFIG.welcome.delayMs + 9000); // auto-hide
      }
      document.getElementById('vbWelcomeX').addEventListener('click', function (e) { e.stopPropagation(); dismissWelcome(); });
    }
    function dismissWelcome() {
      var w = document.getElementById('vbWelcome');
      if (w) w.classList.remove('show');
      try { localStorage.setItem(SEEN_KEY, '1'); } catch (e) {}
    }
  }

  function escapeHtml(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
