-- Create global_chats table
CREATE TABLE IF NOT EXISTS global_chats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    guest_name TEXT,
    message TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE global_chats ENABLE ROW LEVEL SECURITY;

-- Allow everyone (authenticated and anonymous) to view chats
CREATE POLICY "Allow anyone to view chats" 
ON global_chats FOR SELECT 
USING (true);

-- Allow anyone to insert messages
CREATE POLICY "Allow anyone to insert chats" 
ON global_chats FOR INSERT 
WITH CHECK (true);

-- Enable Realtime for the table
ALTER PUBLICATION supabase_realtime ADD TABLE global_chats;
