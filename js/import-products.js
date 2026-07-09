/* ================================================================
   OPTIMA LABS — Catalog importer (admin only)
   Pushes the latest price sheet + descriptions into Firestore.
   SAFE BY DEFAULT: dry run (reports what WOULD change, writes nothing).
   Matches existing products by normalized name — never duplicates,
   never deletes. To actually write: importOptimaCatalog({ apply:true }).

   USAGE (this file is already loaded on admin.html):
     1) Open admin.html and sign in as an admin.
     2) Open the DevTools console (F12).
     3) Dry run (writes nothing, just reports):  await importOptimaCatalog();
     4) Review the report, then apply:           await importOptimaCatalog({ apply:true });
   ================================================================ */
(function () {
  var RECORDS = [
    {
      "name": "Semaglutide",
      "slug": "semaglutide",
      "category": "Weight Management",
      "description": "<p>A GLP-1 receptor agonist, a hormone-mimicking peptide widely used to support weight loss and blood sugar control.</p><p><strong>How it works.</strong> Copies a natural gut hormone (GLP-1) that tells your brain you're full and slows down how fast your stomach empties.</p><p><strong>Known for</strong></p><ul><li>Reduced appetite and cravings</li><li>Gradual, steady weight loss</li><li>Better blood sugar control</li></ul>",
      "shortDescription": "A GLP-1 receptor agonist, a hormone-mimicking peptide widely used to support weight loss and blood sugar control.",
      "dosageOptions": [
        {
          "mg": "5mg",
          "price": 2545
        },
        {
          "mg": "10mg",
          "price": 2665
        },
        {
          "mg": "15mg",
          "price": 2875
        },
        {
          "mg": "20mg",
          "price": 3145
        },
        {
          "mg": "30mg",
          "price": 3475
        }
      ],
      "price": 2545,
      "noPackages": false
    },
    {
      "name": "Tirzepatide",
      "slug": "tirzepatide",
      "category": "Weight Management",
      "description": "<p>A dual GIP/GLP-1 receptor agonist that builds on the same appetite pathway as Semaglutide, with an added hormone target for stronger results.</p><p><strong>How it works.</strong> Activates two gut hormone pathways (GLP-1 and GIP) instead of one, amplifying fullness signals and insulin response.</p><p><strong>Known for</strong></p><ul><li>More pronounced weight loss than single-pathway options</li><li>Improved blood sugar regulation</li><li>Reduced food cravings</li></ul>",
      "shortDescription": "A dual GIP/GLP-1 receptor agonist that builds on the same appetite pathway as Semaglutide, with an added hormone target for stronger results.",
      "dosageOptions": [
        {
          "mg": "10mg",
          "price": 2500
        },
        {
          "mg": "15mg",
          "price": 2905
        },
        {
          "mg": "20mg",
          "price": 3100
        },
        {
          "mg": "30mg",
          "price": 3445
        },
        {
          "mg": "40mg",
          "price": 3880
        },
        {
          "mg": "50mg",
          "price": 4345
        },
        {
          "mg": "60mg",
          "price": 4945
        }
      ],
      "price": 2500,
      "noPackages": false
    },
    {
      "name": "Retatrutide",
      "slug": "retatrutide",
      "category": "Weight Management",
      "description": "<p>A triple-hormone receptor agonist (GLP-1/GIP/glucagon), the newest generation of metabolic peptide, working on three hormone pathways at once.</p><p><strong>How it works.</strong> Adds a third receptor (glucagon) on top of GLP-1 and GIP, which also boosts how much energy your body burns at rest.</p><p><strong>Known for</strong></p><ul><li>Significant fat loss in early studies</li><li>Combined appetite suppression and calorie burning</li><li>Emerging as a next-step option beyond Tirzepatide</li></ul>",
      "shortDescription": "A triple-hormone receptor agonist (GLP-1/GIP/glucagon), the newest generation of metabolic peptide, working on three hormone pathways at once.",
      "dosageOptions": [
        {
          "mg": "5mg",
          "price": 2725
        },
        {
          "mg": "10mg",
          "price": 3235
        },
        {
          "mg": "15mg",
          "price": 3685
        },
        {
          "mg": "20mg",
          "price": 4075
        },
        {
          "mg": "30mg",
          "price": 4750
        }
      ],
      "price": 2725,
      "noPackages": false
    },
    {
      "name": "AOD-9604",
      "slug": "aod-9604",
      "category": "Metabolic",
      "description": "<p>A growth hormone fragment (lipolytic peptide) isolated specifically for its fat-metabolizing properties.</p><p><strong>How it works.</strong> Mimics the piece of growth hormone responsible for breaking down fat, without affecting blood sugar or overall growth.</p><p><strong>Known for</strong></p><ul><li>Targeted fat metabolism</li><li>No impact on blood sugar or muscle growth</li><li>Considered a gentler metabolic option</li></ul>",
      "shortDescription": "A growth hormone fragment (lipolytic peptide) isolated specifically for its fat-metabolizing properties.",
      "dosageOptions": [
        {
          "mg": "5mg",
          "price": 2500
        },
        {
          "mg": "10mg",
          "price": 2950
        }
      ],
      "price": 2500,
      "noPackages": false
    },
    {
      "name": "Cagrilintide",
      "slug": "cagrilintide",
      "category": "Weight Management",
      "description": "<p>An amylin analog, an appetite-regulating peptide often paired with GLP-1 medications for enhanced results.</p><p><strong>How it works.</strong> Mimics amylin, a hormone that works alongside GLP-1 to increase fullness and slow digestion.</p><p><strong>Known for</strong></p><ul><li>Enhanced appetite suppression</li><li>Often combined with Semaglutide or Tirzepatide</li><li>Supports more consistent weight-loss results</li></ul>",
      "shortDescription": "An amylin analog, an appetite-regulating peptide often paired with GLP-1 medications for enhanced results.",
      "dosageOptions": [
        {
          "mg": "5mg",
          "price": 3430
        },
        {
          "mg": "10mg",
          "price": 4390
        }
      ],
      "price": 3430,
      "noPackages": false
    },
    {
      "name": "Tesamorelin",
      "slug": "tesamorelin",
      "category": "Recovery & Repair",
      "description": "<p>A GHRH analog specifically recognized for targeting stubborn belly (visceral) fat.</p><p><strong>How it works.</strong> Signals the pituitary gland to release more of the body's own growth hormone, which in turn targets visceral (deep belly) fat.</p><p><strong>Known for</strong></p><ul><li>Reduction in visceral/belly fat</li><li>Improved body composition</li><li>Supports natural growth hormone levels</li></ul>",
      "shortDescription": "A GHRH analog specifically recognized for targeting stubborn belly (visceral) fat.",
      "dosageOptions": [
        {
          "mg": "5mg",
          "price": 3175
        },
        {
          "mg": "10mg",
          "price": 4525
        }
      ],
      "price": 3175,
      "noPackages": false
    },
    {
      "name": "BPC-157",
      "slug": "bpc-157",
      "category": "Recovery & Repair",
      "description": "<p>A gastric-derived repair peptide, one of the most well-known healing peptides, valued for speeding up recovery from injury.</p><p><strong>How it works.</strong> Encourages new blood vessel growth toward damaged tissue and helps healing cells migrate faster to injury sites.</p><p><strong>Known for</strong></p><ul><li>Faster healing of muscles, tendons, and ligaments</li><li>Support for gut lining repair</li><li>Reduced recovery time after strain or injury</li></ul>",
      "shortDescription": "A gastric-derived repair peptide, one of the most well-known healing peptides, valued for speeding up recovery from injury.",
      "dosageOptions": [
        {
          "mg": "5mg",
          "price": 2290
        },
        {
          "mg": "10mg",
          "price": 2605
        }
      ],
      "price": 2290,
      "noPackages": false
    },
    {
      "name": "TB-500",
      "slug": "tb-500",
      "category": "Recovery & Repair",
      "description": "<p>A Thymosin Beta-4 fragment, a recovery-focused peptide often used alongside BPC-157 for a more complete healing effect.</p><p><strong>How it works.</strong> Helps cells move more efficiently to injured areas and supports flexibility by influencing structural proteins in tissue.</p><p><strong>Known for</strong></p><ul><li>Improved flexibility and range of motion</li><li>Faster tissue repair</li><li>Reduced inflammation after injury</li></ul>",
      "shortDescription": "A Thymosin Beta-4 fragment, a recovery-focused peptide often used alongside BPC-157 for a more complete healing effect.",
      "dosageOptions": [
        {
          "mg": "5mg",
          "price": 2695
        },
        {
          "mg": "10mg",
          "price": 3670
        }
      ],
      "price": 2695,
      "noPackages": false
    },
    {
      "name": "BPC-157 + TB-500",
      "slug": "bpc-157-plus-tb-500",
      "category": "Recovery & Repair",
      "description": "<p>A healing-peptide blend combining BPC-157 and TB-500, designed for a more complete recovery routine.</p><p><strong>How it works.</strong> Pairs BPC-157's tissue-repair signaling with TB-500's cell-mobility and flexibility support.</p><p><strong>Known for</strong></p><ul><li>Synergistic, faster overall recovery</li><li>Popular for injuries needing both repair and flexibility</li></ul>",
      "shortDescription": "A healing-peptide blend combining BPC-157 and TB-500, designed for a more complete recovery routine.",
      "dosageOptions": [
        {
          "mg": "10mg",
          "price": 3160
        },
        {
          "mg": "20mg",
          "price": 4660
        }
      ],
      "price": 3160,
      "noPackages": false
    },
    {
      "name": "KPV",
      "slug": "kpv",
      "category": "Recovery & Repair",
      "description": "<p>An anti-inflammatory tripeptide known for soothing inflammation, particularly in the gut and skin.</p><p><strong>How it works.</strong> Interacts with immune cells to quiet down excess inflammation without broadly suppressing the immune system.</p><p><strong>Known for</strong></p><ul><li>Reduced gut inflammation</li><li>Calmer, less reactive skin</li><li>Gentle anti-inflammatory support</li></ul>",
      "shortDescription": "An anti-inflammatory tripeptide known for soothing inflammation, particularly in the gut and skin.",
      "dosageOptions": [
        {
          "mg": "5mg",
          "price": 2350
        },
        {
          "mg": "10mg",
          "price": 2650
        }
      ],
      "price": 2350,
      "noPackages": false
    },
    {
      "name": "Ipamorelin",
      "slug": "ipamorelin",
      "category": "Recovery & Repair",
      "description": "<p>A growth hormone secretagogue, a gentle peptide that encourages the body to release more of its own growth hormone.</p><p><strong>How it works.</strong> Signals the pituitary gland to release growth hormone, with very little effect on hunger or stress hormones.</p><p><strong>Known for</strong></p><ul><li>Improved muscle tone and recovery</li><li>Better sleep quality</li><li>Well-tolerated, minimal side effects</li></ul>",
      "shortDescription": "A growth hormone secretagogue, a gentle peptide that encourages the body to release more of its own growth hormone.",
      "dosageOptions": [
        {
          "mg": "5mg",
          "price": 2245
        },
        {
          "mg": "10mg",
          "price": 2725
        }
      ],
      "price": 2245,
      "noPackages": false
    },
    {
      "name": "CJC-1295 (No DAC)",
      "slug": "cjc-1295-no-dac",
      "category": "Recovery & Repair",
      "description": "<p>A GHRH analog (short-acting) that boosts natural growth hormone pulses, often paired with Ipamorelin.</p><p><strong>How it works.</strong> Mimics the hormone that tells the pituitary gland to release growth hormone in natural pulses.</p><p><strong>Known for</strong></p><ul><li>Increased natural growth hormone release</li><li>Support for muscle tone and recovery</li><li>Often combined with Ipamorelin for stronger effect</li></ul>",
      "shortDescription": "A GHRH analog (short-acting) that boosts natural growth hormone pulses, often paired with Ipamorelin.",
      "dosageOptions": [
        {
          "mg": "5mg",
          "price": 2770
        },
        {
          "mg": "10mg",
          "price": 4300
        }
      ],
      "price": 2770,
      "noPackages": false
    },
    {
      "name": "CJC-1295 with DAC",
      "slug": "cjc-1295-with-dac",
      "category": "Recovery & Repair",
      "description": "<p>A GHRH analog (long-acting) built for sustained, steady growth hormone support.</p><p><strong>How it works.</strong> Same growth-hormone-releasing signal as CJC-1295, but modified to stay active in the body longer.</p><p><strong>Known for</strong></p><ul><li>Steady, longer-lasting growth hormone elevation</li><li>Less frequent dosing needed</li></ul>",
      "shortDescription": "A GHRH analog (long-acting) built for sustained, steady growth hormone support.",
      "dosageOptions": [
        {
          "mg": "5mg",
          "price": 4150
        }
      ],
      "price": 4150,
      "noPackages": false
    },
    {
      "name": "CJC-1295 (No DAC) + Ipamorelin",
      "slug": "cjc-1295-no-dac-plus-ipamorelin",
      "category": "Recovery & Repair",
      "description": "<p>A growth hormone secretagogue blend designed to maximize natural growth hormone release.</p><p><strong>How it works.</strong> Combines two different signals to the pituitary gland for a stronger, more complete growth hormone pulse.</p><p><strong>Known for</strong></p><ul><li>Enhanced muscle recovery and fat metabolism</li><li>Improved sleep quality</li><li>Popular anti-aging combination</li></ul>",
      "shortDescription": "A growth hormone secretagogue blend designed to maximize natural growth hormone release.",
      "dosageOptions": [
        {
          "mg": "10mg",
          "price": 4675
        }
      ],
      "price": 4675,
      "noPackages": false
    },
    {
      "name": "Sermorelin",
      "slug": "sermorelin",
      "category": "Recovery & Repair",
      "description": "<p>A GHRH analog offering a gentle introduction to growth hormone support, often chosen by those new to this category.</p><p><strong>How it works.</strong> Encourages the pituitary gland to gradually increase its own natural growth hormone production.</p><p><strong>Known for</strong></p><ul><li>Gradual improvement in energy and recovery</li><li>Support for healthier body composition over time</li></ul>",
      "shortDescription": "A GHRH analog offering a gentle introduction to growth hormone support, often chosen by those new to this category.",
      "dosageOptions": [
        {
          "mg": "5mg",
          "price": 2695
        },
        {
          "mg": "10mg",
          "price": 3475
        }
      ],
      "price": 2695,
      "noPackages": false
    },
    {
      "name": "Semax",
      "slug": "semax",
      "category": "Recovery & Repair",
      "description": "<p>A nootropic peptide used to sharpen focus and mental performance.</p><p><strong>How it works.</strong> Boosts a natural brain-growth protein (BDNF) that helps brain cells stay healthy and communicate better.</p><p><strong>Known for</strong></p><ul><li>Improved focus and memory</li><li>Greater mental clarity</li><li>Support during demanding mental tasks</li></ul>",
      "shortDescription": "A nootropic peptide used to sharpen focus and mental performance.",
      "dosageOptions": [
        {
          "mg": "5mg",
          "price": 2125
        },
        {
          "mg": "10mg",
          "price": 2575
        }
      ],
      "price": 2125,
      "noPackages": false
    },
    {
      "name": "Selank",
      "slug": "selank",
      "category": "Sleep & Calm",
      "description": "<p>An anxiolytic (anti-anxiety) nootropic known for easing anxiety without causing drowsiness.</p><p><strong>How it works.</strong> Balances calming brain chemicals (GABA and serotonin) to reduce stress without sedating effects.</p><p><strong>Known for</strong></p><ul><li>Reduced anxiety and stress</li><li>Calm, clear-headed feeling</li><li>No drowsy or foggy side effects</li></ul>",
      "shortDescription": "An anxiolytic (anti-anxiety) nootropic known for easing anxiety without causing drowsiness.",
      "dosageOptions": [
        {
          "mg": "5mg",
          "price": 2260
        },
        {
          "mg": "10mg",
          "price": 2650
        }
      ],
      "price": 2260,
      "noPackages": false
    },
    {
      "name": "Semax + Selank",
      "slug": "semax-plus-selank",
      "category": "Recovery & Repair",
      "description": "<p>A nootropic blend that pairs mental sharpness with a calmer, steadier state of mind.</p><p><strong>How it works.</strong> Combines Semax's brain-support pathway with Selank's calming effect.</p><p><strong>Known for</strong></p><ul><li>Focus and calm together</li><li>Popular for high-stress, high-focus days</li></ul>",
      "shortDescription": "A nootropic blend that pairs mental sharpness with a calmer, steadier state of mind.",
      "dosageOptions": [
        {
          "mg": "20mg",
          "price": 3550
        }
      ],
      "price": 3550,
      "noPackages": false
    },
    {
      "name": "DSIP (Delta Sleep-Inducing Peptide)",
      "slug": "dsip-delta-sleep-inducing-peptide",
      "category": "Sleep & Calm",
      "description": "<p>A sleep-regulating peptide associated with deeper, more restorative sleep.</p><p><strong>How it works.</strong> Interacts with the brain's sleep-regulating centers to encourage deeper stages of sleep.</p><p><strong>Known for</strong></p><ul><li>Improved sleep quality</li><li>Better stress resilience</li></ul>",
      "shortDescription": "A sleep-regulating peptide associated with deeper, more restorative sleep.",
      "dosageOptions": [
        {
          "mg": "5mg",
          "price": 2290
        },
        {
          "mg": "10mg",
          "price": 3100
        }
      ],
      "price": 2290,
      "noPackages": false
    },
    {
      "name": "PT-141",
      "slug": "pt-141",
      "category": "Intimacy",
      "description": "<p>A melanocortin receptor agonist used to support and increase sexual desire in both men and women.</p><p><strong>How it works.</strong> Acts on the brain's arousal pathway directly, rather than working through blood flow like traditional options.</p><p><strong>Known for</strong></p><ul><li>Increased libido and desire</li><li>Works for both men and women</li></ul>",
      "shortDescription": "A melanocortin receptor agonist used to support and increase sexual desire in both men and women.",
      "dosageOptions": [
        {
          "mg": "10mg",
          "price": 2605
        }
      ],
      "price": 2605,
      "noPackages": false
    },
    {
      "name": "MT-2 (Melanotan II)",
      "slug": "mt-2-melanotan-ii",
      "category": "Intimacy",
      "description": "<p>A melanocortin agonist best known for giving skin a natural tanned look, with a secondary effect on libido.</p><p><strong>How it works.</strong> Stimulates the skin's pigment-producing cells, and touches the same arousal pathway as PT-141.</p><p><strong>Known for</strong></p><ul><li>Natural-looking tan</li><li>Mild boost to libido</li></ul>",
      "shortDescription": "A melanocortin agonist best known for giving skin a natural tanned look, with a secondary effect on libido.",
      "dosageOptions": [
        {
          "mg": "10mg",
          "price": 2305
        }
      ],
      "price": 2305,
      "noPackages": false
    },
    {
      "name": "Kisspeptin-10",
      "slug": "kisspeptin-10",
      "category": "Intimacy",
      "description": "<p>A reproductive-axis peptide, a key player in the body's hormone signaling chain.</p><p><strong>How it works.</strong> Triggers the release of the hormone that starts the whole reproductive hormone cascade in the brain.</p><p><strong>Known for</strong></p><ul><li>Hormone balance support</li><li>Libido support</li><li>Fertility-related hormone signaling</li></ul>",
      "shortDescription": "A reproductive-axis peptide, a key player in the body's hormone signaling chain.",
      "dosageOptions": [
        {
          "mg": "5mg",
          "price": 2575
        },
        {
          "mg": "10mg",
          "price": 3550
        }
      ],
      "price": 2575,
      "noPackages": false
    },
    {
      "name": "Oxytocin",
      "slug": "oxytocin",
      "category": "Intimacy",
      "description": "<p>A neuropeptide hormone known as the “bonding hormone,” associated with connection and intimacy.</p><p><strong>How it works.</strong> Acts on brain receptors involved in trust, bonding, and emotional closeness.</p><p><strong>Known for</strong></p><ul><li>Enhanced emotional connection</li><li>Relaxation and feelings of closeness</li></ul>",
      "shortDescription": "A neuropeptide hormone known as the “bonding hormone,” associated with connection and intimacy.",
      "dosageOptions": [
        {
          "mg": "2mg",
          "price": 2200
        }
      ],
      "price": 2200,
      "noPackages": false
    },
    {
      "name": "Thymalin",
      "slug": "thymalin",
      "category": "Longevity",
      "description": "<p>A thymic peptide that supports the thymus gland, the organ responsible for training immune cells.</p><p><strong>How it works.</strong> Supports thymus gland function, which naturally declines with age.</p><p><strong>Known for</strong></p><ul><li>Improved immune regulation</li><li>Support for aging immune systems</li></ul>",
      "shortDescription": "A thymic peptide that supports the thymus gland, the organ responsible for training immune cells.",
      "dosageOptions": [
        {
          "mg": "10mg",
          "price": 2500
        }
      ],
      "price": 2500,
      "noPackages": false
    },
    {
      "name": "Thymosin Alpha-1",
      "slug": "thymosin-alpha-1",
      "category": "Longevity",
      "description": "<p>An immune-modulating peptide used to strengthen the body's natural defenses.</p><p><strong>How it works.</strong> Helps regulate and activate immune (T-cell) activity for a more balanced immune response.</p><p><strong>Known for</strong></p><ul><li>Stronger immune defense</li><li>Support during illness recovery</li></ul>",
      "shortDescription": "An immune-modulating peptide used to strengthen the body's natural defenses.",
      "dosageOptions": [
        {
          "mg": "5mg",
          "price": 3025
        },
        {
          "mg": "10mg",
          "price": 4225
        }
      ],
      "price": 3025,
      "noPackages": false
    },
    {
      "name": "LL-37",
      "slug": "ll-37",
      "category": "Recovery & Repair",
      "description": "<p>An antimicrobial peptide (cathelicidin) with natural antibacterial and healing properties.</p><p><strong>How it works.</strong> Disrupts harmful bacteria while also helping regulate the immune response and support wound healing.</p><p><strong>Known for</strong></p><ul><li>Antimicrobial support</li><li>Wound healing</li><li>Immune modulation</li></ul>",
      "shortDescription": "An antimicrobial peptide (cathelicidin) with natural antibacterial and healing properties.",
      "dosageOptions": [
        {
          "mg": "10mg",
          "price": 2800
        }
      ],
      "price": 2800,
      "noPackages": false
    },
    {
      "name": "SS-31",
      "slug": "ss-31",
      "category": "Longevity",
      "description": "<p>A mitochondria-targeted peptide aimed at reducing age-related fatigue.</p><p><strong>How it works.</strong> Protects the mitochondria, the cell's energy factories, helping them work more efficiently.</p><p><strong>Known for</strong></p><ul><li>Improved cellular energy</li><li>Reduced fatigue associated with aging</li></ul>",
      "shortDescription": "A mitochondria-targeted peptide aimed at reducing age-related fatigue.",
      "dosageOptions": [
        {
          "mg": "10mg",
          "price": 2980
        },
        {
          "mg": "50mg",
          "price": 7000
        }
      ],
      "price": 2980,
      "noPackages": false
    },
    {
      "name": "MOTS-c",
      "slug": "mots-c",
      "category": "Metabolic",
      "description": "<p>A mitochondrial-derived peptide (MDP) linked to better metabolism and energy.</p><p><strong>How it works.</strong> Regulates metabolic pathways from inside the cell to improve how the body uses energy and insulin.</p><p><strong>Known for</strong></p><ul><li>Better metabolism</li><li>Improved exercise capacity</li><li>Cellular energy support</li></ul>",
      "shortDescription": "A mitochondrial-derived peptide (MDP) linked to better metabolism and energy.",
      "dosageOptions": [
        {
          "mg": "10mg",
          "price": 2575
        },
        {
          "mg": "40mg",
          "price": 4750
        }
      ],
      "price": 2575,
      "noPackages": false
    },
    {
      "name": "HCG",
      "slug": "hcg",
      "category": "Intimacy",
      "description": "<p>A gonadotropin hormone used to support natural testosterone production and fertility.</p><p><strong>How it works.</strong> Mimics a signaling hormone (LH) that tells the reproductive glands to stay active.</p><p><strong>Known for</strong></p><ul><li>Support for natural testosterone production</li><li>Fertility support</li></ul>",
      "shortDescription": "A gonadotropin hormone used to support natural testosterone production and fertility.",
      "dosageOptions": [
        {
          "mg": "5000iu",
          "price": 2950
        },
        {
          "mg": "10000iu",
          "price": 4225
        }
      ],
      "price": 2950,
      "noPackages": false
    },
    {
      "name": "HMG",
      "slug": "hmg",
      "category": "Intimacy",
      "description": "<p>A gonadotropin hormone used to stimulate the ovaries for fertility support.</p><p><strong>How it works.</strong> Combines two reproductive hormone signals (FSH and LH) to stimulate ovarian activity.</p><p><strong>Known for</strong></p><ul><li>Ovarian stimulation</li><li>Support for fertility treatment</li></ul>",
      "shortDescription": "A gonadotropin hormone used to stimulate the ovaries for fertility support.",
      "dosageOptions": [
        {
          "mg": "75iu",
          "price": 2650
        }
      ],
      "price": 2650,
      "noPackages": false
    },
    {
      "name": "EPO",
      "slug": "epo",
      "category": "Metabolic",
      "description": "<p>A glycoprotein hormone known for boosting red blood cell production.</p><p><strong>How it works.</strong> Signals the bone marrow to produce more red blood cells.</p><p><strong>Known for</strong></p><ul><li>Increased red blood cell count</li><li>Improved oxygen delivery and endurance</li></ul>",
      "shortDescription": "A glycoprotein hormone known for boosting red blood cell production.",
      "dosageOptions": [
        {
          "mg": "3000iu",
          "price": 3400
        }
      ],
      "price": 3400,
      "noPackages": false
    },
    {
      "name": "Glutathione",
      "slug": "glutathione",
      "category": "Skin & Beauty",
      "description": "<p>An antioxidant tripeptide, the body's master antioxidant, well known for brightening skin from within.</p><p><strong>How it works.</strong> Neutralizes free radicals and supports the liver's natural detox process.</p><p><strong>Known for</strong></p><ul><li>Skin brightening and even tone</li><li>Detoxification support</li><li>Antioxidant protection</li></ul>",
      "shortDescription": "An antioxidant tripeptide, the body's master antioxidant, well known for brightening skin from within.",
      "dosageOptions": [
        {
          "mg": "1500mg",
          "price": 2725
        }
      ],
      "price": 2725,
      "noPackages": false
    },
    {
      "name": "NAD+",
      "slug": "nad-plus",
      "category": "Longevity",
      "description": "<p>A coenzyme precursor, one of the most popular options for boosting energy and mental clarity.</p><p><strong>How it works.</strong> Replenishes a coenzyme your cells need to produce energy and repair DNA.</p><p><strong>Known for</strong></p><ul><li>Increased energy</li><li>Mental clarity</li><li>Anti-aging, cellular-level support</li></ul>",
      "shortDescription": "A coenzyme precursor, one of the most popular options for boosting energy and mental clarity.",
      "dosageOptions": [
        {
          "mg": "100mg",
          "price": 2200
        },
        {
          "mg": "500mg",
          "price": 2800
        }
      ],
      "price": 2200,
      "noPackages": false
    },
    {
      "name": "5-Amino-1MQ",
      "slug": "5-amino-1mq",
      "category": "Metabolic",
      "description": "<p>An NNMT-inhibitor compound used for fat loss and body composition.</p><p><strong>How it works.</strong> Blocks an enzyme (NNMT) that normally slows down metabolism and encourages fat storage.</p><p><strong>Known for</strong></p><ul><li>Improved fat metabolism</li><li>Better body composition</li></ul>",
      "shortDescription": "An NNMT-inhibitor compound used for fat loss and body composition.",
      "dosageOptions": [
        {
          "mg": "5mg",
          "price": 2680
        },
        {
          "mg": "10mg",
          "price": 3175
        },
        {
          "mg": "50mg",
          "price": 3700
        }
      ],
      "price": 2680,
      "noPackages": false
    },
    {
      "name": "Melatonin",
      "slug": "melatonin",
      "category": "Sleep & Calm",
      "description": "<p>An indoleamine hormone, the body's natural sleep regulator.</p><p><strong>How it works.</strong> Signals your internal body clock that it's time to wind down and sleep.</p><p><strong>Known for</strong></p><ul><li>Improved sleep onset</li><li>Better overall sleep quality</li></ul>",
      "shortDescription": "An indoleamine hormone, the body's natural sleep regulator.",
      "dosageOptions": [
        {
          "mg": "5mg",
          "price": 2425
        }
      ],
      "price": 2425,
      "noPackages": false
    },
    {
      "name": "Dermorphin",
      "slug": "dermorphin",
      "category": "Recovery & Repair",
      "description": "<p>An opioid peptide known for potent pain relief, used with caution due to its strength.</p><p><strong>How it works.</strong> Binds strongly to the body's pain-relief (opioid) receptors.</p><p><strong>Known for</strong></p><ul><li>Strong pain relief</li><li>Reserved for cases requiring potent analgesia</li></ul>",
      "shortDescription": "An opioid peptide known for potent pain relief, used with caution due to its strength.",
      "dosageOptions": [
        {
          "mg": "5mg",
          "price": 2500
        }
      ],
      "price": 2500,
      "noPackages": false
    },
    {
      "name": "VIP (Vasoactive Intestinal Peptide)",
      "slug": "vip-vasoactive-intestinal-peptide",
      "category": "Recovery & Repair",
      "description": "<p>A neuropeptide that supports the gut, lungs, and inflammatory balance.</p><p><strong>How it works.</strong> Relaxes smooth muscle and blood vessels while helping regulate immune and inflammatory activity.</p><p><strong>Known for</strong></p><ul><li>Support for gut and respiratory health</li><li>Inflammatory balance</li></ul>",
      "shortDescription": "A neuropeptide that supports the gut, lungs, and inflammatory balance.",
      "dosageOptions": [
        {
          "mg": "5mg",
          "price": 2950
        },
        {
          "mg": "10mg",
          "price": 3925
        }
      ],
      "price": 2950,
      "noPackages": false
    },
    {
      "name": "SLU-PP-332",
      "slug": "slu-pp-332",
      "category": "Metabolic",
      "description": "<p>An exercise mimetic, an emerging compound studied for its metabolic effects.</p><p><strong>How it works.</strong> Activates the same cellular pathways that exercise naturally triggers, boosting how cells produce energy.</p><p><strong>Known for</strong></p><ul><li>Increased calorie burning</li><li>Endurance-like metabolic effects</li></ul>",
      "shortDescription": "An exercise mimetic, an emerging compound studied for its metabolic effects.",
      "dosageOptions": [
        {
          "mg": "5mg",
          "price": 3700
        }
      ],
      "price": 3700,
      "noPackages": false
    },
    {
      "name": "PNC-27",
      "slug": "pnc-27",
      "category": "Longevity",
      "description": "<p>A research-stage, cell-targeting peptide studied for its ability to target abnormal cells.</p><p><strong>How it works.</strong> Interacts with a specific protein pathway found on abnormal cell membranes.</p><p><strong>Known for</strong></p><ul><li>Investigational, research-use interest</li><li>Cellular targeting studies</li></ul>",
      "shortDescription": "A research-stage, cell-targeting peptide studied for its ability to target abnormal cells.",
      "dosageOptions": [
        {
          "mg": "5mg",
          "price": 3160
        },
        {
          "mg": "10mg",
          "price": 4300
        }
      ],
      "price": 3160,
      "noPackages": false
    },
    {
      "name": "GHK-Cu",
      "slug": "ghk-cu",
      "category": "Skin & Beauty",
      "description": "<p>A copper peptide (GHK-Cu) well known for improving skin firmness and healing.</p><p><strong>How it works.</strong> Signals skin cells to produce more collagen and repair themselves, while also acting as an antioxidant.</p><p><strong>Known for</strong></p><ul><li>Firmer, smoother skin</li><li>Improved wound healing</li><li>Reduced fine lines over time</li></ul>",
      "shortDescription": "A copper peptide (GHK-Cu) well known for improving skin firmness and healing.",
      "dosageOptions": [
        {
          "mg": "50mg",
          "price": 2200
        },
        {
          "mg": "100mg",
          "price": 2500
        }
      ],
      "price": 2200,
      "noPackages": false
    },
    {
      "name": "AHK-Cu",
      "slug": "ahk-cu",
      "category": "Skin & Beauty",
      "description": "<p>A copper peptide variant (AHK-Cu) known for its brightening and firming benefits.</p><p><strong>How it works.</strong> Works through a similar collagen-boosting pathway as GHK-Cu, with added skin-brightening effects.</p><p><strong>Known for</strong></p><ul><li>Brighter, more even skin tone</li><li>Firming and anti-aging support</li></ul>",
      "shortDescription": "A copper peptide variant (AHK-Cu) known for its brightening and firming benefits.",
      "dosageOptions": [
        {
          "mg": "50mg",
          "price": 2350
        },
        {
          "mg": "100mg",
          "price": 3550
        }
      ],
      "price": 2350,
      "noPackages": false
    },
    {
      "name": "SNAP-8",
      "slug": "snap-8",
      "category": "Skin & Beauty",
      "description": "<p>A topical neuropeptide often described as a gentler, non-injectable alternative for expression lines.</p><p><strong>How it works.</strong> Blocks the signals that trigger repeated muscle contractions in the skin, similar in concept to Botox but applied topically.</p><p><strong>Known for</strong></p><ul><li>Smoother-looking skin</li><li>Reduced appearance of fine lines and wrinkles</li></ul>",
      "shortDescription": "A topical neuropeptide often described as a gentler, non-injectable alternative for expression lines.",
      "dosageOptions": [
        {
          "mg": "10mg",
          "price": 2335
        }
      ],
      "price": 2335,
      "noPackages": false
    },
    {
      "name": "Botulinum Toxin",
      "slug": "botulinum-toxin",
      "category": "Skin & Beauty",
      "description": "<p>A neurotoxin (injectable) used to relax targeted facial muscles.</p><p><strong>How it works.</strong> Temporarily blocks nerve signals to specific muscles, preventing the repeated movement that causes wrinkles.</p><p><strong>Known for</strong></p><ul><li>Reduced appearance of expression lines and wrinkles</li></ul>",
      "shortDescription": "A neurotoxin (injectable) used to relax targeted facial muscles.",
      "dosageOptions": [
        {
          "mg": "100iu",
          "price": 4240
        }
      ],
      "price": 4240,
      "noPackages": false
    },
    {
      "name": "Hyaluronic Acid",
      "slug": "hyaluronic-acid",
      "category": "Skin & Beauty",
      "description": "<p>A humectant compound (not a peptide) known for plumping and moisturizing skin.</p><p><strong>How it works.</strong> Binds water molecules within the skin to boost hydration and volume.</p><p><strong>Known for</strong></p><ul><li>Plumper, more hydrated skin</li><li>Smoother texture</li></ul>",
      "shortDescription": "A humectant compound (not a peptide) known for plumping and moisturizing skin.",
      "dosageOptions": [
        {
          "mg": "1ml",
          "price": 3550
        }
      ],
      "price": 3550,
      "noPackages": false
    },
    {
      "name": "Epitalon",
      "slug": "epitalon",
      "category": "Longevity",
      "description": "<p>A telomerase-supporting peptide linked to healthier cellular aging.</p><p><strong>How it works.</strong> Supports the activity of telomerase, an enzyme tied to how cells age over time.</p><p><strong>Known for</strong></p><ul><li>Longevity and anti-aging support</li><li>May support skin quality and sleep</li></ul>",
      "shortDescription": "A telomerase-supporting peptide linked to healthier cellular aging.",
      "dosageOptions": [
        {
          "mg": "10mg",
          "price": 2380
        },
        {
          "mg": "50mg",
          "price": 3925
        }
      ],
      "price": 2380,
      "noPackages": false
    },
    {
      "name": "Glow Blend",
      "slug": "glow-blend",
      "category": "Skin & Beauty",
      "description": "<p>A regenerative peptide blend built around healing and skin-quality peptides.</p><p><strong>How it works.</strong> Combines regenerative peptides (like BPC-157, TB-500, and GHK-Cu) for a layered healing and skin effect.</p><p><strong>Known for</strong></p><ul><li>Faster recovery</li><li>Smoother, refreshed-looking skin</li></ul>",
      "shortDescription": "A regenerative peptide blend built around healing and skin-quality peptides.",
      "dosageOptions": [
        {
          "mg": "70mg",
          "price": 4600
        }
      ],
      "price": 4600,
      "noPackages": false
    },
    {
      "name": "Klow Blend",
      "slug": "klow-blend",
      "category": "Skin & Beauty",
      "description": "<p>An advanced regenerative peptide blend building on Glow, with additional actives for skin and healing.</p><p><strong>How it works.</strong> Builds on the Glow Blend combination with an added anti-inflammatory peptide for a more complete effect.</p><p><strong>Known for</strong></p><ul><li>Advanced skin renewal</li><li>Combined healing and anti-inflammatory support</li></ul>",
      "shortDescription": "An advanced regenerative peptide blend building on Glow, with additional actives for skin and healing.",
      "dosageOptions": [
        {
          "mg": "80mg",
          "price": 5600
        }
      ],
      "price": 5600,
      "noPackages": false
    },
    {
      "name": "Healthy Hair & Skin Blend",
      "slug": "healthy-hair-skin-blend",
      "category": "Skin & Beauty",
      "description": "<p>A peptide-and-nutrient blend targeting both hair and skin quality.</p><p><strong>How it works.</strong> Combines peptides and nutrients that support cell renewal in hair follicles and skin.</p><p><strong>Known for</strong></p><ul><li>Support for hair growth</li><li>Improved skin quality</li></ul>",
      "shortDescription": "A peptide-and-nutrient blend targeting both hair and skin quality.",
      "dosageOptions": [
        {
          "mg": "10ml",
          "price": 5500
        }
      ],
      "price": 5500,
      "noPackages": false
    },
    {
      "name": "Fat Blaster Lipo-C",
      "slug": "fat-blaster-lipo-c",
      "category": "Metabolic",
      "description": "<p>A lipotropic compound blend (with B12) for fat metabolism and energy.</p><p><strong>How it works.</strong> Combines fat-mobilizing compounds with vitamin B12 to support metabolism and energy levels.</p><p><strong>Known for</strong></p><ul><li>Fat metabolism support</li><li>Energy boost</li></ul>",
      "shortDescription": "A lipotropic compound blend (with B12) for fat metabolism and energy.",
      "dosageOptions": [
        {
          "mg": "10ml",
          "price": 4555
        }
      ],
      "price": 4555,
      "noPackages": false
    },
    {
      "name": "Super Human Blend",
      "slug": "super-human-blend",
      "category": "Longevity",
      "description": "<p>A proprietary multi-peptide wellness blend designed for general energy and vitality support.</p><p><strong>How it works.</strong> Combines multiple wellness-support compounds into a single formula.</p><p><strong>Known for</strong></p><ul><li>General energy and wellness support</li></ul>",
      "shortDescription": "A proprietary multi-peptide wellness blend designed for general energy and vitality support.",
      "dosageOptions": [
        {
          "mg": "10ml",
          "price": 3685
        }
      ],
      "price": 3685,
      "noPackages": false
    },
    {
      "name": "KPV + GHK-Cu",
      "slug": "kpv-plus-ghk-cu",
      "category": "Skin & Beauty",
      "description": "<p>A copper-peptide and anti-inflammatory blend pairing skin repair with calming.</p><p><strong>How it works.</strong> Combines GHK-Cu's collagen-boosting repair signal with KPV's calming, anti-inflammatory effect.</p><p><strong>Known for</strong></p><ul><li>Skin repair and calming in one</li><li>Good for sensitive or reactive skin</li></ul>",
      "shortDescription": "A copper-peptide and anti-inflammatory blend pairing skin repair with calming.",
      "dosageOptions": [
        {
          "mg": "60mg",
          "price": 3900
        }
      ],
      "price": 3900,
      "noPackages": false
    },
    {
      "name": "AHK-Cu Cosmetic",
      "slug": "ahk-cu-cosmetic",
      "category": "Skin & Beauty",
      "description": "<p>A cosmetic-grade copper peptide (AHK-Cu) formulated for topical skincare use.</p><p><strong>How it works.</strong> Delivers the same collagen-supporting, brightening copper-peptide effect directly through the skin.</p><p><strong>Known for</strong></p><ul><li>Brightening and firming</li></ul>",
      "shortDescription": "A cosmetic-grade copper peptide (AHK-Cu) formulated for topical skincare use.",
      "dosageOptions": [
        {
          "mg": "1g",
          "price": 3250
        }
      ],
      "price": 3250,
      "noPackages": true
    },
    {
      "name": "GHK-Cu Cosmetic",
      "slug": "ghk-cu-cosmetic",
      "category": "Skin & Beauty",
      "description": "<p>A cosmetic-grade copper peptide (GHK-Cu) formulated for topical skincare use.</p><p><strong>How it works.</strong> Applies GHK-Cu's collagen-building, repair-signaling effect directly to the skin's surface.</p><p><strong>Known for</strong></p><ul><li>Firmness and repair support</li></ul>",
      "shortDescription": "A cosmetic-grade copper peptide (GHK-Cu) formulated for topical skincare use.",
      "dosageOptions": [
        {
          "mg": "1g",
          "price": 2350
        }
      ],
      "price": 2350,
      "noPackages": true
    },
    {
      "name": "Matryxil",
      "slug": "matryxil",
      "category": "Skin & Beauty",
      "description": "<p>A collagen-boosting peptide known as a gentler alternative to retinol for firming skin.</p><p><strong>How it works.</strong> Encourages the skin to produce more collagen and elastin without the irritation retinol can cause.</p><p><strong>Known for</strong></p><ul><li>Firming and wrinkle reduction</li><li>Gentle on sensitive skin</li></ul>",
      "shortDescription": "A collagen-boosting peptide known as a gentler alternative to retinol for firming skin.",
      "dosageOptions": [
        {
          "mg": "1g",
          "price": 14050
        }
      ],
      "price": 14050,
      "noPackages": true
    },
    {
      "name": "PDRN (Polydeoxyribonucleotide)",
      "slug": "pdrn-polydeoxyribonucleotide",
      "category": "Skin & Beauty",
      "description": "<p>A DNA-derived regenerative compound (not a peptide) popular in advanced skincare.</p><p><strong>How it works.</strong> Triggers the skin's natural repair signals and growth factor release to regenerate tissue.</p><p><strong>Known for</strong></p><ul><li>Skin repair and regeneration</li><li>Improved hydration</li></ul>",
      "shortDescription": "A DNA-derived regenerative compound (not a peptide) popular in advanced skincare.",
      "dosageOptions": [
        {
          "mg": "1g",
          "price": 2950
        }
      ],
      "price": 2950,
      "noPackages": true
    },
    {
      "name": "PDRN Serum",
      "slug": "pdrn-serum",
      "category": "Skin & Beauty",
      "description": "<p>A PDRN-based serum delivering regenerative benefits topically.</p><p><strong>How it works.</strong> Same regenerative, growth-factor-stimulating action as PDRN, in an easy daily-use serum.</p><p><strong>Known for</strong></p><ul><li>Daily regenerative skincare support</li></ul>",
      "shortDescription": "A PDRN-based serum delivering regenerative benefits topically.",
      "dosageOptions": [
        {
          "mg": "10 pcs",
          "price": 3400
        }
      ],
      "price": 3400,
      "noPackages": true
    },
    {
      "name": "Whitening & Spot Fading",
      "slug": "whitening-spot-fading",
      "category": "Skin & Beauty",
      "description": "<p>A pigment-targeting topical treatment designed to fade dark spots and even skin tone.</p><p><strong>How it works.</strong> Targets pigment-producing activity in the skin to reduce the appearance of dark spots over time.</p><p><strong>Known for</strong></p><ul><li>Brighter, more even complexion</li><li>Reduced dark spots</li></ul>",
      "shortDescription": "A pigment-targeting topical treatment designed to fade dark spots and even skin tone.",
      "dosageOptions": [
        {
          "mg": "3ml",
          "price": 2200
        }
      ],
      "price": 2200,
      "noPackages": true
    },
    {
      "name": "PDRN Skinbooster",
      "slug": "pdrn-skinbooster",
      "category": "Skin & Beauty",
      "description": "<p>A PDRN-based injectable-style skin booster built around its regenerative properties.</p><p><strong>How it works.</strong> Delivers concentrated PDRN into the skin to accelerate repair and hydration.</p><p><strong>Known for</strong></p><ul><li>Deep hydration</li><li>Skin renewal and glow</li></ul>",
      "shortDescription": "A PDRN-based injectable-style skin booster built around its regenerative properties.",
      "dosageOptions": [
        {
          "mg": "5ml",
          "price": 2200
        }
      ],
      "price": 2200,
      "noPackages": true
    },
    {
      "name": "Collagen Skinbooster",
      "slug": "collagen-skinbooster",
      "category": "Skin & Beauty",
      "description": "<p>A collagen-based skin booster formulated to directly replenish the skin's collagen supply.</p><p><strong>How it works.</strong> Delivers collagen-supporting ingredients into the skin to improve firmness and elasticity.</p><p><strong>Known for</strong></p><ul><li>Firmer, more elastic skin</li><li>Reduced fine lines</li></ul>",
      "shortDescription": "A collagen-based skin booster formulated to directly replenish the skin's collagen supply.",
      "dosageOptions": [
        {
          "mg": "3ml",
          "price": 2500
        }
      ],
      "price": 2500,
      "noPackages": true
    },
    {
      "name": "Pink Hya Acid Essence",
      "slug": "pink-hya-acid-essence",
      "category": "Skin & Beauty",
      "description": "<p>A hyaluronic acid–based essence (not a peptide) for daily hydration.</p><p><strong>How it works.</strong> Draws and holds water in the skin for an immediate hydration boost.</p><p><strong>Known for</strong></p><ul><li>Instant hydration</li><li>Dewy, plump skin finish</li></ul>",
      "shortDescription": "A hyaluronic acid–based essence (not a peptide) for daily hydration.",
      "dosageOptions": [
        {
          "mg": "3ml",
          "price": 2200
        }
      ],
      "price": 2200,
      "noPackages": true
    }
  ];

  function norm(s){ return String(s||'').toLowerCase().replace(/\([^)]*\)/g,'')
    .replace(/\b(and|blend)\b/g,'').replace(/[^a-z0-9]+/g,''); }
  var ALIAS = { 'cargrilintide':'cagrilintide', 'botolinumtoxin':'botulinumtoxin',
    // fold current-catalogue name variants onto the new canonical names so they
    // UPDATE in place (never duplicate):
    'cjc1295wodacipamorelin':'cjc1295ipamorelin', 'cjc1295nodacipamorelin':'cjc1295ipamorelin',
    'cjc1295wodac':'cjc1295', 'cjc1295nodac':'cjc1295',
    'cjc1295dac':'cjc1295withdac' };
  function nkey(s){ var k=norm(s); return ALIAS[k]||k; }

  window.importOptimaCatalog = async function (opts) {
    opts = opts || {};
    var apply = !!opts.apply;
    if (!window.fbDb) { console.error('Firestore not available. Open this on admin.html.'); return; }
    if (!(window.fbAuth && window.fbAuth.currentUser)) { console.error('Sign in as an admin first.'); return; }

    var snap = await window.fbDb.collection('products').get();
    var byName = {};
    snap.forEach(function (d) { var p = d.data(); byName[nkey(p.name)] = { id:d.id, data:p }; });

    var toUpdate = [], toCreate = [], liveMatched = {};
    RECORDS.forEach(function (r) {
      var hit = byName[nkey(r.name)];
      if (hit) { toUpdate.push({ id:hit.id, r:r, old:hit.data }); liveMatched[hit.id] = true; }
      else toCreate.push(r);
    });
    var liveOnly = [];
    snap.forEach(function (d) { if (!liveMatched[d.id]) liveOnly.push(d.data().name); });

    console.log('%cOPTIMA import — ' + (apply ? 'APPLY' : 'DRY RUN'), 'font-weight:bold;font-size:14px');
    console.log('Existing products in Firestore: ' + snap.size);
    console.log('Will UPDATE (matched by name): ' + toUpdate.length);
    console.table(toUpdate.map(function (u) {
      var np = Math.min.apply(null, u.r.dosageOptions.map(function(d){return d.price;}));
      var op = (u.old.dosageOptions && u.old.dosageOptions.length) ? Math.min.apply(null, u.old.dosageOptions.map(function(d){return d.price||0;})) : (u.old.price||0);
      return { name:u.r.name, oldBase:op, newBase:np, dosages:u.r.dosageOptions.length };
    }));
    console.log('Will CREATE (new products): ' + toCreate.length, toCreate.map(function(c){return c.name;}));
    console.log('Live products NOT in the sheet (left untouched): ' + liveOnly.length, liveOnly);

    if (!apply) { console.log('%cDry run only — nothing written. Re-run with { apply:true } to save.', 'color:#0a0');
      return { updated:0, created:0, wouldUpdate:toUpdate.length, wouldCreate:toCreate.length, liveOnly:liveOnly }; }

    var svTs = firebase.firestore.FieldValue.serverTimestamp();
    var nU=0, nC=0;
    for (var i=0;i<toUpdate.length;i++){ var u=toUpdate[i];
      // Update prices + descriptions + name; PRESERVE category, images, stock, sale, COA.
      await window.fbDb.collection('products').doc(u.id).set({
        name:u.r.name, description:u.r.description, shortDescription:u.r.shortDescription,
        dosageOptions:u.r.dosageOptions, price:Math.min.apply(null,u.r.dosageOptions.map(function(d){return d.price;})),
        noPackages:u.r.noPackages, updated_at:svTs
      }, { merge:true }); nU++;
    }
    for (var j=0;j<toCreate.length;j++){ var c=toCreate[j];
      await window.fbDb.collection('products').add({
        name:c.name, slug:c.slug, category:c.category,
        description:c.description, shortDescription:c.shortDescription,
        dosageOptions:c.dosageOptions, price:Math.min.apply(null,c.dosageOptions.map(function(d){return d.price;})),
        noPackages:c.noPackages, status:'active', verified:true, inStock:true, trackInventory:false,
        created_at:svTs, updated_at:svTs
      }); nC++;
    }
    console.log('%cDONE — updated ' + nU + ', created ' + nC + '.', 'color:#0a0;font-weight:bold');
    return { updated:nU, created:nC, liveOnly:liveOnly };
  };
  console.log('importOptimaCatalog() ready — dry run: await importOptimaCatalog();  apply: await importOptimaCatalog({apply:true});');
})();
