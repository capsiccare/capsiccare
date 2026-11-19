import { Test, ServiceArea } from './data/types'

export interface TestClinicalInfo {
  whyThisTest: string
  clinicalImportance: string[]
  whenToTake: string[]
  whoShouldTake: string[]
  transparentPricingHighlight: {
    mrp: number
    price: number
    savings: number
    discountPercent: number
    statement: string
  }
  localGuarantee: {
    primaryLocation: string
    nearbyAreasText: string
    homeCollectionText: string
    centerAddress: string
  }
  faqs: { question: string; answer: string }[]
  seoTitle: string
  seoDescription: string
  seoKeywords: string[]
  jsonLd: any
}

// Category-specific and test-name specific clinical intelligence mapping
export function getTestClinicalInfo(test: Test, area?: ServiceArea | null): TestClinicalInfo {
  const testName = test.name || ''
  const catName = test.category?.name || 'Pathology Test'
  const lowerName = testName.toLowerCase()
  const lowerCat = catName.toLowerCase()

  const mrp = test.mrp && test.mrp > test.price ? test.mrp : Math.round(test.price * 1.5)
  const price = test.price || 0
  const savings = Math.max(0, mrp - price)
  const discountPercent = mrp > 0 ? Math.round((savings / mrp) * 100) : 0

  const primaryAreaName = area ? area.name : 'Bankra'
  const isBankra = !area || area.slug.includes('bankra')

  // Derive specialized clinical purpose based on test keywords
  let whyThisTest = ''
  let clinicalImportance: string[] = []
  let whenToTake: string[] = []
  let whoShouldTake: string[] = []

  if (lowerName.includes('cbc') || lowerName.includes('complete blood count') || lowerName.includes('hemogram') || lowerName.includes('hemoglobin')) {
    whyThisTest = `The ${testName} is a fundamental diagnostic blood test that evaluates your overall health and detects a wide range of disorders, including anemia, viral or bacterial infections, inflammation, and blood disorders. It provides an accurate count of red blood cells (RBCs), white blood cells (WBCs), hemoglobin, hematocrit, and platelets.`
    clinicalImportance = [
      'Accurately screens for iron deficiency anemia, vitamin deficiencies, and bone marrow conditions.',
      'Detects active bacterial, viral, or parasitic infections through total and differential WBC counts.',
      'Monitors platelet levels essential for blood clotting and bleeding risk assessment.',
      'Evaluates the response to medical treatments, chemotherapy, and long-term medications.'
    ]
    whenToTake = [
      'Unexplained fatigue, weakness, pale skin, or dizziness',
      'Persistent fever, chills, frequent infections, or swollen lymph nodes',
      'Unusual bruising, prolonged bleeding from minor cuts, or petechiae',
      'Routine annual preventative health checkups and pre-surgery evaluations'
    ]
    whoShouldTake = [
      'Adults and children undergoing routine wellness screening',
      'Individuals with chronic fatigue, autoimmune conditions, or heavy menstrual bleeding',
      'Patients taking medications that affect bone marrow or blood cell production'
    ]
  } else if (lowerName.includes('sugar') || lowerName.includes('glucose') || lowerName.includes('hba1c') || lowerName.includes('diabetes') || lowerName.includes('insulin')) {
    whyThisTest = `The ${testName} measures blood glucose levels to diagnose prediabetes, Type 1 diabetes, Type 2 diabetes, or gestational diabetes. It is also vital for monitoring glycemic control in diagnosed patients to prevent dangerous blood sugar spikes and chronic diabetic complications.`
    clinicalImportance = [
      'Identifies prediabetes early when dietary and lifestyle interventions can reverse the condition.',
      'Evaluates 3-month glycemic control (for HbA1c) without daily glucose fluctuation bias.',
      'Prevents long-term diabetic complications such as diabetic neuropathy, retinopathy, and kidney damage.',
      'Helps doctors fine-tune oral hypoglycemic medications or insulin dosages with precision.'
    ]
    whenToTake = [
      'Frequent urination (especially at night), increased thirst, and dry mouth',
      'Unexplained weight loss or intense hunger despite normal eating',
      'Blurred vision, tingling or numbness in hands and feet',
      'Slow-healing cuts, recurrent skin infections, or family history of diabetes'
    ]
    whoShouldTake = [
      'All adults aged 30+ for annual metabolic screening',
      'Diagnosed diabetics for quarterly monitoring and HbA1c checks',
      'Pregnant women screening for gestational diabetes'
    ]
  } else if (lowerName.includes('thyroid') || lowerName.includes('tsh') || lowerName.includes('t3') || lowerName.includes('t4')) {
    whyThisTest = `The ${testName} evaluates the functioning of your thyroid gland by measuring circulating thyroid hormones. The thyroid regulates metabolism, heart rate, energy production, body temperature, and reproductive health.`
    clinicalImportance = [
      'Diagnoses hypothyroidism (underactive thyroid) and hyperthyroidism (overactive thyroid).',
      'Evaluates causes of unexplained weight changes, mood swings, and chronic sluggishness.',
      'Monitors hormone replacement therapy dosage (e.g., Levothyroxine) for optimal balance.',
      'Essential for fertility evaluations and healthy fetal brain development during pregnancy.'
    ]
    whenToTake = [
      'Sudden unexplained weight gain or rapid weight loss',
      'Chronic tiredness, hair loss, brittle nails, and cold or heat intolerance',
      'Irregular heartbeats, anxiety, nervousness, or sleep disturbances',
      'Irregular menstrual cycles, difficulty conceiving, or neck swelling (goiter)'
    ]
    whoShouldTake = [
      'Women of reproductive age and individuals with menstrual irregularities',
      'Patients on thyroid medications requiring dosage calibration every 3-6 months',
      'Anyone experiencing severe fatigue, brain fog, or mood fluctuations'
    ]
  } else if (lowerName.includes('lipid') || lowerName.includes('cholesterol') || lowerName.includes('triglyceride') || lowerName.includes('cardio') || lowerName.includes('heart') || lowerName.includes('troponin')) {
    whyThisTest = `The ${testName} evaluates cardiovascular health and assesses your risk of coronary artery disease, heart attacks, and strokes by measuring total cholesterol, LDL (bad cholesterol), HDL (good cholesterol), VLDL, and triglycerides.`
    clinicalImportance = [
      'Screens for atherosclerotic plaque buildup and arterial narrowing before symptoms occur.',
      'Calculates 10-year cardiovascular risk scores to guide preventative heart therapy.',
      'Monitors the effectiveness of statins and lipid-lowering therapies.',
      'Assesses metabolic syndrome risk in individuals with hypertension or obesity.'
    ]
    whenToTake = [
      'Family history of premature heart disease, high cholesterol, or stroke',
      'Hypertension (high blood pressure), obesity, smoking, or sedentary lifestyle',
      'Diabetic patients requiring regular cardiovascular risk screening',
      'Routine preventative health screening every 6-12 months'
    ]
    whoShouldTake = [
      'Men aged 35+ and women aged 40+ for routine cardiac risk profiling',
      'Individuals with hypertension, diabetes, or high BMI',
      'Patients currently taking statins or cholesterol-lowering medications'
    ]
  } else if (lowerName.includes('liver') || lowerName.includes('lft') || lowerName.includes('bilirubin') || lowerName.includes('sgot') || lowerName.includes('sgpt') || lowerName.includes('alt') || lowerName.includes('ast') || lowerName.includes('alkaline phosphatase') || lowerName.includes('ggt')) {
    whyThisTest = `The ${testName} assesses the health and metabolic functioning of your liver by measuring specific enzymes, proteins, and bilirubin. It helps identify liver inflammation, fatty liver disease, viral hepatitis, toxic liver injury, and bile duct obstructions.`
    clinicalImportance = [
      'Detects early liver inflammation and non-alcoholic fatty liver disease (NAFLD).',
      'Monitors liver damage caused by alcohol consumption, viral hepatitis (B or C), or hepatotoxic medications.',
      'Evaluates causes of jaundice, dark urine, pale stools, and abdominal swelling.',
      'Assesses the liver’s synthetic capacity by measuring serum albumin and total proteins.'
    ]
    whenToTake = [
      'Yellowing of skin or eyes (jaundice), dark-colored urine, or pale stools',
      'Persistent nausea, loss of appetite, vomiting, or abdominal pain on the upper right side',
      'Regular alcohol intake or long-term medication use requiring liver surveillance',
      'Chronic fatigue, unexplained itching, or easy bruising'
    ]
    whoShouldTake = [
      'Individuals diagnosed with fatty liver or metabolic syndrome',
      'Patients on long-term medications, cholesterol drugs, or pain relievers',
      'People with history of hepatitis exposure or regular alcohol consumption'
    ]
  } else if (lowerName.includes('kidney') || lowerName.includes('kft') || lowerName.includes('creatinine') || lowerName.includes('urea') || lowerName.includes('bun') || lowerName.includes('uric acid') || lowerName.includes('egfr') || lowerName.includes('renal')) {
    whyThisTest = `The ${testName} evaluates renal function by measuring waste products like creatinine, blood urea nitrogen (BUN), and uric acid that healthy kidneys filter from your bloodstream. It ensures early detection of chronic kidney disease (CKD) and electrolyte imbalances.`
    clinicalImportance = [
      'Identifies early renal impairment before irreversible kidney damage occurs.',
      'Calculates estimated Glomerular Filtration Rate (eGFR) to stage kidney health.',
      'Monitors kidney function in hypertensive and diabetic patients at high risk for nephropathy.',
      'Detects hyperuricemia to prevent painful gout attacks and uric acid kidney stones.'
    ]
    whenToTake = [
      'Swelling in legs, ankles, feet, hands, or puffiness around the eyes',
      'Changes in urinary frequency, foamy urine, or blood in the urine',
      'Uncontrolled high blood pressure or diabetes with microalbuminuria',
      'Severe joint pain, redness, and swelling (especially in the big toe indicating gout)'
    ]
    whoShouldTake = [
      'Hypertensive and diabetic patients requiring routine renal checkups',
      'Individuals with a family history of kidney disease or chronic urinary infections',
      'Patients taking NSAIDs, diuretics, or medications processed through kidneys'
    ]
  } else if (lowerName.includes('vitamin') || lowerName.includes('b12') || lowerName.includes('vitamin d') || lowerName.includes('folate') || lowerName.includes('calcium') || lowerName.includes('iron') || lowerName.includes('ferritin')) {
    whyThisTest = `The ${testName} measures essential micronutrient, vitamin, or mineral concentrations in your blood to diagnose deficiencies that cause fatigue, bone weakness, nerve pain, hair loss, and compromised immunity.`
    clinicalImportance = [
      'Identifies Vitamin D3 deficiency responsible for bone pain, osteopenia, and low immunity.',
      'Detects Vitamin B12 and Folate deficiencies that cause megaloblastic anemia and peripheral neuropathy.',
      'Evaluates iron stores (Ferritin) to diagnose latent iron deficiency before anemia develops.',
      'Guides tailored dietary supplementation to restore vitality and cognitive performance.'
    ]
    whenToTake = [
      'Chronic body ache, muscle weakness, lower back pain, or bone soreness',
      'Numbness, tingling sensations (pins and needles) in hands and feet, or memory fog',
      'Severe hair thinning, brittle nails, or recurring oral mouth ulcers',
      'Vegetarian/vegan diets or minimal sunlight exposure'
    ]
    whoShouldTake = [
      'Indoor workers, elderly adults, and pregnant or nursing mothers',
      'Strict vegetarians/vegans at higher risk for B12 and iron deficiency',
      'Individuals experiencing chronic fatigue, depression, or bone weakness'
    ]
  } else if (lowerName.includes('urine') || lowerName.includes('urinalysis') || lowerName.includes('culture') || lowerName.includes('dengue') || lowerName.includes('malaria') || lowerName.includes('typhoid') || lowerName.includes('crp') || lowerName.includes('esr') || lowerName.includes('widal')) {
    whyThisTest = `The ${testName} is a targeted diagnostic investigation designed to detect active bacterial, viral, or parasitic infections, inflammatory markers, or urinary tract abnormalities.`
    clinicalImportance = [
      'Rapidly detects infectious pathogens (Dengue, Malaria, Typhoid, UTI bacteria) for targeted antibiotic or antiviral therapy.',
      'Measures systemic inflammation levels via quantitative CRP or ESR markers.',
      'Prevents complications by providing accurate pathogen identification.',
      'Guides emergency clinical decisions with fast 12 to 24-hour turnaround times.'
    ]
    whenToTake = [
      'High fever with chills, body ache, joint pain, or severe headache',
      'Burning sensation while urinating, cloudy urine, or frequent urgency',
      'Suspected monsoon illnesses (Dengue, Malaria, Chikungunya, Typhoid)',
      'Unexplained joint inflammation, persistent cough, or localized infections'
    ]
    whoShouldTake = [
      'Patients with acute or recurring fever and flu-like symptoms',
      'Individuals suffering from suspected urinary tract infections (UTIs)',
      'Patients undergoing inflammatory or autoimmune disease monitoring'
    ]
  } else {
    // General fallback tailored to category
    whyThisTest = `The ${testName} is an accurate diagnostic investigation under ${catName} that provides essential biological data for assessing organ status, diagnosing clinical symptoms, and monitoring overall physical wellness.`
    clinicalImportance = [
      `Delivers precise quantitative parameters required by physicians to evaluate ${catName.toLowerCase()} health.`,
      'Aids in the early detection of asymptomatic health conditions before severe symptoms manifest.',
      'Serves as an objective clinical benchmark for ongoing preventative health monitoring.',
      'Ensures laboratory quality control through accredited automated analyzers and certified pathologists.'
    ]
    whenToTake = [
      'When recommended by your treating doctor or specialist physician',
      'Experiencing persistent, unexplained symptoms or generalized fatigue',
      'Part of routine yearly health screening or pre-operative medical workups',
      'Monitoring response to targeted medical treatments or lifestyle changes'
    ]
    whoShouldTake = [
      'Adults and seniors undergoing routine health checkups',
      'Patients with specific clinical indications or chronic symptoms',
      'Individuals seeking accurate, low-cost diagnostic clarity with home sample collection'
    ]
  }

  // Common local service details emphasizing Bankra as primary hub
  const localGuarantee = {
    primaryLocation: primaryAreaName,
    nearbyAreasText: 'Bankra, Bankra Bazar, Kabar Para, Kona, Makardah, Domjur, Santragachi, Salap, Nibra, Andul, Kadamtala, Howrah, and Kolkata regions',
    homeCollectionText: `Free doorstep home sample collection is available if total test amount is above ₹2,000 across ${primaryAreaName}, Howrah, and Kolkata. Certified phlebotomists collect samples safely from your home with 100% sterile vacuum containers. For updated prices or information, contact 8910260709 or WhatsApp.`,
    centerAddress: 'Bankra Bazar, Dewan Para Road, Domjur, Howrah – 711403 (Near Bankra Hospital & Market)'
  }

  const transparentPricingHighlight = {
    mrp,
    price,
    savings,
    discountPercent,
    statement: `Capsic Care offers ${testName} at a low-cost, budget-friendly price of ₹${price} (MRP: ₹${mrp}, Save ₹${savings} with ${discountPercent}% discount). We provide 100% transparent pricing with zero hidden charges, zero upfront booking fees, and free home sample collection on orders above ₹2,000 across Howrah & Kolkata. For updated prices or information, contact 8910260709 or WhatsApp.`
  }

  // Dynamic FAQs with local SEO keywords
  const faqs = [
    {
      question: `How do I book an affordable ${testName} in ${primaryAreaName}?`,
      answer: `You can easily book ${testName} with Capsic Care online or via WhatsApp (+91 8910260709). We provide doorstep home sample collection across ${primaryAreaName}, Bankra Bazar, Kabar Para, Kona, Makardah, Domjur, Santragachi, Howrah & Kolkata with zero upfront payment required. Free home collection is available on total test amount above ₹2,000. For updated prices or info, contact 8910260709 or WhatsApp.`
    },
    {
      question: `What is the price of ${testName} in Bankra and nearby areas?`,
      answer: `The transparent offer price for ${testName} at Capsic Care is ₹${price} (Standard MRP: ₹${mrp}, saving you ₹${savings} or ${discountPercent}% off). For updated price or information, contact +91 8910260709 or WhatsApp.`
    },
    {
      question: `Is home sample collection available for ${testName} in ${primaryAreaName}?`,
      answer: `Yes, Capsic Care provides home sample collection for ${testName} across ${primaryAreaName}, Howrah & Kolkata. Free home sample collection is available if total test amount or price is above ₹2,000. For updated prices, collection charges for lower amounts, or general information, contact 8910260709 or WhatsApp.`
    },
    {
      question: `How soon will I receive my ${testName} test reports?`,
      answer: `Reports for ${testName} are delivered within ${test.turnaround_time || '24 hours'}. You will receive a high-resolution, NABL-verified digital smart report directly on your WhatsApp and email, with physical copies available on request.`
    },
    {
      question: `Is any special preparation or fasting required for ${testName}?`,
      answer: test.preparation || 'No special preparation or fasting is required unless specifically instructed by your consulting doctor. You can maintain normal water intake.'
    }
  ]

  // SEO Titles and descriptions optimized for Bankra and nearby areas with primary low-cost positioning
  const areaTitleSuffix = area ? ` in ${area.name}` : ` in Bankra & Nearby Areas`
  const seoTitle = `${testName}${areaTitleSuffix} (₹${price}) - Blood Test & Free Home Collection | Capsic Care`
  const seoDescription = `Book ${testName}${areaTitleSuffix} at transparent price ₹${price} (MRP: ₹${mrp}, Save ₹${savings}). Free doorstep home sample collection across Bankra, Kona, Domjur, Makardah, Santragachi, Howrah & Kolkata. NABL certified lab quality & 24h reports on WhatsApp. Call/WhatsApp +91 8910260709.`

  const seoKeywords = [
    testName,
    `${testName} in ${primaryAreaName}`,
    `${testName} price in Bankra`,
    `Affordable ${testName} in ${primaryAreaName}`,
    `Low-Cost ${testName} in Bankra`,
    `Blood Test Near ${primaryAreaName}`,
    `Affordable Pathology Tests in Bankra`,
    `Home Sample Collection in ${primaryAreaName}`,
    `Diagnostic Tests at Low Prices in Howrah`,
    `Affordable Blood Tests Near Me`,
    `Low-Cost Diagnostic Tests Near Me`,
    `Affordable Diagnostic Centre in Bankra & Nearby Areas`,
    `Blood Test Near Bankra`,
    `Home Sample Collection Near Me`,
    `${testName} in Kona`,
    `${testName} in Domjur`,
    `${testName} in Makardah`,
    `${testName} in Santragachi`,
    `${testName} in Salap`,
    `${testName} in Andul`,
    `Pathology lab in Bankra Bazar Howrah`,
    `${testName} NABL lab report 24 hours`
  ]

  const testPageUrl = `https://capsic.in/tests/${test.slug}${area ? `-in-${area.slug}` : ''}`

  // JSON-LD Schemas
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'DiagnosticProcedure',
        name: testName,
        description: whyThisTest,
        bodyLocation: test.sample_type,
        preparation: test.preparation || 'Standard preparation',
        offers: {
          '@type': 'Offer',
          price: price,
          priceCurrency: 'INR',
          priceValidUntil: '2026-12-31',
          availability: 'https://schema.org/InStock',
          url: testPageUrl,
          seller: {
            '@type': 'MedicalBusiness',
            name: 'Capsic Care Diagnostics',
            address: {
              '@type': 'PostalAddress',
              streetAddress: 'Bankra Bazar, Dewan Para Road',
              addressLocality: 'Domjur, Howrah',
              postalCode: '711403',
              addressRegion: 'West Bengal',
              addressCountry: 'IN'
            },
            telephone: '+918910260709'
          }
        }
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: 'Home',
            item: 'https://capsic.in'
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: 'Lab Tests',
            item: 'https://capsic.in/lab-tests'
          },
          {
            '@type': 'ListItem',
            position: 3,
            name: test.category?.name || 'Pathology',
            item: `https://capsic.in/tests/${test.category?.slug || 'pathology'}`
          },
          {
            '@type': 'ListItem',
            position: 4,
            name: testName,
            item: testPageUrl
          }
        ]
      },
      {
        '@type': 'MedicalBusiness',
        '@id': 'https://capsic.in/#organization',
        name: 'Capsic Care Diagnostics & Healthcare',
        url: 'https://capsic.in',
        logo: 'https://capsic.in/logo.png',
        image: 'https://capsic.in/logo.png',
        telephone: '+918910260709',
        priceRange: '₹₹',
        currenciesAccepted: 'INR',
        paymentAccepted: 'Cash, UPI, Debit Card, Credit Card',
        address: {
          '@type': 'PostalAddress',
          streetAddress: 'Bankra Bazar, Dewan Para Road',
          addressLocality: 'Domjur, Howrah',
          postalCode: '711403',
          addressRegion: 'West Bengal',
          addressCountry: 'IN'
        },
        geo: {
          '@type': 'GeoCoordinates',
          latitude: '22.6047',
          longitude: '88.2715'
        },
        areaServed: [
          'Bankra',
          'Bankra Bazar',
          'Kabar Para',
          'Kona',
          'Makardah',
          'Domjur',
          'Santragachi',
          'Salap',
          'Nibra',
          'Andul',
          'Baltikuri',
          'Dasnagar',
          'Kadamtala',
          'Howrah'
        ],
        aggregateRating: {
          '@type': 'AggregateRating',
          ratingValue: '4.9',
          reviewCount: '145',
          bestRating: '5',
          worstRating: '1'
        },
        openingHoursSpecification: [
          {
            '@type': 'OpeningHoursSpecification',
            dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
            opens: '08:00',
            closes: '20:00'
          },
          {
            '@type': 'OpeningHoursSpecification',
            dayOfWeek: ['Sunday'],
            opens: '08:00',
            closes: '14:00'
          }
        ]
      },
      {
        '@type': 'FAQPage',
        mainEntity: faqs.map(faq => ({
          '@type': 'Question',
          name: faq.question,
          acceptedAnswer: {
            '@type': 'Answer',
            text: faq.answer
          }
        }))
      }
    ]
  }

  return {
    whyThisTest,
    clinicalImportance,
    whenToTake,
    whoShouldTake,
    transparentPricingHighlight,
    localGuarantee,
    faqs,
    seoTitle,
    seoDescription,
    seoKeywords,
    jsonLd
  }
}
