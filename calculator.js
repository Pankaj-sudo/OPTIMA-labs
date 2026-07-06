/* ================================================================
   OPTIMA LABS — Peptide Dose Calculator (shared module)
   Renders + wires the calculator wherever a #calculator section
   with the expected element ids exists (homepage + /calculator).
   ================================================================ */
(function () {
  var DOSES     = [0.1, 0.25, 0.5, 1, 2, 2.5, 5, 7.5, 10, 12.5, 15];
  var STRENGTHS = [1, 5, 10, 15, 20, 50];
  var DILUENTS  = [0.5, 1.0, 1.5, 2.0, 2.5, 3.0];

  // Current values (defaults mirror a classic reconstitution: 5mg dose, 25mg vial, 2mL).
  var state = { dose: 5, strength: 25, diluent: 2.0 };

  var UX = 7.5; // svg px per unit (0u @ x=150, 100u @ x=900)

  var groups = {
    dose:     { values: DOSES,     pills: 'pillsDose',     field: 'fieldDose',     input: 'inDose',     preset: 5   },
    strength: { values: STRENGTHS, pills: 'pillsStrength', field: 'fieldStrength', input: 'inStrength', preset: null },
    diluent:  { values: DILUENTS,  pills: 'pillsDiluent',  field: 'fieldDiluent',  input: 'inDiluent',  preset: 2.0 }
  };

  function fmt(n) {
    if (!isFinite(n)) return '—';
    var r = Math.round(n * 100) / 100;
    return (Math.round(r * 10) / 10).toString();
  }
  function el(id) { return document.getElementById(id); }
  function setVal(id, num, unit) {
    var node = el(id); if (!node) return;
    node.innerHTML = num + (unit ? '<small>' + unit + '</small>' : '');
  }

  // ---- Pills ------------------------------------------------------------
  function buildPills(key) {
    var g = groups[key], host = el(g.pills);
    if (!host) return;
    host.innerHTML = g.values.map(function (v) {
      var on = (g.preset !== null && v === g.preset);
      return '<button type="button" class="pill' + (on ? ' active' : '') +
             '" data-v="' + v + '" aria-pressed="' + (on ? 'true' : 'false') + '">' + v +
             (key === 'diluent' ? ' mL' : ' mg') + '</button>';
    }).join('');
    host.querySelectorAll('.pill').forEach(function (b) {
      b.addEventListener('click', function () {
        selectPill(key, parseFloat(b.dataset.v), b);
      });
    });
  }
  function clearPills(key) {
    el(groups[key].pills).querySelectorAll('.pill').forEach(function (p) {
      p.classList.remove('active'); p.setAttribute('aria-pressed', 'false');
    });
  }
  function selectPill(key, value, btn) {
    clearPills(key);
    btn.classList.add('active'); btn.setAttribute('aria-pressed', 'true');
    var f = el(groups[key].field); f.classList.remove('invalid');
    el(groups[key].input).value = '';           // pill wins → clear custom
    state[key] = value;
    recompute();
  }

  // ---- Custom inputs ----------------------------------------------------
  function wireInput(key) {
    var g = groups[key], input = el(g.input), field = el(g.field);
    if (!input) return;
    input.addEventListener('input', function () {
      var raw = input.value.trim();
      if (raw === '') { field.classList.remove('invalid'); return; } // ignore empty, keep last valid
      var v = parseFloat(raw);
      if (!isFinite(v) || v <= 0) { field.classList.add('invalid'); return; }
      field.classList.remove('invalid');
      clearPills(key);                            // custom wins → deactivate pills
      state[key] = v;
      recompute();
    });
  }

  // ---- Syringe ticks ----------------------------------------------------
  function buildTicks() {
    var g = el('syrTicks'); if (!g) return;
    var parts = '';
    for (var u = 0; u <= 100; u += 5) {
      var x = 150 + u * UX, major = (u % 10 === 0);
      parts += '<line x1="' + x + '" y1="' + (major ? 118 : 124) + '" x2="' + x +
               '" y2="134" stroke="#8F5545" stroke-opacity="' + (major ? '.55' : '.3') +
               '" stroke-width="' + (major ? 1.6 : 1) + '"/>';
      if (major) parts += '<text class="syr-tick-num" x="' + x + '" y="102" text-anchor="middle">' + u + '</text>';
    }
    g.innerHTML = parts;
  }

  // ---- Compute + render -------------------------------------------------
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function recompute() {
    var d = state.dose, s = state.strength, w = state.diluent;
    var ok = d > 0 && s > 0 && w > 0;
    var conc = ok ? s / w : 0;                 // mg/mL
    var vol  = (ok && conc > 0) ? d / conc : 0; // mL
    var units = vol * 100;                      // U-100

    setVal('sumDose', fmt(d), 'mg');
    setVal('sumStrength', fmt(s), 'mg');
    setVal('sumDil', fmt(w), 'mL');
    setVal('sumConc', ok ? fmt(conc) : '—', 'mg/mL');
    setVal('sumUnits', ok ? fmt(units) : '—', 'units');

    var clamped = Math.max(0, Math.min(100, units));
    var dx = clamped * UX;
    var fill = el('syrFill'), plunger = el('syrPlunger'), marker = el('syrMarker');
    fill.style.transform = 'scaleX(' + (clamped / 100) + ')';
    plunger.style.transform = 'translateX(' + dx + 'px)';
    marker.style.transform = 'translateX(' + dx + 'px)';
    el('syrMarkerText').textContent = ok ? fmt(units) : '0';

    var note = el('calcNoteText');
    if (ok && units > 100) note.textContent = 'That draw exceeds 100 units (1 mL) — use more diluent or split into two doses.';
    else if (!ok) note.textContent = 'Enter a dose, strength and diluent to see your draw.';
    else note.textContent = 'For research purposes only. Always follow your research protocol.';
  }

  document.addEventListener('DOMContentLoaded', function () {
    if (!el('calculator')) return;
    Object.keys(groups).forEach(function (k) { buildPills(k); wireInput(k); });
    // Seed the strength custom field (no matching pill for 25 mg).
    el('inStrength').value = '25';
    buildTicks();
    recompute();
  });
})();
