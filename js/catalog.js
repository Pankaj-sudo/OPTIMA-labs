/* ================================================================
   OPTIMA LABS — Catalogue page controller
   Reads from the static window.PRODUCTS_DATA (see products-data.js),
   renders grid, filters by category + name search without reload,
   empty state when nothing matches.
   To switch back to a live Firestore fetch later: replace load()'s
   body with the fbDb.collection('products').get() call and keep
   everything else (same product shape) unchanged.
   ================================================================ */
(function () {
  var grid, tabsEl, searchEl, countEl;
  var ALL = [];
  var state = { cat: 'All', q: '' };

  function doseTags(opts) {
    return (opts || []).slice(0, 5).map(function (o) {
      return '<span class="dose-tag">' + o.mg + '</span>';
    }).join('');
  }

  function cardHTML(p) {
    var lowest = Math.min.apply(null, (p.dosageOptions || [{ price: p.price }]).map(function (o) { return o.price; }));
    var multi = (p.dosageOptions || []).length > 1;
    var badges = '';
    if (p.verified)  badges += '<span class="badge badge-verified">✓ Verified</span>';
    if (!p.inStock)  badges += '<span class="badge badge-oos">Out of stock</span>';
    var art = p.imageURL
      ? '<img src="' + p.imageURL + '" alt="' + p.name + '" loading="lazy">'
      : window.vialArt(p);

    return '<a class="card' + (p.inStock ? '' : ' out') + '" href="product.html?slug=' + encodeURIComponent(p.slug) + '">' +
      '<div class="card-art">' + (badges ? '<div class="card-badges">' + badges + '</div>' : '') + art + '</div>' +
      '<div class="card-body">' +
        '<div class="card-cat">' + p.category + '</div>' +
        '<div class="card-name">' + p.name + '</div>' +
        '<div class="card-desc">' + (p.description || '') + '</div>' +
        '<div class="card-dose-row">' + doseTags(p.dosageOptions) + '</div>' +
        '<div class="card-foot">' +
          '<span class="price">' + (multi ? '<span class="from">from</span>' : '') + fmtPHP(lowest) + '</span>' +
        '</div>' +
        '<span class="btn btn-primary btn-sm card-cta btn-block">' + (p.inStock ? 'View Product' : 'Out of stock') + '</span>' +
      '</div>' +
    '</a>';
  }

  function apply() {
    var q = state.q.trim().toLowerCase();
    var list = ALL.filter(function (p) {
      var okCat = state.cat === 'All' || p.category === state.cat;
      var okQ = !q || p.name.toLowerCase().indexOf(q) > -1;
      return okCat && okQ;
    });
    countEl.textContent = list.length + (list.length === 1 ? ' product' : ' products');
    if (!list.length) {
      grid.innerHTML = '<div class="empty">' +
        '<svg width="46" height="46" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4"><circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16.6" y2="16.6"/></svg>' +
        '<h3>Nothing here just yet</h3>' +
        '<p>No products match your search. Try another name or category.</p>' +
        '<button class="btn btn-ghost btn-sm" id="resetFilters" style="margin-top:20px;">Show all products</button></div>';
      var rb = document.getElementById('resetFilters');
      if (rb) rb.addEventListener('click', resetFilters);
      return;
    }
    grid.innerHTML = list.map(cardHTML).join('');
  }

  function resetFilters() {
    state.cat = 'All'; state.q = '';
    if (searchEl) searchEl.value = '';
    renderTabs();
    apply();
  }

  function renderTabs() {
    var cats = ['All'].concat(window.CATEGORIES);
    tabsEl.innerHTML = cats.map(function (c) {
      return '<button class="tab' + (c === state.cat ? ' active' : '') + '" data-cat="' + c + '">' + c + '</button>';
    }).join('');
    tabsEl.querySelectorAll('.tab').forEach(function (b) {
      b.addEventListener('click', function () {
        state.cat = b.dataset.cat;
        tabsEl.querySelectorAll('.tab').forEach(function (x) { x.classList.remove('active'); });
        b.classList.add('active');
        apply();
      });
    });
  }

  function load() {
    ALL = window.PRODUCTS_DATA.slice().sort(function (a, b) { return a.name.localeCompare(b.name); });
    // Deep-link a category via ?cat=
    var cat = new URLSearchParams(location.search).get('cat');
    if (cat && window.CATEGORIES.indexOf(cat) > -1) {
      state.cat = cat;
      renderTabs();
    }
    apply();
  }

  document.addEventListener('DOMContentLoaded', function () {
    grid = document.getElementById('grid');
    tabsEl = document.getElementById('tabs');
    searchEl = document.getElementById('search');
    countEl = document.getElementById('resultCount');
    if (!grid) return;
    renderTabs();
    var t;
    searchEl.addEventListener('input', function () {
      clearTimeout(t);
      t = setTimeout(function () { state.q = searchEl.value; apply(); }, 160);
    });
    load();
  });
})();
