/**
 * CENTRALIZED PRICING & DATA MANAGEMENT
 * All test, package, and pricing data is managed here
 * Any changes automatically update across the entire application
 */

export interface PricingItem {
  id: string
  name: string
  price: number
  mrp: number
  category: string
  description: string
  features?: string[]
}

// LAB TESTS - All pricing and details in one place
export const labTestsPricing: PricingItem[] = [
  {
    id: 'TST0071',
    name: 'Complete Blood Count (CBC)',
    price: 1056,
    mrp: 1980,
    category: 'Blood Work',
    description: 'Comprehensive blood count analysis including RBC, WBC, and platelets.',
    features: ['24 Parameters', 'Free Home Collection', 'Report in 24hrs'],
  },
  {
    id: 'TST0433',
    name: 'Lipid Profile',
    price: 440,
    mrp: 836,
    category: 'Cardiac Health',
    description: 'Check cholesterol levels and risk factors for heart disease.',
    features: ['7 Parameters', 'Free Home Collection', 'Report in 24hrs'],
  },
  {
    id: 'TST0596',
    name: 'Thyroid Profile (T3, T4, TSH)',
    price: 440,
    mrp: 814,
    category: 'Thyroid Panel',
    description: 'Evaluate thyroid hormone levels and thyroid function.',
    features: ['3 Parameters', 'Free Home Collection', 'Report in 24hrs'],
  },
  {
    id: 'TST0427',
    name: 'Liver Function Test (LFT)',
    price: 440,
    mrp: 814,
    category: 'Liver Health',
    description: 'Assessment of liver enzyme levels and liver function.',
    features: ['11 Parameters', 'Free Home Collection', 'Report in 24hrs'],
  },
  {
    id: 'TST0625',
    name: 'Urea & Creatinine (KFT)',
    price: 165,
    mrp: 308,
    category: 'Kidney Health',
    description: 'Evaluate kidney function and detect kidney disease.',
    features: ['2 Parameters', 'Free Home Collection', 'Report in 24hrs'],
  },
  {
    id: 'TST0682',
    name: 'Vitamin D Level (25-OH)',
    price: 708,
    mrp: 1316,
    category: 'Vitamin & Mineral',
    description: 'Check vitamin D levels to assess bone and immune health.',
    features: ['1 Parameter', 'Free Home Collection', 'Report in 24hrs'],
  },
  {
    id: 'TST0680',
    name: 'Vitamin B12',
    price: 3744,
    mrp: 6958,
    category: 'Vitamin & Mineral',
    description: 'Vital micronutrient for nerve health, brain function and red blood cell production.',
    features: ['1 Parameter', 'Free Home Collection', 'Report in 24hrs'],
  },
  {
    id: 'TST0335',
    name: 'HbA1c Test',
    price: 352,
    mrp: 649,
    category: 'Diabetes Screening',
    description: 'Measures average blood glucose levels over 3 months.',
    features: ['1 Parameter', 'Free Home Collection', 'Report in 24hrs'],
  },
  {
    id: 'TST0665',
    name: 'Urine Routine Examination',
    price: 88,
    mrp: 176,
    category: 'Routine Check',
    description: 'Complete urinalysis to detect infections and abnormalities.',
    features: ['18 Parameters', 'Free Home Collection', 'Report in 24hrs'],
  },
  {
    id: 'TST0408',
    name: 'Iron Profile',
    price: 748,
    mrp: 1408,
    category: 'Mineral Health',
    description: 'Assess iron levels and detect iron deficiency anemia.',
    features: ['4 Parameters', 'Free Home Collection', 'Report in 24hrs'],
  },
  {
    id: 'TST0617',
    name: 'Troponin I Quantitative',
    price: 748,
    mrp: 1408,
    category: 'Cardiac Health',
    description: 'High-sensitivity quantitative marker for acute cardiac risk triage.',
    features: ['1 Parameter', 'Free Home Collection', 'Report in 24hrs'],
  },
  {
    id: 'TST0211',
    name: 'Dengue NS1 Antigen',
    price: 396,
    mrp: 748,
    category: 'Infection & Fever',
    description: 'Early detection marker for acute dengue viral infection.',
    features: ['Rapid ELISA / Chemiluminescence', 'Free Home Collection', 'Report in 24hrs'],
  },
  {
    id: 'TST0512',
    name: 'RA (Rheumatoid) Factor',
    price: 352,
    mrp: 649,
    category: 'Joints & Arthritis',
    description: 'Immunological marker for rheumatoid arthritis and joint inflammation.',
    features: ['1 Parameter', 'Free Home Collection', 'Report in 24hrs'],
  },
  {
    id: 'TST0133',
    name: 'CRP Quantitative',
    price: 880,
    mrp: 1639,
    category: 'Inflammation & Immunity',
    description: 'C-Reactive Protein quantitative measurement for systemic inflammation.',
    features: ['1 Parameter', 'Free Home Collection', 'Report in 24hrs'],
  },
]

// HEALTH PACKAGES - Bundle of tests with transparent discounts
export const healthPackagesPricing: PricingItem[] = [
  {
    id: 'PKG001',
    name: 'Basic Full Body Check-Up',
    price: 769,
    mrp: 1884,
    category: 'Full Body Checkup',
    description: 'Stay Ahead. Stay Healthy. 7 vital tests covering Heart, Liver, Kidney, Thyroid, Blood Count & Blood Sugar.',
    features: ['7 Essential Tests', 'CBC, FBS, Lipid, LFT, Urea, Creatinine, TSH', 'Free Home Collection', 'Reports in 24hrs'],
  },
  {
    id: 'PKG002',
    name: 'Diabetes & Sugar Care Package',
    price: 769,
    mrp: 1815,
    category: 'Diabetes Screening',
    description: 'শুধু Sugar দেখবেন না— নিয়ন্ত্রণে আছে কি না জানুন। Complete 3-Month average control and cardiac check.',
    features: ['4 Essential Tests', 'Fasting Sugar, PPBS, 3-Month HbA1c, Lipid Profile', 'Free Home Collection', 'Reports in 24hrs'],
  },
  {
    id: 'PKG003',
    name: 'Thyroid & Wellness Check Package',
    price: 549,
    mrp: 1418,
    category: 'Thyroid & Wellness',
    description: 'Small gland, big impact on your health. Complete Thyroid Assessment (T3, T4, TSH) with CBC and Hemoglobin.',
    features: ['3 Essential Tests', 'Thyroid Profile (T3, T4, TSH), CBC, Hb%', 'Free Home Collection', 'Reports in 24hrs'],
  },
  {
    id: 'PKG004',
    name: 'Heart & Metabolic Check Package',
    price: 879,
    mrp: 2067,
    category: 'Cardiovascular & Metabolic',
    description: 'Heart Health + Sugar + Cholesterol. Take a step today for a healthier tomorrow!',
    features: ['4 Essential Tests', 'Lipid Profile, Fasting Sugar, HbA1c, Kidney Creatinine', 'Free Home Collection', 'Reports in 24hrs'],
  },
  {
    id: 'PKG005',
    name: 'Vitamin & Energy Check Package',
    price: 1200,
    mrp: 3119,
    category: 'Vitamins & Energy',
    description: 'বার-বার ক্লান্তি, দুর্বলতা? জানুন আপনার Vitamin Levels! More Energy. Better Everyday!',
    features: ['4 Essential Tests', 'Vitamin B12, Vitamin D3, Serum Calcium, CBC', 'Free Home Collection', 'Reports in 24hrs'],
  },
  {
    id: 'PKG006',
    name: 'Comprehensive Healthy Heart & Cardiac Risk Profile',
    price: 1154,
    mrp: 3190,
    category: 'Cardiology & Heart Care',
    description: 'কার্ডিয়াক ও হার্ট কেয়ার প্যাকেজ। Complete cardiovascular, troponin, lipid, and metabolic risk evaluation.',
    features: ['7 Vital Tests', 'Lipid Profile, Troponin-I, Fasting Sugar, HbA1c, Urea/Creatinine, Electrolytes, CBC', 'Free Home Collection', 'Reports in 24hrs'],
  },
  {
    id: 'PKG007',
    name: 'Advanced Spine, Joint & Nerve Pain Care Package',
    price: 1319,
    mrp: 3520,
    category: 'Pain Medicine & Joints',
    description: 'স্পাইন, জয়েন্ট ও নার্ভ পেইন কেয়ার। Complete diagnostic screening for chronic spine, knee, joint and nerve pain.',
    features: ['8 Essential Tests', 'Vitamin D3, Vitamin B12, Calcium, Uric Acid, RA Factor, CRP, ESR, CBC', 'Free Home Collection', 'Reports in 24hrs'],
  },
  {
    id: 'PKG008',
    name: 'Neuro-Metabolic & Memory Wellness Profile',
    price: 1429,
    mrp: 3740,
    category: 'Neuro-Psychiatry & Dementia',
    description: 'ব্রেন, স্মৃতিশক্তি ও মেটাবলিক স্বাস্থ্য। Comprehensive brain vitality, memory, dementia risk and metabolic balance.',
    features: ['9 Vital Tests', 'Vitamin B12, Vitamin D3, Thyroid Profile, HbA1c, Fasting Sugar, Lipid, LFT, KFT, Electrolytes', 'Free Home Collection', 'Reports in 24hrs'],
  },
  {
    id: 'PKG009',
    name: 'PCOS, Hormonal & Women Wellness Complete Package',
    price: 1154,
    mrp: 3410,
    category: 'Women Health & Gynecology',
    description: 'নারী স্বাস্থ্য ও পিসিওডি কেয়ার প্যাকেজ। Complete hormonal balance, fertility, and reproductive health evaluation.',
    features: ['8 Essential Tests', 'Thyroid Profile, LH, FSH, Prolactin, CBC with Hb%, Fasting Glucose, Urine Routine, Calcium', 'Free Home Collection', 'Reports in 24hrs'],
  },
  {
    id: 'PKG010',
    name: 'Orthopedic Bone Density & Joint Health Screening',
    price: 1099,
    mrp: 3135,
    category: 'Orthopedics & Bone Health',
    description: 'অস্থি ও জয়েন্ট স্বাস্থ্য প্যাকেজ। Comprehensive bone mineral density, arthritis, and cartilage health assessment.',
    features: ['8 Essential Tests', 'Vitamin D3, Calcium, Phosphorus, Uric Acid, Alkaline Phosphatase, RA Factor, ESR, CBC', 'Free Home Collection', 'Reports in 24hrs'],
  },
  {
    id: 'PKG011',
    name: 'Acute Infection, Immunity & Fever Screening Profile',
    price: 934,
    mrp: 2640,
    category: 'Critical Care & Fever Triage',
    description: 'ইনফেকশন ও ফিভার কেয়ার প্যাকেজ। Rapid multi-pathogen screening for dengue, typhoid, bacterial infections, and acute fevers.',
    features: ['7 Fast Triage Tests', 'CBC with Differential, ESR, CRP, Dengue NS1, Widal Typhoid, Urine Routine, Glucose', 'Free Home Collection', 'Reports in 24hrs'],
  },
  {
    id: 'PKG012',
    name: 'Advanced Diabetes Reversal & Vital Organ Shield',
    price: 1264,
    mrp: 3630,
    category: 'Diabetes & Organ Care',
    description: 'সম্পূর্ণ ডায়াবেটিস ও অর্গান শিল্ড। Precision glycemic reversal monitoring with kidney, liver and cardiovascular protection.',
    features: ['7 Advanced Tests', 'Fasting Sugar, PPBS, 3-Month HbA1c, Urine Microalbumin:Creatinine Ratio, Lipid, Creatinine, LFT', 'Free Home Collection', 'Reports in 24hrs'],
  },
  {
    id: 'PKG013',
    name: 'Senior Citizen Comprehensive Chronic Disease & Vital Health Checkup',
    price: 1429,
    mrp: 3960,
    category: 'Senior Citizen & Geriatric',
    description: 'সিনিয়র সিটিজেন কমপ্লিট হেলথ কেয়ার। Annual multi-system health checkup for senior citizens and chronic condition surveillance.',
    features: ['8 Comprehensive Tests', 'CBC with ESR, Fasting Glucose, HbA1c, Lipid Profile, LFT, KFT (Kidney), Thyroid TSH, Urine Routine', 'Free Home Collection', 'Reports in 24hrs'],
  },
  {
    id: 'PKG014',
    name: 'Junior Wellness & Child Growth Immunity Profile',
    price: 1044,
    mrp: 2860,
    category: 'Pediatrics & Child Care',
    description: 'শিশু স্বাস্থ্য ও পুষ্টি প্রোফাইল। Complete pediatric growth, nutrition, bone strength and anemia screening.',
    features: ['7 Child Health Tests', 'CBC with Hb%, Vitamin D3, Serum Calcium, Serum Ferritin, Urine Routine, Blood Group, TSH', 'Free Home Collection', 'Reports in 24hrs'],
  },
  {
    id: 'PKG015',
    name: 'Neonatal & Pediatric Allergy & Nutrition Panel',
    price: 1099,
    mrp: 3025,
    category: 'Pediatric Nutrition & Allergies',
    description: 'শিশু পুষ্টি ও অ্যালার্জি প্যানেল। Targeted newborn jaundice, food allergy, eczema, and micronutrient screening.',
    features: ['6 Specialized Tests', 'CBC with AEC, Total IgE, Bilirubin Total & Direct, Serum Calcium, Vitamin D3, Urine Routine', 'Free Home Collection', 'Reports in 24hrs'],
  },
  {
    id: 'PKG016',
    name: 'Holistic Allergy & Chronic Inflammation Wellness Screen',
    price: 989,
    mrp: 2750,
    category: 'Allergy & Holistic Health',
    description: 'হোলিস্টিক অ্যালার্জি ও ইনফ্লামেশন স্ক্রিন। Root-cause diagnostic evaluation for recurring allergies, asthma, and kidney stone risk.',
    features: ['6 Targeted Tests', 'Total IgE, Absolute Eosinophil Count, CBC, ESR, Routine Urine Analysis, LFT', 'Free Home Collection', 'Reports in 24hrs'],
  },
]

// UTILITY FUNCTIONS - To calculate discounts and generate data
export function getDiscount(mrp: number, price: number): number {
  return Math.round(((mrp - price) / mrp) * 100)
}

export function getSavings(mrp: number, price: number): number {
  return mrp - price
}

export function getAllTests() {
  return labTestsPricing.map((test) => ({
    ...test,
    discount: getDiscount(test.mrp, test.price),
    savings: getSavings(test.mrp, test.price),
  }))
}

export function getAllPackages() {
  return healthPackagesPricing.map((pkg) => ({
    ...pkg,
    discount: getDiscount(pkg.mrp, pkg.price),
    savings: getSavings(pkg.mrp, pkg.price),
  }))
}

export function getTestById(id: string) {
  const test = labTestsPricing.find((t) => t.id === id)
  if (!test) return null
  return {
    ...test,
    discount: getDiscount(test.mrp, test.price),
    savings: getSavings(test.mrp, test.price),
  }
}

export function getPackageById(id: string) {
  const pkg = healthPackagesPricing.find((p) => p.id === id)
  if (!pkg) return null
  return {
    ...pkg,
    discount: getDiscount(pkg.mrp, pkg.price),
    savings: getSavings(pkg.mrp, pkg.price),
  }
}
