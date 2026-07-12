/* ================================================================
   OPTIMA LABS — Short-description updater (admin only)
   Updates ONLY the one-line "shortDescription" shown on Collection
   cards — nothing else (prices, full descriptions, stock, images,
   categories all preserved). Matches products by normalized name;
   never creates or deletes. SAFE BY DEFAULT: dry run.

   USAGE (this file is loaded on admin.html; sign in as an admin):
     1) Open the DevTools console (F12).
     2) Dry run (writes nothing):  await updateOptimaShortDescriptions();
     3) Review, then apply:        await updateOptimaShortDescriptions({ apply:true });
   ================================================================ */
(function () {
  var RECORDS = [
    {
      "name": "Semaglutide",
      "slug": "semaglutide",
      "shortDescription": "Helps you feel full faster and stay full longer, so it's easier to eat less and lose weight."
    },
    {
      "name": "Tirzepatide",
      "slug": "tirzepatide",
      "shortDescription": "Helps cut hunger and supports significant, steady weight loss."
    },
    {
      "name": "Retatrutide",
      "slug": "retatrutide",
      "shortDescription": "Helps reduce hunger while also helping your body burn more calories, supporting meaningful weight loss."
    },
    {
      "name": "AOD-9604",
      "slug": "aod-9604",
      "shortDescription": "Helps your body break down stubborn fat without other unwanted effects."
    },
    {
      "name": "Cagrilintide",
      "slug": "cagrilintide",
      "shortDescription": "Helps you feel full longer, often used together with other weight-loss options for even better results."
    },
    {
      "name": "Tesamorelin",
      "slug": "tesamorelin",
      "shortDescription": "Specifically targets and helps reduce stubborn belly fat."
    },
    {
      "name": "BPC-157",
      "slug": "bpc-157",
      "shortDescription": "Speeds up healing after injuries, sore muscles, or stomach issues."
    },
    {
      "name": "TB-500",
      "slug": "tb-500",
      "shortDescription": "Helps your body heal faster and move more freely after an injury."
    },
    {
      "name": "BPC-157 + TB-500",
      "slug": "bpc-157-plus-tb-500",
      "shortDescription": "Combines two popular healing favorites for faster, more complete recovery."
    },
    {
      "name": "KPV",
      "slug": "kpv",
      "shortDescription": "Calms down irritated skin and an upset stomach."
    },
    {
      "name": "Ipamorelin",
      "slug": "ipamorelin",
      "shortDescription": "Helps your body build muscle, recover faster, and sleep better."
    },
    {
      "name": "CJC-1295 (No DAC)",
      "slug": "cjc-1295-no-dac",
      "shortDescription": "Boosts your energy, muscle tone, and recovery naturally."
    },
    {
      "name": "CJC-1295 with DAC",
      "slug": "cjc-1295-with-dac",
      "shortDescription": "Gives the same benefits as CJC-1295, but the effects last longer."
    },
    {
      "name": "CJC-1295 (No DAC) + Ipamorelin",
      "slug": "cjc-1295-no-dac-plus-ipamorelin",
      "shortDescription": "Combines two favorites for better muscle tone, fat loss, and sleep."
    },
    {
      "name": "Sermorelin",
      "slug": "sermorelin",
      "shortDescription": "A gentle way to slowly improve your energy and body shape over time."
    },
    {
      "name": "Semax",
      "slug": "semax",
      "shortDescription": "Helps you think more clearly and remember things better."
    },
    {
      "name": "Selank",
      "slug": "selank",
      "shortDescription": "Helps you feel calmer and less stressed, without making you sleepy."
    },
    {
      "name": "Semax + Selank",
      "slug": "semax-plus-selank",
      "shortDescription": "Helps you stay focused while also feeling calm."
    },
    {
      "name": "DSIP (Delta Sleep-Inducing Peptide)",
      "slug": "dsip-delta-sleep-inducing-peptide",
      "shortDescription": "Helps you fall into a deeper, more restful sleep."
    },
    {
      "name": "PT-141",
      "slug": "pt-141",
      "shortDescription": "Increases sexual desire in both men and women."
    },
    {
      "name": "MT-2 (Melanotan II)",
      "slug": "mt-2-melanotan-ii",
      "shortDescription": "Gives skin a natural-looking tan and can also boost your sex drive."
    },
    {
      "name": "Kisspeptin-10",
      "slug": "kisspeptin-10",
      "shortDescription": "Helps balance your hormones and can boost your sex drive."
    },
    {
      "name": "Oxytocin",
      "slug": "oxytocin",
      "shortDescription": "Known as the “love hormone,” it helps you feel closer and more connected to others."
    },
    {
      "name": "Thymalin",
      "slug": "thymalin",
      "shortDescription": "Helps keep your immune system strong and balanced."
    },
    {
      "name": "Thymosin Alpha-1",
      "slug": "thymosin-alpha-1",
      "shortDescription": "Helps your body fight off sickness more effectively."
    },
    {
      "name": "LL-37",
      "slug": "ll-37",
      "shortDescription": "Helps wounds heal and helps your body fight off germs."
    },
    {
      "name": "SS-31",
      "slug": "ss-31",
      "shortDescription": "Fights tiredness and gives you more everyday energy."
    },
    {
      "name": "MOTS-c",
      "slug": "mots-c",
      "shortDescription": "Helps your body use energy better and improves stamina during exercise."
    },
    {
      "name": "HCG",
      "slug": "hcg",
      "shortDescription": "Helps support natural testosterone levels and fertility."
    },
    {
      "name": "HMG",
      "slug": "hmg",
      "shortDescription": "Used to help support fertility treatments."
    },
    {
      "name": "EPO",
      "slug": "epo",
      "shortDescription": "Boosts red blood cells, which can improve stamina and endurance."
    },
    {
      "name": "Glutathione",
      "slug": "glutathione",
      "shortDescription": "Brightens your skin and helps clean out toxins from the inside."
    },
    {
      "name": "NAD+",
      "slug": "nad-plus",
      "shortDescription": "Boosts your energy and helps you think more clearly."
    },
    {
      "name": "5-Amino-1MQ",
      "slug": "5-amino-1mq",
      "shortDescription": "Helps your body burn fat and get leaner."
    },
    {
      "name": "Melatonin",
      "slug": "melatonin",
      "shortDescription": "Helps you fall asleep faster and sleep more soundly."
    },
    {
      "name": "Dermorphin",
      "slug": "dermorphin",
      "shortDescription": "A very strong option for pain relief, used carefully."
    },
    {
      "name": "VIP (Vasoactive Intestinal Peptide)",
      "slug": "vip-vasoactive-intestinal-peptide",
      "shortDescription": "Helps keep your gut, lungs, and overall comfort in balance."
    },
    {
      "name": "SLU-PP-332",
      "slug": "slu-pp-332",
      "shortDescription": "Mimics the effects of exercise on your body."
    },
    {
      "name": "PNC-27",
      "slug": "pnc-27",
      "shortDescription": "A new option researchers are still studying for targeting unhealthy cells."
    },
    {
      "name": "GHK-Cu",
      "slug": "ghk-cu",
      "shortDescription": "Makes skin firmer and helps wounds heal faster."
    },
    {
      "name": "AHK-Cu",
      "slug": "ahk-cu",
      "shortDescription": "Brightens and firms your skin."
    },
    {
      "name": "SNAP-8",
      "slug": "snap-8",
      "shortDescription": "Smooths out fine lines without needing needles."
    },
    {
      "name": "Botulinum Toxin",
      "slug": "botulinum-toxin",
      "shortDescription": "Smooths out the look of wrinkles."
    },
    {
      "name": "Hyaluronic Acid",
      "slug": "hyaluronic-acid",
      "shortDescription": "Deeply hydrates and plumps up your skin."
    },
    {
      "name": "Epitalon",
      "slug": "epitalon",
      "shortDescription": "Supports healthy aging and better sleep."
    },
    {
      "name": "Glow Blend",
      "slug": "glow-blend",
      "shortDescription": "Combines top healing favorites for smoother, refreshed-looking skin."
    },
    {
      "name": "Klow Blend",
      "slug": "klow-blend",
      "shortDescription": "A more advanced mix for skin health and healing."
    },
    {
      "name": "Healthy Hair & Skin Blend",
      "slug": "healthy-hair-skin-blend",
      "shortDescription": "Supports fuller-looking hair and healthier skin."
    },
    {
      "name": "Fat Blaster Lipo-C",
      "slug": "fat-blaster-lipo-c",
      "shortDescription": "Helps your body burn fat and gives you an energy boost."
    },
    {
      "name": "Super Human Blend",
      "slug": "super-human-blend",
      "shortDescription": "Gives an all-around boost to your energy and wellness."
    },
    {
      "name": "KPV + GHK-Cu",
      "slug": "kpv-plus-ghk-cu",
      "shortDescription": "Repairs and calms your skin at the same time."
    },
    {
      "name": "AHK-Cu Cosmetic",
      "slug": "ahk-cu-cosmetic",
      "shortDescription": "A skincare version that brightens and firms skin."
    },
    {
      "name": "GHK-Cu Cosmetic",
      "slug": "ghk-cu-cosmetic",
      "shortDescription": "A skincare version that firms and repairs skin."
    },
    {
      "name": "Matryxil",
      "slug": "matryxil",
      "shortDescription": "Firms skin gently, without the irritation stronger products can cause."
    },
    {
      "name": "PDRN (Polydeoxyribonucleotide)",
      "slug": "pdrn-polydeoxyribonucleotide",
      "shortDescription": "Helps repair and refresh tired-looking skin."
    },
    {
      "name": "PDRN Serum",
      "slug": "pdrn-serum",
      "shortDescription": "A daily serum that renews and hydrates skin."
    },
    {
      "name": "Whitening & Spot Fading",
      "slug": "whitening-spot-fading",
      "shortDescription": "Fades dark spots and evens out your skin tone."
    },
    {
      "name": "PDRN Skinbooster",
      "slug": "pdrn-skinbooster",
      "shortDescription": "Deeply hydrates skin and gives it a healthy glow."
    },
    {
      "name": "Collagen Skinbooster",
      "slug": "collagen-skinbooster",
      "shortDescription": "Makes skin firmer and more elastic-looking."
    },
    {
      "name": "Pink Hya Acid Essence",
      "slug": "pink-hya-acid-essence",
      "shortDescription": "Gives your skin an instant boost of hydration."
    }
  ];

  function norm(s){ return String(s||'').toLowerCase().replace(/\([^)]*\)/g,'')
    .replace(/\b(and|blend)\b/g,'').replace(/[^a-z0-9]+/g,''); }
  var ALIAS = { 'cargrilintide':'cagrilintide', 'botolinumtoxin':'botulinumtoxin',
    'cjc1295wodacipamorelin':'cjc1295ipamorelin', 'cjc1295nodacipamorelin':'cjc1295ipamorelin',
    'cjc1295wodac':'cjc1295', 'cjc1295nodac':'cjc1295', 'cjc1295dac':'cjc1295withdac' };
  function nkey(s){ var k=norm(s); return ALIAS[k]||k; }

  window.updateOptimaShortDescriptions = async function (opts) {
    opts = opts || {};
    var apply = !!opts.apply;
    if (!window.fbDb) { console.error('Firestore not available. Open this on admin.html.'); return; }
    if (!(window.fbAuth && window.fbAuth.currentUser)) { console.error('Sign in as an admin first.'); return; }

    var snap = await window.fbDb.collection('products').get();
    var byName = {};
    snap.forEach(function (d) { var p = d.data(); byName[nkey(p.name)] = { id:d.id, data:p }; });

    var changes = [], unchanged = 0, notFound = [];
    RECORDS.forEach(function (r) {
      var hit = byName[nkey(r.name)];
      if (!hit) { notFound.push(r.name); return; }
      if ((hit.data.shortDescription || '') === r.shortDescription) { unchanged++; return; }
      changes.push({ id:hit.id, name:hit.data.name, from:hit.data.shortDescription || '(empty)', to:r.shortDescription });
    });

    console.log('%cOPTIMA short-description update — ' + (apply ? 'APPLY' : 'DRY RUN'), 'font-weight:bold;font-size:14px');
    console.log('Products in Firestore: ' + snap.size + ' · matched with new text: ' + (changes.length + unchanged) + ' · already up to date: ' + unchanged);
    console.log('Will change ' + changes.length + ' short descriptions:');
    console.table(changes.map(function (c) { return { name:c.name, to:c.to }; }));
    if (notFound.length) console.warn('One-liners with NO matching product (skipped): ' + notFound.length, notFound);

    if (!apply) { console.log('%cDry run only — nothing written. Re-run with { apply:true } to save.', 'color:#0a0');
      return { wouldChange:changes.length, unchanged:unchanged, notFound:notFound }; }

    var svTs = firebase.firestore.FieldValue.serverTimestamp();
    var n = 0;
    for (var i=0;i<changes.length;i++){
      await window.fbDb.collection('products').doc(changes[i].id)
        .set({ shortDescription: changes[i].to, updated_at: svTs }, { merge:true });   // ONLY shortDescription
      n++;
    }
    console.log('%cDONE — updated ' + n + ' short descriptions.', 'color:#0a0;font-weight:bold');
    return { updated:n, unchanged:unchanged, notFound:notFound };
  };
  console.log('updateOptimaShortDescriptions() ready — dry run: await updateOptimaShortDescriptions();  apply: await updateOptimaShortDescriptions({apply:true});');
})();
