-- Rename column kol_boost_budget to kol_budget in import_post table
-- This fixes the field name to match the frontend expectations

-- Rename the column
ALTER TABLE public.import_post 
RENAME COLUMN kol_boost_budget TO kol_budget;

-- Verify the change
-- You can check with: \d import_post in psql to see the updated schema
