/* ================================================================
   OPTIMA LABS — Product detail page controller
   Loads one product by ?slug=, renders dosage selector with
   price-per-option, COA link, add-to-cart, and related products.
   ================================================================ */
(function () {
  var product = null, selected = null, qty = 1, ALL = [];

  /* ---- Package options ("Complete Your Ritual") ---------------------------
     addon = amount added to the chosen strength price. One is always active. */
  var PACKAGES = [
    { id: 'peptide-only',  name: 'Peptide Only',                    sub: 'Lyophilized vial only',                        badge: 'Base Package',    addon: 0 },
    { id: 'bac-water',     name: 'Peptide + Bacteriostatic Water',  sub: 'Includes sterile bacteriostatic water',        badge: 'Most Popular',    addon: 300 },
    { id: 'essential-kit', name: 'Essential Kit',                   sub: 'Peptide + Disposable Injection Pen',           badge: 'Budget Friendly', addon: 500 },
    { id: 'pro-kit',       name: 'Elite Kit',                       sub: 'Peptide + Premium Reusable Injection Pen',     badge: 'Premium',         addon: 1000 }
  ];
  var selectedPkg = PACKAGES[0];

  /* Delivery rule: injection-pen kits ship within Metro Manila only. When the
     shopper says they're not in Metro Manila, only vial options are offered. */
  var PEN_IDS = ['pro-kit', 'essential-kit'];
  var pkgMM = true;   // "Are you in Metro Manila?" → Yes (default) shows pen kits too
  function availablePkgs() {
    return pkgMM ? PACKAGES.slice() : PACKAGES.filter(function (p) { return PEN_IDS.indexOf(p.id) < 0; });
  }

  /* Refined line-art icons (Rose & Porcelain), one per package. currentColor
     so they invert to white inside the accent-filled tile when selected. */
  var S = '<svg class="pkg-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">';
  var PKG_ICONS = {
    // lab vial — Peptide Only
    'peptide-only': S + '<path d="M9 2.75h6"/><path d="M10 2.75v14.75a2 2 0 0 0 4 0V2.75"/><path d="M10 12h4"/><path d="M10.6 15h2.8"/></svg>',
    // water droplet — Reconstitution Kit
    'bac-water':    S + '<path d="M12 3.2c2.9 3.4 5.4 6.2 5.4 9.3a5.4 5.4 0 0 1-10.8 0C6.6 9.4 9.1 6.6 12 3.2Z"/><path d="M9.6 12.9a2.6 2.6 0 0 0 2.1 2.5"/></svg>',
    // injection pen — Professional Kit
    'pro-kit':      S + '<rect x="8.6" y="2.5" width="6.8" height="4.3" rx="1.5"/><path d="M8.6 6.8h6.8v8.6a2.1 2.1 0 0 1-2.1 2.1h-2.6a2.1 2.1 0 0 1-2.1-2.1Z"/><path d="M10.7 10.6h2.6"/><path d="M12 17.5v3"/></svg>',
    // syringe — Essential Kit
    'essential-kit':S + '<path d="m18 2 4 4"/><path d="m17 7 3-3"/><path d="M19 9 8.7 19.3a2.4 2.4 0 0 1-3.4 0l-.6-.6a2.4 2.4 0 0 1 0-3.4L15 5"/><path d="m9 11 4 4"/><path d="m5 19-2.5 2.5"/></svg>'
  };

  function fallbackArt(p, opts) {
    return window.vialArt(p, opts);
  }

  // --- DynamicPriceDisplay: base(strength/sale) + package add-on = final ---
  function basePrice()  { return (product && product.saleActive && product.salePrice > 0) ? product.salePrice : (selected ? selected.price : 0); }
  function finalPrice() { return basePrice() + (selectedPkg ? (selectedPkg.addon || 0) : 0); }
  function updatePrice() {
    var pd = document.getElementById('detailPrice');
    if (pd) pd.innerHTML = fmtPHP(finalPrice()) +
      (product.compareAtPrice ? ' <s class="price-was">' + fmtPHP(product.compareAtPrice) + '</s>' : '');
    var note = document.getElementById('priceNote');
    if (note) note.textContent = (selectedPkg && selectedPkg.addon > 0)
      ? 'Base ' + fmtPHP(basePrice()) + '  ·  ' + selectedPkg.badge + ' + ' + fmtPHP(selectedPkg.addon) : '';
  }

  // --- PackageOptionCard (keyed by package id so options can be filtered) ---
  function packageCardHTML(p) {
    var sel = selectedPkg && p.id === selectedPkg.id;
    var price = p.addon > 0
      ? '<span class="pkg-price">+ ' + fmtPHP(p.addon) + '</span>'
      : '<span class="pkg-price free">Included</span>';
    return '<div class="pkg-card' + (sel ? ' sel' : '') + '" role="radio" data-id="' + p.id + '"' +
        ' tabindex="' + (sel ? '0' : '-1') + '" aria-checked="' + (sel ? 'true' : 'false') + '"' +
        ' aria-label="' + p.name + ', ' + (p.addon > 0 ? 'add ' + fmtPHP(p.addon) : 'included') + '">' +
      '<span class="pkg-radio" aria-hidden="true"></span>' +
      '<span class="pkg-ico-tile" aria-hidden="true">' + (PKG_ICONS[p.id] || '') + '</span>' +
      '<div class="pkg-main"><div class="pkg-title-row"><span class="pkg-title">' + p.name + '</span>' +
        '<span class="pkg-badge' + (p.id === 'bac-water' ? ' pop' : '') + '">' + p.badge + '</span></div>' +
        '<div class="pkg-sub">' + p.sub + '</div></div>' + price +
    '</div>';
  }

  // --- ProductPackageSelector (radio-group behaviour) ---
  function selectPackage(id) {
    var p = PACKAGES.filter(function (x) { return x.id === id; })[0]; if (!p) return;
    selectedPkg = p;
    document.querySelectorAll('#pkgGrid .pkg-card').forEach(function (c) {
      var on = c.dataset.id === id;
      c.classList.toggle('sel', on);
      c.setAttribute('aria-checked', on ? 'true' : 'false');
      c.tabIndex = on ? 0 : -1;
    });
    updatePrice();
  }
  function renderPkgGrid() {
    var grid = document.getElementById('pkgGrid'); if (!grid) return;
    grid.innerHTML = availablePkgs().map(packageCardHTML).join('');
    wirePackages();
  }
  function wirePackages() {
    var cards = [].slice.call(document.querySelectorAll('#pkgGrid .pkg-card'));
    cards.forEach(function (c, idx) {
      var id = c.dataset.id;
      c.addEventListener('click', function () { selectPackage(id); });
      c.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); selectPackage(id); }
        else if (e.key === 'ArrowDown' || e.key === 'ArrowRight') { e.preventDefault(); var n = (idx + 1) % cards.length; selectPackage(cards[n].dataset.id); cards[n].focus(); }
        else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') { e.preventDefault(); var n = (idx - 1 + cards.length) % cards.length; selectPackage(cards[n].dataset.id); cards[n].focus(); }
      });
    });
  }
  // Metro-Manila toggle → re-filter the pen/vial options
  function wireMM() {
    var opts = [].slice.call(document.querySelectorAll('#pkgMM .pkg-mm-opt'));
    opts.forEach(function (b) {
      b.addEventListener('click', function () {
        pkgMM = b.dataset.mm === 'yes';
        opts.forEach(function (x) { var on = x === b; x.classList.toggle('sel', on); x.setAttribute('aria-checked', on ? 'true' : 'false'); });
        if (!pkgMM && PEN_IDS.indexOf(selectedPkg.id) >= 0) selectedPkg = PACKAGES[0];  // reset to a vial option
        renderPkgGrid();
        var note = document.getElementById('pkgMMNote'); if (note) note.hidden = pkgMM;
        updatePrice();
      });
    });
  }

  function render() {
    var root = document.getElementById('detail');
    var opts = product.dosageOptions && product.dosageOptions.length
      ? product.dosageOptions : [{ mg: '—', price: product.price }];
    selected = opts[0];
    selectedPkg = PACKAGES[0];
    pkgMM = true;   // fresh render → default to "in Metro Manila" (markup shows Yes selected)

    root.innerHTML =
      '<nav class="breadcrumb"><a href="index.html">Home</a><span class="sep">›</span>' +
      '<a href="products.html">Shop</a><span class="sep">›</span>' +
      '<a href="products.html?cat=' + encodeURIComponent(product.category) + '">' + product.category + '</a>' +
      '<span class="sep">›</span><span>' + product.name + '</span></nav>' +
      '<div class="detail-grid">' +
        '<div class="detail-art">' + (product.imageURL ? '<img src="' + product.imageURL + '" alt="' + product.name + '">' : fallbackArt(product, { float: true })) + '</div>' +
        '<div class="detail-info">' +
          '<div class="cat">' + product.category + '</div>' +
          '<h1>' + product.name + '</h1>' +
          '<div class="detail-price' + (product.saleActive ? ' on-sale' : '') + '" id="detailPrice" aria-live="polite">' +
            fmtPHP(finalPrice()) +
            (product.compareAtPrice ? ' <s class="price-was">' + fmtPHP(product.compareAtPrice) + '</s>' : '') +
          '</div>' +
          '<div class="price-note" id="priceNote"></div>' +
          '<div class="stock-line stock-' + product.stockStatus + '">' +
            (product.stockStatus === 'out_of_stock' ? 'Out of stock'
              : product.stockStatus === 'low_stock' ? 'Low stock — order soon' : 'In stock') +
          '</div>' +
          '<div class="detail-desc">' + (product.description || '') + '</div>' +
          '<div class="opt-label" id="doseLabel">Select strength</div>' +
          '<div class="dose-options" id="doseOptions" role="group" aria-labelledby="doseLabel">' +
            opts.map(function (o, i) {
              return '<button class="dose-opt' + (i === 0 ? ' active' : '') + '" data-i="' + i + '" aria-pressed="' + (i === 0 ? 'true' : 'false') + '">' +
                '<span>' + o.mg + '</span><span class="dp">' + fmtPHP(o.price) + '</span></button>';
            }).join('') +
          '</div>' +
          '<div class="qty-row">' +
            '<div class="qty"><button id="qMinus" type="button" aria-label="Decrease quantity">−</button><span id="qVal" aria-live="polite">1</span><button id="qPlus" type="button" aria-label="Increase quantity">+</button></div>' +
            (product.inStock === false ? '<span style="color:var(--ink-soft);font-weight:600;">Currently out of stock</span>' : '') +
          '</div>' +
          (product.noPackages ? '' :
          '<section class="ritual-section" aria-labelledby="ritualTitle">' +
            '<div class="ritual-head"><h2 id="ritualTitle">Complete Your Ritual</h2>' +
              '<p>Choose how you would like your peptide prepared before adding it to your ritual.</p></div>' +
            '<div class="pkg-mm" id="pkgMM" role="radiogroup" aria-label="Are you currently located in Metro Manila?">' +
              '<span class="pkg-mm-label">Are you currently located in Metro Manila?</span>' +
              '<div class="pkg-mm-opts">' +
                '<button type="button" class="pkg-mm-opt sel" data-mm="yes" role="radio" aria-checked="true">Yes</button>' +
                '<button type="button" class="pkg-mm-opt" data-mm="no" role="radio" aria-checked="false">No</button>' +
              '</div>' +
            '</div>' +
            '<div class="pkg-mm-note" id="pkgMMNote" hidden>' +
              '<svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.6"><circle cx="10" cy="10" r="8"/><path d="M10 9v5M10 6.2v.2" stroke-linecap="round"/></svg>' +
              '<span>Injection pen kits currently deliver within Metro Manila only, so we\'re showing vial options for your location.</span></div>' +
            '<div class="pkg-grid" id="pkgGrid" role="radiogroup" aria-label="Package options">' +
              availablePkgs().map(packageCardHTML).join('') +
            '</div>' +
          '</section>') +
          '<div class="detail-actions ritual-actions">' +
            '<button class="btn btn-primary btn-ritual" id="addBtn"' + (product.inStock === false ? ' disabled' : '') + '>Add to Ritual</button>' +
            '<button class="btn btn-ghost btn-sm" id="viewCartBtn">View cart</button>' +
          '</div>' +
          '<div class="qa-box">' +
            '<div class="qa-head">' +
              '<span class="qa-badge"><svg viewBox="0 0 20 20" fill="none" aria-hidden="true"><circle cx="10" cy="10" r="9" fill="rgba(255,255,255,.28)"/><path d="M6 10.4l2.6 2.6 5-5.2" stroke="#fff" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>Third-Party Verified</span>' +
              '<span class="qa-title">Quality Assurance</span>' +
            '</div>' +
            '<p>Independently tested by a certified third-party laboratory for identity, purity and quality — so you know exactly what\'s in every vial.</p>' +
            '<a class="btn btn-ghost btn-sm" href="verification.html?coa=' + encodeURIComponent(product.slug) + '">View Certificate of Analysis ' +
              '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M14 4h6v6M20 4l-9 9M18 13v5a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h5"/></svg></a>' +
          '</div>' +
          (product.coaURL
            ? '<a class="coa-link" href="' + product.coaURL + '" target="_blank" rel="noopener">' +
                '<svg width="20" height="20" viewBox="0 0 22 22" fill="none"><path d="M11 2l7 3v5c0 4.5-3 8.2-7 10-4-1.8-7-5.5-7-10V5l7-3z" stroke="#B79A6B" stroke-width="1.4" stroke-linejoin="round"/><path d="M7.8 11l2.2 2.2 4.2-4.4" stroke="#A96A58" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg>' +
                '<span><span class="tag">Certificate of Analysis</span><br>View this batch\'s third-party report ↗</span></a>'
            : '') +
          '<div class="detail-meta">' +
            (product.verified ? '<span><i></i>Verified &gt;99% purity</span>' : '') +
            '<span><i></i>Third-party tested</span><span><i></i>Cold-chain sealed</span>' +
          '</div>' +
        '</div>' +
      '</div>' +
      '<section class="related"><h2>You may also like</h2><div class="grid" id="relatedGrid"></div></section>';

    // Wire dosage selector
    document.querySelectorAll('#doseOptions .dose-opt').forEach(function (b) {
      b.addEventListener('click', function () {
        selected = opts[+b.dataset.i];
        document.querySelectorAll('#doseOptions .dose-opt').forEach(function (x) {
          x.classList.remove('active'); x.setAttribute('aria-pressed', 'false');
        });
        b.classList.add('active'); b.setAttribute('aria-pressed', 'true');
        updatePrice();
      });
    });
    wirePackages();
    wireMM();
    updatePrice();
    document.getElementById('qMinus').addEventListener('click', function () { qty = Math.max(1, qty - 1); document.getElementById('qVal').textContent = qty; });
    document.getElementById('qPlus').addEventListener('click', function () { qty++; document.getElementById('qVal').textContent = qty; });
    document.getElementById('viewCartBtn').addEventListener('click', window.openCartDrawer);

    var addBtn = document.getElementById('addBtn');
    if (addBtn && product.inStock !== false) {
      addBtn.addEventListener('click', function () {
        window.cartAPI.add({
          id: product.id, slug: product.slug, name: product.name, category: product.category,
          imageURL: product.imageURL || '', dosage: selected.mg,
          basePrice: basePrice(),
          packageId: selectedPkg.id, packageName: selectedPkg.name, packageAddon: selectedPkg.addon,
          price: finalPrice()
        }, qty);
        addBtn.classList.add('added');
        addBtn.textContent = '✓ Added to Ritual';
        setTimeout(function () { addBtn.classList.remove('added'); addBtn.textContent = 'Add to Ritual'; }, 1800);
      });
    }

    document.title = product.name + ' — OPTIMA Labs';
  }

  async function loadRelated() {
    var wrap = document.getElementById('relatedGrid');
    if (!wrap) return;
    var rel = ALL
      .filter(function (p) { return p.category === product.category && p.slug !== product.slug; })
      .slice(0, 3);
    if (!rel.length) { wrap.closest('.related').style.display = 'none'; return; }
    wrap.innerHTML = rel.map(function (p) {
      var lowest = Math.min.apply(null, (p.dosageOptions || [{ price: p.price }]).map(function (o) { return o.price; }));
      return '<a class="card" href="product.html?slug=' + encodeURIComponent(p.slug) + '">' +
        '<div class="card-art">' + (p.imageURL ? '<img src="' + p.imageURL + '" alt="' + p.name + '" loading="lazy">' : fallbackArt(p)) + '</div>' +
        '<div class="card-body"><div class="card-cat">' + p.category + '</div>' +
        '<div class="card-name">' + p.name + '</div>' +
        '<div class="card-desc">' + (p.shortDescription || p.description || '') + '</div>' +
        '<div class="card-foot"><span class="price"><span class="from">from</span>' + fmtPHP(lowest) + '</span></div></div></a>';
    }).join('');
  }

  var lastJSON = '';
  function load() {
    var slug = new URLSearchParams(location.search).get('slug');
    var root = document.getElementById('detail');
    var notFound = '<div class="empty"><h3>Product not found</h3><p><a href="products.html">Back to the collection</a></p></div>';
    if (!slug) { root.innerHTML = notFound; return; }
    // Live from Firestore — price / stock / details update in real time.
    window.ShopData.subscribe(function (list) {
      ALL = list;
      var p = list.find(function (x) { return x.slug === slug; });
      if (!p) { root.innerHTML = notFound; return; }
      var j = JSON.stringify(p);
      if (j === lastJSON) return;   // unchanged → don't disrupt the open page
      lastJSON = j;
      product = p;
      render();
      loadRelated();
    });
  }

  document.addEventListener('DOMContentLoaded', load);
})();
