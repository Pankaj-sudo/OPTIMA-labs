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

  // If the visitor happens to be signed in with a real email (e.g. Google),
  // prefill it as a convenience. Signing in is optional — orders are tracked
  // with just the order number + email typed below.
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
      '<span class="meta">' + (o.delivery_method || 'Standard delivery') + '</span>';

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

  /* ---- Consultation booking tracking (CONS-XXXXXX) ---- */
  var CST = {
    booking_received:      { label: 'Booking Received',      cls: 'amber', note: 'We’ve received your consultation request.' },
    awaiting_verification: { label: 'Awaiting Verification', cls: 'amber', note: 'Our team is reviewing your payment and details.' },
    verified:              { label: 'Verified',              cls: 'green', note: 'Your payment is verified — we’ll schedule your session shortly.' },
    scheduled:             { label: 'Consultation Scheduled',cls: 'blue',  note: 'Your consultation is scheduled. Watch for our confirmation.' },
    completed:             { label: 'Completed',             cls: 'green', note: 'Your consultation is complete. Thank you!' },
    cancelled:             { label: 'Cancelled',             cls: 'red',   note: 'This booking was cancelled. Contact us if you have any questions.' }
  };
  var CORDER = ['booking_received', 'awaiting_verification', 'verified', 'scheduled', 'completed'];

  function renderConsult(c) {
    errorEl.classList.add('track-hidden');
    var st = c.booking_status || 'booking_received';
    var meta = CST[st] || CST.booking_received;
    var updated = fmtTs(c.status_updated_at || c.updated_at || c.created_at);

    summary.innerHTML =
      '<span class="who">Consultation for ' + (c.full_name || 'you') + '</span>' +
      '<span class="meta">' + (c.contact_method || 'Consultation') + '</span>' +
      '<span class="meta">Ref <b>' + (c.booking_ref || '') + '</b></span>';

    var head =
      '<div class="tl-cur">' +
        '<span class="tl-cbadge ' + meta.cls + '">' + meta.label + '</span>' +
        '<p>' + meta.note + '</p>' +
        (updated ? '<div class="tl-time">Last updated ' + updated + '</div>' : '') +
      '</div>';

    if (st === 'cancelled') {
      timeline.innerHTML = head;
    } else {
      var cur = CORDER.indexOf(st);
      timeline.innerHTML = head + CORDER.map(function (s, i) {
        var done = i <= cur;
        var cls = done ? 'done' : (i === cur + 1 ? 'active' : '');
        return '<div class="tl-step ' + cls + '">' +
          '<div class="tl-dot">' + (done ? '✓' : (i + 1)) + '</div>' +
          '<div class="tl-body"><div class="tl-name">' + CST[s].label + '</div>' +
          (i === cur && updated ? '<div class="tl-time">' + updated + '</div>' : '') +
          '</div></div>';
      }).join('');
    }
    result.classList.remove('track-hidden');
  }

  async function lookup() {
    var id = idEl.value.trim().toUpperCase();
    var email = emailEl.value.trim().toLowerCase();
    if (!id || !email) { showError(); return; }
    if (!window.fbDb || !window.fbAuth) { showError(); return; }
    loading(true);
    try {
      if (id.indexOf('CONS') === 0) {
        // Consultation bookings hold sensitive personal/medical details, so
        // they still require a verified email (e.g. Google) that matches the
        // booking email — the security rules enforce that match.
        if (!window.fbAuth.currentUser || !window.fbAuth.currentUser.email) {
          if (!window.fbGoogle) { showError(); return; }
          await window.fbAuth.signInWithPopup(window.fbGoogle);
          if (window.fbAuth.currentUser.email) emailEl.value = window.fbAuth.currentUser.email;
          email = emailEl.value.trim().toLowerCase();
        }
        var csnap = await window.fbDb.collection('consultations')
          .where('booking_ref', '==', id)
          .where('email', '==', email)
          .limit(1).get();
        if (csnap.empty) { showError(); }
        else { renderConsult(csnap.docs[0].data()); }
      } else {
        // Orders are guest-trackable — no Google account needed. We sign in
        // silently (anonymous) so the request is authenticated for the rules;
        // the order number + email are the lookup credentials.
        if (!window.fbAuth.currentUser) {
          await window.fbAuth.signInAnonymously();
        }
        var snap = await window.fbDb.collection('orders')
          .where('order_id', '==', id)
          .where('customer_email', '==', email)
          .limit(1).get();
        if (snap.empty) { showError(); }
        else { render(snap.docs[0].data()); }
      }
    } catch (e) {
      console.error('track lookup failed', e);
      showError();
    } finally { loading(false); }
  }

  form.addEventListener('submit', function (e) { e.preventDefault(); lookup(); });
})();
