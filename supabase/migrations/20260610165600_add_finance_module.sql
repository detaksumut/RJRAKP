-- honorarium_rates
CREATE TABLE honorarium_rates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    role_key VARCHAR(50) UNIQUE NOT NULL,
    role_name VARCHAR(100) NOT NULL,
    amount DECIMAL(12, 2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
CREATE TRIGGER handle_updated_at_honorarium_rates BEFORE UPDATE ON honorarium_rates FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

-- insert default rates
INSERT INTO honorarium_rates (role_key, role_name, amount) VALUES
('reviewer_no_id', 'Reviewer (Non-ID)', 100000),
('reviewer_with_id', 'Reviewer (Sinta/Orcid/Scholar ID)', 250000),
('editor', 'Editor', 200000),
('editor_in_chief', 'Editor in Chief', 300000),
('administrator', 'Administrator', 100000),
('cover_editor', 'Editor Cover', 50000),
('layout_editor', 'Editor Layout', 50000),
('finance_operator', 'Finance / Operator Publish', 50000),
('sdm', 'SDM', 100000);

-- staff_assignments (to assign people to specific roles on issues or articles)
CREATE TABLE staff_assignments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    issue_id UUID REFERENCES journal_issues(id) ON DELETE CASCADE,
    article_id UUID REFERENCES articles(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    role_key VARCHAR(50) REFERENCES honorarium_rates(role_key) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    CHECK (issue_id IS NOT NULL OR article_id IS NOT NULL)
);
CREATE TRIGGER handle_updated_at_staff_assignments BEFORE UPDATE ON staff_assignments FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

-- honorarium_payments
CREATE TABLE honorarium_payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    article_id UUID REFERENCES articles(id) ON DELETE CASCADE,
    issue_id UUID REFERENCES journal_issues(id) ON DELETE CASCADE,
    role_key VARCHAR(50) REFERENCES honorarium_rates(role_key) ON DELETE SET NULL,
    amount DECIMAL(12, 2) NOT NULL,
    status VARCHAR(50) DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'PAID', 'CANCELLED')),
    payment_date TIMESTAMP WITH TIME ZONE,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
CREATE TRIGGER handle_updated_at_honorarium_payments BEFORE UPDATE ON honorarium_payments FOR EACH ROW EXECUTE FUNCTION handle_updated_at();
