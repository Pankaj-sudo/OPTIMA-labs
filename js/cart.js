/* ================================================================
   OPTIMA LABS — Cart (localStorage, self-contained snapshots)
   Each item carries everything the cart/checkout needs, so nothing
   depends on a hardcoded product array or a live Firestore read.
   Item: { key, id, slug, name, category, imageURL, dosage,
           basePrice, packageId, packageName, packageAddon, price, qty }
   price = final unit price (basePrice + packageAddon)
   key   = `${slug}_${dosage}_${packageId}`
   ================================================================ */
(function () {
  var KEY = 'optima_cart';
  var cart = [];
  try { cart = JSON.parse(localStorage.getItem(KEY)) || []; } catch (e) { cart = []; }

  function save() { localStorage.setItem(KEY, JSON.stringify(cart)); }

  window.cartAPI = {
    all:   function () { return cart.slice(); },
    count: function () { return cart.reduce(function (s, i) { return s + i.qty; }, 0); },
    total: function () { return cart.reduce(function (s, i) { return s + i.price * i.qty; }, 0); },

    add: function (item, qty) {
      qty = qty || 1;
      var pkgId = item.packageId || 'peptide-only';
      var key = item.slug + '_' + item.dosage + '_' + pkgId;
      var found = cart.find(function (i) { return i.key === key; });
      if (found) { found.qty += qty; }
      else { cart.push({
        key: key, id: item.id, slug: item.slug, name: item.name,
        category: item.category, imageURL: item.imageURL || '',
        dosage: item.dosage,
        basePrice: (item.basePrice != null ? item.basePrice : item.price),
        packageId: pkgId,
        packageName: item.packageName || 'Peptide Only',
        packageAddon: item.packageAddon || 0,
        price: item.price, qty: qty
      }); }
      save(); syncBadges();
      if (window.showToast) showToast(item.name + ' · ' + item.dosage + ' added to cart');
    },

    remove: function (key) { cart = cart.filter(function (i) { return i.key !== key; }); save(); syncBadges(); },
    setQty: function (key, delta) {
      var i = cart.find(function (x) { return x.key === key; });
      if (!i) return;
      i.qty = Math.max(1, i.qty + delta); save(); syncBadges();
    },
    clear: function () { cart = []; save(); syncBadges(); }
  };

  function syncBadges() {
    var n = window.cartAPI.count();
    document.querySelectorAll('.nav-cart .count').forEach(function (el) {
      el.textContent = n;
      el.classList.toggle('visible', n > 0);
    });
    if (typeof window.renderCartDrawer === 'function') window.renderCartDrawer();
  }
  window.syncCartBadges = syncBadges;

  /* ---- Toast ---- */
  var toastTimer;
  window.showToast = function (msg) {
    var t = document.getElementById('toast');
    if (!t) return;
    t.innerHTML = '<span class="dot"></span><span>' + msg + '</span>';
    t.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { t.classList.remove('show'); }, 2600);
  };

  /* ---- Drawer render + wiring (present on every page that includes the drawer markup) ---- */
  window.renderCartDrawer = function () {
    var body = document.getElementById('drawerBody');
    var foot = document.getElementById('drawerFoot');
    if (!body) return;
    var items = window.cartAPI.all();
    if (!items.length) {
      body.innerHTML = '<div class="drawer-empty"><p>Your cart is empty.</p></div>';
      if (foot) foot.style.display = 'none';
      return;
    }
    if (foot) foot.style.display = 'block';
    body.innerHTML = items.map(function (i) {
      return '<div class="cart-item">' +
        '<div class="cart-item-img">' + (i.imageURL ? '<img src="' + i.imageURL + '" alt="">' : '') + '</div>' +
        '<div class="cart-item-info">' +
          '<div class="cart-item-name">' + i.name + '</div>' +
          '<div class="cart-item-meta">' + i.dosage + ' · ' + fmtPHP(i.price) + '</div>' +
          (i.packageId && i.packageId !== 'peptide-only'
            ? '<div class="cart-item-pkg">' + i.packageName + '</div>' : '') +
          '<div class="cart-item-controls">' +
            '<button onclick="cartAPI.setQty(\'' + i.key + '\',-1)" aria-label="Decrease">−</button>' +
            '<span>' + i.qty + '</span>' +
            '<button onclick="cartAPI.setQty(\'' + i.key + '\',1)" aria-label="Increase">+</button>' +
          '</div>' +
        '</div>' +
        '<div style="text-align:right;">' +
          '<div class="cart-item-price">' + fmtPHP(i.price * i.qty) + '</div>' +
          '<button class="cart-remove" onclick="cartAPI.remove(\'' + i.key + '\')">Remove</button>' +
        '</div>' +
      '</div>';
    }).join('');
    var tot = document.getElementById('drawerTotal');
    if (tot) tot.textContent = fmtPHP(window.cartAPI.total());
  };

  function openDrawer() {
    document.getElementById('drawerBackdrop')?.classList.add('open');
    document.getElementById('cartDrawer')?.classList.add('open');
    document.body.style.overflow = 'hidden';
    window.renderCartDrawer();
  }
  function closeDrawer() {
    document.getElementById('drawerBackdrop')?.classList.remove('open');
    document.getElementById('cartDrawer')?.classList.remove('open');
    document.body.style.overflow = '';
  }
  window.openCartDrawer = openDrawer;

  document.addEventListener('DOMContentLoaded', function () {
    document.querySelectorAll('.nav-cart').forEach(function (b) { b.addEventListener('click', openDrawer); });
    document.getElementById('drawerClose')?.addEventListener('click', closeDrawer);
    document.getElementById('drawerBackdrop')?.addEventListener('click', closeDrawer);
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeDrawer(); });
    syncBadges();
  });
})();
