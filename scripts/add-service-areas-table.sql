-- Create service_areas table for managing service locations
CREATE TABLE IF NOT EXISTS service_areas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  state VARCHAR(100) NOT NULL UNIQUE,
  districts TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_service_areas_state ON service_areas(state);
CREATE INDEX IF NOT EXISTS idx_service_areas_active ON service_areas(is_active);

-- Insert default West Bengal configuration
INSERT INTO service_areas (state, districts, is_active) 
VALUES (
  'West Bengal',
  ARRAY[
    'Kolkata',
    'Howrah',
    'West Midnapore',
    'East Midnapore',
    'Nadia',
    'North 24 Parganas',
    'South 24 Parganas',
    'Birbhum',
    'Bankura',
    'Purba Bardhaman',
    'Paschim Bardhaman',
    'Jalpaiguri',
    'Darjeeling',
    'Kalimpong'
  ],
  true
)
ON CONFLICT (state) DO NOTHING;
