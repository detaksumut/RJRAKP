-- RLS Policies for honorarium_payments
-- Allow each user to read their own honorarium records
ALTER TABLE honorarium_payments ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Users can view own honorarium payments" ON honorarium_payments;
DROP POLICY IF EXISTS "Admins can view all honorarium payments" ON honorarium_payments;
DROP POLICY IF EXISTS "Admins can insert honorarium payments" ON honorarium_payments;
DROP POLICY IF EXISTS "Admins can update honorarium payments" ON honorarium_payments;

-- Allow authenticated users to read their own honorarium records
CREATE POLICY "Users can view own honorarium payments"
  ON honorarium_payments FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Allow admin/editor to view all honorarium records
CREATE POLICY "Admins can view all honorarium payments"
  ON honorarium_payments FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role IN ('admin', 'editor')
    )
  );

-- Allow admin to insert honorarium records
CREATE POLICY "Admins can insert honorarium payments"
  ON honorarium_payments FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role IN ('admin', 'editor')
    )
  );

-- Allow admin to update honorarium records (e.g. mark as PAID)
CREATE POLICY "Admins can update honorarium payments"
  ON honorarium_payments FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role IN ('admin', 'editor')
    )
  );

-- Ensure editor_in_chief rate exists
INSERT INTO honorarium_rates (role_key, role_name, amount)
VALUES ('editor_in_chief', 'Editor in Chief', 300000)
ON CONFLICT (role_key) DO NOTHING;
