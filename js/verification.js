/* ================================================================
   OPTIMA LABS — Lab Verification page controller
   Renders the COA grid from window.COA_DATA, with search + category
   filters and a certificate detail modal (embedded PDF when available
   + a button to the original Janoshik verification link).
   ================================================================ */
(function () {
  var grid, searchEl, catEl, countEl, ALL = [];
  var state = { q: '', cat: 'All' };

  function esc(s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
  function art(c) { return (window.vialArt ? window.vialArt({ name: c.name, category: c.category, slug: c.slug }) : ''); }

  var CHECK = '<svg class="coa-vchk" viewBox="0 0 20 20" fill="none" aria-hidden="true"><circle cx="10" cy="10" r="9" fill="var(--clay)"/><path d="M6 10.4l2.6 2.6 5-5.2" stroke="#fff" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>';

  function row(label, val) {
    if (!val) return '';
    return '<div class="coa-row"><span class="coa-k">' + label + '</span><span class="coa-v">' + esc(val) + '</span></div>';
  }

  function cardHTML(c) {
    return '<article class="coa-card" data-slug="' + esc(c.slug) + '">' +
      '<div class="coa-art">' + art(c) + '</div>' +
      '<div class="coa-info">' +
        '<h3 class="coa-name">' + esc(c.name) + (c.dosage ? ' <span class="coa-dose">' + esc(c.dosage) + '</span>' : '') + '</h3>' +
        '<div class="coa-verified">Janoshik Verified' + CHECK + '</div>' +
        '<div class="coa-rows">' +
          row('Purity', c.purity) + row('Batch', c.batch) + row('Tested', c.tested) +
        '</div>' +
        '<button class="btn btn-ghost btn-sm coa-view" data-slug="' + esc(c.slug) + '">View COA ' +
          '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M14 4h6v6M20 4l-9 9M18 13v5a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h5"/></svg>' +
        '</button>' +
      '</div>' +
    '</article>';
  }

  function apply() {
    var q = state.q.trim().toLowerCase();
    var list = ALL.filter(function (c) {
      var okCat = state.cat === 'All' || c.category === state.cat;
      var okQ = !q || (c.name + ' ' + (c.batch || '')).toLowerCase().indexOf(q) > -1;
      return okCat && okQ;
    });
    countEl.textContent = list.length + (list.length === 1 ? ' certificate' : ' certificates');
    if (!list.length) {
      grid.innerHTML = '<div class="empty"><h3>No certificates found</h3><p>Try another peptide name or category.</p></div>';
      return;
    }
    grid.innerHTML = list.map(cardHTML).join('');
    grid.querySelectorAll('.coa-view').forEach(function (b) {
      b.addEventListener('click', function () { openModal(b.dataset.slug); });
    });
  }

  /* ---------- modal ---------- */
  var modal, lastFocus = null;
  function buildModal() {
    modal = document.createElement('div');
    modal.className = 'coa-overlay';
    modal.id = 'coaModal';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    modal.setAttribute('aria-labelledby', 'coaMTitle');
    modal.hidden = true;
    modal.innerHTML =
      '<div class="coa-modal">' +
        '<button class="coa-mclose" id="coaMClose" aria-label="Close certificate">&times;</button>' +
        '<div class="coa-mgrid">' +
          '<div class="coa-mside">' +
            '<div class="coa-mart" id="coaMArt"></div>' +
            '<div class="coa-verified" style="justify-content:center;margin-top:14px;">Janoshik Verified' + CHECK + '</div>' +
            '<div class="coa-mmeta" id="coaMMeta"></div>' +
          '</div>' +
          '<div class="coa-mmain">' +
            '<div class="coa-meyebrow">Certificate of Analysis</div>' +
            '<h2 id="coaMTitle"></h2>' +
            '<div class="coa-mlab" id="coaMLab"></div>' +
            '<div class="coa-mpreview" id="coaMPreview"></div>' +
            '<div class="coa-mactions" id="coaMActions"></div>' +
          '</div>' +
        '</div>' +
      '</div>';
    document.body.appendChild(modal);
    document.getElementById('coaMClose').addEventListener('click', closeModal);
    modal.addEventListener('click', function (e) { if (e.target === modal) closeModal(); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !modal.hidden) closeModal(); });
  }

  function openModal(slug) {
    var c = ALL.find(function (x) { return x.slug === slug; });
    if (!c) return;
    lastFocus = document.activeElement;
    document.getElementById('coaMArt').innerHTML = art(c);
    document.getElementById('coaMTitle').textContent = c.name + (c.dosage ? ' · ' + c.dosage : '');
    document.getElementById('coaMLab').innerHTML =
      '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M9 3h6M10 3v6l-4.2 7.5A2 2 0 0 0 7.6 20h8.8a2 2 0 0 0 1.8-3.5L14 9V3"/></svg>' +
      'Tested by <b>' + esc(c.lab || 'Janoshik Analytical') + '</b>';
    document.getElementById('coaMMeta').innerHTML =
      row('Category', c.category) + row('Purity', c.purity) + row('Batch No.', c.batch) + row('Test Date', c.tested);

    // certificate preview: embed PDF if provided, else a graceful placeholder
    var pv = document.getElementById('coaMPreview');
    if (c.coaURL && /\.pdf($|\?)/i.test(c.coaURL)) {
      pv.innerHTML = '<iframe title="Certificate of Analysis for ' + esc(c.name) + '" src="' + esc(c.coaURL) + '#toolbar=0&view=FitH" loading="lazy"></iframe>';
    } else if (c.coaURL) {
      pv.innerHTML = '<div class="coa-mph"><p>The full certificate opens in a new tab.</p><a class="btn btn-ghost btn-sm" href="' + esc(c.coaURL) + '" target="_blank" rel="noopener">Open certificate ↗</a></div>';
    } else {
      pv.innerHTML = '<div class="coa-mph">' +
        '<svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.3"><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5M9 13h6M9 16h4"/></svg>' +
        '<p>The full laboratory report for this batch is available on request. Contact our team or open the Janoshik verification below.</p></div>';
    }

    // actions: Janoshik verification link (new tab) + contact
    var jan = c.janoshikURL || 'https://janoshik.com/';
    document.getElementById('coaMActions').innerHTML =
      '<a class="btn btn-primary" href="' + esc(jan) + '" target="_blank" rel="noopener">Open Janoshik Verification ' +
        '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" style="margin-left:2px;"><path d="M14 4h6v6M20 4l-9 9M18 13v5a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h5"/></svg></a>' +
      '<a class="btn btn-ghost" href="mailto:care@optimalabs.co?subject=COA%20request%20—%20' + encodeURIComponent(c.name) + '">Request full report</a>';

    modal.hidden = false;
    document.body.style.overflow = 'hidden';
    document.getElementById('coaMClose').focus();
    // reflect in URL for shareable deep links (no reload)
    try { history.replaceState(null, '', '?coa=' + encodeURIComponent(slug)); } catch (e) {}
  }
  function closeModal() {
    modal.hidden = true;
    document.body.style.overflow = '';
    if (lastFocus && lastFocus.focus) lastFocus.focus();
    try { history.replaceState(null, '', location.pathname); } catch (e) {}
  }

  document.addEventListener('DOMContentLoaded', function () {
    grid = document.getElementById('coaGrid');
    searchEl = document.getElementById('coaSearch');
    catEl = document.getElementById('coaCat');
    countEl = document.getElementById('coaCount');
    if (!grid) return;

    ALL = (window.COA_DATA || []).slice().sort(function (a, b) { return a.name.localeCompare(b.name); });

    // category options
    (window.CATEGORIES || []).forEach(function (cat) {
      if (ALL.some(function (c) { return c.category === cat; })) {
        var o = document.createElement('option'); o.value = cat; o.textContent = cat; catEl.appendChild(o);
      }
    });

    buildModal();

    var t;
    searchEl.addEventListener('input', function () { clearTimeout(t); t = setTimeout(function () { state.q = searchEl.value; apply(); }, 140); });
    catEl.addEventListener('change', function () { state.cat = catEl.value; apply(); });

    apply();

    // deep link: ?coa=slug opens that certificate
    var want = new URLSearchParams(location.search).get('coa');
    if (want) openModal(want);
  });
})();
