-- Fix infinite recursion in users RLS policy

-- 1. Create a secure function to check admin status without triggering RLS loop
-- SECURITY DEFINER ensures the function runs with the privileges of the creator (postgres),
-- bypassing the RLS on the users table that causes the recursion.
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM public.users
    WHERE id = auth.uid()
    AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Drop the problematic policy on users table
DROP POLICY IF EXISTS "Admin can view all users" ON public.users;

-- 3. Re-create the policy using the secure function
CREATE POLICY "Admin can view all users" ON public.users
FOR SELECT USING (
  is_admin()
);

-- 4. Update other tables' admin policies to use the efficient function
-- Weather Data
DROP POLICY IF EXISTS "Admin can insert weather data" ON public.weather_data;
CREATE POLICY "Admin can insert weather data" ON public.weather_data 
FOR INSERT WITH CHECK (is_admin());

-- User Activity
DROP POLICY IF EXISTS "Admin can view all activity" ON public.user_activity;
CREATE POLICY "Admin can view all activity" ON public.user_activity 
FOR SELECT USING (is_admin());

-- Predictions
DROP POLICY IF EXISTS "Admin can view all predictions" ON public.predictions;
CREATE POLICY "Admin can view all predictions" ON public.predictions 
FOR SELECT USING (is_admin());
