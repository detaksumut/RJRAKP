-- Create opinions table
CREATE TABLE IF NOT EXISTS opinions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  lecturer_phone VARCHAR(50) NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  status VARCHAR(50) DEFAULT 'published' CHECK(status IN ('draft', 'published', 'archived')) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Handle updated_at trigger
CREATE TRIGGER handle_updated_at_opinions BEFORE UPDATE ON opinions FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

-- Enable RLS
ALTER TABLE opinions ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Public read access to published opinions" ON opinions FOR SELECT USING (status = 'published');
CREATE POLICY "Users can create own opinions" ON opinions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own opinions" ON opinions FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own opinions" ON opinions FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "Admins have full access to opinions" ON opinions FOR ALL USING (get_user_role() = 'admin');
