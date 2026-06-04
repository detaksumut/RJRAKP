DROP POLICY IF EXISTS "Admins have full access to users." ON users;
CREATE POLICY "Admins have full access to users." ON users FOR ALL USING (get_user_role() = 'admin') WITH CHECK (get_user_role() = 'admin');

-- Tambahan: memastikan admin bisa update dan log tidak error
DROP POLICY IF EXISTS "Users can insert own logs" ON activity_logs;
CREATE POLICY "Users can insert own logs" ON activity_logs FOR INSERT WITH CHECK (true);
