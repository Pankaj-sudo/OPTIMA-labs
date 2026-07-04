/* ================================================================
   OPTIMA LABS — Checkout (3-step overlay)
   Delivery -> GCash payment + proof upload -> Confirmed.
   Opened by the cart drawer's "Proceed to Checkout" button on any
   page that includes it (products.html / product.html).
   Requires: firebase-init.js (fbAuth/fbDb/fbStorage), cart.js
   (cartAPI + showToast).  Proof uploads -> Firebase Storage.
   ================================================================ */
(function () {

  /* ---- Editable business config -------------------------------------
     Replace these before launch. QR image goes in the project root. */
  var GCASH_NUMBER  = '09XX-XXX-XXXX';                 // TODO: your GCash number
  var GCASH_QR_IMG  = '';                              // TODO: e.g. 'gcash-qr.png' (leave '' to show placeholder)
  var FREE_SHIP_MIN = 2500;                            // free standard shipping at/above this subtotal
  var FEE_STANDARD  = 150;
  var FEE_EXPRESS   = 300;
  /* ------------------------------------------------------------------- */

  var overlay, tempOrderId = null, proofFile = null, proofUrl = null;
  var deliveryType = 'standard', currentStep = 1, form = {};

  function fbReady() { return window.fbAuth && window.fbDb && window.fbStorage; }
  function money(n) { return window.fmtPHP(n); }

  function genOrderId() {
    var c = 'ABCDEFGHIJKLMNPQRSTUVWXYZ23456789', id = 'OL-';
    for (var i = 0; i < 6; i++) id += c[Math.floor(Math.random() * c.length)];
    return id;
  }

  function feeFor(type, subtotal) {
    if (type === 'express') return FEE_EXPRESS;
    return subtotal >= FREE_SHIP_MIN ? 0 : FEE_STANDARD;
  }

  /* ---------- markup ---------- */
  function markup() {
    return '' +
    '<div class="co-modal" role="dialog" aria-modal="true" aria-label="Checkout">' +
      '<div class="co-head">' +
        '<button class="co-close" id="coClose" aria-label="Close checkout">&times;</button>' +
        '<div class="co-steps" id="coSteps">' +
          '<div class="co-step" data-s="1"><div class="co-step-dot">1</div><div class="co-step-label">Delivery</div></div>' +
          '<div class="co-step-line" data-l="1"></div>' +
          '<div class="co-step" data-s="2"><div class="co-step-dot">2</div><div class="co-step-label">Payment</div></div>' +
          '<div class="co-step-line" data-l="2"></div>' +
          '<div class="co-step" data-s="3"><div class="co-step-dot">3</div><div class="co-step-label">Confirmed</div></div>' +
        '</div>' +
      '</div>' +
      '<div class="co-body">' +

        /* sign-in gate */
        '<div class="co-panel" id="coGate">' +
          '<div class="co-gate">' +
            '<h2>Sign in to continue</h2>' +
            '<p>We keep your orders and delivery details secure. Sign in with Google to check out.</p>' +
            '<button class="co-google" id="coGoogle">' +
              '<svg width="17" height="17" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>' +
              'Continue with Google</button>' +
          '</div>' +
        '</div>' +

        /* STEP 1 — delivery */
        '<div class="co-panel" id="coStep1">' +
          '<div class="co-title">Delivery Details</div>' +
          '<div class="co-sub">Where should we deliver your order?</div>' +
          '<div class="co-grid">' +
            fld('coName', 'Full Name', 'text', 'full', 'Juana Dela Cruz') +
            fld('coEmail', 'Email', 'email', 'full', 'you@email.com') +
            fld('coPhone', 'Phone Number', 'tel', 'full', '+63 9XX XXX XXXX', 'Use +63XXXXXXXXXX or 09XXXXXXXXX') +
            fld('coStreet', 'Street Address', 'text', 'full', 'House no., street') +
            fld('coBarangay', 'Barangay', 'text', '', 'Barangay') +
            fld('coCity', 'City / Municipality', 'text', '', 'City') +
            fld('coProvince', 'Province', 'text', '', 'Province') +
            fld('coZip', 'ZIP Code', 'text', '', '0000') +
          '</div>' +
          '<div class="co-delivery">' +
            dcard('standard', '📦 Standard Shipping', '3–5 business days', 'Free on ₱2,500+ · else ₱150') +
            dcard('express', '⚡ Express Shipping', '1–2 business days', '₱300') +
          '</div>' +
          '<div class="co-field full" style="margin-top:18px;">' +
            '<label for="coNotes">Order notes <span style="font-weight:500;color:var(--ink-soft);">(optional)</span></label>' +
            '<textarea id="coNotes" placeholder="Landmark, special instructions, or notes for us..."></textarea>' +
          '</div>' +
          '<button class="co-btn" id="coToPay">Continue to Payment &rarr;</button>' +
        '</div>' +

        /* STEP 2 — payment */
        '<div class="co-panel" id="coStep2">' +
          '<div class="co-title">Complete Payment</div>' +
          '<div class="co-pay">' +
            '<div>' +
              '<div class="co-summary-title">Order Summary</div>' +
              '<div class="co-items" id="coItems"></div>' +
              '<hr class="co-hr">' +
              '<div class="co-row"><span>Subtotal</span><span id="coSubtotal"></span></div>' +
              '<div class="co-row"><span>Delivery</span><span id="coFee"></span></div>' +
              '<hr class="co-hr">' +
              '<div class="co-total"><span class="lbl">Total</span><span class="amt" id="coTotal"></span></div>' +
            '</div>' +
            '<div>' +
              '<div class="co-pay-title">Pay via GCash</div>' +
              '<div class="co-qr" id="coQr">GCash QR Code</div>' +
              '<div class="co-instructions">' +
                '<ol>' +
                  '<li>Open your GCash app</li>' +
                  '<li>Tap “Send Money” or scan the QR above</li>' +
                  '<li>Send the exact amount: <b id="coPayAmt"></b></li>' +
                  '<li>Account number: <b>' + GCASH_NUMBER + '</b></li>' +
                  '<li>Screenshot the successful transaction</li>' +
                '</ol>' +
              '</div>' +
              '<div class="co-uplabel">Upload Payment Screenshot <span style="color:var(--clay);">*</span></div>' +
              '<div class="co-drop" id="coDrop">' +
                '<div class="ico">📎</div>' +
                '<div class="t1">Drag &amp; drop your screenshot here</div>' +
                '<div class="t2">or click to browse</div>' +
                '<div class="t3">JPG, PNG · Max 5MB</div>' +
                '<input type="file" id="coFile" accept="image/*" hidden>' +
              '</div>' +
              '<div class="co-progress" id="coProg"><span></span></div>' +
              '<div class="co-preview" id="coPreview">' +
                '<img id="coThumb" alt="Payment screenshot">' +
                '<div><div class="ok">✓ Screenshot uploaded</div>' +
                '<span class="change" id="coChange">Change screenshot</span></div>' +
              '</div>' +
            '</div>' +
          '</div>' +
          '<div class="co-loading" id="coLoading"><span class="co-spin"></span> Processing your order…</div>' +
          '<button class="co-btn" id="coConfirm" disabled>Confirm My Order</button>' +
          '<button class="co-back" id="coBack">&larr; Back to delivery</button>' +
        '</div>' +

        /* STEP 3 — confirmed */
        '<div class="co-panel" id="coStep3">' +
          '<div class="co-confirm">' +
            '<svg class="co-check-svg" viewBox="0 0 96 96"><circle class="ring" cx="48" cy="48" r="42"/><path class="tick" d="M30 49 L43 62 L67 36"/></svg>' +
            '<div class="co-cfade">' +
              '<h2>Order Confirmed!</h2>' +
              '<div class="thanks" id="coThanks"></div>' +
              '<div class="co-idbox"><div class="idlbl">Order ID</div>' +
                '<div class="idval"><span id="coOrderId"></span><button class="co-copy" id="coCopy">Copy</button></div>' +
              '</div>' +
              '<div class="co-items" id="coItems3"></div>' +
              '<div class="co-total" style="max-width:320px;margin:12px auto 0;"><span class="lbl">Total paid</span><span class="amt" id="coTotal3"></span></div>' +
              '<div class="co-info" id="coInfo"></div>' +
              '<div class="co-disc">OPTIMA Labs products are supplied for personal wellness use under professional guidance. Statements have not been evaluated by the FDA. All sales are final.</div>' +
              '<div class="co-actions">' +
                '<button class="co-btn" style="margin-top:0;" id="coShop">Continue Shopping</button>' +
                '<button class="btn btn-ghost" id="coDone">Close</button>' +
              '</div>' +
            '</div>' +
          '</div>' +
        '</div>' +

      '</div>' +
    '</div>';
  }

  function fld(id, label, type, extra, ph, hint) {
    return '<div class="co-field ' + (extra || '') + '" data-for="' + id + '">' +
      '<label for="' + id + '">' + label + ' <span class="req">*</span></label>' +
      '<input id="' + id + '" type="' + type + '" placeholder="' + (ph || '') + '" autocomplete="off">' +
      '<span class="co-err">' + (hint || 'This field is required') + '</span>' +
    '</div>';
  }
  function dcard(val, title, sub, meta) {
    return '<div class="co-dcard' + (val === 'standard' ? ' sel' : '') + '" data-type="' + val + '">' +
      '<div class="co-dradio"></div>' +
      '<div class="co-dmain"><div class="co-dtitle">' + title + '</div><div class="co-dsub">' + sub + '</div></div>' +
      '<div class="co-dmeta">' + meta + '</div>' +
    '</div>';
  }

  /* ---------- step / progress ---------- */
  function setStep(n) {
    currentStep = n;
    ['coGate', 'coStep1', 'coStep2', 'coStep3'].forEach(function (id) {
      document.getElementById(id).classList.remove('active');
    });
    document.getElementById(n === 0 ? 'coGate' : 'coStep' + n).classList.add('active');
    document.getElementById('coSteps').style.visibility = n === 0 ? 'hidden' : 'visible';
    if (n >= 1) {
      overlay.querySelectorAll('.co-step').forEach(function (el) {
        var s = +el.dataset.s;
        el.classList.toggle('active', s === n);
        el.classList.toggle('done', s < n);
        el.querySelector('.co-step-dot').innerHTML = s < n ? '✓' : s;
      });
      overlay.querySelectorAll('.co-step-line').forEach(function (el) {
        el.classList.toggle('filled', +el.dataset.l < n);
      });
    }
    overlay.querySelector('.co-body').scrollTop = 0;
  }

  /* ---------- summary ---------- */
  function renderSummary() {
    var items = window.cartAPI.all();
    var subtotal = window.cartAPI.total();
    var fee = feeFor(deliveryType, subtotal);
    var total = subtotal + fee;
    var rows = items.map(function (i) {
      return '<div class="co-item"><span class="co-iname"><span class="co-iqty">' + i.qty + '× </span>' +
        i.name + ' · ' + i.dosage + '</span><span>' + money(i.price * i.qty) + '</span></div>';
    }).join('');

    document.getElementById('coItems').innerHTML = rows;
    document.getElementById('coSubtotal').textContent = money(subtotal);
    document.getElementById('coFee').innerHTML = fee === 0 ? '<span class="free">FREE 🎉</span>' : money(fee);
    document.getElementById('coTotal').textContent = money(total);
    document.getElementById('coPayAmt').textContent = money(total);
    return { subtotal: subtotal, fee: fee, total: total, items: items };
  }

  /* ---------- validation ---------- */
  function invalid(id, on) {
    document.querySelector('[data-for="' + id + '"]').classList.toggle('invalid', on);
  }
  function validateStep1() {
    var ok = true;
    var reqd = ['coName', 'coStreet', 'coBarangay', 'coCity', 'coProvince', 'coZip'];
    reqd.forEach(function (id) {
      var bad = !document.getElementById(id).value.trim();
      invalid(id, bad); if (bad) ok = false;
    });
    var email = document.getElementById('coEmail').value.trim();
    var emailBad = !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    invalid('coEmail', emailBad); if (emailBad) ok = false;
    var phone = document.getElementById('coPhone').value.replace(/[\s-]/g, '');
    var phoneBad = !/^(\+63|0)[0-9]{10}$/.test(phone);
    invalid('coPhone', phoneBad); if (phoneBad) ok = false;
    return ok;
  }

  /* ---------- upload ---------- */
  function resetUpload() {
    proofFile = null; proofUrl = null;
    document.getElementById('coDrop').style.display = '';
    document.getElementById('coProg').classList.remove('on');
    document.getElementById('coProg').firstChild.style.width = '0';
    document.getElementById('coPreview').classList.remove('on');
    document.getElementById('coConfirm').disabled = true;
  }
  function handleFile(file) {
    if (!file) return;
    if (!/^image\//.test(file.type)) { window.showToast('Please upload an image (JPG or PNG).'); return; }
    if (file.size > 5 * 1024 * 1024) { window.showToast('That image is over 5MB. Please choose a smaller one.'); return; }
    proofFile = file;
    document.getElementById('coDrop').style.display = 'none';
    var prog = document.getElementById('coProg'); prog.classList.add('on');
    var bar = prog.firstChild; bar.style.width = '0';

    var ref = window.fbStorage.ref('payment_proofs/' + tempOrderId + '_' + file.name);
    var task = ref.put(file, { contentType: file.type });
    task.on('state_changed',
      function (snap) { bar.style.width = (snap.bytesTransferred / snap.totalBytes * 100).toFixed(0) + '%'; },
      function (err) {
        console.error(err);
        window.showToast('Upload failed. Please try again.');
        resetUpload();
      },
      function () {
        task.snapshot.ref.getDownloadURL().then(function (url) {
          proofUrl = url;
          prog.classList.remove('on');
          var pv = document.getElementById('coPreview'); pv.classList.add('on');
          document.getElementById('coThumb').src = url;
          document.getElementById('coConfirm').disabled = false;
        });
      });
  }

  /* ---------- confirm / write order ---------- */
  function confirmOrder() {
    if (!proofUrl) return;
    var sum = renderSummary();
    var addr = {
      street: document.getElementById('coStreet').value.trim(),
      barangay: document.getElementById('coBarangay').value.trim(),
      city: document.getElementById('coCity').value.trim(),
      province: document.getElementById('coProvince').value.trim(),
      zip: document.getElementById('coZip').value.trim()
    };
    var order = {
      order_id: tempOrderId,
      customer_name: document.getElementById('coName').value.trim(),
      customer_email: document.getElementById('coEmail').value.trim(),
      customer_phone: document.getElementById('coPhone').value.replace(/[\s-]/g, ''),
      delivery_address: addr,
      delivery_type: deliveryType,
      delivery_fee: sum.fee,
      items: sum.items,
      subtotal: sum.subtotal,
      total: sum.total,
      payment_proof_url: proofUrl,
      payment_status: 'pending',
      order_status: 'pending',
      notes: document.getElementById('coNotes').value.trim(),
      created_at: firebase.firestore.FieldValue.serverTimestamp(),
      updated_at: firebase.firestore.FieldValue.serverTimestamp()
    };

    document.getElementById('coConfirm').style.display = 'none';
    document.getElementById('coBack').style.display = 'none';
    document.getElementById('coLoading').classList.add('on');

    window.fbDb.collection('orders').add(order).then(function () {
      document.getElementById('coLoading').classList.remove('on');
      showConfirmation(order, sum);
      window.cartAPI.clear();
    }).catch(function (err) {
      console.error(err);
      window.showToast('Could not place the order. Please try again.');
      document.getElementById('coLoading').classList.remove('on');
      document.getElementById('coConfirm').style.display = '';
      document.getElementById('coBack').style.display = '';
    });
  }

  function showConfirmation(order, sum) {
    document.getElementById('coThanks').textContent = 'Thank you, ' + (order.customer_name.split(' ')[0] || 'friend') + '!';
    document.getElementById('coOrderId').textContent = order.order_id;
    document.getElementById('coItems3').innerHTML = document.getElementById('coItems').innerHTML;
    document.getElementById('coTotal3').textContent = money(sum.total);
    var eta = order.delivery_type === 'express' ? '1–2 business days' : '3–5 business days';
    document.getElementById('coInfo').innerHTML =
      '📧 Confirmation sent to ' + order.customer_email + '<br>' +
      '⏱ Payment verification: within 2–4 hours<br>' +
      '📦 Estimated delivery: ' + eta;
    setStep(3);
  }

  /* ---------- open / close / reset ---------- */
  function closeDrawer() {
    document.getElementById('drawerBackdrop') && document.getElementById('drawerBackdrop').classList.remove('open');
    document.getElementById('cartDrawer') && document.getElementById('cartDrawer').classList.remove('open');
  }
  function openOverlay() { overlay.classList.add('open'); document.body.style.overflow = 'hidden'; }
  function reset() {
    ['coName','coEmail','coPhone','coStreet','coBarangay','coCity','coProvince','coZip','coNotes'].forEach(function (id) {
      var el = document.getElementById(id); if (el) el.value = '';
      var f = document.querySelector('[data-for="' + id + '"]'); if (f) f.classList.remove('invalid');
    });
    deliveryType = 'standard';
    overlay.querySelectorAll('.co-dcard').forEach(function (el) { el.classList.toggle('sel', el.dataset.type === 'standard'); });
    resetUpload();
    document.getElementById('coConfirm').style.display = '';
    document.getElementById('coBack').style.display = '';
    tempOrderId = null;
  }
  function close() {
    overlay.classList.remove('open');
    document.body.style.overflow = '';
    reset();
    setStep(1);
  }

  function open() {
    if (!fbReady()) { window.showToast('Checkout needs the store backend enabled. Please try again shortly.'); return; }
    if (window.cartAPI.count() === 0) { window.showToast('Your cart is empty.'); return; }
    closeDrawer();
    tempOrderId = genOrderId();
    renderSummary();
    if (window.fbAuth.currentUser) {
      prefillEmail();
      setStep(1);
    } else {
      setStep(0);
    }
    openOverlay();
  }
  function prefillEmail() {
    var u = window.fbAuth.currentUser;
    if (u) {
      if (u.email) document.getElementById('coEmail').value = u.email;
      if (u.displayName && !document.getElementById('coName').value) document.getElementById('coName').value = u.displayName;
    }
  }

  /* ---------- wire ---------- */
  function wire() {
    document.getElementById('coClose').addEventListener('click', close);
    overlay.addEventListener('click', function (e) { if (e.target === overlay) close(); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && overlay.classList.contains('open')) close(); });

    document.getElementById('coGoogle').addEventListener('click', function () {
      window.fbAuth.signInWithPopup(window.fbGoogle).then(function () {
        prefillEmail(); setStep(1);
      }).catch(function () { window.showToast('Sign-in failed. Please try again.'); });
    });

    overlay.querySelectorAll('.co-dcard').forEach(function (card) {
      card.addEventListener('click', function () {
        deliveryType = card.dataset.type;
        overlay.querySelectorAll('.co-dcard').forEach(function (c) { c.classList.remove('sel'); });
        card.classList.add('sel');
        renderSummary();
      });
    });

    document.getElementById('coToPay').addEventListener('click', function () {
      if (validateStep1()) { renderSummary(); setStep(2); }
      else {
        var b = this; b.classList.add('shake'); setTimeout(function () { b.classList.remove('shake'); }, 420);
        window.showToast('Please complete the highlighted fields.');
      }
    });
    document.getElementById('coBack').addEventListener('click', function () { setStep(1); });

    var drop = document.getElementById('coDrop');
    var file = document.getElementById('coFile');
    drop.addEventListener('click', function () { file.click(); });
    file.addEventListener('change', function () { handleFile(file.files[0]); });
    ['dragenter', 'dragover'].forEach(function (ev) {
      drop.addEventListener(ev, function (e) { e.preventDefault(); drop.classList.add('drag'); });
    });
    ['dragleave', 'drop'].forEach(function (ev) {
      drop.addEventListener(ev, function (e) { e.preventDefault(); drop.classList.remove('drag'); });
    });
    drop.addEventListener('drop', function (e) {
      if (e.dataTransfer.files && e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]);
    });
    document.getElementById('coChange').addEventListener('click', resetUpload);

    document.getElementById('coConfirm').addEventListener('click', confirmOrder);

    document.getElementById('coCopy').addEventListener('click', function () {
      var btn = this, id = document.getElementById('coOrderId').textContent;
      (navigator.clipboard ? navigator.clipboard.writeText(id) : Promise.reject()).then(function () {
        btn.textContent = 'Copied! ✓'; setTimeout(function () { btn.textContent = 'Copy'; }, 2000);
      }).catch(function () { btn.textContent = 'Copied! ✓'; setTimeout(function () { btn.textContent = 'Copy'; }, 2000); });
    });
    document.getElementById('coShop').addEventListener('click', function () { window.location.href = 'products.html'; });
    document.getElementById('coDone').addEventListener('click', close);
  }

  /* ---------- init ---------- */
  document.addEventListener('DOMContentLoaded', function () {
    overlay = document.createElement('div');
    overlay.className = 'co-overlay';
    overlay.innerHTML = markup();
    document.body.appendChild(overlay);

    // GCash QR: real image if provided, else keep the dashed placeholder.
    if (GCASH_QR_IMG) {
      document.getElementById('coQr').innerHTML = '<img src="' + GCASH_QR_IMG + '" alt="GCash QR Code">';
    }

    wire();
    setStep(1);

    var btn = document.getElementById('checkoutBtn');
    if (btn) btn.addEventListener('click', open);
  });
})();
