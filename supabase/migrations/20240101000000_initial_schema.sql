-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 1. Clean up existing tables to ensure clean state (optional, remove if preserving data)
DROP TABLE IF EXISTS predictions CASCADE;
DROP TABLE IF EXISTS user_activity CASCADE;
DROP TABLE IF EXISTS weather_data CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- 2. Create users table (Syncs with auth.users)
CREATE TABLE users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email VARCHAR(255) UNIQUE NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'visualizador' CHECK (role IN ('admin', 'visualizador')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_login TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT true
);

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Helper function to prevent recursion in policies
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

-- Policies
CREATE POLICY "Users can view own profile" ON users FOR SELECT USING (auth.uid() = id);
-- Use the secure function instead of direct query to avoid infinite recursion
CREATE POLICY "Admin can view all users" ON users FOR SELECT USING (is_admin());

-- 3. Trigger to automatically create public user on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, role)
  VALUES (new.id, new.email, 'visualizador');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger definition
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 4. Weather Data Table
CREATE TABLE weather_data (
    id BIGSERIAL PRIMARY KEY,
    city VARCHAR(100) NOT NULL,
    latitude DECIMAL(8,6) NOT NULL,
    longitude DECIMAL(9,6) NOT NULL,
    temperature DECIMAL(5,2) NOT NULL,
    humidity DECIMAL(5,2) NOT NULL,
    weather_timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
    ingestion_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    data_source VARCHAR(50) DEFAULT 'open-meteo'
);

CREATE INDEX idx_weather_data_city ON weather_data(city);
CREATE INDEX idx_weather_data_timestamp ON weather_data(weather_timestamp);
CREATE UNIQUE INDEX idx_weather_data_unique ON weather_data(city, weather_timestamp);

ALTER TABLE weather_data ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view weather data" ON weather_data FOR SELECT USING (true);
CREATE POLICY "Admin can insert weather data" ON weather_data FOR INSERT WITH CHECK (is_admin());

-- 5. User Activity Table
CREATE TABLE user_activity (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    activity_type VARCHAR(50) NOT NULL,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE user_activity ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own activity" ON user_activity FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admin can view all activity" ON user_activity FOR SELECT USING (is_admin());

-- 6. Predictions Table
CREATE TABLE predictions (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    city VARCHAR(100) NOT NULL,
    model_type VARCHAR(50) NOT NULL,
    prediction_results JSONB NOT NULL,
    accuracy_score DECIMAL(5,4),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE predictions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own predictions" ON predictions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admin can view all predictions" ON predictions FOR SELECT USING (is_admin());

-- Grant permissions
GRANT SELECT ON weather_data TO anon;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO authenticated;
