/* ================================================================
   OPTIMA LABS — Procedural vial artwork  (photoreal v2)
   window.vialArt(product, opts) → SVG string of a realistic squat
   10ml pharma vial: colored flip cap per category, aluminum crimp
   collar, clear glass with specular highlights, white wrap label
   carrying the product's own name / strength / purity / lot.
   Interactive styling (hover tilt, sheen sweep, liquid rise, idle
   float) lives in css/optima.css + index.html under ".vial-*".
   Used until real product photos are uploaded (imageURL wins).
   ================================================================ */
(function () {

  var CAT_COLORS = {
    'Weight Management': { main:'#C08D80', light:'#E8C4B9', deep:'#96604F' },
    'Recovery & Repair': { main:'#A96A58', light:'#D8A390', deep:'#7E4A3B' },
    'Metabolic':         { main:'#B79A6B', light:'#DEC69B', deep:'#8A7048' },
    'Skin & Beauty':     { main:'#B08A9E', light:'#DBBCCB', deep:'#84607A' },
    'Longevity':         { main:'#8FA08D', light:'#BECDB9', deep:'#647763' },
    'Sleep & Calm':      { main:'#8E9AB8', light:'#BFC8DD', deep:'#616F92' },
    'Intimacy':          { main:'#C98A94', light:'#EBBFC6', deep:'#9C5F6A' },
    'Supplies':          { main:'#8B9299', light:'#C2C8CE', deep:'#5F666D' }
  };

  /* Short label text for names too long for the band */
  var SHORT_NAMES = {
    'cjc-1295-w-o-dac-plus-ipamorelin': 'CJC + IPA',
    'bpc-157-plus-tb-500': 'BPC+TB500',
    'bacteriostatic-water': 'BAC WATER'
  };

  function esc(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  window.vialArt = function (p, opts) {
    opts = opts || {};
    var c = CAT_COLORS[p.category] || CAT_COLORS['Recovery & Repair'];
    var s = (p.slug || 'x').replace(/[^a-z0-9]/g, '');
    var label = SHORT_NAMES[p.slug] || p.name.toUpperCase();
    var n = label.length;
    var fs = n <= 8 ? 28 : n <= 11 ? 20 : n <= 14 ? 17 : 14.5;
    var doseMg = (p.dosageOptions && p.dosageOptions.length ? p.dosageOptions[0].mg : '')
      .toUpperCase().replace(/(\d)(MG|ML)/, '$1 $2');
    var lot = 'LOT OL-' + s.slice(0, 4).toUpperCase() + (p.name.length);
    var cls = 'vial-thumb' + (opts.float ? ' vial-float' : '');

    /* collar serration lines */
    var serr = '';
    for (var x = 74; x <= 186; x += 6) {
      serr += '<line x1="' + x + '" y1="63" x2="' + x + '" y2="99" stroke="#6d737a" stroke-opacity="0.28" stroke-width="1"/>';
    }

    return '' +
    '<svg class="' + cls + '" viewBox="0 0 260 385" role="img" aria-label="' + esc(p.name) + ' vial">' +
      '<defs>' +
        '<linearGradient id="cap-' + s + '" x1="0" y1="0" x2="1" y2="0">' +
          '<stop offset="0" stop-color="' + c.deep + '"/><stop offset="0.18" stop-color="' + c.main + '"/>' +
          '<stop offset="0.45" stop-color="' + c.light + '"/><stop offset="0.72" stop-color="' + c.main + '"/>' +
          '<stop offset="1" stop-color="' + c.deep + '"/>' +
        '</linearGradient>' +
        '<linearGradient id="alu-' + s + '" x1="0" y1="0" x2="1" y2="0">' +
          '<stop offset="0" stop-color="#878d94"/><stop offset="0.15" stop-color="#c9cdd2"/>' +
          '<stop offset="0.32" stop-color="#f4f6f8"/><stop offset="0.5" stop-color="#dfe3e7"/>' +
          '<stop offset="0.68" stop-color="#9aa1a8"/><stop offset="0.85" stop-color="#d5d9dd"/>' +
          '<stop offset="1" stop-color="#7d838a"/>' +
        '</linearGradient>' +
        '<linearGradient id="glass-' + s + '" x1="0" y1="0" x2="1" y2="0">' +
          '<stop offset="0" stop-color="#dfe4e8" stop-opacity="0.9"/><stop offset="0.07" stop-color="#ffffff" stop-opacity="0.95"/>' +
          '<stop offset="0.18" stop-color="#f2f5f7" stop-opacity="0.6"/><stop offset="0.5" stop-color="#eef1f3" stop-opacity="0.45"/>' +
          '<stop offset="0.82" stop-color="#e7ebee" stop-opacity="0.55"/><stop offset="0.93" stop-color="#ffffff" stop-opacity="0.9"/>' +
          '<stop offset="1" stop-color="#d5dade" stop-opacity="0.9"/>' +
        '</linearGradient>' +
        '<linearGradient id="lbl-' + s + '" x1="0" y1="0" x2="1" y2="0">' +
          '<stop offset="0" stop-color="#E2DAD4"/><stop offset="0.09" stop-color="#FBF8F6"/>' +
          '<stop offset="0.5" stop-color="#ffffff"/><stop offset="0.91" stop-color="#F7F2EE"/>' +
          '<stop offset="1" stop-color="#DDD4CD"/>' +
        '</linearGradient>' +
        '<linearGradient id="liq-' + s + '" x1="0" y1="0" x2="1" y2="0">' +
          '<stop offset="0" stop-color="' + c.light + '"/><stop offset="0.55" stop-color="' + c.main + '"/><stop offset="1" stop-color="' + c.deep + '"/>' +
        '</linearGradient>' +
        '<linearGradient id="swp-' + s + '" x1="0" y1="0" x2="1" y2="0">' +
          '<stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset="0.5" stop-color="#fff" stop-opacity="0.6"/>' +
          '<stop offset="1" stop-color="#fff" stop-opacity="0"/>' +
        '</linearGradient>' +
        '<clipPath id="clip-' + s + '">' +
          '<path d="M74,102 L74,114 C74,128 48,132 44,154 L44,340 Q44,374 78,374 L182,374 Q216,374 216,340 L216,154 C212,132 186,128 186,114 L186,102 Z"/>' +
        '</clipPath>' +
      '</defs>' +

      /* rubber stopper + colored plug, visible through the glass neck */
      '<rect x="78" y="100" width="104" height="18" rx="3" fill="#4a4f57"/>' +
      '<rect x="98" y="104" width="64" height="24" rx="4" fill="' + c.main + '" opacity="0.85"/>' +

      /* glass body */
      '<path d="M74,102 L74,114 C74,128 48,132 44,154 L44,340 Q44,374 78,374 L182,374 Q216,374 216,340 L216,154 C212,132 186,128 186,114 L186,102 Z"' +
        ' fill="url(#glass-' + s + ')" stroke="#b9c0c6" stroke-opacity="0.55" stroke-width="1"/>' +

      '<g clip-path="url(#clip-' + s + ')">' +
        /* liquid pool at the base (grouped so it can "rise" on hover) */
        '<g class="vial-liquid">' +
          '<rect x="44" y="338" width="172" height="40" fill="url(#liq-' + s + ')" opacity="0.55"/>' +
          '<ellipse cx="130" cy="338" rx="84" ry="5" fill="#fff" opacity="0.5"/>' +
        '</g>' +
        /* thick glass base */
        '<ellipse cx="130" cy="369" rx="80" ry="7" fill="#fff" opacity="0.35"/>' +
        '<rect x="44" y="360" width="172" height="4" fill="#fff" opacity="0.25"/>' +

        /* wrap label */
        '<rect x="44" y="150" width="172" height="186" fill="url(#lbl-' + s + ')"/>' +
        '<circle cx="64" cy="171" r="4.6" fill="#C08D80"/><circle cx="72.5" cy="165.5" r="3.1" fill="#B79A6B"/>' +
        '<circle cx="73" cy="176.5" r="2.6" fill="#A96A58"/>' +
        '<text x="82" y="175.5" font-family="Mulish,sans-serif" font-size="12.5" font-weight="700" letter-spacing="0.6" fill="#3A2E29">OPTIMA' +
          '<tspan font-size="9" font-weight="600" fill="#A96A58" dx="3">LABS</tspan></text>' +
        '<line x1="58" y1="186" x2="202" y2="186" stroke="#E8DDD6" stroke-width="1"/>' +
        '<text x="130" y="' + (206 + fs * 0.38) + '" text-anchor="middle" font-family="Mulish,sans-serif" font-weight="800" font-size="' + fs + '" letter-spacing="0.4" fill="#2E2622">' + esc(label) + '</text>' +
        '<rect x="58" y="230" width="144" height="4.5" rx="2.2" fill="' + c.main + '"/>' +
        (doseMg
          ? '<rect x="92" y="244" width="76" height="27" rx="6" fill="' + c.main + '"/>' +
            '<text x="130" y="262.5" text-anchor="middle" font-family="Mulish,sans-serif" font-size="14.5" font-weight="800" letter-spacing="1.3" fill="#ffffff">' + esc(doseMg) + '</text>'
          : '') +
        '<text x="130" y="293" text-anchor="middle" font-family="Mulish,sans-serif" font-size="10.5" font-weight="700" letter-spacing="0.6" fill="#5C4C44">PURITY <tspan fill="#8A7568">&gt;99% HPLC</tspan></text>' +
        '<text x="130" y="309" text-anchor="middle" font-family="Mulish,sans-serif" font-size="8.5" font-weight="600" letter-spacing="1.4" fill="#9B8B81">THIRD-PARTY TESTED</text>' +
        '<text x="130" y="326" text-anchor="middle" font-family="Mulish,sans-serif" font-size="7.5" letter-spacing="1.6" fill="#BCAEA5">' + lot + '</text>' +

        /* glass reflections over the label (wrap realism) */
        '<rect x="52" y="104" width="12" height="268" rx="6" fill="#fff" opacity="0.5"/>' +
        '<rect x="66" y="108" width="4" height="262" rx="2" fill="#fff" opacity="0.35"/>' +
        '<rect x="198" y="112" width="8" height="256" rx="4" fill="#fff" opacity="0.3"/>' +
        '<rect x="46" y="140" width="2.5" height="226" fill="#7c848b" opacity="0.22"/>' +
        '<rect x="211" y="140" width="2.5" height="226" fill="#7c848b" opacity="0.2"/>' +

        /* hover sheen sweep */
        '<rect class="vial-sweep" x="12" y="90" width="62" height="300" fill="url(#swp-' + s + ')" transform="skewX(-12)"/>' +
      '</g>' +

      /* shoulder reflections */
      '<path d="M56,148 Q130,134 204,148" stroke="#fff" stroke-width="2.2" fill="none" opacity="0.75" stroke-linecap="round"/>' +
      '<path d="M62,160 Q130,149 198,160" stroke="#fff" stroke-width="1.3" fill="none" opacity="0.4" stroke-linecap="round"/>' +

      /* aluminum crimp collar */
      '<rect x="68" y="60" width="124" height="42" rx="3" fill="url(#alu-' + s + ')"/>' +
      serr +
      '<rect x="68" y="60" width="124" height="3.5" rx="1.7" fill="#fff" opacity="0.65"/>' +
      '<rect x="68" y="97" width="124" height="5" fill="#70767d"/>' +

      /* colored flip cap */
      '<rect x="66" y="44" width="128" height="16" rx="5" fill="url(#cap-' + s + ')"/>' +
      '<rect x="66" y="55" width="128" height="5" fill="#000" opacity="0.18"/>' +
      '<rect x="72" y="8" width="116" height="42" rx="10" fill="url(#cap-' + s + ')"/>' +
      '<ellipse cx="130" cy="14" rx="48" ry="7.5" fill="#fff" opacity="0.35"/>' +
      '<rect x="80" y="12" width="8" height="30" rx="4" fill="#fff" opacity="0.3"/>' +
    '</svg>';
  };
})();
