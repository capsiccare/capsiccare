import { createAdminClient } from '@/lib/supabase/admin'

interface MedicineSeed {
  generic_name: string
  brand_name: string
  manufacturer?: string
  dosage_form: 'tablet' | 'capsule' | 'syrup' | 'injection' | 'ointment' | 'drops' | 'inhaler' | 'powder' | 'lotion'
  strength: string
  strength_unit?: string
  route?: 'oral' | 'topical' | 'iv' | 'im' | 'inhalation' | 'ophthalmic' | 'otic' | 'nasal'
  therapeutic_class: string
  schedule_category?: 'OTC' | 'Schedule H' | 'Schedule H1' | 'Schedule X' | 'Schedule G'
  is_essential?: boolean
}

const MEDICINES_DATABASE: MedicineSeed[] = [
  // --- ANALGESICS, ANTIPYRETICS & NSAIDS ---
  { generic_name: 'Paracetamol', brand_name: 'Dolo 650', manufacturer: 'Micro Labs', dosage_form: 'tablet', strength: '650mg', therapeutic_class: 'Analgesic / Antipyretic', schedule_category: 'OTC', is_essential: true },
  { generic_name: 'Paracetamol', brand_name: 'Calpol 500', manufacturer: 'GSK', dosage_form: 'tablet', strength: '500mg', therapeutic_class: 'Analgesic / Antipyretic', schedule_category: 'OTC', is_essential: true },
  { generic_name: 'Paracetamol', brand_name: 'Crocin 650 Advance', manufacturer: 'GSK', dosage_form: 'tablet', strength: '650mg', therapeutic_class: 'Analgesic / Antipyretic', schedule_category: 'OTC', is_essential: true },
  { generic_name: 'Aceclofenac + Paracetamol', brand_name: 'Zerodol-P', manufacturer: 'Ipca Laboratories', dosage_form: 'tablet', strength: '100mg + 325mg', therapeutic_class: 'NSAID / Analgesic', schedule_category: 'Schedule H', is_essential: true },
  { generic_name: 'Aceclofenac + Paracetamol', brand_name: 'Hifenac-P', manufacturer: 'Intas Pharma', dosage_form: 'tablet', strength: '100mg + 325mg', therapeutic_class: 'NSAID / Analgesic', schedule_category: 'Schedule H' },
  { generic_name: 'Aceclofenac + Paracetamol + Serratiopeptidase', brand_name: 'Zerodol-SP', manufacturer: 'Ipca Laboratories', dosage_form: 'tablet', strength: '100mg + 325mg + 15mg', therapeutic_class: 'Anti-inflammatory / Proteolytic Enzyme', schedule_category: 'Schedule H' },
  { generic_name: 'Ibuprofen + Paracetamol', brand_name: 'Combiflam', manufacturer: 'Sanofi India', dosage_form: 'tablet', strength: '400mg + 325mg', therapeutic_class: 'NSAID / Analgesic', schedule_category: 'Schedule H', is_essential: true },
  { generic_name: 'Diclofenac Sodium', brand_name: 'Voveran 50', manufacturer: 'Novartis', dosage_form: 'tablet', strength: '50mg', therapeutic_class: 'NSAID / Anti-arthritic', schedule_category: 'Schedule H' },
  { generic_name: 'Diclofenac Sodium Injection', brand_name: 'Voveran 75 AQ', manufacturer: 'Novartis', dosage_form: 'injection', strength: '75mg/ml', route: 'im', therapeutic_class: 'NSAID / Acute Pain', schedule_category: 'Schedule H' },
  { generic_name: 'Tramadol + Paracetamol', brand_name: 'Ultracet', manufacturer: 'Janssen', dosage_form: 'tablet', strength: '37.5mg + 325mg', therapeutic_class: 'Opioid Analgesic Combination', schedule_category: 'Schedule H1' },
  { generic_name: 'Naproxen', brand_name: 'Naprosyn 500', manufacturer: 'RPG Life Sciences', dosage_form: 'tablet', strength: '500mg', therapeutic_class: 'NSAID / Musculoskeletal', schedule_category: 'Schedule H' },
  { generic_name: 'Mefenamic Acid + Dicyclomine', brand_name: 'Meftal-Spas', manufacturer: 'Blue Cross', dosage_form: 'tablet', strength: '250mg + 10mg', therapeutic_class: 'Antispasmodic / Analgesic', schedule_category: 'Schedule H' },
  { generic_name: 'Drotaverine Hydrochloride', brand_name: 'Drotin DS', manufacturer: 'Martin & Brown', dosage_form: 'tablet', strength: '80mg', therapeutic_class: 'Smooth Muscle Relaxant / Antispasmodic', schedule_category: 'Schedule H' },
  { generic_name: 'Ketorolac Tromethamine', brand_name: 'Ketanov DT', manufacturer: 'Sun Pharma', dosage_form: 'tablet', strength: '10mg', therapeutic_class: 'NSAID / Post-op & Dental Pain', schedule_category: 'Schedule H' },
  { generic_name: 'Etoricoxib', brand_name: 'Nucoxia 90', manufacturer: 'Zydus Cadila', dosage_form: 'tablet', strength: '90mg', therapeutic_class: 'COX-2 Selective Inhibitor', schedule_category: 'Schedule H' },
  { generic_name: 'Etoricoxib', brand_name: 'Arcoxia 60', manufacturer: 'MSD', dosage_form: 'tablet', strength: '60mg', therapeutic_class: 'COX-2 Selective Inhibitor', schedule_category: 'Schedule H' },
  { generic_name: 'Thiocolchicoside + Aceclofenac', brand_name: 'Zerodol-TH 4', manufacturer: 'Ipca Laboratories', dosage_form: 'tablet', strength: '4mg + 100mg', therapeutic_class: 'Muscle Relaxant + NSAID', schedule_category: 'Schedule H' },

  // --- GASTROENTEROLOGY & ACID-PEPTIC ---
  { generic_name: 'Pantoprazole', brand_name: 'Pan 40', manufacturer: 'Alkem Laboratories', dosage_form: 'tablet', strength: '40mg', therapeutic_class: 'Proton Pump Inhibitor (PPI)', schedule_category: 'Schedule H', is_essential: true },
  { generic_name: 'Pantoprazole + Domperidone SR', brand_name: 'Pan-D', manufacturer: 'Alkem Laboratories', dosage_form: 'capsule', strength: '40mg + 30mg', therapeutic_class: 'PPI + Prokinetic', schedule_category: 'Schedule H', is_essential: true },
  { generic_name: 'Pantoprazole + Domperidone SR', brand_name: 'Pantocid-D SR', manufacturer: 'Sun Pharma', dosage_form: 'capsule', strength: '40mg + 30mg', therapeutic_class: 'PPI + Prokinetic', schedule_category: 'Schedule H' },
  { generic_name: 'Rabeprazole', brand_name: 'Rablet 20', manufacturer: 'Lupin', dosage_form: 'tablet', strength: '20mg', therapeutic_class: 'Proton Pump Inhibitor (PPI)', schedule_category: 'Schedule H' },
  { generic_name: 'Rabeprazole + Domperidone SR', brand_name: 'Razo-D', manufacturer: 'Dr. Reddy’s', dosage_form: 'capsule', strength: '20mg + 30mg', therapeutic_class: 'PPI + Prokinetic', schedule_category: 'Schedule H' },
  { generic_name: 'Rabeprazole + Levosulpiride SR', brand_name: 'Rablet-L', manufacturer: 'Lupin', dosage_form: 'capsule', strength: '20mg + 75mg', therapeutic_class: 'PPI + Antipsychotic Prokinetic', schedule_category: 'Schedule H' },
  { generic_name: 'Omeprazole', brand_name: 'Omez 20', manufacturer: 'Dr. Reddy’s', dosage_form: 'capsule', strength: '20mg', therapeutic_class: 'Proton Pump Inhibitor (PPI)', schedule_category: 'Schedule H', is_essential: true },
  { generic_name: 'Esomeprazole', brand_name: 'Nexpro 40', manufacturer: 'Torrent Pharma', dosage_form: 'tablet', strength: '40mg', therapeutic_class: 'Proton Pump Inhibitor (PPI)', schedule_category: 'Schedule H' },
  { generic_name: 'Sucralfate + Oxetacaine', brand_name: 'Sucrafil O Gel', manufacturer: 'Fourrts India', dosage_form: 'syrup', strength: '1000mg + 20mg / 10ml', therapeutic_class: 'Mucosal Protectant / Local Anesthetic', schedule_category: 'Schedule H' },
  { generic_name: 'Dried Aluminium Hydroxide + Magnesium Hydroxide + Simethicone', brand_name: 'Gelusil Liquid', manufacturer: 'Pfizer', dosage_form: 'syrup', strength: 'Standard Antacid', therapeutic_class: 'Antacid / Antiflatulent', schedule_category: 'OTC', is_essential: true },
  { generic_name: 'Ondansetron', brand_name: 'Emeset 4', manufacturer: 'Cipla', dosage_form: 'tablet', strength: '4mg', therapeutic_class: '5-HT3 Antiemetic', schedule_category: 'Schedule H', is_essential: true },
  { generic_name: 'Ondansetron Dispersible', brand_name: 'Vomikind MD 4', manufacturer: 'Mankind Pharma', dosage_form: 'tablet', strength: '4mg', therapeutic_class: '5-HT3 Antiemetic', schedule_category: 'Schedule H' },
  { generic_name: 'Domperidone', brand_name: 'Domstal 10', manufacturer: 'Torrent Pharma', dosage_form: 'tablet', strength: '10mg', therapeutic_class: 'Dopamine Antagonist Prokinetic', schedule_category: 'Schedule H' },
  { generic_name: 'Rifaximin', brand_name: 'Rifagut 400', manufacturer: 'Sun Pharma', dosage_form: 'tablet', strength: '400mg', therapeutic_class: 'Non-absorbable Gut Antibiotic / IBS-D', schedule_category: 'Schedule H' },
  { generic_name: 'Rifaximin', brand_name: 'Rifagut 550', manufacturer: 'Sun Pharma', dosage_form: 'tablet', strength: '550mg', therapeutic_class: 'Hepatic Encephalopathy / IBS', schedule_category: 'Schedule H' },
  { generic_name: 'Ursodeoxycholic Acid', brand_name: 'Udiliv 300', manufacturer: 'Abbott', dosage_form: 'tablet', strength: '300mg', therapeutic_class: 'Hepatoprotective / Bile Acid', schedule_category: 'Schedule H' },
  { generic_name: 'Lactulose', brand_name: 'Duphalac Syrup', manufacturer: 'Abbott', dosage_form: 'syrup', strength: '3.33g/5ml', therapeutic_class: 'Osmotic Laxative / Hepatic Care', schedule_category: 'Schedule H' },
  { generic_name: 'Bacillus Clausii Probiotic', brand_name: 'Enterogermina Oral Suspension', manufacturer: 'Sanofi', dosage_form: 'drops', strength: '2 Billion Spores/5ml', therapeutic_class: 'Gut Microbiota Restorer', schedule_category: 'OTC' },
  { generic_name: 'Loperamide', brand_name: 'Imodium 2', manufacturer: 'Johnson & Johnson', dosage_form: 'capsule', strength: '2mg', therapeutic_class: 'Antidiarrheal Agent', schedule_category: 'Schedule H' },

  // --- ANTIBIOTICS & ANTIMICROBIALS ---
  { generic_name: 'Amoxicillin + Potassium Clavulanate', brand_name: 'Augmentin 625 Duo', manufacturer: 'GSK', dosage_form: 'tablet', strength: '500mg + 125mg', therapeutic_class: 'Broad-spectrum Penicillin + Beta-lactamase inhibitor', schedule_category: 'Schedule H', is_essential: true },
  { generic_name: 'Amoxicillin + Potassium Clavulanate', brand_name: 'Clavam 625', manufacturer: 'Alkem Laboratories', dosage_form: 'tablet', strength: '500mg + 125mg', therapeutic_class: 'Broad-spectrum Antibacterial', schedule_category: 'Schedule H', is_essential: true },
  { generic_name: 'Amoxicillin + Potassium Clavulanate', brand_name: 'Moxikind-CV 625', manufacturer: 'Mankind Pharma', dosage_form: 'tablet', strength: '500mg + 125mg', therapeutic_class: 'Broad-spectrum Antibacterial', schedule_category: 'Schedule H' },
  { generic_name: 'Azithromycin', brand_name: 'Azee 500', manufacturer: 'Cipla', dosage_form: 'tablet', strength: '500mg', therapeutic_class: 'Macrolide Antibiotic', schedule_category: 'Schedule H', is_essential: true },
  { generic_name: 'Azithromycin', brand_name: 'Azithral 500', manufacturer: 'Alembic Pharmaceuticals', dosage_form: 'tablet', strength: '500mg', therapeutic_class: 'Macrolide Antibiotic', schedule_category: 'Schedule H', is_essential: true },
  { generic_name: 'Cefixime', brand_name: 'Zifi 200', manufacturer: 'FDC Limited', dosage_form: 'tablet', strength: '200mg', therapeutic_class: '3rd Gen Cephalosporin', schedule_category: 'Schedule H', is_essential: true },
  { generic_name: 'Cefixime', brand_name: 'Taxim-O 200', manufacturer: 'Alkem Laboratories', dosage_form: 'tablet', strength: '200mg', therapeutic_class: '3rd Gen Cephalosporin', schedule_category: 'Schedule H' },
  { generic_name: 'Cefpodoxime Proxetil', brand_name: 'Gudcef 200', manufacturer: 'Mankind Pharma', dosage_form: 'tablet', strength: '200mg', therapeutic_class: '3rd Gen Cephalosporin (Oral)', schedule_category: 'Schedule H' },
  { generic_name: 'Cefpodoxime Proxetil', brand_name: 'Monocef-O 200', manufacturer: 'Aristo Pharma', dosage_form: 'tablet', strength: '200mg', therapeutic_class: '3rd Gen Cephalosporin (Oral)', schedule_category: 'Schedule H' },
  { generic_name: 'Cefuroxime Axetil', brand_name: 'Ceftum 500', manufacturer: 'GSK', dosage_form: 'tablet', strength: '500mg', therapeutic_class: '2nd Gen Cephalosporin', schedule_category: 'Schedule H', is_essential: true },
  { generic_name: 'Ciprofloxacin', brand_name: 'Ciplox 500', manufacturer: 'Cipla', dosage_form: 'tablet', strength: '500mg', therapeutic_class: 'Fluoroquinolone Antibiotic', schedule_category: 'Schedule H', is_essential: true },
  { generic_name: 'Levofloxacin', brand_name: 'Levomac 500', manufacturer: 'Macleods Pharma', dosage_form: 'tablet', strength: '500mg', therapeutic_class: 'Respiratory Fluoroquinolone', schedule_category: 'Schedule H', is_essential: true },
  { generic_name: 'Ofloxacin + Ornidazole', brand_name: 'O2', manufacturer: 'Medley Pharmaceuticals', dosage_form: 'tablet', strength: '200mg + 500mg', therapeutic_class: 'Antimicrobial / Antiprotozoal Combo', schedule_category: 'Schedule H', is_essential: true },
  { generic_name: 'Doxycycline', brand_name: 'Doxicip 100', manufacturer: 'Cipla', dosage_form: 'capsule', strength: '100mg', therapeutic_class: 'Tetracycline Antibiotic', schedule_category: 'Schedule H', is_essential: true },
  { generic_name: 'Metronidazole', brand_name: 'Flagyl 400', manufacturer: 'Abbott', dosage_form: 'tablet', strength: '400mg', therapeutic_class: 'Nitroimidazole Amebicide / Antibacterial', schedule_category: 'Schedule H', is_essential: true },
  { generic_name: 'Nitrofurantoin', brand_name: 'Niftran 100', manufacturer: 'Sun Pharma', dosage_form: 'tablet', strength: '100mg', therapeutic_class: 'Urinary Tract Antiseptic', schedule_category: 'Schedule H' },
  { generic_name: 'Linezolid', brand_name: 'Lizomac 600', manufacturer: 'Macleods Pharma', dosage_form: 'tablet', strength: '600mg', therapeutic_class: 'Oxazolidinone Antibiotic (MRSA/VRE)', schedule_category: 'Schedule H1' },
  { generic_name: 'Faropenem', brand_name: 'Farobact 200', manufacturer: 'Cipla', dosage_form: 'tablet', strength: '200mg', therapeutic_class: 'Penem Antibiotic', schedule_category: 'Schedule H1' },
  { generic_name: 'Fluconazole', brand_name: 'Forcan 150', manufacturer: 'Cipla', dosage_form: 'tablet', strength: '150mg', therapeutic_class: 'Triazole Antifungal', schedule_category: 'Schedule H', is_essential: true },
  { generic_name: 'Itraconazole', brand_name: 'Candiforce 200', manufacturer: 'Mankind Pharma', dosage_form: 'capsule', strength: '200mg', therapeutic_class: 'Systemic Antifungal', schedule_category: 'Schedule H' },
  { generic_name: 'Terbinafine', brand_name: 'Tyza 250', manufacturer: 'Sun Pharma', dosage_form: 'tablet', strength: '250mg', therapeutic_class: 'Allylamine Antifungal', schedule_category: 'Schedule H' },

  // --- CARDIOVASCULAR & ANTIHYPERTENSIVES ---
  { generic_name: 'Telmisartan', brand_name: 'Telma 40', manufacturer: 'Glenmark', dosage_form: 'tablet', strength: '40mg', therapeutic_class: 'Angiotensin II Receptor Blocker (ARB)', schedule_category: 'Schedule H', is_essential: true },
  { generic_name: 'Telmisartan', brand_name: 'Telma 80', manufacturer: 'Glenmark', dosage_form: 'tablet', strength: '80mg', therapeutic_class: 'Angiotensin II Receptor Blocker (ARB)', schedule_category: 'Schedule H' },
  { generic_name: 'Telmisartan + Amlodipine', brand_name: 'Telma-AM', manufacturer: 'Glenmark', dosage_form: 'tablet', strength: '40mg + 5mg', therapeutic_class: 'ARB + Calcium Channel Blocker', schedule_category: 'Schedule H', is_essential: true },
  { generic_name: 'Telmisartan + Hydrochlorothiazide', brand_name: 'Telma-H', manufacturer: 'Glenmark', dosage_form: 'tablet', strength: '40mg + 12.5mg', therapeutic_class: 'ARB + Thiazide Diuretic', schedule_category: 'Schedule H' },
  { generic_name: 'Amlodipine', brand_name: 'Amlong 5', manufacturer: 'Micro Labs', dosage_form: 'tablet', strength: '5mg', therapeutic_class: 'Dihydropyridine CCB', schedule_category: 'Schedule H', is_essential: true },
  { generic_name: 'Amlodipine', brand_name: 'Stamlo 5', manufacturer: 'Dr. Reddy’s', dosage_form: 'tablet', strength: '5mg', therapeutic_class: 'Dihydropyridine CCB', schedule_category: 'Schedule H' },
  { generic_name: 'Metoprolol Succinate Prolonged Release', brand_name: 'Betaloc 25 PR', manufacturer: 'AstraZeneca', dosage_form: 'tablet', strength: '25mg', therapeutic_class: 'Beta-1 Selective Adrenergic Blocker', schedule_category: 'Schedule H', is_essential: true },
  { generic_name: 'Metoprolol Succinate Prolonged Release', brand_name: 'Betaloc 50 PR', manufacturer: 'AstraZeneca', dosage_form: 'tablet', strength: '50mg', therapeutic_class: 'Beta-1 Selective Adrenergic Blocker', schedule_category: 'Schedule H' },
  { generic_name: 'Atenolol', brand_name: 'Aten 50', manufacturer: 'Zydus Cadila', dosage_form: 'tablet', strength: '50mg', therapeutic_class: 'Cardioselective Beta Blocker', schedule_category: 'Schedule H', is_essential: true },
  { generic_name: 'Losartan Potassium', brand_name: 'Losacar 50', manufacturer: 'Zydus Cadila', dosage_form: 'tablet', strength: '50mg', therapeutic_class: 'Angiotensin Receptor Blocker (ARB)', schedule_category: 'Schedule H', is_essential: true },
  { generic_name: 'Ramipril', brand_name: 'Cardace 2.5', manufacturer: 'Sanofi India', dosage_form: 'tablet', strength: '2.5mg', therapeutic_class: 'ACE Inhibitor', schedule_category: 'Schedule H', is_essential: true },
  { generic_name: 'Ramipril', brand_name: 'Cardace 5', manufacturer: 'Sanofi India', dosage_form: 'tablet', strength: '5mg', therapeutic_class: 'ACE Inhibitor', schedule_category: 'Schedule H' },
  { generic_name: 'Atorvastatin', brand_name: 'Atorva 10', manufacturer: 'Zydus Cadila', dosage_form: 'tablet', strength: '10mg', therapeutic_class: 'HMG-CoA Reductase Inhibitor (Statin)', schedule_category: 'Schedule H', is_essential: true },
  { generic_name: 'Atorvastatin', brand_name: 'Atorva 20', manufacturer: 'Zydus Cadila', dosage_form: 'tablet', strength: '20mg', therapeutic_class: 'HMG-CoA Reductase Inhibitor (Statin)', schedule_category: 'Schedule H', is_essential: true },
  { generic_name: 'Rosuvastatin', brand_name: 'Rosuvas 10', manufacturer: 'Sun Pharma', dosage_form: 'tablet', strength: '10mg', therapeutic_class: 'HMG-CoA Reductase Inhibitor (Statin)', schedule_category: 'Schedule H' },
  { generic_name: 'Rosuvastatin', brand_name: 'Rosuvas 20', manufacturer: 'Sun Pharma', dosage_form: 'tablet', strength: '20mg', therapeutic_class: 'HMG-CoA Reductase Inhibitor (Statin)', schedule_category: 'Schedule H' },
  { generic_name: 'Aspirin Gastro-Resistant', brand_name: 'Ecosprin 75', manufacturer: 'USV Limited', dosage_form: 'tablet', strength: '75mg', therapeutic_class: 'Antiplatelet Agent', schedule_category: 'Schedule H', is_essential: true },
  { generic_name: 'Aspirin Gastro-Resistant', brand_name: 'Ecosprin 150', manufacturer: 'USV Limited', dosage_form: 'tablet', strength: '150mg', therapeutic_class: 'Antiplatelet Agent', schedule_category: 'Schedule H' },
  { generic_name: 'Aspirin + Atorvastatin', brand_name: 'Ecosprin-AV 75/10', manufacturer: 'USV Limited', dosage_form: 'capsule', strength: '75mg + 10mg', therapeutic_class: 'Antiplatelet + Statin', schedule_category: 'Schedule H' },
  { generic_name: 'Clopidogrel', brand_name: 'Clopilet 75', manufacturer: 'Sun Pharma', dosage_form: 'tablet', strength: '75mg', therapeutic_class: 'P2Y12 Antiplatelet Agent', schedule_category: 'Schedule H', is_essential: true },
  { generic_name: 'Torsemide', brand_name: 'Dytor 10', manufacturer: 'Cipla', dosage_form: 'tablet', strength: '10mg', therapeutic_class: 'Loop Diuretic', schedule_category: 'Schedule H' },
  { generic_name: 'Spironolactone', brand_name: 'Aldactone 25', manufacturer: 'RPG Life Sciences', dosage_form: 'tablet', strength: '25mg', therapeutic_class: 'Aldosterone Antagonist / Potassium-sparing Diuretic', schedule_category: 'Schedule H' },

  // --- ANTIDIABETICS & ENDOCRINOLOGY ---
  { generic_name: 'Metformin Hydrochloride SR', brand_name: 'Glycomet 500 SR', manufacturer: 'USV Limited', dosage_form: 'tablet', strength: '500mg', therapeutic_class: 'Biguanide Antidiabetic', schedule_category: 'Schedule H', is_essential: true },
  { generic_name: 'Metformin Hydrochloride SR', brand_name: 'Glycomet 1000 SR', manufacturer: 'USV Limited', dosage_form: 'tablet', strength: '1000mg', therapeutic_class: 'Biguanide Antidiabetic', schedule_category: 'Schedule H' },
  { generic_name: 'Glimepiride', brand_name: 'Amaryl 1', manufacturer: 'Sanofi India', dosage_form: 'tablet', strength: '1mg', therapeutic_class: 'Sulfonylurea Antidiabetic', schedule_category: 'Schedule H' },
  { generic_name: 'Glimepiride', brand_name: 'Amaryl 2', manufacturer: 'Sanofi India', dosage_form: 'tablet', strength: '2mg', therapeutic_class: 'Sulfonylurea Antidiabetic', schedule_category: 'Schedule H', is_essential: true },
  { generic_name: 'Glimepiride + Metformin SR', brand_name: 'Glycomet-GP 1', manufacturer: 'USV Limited', dosage_form: 'tablet', strength: '1mg + 500mg', therapeutic_class: 'Sulfonylurea + Biguanide', schedule_category: 'Schedule H', is_essential: true },
  { generic_name: 'Glimepiride + Metformin SR', brand_name: 'Glycomet-GP 2', manufacturer: 'USV Limited', dosage_form: 'tablet', strength: '2mg + 500mg', therapeutic_class: 'Sulfonylurea + Biguanide', schedule_category: 'Schedule H', is_essential: true },
  { generic_name: 'Glimepiride + Metformin SR + Voglibose', brand_name: 'Voglimac-GM 2', manufacturer: 'Macleods', dosage_form: 'tablet', strength: '2mg + 500mg + 0.2mg', therapeutic_class: 'Triple Oral Hypoglycemic Agent', schedule_category: 'Schedule H' },
  { generic_name: 'Teneligliptin', brand_name: 'Ziten 20', manufacturer: 'Glenmark', dosage_form: 'tablet', strength: '20mg', therapeutic_class: 'DPP-4 Inhibitor (Gliptin)', schedule_category: 'Schedule H' },
  { generic_name: 'Sitagliptin', brand_name: 'Januvia 100', manufacturer: 'MSD', dosage_form: 'tablet', strength: '100mg', therapeutic_class: 'DPP-4 Inhibitor (Gliptin)', schedule_category: 'Schedule H' },
  { generic_name: 'Sitagliptin + Metformin', brand_name: 'Janumet 50/500', manufacturer: 'MSD', dosage_form: 'tablet', strength: '50mg + 500mg', therapeutic_class: 'DPP-4 + Biguanide', schedule_category: 'Schedule H' },
  { generic_name: 'Vildagliptin', brand_name: 'Galvus 50', manufacturer: 'Novartis', dosage_form: 'tablet', strength: '50mg', therapeutic_class: 'DPP-4 Inhibitor (Gliptin)', schedule_category: 'Schedule H' },
  { generic_name: 'Vildagliptin + Metformin', brand_name: 'Galvus Met 50/500', manufacturer: 'Novartis', dosage_form: 'tablet', strength: '50mg + 500mg', therapeutic_class: 'DPP-4 + Biguanide', schedule_category: 'Schedule H' },
  { generic_name: 'Dapagliflozin', brand_name: 'Forxiga 10', manufacturer: 'AstraZeneca', dosage_form: 'tablet', strength: '10mg', therapeutic_class: 'SGLT2 Inhibitor / Renoprotective', schedule_category: 'Schedule H' },
  { generic_name: 'Empagliflozin', brand_name: 'Jardiance 10', manufacturer: 'Boehringer Ingelheim', dosage_form: 'tablet', strength: '10mg', therapeutic_class: 'SGLT2 Inhibitor / Cardioprotective', schedule_category: 'Schedule H' },
  { generic_name: 'Levothyroxine Sodium', brand_name: 'Thyronorm 25', manufacturer: 'Abbott', dosage_form: 'tablet', strength: '25mcg', therapeutic_class: 'Thyroid Hormone Replacement', schedule_category: 'Schedule H', is_essential: true },
  { generic_name: 'Levothyroxine Sodium', brand_name: 'Thyronorm 50', manufacturer: 'Abbott', dosage_form: 'tablet', strength: '50mcg', therapeutic_class: 'Thyroid Hormone Replacement', schedule_category: 'Schedule H', is_essential: true },
  { generic_name: 'Levothyroxine Sodium', brand_name: 'Thyronorm 100', manufacturer: 'Abbott', dosage_form: 'tablet', strength: '100mcg', therapeutic_class: 'Thyroid Hormone Replacement', schedule_category: 'Schedule H', is_essential: true },

  // --- RESPIRATORY & ANTIALLERGICS ---
  { generic_name: 'Levocetirizine', brand_name: 'Levocet 5', manufacturer: 'Hetero', dosage_form: 'tablet', strength: '5mg', therapeutic_class: '2nd Gen Antihistamine', schedule_category: 'Schedule H', is_essential: true },
  { generic_name: 'Montelukast + Levocetirizine', brand_name: 'Montair-LC', manufacturer: 'Cipla', dosage_form: 'tablet', strength: '10mg + 5mg', therapeutic_class: 'Leukotriene Receptor Antagonist + Antihistamine', schedule_category: 'Schedule H', is_essential: true },
  { generic_name: 'Montelukast + Levocetirizine', brand_name: 'Telekast-L', manufacturer: 'Lupin', dosage_form: 'tablet', strength: '10mg + 5mg', therapeutic_class: 'Antiasthmatic / Antiallergic', schedule_category: 'Schedule H' },
  { generic_name: 'Bilastine', brand_name: 'Bilaxten 20', manufacturer: 'Zydus Cadila', dosage_form: 'tablet', strength: '20mg', therapeutic_class: 'Non-sedating 2nd Gen Antihistamine', schedule_category: 'Schedule H' },
  { generic_name: 'Fexofenadine', brand_name: 'Allegra 120', manufacturer: 'Sanofi India', dosage_form: 'tablet', strength: '120mg', therapeutic_class: 'Non-sedating Antihistamine', schedule_category: 'Schedule H', is_essential: true },
  { generic_name: 'Cetirizine', brand_name: 'Cetzine 10', manufacturer: 'Dr. Reddy’s', dosage_form: 'tablet', strength: '10mg', therapeutic_class: 'Antihistamine', schedule_category: 'Schedule H', is_essential: true },
  { generic_name: 'Dextromethorphan + Chlorpheniramine + Phenylephrine', brand_name: 'Ascoril D Plus', manufacturer: 'Glenmark', dosage_form: 'syrup', strength: 'Dry Cough Syrup', therapeutic_class: 'Antitussive / Decongestant', schedule_category: 'Schedule H' },
  { generic_name: 'Ambroxol + Levosalbutamol + Guaiphenesin', brand_name: 'Ascoril LS Syrup', manufacturer: 'Glenmark', dosage_form: 'syrup', strength: 'Wet Cough Formula', therapeutic_class: 'Mucolytic + Bronchodilator + Expectorant', schedule_category: 'Schedule H', is_essential: true },
  { generic_name: 'Budesonide + Formoterol Inhaler', brand_name: 'Foracort 200 Inhaler', manufacturer: 'Cipla', dosage_form: 'inhaler', strength: '200mcg + 6mcg', route: 'inhalation', therapeutic_class: 'Inhaled Corticosteroid + LABA', schedule_category: 'Schedule H', is_essential: true },
  { generic_name: 'Salbutamol Inhaler', brand_name: 'Asthalin Inhaler', manufacturer: 'Cipla', dosage_form: 'inhaler', strength: '100mcg', route: 'inhalation', therapeutic_class: 'Short-acting Beta-2 Agonist (SABA)', schedule_category: 'Schedule H', is_essential: true },
  { generic_name: 'Fluticasone Furoate Nasal Spray', brand_name: 'Flomist Nasal Spray', manufacturer: 'Cipla', dosage_form: 'drops', strength: '27.5mcg/spray', route: 'nasal', therapeutic_class: 'Topical Corticosteroid (Allergic Rhinitis)', schedule_category: 'Schedule H' },
  { generic_name: 'Oxymetazoline 0.05%', brand_name: 'Otrivin Adult Nasal Spray', manufacturer: 'GSK', dosage_form: 'drops', strength: '0.05% w/v', route: 'nasal', therapeutic_class: 'Topical Nasal Decongestant', schedule_category: 'OTC' },

  // --- VITAMINS, MINERALS & NUTRACEUTICALS ---
  { generic_name: 'Calcium Carbonate + Vitamin D3', brand_name: 'Shelcal 500', manufacturer: 'Torrent Pharma', dosage_form: 'tablet', strength: '500mg (Elemental Calcium) + 250 IU', therapeutic_class: 'Mineral / Vitamin Supplement', schedule_category: 'OTC', is_essential: true },
  { generic_name: 'Cholecalciferol (Vitamin D3)', brand_name: 'Calcirol 60K Sachet', manufacturer: 'Cadila', dosage_form: 'powder', strength: '60,000 IU', therapeutic_class: 'High-dose Vitamin D3', schedule_category: 'OTC', is_essential: true },
  { generic_name: 'Cholecalciferol (Vitamin D3)', brand_name: 'D3 Must 60K Chewable', manufacturer: 'Mankind', dosage_form: 'tablet', strength: '60,000 IU', therapeutic_class: 'Vitamin D3 Supplement', schedule_category: 'OTC' },
  { generic_name: 'Methylcobalamin + Alpha Lipoic Acid + Pyridoxine + Folic Acid', brand_name: 'Nurokind-Plus RF', manufacturer: 'Mankind', dosage_form: 'capsule', strength: '1500mcg + 100mg + 3mg + 1.5mg', therapeutic_class: 'Neuroprotective / Peripheral Neuropathy', schedule_category: 'OTC', is_essential: true },
  { generic_name: 'Vitamin B-Complex + Vitamin C', brand_name: 'Becosules Capsules', manufacturer: 'Pfizer', dosage_form: 'capsule', strength: 'B-Complex Forte + C', therapeutic_class: 'Water-soluble Vitamin Supplement', schedule_category: 'OTC', is_essential: true },
  { generic_name: 'Ferrous Ascorbate + Folic Acid', brand_name: 'Orofer-XT', manufacturer: 'Emcure', dosage_form: 'tablet', strength: '100mg + 1.5mg', therapeutic_class: 'Hematinic / Anemia Therapy', schedule_category: 'Schedule H', is_essential: true },
  { generic_name: 'Ascorbic Acid (Vitamin C)', brand_name: 'Limcee 500 Chewable', manufacturer: 'Abbott', dosage_form: 'tablet', strength: '500mg', therapeutic_class: 'Immunity / Antioxidant', schedule_category: 'OTC', is_essential: true },
  { generic_name: 'Vitamin E', brand_name: 'Evion 400', manufacturer: 'Merck', dosage_form: 'capsule', strength: '400mg', therapeutic_class: 'Fat-soluble Vitamin / Antioxidant', schedule_category: 'OTC' },
  { generic_name: 'Zinc Sulphate', brand_name: 'Zinconia 50', manufacturer: 'Micro Labs', dosage_form: 'tablet', strength: '50mg', therapeutic_class: 'Trace Element / Immunity', schedule_category: 'OTC' },

  // --- DERMATOLOGY & TOPICALS ---
  { generic_name: 'Clotrimazole Cream', brand_name: 'Candid Cream 1%', manufacturer: 'Glenmark', dosage_form: 'ointment', strength: '1% w/w', route: 'topical', therapeutic_class: 'Topical Antifungal', schedule_category: 'OTC', is_essential: true },
  { generic_name: 'Mupirocin Ointment', brand_name: 'T-Bact 2%', manufacturer: 'GSK', dosage_form: 'ointment', strength: '2% w/w', route: 'topical', therapeutic_class: 'Topical Antibacterial (Impetigo/Wounds)', schedule_category: 'Schedule H', is_essential: true },
  { generic_name: 'Fusidic Acid Cream', brand_name: 'Fucidin 2%', manufacturer: 'Sun Pharma', dosage_form: 'ointment', strength: '2% w/w', route: 'topical', therapeutic_class: 'Topical Antibiotic', schedule_category: 'Schedule H' },
  { generic_name: 'Betamethasone + Neomycin', brand_name: 'Betnovate-N', manufacturer: 'GSK', dosage_form: 'ointment', strength: '0.1% + 0.5%', route: 'topical', therapeutic_class: 'Topical Steroid + Antibiotic', schedule_category: 'Schedule H' },
  { generic_name: 'Permethrin 5% Lotion', brand_name: 'Scaboma Lotion', manufacturer: 'Glenmark', dosage_form: 'lotion', strength: '5% w/v', route: 'topical', therapeutic_class: 'Scabicidal / Pediculicidal', schedule_category: 'Schedule H', is_essential: true },
  { generic_name: 'Ketoconazole 2% Shampoo', brand_name: 'Nizral 2%', manufacturer: 'Janssen', dosage_form: 'lotion', strength: '2% w/v', route: 'topical', therapeutic_class: 'Antidandruff / Antifungal Shampoo', schedule_category: 'OTC' },
  { generic_name: 'Povidone Iodine 10% Ointment', brand_name: 'Betadine 10%', manufacturer: 'Win-Medicare', dosage_form: 'ointment', strength: '10% w/w', route: 'topical', therapeutic_class: 'Microbicidal Antiseptic', schedule_category: 'OTC', is_essential: true },

  // --- NEUROLOGY, PSYCHIATRY & SLEEP ---
  { generic_name: 'Escitalopram', brand_name: 'Nexito 10', manufacturer: 'Sun Pharma', dosage_form: 'tablet', strength: '10mg', therapeutic_class: 'Selective Serotonin Reuptake Inhibitor (SSRI)', schedule_category: 'Schedule H', is_essential: true },
  { generic_name: 'Clonazepam', brand_name: 'Lonazep 0.5', manufacturer: 'Sun Pharma', dosage_form: 'tablet', strength: '0.5mg', therapeutic_class: 'Benzodiazepine / Anxiolytic', schedule_category: 'Schedule H', is_essential: true },
  { generic_name: 'Alprazolam', brand_name: 'Alprax 0.25', manufacturer: 'Torrent Pharma', dosage_form: 'tablet', strength: '0.25mg', therapeutic_class: 'Anxiolytic Benzodiazepine', schedule_category: 'Schedule H1' },
  { generic_name: 'Pregabalin', brand_name: 'Pregalin 75', manufacturer: 'Torrent Pharma', dosage_form: 'capsule', strength: '75mg', therapeutic_class: 'Neuropathic Pain / GABA Analog', schedule_category: 'Schedule H' },
  { generic_name: 'Gabapentin', brand_name: 'Gabapin 300', manufacturer: 'Intas Pharma', dosage_form: 'tablet', strength: '300mg', therapeutic_class: 'Anticonvulsant / Neuropathic Pain', schedule_category: 'Schedule H' },
  { generic_name: 'Levetiracetam', brand_name: 'Levipil 500', manufacturer: 'Sun Pharma', dosage_form: 'tablet', strength: '500mg', therapeutic_class: 'Antiepileptic Agent', schedule_category: 'Schedule H' },

  // --- PEDIATRIC FORMULATIONS ---
  { generic_name: 'Paracetamol Paediatric Oral Drops', brand_name: 'Calpol Paediatric Drops', manufacturer: 'GSK', dosage_form: 'drops', strength: '100mg/ml', therapeutic_class: 'Pediatric Antipyretic', schedule_category: 'OTC', is_essential: true },
  { generic_name: 'Paracetamol Paediatric Suspension', brand_name: 'Calpol 250 Peed', manufacturer: 'GSK', dosage_form: 'syrup', strength: '250mg/5ml', therapeutic_class: 'Pediatric Antipyretic', schedule_category: 'OTC', is_essential: true },
  { generic_name: 'Amoxicillin + Potassium Clavulanate Dry Syrup', brand_name: 'Augmentin Duo Dry Syrup', manufacturer: 'GSK', dosage_form: 'syrup', strength: '228.5mg/5ml', therapeutic_class: 'Pediatric Antibacterial', schedule_category: 'Schedule H', is_essential: true },
  { generic_name: 'Cefixime Oral Suspension', brand_name: 'Zifi 50 Dry Syrup', manufacturer: 'FDC Limited', dosage_form: 'syrup', strength: '50mg/5ml', therapeutic_class: 'Pediatric Cephalosporin', schedule_category: 'Schedule H', is_essential: true },
  { generic_name: 'Simethicone + Dill Oil + Fennel Oil', brand_name: 'Colic-Aid Drops', manufacturer: 'Meyer Organics', dosage_form: 'drops', strength: 'Infantile Colic Drops', therapeutic_class: 'Pediatric Antiflatulent', schedule_category: 'OTC', is_essential: true },
  { generic_name: 'Cholecalciferol Vitamin D3 Drops', brand_name: 'Ultra D3 Drops', manufacturer: 'Meyer Organics', dosage_form: 'drops', strength: '400 IU/ml', therapeutic_class: 'Infant Vitamin D Supplement', schedule_category: 'OTC', is_essential: true },

  // --- CORTICOSTEROIDS & IMMUNOMODULATORS ---
  { generic_name: 'Prednisolone', brand_name: 'Wysolone 5', manufacturer: 'Pfizer', dosage_form: 'tablet', strength: '5mg', therapeutic_class: 'Systemic Corticosteroid', schedule_category: 'Schedule H', is_essential: true },
  { generic_name: 'Prednisolone', brand_name: 'Wysolone 10', manufacturer: 'Pfizer', dosage_form: 'tablet', strength: '10mg', therapeutic_class: 'Systemic Corticosteroid', schedule_category: 'Schedule H', is_essential: true },
  { generic_name: 'Prednisolone', brand_name: 'Wysolone 20', manufacturer: 'Pfizer', dosage_form: 'tablet', strength: '20mg', therapeutic_class: 'Systemic Corticosteroid', schedule_category: 'Schedule H' },
  { generic_name: 'Methylprednisolone', brand_name: 'Medrol 4', manufacturer: 'Pfizer', dosage_form: 'tablet', strength: '4mg', therapeutic_class: 'Anti-inflammatory Glucocorticoid', schedule_category: 'Schedule H' },
  { generic_name: 'Methylprednisolone', brand_name: 'Medrol 8', manufacturer: 'Pfizer', dosage_form: 'tablet', strength: '8mg', therapeutic_class: 'Anti-inflammatory Glucocorticoid', schedule_category: 'Schedule H' },
  { generic_name: 'Deflazacort', brand_name: 'Defcort 6', manufacturer: 'Macleods', dosage_form: 'tablet', strength: '6mg', therapeutic_class: 'Glucocorticoid', schedule_category: 'Schedule H' },
  { generic_name: 'Dexamethasone', brand_name: 'Dexona 0.5', manufacturer: 'Zydus Cadila', dosage_form: 'tablet', strength: '0.5mg', therapeutic_class: 'High-potency Corticosteroid', schedule_category: 'Schedule H', is_essential: true },
  { generic_name: 'Dexamethasone Sodium Phosphate Injection', brand_name: 'Dexona Injection', manufacturer: 'Zydus Cadila', dosage_form: 'injection', strength: '4mg/ml', route: 'iv', therapeutic_class: 'Emergency Anti-inflammatory Corticosteroid', schedule_category: 'Schedule H', is_essential: true },
  { generic_name: 'Hydrocortisone Sodium Succinate Injection', brand_name: 'Primacort 100', manufacturer: 'Macleods', dosage_form: 'injection', strength: '100mg/vial', route: 'iv', therapeutic_class: 'Anaphylaxis / Adrenal Crisis', schedule_category: 'Schedule H', is_essential: true },

  // --- UROLOGY, NEPHROLOGY & PROSTATE ---
  { generic_name: 'Tamsulosin Hydrochloride', brand_name: 'Urimax 0.4', manufacturer: 'Cipla', dosage_form: 'capsule', strength: '0.4mg', therapeutic_class: 'Alpha-1A Adrenergic Blocker (BPH)', schedule_category: 'Schedule H', is_essential: true },
  { generic_name: 'Tamsulosin + Dutasteride', brand_name: 'Urimax-D', manufacturer: 'Cipla', dosage_form: 'tablet', strength: '0.4mg + 0.5mg', therapeutic_class: 'Alpha Blocker + 5-Alpha Reductase Inhibitor', schedule_category: 'Schedule H', is_essential: true },
  { generic_name: 'Silodosin', brand_name: 'Silodal 8', manufacturer: 'Sun Pharma', dosage_form: 'capsule', strength: '8mg', therapeutic_class: 'Selective Alpha-1A Blocker (BPH)', schedule_category: 'Schedule H' },
  { generic_name: 'Disodium Hydrogen Citrate', brand_name: 'Citralka Liquid', manufacturer: 'Pfizer', dosage_form: 'syrup', strength: '1.4g/5ml', therapeutic_class: 'Systemic / Urinary Alkalizer', schedule_category: 'OTC', is_essential: true },
  { generic_name: 'Cranberry Extract + D-Mannose', brand_name: 'Cranpac Sachet', manufacturer: 'Sun Pharma', dosage_form: 'powder', strength: 'Urinary Anti-adherence Formula', therapeutic_class: 'Recurrent UTI Preventative Nutraceutical', schedule_category: 'OTC' },

  // --- OPHTHALMIC (EYE DROPS) ---
  { generic_name: 'Moxifloxacin Eye Drops', brand_name: 'Vigamox 0.5%', manufacturer: 'Alcon', dosage_form: 'drops', strength: '0.5% w/v', route: 'ophthalmic', therapeutic_class: 'Broad-spectrum Ophthalmic Antibacterial', schedule_category: 'Schedule H', is_essential: true },
  { generic_name: 'Tobramycin Eye Drops', brand_name: 'Tobrex 0.3%', manufacturer: 'Novartis', dosage_form: 'drops', strength: '0.3% w/v', route: 'ophthalmic', therapeutic_class: 'Aminoglycoside Ophthalmic Antibiotic', schedule_category: 'Schedule H' },
  { generic_name: 'Carboxymethylcellulose 0.5%', brand_name: 'Refresh Tears', manufacturer: 'Allergan', dosage_form: 'drops', strength: '0.5% w/v', route: 'ophthalmic', therapeutic_class: 'Artificial Tears / Lubricating Eye Drops', schedule_category: 'OTC', is_essential: true },
  { generic_name: 'Sodium Hyaluronate 0.1%', brand_name: 'Hymoist Eye Drops', manufacturer: 'Sun Pharma', dosage_form: 'drops', strength: '0.1% w/v', route: 'ophthalmic', therapeutic_class: 'Premium Ocular Lubricant', schedule_category: 'OTC' },
  { generic_name: 'Olopatadine Hydrochloride', brand_name: 'Pataday 0.2%', manufacturer: 'Alcon', dosage_form: 'drops', strength: '0.2% w/v', route: 'ophthalmic', therapeutic_class: 'Ocular Antihistamine / Mast Cell Stabilizer', schedule_category: 'Schedule H' },

  // --- VERTIGO, MOTION SICKNESS & ENT ---
  { generic_name: 'Betahistine Dihydrochloride', brand_name: 'Vertin 16', manufacturer: 'Abbott', dosage_form: 'tablet', strength: '16mg', therapeutic_class: 'Histamine Analogue / Meniere Disease / Vertigo', schedule_category: 'Schedule H', is_essential: true },
  { generic_name: 'Betahistine Dihydrochloride', brand_name: 'Vertin 24', manufacturer: 'Abbott', dosage_form: 'tablet', strength: '24mg', therapeutic_class: 'Histamine Analogue / Peripheral Vertigo', schedule_category: 'Schedule H' },
  { generic_name: 'Cinnarizine', brand_name: 'Stugeron 25', manufacturer: 'Janssen', dosage_form: 'tablet', strength: '25mg', therapeutic_class: 'Cerebral Vasodilator / Motion Sickness', schedule_category: 'Schedule H' },
  { generic_name: 'Flunarizine', brand_name: 'Sibelium 10', manufacturer: 'Janssen', dosage_form: 'tablet', strength: '10mg', therapeutic_class: 'Calcium Channel Antagonist / Migraine Prophylaxis', schedule_category: 'Schedule H' },

  // --- ANTITHROMBOTICS, ANTICOAGULANTS & EMERGENCY ---
  { generic_name: 'Apixaban', brand_name: 'Eliquis 2.5', manufacturer: 'Pfizer', dosage_form: 'tablet', strength: '2.5mg', therapeutic_class: 'Direct Oral Anticoagulant (DOAC) / Factor Xa Inhibitor', schedule_category: 'Schedule H' },
  { generic_name: 'Apixaban', brand_name: 'Eliquis 5', manufacturer: 'Pfizer', dosage_form: 'tablet', strength: '5mg', therapeutic_class: 'DOAC / Stroke Prevention in AF', schedule_category: 'Schedule H' },
  { generic_name: 'Rivaroxaban', brand_name: 'Xarelto 10', manufacturer: 'Bayer', dosage_form: 'tablet', strength: '10mg', therapeutic_class: 'Factor Xa Inhibitor / DVT Prophylaxis', schedule_category: 'Schedule H' },
  { generic_name: 'Warfarin Sodium', brand_name: 'Warf 5', manufacturer: 'Cipla', dosage_form: 'tablet', strength: '5mg', therapeutic_class: 'Vitamin K Antagonist', schedule_category: 'Schedule H', is_essential: true },
  { generic_name: 'Nitroglycerin Sublingual', brand_name: 'Sorbitrate 5 Sublingual', manufacturer: 'Abbott', dosage_form: 'tablet', strength: '5mg', route: 'oral', therapeutic_class: 'Nitrate Vasodilator / Acute Angina Pectoris', schedule_category: 'Schedule H', is_essential: true },
  { generic_name: 'Nicorandil', brand_name: 'Nikoran 5', manufacturer: 'Torrent Pharma', dosage_form: 'tablet', strength: '5mg', therapeutic_class: 'Potassium Channel Opener / Refractory Angina', schedule_category: 'Schedule H' },
  { generic_name: 'Trypsin + Chymotrypsin', brand_name: 'Chymoral Forte', manufacturer: 'Torrent Pharma', dosage_form: 'tablet', strength: '100,000 Armour Units', therapeutic_class: 'Proteolytic Anti-inflammatory Enzyme', schedule_category: 'Schedule H', is_essential: true },

  // --- DERMATOLOGY, TOPICALS & WOUND CARE ---
  { generic_name: 'Povidone-Iodine', brand_name: 'Betadine 5% Ointment', manufacturer: 'Win-Medicare', dosage_form: 'ointment', strength: '5% w/w', route: 'topical', therapeutic_class: 'Antiseptic / Microbicidal', schedule_category: 'OTC', is_essential: true },
  { generic_name: 'Mupirocin', brand_name: 'T-Bact 2% Ointment', manufacturer: 'GSK', dosage_form: 'ointment', strength: '2% w/w', route: 'topical', therapeutic_class: 'Topical Antibacterial (Impetigo / MRSA)', schedule_category: 'Schedule H', is_essential: true },
  { generic_name: 'Framycetin Sulphate', brand_name: 'Soframycin Cream', manufacturer: 'Sanofi India', dosage_form: 'ointment', strength: '1% w/w', route: 'topical', therapeutic_class: 'Topical Aminoglycoside Antibiotic', schedule_category: 'OTC', is_essential: true },
  { generic_name: 'Clotrimazole', brand_name: 'Candid Cream', manufacturer: 'Glenmark', dosage_form: 'ointment', strength: '1% w/w', route: 'topical', therapeutic_class: 'Topical Imidazole Antifungal', schedule_category: 'OTC', is_essential: true },
  { generic_name: 'Clotrimazole', brand_name: 'Candid Dusting Powder', manufacturer: 'Glenmark', dosage_form: 'powder', strength: '1% w/w', route: 'topical', therapeutic_class: 'Antifungal Dusting Powder', schedule_category: 'OTC', is_essential: true },
  { generic_name: 'Luliconazole', brand_name: 'Lulican 1% Cream', manufacturer: 'Glenmark', dosage_form: 'ointment', strength: '1% w/w', route: 'topical', therapeutic_class: 'Broad-spectrum Antifungal / Tinea Cruris', schedule_category: 'Schedule H' },
  { generic_name: 'Silver Sulfadiazine', brand_name: 'Silverex Ionic Ointment', manufacturer: 'Sun Pharma', dosage_form: 'ointment', strength: '0.2% w/w', route: 'topical', therapeutic_class: 'Antimicrobial Burn Dressing', schedule_category: 'Schedule H', is_essential: true },
  { generic_name: 'Calamine + Diphenhydramine', brand_name: 'Caladryl Lotion', manufacturer: 'Piramal', dosage_form: 'lotion', strength: '8% + 1%', route: 'topical', therapeutic_class: 'Topical Antipruritic / Soothing', schedule_category: 'OTC', is_essential: true },

  // --- OPHTHALMIC & ENT PREPARATIONS ---
  { generic_name: 'Ciprofloxacin Eye Drops', brand_name: 'Ciplox Eye Drops', manufacturer: 'Cipla', dosage_form: 'drops', strength: '0.3% w/v', route: 'ophthalmic', therapeutic_class: 'Fluoroquinolone Ophthalmic', schedule_category: 'Schedule H', is_essential: true },
  { generic_name: 'Moxifloxacin Eye Drops', brand_name: 'Moxicip Eye Drops', manufacturer: 'Cipla', dosage_form: 'drops', strength: '0.5% w/v', route: 'ophthalmic', therapeutic_class: '4th Gen Fluoroquinolone Ophthalmic', schedule_category: 'Schedule H', is_essential: true },
  { generic_name: 'Tobramycin Eye Drops', brand_name: 'Tobastar Eye Drops', manufacturer: 'Mankind Pharma', dosage_form: 'drops', strength: '0.3% w/v', route: 'ophthalmic', therapeutic_class: 'Aminoglycoside Ophthalmic', schedule_category: 'Schedule H' },
  { generic_name: 'Carboxymethylcellulose', brand_name: 'Refresh Tears Eye Drops', manufacturer: 'Allergan', dosage_form: 'drops', strength: '0.5% w/v', route: 'ophthalmic', therapeutic_class: 'Artificial Tears / Lubricant', schedule_category: 'OTC', is_essential: true },
  { generic_name: 'Xylometazoline', brand_name: 'Otrivin 0.1% Adult Nasal Spray', manufacturer: 'GSK', dosage_form: 'drops', strength: '0.1% w/v', route: 'nasal', therapeutic_class: 'Nasal Decongestant', schedule_category: 'OTC' },
  { generic_name: 'Fluticasone Furoate', brand_name: 'Flomist Nasal Spray', manufacturer: 'Cipla', dosage_form: 'drops', strength: '27.5mcg/actuation', route: 'nasal', therapeutic_class: 'Intranasal Corticosteroid / Allergic Rhinitis', schedule_category: 'Schedule H' },
  { generic_name: 'Paradichlorobenzene + Benzocaine + Chlorbutol', brand_name: 'Waxolve Ear Drops', manufacturer: 'Mankind Pharma', dosage_form: 'drops', strength: '2% + 2.5% + 5%', route: 'otic', therapeutic_class: 'Cerumenolytic / Ear Wax Softener', schedule_category: 'OTC' },

  // --- RESPIRATORY INHALERS & RESPULES ---
  { generic_name: 'Salbutamol Inhaler', brand_name: 'Asthalin 100 Inhaler', manufacturer: 'Cipla', dosage_form: 'inhaler', strength: '100mcg/puff', route: 'inhalation', therapeutic_class: 'Short-acting Beta-2 Agonist (SABA)', schedule_category: 'Schedule H', is_essential: true },
  { generic_name: 'Budesonide Inhaler', brand_name: 'Budecort 200 Inhaler', manufacturer: 'Cipla', dosage_form: 'inhaler', strength: '200mcg/puff', route: 'inhalation', therapeutic_class: 'Inhaled Corticosteroid (ICS)', schedule_category: 'Schedule H', is_essential: true },
  { generic_name: 'Budesonide + Formoterol Fumarate', brand_name: 'Foracort 200 Inhaler', manufacturer: 'Cipla', dosage_form: 'inhaler', strength: '200mcg + 6mcg', route: 'inhalation', therapeutic_class: 'ICS + LABA Controller / SMART Therapy', schedule_category: 'Schedule H', is_essential: true },
  { generic_name: 'Salmeterol + Fluticasone Propionate', brand_name: 'Seroflo 250 Inhaler', manufacturer: 'Cipla', dosage_form: 'inhaler', strength: '250mcg + 50mcg', route: 'inhalation', therapeutic_class: 'ICS + LABA Maintenance Inhaler', schedule_category: 'Schedule H' },
  { generic_name: 'Levosalbutamol + Ipratropium Bromide', brand_name: 'Duolin Respules', manufacturer: 'Cipla', dosage_form: 'drops', strength: '1.25mg + 500mcg / 2.5ml', route: 'inhalation', therapeutic_class: 'Bronchodilator Nebulization Solution', schedule_category: 'Schedule H', is_essential: true },
  { generic_name: 'Doxofylline', brand_name: 'Doxovent 400', manufacturer: 'Glenmark', dosage_form: 'tablet', strength: '400mg', therapeutic_class: 'Xanthine Bronchodilator / COPD', schedule_category: 'Schedule H' },

  // --- NUTRITIONAL, HEMATINICS & ESSENTIAL VITAMINS ---
  { generic_name: 'Cholecalciferol (Vitamin D3)', brand_name: 'Calcirol 60K Sachet', manufacturer: 'Cadila', dosage_form: 'powder', strength: '60,000 IU', therapeutic_class: 'Vitamin D3 Sachet / Hypocalcemia', schedule_category: 'OTC', is_essential: true },
  { generic_name: 'Cholecalciferol (Vitamin D3)', brand_name: 'D-Rise 60K Capsule', manufacturer: 'USV Limited', dosage_form: 'capsule', strength: '60,000 IU', therapeutic_class: 'High-potency Vitamin D3', schedule_category: 'OTC', is_essential: true },
  { generic_name: 'Calcium Carbonate + Vitamin D3', brand_name: 'Shelcal 500', manufacturer: 'Torrent Pharma', dosage_form: 'tablet', strength: '500mg + 250 IU', therapeutic_class: 'Calcium Supplement / Osteoporosis', schedule_category: 'OTC', is_essential: true },
  { generic_name: 'Ferrous Ascorbate + Folic Acid + Zinc', brand_name: 'Orofer-XT', manufacturer: 'Emcure', dosage_form: 'tablet', strength: '100mg + 1.5mg + 22.5mg', therapeutic_class: 'Hematinic / Iron Deficiency Anemia', schedule_category: 'OTC', is_essential: true },
  { generic_name: 'Ferrous Fumarate + Folic Acid + B12', brand_name: 'Autrin', manufacturer: 'Pfizer', dosage_form: 'capsule', strength: '300mg + 1.5mg + 15mcg', therapeutic_class: 'Therapeutic Hematinic', schedule_category: 'OTC' },
  { generic_name: 'Vitamin B Complex + Vitamin C', brand_name: 'Becosules Capsules', manufacturer: 'Pfizer', dosage_form: 'capsule', strength: 'Standard Therapeutic B-Complex', therapeutic_class: 'B-Complex with Vitamin C', schedule_category: 'OTC', is_essential: true },
  { generic_name: 'Multivitamin + Multimineral + Grape Seed Extract', brand_name: 'Zincovit Tablet', manufacturer: 'Apex Laboratories', dosage_form: 'tablet', strength: 'Nutritional Multivitamin', therapeutic_class: 'Immunity & Micronutrient Supplement', schedule_category: 'OTC', is_essential: true },
  { generic_name: 'Methylcobalamin + Alpha Lipoic Acid + Pyridoxine', brand_name: 'Neurobion Forte', manufacturer: 'Procter & Gamble', dosage_form: 'tablet', strength: '100mg + 100mg + 5mg', therapeutic_class: 'Neurotropic Vitamin / Diabetic Neuropathy', schedule_category: 'OTC', is_essential: true },
  { generic_name: 'Vitamin C (Ascorbic Acid)', brand_name: 'Limcee 500 Chewable', manufacturer: 'Abbott', dosage_form: 'tablet', strength: '500mg', therapeutic_class: 'Antioxidant / Vitamin C Supplement', schedule_category: 'OTC', is_essential: true },
  { generic_name: 'Folic Acid', brand_name: 'Folvite 5', manufacturer: 'Pfizer', dosage_form: 'tablet', strength: '5mg', therapeutic_class: 'Folate Supplement / Antenatal Care', schedule_category: 'OTC', is_essential: true },
  { generic_name: 'Methylcobalamin Injection', brand_name: 'Eldervit 12 Injection', manufacturer: 'Elder / Torrent', dosage_form: 'injection', strength: '1500mcg/ml', route: 'im', therapeutic_class: 'Active B12 / Peripheral Neuropathy', schedule_category: 'Schedule H' },
]

async function seedMedicines() {
  console.log(`Starting comprehensive Indian Medicine Master seed (${MEDICINES_DATABASE.length} medicines)...`)
  const admin = createAdminClient()

  // 1. Fetch all existing medicines in 1 query
  const { data: existingAll, error: fetchErr } = await admin
    .from('medicines_master')
    .select('id, brand_name, strength')

  if (fetchErr) {
    console.error('Failed to fetch existing medicines:', fetchErr.message)
    return
  }

  const existingMap = new Set(
    (existingAll || []).map((m: any) => `${m.brand_name.toLowerCase().trim()}_${m.strength.toLowerCase().trim()}`)
  )

  const toInsert: any[] = []

  for (const med of MEDICINES_DATABASE) {
    const key = `${med.brand_name.toLowerCase().trim()}_${med.strength.toLowerCase().trim()}`
    if (!existingMap.has(key)) {
      toInsert.push({
        generic_name: med.generic_name,
        brand_name: med.brand_name,
        manufacturer: med.manufacturer || 'Indian Pharma',
        dosage_form: med.dosage_form,
        strength: med.strength,
        strength_unit: 'mg',
        route: med.route || 'oral',
        therapeutic_class: med.therapeutic_class,
        schedule_category: med.schedule_category || 'Schedule H',
        prescription_required: med.schedule_category !== 'OTC',
        is_essential: med.is_essential || false,
        clinical_review_status: 'approved',
        is_active: true,
      })
      existingMap.add(key)
    }
  }

  console.log(`Found ${toInsert.length} new medicines to insert into database...`)

  // 2. Batch insert in chunks of 40
  const chunkSize = 40
  let inserted = 0
  for (let i = 0; i < toInsert.length; i += chunkSize) {
    const chunk = toInsert.slice(i, i + chunkSize)
    const { error: insErr } = await admin.from('medicines_master').insert(chunk)
    if (insErr) {
      console.error(`Chunk error at ${i}:`, insErr.message)
    } else {
      inserted += chunk.length
    }
  }

  // Get total count
  const { count } = await admin.from('medicines_master').select('*', { count: 'exact', head: true })
  console.log('✅ Medicine Seeding Complete!')
  console.log(`Newly Inserted: ${inserted}`)
  console.log(`Total Active Medicines in Database: ${count}`)
}

seedMedicines()
