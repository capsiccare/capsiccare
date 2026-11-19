import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.join(__dirname, '..');

// We will use papaparse which is installed
import Papa from 'papaparse';

const csvPath = path.join(projectRoot, 'public', 'data', 'tests.csv');

// Common units mapping
const unitMap = {
  'Glucose': 'mg/dL',
  'Cholesterol': 'mg/dL',
  'Triglycerides': 'mg/dL',
  'HDL': 'mg/dL',
  'LDL': 'mg/dL',
  'VLDL': 'mg/dL',
  'Creatinine': 'mg/dL',
  'Urea': 'mg/dL',
  'Uric Acid': 'mg/dL',
  'Bilirubin': 'mg/dL',
  'Protein': 'g/dL',
  'Albumin': 'g/dL',
  'Globulin': 'g/dL',
  'Calcium': 'mg/dL',
  'Phosphorus': 'mg/dL',
  'Sodium': 'mEq/L',
  'Potassium': 'mEq/L',
  'Chloride': 'mEq/L',
  'Iron': 'µg/dL',
  'Hemoglobin': 'g/dL',
  'RBC': 'millions/cu.mm',
  'WBC': 'cells/cu.mm',
  'Platelet': 'lakhs/cu.mm',
  'Vitamin B12': 'pg/mL',
  'Vitamin D': 'ng/mL',
  'TSH': 'µIU/mL',
  'T3': 'ng/dL',
  'T4': 'µg/dL',
  'Testosterone': 'ng/dL',
  'Cortisol': 'µg/dL',
  'Insulin': 'µIU/mL',
  'HbA1c': '%',
  'Microalbumin': 'mg/L',
  'CRP': 'mg/L',
  'ESR': 'mm/hr',
};

function getUnitForParameter(paramName) {
  for (const [key, unit] of Object.entries(unitMap)) {
    if (paramName.toLowerCase().includes(key.toLowerCase())) {
      return ` (${unit})`;
    }
  }
  return '';
}

function processCSV() {
  const content = fs.readFileSync(csvPath, 'utf8');
  
  Papa.parse(content, {
    header: true,
    complete: function(results) {
      const data = results.data.filter(row => row.test_name); // filter out empty rows
      
      const updatedData = data.map(row => {
        // Price logic:
        // Current headers: test_id,test_name,slug,category_id,discount_price,Price,sample_type,preparation,turnaround_time,description,parameters,report_type,home_collection_available,status
        // We need to map Price -> mrp and discount_price -> price
        const originalPrice = parseInt(row.Price) || 0;
        let discountPrice = parseInt(row.discount_price) || 0;
        
        // If discount price is 0 or same as original, it's just the normal price
        if (discountPrice === 0) {
          discountPrice = originalPrice;
        }

        // Descriptions logic
        const testName = row.test_name;
        
        let customShort = `Get accurate and reliable diagnostic insights. Book home collection today for prompt results.`;
        if (testName.toLowerCase().includes('blood') || testName.toLowerCase().includes('hemogram')) {
          customShort = `Comprehensive blood analysis to monitor your vital health indicators with precision.`;
        } else if (testName.toLowerCase().includes('urine')) {
          customShort = `Detailed urinary screening to detect early signs of metabolic and kidney conditions.`;
        } else if (testName.toLowerCase().includes('culture')) {
          customShort = `Advanced microbiological testing to pinpoint infections and guide effective treatments.`;
        } else if (testName.toLowerCase().includes('profile') || testName.toLowerCase().includes('panel')) {
          customShort = `A complete diagnostic profile designed to give you a 360-degree view of your health.`;
        } else if (testName.toLowerCase().includes('vitamin')) {
          customShort = `Check your nutritional levels accurately to maintain optimal energy and wellness.`;
        }

        const customFull = `This diagnostic evaluation is crucial for clinical assessment and preventive health monitoring. Utilising state-of-the-art laboratory technology, this investigation provides precise metrics that help your physician make informed medical decisions. Regular screening can play a pivotal role in early detection, effective management, and proactive care for your overall well-being. Strict quality control ensures high accuracy and reliability of your results.`;

        // Parameters logic
        let params = row.parameters ? row.parameters.split(',').map(p => p.trim()) : [];
        let updatedParams = params.map(p => {
          if (p && !p.includes('(') && !p.includes(')')) {
            return p + getUnitForParameter(p);
          }
          return p;
        }).join(', ');

        return {
          test_id: row.test_id,
          test_name: row.test_name,
          slug: row.slug,
          category_id: row.category_id,
          price: discountPrice, // selling price
          mrp: originalPrice, // original price
          sample_type: row.sample_type,
          preparation: row.preparation,
          turnaround_time: row.turnaround_time,
          short_description: customShort,
          full_description: customFull,
          parameters: updatedParams,
          report_type: row.report_type,
          home_collection_available: row.home_collection_available,
          status: row.status
        };
      });

      const csvOutput = Papa.unparse(updatedData);
      fs.writeFileSync(csvPath, csvOutput);
      console.log('Successfully processed tests.csv');
    }
  });
}

processCSV();
