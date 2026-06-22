-- Upgrade to Professional Editorial Board & Reviewer Management System

-- 1. Add user_id column to board_members table
ALTER TABLE board_members 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES users(id) ON DELETE SET NULL;

-- 2. Add reviewer_class column to reviewer_profiles table
ALTER TABLE reviewer_profiles 
ADD COLUMN IF NOT EXISTS reviewer_class VARCHAR(50) DEFAULT 'EXTERNAL' CHECK(reviewer_class IN ('ON_BOARD', 'EXTERNAL'));

-- 3. Match existing board members to registered users based on name
UPDATE board_members bm
SET user_id = u.id
FROM users u
WHERE bm.user_id IS NULL 
  AND (u.full_name ILIKE '%' || bm.name || '%' OR bm.name ILIKE '%' || u.full_name || '%');

-- 4. Set reviewer_class = 'ON_BOARD' for reviewers who are in the board_members table
UPDATE reviewer_profiles rp
SET reviewer_class = 'ON_BOARD'
WHERE rp.user_id IN (
  SELECT bm.user_id 
  FROM board_members bm
  WHERE bm.user_id IS NOT NULL AND bm.role ILIKE '%reviewer%'
);
