export interface CsvTest {
  test_id: string;
  test_name: string;
  category_id: string;
  price: string;
  sample_type: string;
  preparation: string;
  turnaround_time: string;
  short_description: string;
  full_description: string;
  report_type: string;
  home_collection_available: string;
  status: string;
  mrp?: string;
}

export interface CsvCategory {
  category_id: string;
  category_name: string;
  category_slug: string;
  description: string;
  icon: string;
  status: string;
}

export interface CsvTestParameter {
  parameter_id: string;
  test_id: string;
  parameter_name: string;
  unit: string;
  reference_range: string;
}

export interface CsvPackage {
  package_id: string;
  package_name: string;
  package_slug: string;
  price: string;
  discount_price: string;
  tests_included_count: string;
  fasting_required: string;
  turnaround_time: string;
  description: string;
  status: string;
}

export interface CsvSymptom {
  symptom_id: string;
  symptom_name: string;
}

export interface CsvServiceArea {
  area_id: string;
  area_name: string;
  area_slug: string;
  district: string;
  service_type: string;
  status: string;
}

export interface CsvDiseaseSeoContent {
  entity_type: string;
  entity_id: string;
  seo_title: string;
  seo_description: string;
  seo_keywords: string;
  content_body: string;
}

export interface CsvDisease {
  disease_id: string;
  disease_name: string;
}

// Relational / Aggregated Types that the UI will use

export interface Parameter {
  id: string;
  name: string;
  unit?: string;
  reference_range?: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
}

export interface Test {
  id: string;
  name: string;
  slug: string;
  category_id: string;
  category: Category;
  price: number;
  sample_type: string;
  preparation: string;
  turnaround_time: string;
  short_description: string;
  full_description: string;
  report_type: string;
  home_collection_available: boolean;
  status: string;
  mrp?: number;
  parameters: Parameter[];
  service_areas?: ServiceArea[];
}

export interface ServiceArea {
  id: string;
  name: string;
  slug: string;
  district: string;
}

export interface Disease {
  id: string;
  name: string;
  slug: string;
  seo_title?: string;
  seo_description?: string;
  seo_keywords?: string;
  content_body?: string;
  recommended_tests: Test[];
}

export interface Symptom {
  id: string;
  name: string;
  slug: string;
  recommended_tests: Test[];
}

export interface Package {
  id: string;
  name: string;
  slug: string;
  price: number;
  discount_price: number;
  tests_included_count: number;
  fasting_required: boolean;
  turnaround_time: string;
  description: string;
  status: string;
  tests: Test[]; // Mapped relation
}

export interface FAQ {
  id: string;
  category: string;
  question: string;
  answer: string;
}
