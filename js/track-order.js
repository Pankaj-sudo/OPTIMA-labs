/* ================================================================
   OPTIMA LABS — Track My Order (shared module)
   Self-guards on #trackForm; safe to include on any page.
   ================================================================ */
(function () {
  var form = document.getElementById('trackForm');
  if (!form) return;
  var idEl = document.getElementById('trackId');
  var emailEl = document.getElementById('trackEmail');
  var btn = document.getElementById('trackBtn');
  var btnText = document.getElementById('trackBtnText');
  var result = document.getElementById('trackResult');
  var errorEl = document.getElementById('trackError');
  var summary = document.getElementById('trackSummary');
  var timeline = document.getElementById('trackTimeline');

  idEl.addEventListener('input', function () { idEl.value = idEl.value.toUpperCase(); });
  document.getElementById('trackRetry').addEventListener('click', function () {
    errorEl.classList.add('track-hidden'); result.classList.add('track-hidden');
    idEl.focus();
  });

  // Prefill email once auth resolves (rules require the signed-in email to match).
  if (window.fbAuth) window.fbAuth.onAuthStateChanged(function (u) {
    if (u && u.email && !emailEl.value) emailEl.value = u.email;
  });

  function fmtTs(ts) {
    if (!ts) return '';
    var d = ts.toDate ? ts.toDate() : new Date(ts);
    return d.toLocaleDateString('en-PH', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  }
  function money(n) { return window.fmtPHP ? window.fmtPHP(n) : '₱' + Number(n || 0).toFixed(2); }
  function loading(on) {
    btn.disabled = on; btn.classList.toggle('loading', on);
    btnText.textContent = on ? 'Tracking…' : 'Track Order';
  }
  function showError() { result.classList.add('track-hidden'); errorEl.classList.remove('track-hidden'); }

  function render(o) {
    errorEl.classList.add('track-hidden');
    summary.innerHTML =
      '<span class="who">Order for ' + (o.customer_name || 'you') + '</span>' +
      '<span class="meta">Total <b>' + money(o.total) + '</b></span>' +
      '<span class="meta">' + (o.delivery_type === 'express' ? 'Express' : 'Standard') + ' delivery</span>';

    var os = (o.order_status || 'pending').toLowerCase();
    var ps = (o.payment_status || 'pending').toLowerCase();
    var steps = [
      { name: 'Order Placed', done: true, time: fmtTs(o.created_at) },
      { name: 'Payment Verified', done: ps === 'verified', time: ps === 'verified' ? fmtTs(o.updated_at) : '' },
      { name: 'Processing', done: ['processing', 'shipped', 'delivered'].indexOf(os) > -1, time: '' },
      { name: 'Shipped', done: ['shipped', 'delivered'].indexOf(os) > -1, time: '', track: o.tracking_number },
      { name: 'Delivered', done: os === 'delivered', time: '' }
    ];
    var firstPending = steps.findIndex(function (s) { return !s.done; });
    timeline.innerHTML = steps.map(function (s, i) {
      var cls = s.done ? 'done' : (i === firstPending ? 'active' : '');
      return '<div class="tl-step ' + cls + '">' +
        '<div class="tl-dot">' + (s.done ? '✓' : (i + 1)) + '</div>' +
        '<div class="tl-body"><div class="tl-name">' + s.name + '</div>' +
        (s.time ? '<div class="tl-time">' + s.time + '</div>' : '') +
        (s.track && s.done ? '<div class="tl-track">Tracking #: ' + s.track + ' — via J&T / LBC / Ninja Van</div>' : '') +
        '</div></div>';
    }).join('');
    result.classList.remove('track-hidden');
  }

  async function lookup() {
    var id = idEl.value.trim().toUpperCase();
    var email = emailEl.value.trim().toLowerCase();
    if (!id || !email) { showError(); return; }
    if (!window.fbDb || !window.fbAuth) { showError(); return; }
    loading(true);
    try {
      // Our rules require the requester to be signed in as the order's email.
      if (!window.fbAuth.currentUser) {
        await window.fbAuth.signInWithPopup(window.fbGoogle);
      }
      var snap = await window.fbDb.collection('orders')
        .where('order_id', '==', id)
        .where('customer_email', '==', email)
        .limit(1).get();
      if (snap.empty) { showError(); }
      else { render(snap.docs[0].data()); }
    } catch (e) {
      console.error('track lookup failed', e);
      showError();
    } finally { loading(false); }
  }

  form.addEventListener('submit', function (e) { e.preventDefault(); lookup(); });
})();
