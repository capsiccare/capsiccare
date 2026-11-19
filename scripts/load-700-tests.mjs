import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('[ERROR] Supabase credentials not found in environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Parse CSV file
function parseCSV(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');
  const headers = lines[0].split(',').map(h => h.trim());
  
  const data = [];
  for (let i = 1; i < lines.length; i++) {
    if (!lines[i].trim()) continue;
    
    const values = lines[i].split(',').map(v => v.trim());
    const row = {};
    headers.forEach((header, index) => {
      row[header] = values[index] || null;
    });
    data.push(row);
  }
  
  return data;
}

// Load tests
async function loadTests() {
  try {
    console.log('[INFO] Starting test data loading...');
    
    const testsPath = path.join(process.cwd(), 'public/data/tests.csv');
    const parametersPath = path.join(process.cwd(), 'public/data/test-parameters.csv');
    
    if (!fs.existsSync(testsPath)) {
      console.error('[ERROR] Tests CSV file not found at', testsPath);
      return;
    }
    
    console.log('[INFO] Parsing tests CSV...');
    const tests = parseCSV(testsPath);
    console.log(`[INFO] Found ${tests.length} tests to load`);
    
    // Load parameters if available
    let parameters = [];
    if (fs.existsSync(parametersPath)) {
      console.log('[INFO] Parsing parameters CSV...');
      parameters = parseCSV(parametersPath);
      console.log(`[INFO] Found ${parameters.length} parameters`);
    }
    
    // Batch insert tests (in chunks of 50)
    const chunkSize = 50;
    let insertedCount = 0;
    
    for (let i = 0; i < tests.length; i += chunkSize) {
      const chunk = tests.slice(i, i + chunkSize);
      const formattedChunk = chunk.map(test => ({
        test_id: test['test_id'] || test['Test ID'] || `TST${String(i).padStart(4, '0')}`,
        test_name: test['test_name'] || test['Test Name'] || 'Unknown Test',
        category_id: test['category_id'] || test['Category'] || null,
        price: parseFloat(test['price'] || test['Price'] || 0),
        description: test['description'] || test['Description'] || '',
        home_collection: test['home_collection'] === 'true' || test['Home Collection'] === 'Yes' || true,
        report_time: test['report_time'] || test['Report Time'] || '24 hours',
        fasting_required: test['fasting_required'] === 'true' || test['Fasting Required'] === 'Yes' || false,
        preparation: test['preparation'] || test['Preparation'] || '',
        includes: test['includes'] || test['Includes'] || '',
      }));
      
      const { error } = await supabase
        .from('lab_tests')
        .upsert(formattedChunk, { onConflict: 'test_id' });
      
      if (error) {
        console.error(`[ERROR] Failed to insert chunk ${Math.floor(i / chunkSize) + 1}:`, error);
      } else {
        insertedCount += formattedChunk.length;
        console.log(`[INFO] Inserted ${insertedCount}/${tests.length} tests...`);
      }
    }
    
    console.log(`[SUCCESS] Loaded ${insertedCount} tests into database`);
    
    // Load parameters
    if (parameters.length > 0) {
      const paramChunkSize = 100;
      let paramInsertedCount = 0;
      
      for (let i = 0; i < parameters.length; i += paramChunkSize) {
        const chunk = parameters.slice(i, i + paramChunkSize);
        const formattedChunk = chunk.map(param => ({
          parameter_id: param['parameter_id'] || param['Parameter ID'] || `PARAM${i}`,
          parameter_name: param['parameter_name'] || param['Parameter Name'] || '',
          test_id: param['test_id'] || param['Test ID'] || '',
          normal_range: param['normal_range'] || param['Normal Range'] || '',
          unit: param['unit'] || param['Unit'] || '',
        }));
        
        const { error } = await supabase
          .from('test_parameters')
          .upsert(formattedChunk, { onConflict: 'parameter_id' });
        
        if (error) {
          console.error(`[ERROR] Failed to insert parameter chunk:`, error);
        } else {
          paramInsertedCount += formattedChunk.length;
          console.log(`[INFO] Inserted ${paramInsertedCount}/${parameters.length} parameters...`);
        }
      }
      
      console.log(`[SUCCESS] Loaded ${paramInsertedCount} parameters into database`);
    }
    
  } catch (error) {
    console.error('[ERROR] Failed to load test data:', error);
  }
}

// Run the loader
loadTests();
