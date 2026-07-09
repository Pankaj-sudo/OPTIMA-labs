/* ================================================================
   OPTIMA LABS — Self-Assessment controller (UI + flow)
   ----------------------------------------------------------------
   Drives the multi-step, rule-based self-assessment on assessment.html.
   - Reads its rule table from window.ASSESSMENT_CONFIG (data).
   - Calls window.recommendationEngine.recommend() (pure) for results.
   - Reuses the store's cart (window.cartAPI) and the checkout markup
     patterns (.co-qr / .co-drop upload) for the consultation payment.
   - Writes assessments + consultations to Firestore under an anonymous
     auth session (same "any signed-in user" rule the store's orders use).

   SAFETY: informational only. Copy uses "recommended / may support /
   based on your responses" — never diagnosis, treatment or prescription.
   If any safety box is checked the flow stops before the engine and only
   a specialist-consultation path is offered.
   ================================================================ */
(function () {
  var CFG = window.ASSESSMENT_CONFIG || {};
  var LS_KEY = 'optima_assessment_v1';
  var STEPS = ['profile', 'goals', 'lifestyle', 'experience', 'medical', 'safety']; // progress-tracked
  var MAX_PRODUCTS = 2;   // max Recommended Wellness Peptides shown on results
  var app, products = [], productsReady = false;

  var STATE = {
    step: 'welcome',
    answers: { profile: {}, goals: [], lifestyle: {}, experience: {}, medical: {}, safety: [] },
    assessmentSaved: false,
    booking: { method: 'Video Call' },
    proof: { file: null, url: null, path: null, type: null },
    lab: { file: null, url: null, path: null, type: null },   // optional lab-results upload
    submitting: false
  };

  /* ---------- persistence (auto-save) ---------- */
  function save() {
    try { localStorage.setItem(LS_KEY, JSON.stringify({ step: STATE.step, answers: STATE.answers })); } catch (e) {}
    flashSaved();
  }
  function load() {
    try {
      var raw = JSON.parse(localStorage.getItem(LS_KEY));
      if (raw && raw.answers) {
        STATE.answers = Object.assign({ profile: {}, goals: [], lifestyle: {}, experience: {}, medical: {}, safety: [] }, raw.answers);
        // resume on a questionnaire step, never mid-results
        if (raw.step && STEPS.indexOf(raw.step) >= 0) STATE.step = raw.step;
      }
    } catch (e) {}
  }

  /* ---------- small helpers ---------- */
  function $(id) { return document.getElementById(id); }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
    return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function money(n) { return window.fmtPHP ? window.fmtPHP(n) : '₱' + Number(n || 0).toFixed(2); }
  function toast(m) { if (window.showToast) window.showToast(m); }
  var CHK = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>';
  var INFO = '<svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.6"><circle cx="10" cy="10" r="8"/><path d="M10 9v5M10 6.2v.2" stroke-linecap="round"/></svg>';

  function flashSaved() {
    var s = $('asvSaved'); if (!s) return;
    s.classList.add('show'); clearTimeout(s._t); s._t = setTimeout(function () { s.classList.remove('show'); }, 1600);
  }

  /* single-select chip group */
  function chips(group, opts, val) {
    return '<div class="asv-opts" role="radiogroup">' + opts.map(function (o) {
      var sel = String(val) === String(o);
      return '<button type="button" class="asv-opt' + (sel ? ' sel' : '') + '" role="radio" aria-checked="' + sel + '"' +
        ' data-group="' + esc(group) + '" data-val="' + esc(o) + '">' + esc(o) + '</button>';
    }).join('') + '</div>';
  }

  /* ---------- progress ---------- */
  function updateProgress() {
    var wrap = $('asvProgressWrap');
    var idx = STEPS.indexOf(STATE.step);
    if (idx < 0) { wrap.hidden = true; return; }
    wrap.hidden = false;
    var pct = Math.round(((idx + 1) / STEPS.length) * 100);
    $('asvProgressStep').textContent = 'Step ' + (idx + 1) + ' of ' + STEPS.length;
    $('asvProgressPct').textContent = pct + '%';
    var bar = $('asvProgressBar');
    bar.firstElementChild.style.width = pct + '%';
    bar.setAttribute('aria-valuenow', String(pct));
  }

  /* ================= STEP RENDERERS ================= */
  function render() {
    var fn = ({
      welcome: stepWelcome, profile: stepProfile, goals: stepGoals, lifestyle: stepLifestyle,
      experience: stepExperience, medical: stepMedical, safety: stepSafety, safetyStop: stepSafetyStop, results: stepResults
    })[STATE.step] || stepWelcome;
    fn();
    updateProgress();
    try { window.scrollTo({ top: 0, behavior: 'smooth' }); } catch (e) { window.scrollTo(0, 0); }
  }

  function actions(opts) {
    // opts: { back:bool, nextLabel, nextId }
    return '<div class="asv-actions">' +
      (opts.back ? '<button type="button" class="asv-back" id="asvBack">&larr; Back</button>' : '') +
      '<button type="button" class="btn btn-primary grow" id="' + (opts.nextId || 'asvNext') + '">' + (opts.nextLabel || 'Continue') + '</button>' +
      '<span class="asv-saved" id="asvSaved"><i></i>Saved</span>' +
    '</div>';
  }

  function stepWelcome() {
    app.innerHTML =
      '<div class="asv-step asv-stop" style="text-align:left;">' +
        '<span class="asv-eyebrow">Educational Consultation</span>' +
        '<h2>Find the right peptide wellness ritual that fit your goals</h2>' +
        '<p class="lead">This short, educational self-assessment takes about 3–5 minutes. Based on your responses, ' +
          'we\'ll suggest wellness peptides that people with similar goals commonly explore. It helps you discover ' +
          'options — it is <b>not</b> a diagnosis, prescription, or a substitute for professional medical advice.</p>' +
        '<div class="asv-note">' + INFO + '<span>Your answers are saved on this device as you go, so you can pick up where you left off. ' +
          'Nothing here should replace guidance from a qualified healthcare professional.</span></div>' +
        '<div class="asv-actions"><button type="button" class="btn btn-primary grow" id="asvStart">Start Assessment</button></div>' +
        (hasDraft() ? '<button type="button" class="asv-back" id="asvReset" style="margin-top:6px;">Start over (clear saved answers)</button>' : '') +
      '</div>';
    $('asvStart').addEventListener('click', function () { goTo(resumeStep()); });
    if ($('asvReset')) $('asvReset').addEventListener('click', resetAll);
  }
  function hasDraft() { return answered(); }
  function answered() {
    var a = STATE.answers;
    return (a.goals && a.goals.length) || Object.keys(a.profile || {}).length || Object.keys(a.lifestyle || {}).length;
  }
  function resumeStep() {
    // if the user had progressed, resume at their saved questionnaire step; else profile
    return (STEPS.indexOf(STATE.step) >= 0) ? STATE.step : 'profile';
  }

  function stepProfile() {
    var p = STATE.answers.profile, o = CFG.options;
    app.innerHTML =
      '<div class="asv-step">' +
        '<span class="asv-eyebrow">Step 2 · About you</span>' +
        '<h2>A little about you</h2>' +
        '<p class="lead">This helps us tailor the suggestions to your profile.</p>' +
        group('Age range', chips('profile.ageRange', o.ageRange, p.ageRange)) +
        group('Sex', chips('profile.sex', o.sex, p.sex)) +
        '<div class="asv-group"><div class="asv-inrow">' +
          field('profile.height', 'Height (cm)', p.height, 'e.g. 168', 'decimal') +
          field('profile.weight', 'Weight (kg)', p.weight, 'e.g. 65', 'decimal') +
        '</div></div>' +
        '<div class="asv-group">' + field('profile.country', 'Country', p.country, 'e.g. Philippines') + '</div>' +
        group('Previous peptide experience', chips('profile.experience', o.experience, p.experience)) +
        '<div class="asv-err" id="asvErr">Please complete the highlighted questions to continue.</div>' +
        actions({ back: true, nextLabel: 'Continue' }) +
      '</div>';
    wireCommon();
  }

  function stepGoals() {
    var sel = STATE.answers.goals || [];
    app.innerHTML =
      '<div class="asv-step">' +
        '<span class="asv-eyebrow">Step 3 · Your goals</span>' +
        '<h2>What are you hoping to support?</h2>' +
        '<p class="lead">Select everything that applies — we\'ll match categories to what matters most to you.</p>' +
        '<div class="asv-goals" role="group" aria-label="Primary goals" style="margin-top:22px;">' +
          (CFG.goals || []).map(function (g) {
            var on = sel.indexOf(g.id) >= 0;
            return '<button type="button" class="asv-goal' + (on ? ' sel' : '') + '" role="checkbox" aria-checked="' + on + '" data-goal="' + esc(g.id) + '">' +
              '<span class="g-check">' + CHK + '</span>' +
              '<span class="g-title">' + esc(g.label) + '</span>' +
              '<span class="g-hint">' + esc(g.hint) + '</span>' +
            '</button>';
          }).join('') +
        '</div>' +
        '<div class="asv-err" id="asvErr">Please choose at least one goal to continue.</div>' +
        actions({ back: true, nextLabel: 'Continue' }) +
      '</div>';
    app.querySelectorAll('.asv-goal').forEach(function (b) {
      b.addEventListener('click', function () {
        var id = b.dataset.goal, arr = STATE.answers.goals, i = arr.indexOf(id);
        if (i >= 0) arr.splice(i, 1); else arr.push(id);
        var on = arr.indexOf(id) >= 0;
        b.classList.toggle('sel', on); b.setAttribute('aria-checked', String(on));
        $('asvErr').classList.remove('show'); save();
      });
    });
    wireCommon();
  }

  function stepLifestyle() {
    var l = STATE.answers.lifestyle, o = CFG.options;
    app.innerHTML =
      '<div class="asv-step">' +
        '<span class="asv-eyebrow">Step 4 · Lifestyle</span>' +
        '<h2>Your everyday rhythm</h2>' +
        '<p class="lead">Context that helps us suggest what fits your routine.</p>' +
        group('Exercise frequency', chips('lifestyle.exercise', o.exercise, l.exercise)) +
        group('Sleep quality', chips('lifestyle.sleepQuality', o.sleepQuality, l.sleepQuality)) +
        group('Stress level', chips('lifestyle.stress', o.stress, l.stress)) +
        group('Daily water intake', chips('lifestyle.water', o.water, l.water)) +
        group('Nutrition', chips('lifestyle.nutrition', o.nutrition, l.nutrition)) +
        group('Do you smoke?', chips('lifestyle.smoking', o.yesNo, l.smoking)) +
        group('Do you drink alcohol?', chips('lifestyle.alcohol', o.yesNo, l.alcohol)) +
        '<div class="asv-err" id="asvErr">Please answer each question to continue.</div>' +
        actions({ back: true, nextLabel: 'Continue' }) +
      '</div>';
    wireCommon();
  }

  function stepExperience() {
    var e = STATE.answers.experience, o = CFG.options;
    var mm = e.metroManila;                                   // 'Yes' | 'No' | undefined
    // Pen delivery is Metro-Manila-only → when "No", offer vial options only.
    var formatOpts = mm === 'No' ? ['Wellness Vial', 'No Preference'] : o.format;
    if (e.format && formatOpts.indexOf(e.format) < 0) delete e.format;   // drop a now-unavailable pick
    app.innerHTML =
      '<div class="asv-step">' +
        '<span class="asv-eyebrow">Step 5 · Experience</span>' +
        '<h2>Preferences</h2>' +
        '<p class="lead">Your comfort level and how you prefer to work with wellness peptides.</p>' +
        group('Experience level', chips('profile.experience', o.experience, STATE.answers.profile.experience)) +
        group('Are you currently located in Metro Manila?', chips('experience.metroManila', o.metroManila, mm)) +
        group('Preferred product format', chips('experience.format', formatOpts, e.format)) +
        (mm === 'No'
          ? '<div class="asv-note">' + INFO + '<span>Pen delivery is currently available within Metro Manila only, so we\'re showing vial options for your location.</span></div>'
          : '<div class="asv-note">' + INFO + '<span>Format is a preference only and doesn\'t change which wellness peptides are surfaced — it helps us note what suits you.</span></div>') +
        '<div class="asv-err" id="asvErr">Please make a selection to continue.</div>' +
        actions({ back: true, nextLabel: 'Continue' }) +
      '</div>';
    wireCommon();
    // Changing the Metro Manila answer re-filters the format options → re-render.
    app.querySelectorAll('.asv-opt[data-group="experience.metroManila"]').forEach(function (b) {
      b.addEventListener('click', function () { stepExperience(); });
    });
  }

  function stepMedical() {
    var m = STATE.answers.medical, o = CFG.options;
    app.innerHTML =
      '<div class="asv-step">' +
        '<span class="asv-eyebrow">Step 6 · Medical &amp; history</span>' +
        '<h2>Your medical background</h2>' +
        '<div class="asv-notice">' + INFO + '<span>Please answer every question honestly and accurately. Your responses are used to ' +
          'personalize your peptide recommendation and help provide the safest and most appropriate protocol for your needs.</span></div>' +
        '<div class="asv-group">' + textArea('medical.pastHistory', 'Past medical history', m.pastHistory, 'Previous illnesses, surgeries or hospitalisations — or “none”…') + '</div>' +
        '<div class="asv-group">' + textArea('medical.currentConditions', 'Current medical conditions or diagnoses', m.currentConditions, 'e.g. hypertension, PCOS — or “none”…') + '</div>' +
        group('Family medical history (parents)', multiChips('medical.family', o.familyConditions, m.family)) +
        '<div class="asv-group" style="margin-top:2px;">' + textArea('medical.familyNotes', 'Other family history', m.familyNotes, 'Anything else about your parents’ health…', true) + '</div>' +
        '<div class="asv-group">' + textArea('medical.medications', 'Current maintenance medications', m.medications, 'Medications you take regularly — or “none”…') + '</div>' +
        '<div class="asv-group">' + textArea('medical.supplements', 'Current supplements', m.supplements, 'Supplements you take — or “none”…') + '</div>' +
        '<div class="asv-group asv-lab">' +
          '<span class="asv-label">Recent lab results <span class="opt">(optional)</span></span>' +
          '<div class="asv-field" style="margin-bottom:12px;"><label for="labDate">Date of your most recent labs</label>' +
            '<input id="labDate" type="date" max="' + todayISO() + '" value="' + esc(m.labDate || '') + '"></div>' +
          '<div class="co-drop" id="labDrop">' +
            '<div class="ico">📎</div><div class="t1">Upload lab results</div><div class="t2">or click to browse</div>' +
            '<div class="t3">JPG, PNG or PDF · Max 10MB · dated within the last 3 months</div>' +
            '<input type="file" id="labFile" accept="image/*,application/pdf" hidden></div>' +
          '<div class="co-progress" id="labProg"><span></span></div>' +
          '<div class="co-preview" id="labPreview"><img id="labThumb" alt="Lab results preview">' +
            '<div><div class="ok">✓ Lab results uploaded</div><span class="change" id="labChange">Change file</span></div></div>' +
          '<div class="asv-labmsg" id="labMsg">' + INFO + '<span>These results appear to be more than 3 months old. For an accurate assessment, ' +
            'please upload lab results from within the last 3 months.</span></div>' +
        '</div>' +
        '<div class="asv-err" id="asvErr">Please complete the required fields to continue.</div>' +
        actions({ back: true, nextLabel: 'Continue' }) +
      '</div>';

    // multi-select family history
    app.querySelectorAll('.asv-opt[data-multi]').forEach(function (b) {
      b.addEventListener('click', function () {
        var parts = b.dataset.multi.split('.'), obj = STATE.answers;
        obj[parts[0]] = obj[parts[0]] || {}; obj[parts[0]][parts[1]] = obj[parts[0]][parts[1]] || [];
        var arr = obj[parts[0]][parts[1]], v = b.dataset.val, i = arr.indexOf(v);
        if (i >= 0) arr.splice(i, 1); else arr.push(v);
        var on = arr.indexOf(v) >= 0;
        b.classList.toggle('sel', on); b.setAttribute('aria-checked', String(on));
        var err = $('asvErr'); if (err) err.classList.remove('show'); save();
      });
    });

    // optional lab results: date (3-month rule) + file upload
    var ld = $('labDate');
    if (ld) ld.addEventListener('change', function () {
      var msg = $('labMsg');
      if (ld.value && !within3Months(ld.value)) {         // older than 3 months → reject
        if (msg) msg.classList.add('show');
        ld.value = ''; setAnswer('medical.labDate', ''); resetLab(); save();
      } else { if (msg) msg.classList.remove('show'); setAnswer('medical.labDate', ld.value); save(); }
    });
    var drop = $('labDrop'), file = $('labFile');
    if (drop) {
      drop.addEventListener('click', function () { file.click(); });
      file.addEventListener('change', function () { handleLabFile(file.files[0]); });
      ['dragenter', 'dragover'].forEach(function (ev) { drop.addEventListener(ev, function (e) { e.preventDefault(); drop.classList.add('drag'); }); });
      ['dragleave', 'drop'].forEach(function (ev) { drop.addEventListener(ev, function (e) { e.preventDefault(); drop.classList.remove('drag'); }); });
      drop.addEventListener('drop', function (e) { if (e.dataTransfer.files && e.dataTransfer.files[0]) handleLabFile(e.dataTransfer.files[0]); });
    }
    if ($('labChange')) $('labChange').addEventListener('click', resetLab);
    // restore a preview if a file was uploaded earlier this session
    if (STATE.lab && STATE.lab.path && $('labPreview')) {
      $('labDrop').style.display = 'none';
      var pv = $('labPreview'); pv.classList.add('on');
      if (STATE.lab.type === 'pdf') { $('labThumb').style.display = 'none'; pv.querySelector('.ok').textContent = '✓ PDF uploaded'; }
      else if (STATE.lab.url) $('labThumb').src = STATE.lab.url;
    }
    wireCommon();
  }

  function stepSafety() {
    var checked = STATE.answers.safety || [];
    app.innerHTML =
      '<div class="asv-step">' +
        '<span class="asv-eyebrow">Step 7 · Safety screening</span>' +
        '<h2>A quick safety check</h2>' +
        '<p class="lead">Please check anything that applies to you. This keeps your suggestions responsible — ' +
          'if any apply, we\'ll point you to a specialist instead of surfacing products.</p>' +
        '<div class="asv-safety">' +
          (CFG.safetyItems || []).map(function (s) {
            var on = checked.indexOf(s.id) >= 0;
            return '<label class="asv-check' + (on ? ' on' : '') + '" data-safety="' + esc(s.id) + '">' +
              '<input type="checkbox"' + (on ? ' checked' : '') + '>' +
              '<span class="box">' + CHK + '</span><span class="lbl">' + esc(s.label) + '</span></label>';
          }).join('') +
        '</div>' +
        '<div class="asv-note">' + INFO + '<span>If none of these apply, continue to see your suggestions. This is educational information, not medical advice.</span></div>' +
        actions({ back: true, nextLabel: 'See my results →' }) +
      '</div>';
    app.querySelectorAll('.asv-check').forEach(function (lab) {
      lab.addEventListener('change', function () {
        var id = lab.dataset.safety, arr = STATE.answers.safety, on = lab.querySelector('input').checked, i = arr.indexOf(id);
        if (on && i < 0) arr.push(id); if (!on && i >= 0) arr.splice(i, 1);
        lab.classList.toggle('on', on); save();
      });
    });
    wireCommon();
  }

  /* ---- safety STOP branch (no recommendations at all) ---- */
  function stepSafetyStop() {
    saveAssessment(null); // record the responses (safety_flagged) — no products surfaced
    app.innerHTML =
      '<div class="asv-step asv-stop">' +
        '<div class="stop-ico"><svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M12 2 2 21h20L12 2z"/><path d="M12 9v5M12 17.5v.1" stroke-linecap="round"/></svg></div>' +
        '<h2>Let\'s pause here — a specialist is the right next step</h2>' +
        '<p>Based on your safety screening, we won\'t surface product suggestions. That\'s intentional: the responses ' +
          'you selected are best reviewed one-on-one by a qualified healthcare professional who can consider your full ' +
          'situation. This tool is educational and can\'t give medical advice.</p>' +
        '<div class="asv-actions" style="justify-content:center;">' +
          '<button type="button" class="btn btn-primary grow" id="asvBookSpecialist">Book a Specialist Consultation</button>' +
        '</div>' +
        '<button type="button" class="asv-back" id="asvBack" style="margin-top:8px;">&larr; Back to screening</button>' +
        '<div class="asv-disc">This self-assessment is educational only and is not medical advice, diagnosis, or a prescription. ' +
          'Always consult a qualified healthcare professional before considering any peptide.</div>' +
      '</div>';
    $('asvBack').addEventListener('click', function () { goTo('safety'); });
    $('asvBookSpecialist').addEventListener('click', function () {
      // Take them into results-less consult booking: render a minimal consult page.
      renderConsultOnly();
    });
  }

  /* ================= RESULTS ================= */
  function stepResults() {
    if (!productsReady) {
      app.innerHTML = '<div class="asv-step"><h2>Preparing your suggestions…</h2><p class="lead">One moment while we match your goals.</p></div>';
      return;
    }
    var res = window.recommendationEngine.recommend(STATE.answers, products, CFG);
    STATE.results = res;
    saveAssessment(res); // best-effort Firestore write

    var top = res.products.slice(0, MAX_PRODUCTS);
    var acc = res.accessories;

    app.innerHTML =
      '<div class="asv-results-head">' +
        '<span class="asv-eyebrow">Your Results</span>' +
        '<h1>Based on your responses</h1>' +
        '<p>Here are wellness peptides people with similar goals commonly explore. These are informational suggestions — ' +
          'not medical advice, a diagnosis, or a prescription. Add what interests you, or talk it through with a specialist.</p>' +
      '</div>' +
      '<div class="asv-layout">' +
        '<div class="asv-col-main">' +
          '<div class="asv-sec-title">Recommended Wellness Peptides</div>' +
          '<div class="asv-rgrid" id="asvRgrid">' +
            (top.length ? top.map(productCard).join('')
              : '<div class="asv-step"><p class="lead">We couldn\'t match a specific category to your goals. Browse the full collection or talk to a specialist for tailored guidance.</p></div>') +
          '</div>' +
          (acc.length ? (
            '<div class="asv-sec-title mt">Recommended Add-ons</div>' +
            '<div class="asv-acc" id="asvAcc">' + acc.map(accessoryCard).join('') + '</div>'
          ) : '') +
          (res.bundle ? bundleCard(res.bundle) : '') +
          (top.length ? (
            '<div class="asv-addall">' +
              '<div class="aa-copy"><b>Add everything in one tap</b><div>All recommended products' + (acc.length ? ' and accessories' : '') + ' → your cart.</div></div>' +
              '<button type="button" class="btn btn-primary" id="asvAddAll">Add Everything to Cart</button>' +
            '</div>') : '') +
          '<div class="asv-disc">Suggestions are generated by a fixed, rule-based match between the goals you selected and product ' +
            'categories. They may support your goals but are not a diagnosis, treatment, or prescription. Always consult a qualified ' +
            'healthcare professional before considering any peptide.</div>' +
          '<div class="asv-actions" style="margin-top:18px;"><button type="button" class="asv-back" id="asvRestart">&larr; Retake the assessment</button></div>' +
        '</div>' +
        '<aside class="asv-col-aside">' + consultPanel() + '</aside>' +
      '</div>';

    wireResults();
  }

  function productCard(p) {
    var art = p.imageURL ? '<img src="' + esc(p.imageURL) + '" alt="' + esc(p.name) + '" loading="lazy">' : (window.vialArt ? window.vialArt(p) : '');
    var multi = p.dosageOptions && p.dosageOptions.length > 1;
    var strengths = (p.dosageOptions || []).map(function (d) { return d.mg; }).filter(Boolean).join(' · ') || '—';
    var stock = p.stockStatus === 'out_of_stock' ? { c: 'out', t: 'Out of stock' }
      : p.stockStatus === 'low_stock' ? { c: 'low', t: 'Low stock' } : { c: 'in', t: 'In stock' };
    var soldOut = p.stockStatus === 'out_of_stock';
    return '<article class="asv-rcard" data-slug="' + esc(p.slug) + '">' +
      '<div class="asv-rart">' + art + '</div>' +
      '<div class="asv-rbody">' +
        '<div class="asv-rcat">' + esc(p.category) + '</div>' +
        '<div class="asv-rname">' + esc(p.name) + '</div>' +
        (p._matchedGoals && p._matchedGoals.length ? '<span class="asv-match">' + INFO + esc(matchLabel(p._matchedGoals)) + '</span>' : '') +
        '<div class="asv-rwhy">' + esc(p._reason || '') + '</div>' +
        '<div class="asv-rmeta"><span class="asv-rstrength">' + esc(strengths) + '</span>' +
          '<span class="asv-rstock ' + stock.c + '">' + stock.t + '</span></div>' +
        '<div class="asv-rfoot">' +
          '<span class="asv-rprice">' + (multi ? '<span class="from">from</span>' : '') + money(p.displayPrice) + '</span>' +
          '<span class="asv-rbtns">' +
            '<a class="btn btn-ghost btn-sm" href="product.html?slug=' + encodeURIComponent(p.slug) + '">View Details</a>' +
            '<button type="button" class="btn btn-primary btn-sm asv-add" ' + (soldOut ? 'disabled' : '') + '>' + (soldOut ? 'Sold out' : 'Add to Cart') + '</button>' +
          '</span>' +
        '</div>' +
      '</div>' +
    '</article>';
  }
  function matchLabel(ids) {
    var labels = ids.map(function (id) { var g = (CFG.goals || []).find(function (x) { return x.id === id; }); return g ? g.label : id; });
    return 'Matches: ' + labels.slice(0, 2).join(', ') + (labels.length > 2 ? ' +' + (labels.length - 2) : '');
  }

  function accessoryCard(p) {
    var o = (p.dosageOptions && p.dosageOptions[0]) || { mg: '', price: p.price };
    return '<div class="asv-acard" data-slug="' + esc(p.slug) + '">' +
      '<div class="asv-aname">' + esc(p.name) + '</div>' +
      '<div class="asv-adesc">' + esc(p.shortDescription || p.description || '') + '</div>' +
      '<div class="asv-afoot"><span class="asv-aprice">' + money(o.price) + '</span>' +
        '<button type="button" class="btn btn-ghost btn-sm asv-add-acc">Add</button></div>' +
    '</div>';
  }

  function bundleCard(b) {
    return '<div class="asv-bundle">' +
      '<h3>' + esc(b.name) + '</h3>' +
      '<p>A discounted bundle matched to your top goals — ' + money(b.displayPrice) + '. ' + esc(b.shortDescription || '') + '</p>' +
      '<a class="btn btn-primary btn-sm" style="margin-top:12px;" href="product.html?slug=' + encodeURIComponent(b.slug) + '">View bundle</a>' +
    '</div>';
  }

  /* ---- consultation panel (parallel to Add to Cart) ---- */
  function consultPanel() {
    var fee = CFG.consultationFee || 500;
    return '<div class="asv-consult" id="asvConsult">' +
      '<span class="c-badge">' + INFO + 'Optional</span>' +
      '<h3>Consult a Peptide Specialist</h3>' +
      '<p class="c-copy">Want a specialist to walk through these results with you? Book a one-on-one consultation.</p>' +
      '<div class="c-fee"><b>' + money(fee) + '</b><span>one-on-one session</span></div>' +
      '<button type="button" class="btn btn-book" id="asvBookToggle">Book a Consultation · ' + money(fee) + '</button>' +
      '<div class="asv-booking" id="asvBooking">' + bookingForm() + '</div>' +
    '</div>';
  }

  function bookingForm() {
    var fee = CFG.consultationFee || 500;
    var qr = CFG.gcashQR
      ? '<div class="co-qr"><img src="' + esc(CFG.gcashQR) + '" alt="GCash QR Code"></div>'
      : '<div class="co-qr">GCash QR Code</div>';
    return '' +
      '<div class="bk-field"><label for="bkName">Full name</label><input id="bkName" type="text" autocomplete="name" placeholder="Juana Dela Cruz"></div>' +
      '<div class="bk-field"><label for="bkEmail">Email</label><input id="bkEmail" type="email" autocomplete="email" placeholder="you@email.com"></div>' +
      '<div class="bk-field"><label for="bkMobile">Mobile number</label><input id="bkMobile" type="tel" inputmode="tel" autocomplete="tel" placeholder="09XX XXX XXXX"></div>' +
      '<div class="bk-field"><div class="bk-row">' +
        '<div><label for="bkDate">Preferred date</label>' +
          '<input id="bkDate" type="date" min="' + todayISO() + '">' +
          '<span class="bk-hint">Weekdays only · Mon–Fri</span></div>' +
        '<div><label for="bkTime">Preferred time</label>' +
          '<select id="bkTime"><option value="" disabled selected>Select a time</option>' + timeSlotOptions() + '</select>' +
          '<span class="bk-hint">Available 5:30–9:00 PM</span></div>' +
      '</div></div>' +
      '<div class="bk-field"><label>Preferred contact method</label><div class="bk-methods" id="bkMethods">' +
        ['Video Call', 'Voice Call', 'Chat'].map(function (m) {
          return '<button type="button" class="bk-m' + (m === STATE.booking.method ? ' sel' : '') + '" data-method="' + m + '">' + m + '</button>';
        }).join('') +
      '</div></div>' +
      '<div class="bk-field"><label for="bkNotes">Notes <span style="font-weight:500;opacity:.7;">(optional)</span></label><textarea id="bkNotes" placeholder="Anything you\'d like the specialist to know…"></textarea></div>' +
      '<hr style="border:0;border-top:1px solid rgba(183,154,107,.28);margin:16px 0;">' +
      '<div style="font-family:var(--serif);font-size:18px;color:#fff;">Payment · ' + money(fee) + '</div>' +
      '<p class="asv-payhint">Pay the ' + money(fee) + ' consultation fee via GCash, then upload your receipt below. We\'ll verify it before your session.</p>' +
      qr +
      '<div class="co-uplabel" style="color:rgba(245,237,231,.9);">Upload payment receipt <span style="color:var(--champagne);">*</span></div>' +
      '<div class="co-drop" id="bkDrop">' +
        '<div class="ico">📎</div>' +
        '<div class="t1">Drag &amp; drop your receipt here</div>' +
        '<div class="t2">or click to browse</div>' +
        '<div class="t3">JPG, PNG or PDF · Max 10MB</div>' +
        '<input type="file" id="bkFile" accept="image/*,application/pdf" hidden>' +
      '</div>' +
      '<div class="co-progress" id="bkProg"><span></span></div>' +
      '<div class="co-preview" id="bkPreview"><img id="bkThumb" alt="Receipt preview">' +
        '<div><div class="ok">✓ Receipt uploaded</div><span class="change" id="bkChange">Change file</span></div></div>' +
      '<label class="bk-check"><input type="checkbox" id="bkConfirm"><span>I confirm that the uploaded payment proof is accurate.</span></label>' +
      '<button type="button" class="btn btn-book" id="bkSubmit" style="margin-top:14px;">Submit Booking</button>' +
      '<div class="asv-err" id="bkErr" style="color:#ffd7cf;">Please complete the required fields, upload your receipt, and confirm.</div>';
  }

  /* ---- consult-only page (from safety stop) ---- */
  function renderConsultOnly() {
    app.innerHTML =
      '<div class="asv-results-head">' +
        '<span class="asv-eyebrow">Specialist Consultation</span>' +
        '<h1>Book a one-on-one session</h1>' +
        '<p>A qualified specialist can review your situation privately and guide your next steps. No products are recommended here.</p>' +
      '</div>' +
      '<div class="asv-layout"><div class="asv-col-main"></div><aside class="asv-col-aside" style="grid-column:1/-1;max-width:520px;margin:0 auto;">' +
        consultPanel() + '</aside></div>';
    wireConsult();
    // open the form straight away in this branch
    $('asvBooking').classList.add('open');
    $('asvBookToggle').style.display = 'none';
  }

  /* ================= WIRING ================= */
  function group(label, inner) {
    return '<div class="asv-group"><span class="asv-label">' + esc(label) + '</span>' + inner + '</div>';
  }
  function field(path, label, val, ph, mode) {
    return '<div class="asv-field"><label for="f_' + path.replace('.', '_') + '">' + esc(label) + '</label>' +
      '<input id="f_' + path.replace('.', '_') + '" data-path="' + path + '" type="text"' +
      (mode ? ' inputmode="' + mode + '"' : '') + ' value="' + esc(val || '') + '" placeholder="' + esc(ph || '') + '"></div>';
  }
  function textArea(path, label, val, ph, optional) {
    var id = 'f_' + path.replace('.', '_');
    return '<div class="asv-field"><label for="' + id + '">' + esc(label) +
      (optional ? ' <span class="opt">(optional)</span>' : '') + '</label>' +
      '<textarea id="' + id + '" data-path="' + path + '" rows="3" placeholder="' + esc(ph || '') + '">' + esc(val || '') + '</textarea></div>';
  }
  /* multi-select chips (reuses the .asv-opt look) → toggles into an array */
  function multiChips(group, opts, selected) {
    selected = selected || [];
    return '<div class="asv-opts">' + opts.map(function (o) {
      var sel = selected.indexOf(o) >= 0;
      return '<button type="button" class="asv-opt' + (sel ? ' sel' : '') + '" role="checkbox" aria-checked="' + sel + '"' +
        ' data-multi="' + esc(group) + '" data-val="' + esc(o) + '">' + esc(o) + '</button>';
    }).join('') + '</div>';
  }

  function setAnswer(path, val) {
    var parts = path.split('.'), obj = STATE.answers;
    obj[parts[0]] = obj[parts[0]] || {};
    obj[parts[0]][parts[1]] = val;
  }
  function getAnswer(path) {
    var parts = path.split('.'); var o = STATE.answers[parts[0]] || {}; return o[parts[1]];
  }

  function wireCommon() {
    // chip groups
    app.querySelectorAll('.asv-opt').forEach(function (b) {
      b.addEventListener('click', function () {
        var grp = b.dataset.group;
        app.querySelectorAll('.asv-opt[data-group="' + grp + '"]').forEach(function (x) {
          x.classList.remove('sel'); x.setAttribute('aria-checked', 'false');
        });
        b.classList.add('sel'); b.setAttribute('aria-checked', 'true');
        setAnswer(grp, b.dataset.val);
        var err = $('asvErr'); if (err) err.classList.remove('show');
        save();
      });
    });
    // text fields + textareas
    app.querySelectorAll('input[data-path], textarea[data-path]').forEach(function (inp) {
      inp.addEventListener('input', function () {
        setAnswer(inp.dataset.path, inp.value.trim());
        var err = $('asvErr'); if (err) err.classList.remove('show');
        save();
      });
    });
    // nav
    if ($('asvBack')) $('asvBack').addEventListener('click', back);
    if ($('asvNext')) $('asvNext').addEventListener('click', next);
  }

  function wireResults() {
    if ($('asvRestart')) $('asvRestart').addEventListener('click', function () { goTo('welcome'); });
    // per-product add
    app.querySelectorAll('.asv-rcard').forEach(function (card) {
      var btn = card.querySelector('.asv-add'); if (!btn || btn.disabled) return;
      btn.addEventListener('click', function () {
        var p = findProduct(card.dataset.slug); if (!p) return;
        addProduct(p); flashAdded(btn);
      });
    });
    // per-accessory add
    app.querySelectorAll('.asv-acard').forEach(function (card) {
      var btn = card.querySelector('.asv-add-acc'); if (!btn) return;
      btn.addEventListener('click', function () {
        var p = findProduct(card.dataset.slug); if (!p) return;
        addProduct(p); flashAdded(btn, 'Added ✓');
      });
    });
    // add everything
    if ($('asvAddAll')) $('asvAddAll').addEventListener('click', function () {
      var n = 0;
      (STATE.results.products.slice(0, MAX_PRODUCTS)).forEach(function (p) { if (p.stockStatus !== 'out_of_stock') { addProduct(p); n++; } });
      (STATE.results.accessories || []).forEach(function (p) { addProduct(p); n++; });
      toast(n + ' item' + (n === 1 ? '' : 's') + ' added to your cart');
    });
    wireConsult();
  }

  function flashAdded(btn, label) {
    var t = btn.textContent; btn.textContent = label || 'Added ✓'; btn.disabled = true;
    setTimeout(function () { btn.textContent = t; btn.disabled = false; }, 1400);
  }
  function findProduct(slug) { return products.filter(function (p) { return p.slug === slug; })[0]; }
  function addProduct(p) {
    var o = (p.dosageOptions && p.dosageOptions[0]) || { mg: '—', price: p.displayPrice || p.price };
    window.cartAPI.add({
      id: p.id, slug: p.slug, name: p.name, category: p.category,
      imageURL: p.imageURL || '', dosage: o.mg, price: o.price
    }, 1);
  }

  /* ---- consult booking wiring ---- */
  function wireConsult() {
    var toggle = $('asvBookToggle');
    if (toggle) toggle.addEventListener('click', function () {
      var box = $('asvBooking'); box.classList.add('open'); toggle.style.display = 'none';
      var f = $('bkName'); if (f) f.focus();
    });
    // prefill from a signed-in Google user if present
    if (window.fbAuth && window.fbAuth.currentUser && !window.fbAuth.currentUser.isAnonymous) {
      var u = window.fbAuth.currentUser;
      if ($('bkEmail') && u.email) $('bkEmail').value = u.email;
      if ($('bkName') && u.displayName) $('bkName').value = u.displayName;
    }
    // contact method
    app.querySelectorAll('.bk-m').forEach(function (m) {
      m.addEventListener('click', function () {
        app.querySelectorAll('.bk-m').forEach(function (x) { x.classList.remove('sel'); });
        m.classList.add('sel'); STATE.booking.method = m.dataset.method;
      });
    });
    // receipt upload
    var drop = $('bkDrop'), file = $('bkFile');
    if (drop) {
      drop.addEventListener('click', function () { file.click(); });
      file.addEventListener('change', function () { handleReceipt(file.files[0]); });
      ['dragenter', 'dragover'].forEach(function (ev) { drop.addEventListener(ev, function (e) { e.preventDefault(); drop.classList.add('drag'); }); });
      ['dragleave', 'drop'].forEach(function (ev) { drop.addEventListener(ev, function (e) { e.preventDefault(); drop.classList.remove('drag'); }); });
      drop.addEventListener('drop', function (e) { if (e.dataTransfer.files && e.dataTransfer.files[0]) handleReceipt(e.dataTransfer.files[0]); });
    }
    if ($('bkChange')) $('bkChange').addEventListener('click', resetReceipt);
    if ($('bkSubmit')) $('bkSubmit').addEventListener('click', submitBooking);
    // date: allow weekdays only — clear + inform if a weekend is picked
    var dateEl = $('bkDate');
    if (dateEl) dateEl.addEventListener('change', function () {
      if (dateEl.value && !isWeekday(dateEl.value)) {
        toast('Consultations are available Monday to Friday only.');
        dateEl.value = '';
      }
    });
  }

  function resetReceipt() {
    STATE.proof = { file: null, url: null, path: null, type: null };
    if ($('bkDrop')) $('bkDrop').style.display = '';
    if ($('bkProg')) { $('bkProg').classList.remove('on'); $('bkProg').firstChild.style.width = '0'; }
    if ($('bkPreview')) $('bkPreview').classList.remove('on');
  }

  function handleReceipt(f) {
    if (!f) return;
    var okType = /^image\//.test(f.type) || f.type === 'application/pdf';
    if (!okType) { toast('Please upload a JPG, PNG, or PDF.'); return; }
    if (f.size > 10 * 1024 * 1024) { toast('That file is over 10MB. Please choose a smaller one.'); return; }
    if (!window.fbStorage) { toast('Uploads need the store backend enabled.'); return; }

    STATE.proof.file = f; STATE.proof.type = f.type === 'application/pdf' ? 'pdf' : 'image';
    $('bkDrop').style.display = 'none';
    var prog = $('bkProg'); prog.classList.add('on'); var bar = prog.firstChild; bar.style.width = '0';

    ensureAuth().then(function () {
      var safe = f.name.replace(/[^\w.\-]+/g, '_');
      var ref = window.fbStorage.ref('consultation_proofs/' + genRef() + '_' + safe);
      STATE.proof.path = ref.fullPath;
      var task = ref.put(f, { contentType: f.type });
      task.on('state_changed',
        function (s) { bar.style.width = (s.bytesTransferred / s.totalBytes * 100).toFixed(0) + '%'; },
        function (err) { console.error(err); toast('Upload failed: ' + (err.code || 'try again') + '.'); resetReceipt(); },
        function () {
          prog.classList.remove('on');
          var pv = $('bkPreview'); pv.classList.add('on');
          try {
            if (STATE.proof.type === 'image') $('bkThumb').src = URL.createObjectURL(f);
            else { $('bkThumb').style.display = 'none'; pv.querySelector('.ok').textContent = '✓ PDF receipt uploaded'; }
          } catch (e) {}
          task.snapshot.ref.getDownloadURL()
            .then(function (url) { STATE.proof.url = url; if (STATE.proof.type === 'image') $('bkThumb').src = url; })
            .catch(function () { STATE.proof.url = null; });
        });
    }).catch(function (e) { authError(e); resetReceipt(); });
  }

  function submitBooking() {
    if (STATE.submitting) return;
    var name = val('bkName'), email = val('bkEmail'), mobile = val('bkMobile'),
        date = val('bkDate'), time = val('bkTime'), notes = val('bkNotes'),
        confirm = $('bkConfirm') && $('bkConfirm').checked;
    var emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    var ok = name && emailOk && mobile && date && time && confirm && STATE.proof.path;
    if (!ok) { $('bkErr').classList.add('show'); return; }
    if (!isWeekday(date)) { toast('Please choose a weekday (Mon–Fri) for your consultation.'); return; }
    $('bkErr').classList.remove('show');

    STATE.submitting = true;
    var btn = $('bkSubmit'); btn.disabled = true; btn.textContent = 'Submitting…';

    ensureAuth().then(function (user) {
      var ref = genConsultRef();
      var doc = {
        booking_ref: ref,
        // email lowercased so the owner-read rule (token.email == email) and the
        // Track Order lookup both match reliably.
        full_name: name, email: (email || '').toLowerCase(), mobile: mobile,
        preferred_date: date, preferred_time: time,
        contact_method: STATE.booking.method || 'Video Call',
        notes: notes || '',
        consultation_fee: CFG.consultationFee || 500,
        payment_status: 'pending_verification',
        payment_proof_url: STATE.proof.url || null,
        payment_proof_path: STATE.proof.path || null,
        payment_proof_type: STATE.proof.type || null,
        source: 'self-assessment',
        goals: (STATE.answers.goals || []),
        // Full questionnaire snapshot so the admin sees ALL the patient's
        // information in one place (profile, medical, lifestyle, safety, etc.).
        assessment: STATE.answers,
        // Attach the patient's uploaded labs (if any) so the admin can view them
        // alongside the booking. Optional — absent when no labs were shared.
        lab_results: (STATE.lab && STATE.lab.path) ? {
          date: (STATE.answers.medical && STATE.answers.medical.labDate) || null,
          url: STATE.lab.url || null, path: STATE.lab.path || null, type: STATE.lab.type || null
        } : null,
        // Overall booking lifecycle (separate from payment_status) — used by the
        // customer's Track Order page and managed by the admin.
        booking_status: 'booking_received',
        uid: user ? user.uid : null,
        created_at: firebase.firestore.FieldValue.serverTimestamp(),
        updated_at: firebase.firestore.FieldValue.serverTimestamp(),
        status_updated_at: firebase.firestore.FieldValue.serverTimestamp()
      };
      return window.fbDb.collection('consultations').add(doc).then(function () { return { ref: ref, doc: doc }; });
    }).then(function (r) {
      showBookingConfirmation(r.ref, r.doc);
    }).catch(function (e) {
      console.error('Consultation write failed:', e);
      authError(e, 'Could not submit booking: ' + (e && (e.code || e.message) || 'try again') + '.');
      STATE.submitting = false; btn.disabled = false; btn.textContent = 'Submit Booking';
    });
  }

  function showBookingConfirmation(ref, doc) {
    STATE.submitting = false;
    // WhatsApp fast-confirmation message — booking essentials ONLY, no medical data.
    var waMsg =
      'Hello OPTIMA Labs 👋\n\nI would like to confirm my consultation booking.\n\n' +
      'Booking ID: ' + ref + '\n' +
      'Patient Name: ' + (doc.full_name || '') + '\n' +
      'Consultation Type: ' + (doc.contact_method || '') + '\n' +
      'Email: ' + (doc.email || '') + '\n' +
      'Contact Number: ' + (doc.mobile || '') + '\n\nThank you!';
    var waUrl = 'https://wa.me/639603952447?text=' + encodeURIComponent(waMsg);
    var waIco = '<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51l-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.71.306 1.263.489 1.694.625.712.227 1.36.195 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>';
    $('asvBooking').innerHTML =
      '<div class="asv-bkdone">' +
        '<div class="ok-ic"><svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg></div>' +
        '<h3>Booking received</h3>' +
        '<div class="bk-ref">' + esc(ref) + '</div>' +
        '<div class="bk-kv">' +
          esc(doc.preferred_date) + ' · ' + esc(doc.preferred_time) + '<br>' +
          esc(doc.contact_method) + ' · ' + money(doc.consultation_fee) +
        '</div>' +
        '<div class="bk-status">Pending Verification</div>' +
        '<p class="c-copy" style="margin-top:14px;">We\'ve received your details and receipt. Our team will verify your ' +
          'payment and confirm your session shortly. Keep your reference handy.</p>' +
        '<div class="asv-wa-cta">' +
          '<h4>Want a faster confirmation?</h4>' +
          '<p>You can send your consultation details directly via WhatsApp to help us verify your booking more quickly.</p>' +
          '<a class="asv-wa-btn" href="' + waUrl + '" target="_blank" rel="noopener">' + waIco + 'Submit Details via WhatsApp</a>' +
        '</div>' +
        '<p class="bk-track">Track your booking anytime with this reference at ' +
          '<a href="track-order.html" target="_blank" rel="noopener">Track Order</a>.</p>' +
      '</div>';
  }

  /* ---------- validation ---------- */
  function validate() {
    var a = STATE.answers, s = STATE.step, bad = false;
    if (s === 'profile') bad = !(a.profile.ageRange && a.profile.sex && a.profile.height && a.profile.weight && a.profile.country && a.profile.experience);
    else if (s === 'goals') bad = !(a.goals && a.goals.length);
    else if (s === 'lifestyle') bad = !(a.lifestyle.exercise && a.lifestyle.sleepQuality && a.lifestyle.stress && a.lifestyle.water && a.lifestyle.nutrition && a.lifestyle.smoking && a.lifestyle.alcohol);
    else if (s === 'experience') bad = !(a.profile.experience && a.experience.metroManila && a.experience.format);
    else if (s === 'medical') {
      var m = a.medical || {};
      bad = !(m.pastHistory && m.currentConditions && (m.family && m.family.length) && m.medications && m.supplements);
    }
    return !bad;
  }

  /* ---------- navigation ---------- */
  function next() {
    if (!validate()) { var e = $('asvErr'); if (e) e.classList.add('show'); return; }
    var s = STATE.step;
    if (s === 'safety') {
      // safety gate: any REAL flag → stop branch ("None of the above" doesn't count)
      if (safetyFlags().length > 0) { goTo('safetyStop'); return; }
      goTo('results'); return;
    }
    var i = STEPS.indexOf(s);
    goTo(i >= 0 && i < STEPS.length - 1 ? STEPS[i + 1] : 'results');
  }
  function back() {
    var s = STATE.step, i = STEPS.indexOf(s);
    if (i > 0) goTo(STEPS[i - 1]);
    else goTo('welcome');
  }
  function goTo(step) { STATE.step = step; save(); render(); }
  function resetAll() {
    try { localStorage.removeItem(LS_KEY); } catch (e) {}
    STATE.answers = { profile: {}, goals: [], lifestyle: {}, experience: {}, medical: {}, safety: [] };
    STATE.lab = { file: null, url: null, path: null, type: null };
    STATE.step = 'welcome'; STATE.assessmentSaved = false; render();
  }

  /* ---------- auth (anonymous, low-friction) ---------- */
  function ensureAuth() {
    if (!window.fbAuth) return Promise.reject({ code: 'no-backend' });
    if (window.fbAuth.currentUser) return Promise.resolve(window.fbAuth.currentUser);
    return window.fbAuth.signInAnonymously().then(function (c) { return c.user; });
  }
  function authError(e, fallback) {
    var code = e && e.code;
    if (code === 'auth/operation-not-allowed' || code === 'auth/admin-restricted-operation')
      toast('Bookings need Anonymous sign-in enabled in Firebase. Please try again shortly.');
    else if (code === 'no-backend') toast('This needs the store backend enabled.');
    else toast(fallback || 'Something went wrong. Please try again.');
  }

  /* ---------- Firestore: assessment record (best-effort) ---------- */
  function saveAssessment(res) {
    if (STATE.assessmentSaved || !window.fbDb) return;
    STATE.assessmentSaved = true;
    ensureAuth().then(function (user) {
      var mm = STATE.answers.experience && STATE.answers.experience.metroManila;
      return window.fbDb.collection('assessments').add({
        answers: STATE.answers,
        recommended_product_ids: res ? (res.products || []).slice(0, MAX_PRODUCTS).map(function (p) { return p.id; }) : [],
        recommended_categories: res ? Object.keys(res.categoryScores || {}) : [],
        safety_flagged: safetyFlags().length > 0,
        in_metro_manila: mm === 'Yes' ? true : (mm === 'No' ? false : null),
        pen_delivery_available: mm === 'Yes',
        lab_results: (STATE.lab && STATE.lab.path) ? {
          date: (STATE.answers.medical && STATE.answers.medical.labDate) || null,
          url: STATE.lab.url || null, path: STATE.lab.path || null, type: STATE.lab.type || null
        } : null,
        uid: user ? user.uid : null,
        source: 'self-assessment',
        created_at: firebase.firestore.FieldValue.serverTimestamp()
      });
    }).catch(function (e) { STATE.assessmentSaved = false; /* non-blocking */ console.warn('assessment save skipped', e && e.code); });
  }

  /* ---------- misc ---------- */
  function safetyFlags() { return (STATE.answers.safety || []).filter(function (x) { return x !== 'none'; }); }
  function val(id) { var e = $(id); return e ? e.value.trim() : ''; }

  /* ---- optional lab-results upload (valid only if dated within 3 months) ---- */
  function within3Months(dateStr) {
    if (!dateStr) return false;
    var p = String(dateStr).split('-'); if (p.length !== 3) return false;
    var d = new Date(+p[0], +p[1] - 1, +p[2]); if (isNaN(d.getTime())) return false;
    var cutoff = new Date(); cutoff.setHours(0, 0, 0, 0); cutoff.setMonth(cutoff.getMonth() - 3);
    var today = new Date(); today.setHours(23, 59, 59, 999);
    return d >= cutoff && d <= today;
  }
  function resetLab() {
    STATE.lab = { file: null, url: null, path: null, type: null };
    if ($('labDrop')) $('labDrop').style.display = '';
    if ($('labProg')) { $('labProg').classList.remove('on'); $('labProg').firstChild.style.width = '0'; }
    if ($('labPreview')) $('labPreview').classList.remove('on');
    if ($('labThumb')) $('labThumb').style.display = '';
  }
  function handleLabFile(f) {
    if (!f) return;
    // Only accept a file once a valid, in-range date is present (freshness rule).
    if (!within3Months(STATE.answers.medical && STATE.answers.medical.labDate)) {
      var msg = $('labMsg'); if (msg) msg.classList.add('show');
      toast('Please enter the date of your labs (within the last 3 months) first.');
      return;
    }
    var okType = /^image\//.test(f.type) || f.type === 'application/pdf';
    if (!okType) { toast('Please upload a JPG, PNG, or PDF.'); return; }
    if (f.size > 10 * 1024 * 1024) { toast('That file is over 10MB. Please choose a smaller one.'); return; }
    if (!window.fbStorage) { toast('Uploads need the store backend enabled.'); return; }

    STATE.lab.file = f; STATE.lab.type = f.type === 'application/pdf' ? 'pdf' : 'image';
    $('labDrop').style.display = 'none';
    var prog = $('labProg'); prog.classList.add('on'); var bar = prog.firstChild; bar.style.width = '0';
    ensureAuth().then(function () {
      var safe = f.name.replace(/[^\w.\-]+/g, '_');
      var ref = window.fbStorage.ref('lab_results/' + genRef() + '_' + safe);
      STATE.lab.path = ref.fullPath;
      var task = ref.put(f, { contentType: f.type });
      task.on('state_changed',
        function (s) { bar.style.width = (s.bytesTransferred / s.totalBytes * 100).toFixed(0) + '%'; },
        function (err) { console.error(err); toast('Upload failed: ' + (err.code || 'try again') + '.'); resetLab(); },
        function () {
          prog.classList.remove('on');
          var pv = $('labPreview'); pv.classList.add('on');
          try {
            if (STATE.lab.type === 'image') $('labThumb').src = URL.createObjectURL(f);
            else { $('labThumb').style.display = 'none'; pv.querySelector('.ok').textContent = '✓ PDF uploaded'; }
          } catch (e) {}
          task.snapshot.ref.getDownloadURL()
            .then(function (url) { STATE.lab.url = url; if (STATE.lab.type === 'image') $('labThumb').src = url; })
            .catch(function () { STATE.lab.url = null; });
        });
    }).catch(function (e) { authError(e); resetLab(); });
  }

  /* ---- consultation date/time constraints (Mon–Fri, 5:30–9:00 PM) ---- */
  function pad2(n) { return (n < 10 ? '0' : '') + n; }
  function todayISO() { var d = new Date(); return d.getFullYear() + '-' + pad2(d.getMonth() + 1) + '-' + pad2(d.getDate()); }
  function isWeekday(dateStr) {
    if (!dateStr) return false;
    var p = String(dateStr).split('-'); if (p.length !== 3) return false;
    var g = new Date(+p[0], +p[1] - 1, +p[2]).getDay();   // local — avoids UTC off-by-one
    return g >= 1 && g <= 5;
  }
  function timeSlotOptions() {           // 5:30 PM → 9:00 PM, every 30 minutes
    var out = '';
    for (var m = 17 * 60 + 30; m <= 21 * 60; m += 30) {
      var h = Math.floor(m / 60), mm = m % 60, h12 = ((h + 11) % 12) + 1, ap = h >= 12 ? 'PM' : 'AM';
      var label = h12 + ':' + pad2(mm) + ' ' + ap;
      out += '<option value="' + label + '">' + label + '</option>';
    }
    return out;
  }
  function genRef() { var c = 'ABCDEFGHIJKLMNPQRSTUVWXYZ23456789', s = ''; for (var i = 0; i < 6; i++) s += c[Math.floor(Math.random() * c.length)]; return s; }
  function genConsultRef() { return 'CONS-' + genRef(); }

  /* ---------- init ---------- */
  document.addEventListener('DOMContentLoaded', function () {
    app = $('asvApp');
    load();
    render();
    // stream products for the engine + results
    if (window.ShopData) {
      window.ShopData.subscribe(function (list) {
        products = list; productsReady = true;
        if (STATE.step === 'results') render();  // refresh once data lands
      });
    } else { productsReady = true; }
  });
})();
