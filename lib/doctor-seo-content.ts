import { Doctor, doctorsData } from '@/data/doctors'
import { getDiagnosticData } from '@/lib/data/data-service'

export interface RecommendedItem {
  id: string
  name: string
  slug: string
  price: number
  mrp?: number
  category: string
  type: 'test' | 'package'
}

export interface DoctorSEOContent {
  doctor: Doctor
  seoTitle: string
  seoDescription: string
  seoKeywords: string[]
  h1Title: string
  subheading: string
  overview: string
  whyConsult: { title: string; desc: string }[]
  problemsTreated: { condition: string; description: string }[]
  symptomsList: string[]
  recommendedTests: RecommendedItem[]
  consultationLocations: {
    clinicName: string
    address: string
    consultationType: string
    hours: string
  }
  serviceAreas: string[]
  faqs: { question: string; answer: string }[]
  jsonLd: any
}

export const priorityDoctorAreas = [
  { name: 'Bankra', slug: 'bankra' },
  { name: 'Bankra Bazar', slug: 'bankra-bazar' },
  { name: 'Kabar Para', slug: 'kabar-para' },
  { name: 'Kona', slug: 'kona' },
  { name: 'Makardah', slug: 'makardah' },
  { name: 'Domjur', slug: 'domjur' },
  { name: 'Santragachi', slug: 'santragachi' },
  { name: 'Salap', slug: 'salap' },
  { name: 'Nibra', slug: 'nibra' },
  { name: 'Andul', slug: 'andul' },
  { name: 'Baltikuri', slug: 'baltikuri' },
  { name: 'Dasnagar', slug: 'dasnagar' },
  { name: 'Kadamtala', slug: 'kadamtala' },
  { name: 'Howrah', slug: 'howrah-city' },
]

// Dynamically resolve tests and packages from centralized diagnostic system
function resolveDoctorDiagnosticItems(identifiers: string[]): RecommendedItem[] {
  try {
    const data = getDiagnosticData()
    const resolved: RecommendedItem[] = []

    identifiers.forEach((idOrSlug) => {
      const normalizedKey = (idOrSlug || '').trim().toLowerCase()
      if (!normalizedKey) return

      // Check in packages first (by slug, ID, or normalized slug)
      const pkg = data.packages.find(
        (p) => 
          p.slug.toLowerCase() === normalizedKey || 
          p.id.toLowerCase() === normalizedKey ||
          (p.slug.toLowerCase().replace(/-/g, '') === normalizedKey.replace(/-/g, ''))
      )
      if (pkg) {
        const mrp = pkg.price > (pkg.discount_price || 0) ? pkg.price : (pkg.discount_price || pkg.price)
        const offerPrice = pkg.discount_price ? Math.min(pkg.price, pkg.discount_price) : pkg.price
        resolved.push({
          id: pkg.id,
          name: pkg.name,
          slug: pkg.slug,
          price: offerPrice,
          mrp: mrp,
          category: 'Health Package',
          type: 'package',
        })
        return
      }

      // Check in tests (by test_id, slug, or normalized slug)
      const test = data.tests.find(
        (t) => 
          t.id.toLowerCase() === normalizedKey ||
          t.slug.toLowerCase() === normalizedKey ||
          t.slug.toLowerCase().replace(/-/g, '') === normalizedKey.replace(/-/g, '')
      )
      if (test) {
        resolved.push({
          id: test.id,
          name: test.name,
          slug: test.slug,
          price: test.price,
          mrp: test.mrp || Math.round(test.price * 1.5),
          category: test.category?.name || 'Pathology Test',
          type: 'test',
        })
      }
    })

    return resolved
  } catch (err) {
    console.error('Error resolving doctor diagnostic items:', err)
    return []
  }
}

export function getDoctorSEOContent(doctor: Doctor, areaName?: string): DoctorSEOContent {
  const currentArea = areaName || 'Bankra'
  const isBankra = currentArea.toLowerCase().includes('bankra')
  const areaSuffix = isBankra ? 'in Bankra & Nearby Areas' : `in ${currentArea}`

  // Doctor-specific detailed clinical mapping
  let whyConsult: { title: string; desc: string }[] = []
  let problemsTreated: { condition: string; description: string }[] = []
  let symptomsList: string[] = []
  let testIdentifiers: string[] = []

  switch (doctor.id) {
    case 'dr-sanjay-kumar-dey':
      whyConsult = [
        {
          title: '35+ Years of Senior Pediatric Leadership',
          desc: 'Renowned child specialist and neonatologist with over 35 years of trusted pediatric practice across Kolkata, Howrah, and Dasnagar.'
        },
        {
          title: 'Gentle, Child-Friendly Clinical Environment',
          desc: 'Empathetic approach that eases anxiety for both children and parents during examinations and routine checkups.'
        },
        {
          title: 'Expertise in Pediatric Infectious Diseases',
          desc: 'Specialized in treating acute seasonal infections, persistent fever, bronchitis, and gastrointestinal illnesses in children.'
        },
        {
          title: 'Holistic Growth & Milestones Monitoring',
          desc: 'Comprehensive developmental tracking from infancy through adolescence, ensuring healthy cognitive and physical growth.'
        }
      ]
      problemsTreated = [
        { condition: 'Pediatric Fever & Viral Illnesses', description: 'Fast triage and management of dengue, flu, typhoid, and acute viral fevers.' },
        { condition: 'Childhood Asthma & Bronchitis', description: 'Management of recurrent wheezing, persistent cough, and pediatric allergies.' },
        { condition: 'Infant Colic & Digestive Upset', description: 'Relief for feeding issues, vomiting, diarrhea, constipation, and acid reflux.' },
        { condition: 'Delayed Developmental Milestones', description: 'Growth tracking, motor skills assessment, and early nutritional intervention.' },
        { condition: 'Routine & Catch-Up Immunization', description: 'Vaccination schedules conforming to IAP guidelines for optimal immunity.' },
        { condition: 'Childhood Malnutrition & Poor Weight Gain', description: 'Tailored dietary counseling and pediatric nutritional support.' }
      ]
      symptomsList = [
        'High or persistent fever in children with lethargy or chills',
        'Continuous cough, noisy breathing, or difficulty sleeping at night',
        'Loss of appetite, refusal to feed, or sudden drop in weight',
        'Frequent loose stools, vomiting, or stomach cramps',
        'Skin rashes, recurring ear infections, or throat irritation'
      ]
      testIdentifiers = [
        'junior-wellness-child-growth-package',
        'TST0176', // Complete Blood Count (CBC)
        'TST0243', // Dengue ELISA NS1 Antigen
        'TST0682', // Vitamin D3 (25-OH)
        'TST0665', // Urine Routine Examination
      ]
      break

    case 'dr-tooneer-mallik':
      whyConsult = [
        {
          title: 'DNB Medicine Qualified Family Physician',
          desc: 'Specialized in adult internal medicine, primary diagnostic evaluation, and preventive healthcare protocols.'
        },
        {
          title: 'Holistic Primary Care & Chronic Disease Management',
          desc: 'Comprehensive management of diabetes, hypertension, dyslipidemia, thyroid disorders, and seasonal infections.'
        },
        {
          title: 'Evidence-Based & Rational Medication',
          desc: 'Focus on correct diagnosis, avoiding over-prescription, and emphasizing nutritional and lifestyle guidance.'
        },
        {
          title: 'In-Clinic & Assisted Telemedicine Availability',
          desc: 'Accessible consultations at Bankra Bazar Medical Centre with continuous digital health follow-up support.'
        }
      ]
      problemsTreated = [
        { condition: 'Viral Fevers & Acute Infections', description: 'Accurate triage and therapy for dengue, malaria, typhoid, flu, and viral syndromes.' },
        { condition: 'Hypertension & High Blood Pressure', description: 'Personalized blood pressure stabilization and organ protection protocols.' },
        { condition: 'Type 2 Diabetes & Metabolic Health', description: 'Early glycemic control, HbA1c monitoring, and lifestyle guidance.' },
        { condition: 'Gastritis, GERD & Digestive Disorders', description: 'Targeted relief for chronic acid reflux, bloating, peptic ulcers, and indigestion.' },
        { condition: 'Respiratory Allergies, Cough & Bronchitis', description: 'Management of seasonal allergic rhinitis, chest congestion, and chronic cough.' },
        { condition: 'General Weakness & Nutritional Anemia', description: 'Diagnostic evaluation for iron deficiency, vitamin deficiencies, and chronic fatigue.' }
      ]
      symptomsList = [
        'High fever with chills, body aches, or persistent headache',
        'Chronic cough, sore throat, or chest congestion',
        'Uncontrolled blood pressure or erratic blood sugar readings',
        'Persistent acidity, burning sensation in chest/stomach, or nausea',
        'Generalized weakness, unexplained weight changes, or chronic fatigue'
      ]
      testIdentifiers = [
        'basic-full-body-checkup',
        'TST0176', // Complete Blood Count (CBC)
        'TST0335', // HbA1c (HPLC)
        'TST0433', // Lipid Profile
        'TST0313', // Glucose Fasting
        'TST0427', // Liver Function Test (LFT)
        'TST0625', // Urea & Creatinine
      ]
      break

    case 'dr-susovan-patra':
      whyConsult = [
        {
          title: 'Interventional Pain Medicine Specialist',
          desc: '9+ years experience specializing in modern minimally invasive interventions for stubborn chronic spine, joint, and nerve pain.'
        },
        {
          title: 'Avoid Surgery with Precision Interventions',
          desc: 'Targeted nerve blocks, epidural injections, and radiofrequency ablation for chronic spine and joint conditions.'
        },
        {
          title: 'Comprehensive Neuropathic Pain Relief',
          desc: 'Specialized protocols for trigeminal neuralgia, post-herpetic neuralgia, diabetic nerve pain, and fibromyalgia.'
        },
        {
          title: 'Multi-Disciplinary Spine & Joint Rehabilitation',
          desc: 'Combining medication, precision interventions, and physical therapies for long-lasting pain-free mobility.'
        }
      ]
      problemsTreated = [
        { condition: 'Chronic Lower Back Pain & Sciatica', description: 'Precision therapies for slipped discs, facet joint arthritis, and spinal stenosis.' },
        { condition: 'Neck Pain, Cervical Spondylosis & Headache', description: 'Relief for occipital neuralgia, cervical facet pain, and tension headaches.' },
        { condition: 'Knee & Shoulder Chronic Joint Pain', description: 'Intra-articular injections and regenerative therapies to delay joint replacement.' },
        { condition: 'Trigeminal Neuralgia & Facial Pain', description: 'Targeted nerve pain control for excruciating facial and nerve pain.' },
        { condition: 'Fibromyalgia & Generalized Body Pain', description: 'Multimodal therapy to restore sleep, calm pain sensitivity, and reduce stiffness.' },
        { condition: 'Cancer Pain & Palliative Management', description: 'Specialized opioid titration and neurolytic blocks for compassionate cancer care.' }
      ]
      symptomsList = [
        'Persistent back or neck pain lasting more than 3 months despite medications',
        'Electric-shock like pain shooting down the leg, arm, or face',
        'Severe joint pain that interferes with daily walking or sleep',
        'Constant burning, pins-and-needles sensation in feet or hands',
        'Widespread muscle tender points, exhaustion, and morning stiffness'
      ]
      testIdentifiers = [
        'advanced-spine-joint-nerve-pain-package',
        'TST0682', // Vitamin D3 (25-OH)
        'TST0677', // Vitamin B12
        'TST0525', // RA Factor
        'TST0222', // CRP Quantitative
      ]
      break

    case 'dr-sankhasubhra-chatterjee':
      whyConsult = [
        {
          title: 'UK Certified in Diabetes & Dementia Care',
          desc: 'MD Psychiatry Resident with international accreditations from RCGP UK (Diabetes) and University of Bradford UK (Dementia).'
        },
        {
          title: 'Integrated Mind-Body Diagnostic Precision',
          desc: 'Specialized focus on cognitive health, mood disorders, metabolic syndrome, and geriatric memory evaluation.'
        },
        {
          title: 'Holistic Management of Chronic Conditions',
          desc: 'Personalized treatment protocols combining lifestyle adjustments, cognitive therapy, and evidence-based medicine.'
        },
        {
          title: 'Patient-Centered Primary Healthcare',
          desc: 'Compassionate consultation with accessible telemedicine and in-clinic appointments at Bankra Bazar.'
        }
      ]
      problemsTreated = [
        { condition: 'Memory Loss & Early Dementia Care', description: 'Comprehensive clinical and biochemical staging for Alzheimer\'s and vascular dementia.' },
        { condition: 'Diabetes Mellitus & Metabolic Syndrome', description: 'Precision glycemic control and prevention of micro/macro-vascular damage.' },
        { condition: 'Depression, Anxiety & Mood Disorders', description: 'Evidence-based psychiatric evaluation and neuro-metabolic stabilization.' },
        { condition: 'Diabetic Neuropathy & Brain Fog', description: 'Diagnostic workup for nerve pain, chronic fatigue, and cognitive sluggishness.' },
        { condition: 'Hypertension & Lifestyle Diseases', description: 'Blood pressure control and organ protection for working professionals and seniors.' }
      ]
      symptomsList = [
        'Frequent forgetfulness, confusion, or difficulty recalling recent conversations',
        'Persistent low mood, lack of interest, severe anxiety, or sleep disturbances',
        'Uncontrolled fasting or post-meal blood sugar levels with constant fatigue',
        'Burning, tingling sensations in hands or feet (diabetic nerve strain)',
        'Unexplained cognitive brain fog, dizziness, or generalized exhaustion'
      ]
      testIdentifiers = [
        'neuro-metabolic-memory-wellness-package',
        'TST0677', // Vitamin B12
        'TST0596', // Thyroid Profile (T3, T4, TSH)
        'TST0335', // HbA1c (HPLC)
        'TST0427', // Liver Function Test (LFT)
      ]
      break

    case 'dr-priti-medda':
      whyConsult = [
        {
          title: 'Dedicated Obstetrician & Gynecologist',
          desc: 'Senior resident with specialized training in high-risk obstetrics, prenatal care, and gynecological disorders.'
        },
        {
          title: 'PCOD / PCOS & Hormonal Balance Specialist',
          desc: 'Holistic clinical management combining medical therapy, metabolic control, and lifestyle guidance.'
        },
        {
          title: 'Compassionate Antenatal & Postnatal Care',
          desc: 'Step-by-step guidance for expecting mothers, fetal monitoring, prenatal screenings, and safe delivery planning.'
        },
        {
          title: 'Female Infertility & Reproductive Wellness',
          desc: 'Thorough evaluation of ovulation, tubal health, and reproductive hormones for couples planning pregnancy.'
        }
      ]
      problemsTreated = [
        { condition: 'Irregular Periods & PCOD / PCOS', description: 'Hormone balancing for missed cycles, heavy bleeding, and ovarian cysts.' },
        { condition: 'Antenatal Care & High-Risk Pregnancy', description: 'Routine trimester screening, gestational diabetes, and preeclampsia prevention.' },
        { condition: 'Pelvic Pain & Vaginal Infections', description: 'Diagnosis and relief for chronic pelvic inflammatory disease (PID) and infections.' },
        { condition: 'Infertility & Conception Counseling', description: 'Comprehensive diagnostic workup for primary and secondary infertility.' },
        { condition: 'Uterine Fibroids & Endometriosis', description: 'Medical management of painful cramps, heavy bleeding, and pelvic pain.' },
        { condition: 'Menopause & Perimenopausal Health', description: 'Relief for hot flashes, mood fluctuations, bone density loss, and night sweats.' }
      ]
      symptomsList = [
        'Delayed, irregular, painful, or unusually heavy menstrual bleeding',
        'Positive home pregnancy test requiring antenatal registration and ultrasound guidance',
        'Chronic lower abdominal pain, burning during urination, or abnormal white discharge',
        'Difficulty conceiving after 6 to 12 months of active trying',
        'Sudden facial hair growth, severe acne, or stubborn weight gain (PCOS signs)'
      ]
      testIdentifiers = [
        'pcos-hormonal-women-wellness-package',
        'TST0596', // Thyroid Profile (T3, T4, TSH)
        'TST0429', // LH (Lutenising Hormone)
        'TST0120', // Beta HCG
        'TST0176', // Complete Blood Count (CBC)
      ]
      break

    case 'dr-debdeep-karak':
      whyConsult = [
        {
          title: 'Attached to SSKM Hospital Kolkata',
          desc: 'Renowned orthopedic surgeon associated with IPGMER & SSKM Hospital, bringing premier tertiary care expertise to Bankra.'
        },
        {
          title: 'Joint Preservation & Arthritis Specialist',
          desc: 'Modern non-surgical and surgical protocols for knee osteoarthritis, hip pain, and degenerative joint conditions.'
        },
        {
          title: 'Trauma, Fracture & Sports Injury Care',
          desc: 'Advanced fracture management, ligament injuries, meniscus tears, and shoulder dislocations.'
        },
        {
          title: 'Spine & Sciatica Management',
          desc: 'Targeted medical and rehabilitation therapies for herniated discs, cervical spondylosis, and sciatica.'
        }
      ]
      problemsTreated = [
        { condition: 'Knee Osteoarthritis & Joint Pain', description: 'Advanced pain relief, joint injections, and surgical evaluation for severe arthritis.' },
        { condition: 'Lower Back Pain & Slipped Disc', description: 'Diagnosis of lumbar disc herniation, sciatica, and postural spine strain.' },
        { condition: 'Neck Pain & Cervical Spondylosis', description: 'Therapies for radiating arm pain, stiffness, and cervical disc problems.' },
        { condition: 'Fractures, Sprains & Dislocations', description: 'Post-trauma bone healing, plaster casting, and orthopedic trauma care.' },
        { condition: 'Frozen Shoulder & Rotator Cuff Injury', description: 'Restoration of shoulder mobility and targeted physical rehabilitation.' },
        { condition: 'Osteoporosis & Weak Bones', description: 'Bone mineral density optimization and fracture risk reduction in seniors.' }
      ]
      symptomsList = [
        'Persistent knee pain, swelling, stiffness, or clicking sounds while walking',
        'Severe lower back pain radiating down the leg (sciatica)',
        'Inability to lift the arm overhead or severe shoulder pain at night',
        'Acute pain, swelling, and inability to bear weight after a fall or twist',
        'Morning joint stiffness lasting more than 30 minutes'
      ]
      testIdentifiers = [
        'orthopedic-bone-density-joint-package',
        'TST0682', // Vitamin D3 (25-OH)
        'TST0168', // Calcium (Serum)
        'TST0629', // Uric Acid (Serum)
        'TST0525', // RA Factor
      ]
      break

    case 'dr-eureka-abida-laskar':
      whyConsult = [
        {
          title: 'Resident in Critical Care (Desun Hospital)',
          desc: 'Clinical training in acute patient stabilization, intensive care triage, and emergency medicine.'
        },
        {
          title: 'Certified in Diabetes Management (CCEBDM)',
          desc: 'Dedicated protocols for early blood sugar control, insulin initiation, and lifestyle disease prevention.'
        },
        {
          title: 'Rapid Fever & Infection Triage',
          desc: 'Fast diagnosis of dengue, typhoid, viral fevers, urinary infections, and acute respiratory illnesses.'
        },
        {
          title: 'Accessible Care with Evening Clinic Hours',
          desc: 'Convenient evening physical consultation (7:30 PM - 9:30 PM) at Bankra Bazar center with on-call support.'
        }
      ]
      problemsTreated = [
        { condition: 'Acute Fevers & Seasonal Infections', description: 'Immediate diagnosis of dengue, malaria, typhoid, and acute viral syndromes.' },
        { condition: 'Diabetes Mellitus & Sugar Spikes', description: 'CCEBDM-certified glycemic stabilization and dietary counseling.' },
        { condition: 'Urinary Tract Infections (UTI)', description: 'Targeted antibiotic therapy and symptom relief for painful urination.' },
        { condition: 'Acute Bronchitis & Respiratory Infections', description: 'Nebulization, cough management, and chest infection triage.' },
        { condition: 'Severe Weakness & Dehydration', description: 'Vitals stabilization, electrolyte replenishment, and recovery protocols.' }
      ]
      symptomsList = [
        'High fever with chills, body ache, or intense headache lasting over 2 days',
        'Sudden rise in blood sugar levels with dizziness or dehydration',
        'Burning sensation while urinating, cloudy urine, or lower abdominal pain',
        'Persistent cough, throat congestion, or difficulty breathing',
        'Extreme weakness, low blood pressure, or fainting episodes'
      ]
      testIdentifiers = [
        'acute-infection-immunity-fever-package',
        'TST0176', // Complete Blood Count (CBC)
        'TST0243', // Dengue ELISA NS1 Antigen
        'TST0222', // CRP Quantitative
        'TST0691', // Widal Test (Slide Method)
      ]
      break

    case 'dr-wasim-karim':
      whyConsult = [
        {
          title: 'Fellowship Trained in Internal Medicine & Diabetology',
          desc: 'Specialized fellowships in Diabetology (FDM), Critical Care (CCCM London), and Internal Medicine.'
        },
        {
          title: 'Holistic Diabetes Reversal & Control Protocols',
          desc: 'Customized dietary guidance, oral drug titration, and insulin management to reverse early diabetes and protect organs.'
        },
        {
          title: 'Critical Care & Emergency Medicine Triage',
          desc: 'Acute medical management for diabetic ketoacidosis, glycemic crashes, severe hypertension, and sepsis.'
        },
        {
          title: 'Diabetic Foot & Neuropathy Screening',
          desc: 'Early detection of nerve damage, peripheral artery disease, and diabetic nephropathy.'
        }
      ]
      problemsTreated = [
        { condition: 'Type 1 & Type 2 Diabetes Mellitus', description: 'Precision glycemic control and tailored medication/insulin therapies.' },
        { condition: 'Prediabetes & Metabolic Syndrome', description: 'Lifestyle interventions to normalize insulin sensitivity and reverse borderline sugar.' },
        { condition: 'Diabetic Neuropathy & Foot Care', description: 'Management of burning feet, numbness, and tingling sensations.' },
        { condition: 'Diabetic Kidney Disease (Nephropathy)', description: 'Early detection and kidney protection protocols for diabetic patients.' },
        { condition: 'Uncontrolled Hypertension with Diabetes', description: 'Dual management to lower heart attack and stroke risks.' },
        { condition: 'Acute Medical Illnesses & Critical Care', description: 'Emergency triage for high-grade infections, dehydration, and acute decompensation.' }
      ]
      symptomsList = [
        'Persistent high fasting or post-meal blood sugar levels',
        'Frequent urination, constant excessive thirst, and sudden weight loss',
        'Burning, tingling, or numbness in toes, feet, or fingers',
        'Slow healing of small wounds, cuts, or skin boils',
        'Recurrent urinary tract or fungal skin infections'
      ]
      testIdentifiers = [
        'advanced-diabetes-reversal-organ-shield',
        'TST0335', // HbA1c (HPLC)
        'TST0019', // ACR Microalbumin:Creatinine Ratio Spot
        'TST0433', // Lipid Profile
        'TST0313', // Glucose Fasting
      ]
      break

    case 'dr-wasim-aktar-sardar':
      whyConsult = [
        {
          title: 'Boston PGPN Certified Pediatric Nutritionist',
          desc: 'Trained from Boston University School of Medicine in advanced Pediatric Nutrition and infant metabolic care.'
        },
        {
          title: 'Neonatal & Newborn Intensive Care Specialist',
          desc: 'Specialized expertise in premature infant care, newborn jaundice, low birth weight, and critical neonatal transitions.'
        },
        {
          title: 'Scientific Approach to Child Growth & Immunity',
          desc: 'Evidence-based pediatric interventions focusing on gut health, allergy prevention, and balanced childhood development.'
        },
        {
          title: 'Accessible Care in Bankra & Howrah',
          desc: 'Regular consultation available at Bankra Bazar with assisted telemedicine support for nearby rural and urban communities.'
        }
      ]
      problemsTreated = [
        { condition: 'Neonatal Jaundice & Infant Care', description: 'Evaluation and monitoring of physiological and pathological neonatal jaundice.' },
        { condition: 'Low Birth Weight & Prematurity Care', description: 'Specialized neonatal developmental support, kangaroo mother care guidance, and feeding.' },
        { condition: 'Pediatric Food Allergies & Intolerance', description: 'Diagnosis of cow milk protein allergy (CMPA), lactose intolerance, and celiac risk.' },
        { condition: 'Recurrent Respiratory Infections', description: 'Care for childhood asthma, bronchiolitis, and chronic allergic cough.' },
        { condition: 'Nutritional Deficiencies (Rickets/Anemia)', description: 'Correcting Vitamin D3, Calcium, Iron, and Zinc deficiencies in children.' },
        { condition: 'Immunization & Travel Vaccines', description: 'Comprehensive immunization coverage conforming to national and international standards.' }
      ]
      symptomsList = [
        'Yellowish tint on baby skin, eyes, or face (Newborn Jaundice)',
        'Excessive crying after feeding, arching back, or excessive spit-up',
        'Slow weight gain or falling behind on infant growth curves',
        'Chronic wheezing, rapid breathing, or chest indrawing',
        'Frequent colds, throat infections, or poor immunity'
      ]
      testIdentifiers = [
        'neonatal-pediatric-allergy-nutrition-panel',
        'TST0130', // Bilirubin Total, Conj. & Unconj.
        'TST0387', // Total IgE
        'TST0176', // Complete Blood Count (CBC)
        'TST0682', // Vitamin D3 (25-OH)
      ]
      break

    case 'dr-parvez-ahmed-khan':
      whyConsult = [
        {
          title: 'Trained at NIH (Govt. of India)',
          desc: '16+ years experience with prestigious training from the National Institute of Homeopathy, Kolkata.'
        },
        {
          title: 'Root-Cause Holistic Healing',
          desc: 'Treating the whole person rather than just suppressing symptoms, promoting long-term constitutional balance.'
        },
        {
          title: 'Specialist in Chronic Skin & Respiratory Allergies',
          desc: 'Proven holistic remedies for stubborn eczema, psoriasis, chronic sinusitis, asthma, and allergic rhinitis.'
        },
        {
          title: 'Safe, Zero Side-Effect Natural Therapies',
          desc: 'Gentle medicines suitable for infants, elderly adults, and patients with sensitive metabolic systems.'
        }
      ]
      problemsTreated = [
        { condition: 'Chronic Skin Diseases (Eczema, Psoriasis)', description: 'Constitutional homeopathy to clear stubborn rashes, itching, and scaling.' },
        { condition: 'Allergic Rhinitis, Sinusitis & Asthma', description: 'Reducing hyper-reactivity to dust, cold, pollen, and seasonal triggers.' },
        { condition: 'Digestive Disorders & Chronic Acidity / IBS', description: 'Relief for chronic constipation, bloating, gas, and irregular bowel habits.' },
        { condition: 'Kidney Stones (Renal Calculi)', description: 'Non-invasive homeopathic protocols for stone passage and preventing recurrence.' },
        { condition: 'Hair Fall & Alopecia Areata', description: 'Restoring follicular health and addressing underlying stress and nutrient absorption.' },
        { condition: 'Childhood Recurrent Colds & Tonsillitis', description: 'Boosting natural pediatric immunity without frequent antibiotic courses.' }
      ]
      symptomsList = [
        'Recurring skin flare-ups, intense itching, red patches, or dry flaky skin',
        'Constant morning sneezing, running nose, nasal blockage, or sinus pressure',
        'Chronic indigestion, burning chest pain, or irregular bowel habits',
        'Flank pain with burning sensation during urination (suspected kidney stone)',
        'Frequent colds, throat infections, or swollen tonsils in children'
      ]
      testIdentifiers = [
        'holistic-allergy-inflammation-wellness-screen',
        'TST0387', // Total IgE
        'TST0010', // Absolute Eosinophil Count
        'TST0665', // Urine Routine Examination
        'TST0427', // Liver Function Test (LFT)
      ]
      break

    default:
      // Dr. Tooneer Mallik / Family Medicine / Primary Care fallback
      whyConsult = [
        {
          title: 'Comprehensive Family & Preventive Care',
          desc: `${doctor.experience || '5+ Years'} of dedicated clinical practice focusing on diagnostic precision and patient-centered treatment.`
        },
        {
          title: 'Accessible In-Clinic & Telemedicine Care',
          desc: 'Convenient consultation at Bankra Bazar center with assisted digital health follow-ups for families across Howrah.'
        },
        {
          title: 'Rational Medication & Evidence-Based Advice',
          desc: 'Focused on transparent medical guidance, lifestyle optimization, and preventing disease complications.'
        },
        {
          title: 'Affordable Healthcare for All Communities',
          desc: `Transparent consultation fee of ₹${doctor.consultationFee} with zero hidden charges.`
        }
      ]
      problemsTreated = [
        { condition: 'Viral Fevers & Seasonal Illnesses', description: 'Prompt evaluation of dengue, typhoid, influenza, and viral syndromes.' },
        { condition: 'Hypertension & Blood Pressure Control', description: 'Targeted blood pressure monitoring and medication adjustment.' },
        { condition: 'Diabetes Mellitus & Metabolic Health', description: 'Early blood sugar screening and comprehensive diabetes management.' },
        { condition: 'Gastric Disorders & Acid Peptic Disease', description: 'Treatment for chronic acidity, GERD, gas, and digestive distress.' },
        { condition: 'Respiratory Allergies & Bronchitis', description: 'Management of chronic cough, chest congestion, and wheezing.' },
        { condition: 'General Weakness & Nutritional Deficiencies', description: 'Diagnostic workups for anemia, vitamin deficiencies, and fatigue.' }
      ]
      symptomsList = [
        'Fever with body aches, chills, or headache lasting more than 3 days',
        'Persistent cough, sore throat, or chest congestion',
        'High blood pressure or abnormal blood test results requiring expert review',
        'Frequent indigestion, burning in stomach, or irregular bowel movements',
        'Generalized fatigue, dizziness, or loss of appetite'
      ]
      testIdentifiers = [
        'basic-full-body-checkup',
        'TST0176', // Complete Blood Count (CBC)
        'TST0433', // Lipid Profile
        'TST0313', // Glucose Fasting
        'TST0427', // Liver Function Test (LFT)
      ]
      break
  }

  const recommendedTests = resolveDoctorDiagnosticItems(testIdentifiers)

  const h1Title = `${doctor.name} - ${doctor.specialty} ${areaSuffix}`
  const subheading = `Book appointment with ${doctor.name} (${doctor.qualifications || 'Specialist'}, ${doctor.experience || 'Experienced'}). Available for physical consultation at Bankra Bazar Clinic and Assisted Telemedicine across ${currentArea} and nearby Howrah areas.`

  const seoTitle = `${doctor.name} - Best ${doctor.specialty} ${areaSuffix} (₹${doctor.consultationFee}) | Capsic Care`
  const seoDescription = `Book verified appointment with ${doctor.name} (${doctor.specialty}) ${areaSuffix}. ${doctor.designation} (${doctor.qualifications || 'Specialist'}, ${doctor.experience || 'Experienced'}). Consultation Fee: ₹${doctor.consultationFee}. In-clinic OPD at Bankra Bazar, Domjur & Assisted Telemedicine across Kona, Makardah, Santragachi, Howrah. Call/WhatsApp +91 8910260709.`

  const seoKeywords = [
    doctor.name,
    ...(doctor.id === 'dr-sanjay-kumar-dey' ? ['Dr. Sanjay Kumar Dey', 'Dr. Sanjoy Kumar Dey', 'Dr Sanjay Kumar Dey child specialist', 'Dr Sanjoy Kumar Dey pediatrician Howrah', 'Dr Sanjay Kumar Dey Dasnagar', 'Best child doctor in Howrah'] : []),
    `${doctor.name} in ${currentArea}`,
    `${doctor.name} appointment`,
    `${doctor.name} consultation fee`,
    `${doctor.name} Bankra Howrah`,
    `${doctor.specialty} in ${currentArea}`,
    `Best ${doctor.specialty} in ${currentArea}`,
    `Top ${doctor.specialty} Near ${currentArea}`,
    `${doctor.specialty} Doctor in Bankra & Nearby Areas`,
    `${doctor.specialty} Doctor Near Me`,
    `${doctor.specialty} in Domjur`,
    `${doctor.specialty} in Kona`,
    `${doctor.specialty} in Makardah`,
    `${doctor.specialty} in Santragachi`,
    `${doctor.specialty} in Salap`,
    `${doctor.specialty} in Andul`,
    `${doctor.specialty} in Baltikuri`,
    `${doctor.specialty} in Dasnagar`,
    `Doctor consultation fee ₹${doctor.consultationFee} Bankra`,
    `Doctor in Bankra Bazar Howrah`,
    `Capsic Care ${doctor.specialty}`,
    ...problemsTreated.slice(0, 4).map(p => `${p.condition} doctor in ${currentArea}`)
  ]

  const overview = `${doctor.name} is a highly accomplished ${doctor.specialty} with over ${doctor.experience || 'several years'} of dedicated clinical practice. Holding qualifications in ${doctor.qualifications || 'medicine'}, ${doctor.name} delivers trusted healthcare for patients across Bankra, Bankra Bazar, Kabar Para, Kona, Makardah, Domjur, Santragachi, Salap, and surrounding Howrah regions. Whether you require in-person clinical evaluation at our Bankra Bazar healthcare centre (${doctor.physicalDays ? `Physical: ${doctor.physicalDays} ${doctor.physicalTiming}` : 'by appointment'}) or convenient assisted telemedicine consultation (${doctor.telemedicineDays ? `Telemedicine: ${doctor.telemedicineDays} ${doctor.telemedicineTiming}` : 'available daily'}), ${doctor.name} ensures patient-first care, accurate diagnosis, and transparent treatment plans.`

  const consultationLocations = {
    clinicName: 'Capsic Care Healthcare & Diagnostic Centre',
    address: 'Bankra Bazar, Dewan Para Road, Domjur, Howrah – 711403 (Near Bankra Market)',
    consultationType: 'In-Clinic Physical Visit & Assisted Telemedicine',
    hours: doctor.physicalDays ? `${doctor.physicalDays} (${doctor.physicalTiming})` : (doctor.availability || 'Consultation by Appointment')
  }

  const serviceAreas = [
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
    'Howrah City'
  ]

  const faqs = [
    {
      question: `Where does ${doctor.name} consult in Bankra?`,
      answer: `${doctor.name} consults physically at Capsic Care Healthcare Centre located at Bankra Bazar, Dewan Para Road, Domjur, Howrah – 711403 (${doctor.physicalDays || 'regular clinic days'}: ${doctor.physicalTiming || 'by appointment'}). Patients from Bankra, Kabar Para, Kona, Makardah, Domjur, and Santragachi can also access assisted telemedicine appointments.`
    },
    {
      question: `What is the consultation fee for ${doctor.name}?`,
      answer: `The physical consultation fee for ${doctor.name} is ₹${doctor.physicalConsultationFee ?? doctor.consultationFee}${doctor.telemedicineConsultationFee ? ` (Telemedicine: ₹${doctor.telemedicineConsultationFee})` : ''}${doctor.followUpFee ? ` with follow-up fee of ₹${doctor.followUpFee}` : ''}. Capsic Care follows 100% transparent healthcare pricing with zero hidden charges or booking fees.`
    },
    {
      question: `How can I book an appointment with ${doctor.name}?`,
      answer: `You can book an appointment online through the Capsic Care website or directly by sending a WhatsApp message / calling +91 8910260709. Our local team will confirm your preferred time slot immediately.`
    },
    {
      question: `What conditions does ${doctor.name} specialize in treating?`,
      answer: `${doctor.name} specializes in ${doctor.specialty}, treating key conditions including ${problemsTreated.slice(0, 4).map(p => p.condition).join(', ')}, and providing expert preventive medical counseling.`
    },
    {
      question: `Can I get diagnostic tests done before or after consulting ${doctor.name}?`,
      answer: `Yes! Capsic Care provides complete diagnostic testing with free doorstep home sample collection across Bankra, Kona, Domjur, Makardah, Santragachi, and nearby areas. Reports are delivered on WhatsApp in 24 hours and can be shared directly with ${doctor.name} for treatment review.`
    }
  ]

  const doctorPageUrl = `https://capsic.in/doctors/${doctor.id}${areaName ? `-in-${areaName.toLowerCase().replace(/ /g, '-')}` : ''}`

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Physician',
        '@id': `https://capsic.in/doctors/${doctor.id}`,
        name: doctor.name,
        image: doctor.image ? `https://capsic.in${doctor.image}` : 'https://capsic.in/logo.png',
        medicalSpecialty: doctor.specialty,
        description: doctor.description,
        telephone: '+918910260709',
        priceRange: doctor.consultationFee > 0 ? `₹${doctor.consultationFee}` : 'Free',
        currenciesAccepted: 'INR',
        paymentAccepted: 'Cash, UPI, Debit Card, Credit Card',
        isAcceptingNewPatients: true,
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
        alumniOf: doctor.qualifications,
        knowsLanguage: doctor.languages || ['English', 'Bengali', 'Hindi'],
        worksFor: {
          '@type': 'MedicalClinic',
          name: 'Capsic Care Healthcare & Diagnostics',
          url: 'https://capsic.in',
          telephone: '+918910260709',
          address: {
            '@type': 'PostalAddress',
            streetAddress: 'Bankra Bazar, Dewan Para Road',
            addressLocality: 'Domjur, Howrah',
            postalCode: '711403',
            addressRegion: 'West Bengal',
            addressCountry: 'IN'
          }
        },
        areaServed: serviceAreas.map(area => ({
          '@type': 'AdministrativeArea',
          name: area
        })),
        aggregateRating: {
          '@type': 'AggregateRating',
          ratingValue: '4.9',
          reviewCount: '89',
          bestRating: '5',
          worstRating: '1'
        },
        availableService: (doctor.servicesOffered || ['OPD Consultation', 'Assisted Telemedicine']).map(s => ({
          '@type': 'MedicalTherapy',
          name: s
        })),
        hasOfferCatalog: {
          '@type': 'OfferCatalog',
          name: `${doctor.name} Consultation Services`,
          itemListElement: [
            {
              '@type': 'Offer',
              name: 'In-Clinic Physical Consultation',
              price: doctor.physicalConsultationFee ?? doctor.consultationFee,
              priceCurrency: 'INR',
              availability: 'https://schema.org/InStock'
            },
            ...(doctor.telemedicineConsultationFee ? [{
              '@type': 'Offer',
              name: 'Assisted Telemedicine Consultation',
              price: doctor.telemedicineConsultationFee,
              priceCurrency: 'INR',
              availability: 'https://schema.org/InStock'
            }] : [])
          ]
        }
      },
      {
        '@type': 'MedicalWebPage',
        '@id': `${doctorPageUrl}#webpage`,
        url: doctorPageUrl,
        name: seoTitle,
        description: seoDescription,
        about: {
          '@type': 'Physician',
          name: doctor.name
        },
        specialty: doctor.specialty
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
            name: 'Doctors',
            item: 'https://capsic.in/doctors'
          },
          {
            '@type': 'ListItem',
            position: 3,
            name: `${doctor.name} (${doctor.specialty})`,
            item: doctorPageUrl
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
    doctor,
    seoTitle,
    seoDescription,
    seoKeywords,
    h1Title,
    subheading,
    overview,
    whyConsult,
    problemsTreated,
    symptomsList,
    recommendedTests,
    consultationLocations,
    serviceAreas,
    faqs,
    jsonLd
  }
}
