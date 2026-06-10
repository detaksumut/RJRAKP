CREATE OR REPLACE FUNCTION generate_article_honorariums(p_article_id UUID)
RETURNS VOID AS $$
DECLARE
    v_reviewer RECORD;
    v_editor RECORD;
    v_reviewer_amount DECIMAL(12,2);
    v_editor_amount DECIMAL(12,2);
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

END;
$$ LANGUAGE plpgsql;
