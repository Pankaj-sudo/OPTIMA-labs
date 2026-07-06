/* ================================================================
   OPTIMA LABS — Shop data layer (single source of truth)
   Streams the Firestore `products` collection in real time and
   normalises each doc into the shape the storefront renders.
   Only ACTIVE products are queried (matches the security rules),
   so hidden/archived items never reach the client.

   Any admin change (add / edit / delete / archive / price / stock)
   flows through onSnapshot and re-renders the catalogue, product
   page and homepage instantly — no refresh, no duplicate lists.

   Falls back to the static window.PRODUCTS_DATA when Firebase is
   unavailable (offline / blocked), so the shop never goes blank.
   ================================================================ */
(function () {
  function lowest(p) {
    var opts = p.dosageOptions && p.dosageOptions.length ? p.dosageOptions : [{ price: p.price || 0 }];
    return Math.min.apply(null, opts.map(function (o) { return o.price || 0; }));
  }

  // Normalise a raw product (Firestore doc data OR static object) to the
  // single shape every storefront view consumes.
  function normalize(id, p) {
    var base = lowest(p);
    var saleOn = !!p.saleActive && p.salePrice != null && p.salePrice > 0;
    var display = saleOn ? p.salePrice : base;
    // compare-at line: explicit compareAtPrice, else the pre-sale base when on sale
    var compareAt = (p.compareAtPrice != null && p.compareAtPrice > display) ? p.compareAtPrice
                  : (saleOn && base > display ? base : null);

    var status = p.status || 'active';
    var qty = (typeof p.stockQty === 'number') ? p.stockQty : null;
    var thr = (typeof p.lowStockThreshold === 'number') ? p.lowStockThreshold : 5;
    var stockStatus = p.stockStatus;
    if (p.trackInventory !== false && qty != null) {          // derive from qty when tracked
      stockStatus = qty <= 0 ? 'out_of_stock' : (qty <= thr ? 'low_stock' : 'in_stock');
    } else if (!stockStatus) {
      stockStatus = (p.inStock === false) ? 'out_of_stock' : 'in_stock';
    }
    var img = p.featuredImage || p.imageURL || (p.images && p.images[0]) || '';

    return {
      id: id, _id: id, slug: p.slug || id, name: p.name, category: p.category,
      description: p.description || '', shortDescription: p.shortDescription || '',
      brand: p.brand || '', sku: p.sku || '', weight: p.weight || '', tags: p.tags || [],
      dosageOptions: p.dosageOptions && p.dosageOptions.length ? p.dosageOptions : [{ mg: '—', price: base }],
      basePrice: base, price: display, displayPrice: display, compareAtPrice: compareAt,
      saleActive: saleOn, salePrice: saleOn ? p.salePrice : null,
      stockStatus: stockStatus, stockQty: qty, lowStockThreshold: thr,
      inStock: stockStatus !== 'out_of_stock',
      images: p.images || (img ? [img] : []), imageURL: img, featuredImage: img,
      verified: p.verified !== false, is_new_arrival: !!p.is_new_arrival,
      coaURL: p.coaURL || null, status: status
    };
  }

  function fromStatic() {
    return (window.PRODUCTS_DATA || []).map(function (p) { return normalize(p.id || p.slug, p); });
  }

  // subscribe(cb) → cb(productsArray) now and on every change. Returns unsub fn.
  function subscribe(cb) {
    if (!window.fbDb) {                       // no Firebase → one-shot static fallback
      cb(fromStatic());
      return function () {};
    }
    var got = false;
    // Resilience: if Firestore hasn't answered within 6s (offline / blocked),
    // show the static catalogue so the shop never hangs on "Loading…".
    var t = setTimeout(function () { if (!got) cb(fromStatic()); }, 6000);
    try {
      return window.fbDb.collection('products')
        .where('status', '==', 'active')
        .onSnapshot(function (snap) {
          got = true; clearTimeout(t);
          var list = snap.docs
            .filter(function (d) { return !d.data().coaOnly; })   // COA-only records aren't sellable
            .map(function (d) { return normalize(d.id, d.data()); });
          list.sort(function (a, b) { return a.name.localeCompare(b.name); });
          cb(list);
        }, function () { clearTimeout(t); cb(fromStatic()); });  // error → fallback
    } catch (e) {
      clearTimeout(t); cb(fromStatic());
      return function () {};
    }
  }

  window.ShopData = { subscribe: subscribe, normalize: normalize };
})();
