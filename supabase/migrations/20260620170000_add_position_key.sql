-- Add position_key column to users table for fine-grained role assignment
ALTER TABLE users ADD COLUMN IF NOT EXISTS position_key VARCHAR(50) DEFAULT NULL;
ALTER TABLE users ADD COLUMN IF NOT EXISTS position_label VARCHAR(100) DEFAULT NULL;

-- Optional: index for fast lookup
CREATE INDEX IF NOT EXISTS idx_users_position_key ON users(position_key);

COMMENT ON COLUMN users.position_key IS 'Jabatan spesifik yang ditunjuk admin: editor_in_chief, co_editor, cover_editor, layout_editor, reviewer_with_id, reviewer_no_id, finance_operator, sdm, ahli_arsiparis, managing_director';
COMMENT ON COLUMN users.position_label IS 'Label jabatan yang ditampilkan di sistem, contoh: Editor in Chief, Cover Editor, dll';
