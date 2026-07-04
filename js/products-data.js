/* ================================================================
   OPTIMA LABS — Static product catalogue (temporary, no backend)
   Same shape as the Firestore `products` doc (see PRODUCTS_SCHEMA.md),
   so swapping to a live Firestore fetch later is a drop-in change:
   just replace the array source in catalog.js / product.js.
   Source: OPTIMA inventory list, dosage variants consolidated.
   ================================================================ */
(function () {
  var RAW = [
    { name:'5-Amino-1MQ', category:'Metabolic', description:'Metabolic support peptide.', dosageOptions:[{mg:'50mg',price:4050}] },
    { name:'AOD-9604', category:'Metabolic', description:'Fat metabolism peptide.', dosageOptions:[{mg:'5mg',price:2925}] },
    { name:'BPC-157', category:'Recovery & Repair', description:'Gut & tissue repair peptide.', dosageOptions:[{mg:'10mg',price:2407.5}] },
    { name:'BPC-157 + TB-500', category:'Recovery & Repair', description:'Combined healing peptide blend.', dosageOptions:[{mg:'10mg',price:3240}] },
    { name:'Cagrilintide', category:'Weight Management', description:'Appetite support peptide.', dosageOptions:[{mg:'5mg',price:3645}] },
    { name:'CJC-1295 w/o DAC + Ipamorelin', category:'Recovery & Repair', description:'Growth hormone support peptide blend.', dosageOptions:[{mg:'10mg',price:5512.5}] },
    { name:'DSIP', category:'Sleep & Calm', description:'Delta sleep–inducing peptide.', dosageOptions:[{mg:'5mg',price:1935}] },
    { name:'Epitalon', category:'Longevity', description:'Longevity & telomere-support peptide.', dosageOptions:[{mg:'10mg',price:2070},{mg:'50mg',price:4387.5}] },
    { name:'GHK-Cu', category:'Skin & Beauty', description:'Copper peptide for collagen synthesis & skin repair.', dosageOptions:[{mg:'50mg',price:1687.5},{mg:'100mg',price:1912.5}] },
    { name:'KPV', category:'Recovery & Repair', description:'Anti-inflammatory peptide.', dosageOptions:[{mg:'5mg',price:2025},{mg:'10mg',price:2475}] },
    { name:'LL-37', category:'Recovery & Repair', description:'Immune-support peptide.', dosageOptions:[{mg:'5mg',price:2700}] },
    { name:'MOTS-C', category:'Metabolic', description:'Mitochondrial-derived metabolic peptide.', dosageOptions:[{mg:'10mg',price:2362.5},{mg:'40mg',price:5625}] },
    { name:'NAD+', category:'Longevity', description:'Cellular support coenzyme.', dosageOptions:[{mg:'500mg',price:2700}] },
    { name:'PT-141', category:'Intimacy', description:'Sexual wellness peptide.', dosageOptions:[{mg:'10mg',price:2407.5}] },
    { name:'Retatrutide', category:'Weight Management', description:'Metabolic peptide for weight management.', dosageOptions:[{mg:'5mg',price:2587.5},{mg:'10mg',price:3352.5},{mg:'20mg',price:4612.5},{mg:'30mg',price:5625}] },
    { name:'Semax', category:'Recovery & Repair', description:'Cognitive-support peptide.', dosageOptions:[{mg:'5mg',price:1687.5}] },
    { name:'SNAP-8', category:'Skin & Beauty', description:'Anti-aging cosmetic peptide.', dosageOptions:[{mg:'10mg',price:2002.5}] },
    { name:'Tesamorelin', category:'Recovery & Repair', description:'Growth hormone–releasing peptide.', dosageOptions:[{mg:'10mg',price:5287.5}] },
    { name:'Tirzepatide', category:'Weight Management', description:'Metabolic peptide for weight management.', dosageOptions:[{mg:'10mg',price:2250},{mg:'15mg',price:2857.5},{mg:'20mg',price:3150},{mg:'30mg',price:3667.5},{mg:'40mg',price:4320},{mg:'50mg',price:5017.5},{mg:'60mg',price:5917.5}] },
    { name:'Bacteriostatic Water', category:'Supplies', description:'Bacteriostatic water for reconstitution.', dosageOptions:[{mg:'10ml',price:180}] }
  ];

  window.PRODUCTS_DATA = RAW.map(function (p) {
    return Object.assign({}, p, {
      id: window.slugify(p.name),
      slug: window.slugify(p.name),
      price: Math.min.apply(null, p.dosageOptions.map(function (d) { return d.price; })),
      imageURL: '',
      verified: true,
      inStock: true,
      coaURL: null
    });
  });
})();
