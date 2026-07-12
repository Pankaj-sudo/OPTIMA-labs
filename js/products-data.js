/* ================================================================
   OPTIMA LABS — Static product catalogue (fallback when Firestore
   is offline/blocked). Generated from the Optima Labs price sheet +
   product descriptions. Live storefront streams from Firestore via
   js/shop-data.js; run import-products.js in the admin to push these
   same records to Firestore.
   Package tiers are global add-ons (see js/product.js): Vial Only +0,
   + Bacteriostatic Water +300, Essential Kit +500, Elite Kit +1000.
   ================================================================ */
(function () {
  var RAW = [
    {
      "name": "Semaglutide",
      "category": "Weight Management",
      "description": "<p>A GLP-1 receptor agonist, a hormone-mimicking peptide widely used to support weight loss and blood sugar control.</p><p><strong>How it works.</strong> Copies a natural gut hormone (GLP-1) that tells your brain you're full and slows down how fast your stomach empties.</p><p><strong>Known for</strong></p><ul><li>Reduced appetite and cravings</li><li>Gradual, steady weight loss</li><li>Better blood sugar control</li></ul>",
      "shortDescription": "Helps you feel full faster and stay full longer, so it's easier to eat less and lose weight.",
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
      ]
    },
    {
      "name": "Tirzepatide",
      "category": "Weight Management",
      "description": "<p>A dual GIP/GLP-1 receptor agonist that builds on the same appetite pathway as Semaglutide, with an added hormone target for stronger results.</p><p><strong>How it works.</strong> Activates two gut hormone pathways (GLP-1 and GIP) instead of one, amplifying fullness signals and insulin response.</p><p><strong>Known for</strong></p><ul><li>More pronounced weight loss than single-pathway options</li><li>Improved blood sugar regulation</li><li>Reduced food cravings</li></ul>",
      "shortDescription": "Helps cut hunger and supports significant, steady weight loss.",
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
      ]
    },
    {
      "name": "Retatrutide",
      "category": "Weight Management",
      "description": "<p>A triple-hormone receptor agonist (GLP-1/GIP/glucagon), the newest generation of metabolic peptide, working on three hormone pathways at once.</p><p><strong>How it works.</strong> Adds a third receptor (glucagon) on top of GLP-1 and GIP, which also boosts how much energy your body burns at rest.</p><p><strong>Known for</strong></p><ul><li>Significant fat loss in early studies</li><li>Combined appetite suppression and calorie burning</li><li>Emerging as a next-step option beyond Tirzepatide</li></ul>",
      "shortDescription": "Helps reduce hunger while also helping your body burn more calories, supporting meaningful weight loss.",
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
      ]
    },
    {
      "name": "AOD-9604",
      "category": "Metabolic",
      "description": "<p>A growth hormone fragment (lipolytic peptide) isolated specifically for its fat-metabolizing properties.</p><p><strong>How it works.</strong> Mimics the piece of growth hormone responsible for breaking down fat, without affecting blood sugar or overall growth.</p><p><strong>Known for</strong></p><ul><li>Targeted fat metabolism</li><li>No impact on blood sugar or muscle growth</li><li>Considered a gentler metabolic option</li></ul>",
      "shortDescription": "Helps your body break down stubborn fat without other unwanted effects.",
      "dosageOptions": [
        {
          "mg": "5mg",
          "price": 2500
        },
        {
          "mg": "10mg",
          "price": 2950
        }
      ]
    },
    {
      "name": "Cagrilintide",
      "category": "Weight Management",
      "description": "<p>An amylin analog, an appetite-regulating peptide often paired with GLP-1 medications for enhanced results.</p><p><strong>How it works.</strong> Mimics amylin, a hormone that works alongside GLP-1 to increase fullness and slow digestion.</p><p><strong>Known for</strong></p><ul><li>Enhanced appetite suppression</li><li>Often combined with Semaglutide or Tirzepatide</li><li>Supports more consistent weight-loss results</li></ul>",
      "shortDescription": "Helps you feel full longer, often used together with other weight-loss options for even better results.",
      "dosageOptions": [
        {
          "mg": "5mg",
          "price": 3430
        },
        {
          "mg": "10mg",
          "price": 4390
        }
      ]
    },
    {
      "name": "Tesamorelin",
      "category": "Recovery & Repair",
      "description": "<p>A GHRH analog specifically recognized for targeting stubborn belly (visceral) fat.</p><p><strong>How it works.</strong> Signals the pituitary gland to release more of the body's own growth hormone, which in turn targets visceral (deep belly) fat.</p><p><strong>Known for</strong></p><ul><li>Reduction in visceral/belly fat</li><li>Improved body composition</li><li>Supports natural growth hormone levels</li></ul>",
      "shortDescription": "Specifically targets and helps reduce stubborn belly fat.",
      "dosageOptions": [
        {
          "mg": "5mg",
          "price": 3175
        },
        {
          "mg": "10mg",
          "price": 4525
        }
      ]
    },
    {
      "name": "BPC-157",
      "category": "Recovery & Repair",
      "description": "<p>A gastric-derived repair peptide, one of the most well-known healing peptides, valued for speeding up recovery from injury.</p><p><strong>How it works.</strong> Encourages new blood vessel growth toward damaged tissue and helps healing cells migrate faster to injury sites.</p><p><strong>Known for</strong></p><ul><li>Faster healing of muscles, tendons, and ligaments</li><li>Support for gut lining repair</li><li>Reduced recovery time after strain or injury</li></ul>",
      "shortDescription": "Speeds up healing after injuries, sore muscles, or stomach issues.",
      "dosageOptions": [
        {
          "mg": "5mg",
          "price": 2290
        },
        {
          "mg": "10mg",
          "price": 2605
        }
      ]
    },
    {
      "name": "TB-500",
      "category": "Recovery & Repair",
      "description": "<p>A Thymosin Beta-4 fragment, a recovery-focused peptide often used alongside BPC-157 for a more complete healing effect.</p><p><strong>How it works.</strong> Helps cells move more efficiently to injured areas and supports flexibility by influencing structural proteins in tissue.</p><p><strong>Known for</strong></p><ul><li>Improved flexibility and range of motion</li><li>Faster tissue repair</li><li>Reduced inflammation after injury</li></ul>",
      "shortDescription": "Helps your body heal faster and move more freely after an injury.",
      "dosageOptions": [
        {
          "mg": "5mg",
          "price": 2695
        },
        {
          "mg": "10mg",
          "price": 3670
        }
      ]
    },
    {
      "name": "BPC-157 + TB-500",
      "category": "Recovery & Repair",
      "description": "<p>A healing-peptide blend combining BPC-157 and TB-500, designed for a more complete recovery routine.</p><p><strong>How it works.</strong> Pairs BPC-157's tissue-repair signaling with TB-500's cell-mobility and flexibility support.</p><p><strong>Known for</strong></p><ul><li>Synergistic, faster overall recovery</li><li>Popular for injuries needing both repair and flexibility</li></ul>",
      "shortDescription": "Combines two popular healing favorites for faster, more complete recovery.",
      "dosageOptions": [
        {
          "mg": "10mg",
          "price": 3160
        },
        {
          "mg": "20mg",
          "price": 4660
        }
      ]
    },
    {
      "name": "KPV",
      "category": "Recovery & Repair",
      "description": "<p>An anti-inflammatory tripeptide known for soothing inflammation, particularly in the gut and skin.</p><p><strong>How it works.</strong> Interacts with immune cells to quiet down excess inflammation without broadly suppressing the immune system.</p><p><strong>Known for</strong></p><ul><li>Reduced gut inflammation</li><li>Calmer, less reactive skin</li><li>Gentle anti-inflammatory support</li></ul>",
      "shortDescription": "Calms down irritated skin and an upset stomach.",
      "dosageOptions": [
        {
          "mg": "5mg",
          "price": 2350
        },
        {
          "mg": "10mg",
          "price": 2650
        }
      ]
    },
    {
      "name": "Ipamorelin",
      "category": "Recovery & Repair",
      "description": "<p>A growth hormone secretagogue, a gentle peptide that encourages the body to release more of its own growth hormone.</p><p><strong>How it works.</strong> Signals the pituitary gland to release growth hormone, with very little effect on hunger or stress hormones.</p><p><strong>Known for</strong></p><ul><li>Improved muscle tone and recovery</li><li>Better sleep quality</li><li>Well-tolerated, minimal side effects</li></ul>",
      "shortDescription": "Helps your body build muscle, recover faster, and sleep better.",
      "dosageOptions": [
        {
          "mg": "5mg",
          "price": 2245
        },
        {
          "mg": "10mg",
          "price": 2725
        }
      ]
    },
    {
      "name": "CJC-1295 (No DAC)",
      "category": "Recovery & Repair",
      "description": "<p>A GHRH analog (short-acting) that boosts natural growth hormone pulses, often paired with Ipamorelin.</p><p><strong>How it works.</strong> Mimics the hormone that tells the pituitary gland to release growth hormone in natural pulses.</p><p><strong>Known for</strong></p><ul><li>Increased natural growth hormone release</li><li>Support for muscle tone and recovery</li><li>Often combined with Ipamorelin for stronger effect</li></ul>",
      "shortDescription": "Boosts your energy, muscle tone, and recovery naturally.",
      "dosageOptions": [
        {
          "mg": "5mg",
          "price": 2770
        },
        {
          "mg": "10mg",
          "price": 4300
        }
      ]
    },
    {
      "name": "CJC-1295 with DAC",
      "category": "Recovery & Repair",
      "description": "<p>A GHRH analog (long-acting) built for sustained, steady growth hormone support.</p><p><strong>How it works.</strong> Same growth-hormone-releasing signal as CJC-1295, but modified to stay active in the body longer.</p><p><strong>Known for</strong></p><ul><li>Steady, longer-lasting growth hormone elevation</li><li>Less frequent dosing needed</li></ul>",
      "shortDescription": "Gives the same benefits as CJC-1295, but the effects last longer.",
      "dosageOptions": [
        {
          "mg": "5mg",
          "price": 4150
        }
      ]
    },
    {
      "name": "CJC-1295 (No DAC) + Ipamorelin",
      "category": "Recovery & Repair",
      "description": "<p>A growth hormone secretagogue blend designed to maximize natural growth hormone release.</p><p><strong>How it works.</strong> Combines two different signals to the pituitary gland for a stronger, more complete growth hormone pulse.</p><p><strong>Known for</strong></p><ul><li>Enhanced muscle recovery and fat metabolism</li><li>Improved sleep quality</li><li>Popular anti-aging combination</li></ul>",
      "shortDescription": "Combines two favorites for better muscle tone, fat loss, and sleep.",
      "dosageOptions": [
        {
          "mg": "10mg",
          "price": 4675
        }
      ]
    },
    {
      "name": "Sermorelin",
      "category": "Recovery & Repair",
      "description": "<p>A GHRH analog offering a gentle introduction to growth hormone support, often chosen by those new to this category.</p><p><strong>How it works.</strong> Encourages the pituitary gland to gradually increase its own natural growth hormone production.</p><p><strong>Known for</strong></p><ul><li>Gradual improvement in energy and recovery</li><li>Support for healthier body composition over time</li></ul>",
      "shortDescription": "A gentle way to slowly improve your energy and body shape over time.",
      "dosageOptions": [
        {
          "mg": "5mg",
          "price": 2695
        },
        {
          "mg": "10mg",
          "price": 3475
        }
      ]
    },
    {
      "name": "Semax",
      "category": "Recovery & Repair",
      "description": "<p>A nootropic peptide used to sharpen focus and mental performance.</p><p><strong>How it works.</strong> Boosts a natural brain-growth protein (BDNF) that helps brain cells stay healthy and communicate better.</p><p><strong>Known for</strong></p><ul><li>Improved focus and memory</li><li>Greater mental clarity</li><li>Support during demanding mental tasks</li></ul>",
      "shortDescription": "Helps you think more clearly and remember things better.",
      "dosageOptions": [
        {
          "mg": "5mg",
          "price": 2125
        },
        {
          "mg": "10mg",
          "price": 2575
        }
      ]
    },
    {
      "name": "Selank",
      "category": "Sleep & Calm",
      "description": "<p>An anxiolytic (anti-anxiety) nootropic known for easing anxiety without causing drowsiness.</p><p><strong>How it works.</strong> Balances calming brain chemicals (GABA and serotonin) to reduce stress without sedating effects.</p><p><strong>Known for</strong></p><ul><li>Reduced anxiety and stress</li><li>Calm, clear-headed feeling</li><li>No drowsy or foggy side effects</li></ul>",
      "shortDescription": "Helps you feel calmer and less stressed, without making you sleepy.",
      "dosageOptions": [
        {
          "mg": "5mg",
          "price": 2260
        },
        {
          "mg": "10mg",
          "price": 2650
        }
      ]
    },
    {
      "name": "Semax + Selank",
      "category": "Recovery & Repair",
      "description": "<p>A nootropic blend that pairs mental sharpness with a calmer, steadier state of mind.</p><p><strong>How it works.</strong> Combines Semax's brain-support pathway with Selank's calming effect.</p><p><strong>Known for</strong></p><ul><li>Focus and calm together</li><li>Popular for high-stress, high-focus days</li></ul>",
      "shortDescription": "Helps you stay focused while also feeling calm.",
      "dosageOptions": [
        {
          "mg": "20mg",
          "price": 3550
        }
      ]
    },
    {
      "name": "DSIP (Delta Sleep-Inducing Peptide)",
      "category": "Sleep & Calm",
      "description": "<p>A sleep-regulating peptide associated with deeper, more restorative sleep.</p><p><strong>How it works.</strong> Interacts with the brain's sleep-regulating centers to encourage deeper stages of sleep.</p><p><strong>Known for</strong></p><ul><li>Improved sleep quality</li><li>Better stress resilience</li></ul>",
      "shortDescription": "Helps you fall into a deeper, more restful sleep.",
      "dosageOptions": [
        {
          "mg": "5mg",
          "price": 2290
        },
        {
          "mg": "10mg",
          "price": 3100
        }
      ]
    },
    {
      "name": "PT-141",
      "category": "Intimacy",
      "description": "<p>A melanocortin receptor agonist used to support and increase sexual desire in both men and women.</p><p><strong>How it works.</strong> Acts on the brain's arousal pathway directly, rather than working through blood flow like traditional options.</p><p><strong>Known for</strong></p><ul><li>Increased libido and desire</li><li>Works for both men and women</li></ul>",
      "shortDescription": "Increases sexual desire in both men and women.",
      "dosageOptions": [
        {
          "mg": "10mg",
          "price": 2605
        }
      ]
    },
    {
      "name": "MT-2 (Melanotan II)",
      "category": "Intimacy",
      "description": "<p>A melanocortin agonist best known for giving skin a natural tanned look, with a secondary effect on libido.</p><p><strong>How it works.</strong> Stimulates the skin's pigment-producing cells, and touches the same arousal pathway as PT-141.</p><p><strong>Known for</strong></p><ul><li>Natural-looking tan</li><li>Mild boost to libido</li></ul>",
      "shortDescription": "Gives skin a natural-looking tan and can also boost your sex drive.",
      "dosageOptions": [
        {
          "mg": "10mg",
          "price": 2305
        }
      ]
    },
    {
      "name": "Kisspeptin-10",
      "category": "Intimacy",
      "description": "<p>A reproductive-axis peptide, a key player in the body's hormone signaling chain.</p><p><strong>How it works.</strong> Triggers the release of the hormone that starts the whole reproductive hormone cascade in the brain.</p><p><strong>Known for</strong></p><ul><li>Hormone balance support</li><li>Libido support</li><li>Fertility-related hormone signaling</li></ul>",
      "shortDescription": "Helps balance your hormones and can boost your sex drive.",
      "dosageOptions": [
        {
          "mg": "5mg",
          "price": 2575
        },
        {
          "mg": "10mg",
          "price": 3550
        }
      ]
    },
    {
      "name": "Oxytocin",
      "category": "Intimacy",
      "description": "<p>A neuropeptide hormone known as the “bonding hormone,” associated with connection and intimacy.</p><p><strong>How it works.</strong> Acts on brain receptors involved in trust, bonding, and emotional closeness.</p><p><strong>Known for</strong></p><ul><li>Enhanced emotional connection</li><li>Relaxation and feelings of closeness</li></ul>",
      "shortDescription": "Known as the “love hormone,” it helps you feel closer and more connected to others.",
      "dosageOptions": [
        {
          "mg": "2mg",
          "price": 2200
        }
      ]
    },
    {
      "name": "Thymalin",
      "category": "Longevity",
      "description": "<p>A thymic peptide that supports the thymus gland, the organ responsible for training immune cells.</p><p><strong>How it works.</strong> Supports thymus gland function, which naturally declines with age.</p><p><strong>Known for</strong></p><ul><li>Improved immune regulation</li><li>Support for aging immune systems</li></ul>",
      "shortDescription": "Helps keep your immune system strong and balanced.",
      "dosageOptions": [
        {
          "mg": "10mg",
          "price": 2500
        }
      ]
    },
    {
      "name": "Thymosin Alpha-1",
      "category": "Longevity",
      "description": "<p>An immune-modulating peptide used to strengthen the body's natural defenses.</p><p><strong>How it works.</strong> Helps regulate and activate immune (T-cell) activity for a more balanced immune response.</p><p><strong>Known for</strong></p><ul><li>Stronger immune defense</li><li>Support during illness recovery</li></ul>",
      "shortDescription": "Helps your body fight off sickness more effectively.",
      "dosageOptions": [
        {
          "mg": "5mg",
          "price": 3025
        },
        {
          "mg": "10mg",
          "price": 4225
        }
      ]
    },
    {
      "name": "LL-37",
      "category": "Recovery & Repair",
      "description": "<p>An antimicrobial peptide (cathelicidin) with natural antibacterial and healing properties.</p><p><strong>How it works.</strong> Disrupts harmful bacteria while also helping regulate the immune response and support wound healing.</p><p><strong>Known for</strong></p><ul><li>Antimicrobial support</li><li>Wound healing</li><li>Immune modulation</li></ul>",
      "shortDescription": "Helps wounds heal and helps your body fight off germs.",
      "dosageOptions": [
        {
          "mg": "10mg",
          "price": 2800
        }
      ]
    },
    {
      "name": "SS-31",
      "category": "Longevity",
      "description": "<p>A mitochondria-targeted peptide aimed at reducing age-related fatigue.</p><p><strong>How it works.</strong> Protects the mitochondria, the cell's energy factories, helping them work more efficiently.</p><p><strong>Known for</strong></p><ul><li>Improved cellular energy</li><li>Reduced fatigue associated with aging</li></ul>",
      "shortDescription": "Fights tiredness and gives you more everyday energy.",
      "dosageOptions": [
        {
          "mg": "10mg",
          "price": 2980
        },
        {
          "mg": "50mg",
          "price": 7000
        }
      ]
    },
    {
      "name": "MOTS-c",
      "category": "Metabolic",
      "description": "<p>A mitochondrial-derived peptide (MDP) linked to better metabolism and energy.</p><p><strong>How it works.</strong> Regulates metabolic pathways from inside the cell to improve how the body uses energy and insulin.</p><p><strong>Known for</strong></p><ul><li>Better metabolism</li><li>Improved exercise capacity</li><li>Cellular energy support</li></ul>",
      "shortDescription": "Helps your body use energy better and improves stamina during exercise.",
      "dosageOptions": [
        {
          "mg": "10mg",
          "price": 2575
        },
        {
          "mg": "40mg",
          "price": 4750
        }
      ]
    },
    {
      "name": "HCG",
      "category": "Intimacy",
      "description": "<p>A gonadotropin hormone used to support natural testosterone production and fertility.</p><p><strong>How it works.</strong> Mimics a signaling hormone (LH) that tells the reproductive glands to stay active.</p><p><strong>Known for</strong></p><ul><li>Support for natural testosterone production</li><li>Fertility support</li></ul>",
      "shortDescription": "Helps support natural testosterone levels and fertility.",
      "dosageOptions": [
        {
          "mg": "5000iu",
          "price": 2950
        },
        {
          "mg": "10000iu",
          "price": 4225
        }
      ]
    },
    {
      "name": "HMG",
      "category": "Intimacy",
      "description": "<p>A gonadotropin hormone used to stimulate the ovaries for fertility support.</p><p><strong>How it works.</strong> Combines two reproductive hormone signals (FSH and LH) to stimulate ovarian activity.</p><p><strong>Known for</strong></p><ul><li>Ovarian stimulation</li><li>Support for fertility treatment</li></ul>",
      "shortDescription": "Used to help support fertility treatments.",
      "dosageOptions": [
        {
          "mg": "75iu",
          "price": 2650
        }
      ]
    },
    {
      "name": "EPO",
      "category": "Metabolic",
      "description": "<p>A glycoprotein hormone known for boosting red blood cell production.</p><p><strong>How it works.</strong> Signals the bone marrow to produce more red blood cells.</p><p><strong>Known for</strong></p><ul><li>Increased red blood cell count</li><li>Improved oxygen delivery and endurance</li></ul>",
      "shortDescription": "Boosts red blood cells, which can improve stamina and endurance.",
      "dosageOptions": [
        {
          "mg": "3000iu",
          "price": 3400
        }
      ]
    },
    {
      "name": "Glutathione",
      "category": "Skin & Beauty",
      "description": "<p>An antioxidant tripeptide, the body's master antioxidant, well known for brightening skin from within.</p><p><strong>How it works.</strong> Neutralizes free radicals and supports the liver's natural detox process.</p><p><strong>Known for</strong></p><ul><li>Skin brightening and even tone</li><li>Detoxification support</li><li>Antioxidant protection</li></ul>",
      "shortDescription": "Brightens your skin and helps clean out toxins from the inside.",
      "dosageOptions": [
        {
          "mg": "1500mg",
          "price": 2725
        }
      ]
    },
    {
      "name": "NAD+",
      "category": "Longevity",
      "description": "<p>A coenzyme precursor, one of the most popular options for boosting energy and mental clarity.</p><p><strong>How it works.</strong> Replenishes a coenzyme your cells need to produce energy and repair DNA.</p><p><strong>Known for</strong></p><ul><li>Increased energy</li><li>Mental clarity</li><li>Anti-aging, cellular-level support</li></ul>",
      "shortDescription": "Boosts your energy and helps you think more clearly.",
      "dosageOptions": [
        {
          "mg": "100mg",
          "price": 2200
        },
        {
          "mg": "500mg",
          "price": 2800
        }
      ]
    },
    {
      "name": "5-Amino-1MQ",
      "category": "Metabolic",
      "description": "<p>An NNMT-inhibitor compound used for fat loss and body composition.</p><p><strong>How it works.</strong> Blocks an enzyme (NNMT) that normally slows down metabolism and encourages fat storage.</p><p><strong>Known for</strong></p><ul><li>Improved fat metabolism</li><li>Better body composition</li></ul>",
      "shortDescription": "Helps your body burn fat and get leaner.",
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
      ]
    },
    {
      "name": "Melatonin",
      "category": "Sleep & Calm",
      "description": "<p>An indoleamine hormone, the body's natural sleep regulator.</p><p><strong>How it works.</strong> Signals your internal body clock that it's time to wind down and sleep.</p><p><strong>Known for</strong></p><ul><li>Improved sleep onset</li><li>Better overall sleep quality</li></ul>",
      "shortDescription": "Helps you fall asleep faster and sleep more soundly.",
      "dosageOptions": [
        {
          "mg": "5mg",
          "price": 2425
        }
      ]
    },
    {
      "name": "Dermorphin",
      "category": "Recovery & Repair",
      "description": "<p>An opioid peptide known for potent pain relief, used with caution due to its strength.</p><p><strong>How it works.</strong> Binds strongly to the body's pain-relief (opioid) receptors.</p><p><strong>Known for</strong></p><ul><li>Strong pain relief</li><li>Reserved for cases requiring potent analgesia</li></ul>",
      "shortDescription": "A very strong option for pain relief, used carefully.",
      "dosageOptions": [
        {
          "mg": "5mg",
          "price": 2500
        }
      ]
    },
    {
      "name": "VIP (Vasoactive Intestinal Peptide)",
      "category": "Recovery & Repair",
      "description": "<p>A neuropeptide that supports the gut, lungs, and inflammatory balance.</p><p><strong>How it works.</strong> Relaxes smooth muscle and blood vessels while helping regulate immune and inflammatory activity.</p><p><strong>Known for</strong></p><ul><li>Support for gut and respiratory health</li><li>Inflammatory balance</li></ul>",
      "shortDescription": "Helps keep your gut, lungs, and overall comfort in balance.",
      "dosageOptions": [
        {
          "mg": "5mg",
          "price": 2950
        },
        {
          "mg": "10mg",
          "price": 3925
        }
      ]
    },
    {
      "name": "SLU-PP-332",
      "category": "Metabolic",
      "description": "<p>An exercise mimetic, an emerging compound studied for its metabolic effects.</p><p><strong>How it works.</strong> Activates the same cellular pathways that exercise naturally triggers, boosting how cells produce energy.</p><p><strong>Known for</strong></p><ul><li>Increased calorie burning</li><li>Endurance-like metabolic effects</li></ul>",
      "shortDescription": "Mimics the effects of exercise on your body.",
      "dosageOptions": [
        {
          "mg": "5mg",
          "price": 3700
        }
      ]
    },
    {
      "name": "PNC-27",
      "category": "Longevity",
      "description": "<p>A research-stage, cell-targeting peptide studied for its ability to target abnormal cells.</p><p><strong>How it works.</strong> Interacts with a specific protein pathway found on abnormal cell membranes.</p><p><strong>Known for</strong></p><ul><li>Investigational, research-use interest</li><li>Cellular targeting studies</li></ul>",
      "shortDescription": "A new option researchers are still studying for targeting unhealthy cells.",
      "dosageOptions": [
        {
          "mg": "5mg",
          "price": 3160
        },
        {
          "mg": "10mg",
          "price": 4300
        }
      ]
    },
    {
      "name": "GHK-Cu",
      "category": "Skin & Beauty",
      "description": "<p>A copper peptide (GHK-Cu) well known for improving skin firmness and healing.</p><p><strong>How it works.</strong> Signals skin cells to produce more collagen and repair themselves, while also acting as an antioxidant.</p><p><strong>Known for</strong></p><ul><li>Firmer, smoother skin</li><li>Improved wound healing</li><li>Reduced fine lines over time</li></ul>",
      "shortDescription": "Makes skin firmer and helps wounds heal faster.",
      "dosageOptions": [
        {
          "mg": "50mg",
          "price": 2200
        },
        {
          "mg": "100mg",
          "price": 2500
        }
      ]
    },
    {
      "name": "AHK-Cu",
      "category": "Skin & Beauty",
      "description": "<p>A copper peptide variant (AHK-Cu) known for its brightening and firming benefits.</p><p><strong>How it works.</strong> Works through a similar collagen-boosting pathway as GHK-Cu, with added skin-brightening effects.</p><p><strong>Known for</strong></p><ul><li>Brighter, more even skin tone</li><li>Firming and anti-aging support</li></ul>",
      "shortDescription": "Brightens and firms your skin.",
      "dosageOptions": [
        {
          "mg": "50mg",
          "price": 2350
        },
        {
          "mg": "100mg",
          "price": 3550
        }
      ]
    },
    {
      "name": "SNAP-8",
      "category": "Skin & Beauty",
      "description": "<p>A topical neuropeptide often described as a gentler, non-injectable alternative for expression lines.</p><p><strong>How it works.</strong> Blocks the signals that trigger repeated muscle contractions in the skin, similar in concept to Botox but applied topically.</p><p><strong>Known for</strong></p><ul><li>Smoother-looking skin</li><li>Reduced appearance of fine lines and wrinkles</li></ul>",
      "shortDescription": "Smooths out fine lines without needing needles.",
      "dosageOptions": [
        {
          "mg": "10mg",
          "price": 2335
        }
      ]
    },
    {
      "name": "Botulinum Toxin",
      "category": "Skin & Beauty",
      "description": "<p>A neurotoxin (injectable) used to relax targeted facial muscles.</p><p><strong>How it works.</strong> Temporarily blocks nerve signals to specific muscles, preventing the repeated movement that causes wrinkles.</p><p><strong>Known for</strong></p><ul><li>Reduced appearance of expression lines and wrinkles</li></ul>",
      "shortDescription": "Smooths out the look of wrinkles.",
      "dosageOptions": [
        {
          "mg": "100iu",
          "price": 4240
        }
      ]
    },
    {
      "name": "Hyaluronic Acid",
      "category": "Skin & Beauty",
      "description": "<p>A humectant compound (not a peptide) known for plumping and moisturizing skin.</p><p><strong>How it works.</strong> Binds water molecules within the skin to boost hydration and volume.</p><p><strong>Known for</strong></p><ul><li>Plumper, more hydrated skin</li><li>Smoother texture</li></ul>",
      "shortDescription": "Deeply hydrates and plumps up your skin.",
      "dosageOptions": [
        {
          "mg": "1ml",
          "price": 3550
        }
      ]
    },
    {
      "name": "Epitalon",
      "category": "Longevity",
      "description": "<p>A telomerase-supporting peptide linked to healthier cellular aging.</p><p><strong>How it works.</strong> Supports the activity of telomerase, an enzyme tied to how cells age over time.</p><p><strong>Known for</strong></p><ul><li>Longevity and anti-aging support</li><li>May support skin quality and sleep</li></ul>",
      "shortDescription": "Supports healthy aging and better sleep.",
      "dosageOptions": [
        {
          "mg": "10mg",
          "price": 2380
        },
        {
          "mg": "50mg",
          "price": 3925
        }
      ]
    },
    {
      "name": "Glow Blend",
      "category": "Skin & Beauty",
      "description": "<p>A regenerative peptide blend built around healing and skin-quality peptides.</p><p><strong>How it works.</strong> Combines regenerative peptides (like BPC-157, TB-500, and GHK-Cu) for a layered healing and skin effect.</p><p><strong>Known for</strong></p><ul><li>Faster recovery</li><li>Smoother, refreshed-looking skin</li></ul>",
      "shortDescription": "Combines top healing favorites for smoother, refreshed-looking skin.",
      "dosageOptions": [
        {
          "mg": "70mg",
          "price": 4600
        }
      ]
    },
    {
      "name": "Klow Blend",
      "category": "Skin & Beauty",
      "description": "<p>An advanced regenerative peptide blend building on Glow, with additional actives for skin and healing.</p><p><strong>How it works.</strong> Builds on the Glow Blend combination with an added anti-inflammatory peptide for a more complete effect.</p><p><strong>Known for</strong></p><ul><li>Advanced skin renewal</li><li>Combined healing and anti-inflammatory support</li></ul>",
      "shortDescription": "A more advanced mix for skin health and healing.",
      "dosageOptions": [
        {
          "mg": "80mg",
          "price": 5600
        }
      ]
    },
    {
      "name": "Healthy Hair & Skin Blend",
      "category": "Skin & Beauty",
      "description": "<p>A peptide-and-nutrient blend targeting both hair and skin quality.</p><p><strong>How it works.</strong> Combines peptides and nutrients that support cell renewal in hair follicles and skin.</p><p><strong>Known for</strong></p><ul><li>Support for hair growth</li><li>Improved skin quality</li></ul>",
      "shortDescription": "Supports fuller-looking hair and healthier skin.",
      "dosageOptions": [
        {
          "mg": "10ml",
          "price": 5500
        }
      ]
    },
    {
      "name": "Fat Blaster Lipo-C",
      "category": "Metabolic",
      "description": "<p>A lipotropic compound blend (with B12) for fat metabolism and energy.</p><p><strong>How it works.</strong> Combines fat-mobilizing compounds with vitamin B12 to support metabolism and energy levels.</p><p><strong>Known for</strong></p><ul><li>Fat metabolism support</li><li>Energy boost</li></ul>",
      "shortDescription": "Helps your body burn fat and gives you an energy boost.",
      "dosageOptions": [
        {
          "mg": "10ml",
          "price": 4555
        }
      ]
    },
    {
      "name": "Super Human Blend",
      "category": "Longevity",
      "description": "<p>A proprietary multi-peptide wellness blend designed for general energy and vitality support.</p><p><strong>How it works.</strong> Combines multiple wellness-support compounds into a single formula.</p><p><strong>Known for</strong></p><ul><li>General energy and wellness support</li></ul>",
      "shortDescription": "Gives an all-around boost to your energy and wellness.",
      "dosageOptions": [
        {
          "mg": "10ml",
          "price": 3685
        }
      ]
    },
    {
      "name": "KPV + GHK-Cu",
      "category": "Skin & Beauty",
      "description": "<p>A copper-peptide and anti-inflammatory blend pairing skin repair with calming.</p><p><strong>How it works.</strong> Combines GHK-Cu's collagen-boosting repair signal with KPV's calming, anti-inflammatory effect.</p><p><strong>Known for</strong></p><ul><li>Skin repair and calming in one</li><li>Good for sensitive or reactive skin</li></ul>",
      "shortDescription": "Repairs and calms your skin at the same time.",
      "dosageOptions": [
        {
          "mg": "60mg",
          "price": 3900
        }
      ]
    },
    {
      "name": "AHK-Cu Cosmetic",
      "category": "Skin & Beauty",
      "description": "<p>A cosmetic-grade copper peptide (AHK-Cu) formulated for topical skincare use.</p><p><strong>How it works.</strong> Delivers the same collagen-supporting, brightening copper-peptide effect directly through the skin.</p><p><strong>Known for</strong></p><ul><li>Brightening and firming</li></ul>",
      "shortDescription": "A skincare version that brightens and firms skin.",
      "dosageOptions": [
        {
          "mg": "1g",
          "price": 3250
        }
      ],
      "noPackages": true
    },
    {
      "name": "GHK-Cu Cosmetic",
      "category": "Skin & Beauty",
      "description": "<p>A cosmetic-grade copper peptide (GHK-Cu) formulated for topical skincare use.</p><p><strong>How it works.</strong> Applies GHK-Cu's collagen-building, repair-signaling effect directly to the skin's surface.</p><p><strong>Known for</strong></p><ul><li>Firmness and repair support</li></ul>",
      "shortDescription": "A skincare version that firms and repairs skin.",
      "dosageOptions": [
        {
          "mg": "1g",
          "price": 2350
        }
      ],
      "noPackages": true
    },
    {
      "name": "Matryxil",
      "category": "Skin & Beauty",
      "description": "<p>A collagen-boosting peptide known as a gentler alternative to retinol for firming skin.</p><p><strong>How it works.</strong> Encourages the skin to produce more collagen and elastin without the irritation retinol can cause.</p><p><strong>Known for</strong></p><ul><li>Firming and wrinkle reduction</li><li>Gentle on sensitive skin</li></ul>",
      "shortDescription": "Firms skin gently, without the irritation stronger products can cause.",
      "dosageOptions": [
        {
          "mg": "1g",
          "price": 14050
        }
      ],
      "noPackages": true
    },
    {
      "name": "PDRN (Polydeoxyribonucleotide)",
      "category": "Skin & Beauty",
      "description": "<p>A DNA-derived regenerative compound (not a peptide) popular in advanced skincare.</p><p><strong>How it works.</strong> Triggers the skin's natural repair signals and growth factor release to regenerate tissue.</p><p><strong>Known for</strong></p><ul><li>Skin repair and regeneration</li><li>Improved hydration</li></ul>",
      "shortDescription": "Helps repair and refresh tired-looking skin.",
      "dosageOptions": [
        {
          "mg": "1g",
          "price": 2950
        }
      ],
      "noPackages": true
    },
    {
      "name": "PDRN Serum",
      "category": "Skin & Beauty",
      "description": "<p>A PDRN-based serum delivering regenerative benefits topically.</p><p><strong>How it works.</strong> Same regenerative, growth-factor-stimulating action as PDRN, in an easy daily-use serum.</p><p><strong>Known for</strong></p><ul><li>Daily regenerative skincare support</li></ul>",
      "shortDescription": "A daily serum that renews and hydrates skin.",
      "dosageOptions": [
        {
          "mg": "10 pcs",
          "price": 3400
        }
      ],
      "noPackages": true
    },
    {
      "name": "Whitening & Spot Fading",
      "category": "Skin & Beauty",
      "description": "<p>A pigment-targeting topical treatment designed to fade dark spots and even skin tone.</p><p><strong>How it works.</strong> Targets pigment-producing activity in the skin to reduce the appearance of dark spots over time.</p><p><strong>Known for</strong></p><ul><li>Brighter, more even complexion</li><li>Reduced dark spots</li></ul>",
      "shortDescription": "Fades dark spots and evens out your skin tone.",
      "dosageOptions": [
        {
          "mg": "3ml",
          "price": 2200
        }
      ],
      "noPackages": true
    },
    {
      "name": "PDRN Skinbooster",
      "category": "Skin & Beauty",
      "description": "<p>A PDRN-based injectable-style skin booster built around its regenerative properties.</p><p><strong>How it works.</strong> Delivers concentrated PDRN into the skin to accelerate repair and hydration.</p><p><strong>Known for</strong></p><ul><li>Deep hydration</li><li>Skin renewal and glow</li></ul>",
      "shortDescription": "Deeply hydrates skin and gives it a healthy glow.",
      "dosageOptions": [
        {
          "mg": "5ml",
          "price": 2200
        }
      ],
      "noPackages": true
    },
    {
      "name": "Collagen Skinbooster",
      "category": "Skin & Beauty",
      "description": "<p>A collagen-based skin booster formulated to directly replenish the skin's collagen supply.</p><p><strong>How it works.</strong> Delivers collagen-supporting ingredients into the skin to improve firmness and elasticity.</p><p><strong>Known for</strong></p><ul><li>Firmer, more elastic skin</li><li>Reduced fine lines</li></ul>",
      "shortDescription": "Makes skin firmer and more elastic-looking.",
      "dosageOptions": [
        {
          "mg": "3ml",
          "price": 2500
        }
      ],
      "noPackages": true
    },
    {
      "name": "Pink Hya Acid Essence",
      "category": "Skin & Beauty",
      "description": "<p>A hyaluronic acid–based essence (not a peptide) for daily hydration.</p><p><strong>How it works.</strong> Draws and holds water in the skin for an immediate hydration boost.</p><p><strong>Known for</strong></p><ul><li>Instant hydration</li><li>Dewy, plump skin finish</li></ul>",
      "shortDescription": "Gives your skin an instant boost of hydration.",
      "dosageOptions": [
        {
          "mg": "3ml",
          "price": 2200
        }
      ],
      "noPackages": true
    },
    {
      "name": "Bacteriostatic Water",
      "category": "Supplies",
      "description": "<p>Sterile bacteriostatic water for reconstituting lyophilized peptides.</p>",
      "shortDescription": "Bacteriostatic water for reconstitution.",
      "dosageOptions": [
        {
          "mg": "10ml",
          "price": 180
        }
      ],
      "noPackages": true
    }
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
