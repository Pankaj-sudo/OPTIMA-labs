/* ================================================================
   OPTIMA LABS — Shared helpers (no Firebase dependency)
   Used by the static catalogue/detail pages. admin-products.html and
   seed.html still get these same globals from firebase-init.js once
   the real Firebase project is connected.
   ================================================================ */
window.CATEGORIES = [
  'Weight Management', 'Recovery & Repair', 'Metabolic', 'Skin & Beauty',
  'Longevity', 'Sleep & Calm', 'Intimacy', 'Supplies'
];

window.fmtPHP = function (n) {
  return '₱' + Number(n || 0).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

window.slugify = function (s) {
  return String(s).toLowerCase().trim()
    .replace(/\+/g, ' plus ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
};
