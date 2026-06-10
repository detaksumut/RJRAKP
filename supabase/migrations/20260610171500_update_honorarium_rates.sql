-- Update existing rates that changed
UPDATE honorarium_rates SET amount = 100000 WHERE role_key = 'finance_operator';
UPDATE honorarium_rates SET amount = 200000 WHERE role_key = 'sdm';

-- Insert new rate for Direktur
INSERT INTO honorarium_rates (role_key, role_name, amount) 
VALUES ('direktur', 'Direktur', 200000)
ON CONFLICT (role_key) DO UPDATE SET amount = EXCLUDED.amount;
