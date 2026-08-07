-- =================================================================
-- AYUTRACE COMPLETE SUPABASE SCHEMA & AUTOMATED USER PROFILES TRIGGER
-- =================================================================

-- 1. PROFILES TABLE (Linked to auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('farmer', 'consumer', 'logistics', 'seller')),
  region TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- 2. WAREHOUSES TABLE (IoT Telemetry)
CREATE TABLE IF NOT EXISTS public.warehouses (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  location_city TEXT NOT NULL,
  current_temp_c NUMERIC NOT NULL,
  humidity_pct NUMERIC NOT NULL,
  pest_alert BOOLEAN DEFAULT FALSE,
  rank_score INT DEFAULT 100,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- 3. HARVEST BATCHES TABLE (Crop Traceability)
CREATE TABLE IF NOT EXISTS public.harvest_batches (
  batch_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  crop_name TEXT NOT NULL,
  farmer_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  harvest_date DATE DEFAULT CURRENT_DATE NOT NULL,
  quantity_kg NUMERIC NOT NULL,
  warehouse_id TEXT REFERENCES public.warehouses(id) ON DELETE SET NULL,
  status TEXT DEFAULT 'harvested' CHECK (status IN ('harvested', 'in_transit', 'stored', 'delivered')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- 4. DYNAMIC PRICING TABLE (Dynamic Markdown Engine)
CREATE TABLE IF NOT EXISTS public.dynamic_pricing (
  batch_id UUID PRIMARY KEY REFERENCES public.harvest_batches(batch_id) ON DELETE CASCADE,
  original_price NUMERIC(10,2) NOT NULL,
  discount_pct INT DEFAULT 0 NOT NULL,
  discounted_price NUMERIC(10,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- =================================================================
-- AUTOMATIC PROFILES POSTGRES TRIGGER & FUNCTION
-- Creates a row in public.profiles whenever a new user signs up in auth.users
-- =================================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role, region)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'AyuTrace User'),
    COALESCE(NEW.raw_user_meta_data->>'role', 'consumer'),
    COALESCE(NEW.raw_user_meta_data->>'region', 'India')
  )
  ON CONFLICT (id) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    role = EXCLUDED.role,
    region = EXCLUDED.region;
  RETURN NEW;
END;
$$;

-- Attach trigger to auth.users table
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.warehouses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.harvest_batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dynamic_pricing ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public profiles viewable" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Public warehouses viewable" ON public.warehouses FOR SELECT USING (true);
CREATE POLICY "Public harvest batches viewable" ON public.harvest_batches FOR SELECT USING (true);
CREATE POLICY "Public dynamic pricing viewable" ON public.dynamic_pricing FOR SELECT USING (true);

CREATE POLICY "Authenticated users insert batches" ON public.harvest_batches FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users insert pricing" ON public.dynamic_pricing FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- =================================================================
-- SEED DATA FOR DEMO FUNCTIONALITY
-- =================================================================

-- Seed Warehouses
INSERT INTO public.warehouses (id, name, location_city, current_temp_c, humidity_pct, pest_alert, rank_score) VALUES
('WH-GWL-01', 'Gwalior Central Cold Depot', 'Gwalior', 4.2, 85.0, FALSE, 98),
('WH-NSK-01', 'Nashik Perishable Agri Hub', 'Nashik', 11.5, 92.0, TRUE, 45), -- Temp breach & pest alert!
('WH-IND-01', 'Indore Malwa Silo Hub', 'Indore', 3.8, 82.0, FALSE, 96),
('WH-DEL-01', 'Azadpur Terminal Depot', 'Delhi', 5.0, 88.0, FALSE, 91)
ON CONFLICT (id) DO UPDATE SET
  current_temp_c = EXCLUDED.current_temp_c,
  humidity_pct = EXCLUDED.humidity_pct,
  pest_alert = EXCLUDED.pest_alert,
  rank_score = EXCLUDED.rank_score;
