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
  var GCASH_QR_IMG  = 'https://firebasestorage.googleapis.com/v0/b/optima-labs.firebasestorage.app/o/Gcash%20Reciept%2FOptima%20labs%20Gcash%20QR.jpg?alt=media&token=605d30e0-4294-4d3b-8c27-7e4b02f47cfa';  // GCash QR (leave '' to show placeholder)
  var FREE_SHIP_MIN = 2500;                            // free standard shipping at/above this subtotal
  var FEE_STANDARD  = 150;
  var FEE_EXPRESS   = 300;
  var PAYMENT_METHOD = 'GCash';                        // shown on the confirmation + order message
  var VIBER_NUMBER   = '+639761831910';               // support Viber (change here only)
  var WHATSAPP_NUMBER = '+639603952447';              // fulfillment WhatsApp (change here only)
  // Same-day courier booking links (Metro Manila). Delivery fees are paid by the
  // customer directly to the courier — OPTIMA does not collect courier fees.
  var GRAB_LINK     = 'https://express.grab.com/delivery-link/SMw6PJwBOLJB';
  var LALAMOVE_LINK = 'https://delivery.lalamove.com/forms/PH1c8f6c0f5b704e71b7eeac9356f31025';
  /* ------------------------------------------------------------------- */

  var VB_DIGITS = VIBER_NUMBER.replace(/[^0-9]/g, '');
  var WA_DIGITS = WHATSAPP_NUMBER.replace(/[^0-9]/g, '');
  var VIBER_ICO = '<svg viewBox="0 0 32 32" width="20" height="20" aria-hidden="true"><path fill="#fff" d="M16.9 3c-3.8 0-7.9.6-9.6 2.1C5.3 6.9 4.8 10.3 4.8 14.5s.5 7.6 2.5 9.4c.8.7 1.9 1.2 3.1 1.6l.02 3.6c0 .5.6.8 1 .45l3.05-3.15c.55.05 1.1.07 1.65.07 3.8 0 7.9-.6 9.6-2.1 2-1.8 2.5-5.2 2.5-9.4s-.5-7.6-2.5-9.4C24-.6 20.7 3 16.9 3z"/><path fill="#6a4fe0" d="M21 18.3c-.32-.2-.66-.22-.95.02l-.62.72c-.2.2-.5.18-.5.18-2.62-.72-3.34-3.36-3.34-3.36s-.02-.3.18-.5l.72-.62c.24-.29.22-.63.02-.95a10 10 0 0 0-.9-1.18c-.16-.18-.44-.2-.64-.06-.5.32-.98.74-1.28 1.24-.18.3-.2.68-.08 1.02.28.78.86 1.94 1.92 3 1.06 1.06 2.22 1.64 3 1.92.34.12.72.1 1.02-.08.5-.3.92-.78 1.24-1.28.14-.2.12-.48-.06-.64-.36-.34-.76-.66-1.18-.9z"/></svg>';
  var WA_ICO = '<svg viewBox="0 0 24 24" width="20" height="20" fill="#fff" aria-hidden="true"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51l-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.71.306 1.263.489 1.694.625.712.227 1.36.195 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>';

  var overlay, tempOrderId = null, proofFile = null, proofUrl = null, proofPath = null;
  var deliveryType = 'standard', currentStep = 1, form = {}, orderMsg = '';
  var orderDocId = null, stashOrder = null, stashSum = null;   // courier path defers the write

  /* ---- delivery-method helpers ---- */
  function isCourier(t) { return t === 'grab' || t === 'lalamove'; }
  function courierMeta(t) {
    return t === 'grab'
      ? { name: 'GrabExpress', payee: 'Grab', link: GRAB_LINK, book: 'Book GrabExpress Delivery',
          refLabel: 'Grab Booking Reference', refPh: 'Example: GRAB-123456789', confirm: "I've Booked My GrabExpress Courier" }
      : { name: 'Lalamove', payee: 'Lalamove', link: LALAMOVE_LINK, book: 'Book Lalamove Delivery',
          refLabel: 'Lalamove Booking Reference', refPh: 'Example: LM-123456789', confirm: "I've Booked My Lalamove Courier" };
  }
  function deliveryLabel(t) {
    return { grab: 'Same-Day Courier · GrabExpress', lalamove: 'Same-Day Courier · Lalamove',
             express: 'Express Shipping', standard: 'Standard Shipping' }[t] || 'Standard Shipping';
  }

  function amt(n) { return '₱' + Number(n || 0).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }

  // Structured, fulfillment-ready order message. The Order ID lets the team
  // locate the order instantly in the Admin Dashboard.
  function buildOrderMessage(order, sum) {
    var a = order.delivery_address || {};
    var addr = [a.street, a.barangay, a.city, a.province, a.zip].filter(Boolean).join(', ');
    var products = (sum.items || []).map(function (i) {
      return '• ' + i.qty + ' × ' + i.name + (i.dosage ? ' · ' + i.dosage : '') +
        (i.packageId && i.packageId !== 'peptide-only' ? ' (' + i.packageName + ')' : '');
    }).join('\n');
    // Distinct non-default packages selected across the cart.
    var pkgs = {};
    (sum.items || []).forEach(function (i) { if (i.packageId && i.packageId !== 'peptide-only' && i.packageName) pkgs[i.packageName] = 1; });
    var pkgLine = Object.keys(pkgs).length ? Object.keys(pkgs).join(', ') : 'Peptide Only (standard)';
    var courier = order.courier || (isCourier(order.delivery_type) ? courierMeta(order.delivery_type).name : '—');
    var L = [
      'Hello Optima Labs,', '',
      'I would like to fast-track the verification of my order.', '',
      'Order ID:', order.order_id, '',
      'Order Date:', (order._dateStr || new Date().toLocaleString('en-PH', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })), '',
      'Name:', order.customer_name, '',
      'Email:', order.customer_email, '',
      'Contact Number:', order.customer_phone, '',
      'Products Ordered:', products, '',
      'Selected Package:', pkgLine, '',
      'Delivery Method:', deliveryLabel(order.delivery_type), '',
      'Courier:', courier, '',
      'Delivery Address:', addr, '',
      (order.courier_reference ? 'Courier Booking Ref:\n' + order.courier_reference + '\n' : '') +
      'Total:', amt(sum.total), '',
      'Thank you.'
    ];
    return L.join('\n');
  }

  function copyText(t) {
    if (navigator.clipboard && navigator.clipboard.writeText) return navigator.clipboard.writeText(t).catch(fb);
    return fb();
    function fb() {
      try { var ta = document.createElement('textarea'); ta.value = t; ta.style.position = 'fixed'; ta.style.opacity = '0';
        document.body.appendChild(ta); ta.select(); document.execCommand('copy'); document.body.removeChild(ta); } catch (e) {}
      return Promise.resolve();
    }
  }
  function loadBtn(b, on) {
    if (on) { b.dataset.html = b.innerHTML; b.classList.add('loading'); b.disabled = true; b.innerHTML = '<span>Opening…</span>'; }
    else { if (b.dataset.html) b.innerHTML = b.dataset.html; b.classList.remove('loading'); b.disabled = false; }
  }

  function fbReady() { return window.fbAuth && window.fbDb && window.fbStorage; }
  function money(n) { return window.fmtPHP(n); }

  function genOrderId() {
    var c = 'ABCDEFGHIJKLMNPQRSTUVWXYZ23456789', id = 'OL-';
    for (var i = 0; i < 6; i++) id += c[Math.floor(Math.random() * c.length)];
    return id;
  }

  function feeFor(type, subtotal) {
    if (type === 'grab' || type === 'lalamove') return 0;   // paid directly to courier
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
          '<div class="co-step" data-s="0"><div class="co-step-dot">✓</div><div class="co-step-label">Cart</div></div>' +
          '<div class="co-step-line" data-l="0"></div>' +
          '<div class="co-step" data-s="1"><div class="co-step-dot">1</div><div class="co-step-label">Delivery</div></div>' +
          '<div class="co-step-line" data-l="1"></div>' +
          '<div class="co-step" data-s="2"><div class="co-step-dot">2</div><div class="co-step-label">Payment</div></div>' +
          '<div class="co-step-line" data-l="2"></div>' +
          '<div class="co-step" data-s="3"><div class="co-step-dot">3</div><div class="co-step-label">Courier</div></div>' +
          '<div class="co-step-line" data-l="3"></div>' +
          '<div class="co-step" data-s="4"><div class="co-step-dot">4</div><div class="co-step-label">Complete</div></div>' +
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
            fld('coName', 'Full Name', 'text', 'full', 'Juana Dela Cruz', '', 'name') +
            fld('coEmail', 'Email', 'email', 'full', 'you@email.com', '', 'email') +
            fld('coPhone', 'Phone Number', 'tel', 'full', '+63 9XX XXX XXXX', 'Use +63XXXXXXXXXX or 09XXXXXXXXX', 'tel', 'tel') +
            fld('coStreet', 'Street Address', 'text', 'full', 'House no., street', '', 'address-line1') +
            fld('coBarangay', 'Barangay', 'text', '', 'Barangay', '', 'address-line2') +
            fld('coCity', 'City / Municipality', 'text', '', 'City', '', 'address-level2') +
            fld('coProvince', 'Province', 'text', '', 'Province', '', 'address-level1') +
            fld('coZip', 'ZIP Code', 'text', '', '0000', '', 'postal-code', 'numeric') +
          '</div>' +
          '<div class="co-delivery" role="radiogroup" aria-label="Delivery method">' +
            dcard('grab', '🚚 GrabExpress · Same-Day', 'Metro Manila · fastest dispatch', 'Paid to Grab') +
            dcard('lalamove', '🛵 Lalamove · Same-Day', 'Metro Manila · fastest dispatch', 'Paid to Lalamove') +
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

        /* STEP 3 — courier booking (only shown for Grab / Lalamove) */
        '<div class="co-panel" id="coStep3">' +
          '<div id="coCourierBox"></div>' +
          '<div class="co-loading" id="coCourierLoading"><span class="co-spin"></span> Placing your order…</div>' +
        '</div>' +

        /* STEP 4 — order complete (premium) + priority order confirmation */
        '<div class="co-panel" id="coStep4">' +
          '<div class="co-confirm oc-confirm">' +
            '<svg class="co-check-svg" viewBox="0 0 96 96"><circle class="ring" cx="48" cy="48" r="42"/><path class="tick" d="M30 49 L43 62 L67 36"/></svg>' +
            '<div class="co-cfade">' +
              '<h2>Order Successfully Received</h2>' +
              '<div class="thanks" id="coThanks"></div>' +

              '<div class="oc-meta">' +
                '<div class="oc-mi"><span class="l">Order Number</span><span class="v"><span id="coOrderId"></span><button class="co-copy" id="coCopy" aria-label="Copy order number">Copy</button></span></div>' +
                '<div class="oc-mi"><span class="l">Order Date</span><span class="v" id="coOrderDate"></span></div>' +
                '<div class="oc-mi"><span class="l">Processing</span><span class="v" id="coProcTime"></span></div>' +
              '</div>' +

              '<div class="oc-card">' +
                '<div class="oc-ct">Order Summary</div>' +
                '<div class="oc-kv" id="coSummary3"></div>' +
                '<hr class="co-hr">' +
                '<div class="co-items" id="coItems3"></div>' +
                '<div class="co-total" style="margin-top:8px;"><span class="lbl">Total</span><span class="amt" id="coTotal3"></span></div>' +
              '</div>' +

              /* Priority Order Confirmation — optional premium concierge */
              '<div class="poc">' +
                '<div class="poc-head"><div class="poc-eyebrow">Optional · Concierge</div>' +
                  '<h3>Priority Order Confirmation</h3>' +
                  '<div class="poc-sub">Fast-track your order verification and dispatch.</div></div>' +
                '<p class="poc-desc">Your order has been successfully received. For even faster verification and preparation, you may optionally send your order details directly to our fulfillment team via WhatsApp. Our team can immediately match your message with your order, allowing us to begin verification and preparation more efficiently. This step is completely optional but recommended for same-day processing.</p>' +
                '<div class="poc-benefits">' +
                  pocBenefit('Faster order verification') +
                  pocBenefit('Faster dispatch preparation') +
                  pocBenefit('Direct communication with our fulfillment team') +
                  pocBenefit('Easier order tracking') +
                '</div>' +
                '<button class="oc-cbtn oc-wa poc-wa" id="coWhatsapp" type="button">' + WA_ICO + '<span>Send Order Details via WhatsApp</span></button>' +
                '<div class="poc-note">This step is optional. Your order has already been received successfully. Sending your order details via WhatsApp simply allows our team to identify your order immediately and begin verification and preparation more quickly.</div>' +
                '<div class="poc-secondary">' +
                  '<button class="oc-cbtn oc-viber" id="coViber" type="button">' + VIBER_ICO + '<span>Send via Viber</span></button>' +
                  '<button class="oc-copyorder" id="coCopyOrder" type="button" style="margin-top:0;">📋 Copy Order Details</button>' +
                '</div>' +
              '</div>' +

              '<div class="poc-reassure" id="coReassure"></div>' +
              '<div class="co-disc">OPTIMA Labs products are supplied for personal wellness use under professional guidance. Statements have not been evaluated by the FDA. All sales are final.</div>' +
              '<div class="co-actions">' +
                '<button class="co-btn" style="margin-top:0;" id="coShop">Continue Shopping</button>' +
                '<button class="btn btn-ghost" id="coOrders" style="display:none;">Track My Order</button>' +
                '<button class="btn btn-ghost" id="coDone">Close</button>' +
              '</div>' +
            '</div>' +
          '</div>' +
        '</div>' +

      '</div>' +
    '</div>';
  }

  function fld(id, label, type, extra, ph, hint, ac, inputmode) {
    return '<div class="co-field ' + (extra || '') + '" data-for="' + id + '">' +
      '<label for="' + id + '">' + label + ' <span class="req" aria-hidden="true">*</span></label>' +
      '<input id="' + id + '" type="' + type + '" placeholder="' + (ph || '') + '"' +
        (ac ? ' autocomplete="' + ac + '"' : '') +
        (inputmode ? ' inputmode="' + inputmode + '"' : '') +
        ' aria-required="true" aria-describedby="' + id + '-err">' +
      '<span class="co-err" id="' + id + '-err" role="alert">' + (hint || 'This field is required') + '</span>' +
    '</div>';
  }
  function dcard(val, title, sub, meta) {
    return '<div class="co-dcard' + (val === 'standard' ? ' sel' : '') + '" data-type="' + val + '"' +
        ' role="radio" tabindex="0" aria-checked="' + (val === 'standard' ? 'true' : 'false') + '">' +
      '<div class="co-dradio"></div>' +
      '<div class="co-dmain"><div class="co-dtitle">' + title + '</div><div class="co-dsub">' + sub + '</div></div>' +
      '<div class="co-dmeta">' + meta + '</div>' +
    '</div>';
  }
  var CHECK_SM = '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg>';
  function pocBenefit(t) { return '<div class="poc-benefit">' + CHECK_SM + '<span>' + t + '</span></div>'; }
  function cxRow(k, v) { return '<div class="cx-row"><span class="cx-k">' + k + '</span><span class="cx-v">' + v + '</span></div>'; }

  /* Premium courier-booking card (Grab / Lalamove) for the Courier step. */
  function renderCourier() {
    var m = courierMeta(deliveryType);
    document.getElementById('coCourierBox').innerHTML =
      '<div class="co-title">Same-Day Delivery via ' + m.name + '</div>' +
      '<span class="cx-badge">🚚 Same-Day Delivery Available</span>' +
      '<p class="cx-desc">Your order qualifies for same-day delivery within Metro Manila. To ensure the fastest possible ' +
        'dispatch, please arrange your courier using ' + m.name + ' through the secure booking link below.<br><br>' +
        'Delivery fees are paid directly to ' + m.payee + ' by the customer. Optima Labs does not collect or manage courier fees.</p>' +
      '<div class="cx-summary">' +
        cxRow('Courier', m.name) +
        cxRow('Delivery Speed', 'Same-Day') +
        cxRow('Coverage', 'Metro Manila') +
        cxRow('Delivery Fee', 'Paid Directly to ' + m.payee) +
      '</div>' +
      '<a class="co-btn cx-book" href="' + m.link + '" target="_blank" rel="noopener">' + m.book + ' ↗</a>' +
      '<div class="cx-next"><div class="cx-next-t">Next Step</div>' +
        '<p>After completing your ' + m.name + ' booking, return to this page and confirm your courier booking below. ' +
        'This allows our fulfillment team to prepare your order immediately.</p></div>' +
      '<div class="co-field full" style="margin-top:16px;">' +
        '<label for="coCourierRef">' + m.refLabel + ' <span style="font-weight:500;color:var(--ink-soft);">(optional)</span></label>' +
        '<input id="coCourierRef" type="text" placeholder="' + m.refPh + '"></div>' +
      '<button class="co-btn cx-confirm" id="coCourierConfirm">' + m.confirm + '</button>' +
      '<button class="co-back" id="coCourierBack">&larr; Back to payment</button>';
    document.getElementById('coCourierConfirm').addEventListener('click', confirmCourier);
    document.getElementById('coCourierBack').addEventListener('click', function () { setStep(2); });
  }

  /* ---------- step / progress ---------- */
  function setStep(n) {
    currentStep = n;
    ['coGate', 'coStep1', 'coStep2', 'coStep3', 'coStep4'].forEach(function (id) {
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
        i.name + ' · ' + i.dosage +
        (i.packageId && i.packageId !== 'peptide-only' ? '<br><span class="co-ipkg">' + i.packageName + '</span>' : '') +
        '</span><span>' + money(i.price * i.qty) + '</span></div>';
    }).join('');

    document.getElementById('coItems').innerHTML = rows;
    document.getElementById('coSubtotal').textContent = money(subtotal);
    document.getElementById('coFee').innerHTML = isCourier(deliveryType)
      ? '<span class="free">Paid to ' + courierMeta(deliveryType).payee + '</span>'
      : (fee === 0 ? '<span class="free">FREE 🎉</span>' : money(fee));
    document.getElementById('coTotal').textContent = money(total);
    document.getElementById('coPayAmt').textContent = money(total);
    return { subtotal: subtotal, fee: fee, total: total, items: items };
  }

  /* ---------- validation ---------- */
  var REQUIRED = ['coName', 'coEmail', 'coPhone', 'coStreet', 'coBarangay', 'coCity', 'coProvince', 'coZip'];
  function invalid(id, on) {
    document.querySelector('[data-for="' + id + '"]').classList.toggle('invalid', on);
  }
  function fieldValid(id) {
    var v = (document.getElementById(id).value || '').trim();
    if (id === 'coEmail') return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
    if (id === 'coPhone') return /^(\+63|0)[0-9]{10}$/.test(v.replace(/[\s-]/g, ''));
    return !!v;
  }
  function validateStep1(focusFirst) {
    var firstBad = null;
    REQUIRED.forEach(function (id) {
      var bad = !fieldValid(id);
      invalid(id, bad);
      if (bad && !firstBad) firstBad = id;
    });
    if (firstBad && focusFirst) document.getElementById(firstBad).focus(); // jump to first error
    return !firstBad;
  }

  /* ---------- upload ---------- */
  function resetUpload() {
    proofFile = null; proofUrl = null; proofPath = null;
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
    proofPath = ref.fullPath;
    var task = ref.put(file, { contentType: file.type });
    task.on('state_changed',
      function (snap) { bar.style.width = (snap.bytesTransferred / snap.totalBytes * 100).toFixed(0) + '%'; },
      function (err) {
        console.error(err);
        // Surface the real reason so it's actionable (e.g. storage/unauthorized = rules).
        window.showToast('Upload failed: ' + (err && (err.code || err.message) || 'please try again') + '.');
        resetUpload();
      },
      function () {
        // Upload (write) succeeded — unblock the order immediately using a local
        // preview. The public download URL is best-effort: if reading it is
        // blocked by rules, we still submit the order with the storage path so
        // the admin can retrieve the file. This never leaves the user stuck.
        prog.classList.remove('on');
        var pv = document.getElementById('coPreview'); pv.classList.add('on');
        try { document.getElementById('coThumb').src = URL.createObjectURL(file); } catch (e) {}
        document.getElementById('coConfirm').disabled = false;
        task.snapshot.ref.getDownloadURL()
          .then(function (url) { proofUrl = url; document.getElementById('coThumb').src = url; })
          .catch(function (e) { console.warn('getDownloadURL blocked; storing path instead', e); proofUrl = null; });
      });
  }

  /* ---------- confirm / write order ---------- */
  function buildOrder() {
    var sum = renderSummary();
    var addr = {
      street: document.getElementById('coStreet').value.trim(),
      barangay: document.getElementById('coBarangay').value.trim(),
      city: document.getElementById('coCity').value.trim(),
      province: document.getElementById('coProvince').value.trim(),
      zip: document.getElementById('coZip').value.trim()
    };
    var courier = isCourier(deliveryType) ? courierMeta(deliveryType).name : null;
    var order = {
      order_id: tempOrderId,
      customer_name: document.getElementById('coName').value.trim(),
      customer_email: document.getElementById('coEmail').value.trim(),
      customer_phone: document.getElementById('coPhone').value.replace(/[\s-]/g, ''),
      delivery_address: addr,
      delivery_type: deliveryType,
      delivery_method: deliveryLabel(deliveryType),
      courier: courier,
      courier_reference: null,
      courier_booked: isCourier(deliveryType) ? false : null,
      delivery_fee: sum.fee,
      items: sum.items,
      subtotal: sum.subtotal,
      total: sum.total,
      payment_proof_url: proofUrl,
      payment_proof_path: proofPath,
      payment_status: 'pending',
      order_status: 'pending',
      notes: document.getElementById('coNotes').value.trim(),
      created_at: firebase.firestore.FieldValue.serverTimestamp(),
      updated_at: firebase.firestore.FieldValue.serverTimestamp()
    };
    return { order: order, sum: sum };
  }

  // Non-courier orders are placed here at payment; courier orders defer the
  // write to the courier-booking step (so the booking reference is captured
  // in the single create — Firestore rules don't allow a client-side update).
  function confirmOrder() {
    if (!proofPath) return;   // upload must have completed (URL is best-effort)
    var built = buildOrder();
    stashOrder = built.order; stashSum = built.sum;
    if (isCourier(deliveryType)) {
      renderCourier();
      setStep(3);
    } else {
      writeAndComplete(built.order, built.sum, {
        busy: 'coLoading',
        hide: [document.getElementById('coConfirm'), document.getElementById('coBack')]
      });
    }
  }

  function confirmCourier() {
    if (!stashOrder) return;
    var ref = (document.getElementById('coCourierRef').value || '').trim();
    stashOrder.courier_reference = ref || null;
    stashOrder.courier_booked = true;
    writeAndComplete(stashOrder, stashSum, {
      busy: 'coCourierLoading',
      hide: [document.getElementById('coCourierConfirm'), document.getElementById('coCourierBack'),
             document.querySelector('#coCourierBox .cx-book')]
    });
  }

  function writeAndComplete(order, sum, opts) {
    var busy = opts.busy ? document.getElementById(opts.busy) : null;
    (opts.hide || []).forEach(function (el) { if (el) el.style.display = 'none'; });
    if (busy) busy.classList.add('on');

    window.fbDb.collection('orders').add(order).then(function (ref) {
      orderDocId = ref.id;
      if (busy) busy.classList.remove('on');
      showConfirmation(order, sum);
      window.cartAPI.clear();
    }).catch(function (err) {
      console.error('Order write failed:', err);
      // 'permission-denied' = rules not deployed; 'unavailable'/'not-found' = Firestore off.
      window.showToast('Could not place the order: ' + (err && (err.code || err.message) || 'try again') + '.');
      if (busy) busy.classList.remove('on');
      (opts.hide || []).forEach(function (el) { if (el) el.style.display = ''; });
    });
  }

  function showConfirmation(order, sum) {
    var first = (order.customer_name || '').split(' ')[0] || 'friend';
    var a = order.delivery_address || {};
    var addr = [a.street, a.barangay, a.city, a.province, a.zip].filter(Boolean).join(', ');
    var dateStr = new Date().toLocaleString('en-PH', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    order._dateStr = dateStr;   // keep the WhatsApp message date consistent
    var courier = order.courier || (isCourier(order.delivery_type) ? courierMeta(order.delivery_type).name : '—');
    function kv(k, v) { return '<div class="oc-line"><span class="oc-lk">' + k + '</span><span class="oc-lv">' + v + '</span></div>'; }

    document.getElementById('coThanks').textContent =
      'Thank you, ' + first + '! Your order has been received and is awaiting verification.';
    document.getElementById('coOrderId').textContent = order.order_id;
    document.getElementById('coOrderDate').textContent = dateStr;
    document.getElementById('coProcTime').textContent = '2–4 hours';

    var rows = (sum.items || []).map(function (i) {
      return '<div class="co-item"><span class="co-iname"><span class="co-iqty">' + i.qty + '× </span>' +
        i.name + ' · ' + i.dosage +
        (i.packageId && i.packageId !== 'peptide-only' ? '<br><span class="co-ipkg">' + i.packageName + '</span>' : '') +
        '</span><span>' + money(i.price * i.qty) + '</span></div>';
    }).join('');
    document.getElementById('coItems3').innerHTML = rows;
    document.getElementById('coTotal3').textContent = money(sum.total);

    document.getElementById('coSummary3').innerHTML =
      kv('Customer Name', order.customer_name) +
      kv('Delivery Method', deliveryLabel(order.delivery_type)) +
      kv('Courier', courier) +
      kv('Delivery Address', addr) +
      kv('Payment Status', 'Pending Verification') +
      (order.courier_reference ? kv('Courier Booking Ref', order.courier_reference) : '');

    document.getElementById('coReassure').textContent =
      'Thank you for choosing Optima Labs. Your order has been received successfully and is currently awaiting verification. ' +
      'We\'ll keep you updated as your order progresses through verification, preparation, and dispatch.';

    // Build the shareable order message from the real order data.
    orderMsg = buildOrderMessage(order, sum);

    // Show "Track My Order" only when signed in (links to order tracking).
    var ordersBtn = document.getElementById('coOrders');
    if (ordersBtn) ordersBtn.style.display = (window.fbAuth && window.fbAuth.currentUser) ? '' : 'none';

    setStep(4);
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
    overlay.querySelectorAll('.co-dcard').forEach(function (el) {
      var on = el.dataset.type === 'standard';
      el.classList.toggle('sel', on); el.setAttribute('aria-checked', on ? 'true' : 'false');
    });
    resetUpload();
    var cc = document.getElementById('coConfirm');
    cc.style.display = ''; cc.textContent = 'Confirm My Order';
    document.getElementById('coBack').style.display = '';
    tempOrderId = null; stashOrder = null; stashSum = null; orderDocId = null;
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

    function selectDelivery(card) {
      deliveryType = card.dataset.type;
      overlay.querySelectorAll('.co-dcard').forEach(function (c) {
        c.classList.remove('sel'); c.setAttribute('aria-checked', 'false');
      });
      card.classList.add('sel'); card.setAttribute('aria-checked', 'true');
      renderSummary();
    }
    overlay.querySelectorAll('.co-dcard').forEach(function (card) {
      card.addEventListener('click', function () { selectDelivery(card); });
      card.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); selectDelivery(card); }
      });
    });

    document.getElementById('coToPay').addEventListener('click', function () {
      if (validateStep1(true)) {
        renderSummary();
        document.getElementById('coConfirm').textContent = isCourier(deliveryType) ? 'Continue to Courier Booking →' : 'Confirm My Order';
        setStep(2);
      } else {
        var b = this; b.classList.add('shake'); setTimeout(function () { b.classList.remove('shake'); }, 420);
        window.showToast('Please complete the highlighted fields.');
      }
    });

    // Inline validation: flag format errors on blur (only if the field has
    // content, so we don't nag empty fields early); clear the error as the
    // user corrects it. Full check still runs on submit.
    REQUIRED.forEach(function (id) {
      var el = document.getElementById(id);
      if (!el) return;
      el.addEventListener('blur', function () { if (el.value.trim()) invalid(id, !fieldValid(id)); });
      el.addEventListener('input', function () { invalid(id, false); });
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
    document.getElementById('coOrders').addEventListener('click', function () { window.location.href = 'track-order.html'; });

    // Viber: personal chats can't be pre-filled, so copy the order details,
    // tell the user, then open the Viber conversation.
    document.getElementById('coViber').addEventListener('click', function () {
      var b = this; loadBtn(b, true);
      copyText(orderMsg);
      window.showToast('Your order details have been copied. Paste the message into Viber and press Send.');
      setTimeout(function () { window.location.href = 'viber://chat?number=%2B' + VB_DIGITS; loadBtn(b, false); }, 350);
    });

    // WhatsApp: officially supports a pre-filled message via wa.me.
    document.getElementById('coWhatsapp').addEventListener('click', function () {
      var b = this; loadBtn(b, true);
      var url = 'https://wa.me/' + WA_DIGITS + '?text=' + encodeURIComponent(orderMsg);
      setTimeout(function () { window.open(url, '_blank', 'noopener'); loadBtn(b, false); }, 300);
    });

    // Copy the full formatted order message.
    document.getElementById('coCopyOrder').addEventListener('click', function () {
      copyText(orderMsg); window.showToast('Order details copied successfully.');
    });
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
