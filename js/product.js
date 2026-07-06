/* ================================================================
   OPTIMA LABS — Product detail page controller
   Loads one product by ?slug=, renders dosage selector with
   price-per-option, COA link, add-to-cart, and related products.
   ================================================================ */
(function () {
  var product = null, selected = null, qty = 1, ALL = [];

  function fallbackArt(p, opts) {
    return window.vialArt(p, opts);
  }

  function render() {
    var root = document.getElementById('detail');
    var opts = product.dosageOptions && product.dosageOptions.length
      ? product.dosageOptions : [{ mg: '—', price: product.price }];
    selected = opts[0];

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
            fmtPHP(product.saleActive ? product.salePrice : selected.price) +
            (product.compareAtPrice ? ' <s class="price-was">' + fmtPHP(product.compareAtPrice) + '</s>' : '') +
          '</div>' +
          '<div class="stock-line stock-' + product.stockStatus + '">' +
            (product.stockStatus === 'out_of_stock' ? 'Out of stock'
              : product.stockStatus === 'low_stock' ? 'Low stock — order soon' : 'In stock') +
          '</div>' +
          '<p class="detail-desc">' + (product.description || '') + '</p>' +
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
          '<div class="detail-actions">' +
            '<button class="btn btn-primary" id="addBtn"' + (product.inStock === false ? ' disabled' : '') + '>Add to Cart</button>' +
            '<button class="btn btn-ghost" id="viewCartBtn">View cart</button>' +
          '</div>' +
          '<div class="qa-box">' +
            '<div class="qa-head">' +
              '<span class="qa-badge"><svg viewBox="0 0 20 20" fill="none" aria-hidden="true"><circle cx="10" cy="10" r="9" fill="rgba(255,255,255,.28)"/><path d="M6 10.4l2.6 2.6 5-5.2" stroke="#fff" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>Janoshik Verified</span>' +
              '<span class="qa-title">Quality Assurance</span>' +
            '</div>' +
            '<p>Independently third-party tested by Janoshik for identity, purity and quality — so you know exactly what\'s in every vial.</p>' +
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
        document.getElementById('detailPrice').textContent = fmtPHP(selected.price);
      });
    });
    document.getElementById('qMinus').addEventListener('click', function () { qty = Math.max(1, qty - 1); document.getElementById('qVal').textContent = qty; });
    document.getElementById('qPlus').addEventListener('click', function () { qty++; document.getElementById('qVal').textContent = qty; });
    document.getElementById('viewCartBtn').addEventListener('click', window.openCartDrawer);

    var addBtn = document.getElementById('addBtn');
    if (addBtn && product.inStock !== false) {
      addBtn.addEventListener('click', function () {
        window.cartAPI.add({
          id: product.id, slug: product.slug, name: product.name, category: product.category,
          imageURL: product.imageURL || '', dosage: selected.mg, price: selected.price
        }, qty);
        addBtn.classList.add('added');
        addBtn.textContent = '✓ Added';
        setTimeout(function () { addBtn.classList.remove('added'); addBtn.textContent = 'Add to Cart'; }, 1800);
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
        '<div class="card-desc">' + (p.description || '') + '</div>' +
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
