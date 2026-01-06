-- Allow anyone to view predictions (for public dashboard)
-- Or specifically system generated predictions where user_id is NULL

CREATE POLICY "Anyone can view system predictions" 
ON predictions 
FOR SELECT 
USING (user_id IS NULL);

-- Grant select permission to anon role if not already granted via "ALL TABLES"
GRANT SELECT ON predictions TO anon;
