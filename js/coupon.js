/* ================================================================
   OPTIMA LABS — Global coupon module (shared business logic)
   Single source of truth: Firestore  settings/globalCoupon.
   Loaded ONCE per page and streamed in real time (admin edits show
   up instantly). No UI here — pages consume window.OptimaCoupon.
   The customer's applied code is remembered in localStorage.
   ================================================================ */
(function () {
  var LS_KEY  = 'optima_applied_coupon';
  var _coupon = null;      // raw settings/globalCoupon data (or null)
  var _loaded = false;
  var _subs   = [];

  function emit() { _subs.forEach(function (cb) { try { cb(getActiveCoupon()); } catch (e) {} }); }

  /* Stream the single coupon doc. Cached; never re-queried per view. */
  function init() {
    if (init._done) return; init._done = true;
    if (!window.fbDb) { _loaded = true; return; }
    try {
      window.fbDb.collection('settings').doc('globalCoupon').onSnapshot(function (doc) {
        _coupon = (doc && doc.exists) ? doc.data() : null;
        _loaded = true; emit();
      }, function () { _loaded = true; emit(); });
    } catch (e) { _loaded = true; }
  }

  function normCode(s) { return String(s || '').trim().toUpperCase(); }

  function expiryDate(c) {
    if (!c || !c.expiresAt) return null;
    var d = new Date(String(c.expiresAt) + 'T23:59:59');   // valid through end of that day
    return isNaN(d.getTime()) ? null : d;
  }
  function isExpired(c) { var e = expiryDate(c); return e ? (new Date() > e) : false; }
  function usesLeft(c)  { if (!c || !c.maxUses) return Infinity; return Math.max(0, Number(c.maxUses) - (Number(c.currentUses) || 0)); }

  /* The active, advertisable coupon (banners/badges): active + not expired + uses left. */
  function getActiveCoupon() {
    var c = _coupon;
    if (!c || !c.active) return null;
    if (isExpired(c)) return null;
    if (usesLeft(c) <= 0) return null;
    return c;
  }

  function calculateDiscount(c, subtotal) {
    if (!c) return 0;
    subtotal = Number(subtotal) || 0;
    var d = (c.type === 'percentage')
      ? Math.round((subtotal * (Number(c.percent) || 0)) / 100)
      : (Number(c.amount) || 0);
    return Math.max(0, Math.min(d, subtotal));      // never exceeds the subtotal
  }

  function formatDiscount(c) {
    if (!c) return '';
    return c.type === 'percentage'
      ? (Number(c.percent) || 0) + '%'
      : '₱' + Number(c.amount || 0).toLocaleString('en-PH');
  }

  /* Validate a typed code against the live coupon + current subtotal.
     -> { ok, reason, coupon, discount, min }  */
  function validateCoupon(code, subtotal) {
    var c = _coupon;
    subtotal = Number(subtotal) || 0;
    if (!c || !c.active)                              return { ok: false, reason: 'invalid' };
    if (normCode(code) !== normCode(c.code))          return { ok: false, reason: 'invalid' };
    if (isExpired(c))                                 return { ok: false, reason: 'expired' };
    if (usesLeft(c) <= 0)                             return { ok: false, reason: 'exhausted' };
    if (c.minimumPurchase && subtotal < Number(c.minimumPurchase))
      return { ok: false, reason: 'minimum', min: Number(c.minimumPurchase) };
    return { ok: true, coupon: c, discount: calculateDiscount(c, subtotal) };
  }

  function applyCoupon(code, subtotal) {
    var v = validateCoupon(code, subtotal);
    if (v.ok) { try { localStorage.setItem(LS_KEY, normCode(code)); } catch (e) {} }
    return v;
  }
  function removeCoupon()   { try { localStorage.removeItem(LS_KEY); } catch (e) {} }
  function getAppliedCode() { try { return localStorage.getItem(LS_KEY) || ''; } catch (e) { return ''; } }

  /* Re-validate the remembered coupon against the current subtotal.
     Auto-clears it if it's no longer valid (admin disabled / expired /
     min purchase no longer met). -> { ok, coupon, discount } | null  */
  function getAppliedDiscount(subtotal) {
    var code = getAppliedCode();
    if (!code) return null;
    var v = validateCoupon(code, subtotal);
    if (!v.ok) { removeCoupon(); return null; }
    return v;
  }

  function reasonText(reason, min) {
    if (reason === 'expired')   return 'This coupon has expired.';
    if (reason === 'exhausted') return 'This coupon has reached its usage limit.';
    if (reason === 'minimum')   return 'Minimum purchase of ₱' + Number(min || 0).toLocaleString('en-PH') + ' not reached.';
    return 'Invalid coupon code.';
  }

  function onChange(cb) { _subs.push(cb); if (_loaded) { try { cb(getActiveCoupon()); } catch (e) {} } }

  window.OptimaCoupon = {
    init: init, onChange: onChange,
    getActiveCoupon: getActiveCoupon,
    validateCoupon: validateCoupon,
    calculateDiscount: calculateDiscount,
    formatDiscount: formatDiscount,
    applyCoupon: applyCoupon,
    removeCoupon: removeCoupon,
    getAppliedCode: getAppliedCode,
    getAppliedDiscount: getAppliedDiscount,
    reasonText: reasonText
  };

  if (document.readyState !== 'loading') init();
  else document.addEventListener('DOMContentLoaded', init);
})();
