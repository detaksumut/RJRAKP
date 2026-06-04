-- Initial Schema for RJRAKP (Revised)

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Function to handle updated_at
CREATE OR REPLACE FUNCTION handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Users
CREATE TABLE users (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  full_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  phone VARCHAR(50),
  role VARCHAR(50) NOT NULL CHECK(role IN ('author', 'reviewer', 'editor', 'admin')) DEFAULT 'author',
  status VARCHAR(50) NOT NULL CHECK(status IN ('PENDING', 'APPROVED', 'REJECTED', 'SUSPENDED')) DEFAULT 'PENDING',
  institution VARCHAR(255),
  faculty VARCHAR(255),
  study_program VARCHAR(255),
  degree_level VARCHAR(100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
CREATE TRIGGER handle_updated_at_users BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

-- Get User Role Helper Function
CREATE OR REPLACE FUNCTION get_user_role()
RETURNS VARCHAR AS $$
  SELECT role FROM users WHERE id = auth.uid() LIMIT 1;
$$ LANGUAGE sql SECURITY DEFINER;

-- Reviewer Profiles
CREATE TABLE reviewer_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  academic_title VARCHAR(100),
  affiliation VARCHAR(255) NOT NULL,
  faculty VARCHAR(255),
  education_level VARCHAR(100),
  expertise_area TEXT,
  orcid_id VARCHAR(100),
  google_scholar VARCHAR(255),
  publications TEXT,
  cv_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
CREATE TRIGGER handle_updated_at_reviewer_profiles BEFORE UPDATE ON reviewer_profiles FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

-- Editor Profiles
CREATE TABLE editor_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  academic_title VARCHAR(100),
  affiliation VARCHAR(255) NOT NULL,
  faculty VARCHAR(255),
  education_level VARCHAR(100),
  expertise_area TEXT,
  editorial_experience TEXT,
  orcid_id VARCHAR(100),
  google_scholar VARCHAR(255),
  cv_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
CREATE TRIGGER handle_updated_at_editor_profiles BEFORE UPDATE ON editor_profiles FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

-- Journals
CREATE TABLE journals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  description TEXT,
  e_issn VARCHAR(50),
  p_issn VARCHAR(50),
  status VARCHAR(50) DEFAULT 'active' CHECK(status IN ('active', 'inactive', 'preparation')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
CREATE TRIGGER handle_updated_at_journals BEFORE UPDATE ON journals FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

-- Journal Scopes
CREATE TABLE journal_scopes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  journal_id UUID REFERENCES journals(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
CREATE TRIGGER handle_updated_at_journal_scopes BEFORE UPDATE ON journal_scopes FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

-- Journal Volumes
CREATE TABLE journal_volumes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  journal_id UUID REFERENCES journals(id) ON DELETE CASCADE,
  volume_number VARCHAR(50) NOT NULL,
  year INTEGER NOT NULL,
  status VARCHAR(50) DEFAULT 'active' CHECK(status IN ('active', 'archived')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
CREATE TRIGGER handle_updated_at_journal_volumes BEFORE UPDATE ON journal_volumes FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

-- Journal Issues
CREATE TABLE journal_issues (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  volume_id UUID REFERENCES journal_volumes(id) ON DELETE CASCADE,
  issue_number VARCHAR(50) NOT NULL,
  title VARCHAR(255),
  description TEXT,
  status VARCHAR(50) DEFAULT 'draft' CHECK(status IN ('draft', 'published', 'archived')),
  publication_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
CREATE TRIGGER handle_updated_at_journal_issues BEFORE UPDATE ON journal_issues FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

-- Articles
CREATE TABLE articles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  journal_id UUID REFERENCES journals(id) ON DELETE SET NULL,
  submitter_id UUID REFERENCES users(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  abstract TEXT,
  keywords VARCHAR(255),
  manuscript_file TEXT,
  supplementary_file TEXT,
  status VARCHAR(50) DEFAULT 'submitted',
  submission_date TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
CREATE TRIGGER handle_updated_at_articles BEFORE UPDATE ON articles FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

-- Article Authors
CREATE TABLE article_authors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  article_id UUID REFERENCES articles(id) ON DELETE CASCADE,
  full_name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  affiliation VARCHAR(255),
  is_corresponding BOOLEAN DEFAULT false,
  author_order INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
CREATE TRIGGER handle_updated_at_article_authors BEFORE UPDATE ON article_authors FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

-- Review Assignments
CREATE TABLE review_assignments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  article_id UUID REFERENCES articles(id) ON DELETE CASCADE,
  reviewer_id UUID REFERENCES users(id) ON DELETE CASCADE,
  status VARCHAR(50) DEFAULT 'assigned',
  assigned_date TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  due_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
CREATE TRIGGER handle_updated_at_review_assignments BEFORE UPDATE ON review_assignments FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

-- Reviews
CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  assignment_id UUID REFERENCES review_assignments(id) ON DELETE CASCADE,
  comments_for_author TEXT,
  comments_for_editor TEXT,
  recommendation VARCHAR(50),
  submitted_date TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
CREATE TRIGGER handle_updated_at_reviews BEFORE UPDATE ON reviews FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

-- Editorial Decisions
CREATE TABLE editorial_decisions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  article_id UUID REFERENCES articles(id) ON DELETE CASCADE,
  editor_id UUID REFERENCES users(id) ON DELETE SET NULL,
  decision VARCHAR(50) NOT NULL,
  comments TEXT,
  decision_date TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
CREATE TRIGGER handle_updated_at_editorial_decisions BEFORE UPDATE ON editorial_decisions FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

-- Article Revisions
CREATE TABLE article_revisions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  article_id UUID REFERENCES articles(id) ON DELETE CASCADE,
  revision_number INTEGER NOT NULL,
  notes TEXT,
  submitted_date TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
CREATE TRIGGER handle_updated_at_article_revisions BEFORE UPDATE ON article_revisions FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

-- Publications
CREATE TABLE publications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  article_id UUID REFERENCES articles(id) ON DELETE CASCADE,
  issue_number VARCHAR(50),
  volume_number VARCHAR(50),
  publication_date TIMESTAMP WITH TIME ZONE,
  doi VARCHAR(255),
  doi_registered BOOLEAN DEFAULT false,
  doi_registered_at TIMESTAMP WITH TIME ZONE,
  pdf_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
CREATE TRIGGER handle_updated_at_publications BEFORE UPDATE ON publications FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

-- Acceptance Letters
CREATE TABLE acceptance_letters (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  article_id UUID REFERENCES articles(id) ON DELETE CASCADE UNIQUE,
  letter_number VARCHAR(100),
  file_url TEXT,
  issued_date TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
CREATE TRIGGER handle_updated_at_acceptance_letters BEFORE UPDATE ON acceptance_letters FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

-- Publication Certificates
CREATE TABLE publication_certificates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  article_id UUID REFERENCES articles(id) ON DELETE CASCADE UNIQUE,
  certificate_number VARCHAR(100),
  file_url TEXT,
  issued_date TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
CREATE TRIGGER handle_updated_at_publication_certificates BEFORE UPDATE ON publication_certificates FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

-- Documents
CREATE TABLE documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  related_type VARCHAR(50) NOT NULL, -- 'article', 'revision', 'reviewer_cv', 'editor_cv'
  related_id UUID NOT NULL,
  document_type VARCHAR(100) NOT NULL, -- 'manuscript', 'supplementary', 'cv'
  file_url TEXT NOT NULL,
  file_name VARCHAR(255),
  uploaded_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
CREATE TRIGGER handle_updated_at_documents BEFORE UPDATE ON documents FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

-- Notifications
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  link_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
CREATE TRIGGER handle_updated_at_notifications BEFORE UPDATE ON notifications FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

-- Initial Data for Journals
INSERT INTO journals (name, slug, description, status) VALUES 
('Jurnal Audit Kebijakan Publik', 'audit-kebijakan-publik', 'Fokus pada evaluasi dan audit implementasi kebijakan publik di Indonesia.', 'preparation'),
('Jurnal Hukum dan Keadilan', 'hukum-dan-keadilan', 'Fokus pada kajian ilmu hukum dan penegakan keadilan sosial.', 'preparation'),
('Jurnal Pendidikan dan Pembelajaran', 'pendidikan-dan-pembelajaran', 'Fokus pada inovasi, model, dan metode pendidikan di tingkat dasar hingga tinggi.', 'preparation'),
('Jurnal Teknik dan Teknologi', 'teknik-dan-teknologi', 'Fokus pada kajian keteknikan, rekayasa teknologi, dan inovasi industri.', 'preparation'),
('Jurnal Agama dan Peradaban Islam', 'agama-dan-peradaban-islam', 'Fokus pada kajian peradaban Islam, hukum Islam, dan sosial-budaya agama.', 'preparation');


-- =======================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =======================================================

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviewer_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE editor_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE journals ENABLE ROW LEVEL SECURITY;
ALTER TABLE journal_scopes ENABLE ROW LEVEL SECURITY;
ALTER TABLE journal_volumes ENABLE ROW LEVEL SECURITY;
ALTER TABLE journal_issues ENABLE ROW LEVEL SECURITY;
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE article_authors ENABLE ROW LEVEL SECURITY;
ALTER TABLE review_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE editorial_decisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE article_revisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE publications ENABLE ROW LEVEL SECURITY;
ALTER TABLE acceptance_letters ENABLE ROW LEVEL SECURITY;
ALTER TABLE publication_certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- 1. Users table
-- Anyone can read (so relations like submitter_id work), but only self/admin can update
CREATE POLICY "Public profiles are viewable by everyone." ON users FOR SELECT USING (true);
CREATE POLICY "Users can insert own profile." ON users FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update own profile." ON users FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Admins have full access to users." ON users FOR ALL USING (get_user_role() = 'admin');

-- 2. Profiles (Reviewer & Editor)
CREATE POLICY "Profiles are viewable by everyone." ON reviewer_profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert own reviewer profile." ON reviewer_profiles FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can manage own reviewer profile." ON reviewer_profiles FOR ALL USING (user_id = auth.uid());
CREATE POLICY "Admins have full access to reviewer profiles." ON reviewer_profiles FOR ALL USING (get_user_role() = 'admin');

CREATE POLICY "Profiles are viewable by everyone." ON editor_profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert own editor profile." ON editor_profiles FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can manage own editor profile." ON editor_profiles FOR ALL USING (user_id = auth.uid());
CREATE POLICY "Admins have full access to editor profiles." ON editor_profiles FOR ALL USING (get_user_role() = 'admin');

-- 3. Journals, Scopes, Volumes, Issues (Public Read, Admin/Editor Write)
CREATE POLICY "Journal resources are viewable by everyone." ON journals FOR SELECT USING (true);
CREATE POLICY "Admin/Editors can manage journals." ON journals FOR ALL USING (get_user_role() IN ('admin', 'editor'));

CREATE POLICY "Scopes are viewable by everyone." ON journal_scopes FOR SELECT USING (true);
CREATE POLICY "Admin/Editors can manage scopes." ON journal_scopes FOR ALL USING (get_user_role() IN ('admin', 'editor'));

CREATE POLICY "Volumes are viewable by everyone." ON journal_volumes FOR SELECT USING (true);
CREATE POLICY "Admin/Editors can manage volumes." ON journal_volumes FOR ALL USING (get_user_role() IN ('admin', 'editor'));

CREATE POLICY "Issues are viewable by everyone." ON journal_issues FOR SELECT USING (true);
CREATE POLICY "Admin/Editors can manage issues." ON journal_issues FOR ALL USING (get_user_role() IN ('admin', 'editor'));

-- 4. Articles
-- Read: Everyone can read if 'published' or similar, else Submitter, Reviewer(assigned), Editor, Admin
CREATE POLICY "Submitters can read own articles" ON articles FOR SELECT USING (auth.uid() = submitter_id);
CREATE POLICY "Reviewers can read assigned articles" ON articles FOR SELECT USING (
  EXISTS (SELECT 1 FROM review_assignments WHERE article_id = articles.id AND reviewer_id = auth.uid())
);
CREATE POLICY "Editors and Admins can read all articles" ON articles FOR SELECT USING (get_user_role() IN ('admin', 'editor'));
CREATE POLICY "Everyone can read published articles" ON articles FOR SELECT USING (status = 'published');

-- Write: Submitter (only if not published/rejected, but for simplicity let them update own), Editor, Admin
CREATE POLICY "Submitters can create articles" ON articles FOR INSERT WITH CHECK (auth.uid() = submitter_id);
CREATE POLICY "Submitters can update own articles" ON articles FOR UPDATE USING (auth.uid() = submitter_id);
CREATE POLICY "Editors and Admins can manage articles" ON articles FOR ALL USING (get_user_role() IN ('admin', 'editor'));

-- 5. Article Authors (Same visibility rules mostly)
CREATE POLICY "Authors viewable by everyone" ON article_authors FOR SELECT USING (true);
CREATE POLICY "Submitter can manage article authors" ON article_authors FOR ALL USING (
  EXISTS (SELECT 1 FROM articles WHERE id = article_authors.article_id AND submitter_id = auth.uid())
);
CREATE POLICY "Editors and Admins can manage article authors" ON article_authors FOR ALL USING (get_user_role() IN ('admin', 'editor'));

-- 6. Article Revisions
CREATE POLICY "Submitters view own revisions" ON article_revisions FOR SELECT USING (
  EXISTS (SELECT 1 FROM articles WHERE id = article_revisions.article_id AND submitter_id = auth.uid())
);
CREATE POLICY "Submitters create revisions" ON article_revisions FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM articles WHERE id = article_revisions.article_id AND submitter_id = auth.uid())
);
CREATE POLICY "Reviewers view assigned article revisions" ON article_revisions FOR SELECT USING (
  EXISTS (SELECT 1 FROM review_assignments WHERE article_id = article_revisions.article_id AND reviewer_id = auth.uid())
);
CREATE POLICY "Editors and admins manage revisions" ON article_revisions FOR ALL USING (get_user_role() IN ('admin', 'editor'));

-- 7. Review Assignments & Reviews
CREATE POLICY "Reviewers view own assignments" ON review_assignments FOR SELECT USING (reviewer_id = auth.uid());
CREATE POLICY "Reviewers manage own reviews" ON reviews FOR ALL USING (
  EXISTS (SELECT 1 FROM review_assignments WHERE id = reviews.assignment_id AND reviewer_id = auth.uid())
);
CREATE POLICY "Editors and Admins manage review assignments" ON review_assignments FOR ALL USING (get_user_role() IN ('admin', 'editor'));
CREATE POLICY "Editors and Admins manage reviews" ON reviews FOR ALL USING (get_user_role() IN ('admin', 'editor'));
CREATE POLICY "Submitters view own article reviews" ON reviews FOR SELECT USING (
  EXISTS (SELECT 1 FROM review_assignments ra JOIN articles a ON ra.article_id = a.id WHERE ra.id = reviews.assignment_id AND a.submitter_id = auth.uid())
);

-- 8. Editorial Decisions
CREATE POLICY "Submitters view own decisions" ON editorial_decisions FOR SELECT USING (
  EXISTS (SELECT 1 FROM articles WHERE id = editorial_decisions.article_id AND submitter_id = auth.uid())
);
CREATE POLICY "Editors and Admins manage decisions" ON editorial_decisions FOR ALL USING (get_user_role() IN ('admin', 'editor'));

-- 9. Publications, Certificates, Acceptance Letters
CREATE POLICY "Publications viewable by everyone" ON publications FOR SELECT USING (true);
CREATE POLICY "Admin/Editors manage publications" ON publications FOR ALL USING (get_user_role() IN ('admin', 'editor'));

CREATE POLICY "Certificates viewable by everyone" ON publication_certificates FOR SELECT USING (true);
CREATE POLICY "Admin/Editors manage certificates" ON publication_certificates FOR ALL USING (get_user_role() IN ('admin', 'editor'));

CREATE POLICY "Acceptance Letters viewable by submitter" ON acceptance_letters FOR SELECT USING (
  EXISTS (SELECT 1 FROM articles WHERE id = acceptance_letters.article_id AND submitter_id = auth.uid())
);
CREATE POLICY "Admin/Editors manage acceptance letters" ON acceptance_letters FOR ALL USING (get_user_role() IN ('admin', 'editor'));

-- 10. Documents
CREATE POLICY "Public view of documents" ON documents FOR SELECT USING (true);
CREATE POLICY "Users can manage own uploaded documents" ON documents FOR ALL USING (uploaded_by = auth.uid());
CREATE POLICY "Admin/Editors can manage all documents" ON documents FOR ALL USING (get_user_role() IN ('admin', 'editor'));

-- 11. Notifications
CREATE POLICY "Users clear own notifications" ON notifications FOR ALL USING (user_id = auth.uid());
CREATE POLICY "Admin/Editors create notifications" ON notifications FOR ALL USING (get_user_role() IN ('admin', 'editor'));


-- =======================================================
-- FINAL REVISIONS: ADDED COLUMNS AND ACTIVITY LOGS
-- =======================================================

-- 1. ORCID PENULIS
ALTER TABLE article_authors ADD COLUMN orcid_id VARCHAR(100);

-- 2. QR CODE VERIFIKASI SERTIFIKAT
ALTER TABLE publication_certificates ADD COLUMN qr_code_url TEXT;
ALTER TABLE publication_certificates ADD COLUMN verification_code VARCHAR(100) UNIQUE;

-- 3. STATUS DOI
ALTER TABLE publications ADD COLUMN doi_status VARCHAR(50) DEFAULT 'pending' CHECK(doi_status IN ('pending', 'submitted', 'registered', 'failed'));

-- 4. ACTIVITY LOGS
CREATE TABLE activity_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  entity_type VARCHAR(100),
  entity_id UUID,
  ip_address VARCHAR(100),
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 5. RLS ACTIVITY LOGS
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert own logs" ON activity_logs FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can view all logs" ON activity_logs FOR SELECT USING (get_user_role() = 'admin');
CREATE POLICY "Users can view own logs" ON activity_logs FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Editors can view all logs" ON activity_logs FOR SELECT USING (get_user_role() = 'editor');

