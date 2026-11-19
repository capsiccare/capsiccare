import fs from "fs"
import path from "path"
import Papa from "papaparse"
import {
  CsvTest,
  CsvCategory,
  CsvTestParameter,
  CsvPackage,
  CsvSymptom,
  CsvServiceArea,
  CsvDisease,
  CsvDiseaseSeoContent,
  Test,
  Category,
  Parameter,
  Package,
  ServiceArea,
  Disease,
  Symptom,
  FAQ,
} from "./types"

// Simple in-memory cache for server-side
let diagnosticDataCache: {
  tests: Test[];
  categories: Category[];
  packages: Package[];
  symptoms: Symptom[];
  diseases: Disease[];
  serviceAreas: ServiceArea[];
  faqs: FAQ[];
} | null = null;

function readCsv<T>(filename: string): T[] {
  try {
    const filePath = path.join(process.cwd(), "public", "data", filename);
    const fileContent = fs.readFileSync(filePath, "utf8");
    const parsed = Papa.parse<T>(fileContent, {
      header: true,
      skipEmptyLines: true,
    });
    return parsed.data;
  } catch (error) {
    console.error(`Error reading ${filename}:`, error);
    return [];
  }
}

// Generates a URL-friendly slug if missing
function createSlug(text: string): string {
  if (!text) return "";
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function getDiagnosticData() {
  if (diagnosticDataCache) {
    return diagnosticDataCache;
  }

  // 1. Read Raw CSVs
  const csvTests = readCsv<CsvTest>("tests.csv");
  const csvCategories = readCsv<CsvCategory>("categories.csv");
  const csvParameters = readCsv<CsvTestParameter>("test-parameters.csv");
  const csvPackages = readCsv<CsvPackage>("packages.csv");
  const csvServiceAreas = readCsv<CsvServiceArea>("service_areas.csv");
  const csvDiseases = readCsv<CsvDisease>("diseases.csv");
  const csvSymptoms = readCsv<CsvSymptom>("symptoms_engine.csv");
  const csvSeoContent = readCsv<CsvDiseaseSeoContent>("disease_seo_content.csv");
  const csvFaqs = readCsv<any>("faqs.csv");
  
  // Mapping tables
  const csvPackageTestsRaw = readCsv<{package_id: string, test_id: string}>("package-tests.csv");
  const csvAreaTestsRaw = readCsv<{test_id: string, area_id: string}>("area_test_pages.csv");
  const csvDiseaseTestsRaw = readCsv<{disease_id: string, test_id: string, recommendation_level: string}>("disease_tests.csv");
  const csvSymptomTestsRaw = readCsv<{symptom_id: string, test_id: string}>("symptom_tests.csv");

  // 2. Map Service Areas
  const serviceAreasMap = new Map<string, ServiceArea>();
  const serviceAreas: ServiceArea[] = csvServiceAreas.map(a => {
    const area = {
      id: a.area_id,
      name: a.area_name,
      slug: a.area_slug || createSlug(a.area_name),
      district: a.district
    };
    serviceAreasMap.set(a.area_id, area);
    return area;
  });

  // 3. Map Categories
  const categoriesMap = new Map<string, Category>();
  const categories: Category[] = csvCategories.map((c) => {
    const cat: Category = {
      id: c.category_id,
      name: c.category_name,
      slug: c.category_slug || createSlug(c.category_name),
      description: c.description,
      icon: c.icon,
    };
    categoriesMap.set(c.category_id, cat);
    return cat;
  });

  // 4. Map Parameters to Tests
  const parametersMap = new Map<string, Parameter[]>();
  csvParameters.forEach((p) => {
    const list = parametersMap.get(p.test_id) || [];
    list.push({
      id: p.parameter_id,
      name: p.parameter_name,
      unit: p.unit,
      reference_range: p.reference_range,
    });
    parametersMap.set(p.test_id, list);
  });

  // 5. Build Map of Area IDs to Test IDs
  const testServiceAreasMap = new Map<string, ServiceArea[]>();
  csvAreaTestsRaw.forEach(mapping => {
    const area = serviceAreasMap.get(mapping.area_id);
    if (area) {
      const areas = testServiceAreasMap.get(mapping.test_id) || [];
      areas.push(area);
      testServiceAreasMap.set(mapping.test_id, areas);
    }
  });

  // 6. Map Tests
  const testsMap = new Map<string, Test>();
  const tests: Test[] = csvTests.map((t) => {
    const testCat = categoriesMap.get(t.category_id) || {
      id: "unknown",
      name: "Uncategorized",
      slug: "uncategorized",
    };

    const test: Test = {
      id: t.test_id,
      name: t.test_name,
      slug: createSlug(t.test_name),
      category_id: t.category_id,
      category: testCat,
       price: parseFloat(t.price || "0") || 0,
      mrp: parseFloat(t.mrp || "0") || parseFloat(t.price || "0") || 0,
      sample_type: t.sample_type,
      preparation: t.preparation,
      turnaround_time: t.turnaround_time,
      short_description: t.short_description || (t as any).description || "", // Fallback if old csv is used
      full_description: t.full_description || (t as any).description || "",
      report_type: t.report_type,
      home_collection_available: t.home_collection_available?.toLowerCase() === "yes",
      status: t.status,
      parameters: parametersMap.get(t.test_id) || [],
      service_areas: testServiceAreasMap.get(t.test_id) || [],
    };
    testsMap.set(t.test_id, test);
    return test;
  });

  // 7. Map Packages
  const packages: Package[] = csvPackages.map((p) => {
    const packageTestLinks = csvPackageTestsRaw.filter(link => link.package_id === p.package_id);
    const includedTests = packageTestLinks
      .map(link => testsMap.get(link.test_id))
      .filter((t): t is Test => t !== undefined);

    return {
      id: p.package_id,
      name: p.package_name,
      slug: p.package_slug || createSlug(p.package_name),
      price: parseFloat(p.price) || 0,
      discount_price: parseFloat(p.discount_price) || 0,
      tests_included_count: parseInt(p.tests_included_count) || includedTests.length,
      fasting_required: p.fasting_required?.toLowerCase() === "yes",
      turnaround_time: p.turnaround_time,
      description: p.description,
      status: p.status,
      tests: includedTests,
    };
  });

  // 8. Map Diseases
  const seoMap = new Map<string, CsvDiseaseSeoContent>();
  csvSeoContent.forEach(seo => seoMap.set(seo.entity_id, seo));

  const diseases: Disease[] = csvDiseases.map(d => {
    const seo = seoMap.get(d.disease_id);
    const testLinks = csvDiseaseTestsRaw.filter(link => link.disease_id === d.disease_id);
    const includedTests = testLinks
      .map(link => testsMap.get(link.test_id))
      .filter((t): t is Test => t !== undefined);

    return {
      id: d.disease_id,
      name: d.disease_name,
      slug: createSlug(d.disease_name),
      seo_title: seo?.seo_title,
      seo_description: seo?.seo_description,
      seo_keywords: seo?.seo_keywords,
      content_body: seo?.content_body,
      recommended_tests: includedTests,
    };
  });

  // 9. Map Symptoms
  const symptoms: Symptom[] = csvSymptoms.map(s => {
    const testLinks = csvSymptomTestsRaw.filter(link => link.symptom_id === s.symptom_id);
    const includedTests = testLinks
      .map(link => testsMap.get(link.test_id))
      .filter((t): t is Test => t !== undefined);

    return {
      id: s.symptom_id,
      name: s.symptom_name,
      slug: createSlug(s.symptom_name),
      recommended_tests: includedTests,
    };
  });

  // 10. Map FAQs
  const faqs: FAQ[] = csvFaqs.map((f: any) => ({
    id: f.faq_id || createSlug(f.question),
    category: f.category || 'General',
    question: f.question,
    answer: f.answer
  })).filter((f: any) => f.question && f.answer);

  diagnosticDataCache = {
    tests,
    categories,
    packages,
    symptoms,
    diseases,
    serviceAreas,
    faqs,
  };

  return diagnosticDataCache;
}
