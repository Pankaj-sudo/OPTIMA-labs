/* ================================================================
   OPTIMA LABS — Firebase init (compat SDK)
   Loaded after the firebase-*-compat CDN scripts.
   ================================================================ */
(function () {
  var cfg = {
    apiKey:            "AIzaSyAZIHQjGLQxkID28N4YhXOPkhmcVaeQ_H4",
    authDomain:        "optima-labs.firebaseapp.com",
    projectId:         "optima-labs",
    storageBucket:     "optima-labs.firebasestorage.app",
    messagingSenderId: "316304291195",
    appId:             "1:316304291195:web:1fd947d3c4cd40b602f9de"
  };

  /* ---- Constants ----
     Note: admin.html/admin-products.html gate access on the Firebase custom
     claim { admin: true }, not on this list — it's informational only.
     Grant/revoke the claim via functions/index.js → setAdminClaim. */
  window.ADMIN_EMAILS = ['jen.llames.fb@gmail.com', 'pankaj.ydv707@gmail.com'];
  window.CATEGORIES  = [
    'Weight Management', 'Recovery & Repair', 'Metabolic', 'Skin & Beauty',
    'Longevity', 'Sleep & Calm', 'Intimacy', 'Supplies'
  ];

  /* ---- Helpers ---- */
  window.fmtPHP = function (n) {
    return '₱' + Number(n || 0).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  window.slugify = function (s) {
    return String(s).toLowerCase().trim()
      .replace(/\+/g, ' plus ')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  /* ---- Firebase services ----
     Guarded so this file is safe to include on the static catalogue pages
     even if the Firebase SDK is blocked/offline: the helpers above still
     load, and fbAuth/fbDb/fbStorage simply stay undefined (checkout/admin
     detect that and surface a friendly message). */
  if (typeof firebase === 'undefined') return;

  if (!firebase.apps.length) firebase.initializeApp(cfg);
  window.fbAuth    = firebase.auth();
  window.fbDb      = firebase.firestore();
  window.fbStorage = firebase.storage();
  window.fbGoogle  = new firebase.auth.GoogleAuthProvider();
})();
