/* ================================================================
   OPTIMA LABS — WhatsAppFloatingButton
   A self-contained, reusable floating "Chat on WhatsApp" component.
   Drop <script src="js/whatsapp-button.js" defer></script> on any page.

   • Fixed bottom-right, circular, premium glow + hover lift.
   • Inline SVG icon (no network request → lightweight, CSP-safe).
   • z-index 50: sits above content but UNDER the cart drawer (70) /
     checkout (80) / toast (90), so it never overlaps those overlays.
   • pointer-events: only the button itself is interactive — nothing
     blocks taps on the rest of the page.
   • Click → opens wa.me with the greeting PRE-FILLED (official API),
     so the customer only needs to press Send.
   • First-visit welcome bubble, hover tooltip, full a11y + keyboard.

   To change the number/message later, edit CONFIG below (one place).
   ================================================================ */
(function () {
  if (window.__waFabLoaded) return;               // guard against double-inject
  window.__waFabLoaded = true;

  var CONFIG = {
    number: '+639761831910',                       // ← change here if it ever moves
    greeting:
      'Hello OPTIMA Labs 👋\n\n' +
      "I'm interested in learning more about your peptide products. " +
      "I'd appreciate your guidance in choosing the most suitable option for my needs.\n\nThank you!",
    tooltip: 'Chat with us on WhatsApp',
    welcome: {
      enabled: true,
      title: '💬 Need help?',
      body: 'Chat with one of our peptide specialists on WhatsApp.',
      delayMs: 1400
    }
  };

  var digits = CONFIG.number.replace(/[^0-9]/g, '');                    // 639761831910
  var WA_URL = 'https://wa.me/' + digits + '?text=' + encodeURIComponent(CONFIG.greeting);
  var SEEN_KEY = 'optima_wa_welcome_seen';

  // ---- Official WhatsApp glyph (white on brand green) --------------------
  var ICON =
    '<svg class="wa-ico" viewBox="0 0 24 24" width="28" height="28" fill="#fff" aria-hidden="true" focusable="false">' +
      '<path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51l-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.71.306 1.263.489 1.694.625.712.227 1.36.195 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>' +
    '</svg>';

  // ---- Styles (scoped under .wa-* classes) --------------------------------
  var CSS = ''
    + '.wa-root{position:fixed;right:24px;bottom:24px;z-index:50;display:flex;flex-direction:column;align-items:flex-end;gap:12px;font-family:"Mulish","Segoe UI",system-ui,sans-serif;pointer-events:none;}'
    + '.wa-root > *{pointer-events:auto;}'
    + '@media (max-width:520px){.wa-root{right:16px;bottom:16px;}}'
    + '.wa-fab{position:relative;width:60px;height:60px;border:none;border-radius:50%;cursor:pointer;'
    + 'background:radial-gradient(120% 120% at 30% 25%,#3ddb70 0%,#25d366 45%,#1cab52 100%);color:#fff;'
    + 'display:flex;align-items:center;justify-content:center;padding:0;'
    + 'box-shadow:0 12px 30px -8px rgba(28,171,82,.55),0 0 0 6px rgba(37,211,102,.12);'
    + 'opacity:0;transform:translateY(18px) scale(.85);'
    + 'transition:transform .3s cubic-bezier(.22,.61,.36,1),box-shadow .3s ease,opacity .5s ease;'
    + 'animation:waIn .6s cubic-bezier(.22,.61,.36,1) .5s forwards;}'
    + '@media (max-width:520px){.wa-fab{width:56px;height:56px;}}'
    + '@keyframes waIn{to{opacity:1;transform:translateY(0) scale(1);}}'
    + '.wa-fab::after{content:"";position:absolute;inset:0;border-radius:50%;box-shadow:0 0 0 0 rgba(37,211,102,.45);animation:waPulse 2.6s ease-out infinite;}'
    + '@keyframes waPulse{0%{box-shadow:0 0 0 0 rgba(37,211,102,.4);}70%{box-shadow:0 0 0 16px rgba(37,211,102,0);}100%{box-shadow:0 0 0 0 rgba(37,211,102,0);}}'
    + '.wa-fab:hover,.wa-fab:focus-visible{transform:translateY(-3px) scale(1.06);box-shadow:0 20px 42px -10px rgba(28,171,82,.68),0 0 0 8px rgba(37,211,102,.16);}'
    + '.wa-fab:focus-visible{outline:3px solid #fff;outline-offset:3px;}'
    + '.wa-fab:active{transform:translateY(-1px) scale(.98);}'
    + '.wa-ico{position:relative;z-index:1;pointer-events:none;}'
    + '@media (prefers-reduced-motion:reduce){.wa-fab{animation:none;opacity:1;transform:none;}.wa-fab::after{animation:none;}.wa-fab:hover{transform:none;}}'
    // tooltip (desktop hover)
    + '.wa-tip{position:absolute;right:74px;top:50%;transform:translateY(-50%) translateX(6px);white-space:nowrap;'
    + 'background:#3A2E29;color:#FBF3EC;font-size:13px;font-weight:600;padding:8px 14px;border-radius:10px;'
    + 'box-shadow:0 10px 24px -12px rgba(58,46,41,.5);opacity:0;visibility:hidden;transition:.2s ease;pointer-events:none;}'
    + '.wa-tip::after{content:"";position:absolute;right:-5px;top:50%;transform:translateY(-50%) rotate(45deg);width:10px;height:10px;background:#3A2E29;}'
    + '.wa-fab:hover .wa-tip,.wa-fab:focus-visible .wa-tip{opacity:1;visibility:visible;transform:translateY(-50%) translateX(0);}'
    + '@media (max-width:820px){.wa-tip{display:none;}}'
    // welcome bubble
    + '.wa-welcome{position:relative;max-width:270px;background:#fff;color:#3A2E29;border:1px solid rgba(183,154,107,.28);'
    + 'border-radius:16px;padding:16px 18px 15px;box-shadow:0 24px 50px -20px rgba(58,46,41,.4);'
    + 'opacity:0;transform:translateY(10px) scale(.96);transform-origin:bottom right;transition:.3s cubic-bezier(.22,.61,.36,1);pointer-events:none !important;}'
    + '.wa-welcome.show{opacity:1;transform:translateY(0) scale(1);pointer-events:auto !important;}'
    + '.wa-welcome h4{margin:0 0 5px;font-family:"Prata",Georgia,serif;font-weight:400;font-size:16px;color:#3A2E29;}'
    + '.wa-welcome p{margin:0;font-size:13px;line-height:1.55;color:#6B5A52;}'
    + '.wa-welcome::after{content:"";position:absolute;right:22px;bottom:-8px;width:16px;height:16px;background:#fff;border-right:1px solid rgba(183,154,107,.28);border-bottom:1px solid rgba(183,154,107,.28);transform:rotate(45deg);}'
    + '.wa-welcome-x{position:absolute;top:8px;right:10px;background:none;border:none;color:#B0A198;font-size:18px;line-height:1;cursor:pointer;padding:2px 6px;border-radius:6px;min-width:28px;min-height:28px;}'
    + '.wa-welcome-x:hover{color:#8F5545;}'
    + '.wa-welcome-x:focus-visible{outline:2px solid #A96A58;outline-offset:1px;}'
    + '@media (prefers-reduced-motion:reduce){.wa-welcome{transition:none;}}';

  // ---- Build DOM ----------------------------------------------------------
  function el(html) { var d = document.createElement('div'); d.innerHTML = html.trim(); return d.firstChild; }

  function init() {
    if (document.getElementById('waRoot')) return;

    var style = document.createElement('style');
    style.id = 'waStyles';
    style.textContent = CSS;
    document.head.appendChild(style);

    var welcome = CONFIG.welcome.enabled
      ? '<div class="wa-welcome" id="waWelcome" role="status" aria-live="polite">' +
          '<button class="wa-welcome-x" id="waWelcomeX" type="button" aria-label="Dismiss welcome message">×</button>' +
          '<h4>' + CONFIG.welcome.title + '</h4><p>' + CONFIG.welcome.body + '</p>' +
        '</div>'
      : '';

    // The FAB is a real link → opens WhatsApp with the message pre-filled.
    var root = el(
      '<div class="wa-root" id="waRoot">' + welcome +
        '<a class="wa-fab" id="waFab" href="' + WA_URL + '" target="_blank" rel="noopener" aria-label="' + CONFIG.tooltip + '">' +
          ICON + '<span class="wa-tip" role="tooltip">' + CONFIG.tooltip + '</span>' +
        '</a>' +
      '</div>'
    );
    document.body.appendChild(root);

    document.getElementById('waFab').addEventListener('click', dismissWelcome);

    // welcome bubble (first visit only)
    if (CONFIG.welcome.enabled) {
      var w = document.getElementById('waWelcome');
      var seen; try { seen = localStorage.getItem(SEEN_KEY); } catch (e) {}
      if (!seen) {
        setTimeout(function () { w.classList.add('show'); }, CONFIG.welcome.delayMs);
        setTimeout(function () { w.classList.remove('show'); }, CONFIG.welcome.delayMs + 9000); // auto-hide
      }
      document.getElementById('waWelcomeX').addEventListener('click', function (e) { e.stopPropagation(); dismissWelcome(); });
    }
    function dismissWelcome() {
      var w = document.getElementById('waWelcome');
      if (w) w.classList.remove('show');
      try { localStorage.setItem(SEEN_KEY, '1'); } catch (e) {}
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
