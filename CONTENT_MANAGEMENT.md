# Content Management Guide (CRUD Instructions)

This project uses an incredibly fast Static Site Generation architecture. Instead of relying on a slow, expensive external database, all of the website's content is driven by local configuration files. This ensures your app has state-of-the-art SEO capabilities and sub-second load times.

Here is your master instruction manual on where to go to perform Read, Write, Edit, and Delete (CRUD) operations for every piece of content dynamically injected into the website.

---

## 🦠 Diagnostic Lab Tests & Health Packages
*To Add, Edit, or Delete Lab Tests, Packages, and Parameters.*

1. **Individual Tests**: 
   - File: `public/data/tests.csv`
   - *How to update*: Open the CSV in Excel or Google Sheets. To add a new test, create a new row with a unique ID and fill in the columns (Name, Price, Turnaround Time, etc). To delete, heavily delete the row.
2. **Categories**:
   - File: `public/data/categories.csv`
3. **Health Packages (Full Body Checkups)**:
   - File: `public/data/packages.csv`
   - *Link tests to a package*: Open `public/data/package_tests.csv` and add a new row linking the Package ID to the individual Test ID.
4. **Test Parameters**:
   - File: `public/data/test-parameters.csv`
   - *How to update*: Use this file to map the breakdown of components (like Red Blood Cells or Cholesterol) to a specific Test ID.

---

## 🗺️ Areas & Hyper-Local SEO Coverage
*To expand Capsic Care's geographical reach footprint to new municipalities, sub-divisions, and districts.*

1. **Service Areas Database**:
   - File: `public/data/service_areas.csv`
   - *How to update*: Add a geographical zone (e.g., Belur, Howrah, Salt Lake) and its parent district. 
2. **Assigning Tests to Local Areas**:
   - File: `public/data/area_test_pages.csv`
   - *How to update*: Create thousands of hyper-local programmatic SEO pages (e.g., "Full Body Checkup in Belur") by linking a Test ID to an Area ID. Our engine will dynamically generate the highly-optimized page endpoints!

---

## 🤕 Diseases & Symptoms Engine
*To link Lab Tests to Medical Conditions for patients unsure of what to book.*

1. **Diseases File**: `public/data/diseases.csv`
2. **Link Tests to Diseases**: `public/data/disease_tests.csv`
3. **Symptoms File**: `public/data/symptoms_engine.csv`
4. **Link Tests to Symptoms**: `public/data/symptom_tests.csv`
   - *Example*: In `symptoms_engine.csv` add ID "S1" with name "Joint Pain". In `symptom_tests.csv`, map "S1" to Test ID "T45" (Arthritis Profile). The Next.js engine will automatically construct the new `/tests-for-[symptom]` endpoint routing tests.

---

## ✍️ Blog & Articles Publishing
*To publish Health Insights, Medical Journal Posts, and News.*

1. **File Location**: `lib/blog-content.ts`
2. **How to Update**:
   This is a TypeScript module containing an array of your live articles. To Create, Edit, or Delete an article, locate the `blogArticles` variable.
   
```typescript
export const blogArticles = [
  {
    id: 'cholesterol-management', // The SEO-friendly URL Slug (e.g., capsiccare.com/blog/cholesterol-management)
    title: 'Top 5 Foods for Lowering Cholesterol',
    excerpt: 'Discover the most effective dietary interventions...',
    content: '## Introduction\n\nFull article text goes here...',
    author: 'Capsic Care Desk',
    date: '2023-11-20',
    readTime: 4,
    category: 'Nutrition',
    image: 'https://images.unsplash.com/your-image-url'
  },
  // Add more articles here...
]
```
*Note: Because this is a `.ts` file rather than a `.csv`, ensure that string values are wrapped in quotes (`'`) and your format adheres to the JavaScript structure!*

---

### Deploying Your Updates
Whenever you modify ANY of the CSV files in `public/data/` or the scripts in `lib/`, those changes are instantly detected locally. 

When you push the codebase to your Github Repository linked to Vercel, the Next.js compiler will ingest all your new rows and dynamically map, interlink, and construct the Static Sites on its extremely fast edge servers globally.
