import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import Papa from 'papaparse';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.join(__dirname, '..');

const paramsCsvPath = path.join(projectRoot, 'public', 'data', 'test-parameters.csv');
const testsCsvPath = path.join(projectRoot, 'public', 'data', 'tests.csv');

// Comprehensive Medical Dictionary for Reference Ranges & Units
const medicalDict = {
  'WBC': { unit: 'cells/cu.mm', range: '4,000 - 11,000' },
  'RBC': { unit: 'millions/cu.mm', range: '4.5 - 5.5' },
  'Hemoglobin': { unit: 'g/dL', range: '13.0 - 17.0' },
  'Platelets': { unit: 'lakhs/cu.mm', range: '1.5 - 4.5' },
  'Glucose': { unit: 'mg/dL', range: '70 - 100 (Fasting)' },
  'HbA1c': { unit: '%', range: '4.0 - 5.6' },
  'Cholesterol': { unit: 'mg/dL', range: '< 200' },
  'Triglycerides': { unit: 'mg/dL', range: '< 150' },
  'HDL': { unit: 'mg/dL', range: '> 40' },
  'LDL': { unit: 'mg/dL', range: '< 100' },
  'VLDL': { unit: 'mg/dL', range: '2 - 30' },
  'Creatinine': { unit: 'mg/dL', range: '0.6 - 1.2' },
  'Urea': { unit: 'mg/dL', range: '15 - 40' },
  'Uric Acid': { unit: 'mg/dL', range: '3.5 - 7.2' },
  'Bilirubin': { unit: 'mg/dL', range: '0.1 - 1.2' },
  'Calcium': { unit: 'mg/dL', range: '8.5 - 10.2' },
  'Phosphorus': { unit: 'mg/dL', range: '2.5 - 4.5' },
  'Sodium': { unit: 'mEq/L', range: '135 - 145' },
  'Potassium': { unit: 'mEq/L', range: '3.5 - 5.0' },
  'Chloride': { unit: 'mEq/L', range: '98 - 106' },
  'Protein': { unit: 'g/dL', range: '6.0 - 8.3' },
  'Albumin': { unit: 'g/dL', range: '3.5 - 5.0' },
  'Globulin': { unit: 'g/dL', range: '2.0 - 3.5' },
  'Iron': { unit: 'µg/dL', range: '60 - 170' },
  'Vitamin B12': { unit: 'pg/mL', range: '200 - 900' },
  'Vitamin D': { unit: 'ng/mL', range: '30 - 100' },
  'TSH': { unit: 'µIU/mL', range: '0.4 - 4.0' },
  'T3': { unit: 'ng/dL', range: '80 - 200' },
  'T4': { unit: 'µg/dL', range: '4.5 - 12.0' },
  'Testosterone': { unit: 'ng/dL', range: '300 - 1000' },
  'Cortisol': { unit: 'µg/dL', range: '5 - 25' },
  'Insulin': { unit: 'µIU/mL', range: '2.6 - 24.9' },
  'Microalbumin': { unit: 'mg/L', range: '< 30' },
  'CRP': { unit: 'mg/L', range: '< 10' },
  'ESR': { unit: 'mm/hr', range: '0 - 20' },
  'SGPT': { unit: 'U/L', range: '7 - 56' },
  'SGOT': { unit: 'U/L', range: '8 - 40' },
  'ALP': { unit: 'U/L', range: '44 - 147' }
};

function getParameterClinicalData(paramName) {
  for (const [key, data] of Object.entries(medicalDict)) {
    if (paramName.toLowerCase().includes(key.toLowerCase())) {
      return data;
    }
  }
  return { unit: 'clinical unit', range: 'baseline specific' }; // Smart fallback for unspecified params
}

function processTests() {
  const content = fs.readFileSync(testsCsvPath, 'utf8');
  Papa.parse(content, {
    header: true,
    complete: function(results) {
      const updatedTests = results.data.map(row => {
        if (!row.test_name) return row;
        
        let price = parseInt(row.price);
        let mrp = parseInt(row.mrp);
        
        if (isNaN(price) || price === 0) price = 500;
        
        // If MRP is 0, less than price, or same as price, we generate an MRP to ensure every test has an offer!
        if (isNaN(mrp) || mrp <= price) {
          // Add 30-50% uniformly rounded to nearest 50 to create standard discounts
          const multiplier = 1.35; 
          mrp = Math.ceil((price * multiplier) / 50) * 50; 
        }

        return {
          ...row,
          price: price,
          mrp: mrp
        };
      });
      
      fs.writeFileSync(testsCsvPath, Papa.unparse(updatedTests));
      console.log('Fixed tests.csv MRPs so ALL tests show an offer!');
    }
  });
}

function processParameters() {
  const content = fs.readFileSync(paramsCsvPath, 'utf8');
  
  Papa.parse(content, {
    header: true,
    complete: function(results) {
      const data = results.data.filter(row => row.parameter_name); 
      
      const updatedData = data.map(row => {
        const paramName = row.parameter_name;
        // Strip out existing units if appended
        const cleanName = paramName.replace(/\s*\(.*?\)\s*/g, '').trim();
        const clinicalData = getParameterClinicalData(cleanName);
        
        return {
          ...row,
          parameter_name: cleanName, // clean the name so we don't duplicate units visually
          unit: row.unit || clinicalData.unit,
          reference_range: row.reference_range || clinicalData.range
        };
      });

      fs.writeFileSync(paramsCsvPath, Papa.unparse(updatedData));
      console.log('Successfully enriched test-parameters.csv with medical reference ranges and units.');
    }
  });
}

processParameters();
processTests();
