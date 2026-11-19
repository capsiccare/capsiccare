export interface PackageMarketingInfo {
  slug: string
  title: string
  tagline: string
  bengaliSlogan?: string
  hindiSlogan?: string
  posterImage: string
  validUntil: string
  idealFor: string[]
  keyBenefits: { title: string; desc: string }[]
  whyChooseUs: string[]
  sampleDetails: {
    sampleType: string
    fasting: string
    reportTime: string
    collectionType: string
  }
}

export const packagesMarketingData: Record<string, PackageMarketingInfo> = {
  'basic-full-body-checkup': {
    slug: 'basic-full-body-checkup',
    title: 'Basic Full Body Check-Up',
    tagline: 'Stay Ahead. Stay Healthy. Your health is in your hands.',
    bengaliSlogan: 'সম্পূর্ণ শরীরের মৌলিক পরীক্ষা এখন আপনার সাধ্যের মধ্যে — আজই বুক করুন।',
    hindiSlogan: 'समय रहते जांच कराएं, स्वस्थ और सुरक्षित जीवन पाएं।',
    posterImage: '/images/packages/basic-full-body-checkup.jpg',
    validUntil: 'Special Exclusive Offer',
    idealFor: [
      'Men and women aged 18+ for yearly routine screening',
      'Individuals with hectic lifestyles, irregular sleep, or frequent fatigue',
      'Anyone looking to establish baseline organ function (Heart, Liver, Kidneys, Thyroid)',
      'People with family history of diabetes, hypertension, or kidney conditions'
    ],
    keyBenefits: [
      {
        title: 'Complete Organ Health Screen',
        desc: 'Evaluates major vital organs including the liver (LFT), kidneys (Urea & Creatinine), heart (Lipid Profile), and endocrine thyroid gland (TSH).'
      },
      {
        title: 'Complete Blood Count (CBC)',
        desc: 'Screens for iron deficiency anemia, systemic infections, platelets, and general immunity levels.'
      },
      {
        title: 'Diabetes & Sugar Baseline',
        desc: 'Fasting Blood Sugar (FBS) accurately detects pre-diabetes and elevated glucose levels early.'
      },
      {
        title: 'Massive Cost Savings',
        desc: 'Worth ₹1,884 individual MRP, available for an unbeatable ₹769 with free home sample collection.'
      }
    ],
    whyChooseUs: [
      'NABL & ICMR accredited laboratory processing for 100% accurate results',
      'Free doorstep hygienic home sample collection by trained phlebotomists',
      'Digital smart reports delivered directly to WhatsApp & email within 24 hours',
      'Complimentary doctor consultation to understand and review your test reports'
    ],
    sampleDetails: {
      sampleType: 'Blood Sample',
      fasting: '10-12 Hours Overnight Fasting Required (Water Allowed)',
      reportTime: 'Within 24 Hours',
      collectionType: 'Free Home Collection / Center Visit'
    }
  },

  'diabetes-sugar-care-package': {
    slug: 'diabetes-sugar-care-package',
    title: 'Diabetes & Sugar Care Package',
    tagline: 'Health Check Today, Better Tomorrow!',
    bengaliSlogan: 'শুধু Sugar দেখবেন না— নিয়ন্ত্রণে আছে কি না জানুন।',
    hindiSlogan: 'सिर्फ Sugar नहीं—जानें, कंट्रोल में है या नहीं।',
    posterImage: '/images/packages/diabetes-sugar-care-package.jpg',
    validUntil: 'Offer Valid Until 5 September 2026',
    idealFor: [
      'Diagnosed Type 1 and Type 2 diabetics for quarterly management',
      'Individuals with borderline high blood sugar (Pre-diabetes)',
      'People experiencing frequent urination, unquenchable thirst, or sudden weight loss',
      'Adults over 30 with family history of diabetes or elevated BMI'
    ],
    keyBenefits: [
      {
        title: 'HbA1c Gold-Standard Testing',
        desc: 'Measures your true 90-day average blood sugar levels using advanced HPLC technology without daily fluctuation bias.'
      },
      {
        title: 'Dual Glycemic Monitoring (FBS + PPBS)',
        desc: 'Measures both fasting glucose and post-meal glucose response to verify if insulin resistance or post-prandial spikes exist.'
      },
      {
        title: 'Lipid Cardiovascular Protection',
        desc: 'Complete Lipid Profile (Cholesterol, HDL, LDL, Triglycerides) to prevent diabetic cardiovascular complications and arterial blockages.'
      },
      {
        title: 'Preventive Organ Shield',
        desc: 'Early glycemic control prevents diabetic retinopathy, neuropathy, and nephropathy before irreversible damage occurs.'
      }
    ],
    whyChooseUs: [
      'Advanced HPLC automated HbA1c analyzers guaranteeing clinical accuracy',
      'Timely dual-draw home collection for Fasting and Post-Prandial samples',
      'Verified diabetes management reports reviewed by certified pathologists',
      'Direct consultation link with specialist diabetologists and physicians'
    ],
    sampleDetails: {
      sampleType: 'Blood Sample (Fasting & Post-Prandial)',
      fasting: '10-12 Hours Fasting for FBS, followed by PPBS 2 hours after meal',
      reportTime: 'Within 24 Hours',
      collectionType: 'Free Home Collection / Center Visit'
    }
  },

  'thyroid-wellness-check-package': {
    slug: 'thyroid-wellness-check-package',
    title: 'Thyroid & Wellness Check Package',
    tagline: 'Small gland, big impact on your health. Know your Thyroid, Stay in control!',
    bengaliSlogan: 'ওজনের পরিবর্তন, ক্লান্তি, চুল পড়া, মেজাজের ওঠানামা— Thyroid-এর সমস্যা হতে পারে! সময়মতো পরীক্ষা করুন, নিজেকে সুস্থ রাখুন।',
    hindiSlogan: 'छोटी सी ग्रंथि, सेहत पर बड़ा असर। जानिए अपना थायरॉइड स्तर।',
    posterImage: '/images/packages/thyroid-wellness-check-package.jpg',
    validUntil: 'Offer Valid Until 5 September 2026',
    idealFor: [
      'Women experiencing sudden weight gain, hair fall, dry skin, or irregular periods',
      'Anyone suffering from chronic fatigue, sluggishness, cold intolerance, or mood swings',
      'Patients taking daily thyroid supplements (Thyronorm/Eltroxin) to monitor dosage',
      'Women planning pregnancy or in postpartum recovery phase'
    ],
    keyBenefits: [
      {
        title: 'Complete Thyroid Trio (T3, T4, TSH)',
        desc: 'Full endocrine evaluation to pinpoint Hypothyroidism (underactive) or Hyperthyroidism (overactive) with precision.'
      },
      {
        title: 'Complete Blood Count (CBC)',
        desc: 'Comprehensive blood cell counts to detect subclinical infections and overall immune system balance.'
      },
      {
        title: 'Hemoglobin (Hb%) Assessment',
        desc: 'Specifically screens for iron deficiency and anemia, which very frequently accompany thyroid imbalance.'
      },
      {
        title: 'Hormonal & Metabolic Balance',
        desc: 'Restores metabolic clarity, helps achieve healthy weight management, and relieves unexplained chronic exhaustion.'
      }
    ],
    whyChooseUs: [
      'Ultrasensitive chemiluminescence hormone assays for accurate hormone detection',
      'Hassle-free morning blood draw at your doorstep',
      'Expert pathologist validated reports within 24 hours',
      'Special discounted rate of just ₹549 (Original MRP ₹1,418)'
    ],
    sampleDetails: {
      sampleType: 'Blood Sample (Serum & EDTA)',
      fasting: 'Overnight fasting recommended (8-10 hours); morning sample best',
      reportTime: 'Within 24 Hours',
      collectionType: 'Free Home Collection / Center Visit'
    }
  },

  'heart-metabolic-check-package': {
    slug: 'heart-metabolic-check-package',
    title: 'Heart & Metabolic Check Package',
    tagline: 'Take a step today for a healthier tomorrow! Heart Health + Sugar + Cholesterol.',
    bengaliSlogan: 'হার্টের সুস্থতার সাথে সাথে Sugar ও Cholesterol নিয়ন্ত্রণে রাখুন। সব কিছু এক ই প্যাকেজ মেঁ।',
    hindiSlogan: 'दिल की सेहत के साथ Sugar और Cholesterol पर भी ध्यान दें। सब कुछ एक ही पैकेज में।',
    posterImage: '/images/packages/heart-metabolic-check-package.jpg',
    validUntil: 'Offer Valid Until 5 September 2026',
    idealFor: [
      'Individuals aged 30+ leading sedentary, stressful, or corporate lifestyles',
      'Anyone with high blood pressure, elevated BMI, or occasional breathlessness',
      'People with family history of premature heart disease, heart attack, or stroke',
      'Diabetics wanting to ensure their heart and kidneys remain fully protected'
    ],
    keyBenefits: [
      {
        title: 'Comprehensive Lipid Profile',
        desc: 'Measures Total Cholesterol, Good HDL, Bad LDL, and Triglycerides to detect arterial plaque buildup and cardiovascular risks.'
      },
      {
        title: 'Glycemic Control (FBS + HbA1c)',
        desc: 'Dual blood sugar testing to detect insulin resistance and 3-month average glucose before it impacts cardiac arteries.'
      },
      {
        title: 'Serum Creatinine (Kidney Function)',
        desc: 'Assesses kidney glomerular filtration rate and rules out early hypertensive or diabetic renal strain.'
      },
      {
        title: 'Total Cardiovascular & Metabolic Peace of Mind',
        desc: 'Addresses the core metabolic syndrome trio (Lipids + Sugar + Renal) in a single convenient, low-cost screen.'
      }
    ],
    whyChooseUs: [
      'Advanced enzymatic and HPLC testing methods for zero margin of error',
      'Free phlebotomy home collection with zero convenience charges',
      'Color-coded smart reports with clear reference ranges and risk flags',
      'Special price of ₹879 (Over 63% savings compared to ₹2,067 MRP)'
    ],
    sampleDetails: {
      sampleType: 'Blood Sample',
      fasting: '10-12 Hours Overnight Fasting Required (Water Allowed)',
      reportTime: 'Within 24 Hours',
      collectionType: 'Free Home Collection / Center Visit'
    }
  },

  'vitamin-energy-check-package': {
    slug: 'vitamin-energy-check-package',
    title: 'Vitamin & Energy Check Package',
    tagline: 'More Energy. Better Everyday! Know your Vitamin Levels!',
    bengaliSlogan: 'বার-বার ক্লান্তি, দুর্বলতা? জানুন আপনার Vitamin Levels!',
    hindiSlogan: 'ऊर्जा की कमी और जोड़ों का दर्द? जानिए अपने विटामिन और कैल्शियम का स्तर।',
    posterImage: '/images/packages/vitamin-energy-check-package.jpg',
    validUntil: 'Offer Valid Until 5 September 2026',
    idealFor: [
      'Vegetarians, vegans, and people with dietary restrictions (high B12 deficiency risk)',
      'Anyone suffering from persistent bone aches, joint pain, back pain, or muscle weakness',
      'People working indoors with minimal sunlight exposure (Vitamin D3 deficiency)',
      'Individuals feeling constant brain fog, memory lapses, tingling in hands/feet, or low energy'
    ],
    keyBenefits: [
      {
        title: 'Vitamin D3 (25-Hydroxy)',
        desc: 'Critical for calcium absorption, bone mineralization, joint health, and strong immune defense against respiratory viruses.'
      },
      {
        title: 'Vitamin B12 (Cyanocobalamin)',
        desc: 'Essential for nerve myelin sheath maintenance, cognitive brain function, red blood cell synthesis, and high daily energy levels.'
      },
      {
        title: 'Serum Calcium',
        desc: 'Checks circulating calcium levels to prevent osteoporosis, bone fractures, and painful muscle cramps.'
      },
      {
        title: 'Complete Blood Count (CBC)',
        desc: 'Verifies healthy hemoglobin, oxygen carrying capacity, and infection-fighting white blood cells.'
      }
    ],
    whyChooseUs: [
      'Fully automated ECLIA immunoassay platforms ensuring pinpoint vitamin precision',
      'Free home sample collection with sterile cold-chain sample preservation',
      'Easy-to-understand reports with dietary and supplement guidance tips',
      'Huge 62% discount: Get this ₹3,119 premium test bundle for only ₹1,200'
    ],
    sampleDetails: {
      sampleType: 'Blood Sample',
      fasting: 'No strict fasting required; avoid heavy multivitamins on test morning',
      reportTime: 'Within 24 Hours',
      collectionType: 'Free Home Collection / Center Visit'
    }
  },

  'comprehensive-healthy-heart-package': {
    slug: 'comprehensive-healthy-heart-package',
    title: 'Comprehensive Healthy Heart & Cardiac Risk Profile',
    tagline: 'Precision Cardiac Care & Risk Evaluation with Troponin & Lipid Assessment',
    bengaliSlogan: 'হার্টের সুস্থতার সাথে সাথে Cholesterol ও Sugar নিয়ন্ত্রণে রাখুন। কার্ডিয়াক ঝুঁকি আগে থেকে জানুন।',
    hindiSlogan: 'दिल की बीमारी का खतरा पहले से पहचानें, समय रहते सुरक्षित कदम उठाएं।',
    posterImage: '/images/packages/comprehensive-healthy-heart-package.jpg',
    validUntil: 'Special Doctor Curated Package',
    idealFor: [
      'Patients consulting Senior Cardiologists & Heart Care Specialists',
      'Anyone experiencing chest discomfort, breathlessness on exertion, or palpitations',
      'Individuals with hypertension, family history of heart attack, or post-stent recovery',
      'Diabetic patients needing comprehensive cardiovascular risk assessment'
    ],
    keyBenefits: [
      {
        title: 'High-Sensitivity Troponin-I',
        desc: 'Early quantitative myocardial injury marker detecting subtle heart muscle stress before acute coronary events.'
      },
      {
        title: 'Comprehensive Lipid Profile',
        desc: 'Full breakdown of Total Cholesterol, HDL, LDL, VLDL, and Triglycerides to evaluate arterial plaque risk.'
      },
      {
        title: 'HbA1c & Fasting Glucose',
        desc: 'Dual glycemic control markers ensuring metabolic sugar stability protects cardiac vessels.'
      },
      {
        title: 'Renal & Electrolyte Shield',
        desc: 'Urea, Creatinine, and Serum Electrolytes (Sodium, Potassium, Chloride) to monitor cardiac-renal fluid balance.'
      }
    ],
    whyChooseUs: [
      'Curated directly in alignment with cardiology consultation protocols',
      'Precision automated ECLIA analyzers for ultra-low troponin detection limits',
      'Free home sample collection across Bankra and Howrah region',
      '24-hour report turnaround with direct consultation review'
    ],
    sampleDetails: {
      sampleType: 'Blood Sample',
      fasting: '10-12 Hours Overnight Fasting Required (Water Allowed)',
      reportTime: 'Within 24 Hours',
      collectionType: 'Free Home Collection / Center Visit'
    }
  },

  'advanced-spine-joint-nerve-pain-package': {
    slug: 'advanced-spine-joint-nerve-pain-package',
    title: 'Advanced Spine, Joint & Nerve Pain Care Package',
    tagline: 'Targeted Diagnostic Evaluation for Chronic Spine, Knee, Joint and Nerve Pain',
    bengaliSlogan: 'কোমর, হাঁটু ও স্নায়ুর ব্যথা থেকে মুক্তি পান— মূল কারণ জানতে আজই পরীক্ষা করান।',
    hindiSlogan: 'कमर, घुटने और नसों के दर्द का सही कारण जानें और दर्द मुक्त जीवन पाएं।',
    posterImage: '/images/packages/advanced-spine-joint-nerve-pain-package.jpg',
    validUntil: 'Special Doctor Curated Package',
    idealFor: [
      'Patients consulting Interventional Pain Physician Dr. Susovan Patra',
      'Individuals suffering from chronic lower back pain, sciatica, or slipped disc',
      'Patients with knee osteoarthritis, neck spondylosis, or morning joint stiffness',
      'Anyone with burning, tingling sensations or suspected neuropathy / fibromyalgia'
    ],
    keyBenefits: [
      {
        title: 'Vitamin D3 & Calcium Synergy',
        desc: 'Evaluates bone mineral strength, cartilage support, and rules out metabolic bone pain or osteomalacia.'
      },
      {
        title: 'Vitamin B12 Nerve Shield',
        desc: 'Vital for nerve sheath regeneration and treating burning, tingling sensations or neuropathic pain.'
      },
      {
        title: 'Inflammatory Markers (CRP & ESR)',
        desc: 'Pinpoints active systemic inflammation, soft tissue swelling, and spine joint inflammatory strain.'
      },
      {
        title: 'Uric Acid & RA Factor',
        desc: 'Differentiates gouty arthritis and rheumatoid autoimmune disease from degenerative arthritis.'
      }
    ],
    whyChooseUs: [
      'Tailored specifically for pain clinic interventions and non-surgical therapies',
      'NABL certified automated analyzers ensuring gold-standard precision',
      'Doorstep home collection avoiding painful travel for arthritic patients',
      'Reports reviewed directly alongside Dr. Susovan Patra pain triage'
    ],
    sampleDetails: {
      sampleType: 'Blood Sample',
      fasting: 'No strict fasting required; morning draw recommended',
      reportTime: 'Within 24 Hours',
      collectionType: 'Free Home Collection / Center Visit'
    }
  },

  'neuro-metabolic-memory-wellness-package': {
    slug: 'neuro-metabolic-memory-wellness-package',
    title: 'Neuro-Metabolic & Memory Wellness Profile',
    tagline: 'Brain Vitality, Memory, Dementia Risk & Metabolic Health Screen',
    bengaliSlogan: 'ব্রেন, স্মৃতিশক্তি ও মেটাবলিক স্বাস্থ্য সুরক্ষিত রাখুন। সুস্থ মন, প্রাণবন্ত জীবন।',
    hindiSlogan: 'दिमाग की सेहत, याददाश्त और मेटाबॉलिज्म की संपूर्ण जांच।',
    posterImage: '/images/packages/neuro-metabolic-memory-wellness-package.jpg',
    validUntil: 'Special Doctor Curated Package',
    idealFor: [
      'Patients consulting Dr. S. Chatterjee (Neuro-Psychiatry & Dementia Specialist)',
      'Adults and seniors experiencing memory lapses, brain fog, or cognitive decline',
      'Individuals with long-standing diabetes wanting to prevent diabetic neuropathy',
      'Patients with mood disorders, chronic fatigue, sleep disturbances, or metabolic imbalance'
    ],
    keyBenefits: [
      {
        title: 'B12 & Thyroid Cognitive Panel',
        desc: 'Corrects reversible causes of memory loss, confusion, brain fog, and neurological sluggishness.'
      },
      {
        title: 'Metabolic & Glycemic Balance',
        desc: 'HbA1c, Fasting Glucose, and Lipid Profile evaluate vascular brain health and reduce stroke risk.'
      },
      {
        title: 'Hepato-Renal Function (LFT & KFT)',
        desc: 'Comprehensive liver and kidney filtering checks to ensure safe medication processing and cognitive clarity.'
      },
      {
        title: 'Serum Electrolytes',
        desc: 'Screens for sodium/potassium imbalances that frequently mimic dementia or cause sudden confusion in seniors.'
      }
    ],
    whyChooseUs: [
      'Developed with international dementia & diabetes care guidelines (RCGP & Bradford UK)',
      'High-precision biochemical platforms with strict quality control',
      'Free doorstep sample pickup across Bankra, Kona, Domjur & Howrah',
      'Detailed report reviewed alongside psychiatric and diabetic management'
    ],
    sampleDetails: {
      sampleType: 'Blood Sample',
      fasting: '10-12 Hours Overnight Fasting Required (Water Allowed)',
      reportTime: 'Within 24 Hours',
      collectionType: 'Free Home Collection / Center Visit'
    }
  },

  'pcos-hormonal-women-wellness-package': {
    slug: 'pcos-hormonal-women-wellness-package',
    title: 'PCOS, Hormonal & Women Wellness Complete Package',
    tagline: 'Complete Hormonal Balance, Fertility, and Reproductive Wellness Evaluation',
    bengaliSlogan: 'অনিয়মিত পিরিয়ড, হরমোনের ভারসাম্যহীনতা ও পিসিওডি থেকে সুস্থ থাকুন। নারী স্বাস্থ্যের সম্পূর্ণ সুরক্ষা।',
    hindiSlogan: 'अनियमित माहवारी, हार्मोनल असंतुलन और पीसीओडी की संपूर्ण जांच।',
    posterImage: '/images/packages/pcos-hormonal-women-wellness-package.jpg',
    validUntil: 'Special Doctor Curated Package',
    idealFor: [
      'Patients consulting Gynecologist Dr. Priti Medda',
      'Women suffering from irregular, delayed, or painful menstrual cycles',
      'Women with symptoms of PCOS/PCOD (facial hair, persistent acne, stubborn weight gain)',
      'Couples planning pregnancy or seeking comprehensive reproductive evaluation'
    ],
    keyBenefits: [
      {
        title: 'Complete Hormonal Quad (LH, FSH, Prolactin, Thyroid)',
        desc: 'Accurately diagnoses LH:FSH inversion in PCOS, hyperprolactinemia, and thyroid-related cycle irregularities.'
      },
      {
        title: 'Anemia & Blood Count (CBC with Hb%)',
        desc: 'Evaluates iron reserves and screens for heavy menstrual bleeding-induced anemia.'
      },
      {
        title: 'Metabolic & Insulin Resistance Screen',
        desc: 'Fasting Blood Sugar detects early insulin resistance that drives ovarian cystic changes.'
      },
      {
        title: 'Bone & Urinary Health (Calcium & Urine Routine)',
        desc: 'Assesses bone mineral density support and rules out recurrent urinary tract infections.'
      }
    ],
    whyChooseUs: [
      'Curated in direct alignment with Dr. Priti Medda gynecological protocols',
      'Ultra-sensitive hormone chemiluminescence assays for exact hormone tracking',
      'Female phlebotomist option and hygienic home collection',
      'Confidential WhatsApp digital reports within 24 hours'
    ],
    sampleDetails: {
      sampleType: 'Blood Sample & Urine Sample',
      fasting: '8-10 Hours Overnight Fasting; best taken on Day 2 or 3 of menstrual cycle',
      reportTime: 'Within 24 Hours',
      collectionType: 'Free Home Collection / Center Visit'
    }
  },

  'orthopedic-bone-density-joint-package': {
    slug: 'orthopedic-bone-density-joint-package',
    title: 'Orthopedic Bone Density & Joint Health Screening',
    tagline: 'Specialized Bone Mineral, Osteoporosis, Arthritis & Joint Wellness Screening',
    bengaliSlogan: 'হাড় ও জয়েন্টের দুর্বলতা, অস্টিওপোরোসিস ও বাতের ব্যথা নির্ণয় করুন। শক্তিশালী হাড়, সচল জীবন।',
    hindiSlogan: 'हड्डियों की मजबूती और जोड़ों के दर्द की संपूर्ण जांच।',
    posterImage: '/images/packages/orthopedic-bone-density-joint-package.jpg',
    validUntil: 'Special Doctor Curated Package',
    idealFor: [
      'Patients consulting Orthopedic Surgeon Dr. Debdeep Karak',
      'Individuals with persistent knee joint pain, cracking sounds, or difficulty walking',
      'Men & women aged 40+ screening for osteopenia, osteoporosis, and fracture risks',
      'Patients recovering from bone trauma, fractures, or preparing for joint surgery'
    ],
    keyBenefits: [
      {
        title: 'Bone Mineralization Trio (Vitamin D3, Calcium, Phosphorus)',
        desc: 'Essential for bone matrix density, calcium bio-availability, and preventing brittle bone fractures.'
      },
      {
        title: 'Alkaline Phosphatase (ALP Bone Marker)',
        desc: 'Monitors active bone turnover, osteoblastic healing after fractures, and bone metabolic health.'
      },
      {
        title: 'Rheumatoid (RA) Factor & ESR',
        desc: 'Distinguishes autoimmune inflammatory arthritis from degenerative mechanical wear and tear.'
      },
      {
        title: 'Serum Uric Acid',
        desc: 'Detects hyperuricemia to treat and prevent excruciating gouty attacks in toes and ankles.'
      }
    ],
    whyChooseUs: [
      'Tailored in partnership with SSKM-attached orthopedic surgical protocols',
      'Precision automated photometric and immunoassay analyzers',
      'Free doorstep sample collection for patients with limited joint mobility',
      '24-hour turnaround with clear reference ranges and doctor review'
    ],
    sampleDetails: {
      sampleType: 'Blood Sample',
      fasting: 'No strict fasting required; normal hydration allowed',
      reportTime: 'Within 24 Hours',
      collectionType: 'Free Home Collection / Center Visit'
    }
  },

  'acute-infection-immunity-fever-package': {
    slug: 'acute-infection-immunity-fever-package',
    title: 'Acute Infection, Immunity & Fever Screening Profile',
    tagline: 'Rapid Multi-Pathogen Diagnostic Triage for Monsoon Fevers, Dengue, Typhoid & Infections',
    bengaliSlogan: 'ডেঙ্গু, টাইফয়েড ও তীব্র জ্বরের সঠিক কারণ জানুন দ্রুত। সঠিক চিকিৎসা, দ্রুত আরোগ্য।',
    hindiSlogan: 'डेंगू, टाइफाइड और बुखार का तुरंत और सटीक टेस्ट।',
    posterImage: '/images/packages/acute-infection-immunity-fever-package.jpg',
    validUntil: 'Special Doctor Curated Package',
    idealFor: [
      'Patients consulting Resident Doctor Dr. Eureka Abida Laskar',
      'Anyone suffering from acute or high-grade fever with chills, body ache, or weakness',
      'Suspected monsoon viral illnesses (Dengue, Malaria, Typhoid, Viral Syndromes)',
      'Patients with burning urination, suspected UTI, or sudden severe dehydration'
    ],
    keyBenefits: [
      {
        title: 'Dengue NS1 Antigen Assay',
        desc: 'Day 1 early detection marker for dengue fever to prevent dangerous platelet crashes.'
      },
      {
        title: 'Widal Slide Test (Typhoid)',
        desc: 'Identifies Salmonella enteric fever to start timely targeted antibiotic therapy.'
      },
      {
        title: 'CBC with Differential & Platelets',
        desc: 'Tracks real-time white blood cell fighting capacity and daily platelet reserves.'
      },
      {
        title: 'Quantitative CRP & ESR',
        desc: 'Measures acute systemic inflammatory response to guide urgent medical triage.'
      }
    ],
    whyChooseUs: [
      'Urgent priority processing with fast digital reports within 12-24 hours',
      'Same-day doorstep sample collection across Bankra and Howrah',
      'NABL accredited fever panel eliminating guesswork',
      'Affordable emergency pricing of just ₹934 (Original MRP ₹2,640)'
    ],
    sampleDetails: {
      sampleType: 'Blood Sample & Spot Urine',
      fasting: 'No fasting required; urgent sample collection anytime',
      reportTime: 'Same Day / 12-24 Hours',
      collectionType: 'Free Emergency Home Collection / Center Visit'
    }
  },

  'advanced-diabetes-reversal-organ-shield': {
    slug: 'advanced-diabetes-reversal-organ-shield',
    title: 'Advanced Diabetes Reversal & Vital Organ Shield',
    tagline: 'Precision Glycemic Control with Multi-Organ Protection (Heart, Kidney, Liver)',
    bengaliSlogan: 'ডায়াবেটিস নিয়ন্ত্রণ করুন ও হার্ট, কিডনি, লিভার সুরক্ষিত রাখুন। সম্পূর্ণ ডায়াবেটিস শিল্ড।',
    hindiSlogan: 'डायबिटीज कंट्रोल के साथ हार्ट, किडनी और लिवर की संपूर्ण सुरक्षा।',
    posterImage: '/images/packages/advanced-diabetes-reversal-organ-shield.jpg',
    validUntil: 'Special Doctor Curated Package',
    idealFor: [
      'Patients consulting Diabetologist & Critical Care Specialist Dr. Wasim Karim',
      'Diagnosed Type 2 diabetic patients looking to reverse diabetes or prevent complications',
      'Individuals with borderline prediabetes or high fasting blood sugar',
      'Diabetic patients taking multiple medications needing kidney and liver monitoring'
    ],
    keyBenefits: [
      {
        title: 'Urine Microalbumin:Creatinine Ratio (ACR)',
        desc: 'Gold-standard early detector of diabetic nephropathy years before standard kidney tests show damage.'
      },
      {
        title: 'Triple Glycemic Check (FBS, PPBS & HbA1c)',
        desc: 'Measures immediate fasting sugar, meal response, and 90-day glycemic average.'
      },
      {
        title: 'Comprehensive Lipid Profile',
        desc: 'Protects delicate diabetic blood vessels against atherosclerosis and cardiovascular events.'
      },
      {
        title: 'Liver Function Test (LFT) & Creatinine',
        desc: 'Ensures safe hepatic metabolism and optimal renal clearance of diabetic medications.'
      }
    ],
    whyChooseUs: [
      'Curated directly in line with Dr. Wasim Karim diabetes reversal protocol',
      'Advanced HPLC HbA1c and automated biochemical analyzers',
      'Free dual-draw home collection for fasting and post-prandial samples',
      'Detailed color-coded glycemic report with dietary optimization pointers'
    ],
    sampleDetails: {
      sampleType: 'Blood (FBS + PPBS) & Spot Urine Sample',
      fasting: '10-12 Hours Overnight Fasting for FBS; PPBS 2 hours after meal',
      reportTime: 'Within 24 Hours',
      collectionType: 'Free Home Collection / Center Visit'
    }
  },

  'senior-citizen-chronic-disease-package': {
    slug: 'senior-citizen-chronic-disease-package',
    title: 'Senior Citizen Comprehensive Chronic Disease & Vital Health Checkup',
    tagline: 'Annual Multi-System Geriatric Health Screen for Vital Longevity and Wellness',
    bengaliSlogan: 'বয়স্কদের সুস্থ ও দীর্ঘায়ু জীবনের জন্য সম্পূর্ণ স্বাস্থ্য পরীক্ষা। যত্নে থাকুন, ভালো থাকুন।',
    hindiSlogan: 'वरिष्ठ नागरिकों के लिए संपूर्ण स्वास्थ्य जांच और सुरक्षा।',
    posterImage: '/images/packages/senior-citizen-chronic-disease-package.jpg',
    validUntil: 'Special Doctor Curated Package',
    idealFor: [
      'Patients consulting Senior Consultant Physicians & Geriatric Specialists',
      'Senior citizens aged 55+ for comprehensive annual healthcare checkups',
      'Elderly individuals managing multiple chronic conditions (BP, Sugar, Thyroid, Uric Acid)',
      'Seniors taking routine medications requiring periodic organ safety evaluations'
    ],
    keyBenefits: [
      {
        title: 'Multi-Organ Geriatric Shield',
        desc: 'Comprehensive evaluation of Liver (LFT), Kidneys (KFT with Uric Acid), Heart (Lipid), and Endocrine (Thyroid TSH).'
      },
      {
        title: 'Cardio-Metabolic Stability',
        desc: 'Fasting Blood Sugar and HbA1c provide a complete roadmap of metabolic control and vascular protection.'
      },
      {
        title: 'Hematology & Inflammation (CBC + ESR)',
        desc: 'Screens for senior anemia, silent infections, and chronic degenerative inflammatory markers.'
      },
      {
        title: 'Complete Urinalysis',
        desc: 'Detects subclinical urinary tract infections, protein leakage, and kidney stone risk.'
      }
    ],
    whyChooseUs: [
      'Designed with expert clinical internal medicine and geriatric care protocols',
      'Gentle, compassionate home sample collection for elderly patients',
      'High-precision reports delivered to WhatsApp with senior-friendly fonts',
      'Unmatched value: ₹3,960 worth of clinical investigations for only ₹1,429'
    ],
    sampleDetails: {
      sampleType: 'Blood Sample & Urine Sample',
      fasting: '10-12 Hours Overnight Fasting Required (Water Allowed)',
      reportTime: 'Within 24 Hours',
      collectionType: 'Free Home Collection / Center Visit'
    }
  },

  'junior-wellness-child-growth-package': {
    slug: 'junior-wellness-child-growth-package',
    title: 'Junior Wellness & Child Growth Immunity Profile',
    tagline: 'Complete Pediatric Growth, Nutrition, Bone Strength and Anemia Screening',
    bengaliSlogan: 'শিশু স্বাস্থ্য ও পুষ্টি প্রোফাইল। সন্তানের সঠিক বৃদ্ধি, পুষ্টি ও শক্তিশালী রোগ প্রতিরোধ ক্ষমতা।',
    hindiSlogan: 'बच्चों के सही विकास, पोषण और मजबूत इम्यूनिटी की संपूर्ण जांच।',
    posterImage: '/images/packages/junior-wellness-child-growth-package.jpg',
    validUntil: 'Special Doctor Curated Package',
    idealFor: [
      'Patients consulting Senior Pediatrician Dr. Sanjoy Kumar Dey & Child Specialists',
      'Children and infants experiencing slow growth, low weight gain, or poor appetite',
      'Kids with frequent colds, cough, recurrent fevers, or weak immune defenses',
      'School-age children screening for latent iron deficiency anemia and bone strength'
    ],
    keyBenefits: [
      {
        title: 'Serum Ferritin & CBC with Hb%',
        desc: 'Detects early latent iron deficiency before developmental delays or severe anemia manifest.'
      },
      {
        title: 'Vitamin D3 & Calcium Bone Health',
        desc: 'Prevents childhood rickets, promotes healthy bone lengthening, and strengthens tooth enamel.'
      },
      {
        title: 'Thyroid Stimulating Hormone (TSH)',
        desc: 'Screens for childhood subclinical hypothyroidism affecting cognitive and physical milestones.'
      },
      {
        title: 'Blood Grouping & Urine Analysis',
        desc: 'Provides essential emergency blood group certification and rules out asymptomatic pediatric UTIs.'
      }
    ],
    whyChooseUs: [
      'Tailored with 35+ years of pediatric clinical experience by Dr. Sanjoy Kumar Dey and advanced child wellness protocols',
      'Gentle, child-friendly phlebotomists using pediatric micro-sampling needles',
      'Fast digital reports delivered to WhatsApp in 24 hours',
      'Subsidized child wellness package rate of ₹1,044 (Original MRP ₹2,860)'
    ],
    sampleDetails: {
      sampleType: 'Pediatric Blood Sample & Urine Sample',
      fasting: 'No strict fasting required; morning collection recommended',
      reportTime: 'Within 24 Hours',
      collectionType: 'Free Home Collection / Center Visit'
    }
  },

  'neonatal-pediatric-allergy-nutrition-panel': {
    slug: 'neonatal-pediatric-allergy-nutrition-panel',
    title: 'Neonatal & Pediatric Allergy & Nutrition Panel',
    tagline: 'Targeted Newborn Jaundice, Food Allergy, Eczema & Micronutrient Screening',
    bengaliSlogan: 'শিশু পুষ্টি ও অ্যালার্জি প্যানেল। নবজাতকের জন্ডিস, অ্যালার্জি ও সঠিক পুষ্টির সুরক্ষা।',
    hindiSlogan: 'शिशु और बच्चों में एलर्जी, पीलिया और पोषण की संपूर्ण जांच।',
    posterImage: '/images/packages/neonatal-pediatric-allergy-nutrition-panel.jpg',
    validUntil: 'Special Doctor Curated Package',
    idealFor: [
      'Patients consulting Pediatric Nutritionist & Neonatologist Dr. Wasim Aktar Sardar',
      'Newborns and infants with suspected jaundice or digestive distress after milk feed',
      'Toddlers and children with recurring skin rashes, eczema, wheezing, or allergic cough',
      'Infants transitioning to solid foods requiring allergy and nutritional profiling'
    ],
    keyBenefits: [
      {
        title: 'Bilirubin Total & Direct (Neonatal Jaundice)',
        desc: 'Accurately quantifies neonatal jaundice to determine if phototherapy or clinical care is needed.'
      },
      {
        title: 'Total IgE & Absolute Eosinophil Count (AEC)',
        desc: 'Screens for food allergies (milk, eggs, nuts), allergic bronchitis, and hyper-reactivity.'
      },
      {
        title: 'Vitamin D3 & Calcium Panel',
        desc: 'Ensures optimal infant skeletal mineralization and prevents early childhood bone weakness.'
      },
      {
        title: 'Complete Urinalysis',
        desc: 'Detects subclinical infant urinary infections that often cause unexplained irritability or fever.'
      }
    ],
    whyChooseUs: [
      'Formulated with Boston PGPN Pediatric Nutrition clinical standards',
      'Gentle micro-blood draw with certified pediatric care',
      'Emergency sample handling for neonatal jaundice cases',
      'Comprehensive pediatric nutrition report delivered in 24 hours'
    ],
    sampleDetails: {
      sampleType: 'Pediatric Blood & Urine Sample',
      fasting: 'No fasting required; samples collected after regular feed',
      reportTime: 'Within 24 Hours',
      collectionType: 'Free Home Collection / Center Visit'
    }
  },

  'holistic-allergy-inflammation-wellness-screen': {
    slug: 'holistic-allergy-inflammation-wellness-screen',
    title: 'Holistic Allergy & Chronic Inflammation Wellness Screen',
    tagline: 'Root-Cause Diagnostic Evaluation for Recurring Allergies, Asthma, Skin & Kidney Wellness',
    bengaliSlogan: 'হোলিস্টিক অ্যালার্জি ও ইনফ্লামেশন স্ক্রিন। ত্বকের অ্যালার্জি, হাঁপানি ও কিডনির সুরক্ষা।',
    hindiSlogan: 'एलर्जी, दमा और पुराने रोगों की जड़ से पहचान और संपूर्ण जांच।',
    posterImage: '/images/packages/holistic-allergy-inflammation-wellness-screen.jpg',
    validUntil: 'Special Doctor Curated Package',
    idealFor: [
      'Patients consulting Senior Homeopathy Doctor Dr. Parvez Ahmed Khan',
      'Individuals with stubborn skin eczema, psoriasis, chronic hives, or unremitting itching',
      'Patients suffering from morning sneezing, allergic rhinitis, sinusitis, or chronic asthma',
      'Anyone with family history of recurrent kidney stones (renal calculi) or chronic acidity'
    ],
    keyBenefits: [
      {
        title: 'Total IgE & AEC Allergy Marker',
        desc: 'Quantifies immune system hyper-sensitization to dust, pollen, cold air, and food allergens.'
      },
      {
        title: 'Complete Urinalysis for Renal Stones',
        desc: 'Microscopic crystal analysis and pH testing to detect early kidney stone propensity.'
      },
      {
        title: 'ESR & CBC Inflammation Baseline',
        desc: 'Measures deep-tissue chronic inflammatory activity and immune cell distribution.'
      },
      {
        title: 'Liver Function Test (LFT)',
        desc: 'Assesses hepatic toxin clearance and metabolic wellness to optimize natural remedies.'
      }
    ],
    whyChooseUs: [
      'Tailored with NIH (Govt. of India) constitutional homeopathy diagnostic principles',
      'Non-invasive, comprehensive diagnostic clarity for natural holistic remedies',
      'Doorstep hygienic home sample collection across Bankra and Howrah',
      'Detailed report with personalized lifestyle and hydration recommendations'
    ],
    sampleDetails: {
      sampleType: 'Blood Sample & Urine Sample',
      fasting: 'No strict fasting required; hydration encouraged',
      reportTime: 'Within 24 Hours',
      collectionType: 'Free Home Collection / Center Visit'
    }
  }
}
