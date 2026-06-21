-- Migration: Add Referral-based Royalty Payment System and NPWP Field

-- 1. Add NPWP, partner_type, and referred_by columns to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS npwp VARCHAR(50);
ALTER TABLE users ADD COLUMN IF NOT EXISTS partner_type VARCHAR(50) DEFAULT NULL CHECK (partner_type IN ('lembaga', 'personal'));
ALTER TABLE users ADD COLUMN IF NOT EXISTS referred_by UUID REFERENCES users(id) ON DELETE SET NULL;

-- 2. Insert standard rates into honorarium_rates
INSERT INTO honorarium_rates (role_key, role_name, amount) VALUES
('royalty_referrer_lembaga', 'Royalti Referal (Lembaga)', 150000),
('royalty_referrer_personal', 'Royalti Referal (Personal)', 100000)
ON CONFLICT (role_key) DO UPDATE SET amount = EXCLUDED.amount;

-- 3. Update generate_article_honorariums to automatically award royalty to the referrer
CREATE OR REPLACE FUNCTION generate_article_honorariums(p_article_id UUID)
RETURNS VOID AS $$
DECLARE
    v_reviewer RECORD;
    v_editor RECORD;
    v_reviewer_amount DECIMAL(12,2);
    v_editor_amount DECIMAL(12,2);
    v_royalty_amount DECIMAL(12,2);
    v_submitter_id UUID;
    v_referrer_id UUID;
    v_referrer_type VARCHAR(50);
    v_exists INT;
BEGIN
    -- Check if honorarium already generated to prevent duplicates
    SELECT COUNT(*) INTO v_exists FROM honorarium_payments WHERE article_id = p_article_id;
    IF v_exists > 0 THEN
        RETURN;
    END IF;

    -- 1. Reviewer Honorariums
    FOR v_reviewer IN 
        SELECT DISTINCT ra.reviewer_id, rp.orcid_id, rp.google_scholar, rp.sinta_id 
        FROM review_assignments ra
        JOIN reviews r ON r.assignment_id = ra.id
        LEFT JOIN reviewer_profiles rp ON ra.reviewer_id = rp.user_id
        WHERE ra.article_id = p_article_id
    LOOP
        -- Check if they have an ID
        IF (v_reviewer.orcid_id IS NOT NULL AND v_reviewer.orcid_id != '') OR 
           (v_reviewer.google_scholar IS NOT NULL AND v_reviewer.google_scholar != '') OR 
           (v_reviewer.sinta_id IS NOT NULL AND v_reviewer.sinta_id != '') THEN
            
            SELECT amount INTO v_reviewer_amount FROM honorarium_rates WHERE role_key = 'reviewer_with_id';
            INSERT INTO honorarium_payments (user_id, article_id, role_key, amount, description)
            VALUES (v_reviewer.reviewer_id, p_article_id, 'reviewer_with_id', COALESCE(v_reviewer_amount, 250000), 'Honorarium Reviewer (Ber-ID)');
        ELSE
            SELECT amount INTO v_reviewer_amount FROM honorarium_rates WHERE role_key = 'reviewer_no_id';
            INSERT INTO honorarium_payments (user_id, article_id, role_key, amount, description)
            VALUES (v_reviewer.reviewer_id, p_article_id, 'reviewer_no_id', COALESCE(v_reviewer_amount, 100000), 'Honorarium Reviewer (Non-ID)');
        END IF;
    END LOOP;

    -- 2. Editor Honorariums (who made decisions)
    FOR v_editor IN
        SELECT DISTINCT editor_id FROM editorial_decisions WHERE article_id = p_article_id
    LOOP
        SELECT amount INTO v_editor_amount FROM honorarium_rates WHERE role_key = 'editor';
        INSERT INTO honorarium_payments (user_id, article_id, role_key, amount, description)
        VALUES (v_editor.editor_id, p_article_id, 'editor', COALESCE(v_editor_amount, 200000), 'Honorarium Editor Artikel');
    END LOOP;

    -- 3. Automatic Referral Royalty for Referrer
    SELECT submitter_id INTO v_submitter_id FROM articles WHERE id = p_article_id;
    IF v_submitter_id IS NOT NULL THEN
        SELECT referred_by INTO v_referrer_id FROM users WHERE id = v_submitter_id;
        IF v_referrer_id IS NOT NULL THEN
            SELECT partner_type INTO v_referrer_type FROM users WHERE id = v_referrer_id;
            
            IF v_referrer_type = 'lembaga' THEN
                SELECT amount INTO v_royalty_amount FROM honorarium_rates WHERE role_key = 'royalty_referrer_lembaga';
                INSERT INTO honorarium_payments (user_id, article_id, role_key, amount, description)
                VALUES (v_referrer_id, p_article_id, 'royalty_referrer_lembaga', COALESCE(v_royalty_amount, 150000), 'Royalti Referal (Lembaga)');
            ELSIF v_referrer_type = 'personal' THEN
                SELECT amount INTO v_royalty_amount FROM honorarium_rates WHERE role_key = 'royalty_referrer_personal';
                INSERT INTO honorarium_payments (user_id, article_id, role_key, amount, description)
                VALUES (v_referrer_id, p_article_id, 'royalty_referrer_personal', COALESCE(v_royalty_amount, 100000), 'Royalti Referal (Personal)');
            END IF;
        END IF;
    END IF;

END;
$$ LANGUAGE plpgsql;
