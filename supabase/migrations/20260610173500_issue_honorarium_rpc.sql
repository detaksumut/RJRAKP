ALTER TABLE staff_assignments DROP CONSTRAINT IF EXISTS staff_assignments_check;

CREATE OR REPLACE FUNCTION generate_issue_honorariums(p_issue_id UUID)
RETURNS VOID AS $$
DECLARE
    v_staff RECORD;
    v_amount DECIMAL(12,2);
    v_exists INT;
BEGIN
    -- Prevent duplicate generation for the same issue
    SELECT COUNT(*) INTO v_exists FROM honorarium_payments WHERE issue_id = p_issue_id AND article_id IS NULL;
    IF v_exists > 0 THEN
        RETURN;
    END IF;

    -- 1. Get Global Staff (issue_id IS NULL and article_id IS NULL)
    FOR v_staff IN 
        SELECT user_id, role_key FROM staff_assignments 
        WHERE issue_id IS NULL AND article_id IS NULL
    LOOP
        SELECT amount INTO v_amount FROM honorarium_rates WHERE role_key = v_staff.role_key;
        IF FOUND THEN
            INSERT INTO honorarium_payments (user_id, issue_id, role_key, amount, description)
            VALUES (v_staff.user_id, p_issue_id, v_staff.role_key, v_amount, 'Honorarium Tetap per Edisi Terbit');
        END IF;
    END LOOP;

    -- 2. Get Issue-Specific Staff (issue_id = p_issue_id and article_id IS NULL)
    FOR v_staff IN 
        SELECT user_id, role_key FROM staff_assignments 
        WHERE issue_id = p_issue_id AND article_id IS NULL
    LOOP
        SELECT amount INTO v_amount FROM honorarium_rates WHERE role_key = v_staff.role_key;
        IF FOUND THEN
            INSERT INTO honorarium_payments (user_id, issue_id, role_key, amount, description)
            VALUES (v_staff.user_id, p_issue_id, v_staff.role_key, v_amount, 'Honorarium Penugasan Edisi');
        END IF;
    END LOOP;
END;
$$ LANGUAGE plpgsql;
