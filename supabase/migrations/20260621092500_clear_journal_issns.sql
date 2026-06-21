-- Clear seeded ISSN numbers from all journals to display placeholder hyphens initially.
-- Users can inject/update them later via the admin dashboard.
UPDATE journals SET p_issn = NULL, e_issn = NULL;
