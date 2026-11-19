#!/usr/bin/env python3
import csv
import sys

def generate_sql_from_csv(csv_file_path):
    """Generate SQL INSERT statements from CSV file"""
    
    sql_statements = []
    
    try:
        with open(csv_file_path, 'r', encoding='utf-8') as f:
            csv_reader = csv.DictReader(f)
            
            for row in csv_reader:
                if not row.get('test_id'):
                    continue
                
                # Escape single quotes in strings
                def escape_sql(value):
                    if value is None or value == '':
                        return 'NULL'
                    value_str = str(value).replace("'", "''")
                    return f"'{value_str}'"
                
                # Extract values
                test_id = escape_sql(row.get('test_id', ''))
                test_name = escape_sql(row.get('test_name', ''))
                category_id = escape_sql(row.get('category_id', ''))
                price = row.get('price', '0')
                sample_type = escape_sql(row.get('sample_type', ''))
                preparation = escape_sql(row.get('preparation', ''))
                turnaround_time = escape_sql(row.get('turnaround_time', '24 hours'))
                short_description = escape_sql(row.get('short_description', ''))
                full_description = escape_sql(row.get('full_description', ''))
                report_type = escape_sql(row.get('report_type', 'PDF'))
                home_collection = 'true' if str(row.get('home_collection_available', 'Yes')).lower() in ['yes', 'true'] else 'false'
                status = escape_sql(row.get('status', 'Active'))
                
                # Create INSERT statement
                sql = f"""
INSERT INTO lab_tests (test_id, name, description, category, price, home_collection, report_time, preparation, sample_type, status, created_at, updated_at)
VALUES ({test_id}, {test_name}, {full_description}, {category_id}, {price}, {home_collection}, {turnaround_time}, {preparation}, {sample_type}, {status}, NOW(), NOW())
ON CONFLICT (test_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  price = EXCLUDED.price,
  updated_at = NOW();
"""
                sql_statements.append(sql.strip())
    
    except Exception as e:
        print(f"Error processing CSV: {e}", file=sys.stderr)
        return None
    
    return '\n\n'.join(sql_statements)

if __name__ == '__main__':
    csv_path = '/vercel/share/v0-project/public/data/tests.csv'
    sql = generate_sql_from_csv(csv_path)
    
    if sql:
        # Write to output file
        output_path = '/vercel/share/v0-project/scripts/bulk-insert-tests.sql'
        with open(output_path, 'w', encoding='utf-8') as f:
            f.write(sql)
        print(f"Generated SQL file: {output_path}")
        print(f"Total records: {sql.count('INSERT INTO')}")
    else:
        print("Failed to generate SQL", file=sys.stderr)
        sys.exit(1)
