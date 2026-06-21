-- Migration: Add RPC function for Admin to create/register new Royalty Partners
-- This bypasses client-side signup restrictions by creating user records directly in auth.users and public.users tables.

CREATE OR REPLACE FUNCTION admin_create_partner(
    p_email TEXT,
    p_full_name TEXT,
    p_partner_type TEXT,
    p_npwp TEXT DEFAULT NULL,
    p_bank_name TEXT DEFAULT NULL,
    p_bank_account_number TEXT DEFAULT NULL,
    p_bank_account_holder TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    v_user_id UUID;
    v_encrypted_pw TEXT;
BEGIN
    -- Check if user already exists in auth.users
    SELECT id INTO v_user_id FROM auth.users WHERE email = p_email;
    
    IF v_user_id IS NULL THEN
        v_user_id := gen_random_uuid();
        -- Generate default password 'partner123!' encrypted using crypt
        v_encrypted_pw := crypt('partner123!', gen_salt('bf'));
        
        -- Insert into auth.users
        INSERT INTO auth.users (
            id,
            instance_id,
            email,
            encrypted_password,
            email_confirmed_at,
            raw_app_meta_data,
            raw_user_meta_data,
            created_at,
            updated_at,
            role,
            confirmation_token,
            recovery_token,
            email_change_token_new,
            email_change
        )
        VALUES (
            v_user_id,
            '00000000-0000-0000-0000-000000000000',
            p_email,
            v_encrypted_pw,
            now(),
            '{"provider":"email","providers":["email"]}'::jsonb,
            jsonb_build_object('full_name', p_full_name),
            now(),
            now(),
            'authenticated',
            '',
            '',
            '',
            ''
        );
    END IF;
    
    -- Insert/Update public.users
    INSERT INTO public.users (
        id,
        full_name,
        email,
        role,
        status,
        partner_type,
        npwp,
        bank_name,
        bank_account_number,
        bank_account_holder
    )
    VALUES (
        v_user_id,
        p_full_name,
        p_email,
        'author',
        'APPROVED',
        p_partner_type,
        p_npwp,
        p_bank_name,
        p_bank_account_number,
        p_bank_account_holder
    )
    ON CONFLICT (id) DO UPDATE SET
        full_name = EXCLUDED.full_name,
        partner_type = EXCLUDED.partner_type,
        npwp = EXCLUDED.npwp,
        bank_name = EXCLUDED.bank_name,
        bank_account_number = EXCLUDED.bank_account_number,
        bank_account_holder = EXCLUDED.bank_account_holder;
        
    RETURN v_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
