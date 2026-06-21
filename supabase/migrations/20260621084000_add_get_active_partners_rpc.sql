-- Migration: Add RPC function to securely get active royalty partners
-- This function runs with SECURITY DEFINER to bypass RLS on public.users for guest/author users
-- returning only necessary public information (id, full_name, partner_type) to prevent data leaks.

CREATE OR REPLACE FUNCTION get_active_partners()
RETURNS TABLE (id UUID, full_name VARCHAR(255), partner_type VARCHAR(50)) AS $$
BEGIN
    RETURN QUERY 
    SELECT u.id, u.full_name, u.partner_type 
    FROM public.users u
    WHERE u.partner_type IS NOT NULL
    ORDER BY u.full_name ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
