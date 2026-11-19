-- Add prescription upload support to bookings table
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS prescription_path VARCHAR;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS prescription_uploaded_at TIMESTAMP;

-- Create a storage bucket for prescriptions if it doesn't exist
-- This is typically done through Supabase dashboard, but documented here for reference
-- Bucket name: prescription-files
-- Access: private (authenticated users only)
