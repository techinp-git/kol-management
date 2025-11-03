-- Check current enum values for user_role
SELECT enumlabel 
FROM pg_enum 
WHERE enumtypid = 'user_role'::regtype 
ORDER BY enumsortorder;

-- Add missing enum values if they don't exist
DO $$ 
BEGIN
    -- Add 'brand' if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM pg_enum 
        WHERE enumlabel = 'brand' 
        AND enumtypid = 'user_role'::regtype
    ) THEN
        ALTER TYPE user_role ADD VALUE 'brand';
    END IF;
    
    -- Add 'kol' if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM pg_enum 
        WHERE enumlabel = 'kol' 
        AND enumtypid = 'user_role'::regtype
    ) THEN
        ALTER TYPE user_role ADD VALUE 'kol';
    END IF;
    
    -- Add 'admin' if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM pg_enum 
        WHERE enumlabel = 'admin' 
        AND enumtypid = 'user_role'::regtype
    ) THEN
        ALTER TYPE user_role ADD VALUE 'admin';
    END IF;
    
    -- Add 'analyst' if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM pg_enum 
        WHERE enumlabel = 'analyst' 
        AND enumtypid = 'user_role'::regtype
    ) THEN
        ALTER TYPE user_role ADD VALUE 'analyst';
    END IF;
END $$;

-- Verify the enum values
SELECT enumlabel 
FROM pg_enum 
WHERE enumtypid = 'user_role'::regtype 
ORDER BY enumsortorder;
