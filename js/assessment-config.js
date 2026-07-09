/* ================================================================
   OPTIMA LABS — Self-Assessment configuration (DATA, not logic)
   ----------------------------------------------------------------
   Everything the rule-based recommendation engine needs is expressed
   here as plain data, so it can later be moved to a Firestore
   `config/assessment` doc and edited from the admin panel WITHOUT a
   code change. recommendationEngine.js consumes this object; it holds
   no product logic of its own.

   SAFETY: all copy here is INFORMATIONAL / EDUCATIONAL. Nothing is a
   diagnosis, prescription, or medical claim. Categories describe what
   people with a goal commonly *explore* — never what a product treats.
   ================================================================ */
(function () {
  window.ASSESSMENT_CONFIG = {

    /* Consultation */
    consultationFee: 500,          // ₱ — one-on-one specialist session
    gcashNumber: '09XX-XXX-XXXX',  // TODO: replace with the real GCash number
    gcashQR: 'https://firebasestorage.googleapis.com/v0/b/optima-labs.firebasestorage.app/o/Gcash%20Reciept%2FOptima%20labs%20Gcash%20QR.jpg?alt=media&token=605d30e0-4294-4d3b-8c27-7e4b02f47cfa',   // GCash QR (empty → placeholder)

    /* ---- Step 3 · Primary goals (multi-select) ---- */
    goals: [
      { id: 'body-composition',      label: 'Weight Loss',           hint: 'Fat loss & lean-mass balance' },
      { id: 'muscle-development',    label: 'Muscle Development',    hint: 'Strength & growth support' },
      { id: 'recovery',              label: 'Recovery',              hint: 'Tissue repair & bounce-back' },
      { id: 'healthy-aging',         label: 'Healthy Aging',         hint: 'Longevity & vitality' },
      { id: 'skin-appearance',       label: 'Skin Appearance',       hint: 'Glow, tone & elasticity' },
      { id: 'sleep-support',         label: 'Sleep Support',         hint: 'Deeper, calmer rest' },
      { id: 'energy',                label: 'Energy',                hint: 'Daily drive & stamina' },
      { id: 'cognitive-performance', label: 'Cognitive Performance', hint: 'Focus & mental clarity' },
      { id: 'joint-support',         label: 'Joint Support',         hint: 'Mobility & comfort' },
      { id: 'hair-appearance',       label: 'Hair Appearance',       hint: 'Fullness & condition' },
      { id: 'wellness',              label: 'Wellness',              hint: 'General well-being' }
    ],

    /* ---- Rule table: each goal maps to one or more product CATEGORIES ----
       Categories must match the store's product categories exactly
       (window.CATEGORIES in firebase-init.js). Order is not significant —
       scoring is by number of matching goals across all products. */
    goalCategoryMap: {
      'body-composition':      ['Weight Management', 'Metabolic'],
      'muscle-development':    ['Recovery & Repair', 'Metabolic'],
      'recovery':              ['Recovery & Repair'],
      'healthy-aging':         ['Longevity'],
      'skin-appearance':       ['Skin & Beauty'],
      'sleep-support':         ['Sleep & Calm'],
      'energy':                ['Metabolic', 'Longevity'],
      'cognitive-performance': ['Recovery & Repair', 'Longevity'],
      'joint-support':         ['Recovery & Repair'],
      'hair-appearance':       ['Skin & Beauty'],
      'wellness':              ['Longevity', 'Metabolic']
    },

    /* ---- Educational "why this is surfaced" copy, per category ----
       Written as informational context only. Never "treats"/"prescribed". */
    categoryRationale: {
      'Weight Management': 'Commonly explored by those focused on body composition and appetite balance. Surfaced because it matches a goal you selected.',
      'Recovery & Repair': 'Often explored for tissue recovery, training bounce-back and general repair. Surfaced based on your responses.',
      'Metabolic':         'Explored by people interested in metabolism and daily energy. Surfaced because it aligns with a goal you chose.',
      'Skin & Beauty':     'Popular with those focused on skin appearance, tone and a healthy glow. Surfaced from your selected goals.',
      'Longevity':         'Explored for healthy-aging and long-term vitality routines. Surfaced because it matches your responses.',
      'Sleep & Calm':      'Explored by those looking to support restful, calmer sleep. Surfaced from a goal you selected.',
      'Intimacy':          'Explored within intimacy and sexual-wellness routines. Surfaced from your responses.',
      'Supplies':          'Practical essentials that pair with a wellness peptide vial.'
    },

    /* Categories treated as add-on ACCESSORIES on the results screen
       (pulled live from the catalogue — e.g. bacteriostatic water, pens,
       cartridges, swabs, storage cases once added under this category). */
    accessoryCategories: ['Supplies'],

    /* A product is treated as a discounted BUNDLE when it carries this tag
       (data-driven — no bundle products exist yet; the section stays hidden
       until one is tagged in the admin product manager). */
    bundleTag: 'bundle',

    /* ---- Step 6 · Safety screening ----
       If ANY of these is checked, the flow stops before the engine and only
       a "Book a Specialist Consultation" path is offered. */
    safetyItems: [
      { id: 'pregnancy',   label: 'Pregnant, planning pregnancy, or breastfeeding' },
      { id: 'cancer',      label: 'Active cancer or currently undergoing cancer treatment' },
      { id: 'organ',       label: 'Serious heart, liver, or kidney condition' },
      { id: 'diabetes',    label: 'Diabetes (type 1 or type 2)' },
      { id: 'medication',  label: 'Currently taking prescription medication' },
      { id: 'allergies',   label: 'Known allergies to peptides or injectable products' }
    ],

    /* ---- Fixed answer options for the profile / lifestyle / experience steps ---- */
    options: {
      ageRange:    ['18–24', '25–34', '35–44', '45–54', '55–64', '65+'],
      sex:         ['Female', 'Male', 'Prefer not to say'],
      experience:  ['None', 'Some', 'Experienced'],
      format:      ['Wellness Vial', 'Cartridge', 'Reusable Pen', 'No Preference'],
      exercise:    ['Rarely', '1–2× / week', '3–4× / week', '5+ × / week'],
      sleepQuality:['Poor', 'Fair', 'Good', 'Excellent'],
      stress:      ['Low', 'Moderate', 'High'],
      water:       ['< 1 L', '1–2 L', '2–3 L', '3 L+'],
      nutrition:   ['Needs work', 'Balanced', 'Very clean'],
      yesNo:       ['No', 'Yes'],
      metroManila: ['Yes', 'No'],
      familyConditions: ['Diabetes', 'High blood pressure', 'Heart disease', 'Stroke',
                         'Cancer', 'High cholesterol', 'Thyroid disorder', 'None / Not sure']
    }
  };
})();
