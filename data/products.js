/* ============================================================
   KEIROSS PRODUCT CATALOGUE
   Source: Keiross Lifesciences visual aid / product catalogue (PDF).
   This one file feeds the home-page catalogue AND the individual
   product pages. After editing it, rebuild the product pages:
       node tools/build.js
   ------------------------------------------------------------
   Fields
     slug        URL of the product page: /products/<slug>.html
     brand       Brand name as printed
     composition Full composition line
     form        Tablet | Capsule | Softgel | Syrup | Suspension | Injection
     type        "rx" (prescription) | "ayurvedic" | "nutra"
     area        key from AREAS below
     headline    Brochure headline
     tagline     Brochure strap-line
     benefits    [{ title, points[] }]  (title may be "")
     indications [..]
     variants    [{ brand, composition, form }]   "Also available"
     table       optional composition table { title, head[], rows[][] }
   ============================================================ */
window.AREAS = {
  anti:    { label: "Anti-infectives", slug: "anti-infectives", short: "Cephalosporin, penicillin and oxazolidinone antibiotics for common and resistant bacterial infections.",        hex: "#e0572b",
             intro: "Antibiotics for respiratory, urinary, enteric, skin and hospital-acquired infections, including cephalosporin combinations effective against ESBL-producing and resistant organisms." },
  resp:    { label: "Respiratory & Allergy", slug: "respiratory-allergy", short: "Anti-allergic, bronchodilator and cough formulations for asthma, rhinitis and bronchitis.",  hex: "#1f8fd6",
             intro: "Anti-allergic, bronchodilator, mucolytic and cough formulations for asthma, allergic rhinitis, bronchitis and dry or productive cough, including paediatric suspensions." },
  gastro:  { label: "Gastroenterology", slug: "gastroenterology", short: "Acid-control and digestive-enzyme products for reflux, dyspepsia and indigestion.",       hex: "#d99a0b",
             intro: "Acid-control and digestive-enzyme formulations for GERD, peptic ulcers, dyspepsia, flatulence, bloating and loss of appetite." },
  pain:    { label: "Pain & Inflammation", slug: "pain-inflammation", short: "Analgesic and anti-inflammatory combinations for adults and children.",    hex: "#e2336b",
             intro: "Analgesic, anti-inflammatory and antipyretic combinations for musculoskeletal pain, arthritis and post-operative inflammation, and for fever and pain in children." },
  steroid: { label: "Corticosteroids", slug: "corticosteroids", short: "Oral corticosteroids for inflammatory and immune-mediated conditions.",        hex: "#7b5cd6",
             intro: "Oral corticosteroids for asthma, arthritis, dermatological, allergic and other inflammatory or immune-mediated conditions." },
  bone:    { label: "Bone, Joint & Gout", slug: "bone-joint-gout", short: "Calcium, vitamin D3 and urate-lowering therapy for bone health and gout.",     hex: "#0e9aa7",
             intro: "Calcium, vitamin D3 and urate-lowering therapy for osteoporosis, osteomalacia, fractures, bone and muscle pain, and gout." },
  neuro:   { label: "Neurology", slug: "neurology", short: "Nerve-support formulations for peripheral and diabetic neuropathy.",              hex: "#5a67d8",
             intro: "Nerve-support formulations with methylcobalamin, PEA and nucleotides for diabetic, alcoholic and other peripheral neuropathies." },
  nutra:   { label: "Nutrition & Wellness", slug: "nutrition-wellness", short: "Iron, multivitamin and amino-acid supplements for anaemia and recovery.",   hex: "#1f9d55",
             intro: "Iron, multivitamin, multimineral, amino-acid and antioxidant supplements for anaemia, pregnancy, convalescence and general debility." },
  uro:     { label: "Urology", slug: "urology", short: "Ayurvedic urinary alkaliser for kidney stones and cystitis.",                hex: "#b7791f",
             intro: "Ayurvedic urinary alkaliser and diuretic for kidney stones, cystitis and burning micturition." }
};

/* Brands shown in "Featured Products" on the home page (by slug, in order). */
window.FEATURED = ["keifix-o", "lyzox-600", "orbimont-l", "enzorb-dsr", "zerofin-sp", "calvion-max", "nerviross-xt", "hb-lipo"];

window.PRODUCTS = [
  /* ---------------- Anti-infectives ---------------- */
  {
    slug: "keifix-o", brand: "Keifix-O", area: "anti", type: "rx", form: "Tablet",
    composition: "Cefixime 200 mg + Ofloxacin 200 mg",
    headline: "True Victor against ESBL pathogens",
    tagline: "Symbol of Victory against ESBL organisms",
    benefits: [{ title: "", points: [
      "Unique dual mode of action",
      "Ofloxacin prevents nucleic acid synthesis",
      "Cefixime inhibits cell wall synthesis",
      "No drug–drug interaction",
      "Kills ESBL instantly",
      "Acts synergistically",
      "Gives better patient compliance"
    ]}],
    indications: ["Typhoid fever", "Urinary tract infection", "Respiratory tract infection", "Nosocomial infections", "Soft tissue infections", "Surgical prophylaxis", "Intra-abdominal infections"],
    variants: [
      { brand: "Keifix-O Kid", composition: "Cefixime 50 mg + Ofloxacin 50 mg", form: "Dry Syrup" },
      { brand: "Keifix-O Kid", composition: "Cefixime 100 mg + Ofloxacin 100 mg", form: "Tablet" }
    ]
  },
  {
    slug: "keppod-cv", brand: "Keppod-CV", area: "anti", type: "rx", form: "Tablet",
    composition: "Cefpodoxime Proxetil 200 mg + Potassium Clavulanate 125 mg",
    headline: "Safety altogether — a strict restriction for any infection",
    tagline: "A first line of control, for infections",
    benefits: [{ title: "", points: [
      "Excellent sensitivity towards all S. typhi isolates",
      "Superior activity compared to co-amoxiclav",
      "Excellent activity against ESBL isolates",
      "High-sensitivity, synergistic bactericidal effect",
      "An approved safety profile"
    ]}],
    indicationsTitle: "In resistant bacterial infections",
    indications: ["Enteric fever", "Lower respiratory tract infection", "Urinary tract infection", "Gynaecological infection", "ENT infection"],
    variants: [
      { brand: "Keppod-CV 50/100", composition: "Cefpodoxime Proxetil 50 mg / 100 mg + Potassium Clavulanate 31.25 mg / 62.5 mg", form: "Dry Syrup" }
    ]
  },
  {
    slug: "kezobact", brand: "Kezobact", area: "anti", type: "rx", form: "Injection",
    composition: "Cefoperazone 1 g",
    headline: "Always in target… the power of 2",
    tagline: "Get rid of deep-seated bacterial infections",
    benefits: [{ title: "", points: [
      "Cephalosporin class of antibiotics",
      "β-lactam antibiotic",
      "3rd-generation cephalosporin",
      "Bactericidal effect",
      "Inhibits cell-wall synthesis",
      "Sulbactam is a β-lactamase inhibitor",
      "Sulbactam increases the activity of cefoperazone"
    ]}],
    indications: ["Upper & lower respiratory tract infections", "Urinary tract infections", "Septicaemia", "Meningitis", "Skin & soft tissue infections", "Bone & joint infections", "Pelvic inflammatory disease", "Endometritis, gonorrhoea & other infections of the genital tract"],
    variants: [
      { brand: "Kezobact SB-1.5", composition: "Cefoperazone 1 g + Sulbactam 0.5 g", form: "Injection" }
    ]
  },
  {
    slug: "lyzox-600", brand: "Lyzox-600", area: "anti", type: "rx", form: "Tablet",
    composition: "Linezolid 600 mg",
    headline: "Ensure safe landing in difficult infections",
    tagline: "Surely… safely treats difficult infections",
    benefits: [{ title: "", points: [
      "Oxazolidinone class of antibiotic",
      "Works by stopping the growth of bacteria",
      "Prevents formation of the 70S initiation complex, a prerequisite for bacterial reproduction",
      "Bacteriostatic agent that treats infections caused by gram-positive organisms, including MRSA, coagulase-positive staphylococci, and β-lactam and macrolide-resistant strains of S. pneumoniae"
    ]}],
    indications: ["Bacterial septicaemia", "Pneumonia", "Skin & skin-structure infections", "Infections resistant to other antibiotics", "Vancomycin-resistant conditions"],
    variants: [
      { brand: "Lyzox-100", composition: "Linezolid 100 mg", form: "Syrup" }
    ]
  },
  {
    slug: "moxikross-625", brand: "Moxikross-625", area: "anti", type: "rx", form: "Tablet",
    composition: "Amoxycillin 500 mg + Potassium Clavulanate 125 mg",
    headline: "Combination that excels against infections",
    tagline: "As bacteria get tougher",
    benefits: [
      { title: "Amoxycillin", points: ["Preferred agent for typhoid, bronchitis, UTI & gonorrhoea", "Sustained blood levels", "Better oral absorption"] },
      { title: "Clavulanic Acid", points: ["Re-establishes the activity of amoxycillin against β-lactamase-producing bacteria"] },
      { title: "Lactic Acid Bacillus (625 LB)", points: ["Prevents the growth of pathogenic bacteria that cause diarrhoea"] }
    ],
    indications: ["Typhoid & other enteric infections", "Upper respiratory tract infection", "Infection during pregnancy & lactation", "Skin & soft tissue infection", "ENT infections", "Urinary tract infections"],
    variants: [
      { brand: "Moxikross-625 LB", composition: "Amoxycillin 500 mg + Potassium Clavulanate 125 mg with Lactobacillus", form: "Tablet" }
    ]
  },

  /* ---------------- Respiratory & Allergy ---------------- */
  {
    slug: "orbimont-l", brand: "Orbimont-L", area: "resp", type: "rx", form: "Tablet",
    composition: "Levocetirizine 5 mg + Montelukast 10 mg",
    headline: "When allergy disturbs the quality of life",
    tagline: "Keeps lungs healthy for easy breathing",
    benefits: [
      { title: "Levocetirizine", points: [
        "Highly selective H1-antihistaminic agent",
        "2-fold higher affinity for H1 receptors compared to cetirizine",
        "Longer duration of action on nasal symptoms than fexofenadine",
        "Improves quality of life"
      ]},
      { title: "Montelukast", points: [
        "Potent, specific leukotriene receptor antagonist",
        "Relieves the symptoms of indoor and outdoor allergies",
        "Improves both daytime & night-time asthma symptoms",
        "Relieves stuffy nose and sneezing caused by seasonal (hay fever) and perennial allergies",
        "Provides constant good quality of life to asthmatics"
      ]}
    ],
    indications: ["Asthma", "Exercise-induced bronchoconstriction", "Allergic rhinitis", "Cystic fibrosis"],
    variants: [
      { brand: "Orbimont-L Kid", composition: "Levocetirizine 2.5 mg + Montelukast 4 mg", form: "Suspension" }
    ]
  },
  {
    slug: "rossberry-ls", brand: "Rossberry-LS", area: "resp", type: "rx", form: "Syrup",
    composition: "Levosalbutamol 1 mg + Ambroxol 30 mg + Guaiphenesin 50 mg per 5 ml",
    headline: "Ease the difficulty in breathing with a complete cough formulation",
    tagline: "Bronchodilator, mucolytic & expectorant",
    benefits: [
      { title: "Levosalbutamol", points: ["Safe and effective bronchodilator", "Same therapeutic effect as salbutamol without tachycardia and hypokalaemia"] },
      { title: "Ambroxol", points: ["Promotes mucus clearance, facilitates expectoration and eases productive cough", "Effective in reducing exacerbations of chronic bronchitis and in protection from inflammatory reactions"] },
      { title: "Guaiphenesin", points: ["US FDA-approved expectorant", "Loosens phlegm and increases lubrication of the lungs, allowing a productive cough"] }
    ],
    indications: ["Asthma", "Bronchitis", "Bronchospasm", "Mouth or throat irritation", "Chronic inflammatory pulmonary conditions"],
    variants: []
  },
  {
    slug: "rossberry-dx", brand: "Rossberry-DX", area: "resp", type: "rx", form: "Syrup",
    composition: "Dextromethorphan HBr 10 mg + Chlorpheniramine Maleate 4 mg + Phenylephrine 5 mg",
    headline: "Congestion-free comfort",
    tagline: "…Good-bye cough & congestion",
    benefits: [{ title: "", points: [
      "Exhibits anti-tussive, anti-histaminic & decongestant properties",
      "Relieves cough by acting directly on the cough centre in the brain",
      "Treats acute non-productive cough",
      "Relieves acute inflammatory & allergic conditions",
      "Highly effective for cough associated with cold, bronchitis, laryngitis, tracheitis, pharyngitis & influenza"
    ]}],
    indications: ["Allergic cough", "Sinusitis", "Pharyngitis", "Dry or non-productive cough"],
    variants: []
  },

  /* ---------------- Gastroenterology ---------------- */
  {
    slug: "enzorb-dsr", brand: "Enzorb-DSR", area: "gastro", type: "rx", form: "Capsule",
    composition: "Rabeprazole Sodium 20 mg + Domperidone 30 mg (SR)",
    headline: "Round-the-clock protection from heartburn",
    tagline: "Relief… in gastric reflux",
    benefits: [{ title: "", points: [
      "30% of domperidone is released in less than 1 hour — immediate control of nausea & vomiting",
      "Sustained-release domperidone provides day-long relief from reflux",
      "Enteric-coated rabeprazole controls acid round the clock"
    ]}],
    indications: ["Erosive acid reflux", "Acid peptic disorder", "Peptic / duodenal ulcers", "Gastro-oesophageal reflux disease (GERD)"],
    variants: []
  },
  {
    slug: "dizmex", brand: "Dizmex", area: "gastro", type: "rx", form: "Syrup",
    composition: "Fungal Diastase 50 mg + Pepsin 10 mg",
    headline: "Accelerate the process of digestion",
    tagline: "Good digestion, good health",
    benefits: [
      { title: "Fungal Diastase", points: ["Helps in digestion of starch & carbohydrates", "Digestive aid in loss of appetite due to chronic illness, stomach fullness and indigestion"] },
      { title: "Pepsin", points: ["Helps to digest proteins in food", "Effective in the treatment of digestive disorders"] }
    ],
    indications: ["Indigestion", "Functional dyspepsia", "Sour stomach", "Abdominal discomfort", "Flatulence", "Heartburn"],
    variants: [
      { brand: "Dizmex Junior", composition: "Alpha Amylase 75 mg + Pepsin 10 mg", form: "Syrup" }
    ]
  },
  {
    slug: "dizmex-plus", brand: "Dizmex-Plus", area: "gastro", type: "rx", form: "Syrup",
    composition: "Alpha Galactosidase 25 mg + Pepsin 10 mg + Lipase 10 mg + Protease 3 mg + Lactase 25 mg",
    headline: "Sometimes big bites lead to big problems",
    tagline: "Increases hunger and improves digestion",
    benefits: [
      { title: "Alpha Galactosidase", points: ["Helps digest the complex sugars found in beans, legumes and cruciferous vegetables such as cabbage, cauliflower and broccoli"] },
      { title: "Fungal Diastase", points: ["Breaks large insoluble starch molecules into soluble starches for better assimilation", "Effective in diarrhoea, constipation, burps and belches", "Eliminates the sense of fullness, nausea and vomiting after meals"] },
      { title: "Pepsin", points: ["Degrades proteins to oligopeptides & amino acids", "Helps correct digestive disturbance"] },
      { title: "Lipase", points: ["Helps digest the fats in food"] }
    ],
    indications: ["Constipation", "Loss of appetite", "Sense of fullness"],
    variants: []
  },

  /* ---------------- Pain & Inflammation ---------------- */
  {
    slug: "zerofin-sp", brand: "Zerofin-SP", area: "pain", type: "rx", form: "Tablet",
    composition: "Aceclofenac 100 mg + Paracetamol 325 mg + Serratiopeptidase 15 mg",
    headline: "Don't let pain & inflammation play with health anymore",
    tagline: "…For effortless joint movement",
    benefits: [
      { title: "Aceclofenac", points: ["Produces preferential COX-2 blockade", "Rapid onset of action", "Stimulatory effects on cartilage matrix synthesis", "Reduces pain intensity and inflammation and improves functional capacity of the knee"] },
      { title: "Paracetamol", points: ["Potent analgesic & antipyretic agent"] },
      { title: "Serratiopeptidase", points: ["Anti-inflammatory, anti-oedemic & fibrinolytic activity", "Speeds up tissue repair and healing"] }
    ],
    indications: ["Low back pain", "Osteoarthritis", "Rheumatoid arthritis", "Fibrositis & tendonitis", "Ankylosing spondylitis", "Post-surgical / traumatic injury"],
    variants: [
      { brand: "Zerofin-P", composition: "Aceclofenac 100 mg + Paracetamol 325 mg", form: "Tablet" }
    ]
  },
  {
    slug: "parafin-mf", brand: "Parafin-MF", area: "pain", type: "rx", form: "Suspension",
    composition: "Paracetamol 250 mg + Mefenamic Acid 100 mg",
    headline: "For pain & fever… in children",
    tagline: "Brings fever & abdominal pain down",
    benefits: [
      { title: "Better efficacy & safety", points: [] },
      { title: "Additional neuroprotective superiority", points: ["Protective effect on oxidative-stress-induced neurotoxicity (due to fever, inflammation & pain)"] },
      { title: "Safe & well-tolerated", points: ["Both paracetamol & mefenamic acid are safe and well tolerated"] }
    ],
    indications: ["Pyrexia", "Teething pain", "Spasmodic pain", "Minor bruises, cuts & injuries"],
    variants: [
      { brand: "Parafin-MF JR", composition: "Paracetamol 125 mg + Mefenamic Acid 50 mg", form: "Suspension" }
    ]
  },

  /* ---------------- Corticosteroids ---------------- */
  {
    slug: "keropred-4", brand: "Keropred-4", area: "steroid", type: "rx", form: "Tablet",
    composition: "Methylprednisolone 4 mg",
    headline: "A quick rescue… during critical situations",
    tagline: "For life-threatening conditions",
    benefits: [{ title: "", points: [
      "Possesses anti-inflammatory and immuno-modulating properties",
      "Greater anti-inflammatory potency than hydrocortisone & prednisolone",
      "Reduces swelling, redness, itching and allergic reactions",
      "Superior to prednisolone for maintenance immunosuppressive therapy in renal transplantation"
    ]}],
    indications: ["Haematologic & endocrine disorders", "Oedematous states", "Rheumatoid arthritis", "Asthma", "Ophthalmic diseases", "Dermatitis"],
    variants: []
  },
  {
    slug: "kerodef-6", brand: "Kerodef 6", area: "steroid", type: "rx", form: "Tablet",
    composition: "Deflazacort 6 mg",
    headline: "When the conditions are severe",
    tagline: "The most trusted steroid",
    benefits: [
      { title: "", points: [
        "Low effect on bone mineral density",
        "Stronger immune suppression than prednisolone",
        "Improves osteoporosis due to calcium-sparing properties",
        "Advantage in insulin-treated diabetic patients who require steroid treatment",
        "Slows the progression of Duchenne muscular dystrophy with less weight gain compared to prednisone"
      ]},
      { title: "Superior to prednisolone", points: ["Less weight gain", "Less diabetogenic", "Less hypercalciuria"] }
    ],
    indicationsTitle: "In inflammatory conditions like",
    indications: ["Asthma", "Chronic arthritis", "Nephrotic syndrome", "Severe seborrhoeic dermatitis", "Duchenne muscular dystrophy"],
    variants: []
  },

  /* ---------------- Bone, Joint & Gout ---------------- */
  {
    slug: "calvion-max", brand: "Calvion-Max", area: "bone", type: "rx", form: "Tablet",
    composition: "Calcium Citrate 1000 mg + Calcitriol 0.25 mcg + Methylcobalamin 1500 mcg + Vitamin K2-7 45 mcg + Magnesium Hydroxide 50 mg + Zinc 7.5 mg",
    headline: "Introducing the best combination for complete wellness of bones",
    tagline: "Provides strength to fragile bones",
    benefits: [
      { title: "Calcium Citrate", points: ["Faster onset of action", "Faster absorption", "Minimises bone loss", "Fulfils the need in all deficiency states"] },
      { title: "Magnesium", points: ["Builds healthy bones"] },
      { title: "Methylcobalamin", points: ["Revitalises your nerves while fortifying your bones"] },
      { title: "Vitamin K2-7", points: ["Reduces fracture risk significantly by reinforcing bone structural integrity"] },
      { title: "Zinc", points: ["Improves bone strength", "Vital for foetal development & growth"] }
    ],
    indications: ["Post-menopausal women", "Hypoparathyroidism", "Senile osteoporosis", "Osteomalacia", "Bone & joint manifestations", "Pregnancy & lactation", "Fractures", "Steroid-induced osteoporosis"],
    variants: []
  },
  {
    slug: "keiferol-60k", brand: "Keiferol-60K", area: "bone", type: "rx", form: "Softgel",
    composition: "Cholecalciferol 60,000 IU",
    headline: "Improve bone & muscle strength, prevent falls & fractures",
    tagline: "The sunshine vitamin for improved bone & muscle strength",
    quote: "Skeletal muscle is a target of vitamin D3 — vitamin D nuclear receptors (VDR) are present in human skeletal muscle. The number of VDRs decreases with age.",
    benefits: [
      { title: "", points: [
        "Increases VDRs, improves absorption & functioning of calcium",
        "Improves musculoskeletal function",
        "Decreases incidence of falls and fractures",
        "Ensures bone mineralisation",
        "Induces muscle cell growth"
      ]},
      { title: "Also exerts", points: ["Anti-osteoporotic, immunomodulatory, anticarcinogenic, antipsoriatic, antioxidant & mood-modulatory activities"] }
    ],
    indications: ["Rickets", "Osteomalacia", "Fractures", "Bone & muscle pain"],
    variants: []
  },
  {
    slug: "fabuross-40", brand: "Fabuross 40", area: "bone", type: "rx", form: "Tablet",
    composition: "Febuxostat 40 mg",
    headline: "Treat the severity back",
    tagline: "Provides relief along with long-term safety",
    benefits: [{ title: "", points: [
      "Works by reducing the amount of uric acid made by the body",
      "An orally administered urate-lowering agent",
      "More potent than allopurinol",
      "Good safety profile and tolerability"
    ]}],
    indications: ["Management of hyperuricaemia in patients with gout"],
    variants: []
  },

  /* ---------------- Neurology ---------------- */
  {
    slug: "nerviross-xt", brand: "Nerviross-XT", area: "neuro", type: "rx", form: "Capsule",
    composition: "Palmitoylethanolamide 300 mg + Uridine Monophosphate 9 mg + Cytidine Monophosphate 15 mg + Folic Acid 64 mcg + Cyanocobalamin 1.1 mcg + Vitamin D3 200 IU (as Lichen)",
    headline: "Live longer, live better",
    tagline: "The complete nerve regenerator",
    benefits: [
      { title: "Palmitoylethanolamide", points: ["Helps support nerve comfort", "Supports a healthy inflammatory response"] },
      { title: "Uridine Monophosphate", points: ["Supports nerve regeneration", "Helps maintain healthy nerve cells"] },
      { title: "Cytidine Monophosphate", points: ["Supports cell membrane repair", "Promotes healthy nerve function"] },
      { title: "Folic Acid + Cyanocobalamin", points: ["Supports healthy nerve function", "Helps in red blood cell formation"] },
      { title: "Vitamin D (as Lichen)", points: ["Supports bone & muscle health", "Helps maintain immune function"] }
    ],
    indicationsTitle: "Key benefits",
    indications: ["Supports peripheral nerve health", "Helps promote nerve repair", "Supports cellular nerve function", "Maintains healthy nerve function", "Supports overall well-being"],
    variants: []
  },
  {
    slug: "nerviross-forte", brand: "Nerviross-Forte", area: "neuro", type: "rx", form: "Injection",
    composition: "Methylcobalamin 1500 mcg + Pyridoxine 100 mg + Nicotinamide 100 mg + D-Panthenol 50 mg",
    headline: "The neuron revitaliser",
    tagline: "The neuron revitaliser",
    benefits: [
      { title: "Methylcobalamin", points: ["Neurologically active form of B12 — more efficiently utilised and with better tissue retention than cyanocobalamin"] },
      { title: "Pyridoxine", points: ["Helps calm the nerves as well as impatient minds"] },
      { title: "Niacinamide", points: ["Helps maintain a healthy nervous system"] }
    ],
    indications: ["Neuropathic pain associated with spinal cord injury", "Diabetic neuropathy", "Alcoholic neuropathy", "Post-herpetic neuralgia"],
    variants: []
  },

  /* ---------------- Nutrition & Wellness ---------------- */
  {
    slug: "hb-lipo", brand: "HB Lipo", area: "nutra", type: "rx", form: "Tablet", formLabel: "Tablets / Syrup",
    composition: "Liposomal Ferric Pyrophosphate 300 mg + Vitamin C 50 mg + Zinc 14 mg + Pyridoxine HCl 2 mg + L-Methylfolate 200 mcg + Vitamin B12 0.75 mcg",
    headline: "The most caring iron therapy",
    tagline: "Advanced nutrition for better iron, better health",
    benefits: [
      { title: "Liposomal Ferric Pyrophosphate", points: ["Highly bioavailable form of iron", "Gentle on the stomach", "Enhanced absorption for better results"] },
      { title: "Vitamin C", points: ["Enhances iron absorption", "Supports immunity", "Powerful antioxidant"] },
      { title: "Vitamin B12", points: ["Supports red blood cell formation", "Helps in energy production", "Supports nerve health"] },
      { title: "Folic Acid", points: ["Essential for RBC formation", "Supports a healthy pregnancy", "Supports overall cell health"] }
    ],
    indications: ["Iron-deficiency anaemia", "Rapid growth & development", "Post-surgical conditions", "Pregnancy & lactation", "Dietary insufficiency", "Chronic or acute blood loss", "During menstruation & surgery"],
    variants: [
      { brand: "HB Lipo Syrup", composition: "Liposomal Ferric Pyrophosphate 10 g + Folic Acid 200 mcg + Vitamin B12 0.75 mcg", form: "Syrup" }
    ]
  },
  {
    slug: "ross-gold", brand: "Ross-Gold", area: "nutra", type: "rx", form: "Syrup",
    composition: "Multivitamin + Multimineral + Antioxidant + Lycopene + Pomegranate Extract",
    headline: "Grab the power of red to enrich life with health",
    tagline: "Nature's lycopene for better health",
    benefits: [{ title: "", points: [
      "Increases resistance to stress",
      "Boosts the immune system",
      "Maintains positive nitrogen balance",
      "Enhances haemoglobin level",
      "Strengthens the nervous system",
      "Maintains body tissues & functions"
    ]}],
    indications: ["Chronic illness", "Convalescence", "Surgical recovery", "Trauma", "Pregnancy", "Old age"],
    table: {
      title: "Composition",
      head: ["Ingredient", "Amount", "% RDA"],
      rows: [
        ["Vitamin A", "1000 IU", "100.0"], ["Vitamin D3", "600 IU", "77.77"], ["Vitamin E", "10 IU", "64.00"],
        ["Vitamin B1", "1.5 mg", "100.0"], ["Vitamin B2", "1.7 mg", "80.0"], ["Vitamin B6", "2 mg", "83.33"],
        ["Vitamin B12", "1 mcg", "85.71"], ["Vitamin C", "40 mg", "50.00"], ["Niacinamide", "20 mg", "66.66"],
        ["D-Panthenol", "5 mg", "66.66"], ["Folic Acid", "100 mcg", "45.45"], ["Zinc (as Zinc Sulphate)", "10 mg", "37.5"],
        ["Magnesium (as Magnesium Sulphate)", "5 mg", "70.58"], ["Selenium (as Sodium Selenite)", "10 mcg", "64.28"],
        ["L-Lysine Hydrochloride", "50 mg", "75.00"], ["Pomegranate Extract", "100 mg", "48.88"], ["Lycopene (10%)", "500 mcg", "100.0"]
      ]
    },
    variants: []
  },
  {
    slug: "vitalicks-ok", brand: "Vitalicks-OK", area: "nutra", type: "rx", form: "Syrup",
    composition: "Amino Acid + Multivitamin + Antioxidant",
    headline: "Grab the power of red to enrich life with health",
    tagline: "Each day, a healthy day",
    benefits: [{ title: "", points: [
      "Improves the body's resistance to stress",
      "Boosts the immune system",
      "Positive effect on growth, energy & appetite",
      "Promotes bone mineral density",
      "Maintains healthy nervous system & connective tissue",
      "Prevents free-radical damage",
      "Helps wounds heal faster"
    ]}],
    indications: ["General debility", "Chronic illness", "Oxidative stress", "Cardiovascular disorders", "Pregnancy & lactation"],
    table: {
      title: "Each 15 ml contains (approx.)",
      head: ["Ingredient", "Amount", "% RDA (ICMR)"],
      rows: [
        ["Ascorbic Acid", "40.0 mg", "100"], ["L-Lysine Hydrochloride", "26.25 mg", "#"], ["L-Leucine", "19.21 mg", "#"],
        ["Nicotinamide", "12.0 mg", "100"], ["L-Methionine", "9.66 mg", "#"], ["L-Valine", "7.035 mg", "#"],
        ["L-Isoleucine", "6.195 mg", "#"], ["L-Phenylalanine", "5.25 mg", "#"], ["L-Tryptophan", "5.25 mg", "#"],
        ["D-Panthenol", "5.0 mg", "#"], ["L-Threonine", "4.41 mg", "#"], ["Pyridoxine Hydrochloride", "1.5 mg", "75"],
        ["Riboflavin (as Riboflavin Sodium Phosphate)", "1.1 mg", "100"], ["Thiamine Hydrochloride", "1.0 mg", "100"],
        ["Folic Acid", "0.1 mg", "100"], ["Cyanocobalamin", "1.0 mcg", "100"]
      ],
      note: "# RDA not established"
    },
    variants: [
      { brand: "Vitalicks-Junior", composition: "Lycopene + Vitamin C + Vitamin B-complex + Vitamin E + Vitamin A + Biotin + Zinc + Manganese + Iodine + Selenium + Molybdenum", form: "Syrup" }
    ]
  },

  /* ---------------- Urology ---------------- */
  {
    slug: "neero-fit", brand: "Neero Fit", area: "uro", type: "ayurvedic", form: "Syrup",
    composition: "Ayurvedic UTI syrup",
    headline: "Relieves the discomfort of cystitis",
    tagline: "Takes care of your kidneys",
    benefits: [{ title: "", points: [
      "A systemic and urinary alkaliser",
      "Helps to break and drain calculi",
      "Electrolyte replenisher and diuretic",
      "Administered orally",
      "Relieves burning micturition"
    ]}],
    indications: ["Kidney calculi", "Recurrent stone tendency", "Ureter / bladder calculi", "Retention of urine", "Calculi-induced UTI"],
    variants: []
  }
];
