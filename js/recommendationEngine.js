/* ================================================================
   OPTIMA LABS — Rule-based recommendation engine (PURE MODULE)
   ----------------------------------------------------------------
   NOT AI. A deterministic, config-driven function that maps the
   questionnaire answers to product categories and returns ranked
   wellness peptides, matching accessories, and an optional bundle.

   Pure: no DOM, no Firestore, no side effects. Given the same inputs
   it always returns the same output — which makes it easy to test and
   lets the whole rule table live in assessment-config.js (data), so
   an admin could later edit the mapping without touching this code.

   recommend(answers, products, config) → {
     products:    [ { ...product, _score, _matchedGoals, _reason } ],  // ranked
     accessories: [ ...product ],                                       // add-ons
     bundle:      product | null,
     categoryScores: { [category]: matchCount }
   }
   ================================================================ */
(function () {

  function recommend(answers, products, config) {
    answers  = answers  || {};
    products = products || [];
    config   = config   || {};
    var goals   = answers.goals || [];
    var map     = config.goalCategoryMap || {};
    var rationale = config.categoryRationale || {};
    var accessoryCats = config.accessoryCategories || [];

    // 1) Build category → { score, goals } from the selected goals.
    //    Each goal contributes +1 to every category it maps to.
    var catScore = {};   // category -> match count
    var catGoals = {};   // category -> [goal labels] for the "why"
    goals.forEach(function (gid) {
      var cats = map[gid] || [];
      cats.forEach(function (cat) {
        catScore[cat] = (catScore[cat] || 0) + 1;
        (catGoals[cat] = catGoals[cat] || []).push(gid);
      });
    });

    // 2) Score every sellable product by its category's match count.
    //    Accessories are excluded here — they're attached separately.
    var scored = products
      .filter(function (p) { return accessoryCats.indexOf(p.category) < 0; })
      .map(function (p) {
        return {
          product: p,
          score: catScore[p.category] || 0,
          matchedGoals: (catGoals[p.category] || []).slice()
        };
      })
      .filter(function (x) { return x.score > 0; });   // only matched categories

    // 3) Rank: relevance score desc → in-stock first → name (stable, deduped
    //    since each product appears once).
    scored.sort(function (a, b) {
      if (b.score !== a.score) return b.score - a.score;
      var ai = a.product.inStock !== false, bi = b.product.inStock !== false;
      if (ai !== bi) return ai ? -1 : 1;
      return String(a.product.name).localeCompare(String(b.product.name));
    });

    var ranked = scored.map(function (x) {
      return Object.assign({}, x.product, {
        _score: x.score,
        _matchedGoals: x.matchedGoals,
        _reason: rationale[x.product.category] || ''
      });
    });

    // 4) Accessories: everything in an accessory category (addable individually).
    var accessories = products.filter(function (p) {
      return accessoryCats.indexOf(p.category) >= 0;
    });

    // 5) Optional discounted bundle: a product tagged as a bundle whose
    //    category is among the top matches (data-driven; none by default).
    var bundle = findBundle(ranked, products, config);

    return {
      products: ranked,
      accessories: accessories,
      bundle: bundle,
      categoryScores: catScore
    };
  }

  function findBundle(ranked, products, config) {
    var tag = config.bundleTag || 'bundle';
    var topCats = {};
    ranked.slice(0, 3).forEach(function (r) { topCats[r.category] = true; });
    var matches = products.filter(function (p) {
      return (p.tags || []).indexOf(tag) >= 0 && topCats[p.category];
    });
    return matches.length ? matches[0] : null;
  }

  window.recommendationEngine = { recommend: recommend };
})();
