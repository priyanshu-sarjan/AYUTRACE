-- =================================================================
-- AYUTRACE PRODUCTION-READY SEED DATA & DYNAMIC WAREHOUSE RANKING ENGINE
-- Focus: Spoilage mitigation, cold-chain IoT, GIS geo-tagging,
-- priority dispatching, and farm-to-fork QR traceability.
-- =================================================================

-- 1. PROFILES (Farmers, Warehouse Managers, Labs, Consumers)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('farmer', 'lab_inspector', 'distributor', 'consumer', 'seller')),
  organization TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- 2. DISTRIBUTION HUBS / WAREHOUSES (With IoT Sensors & Location)
CREATE TABLE IF NOT EXISTS public.warehouses (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  lat NUMERIC NOT NULL,
  lon NUMERIC NOT NULL,
  current_temp_c NUMERIC NOT NULL,
  humidity_pct NUMERIC NOT NULL,
  pest_detected BOOLEAN DEFAULT FALSE,
  storage_capacity_tonnes NUMERIC NOT NULL,
  occupied_capacity_tonnes NUMERIC NOT NULL,
  rank_score INT DEFAULT 100,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- 3. CROP MASTER (Shelf Life & Transportation Priority)
CREATE TABLE IF NOT EXISTS public.crop_catalog (
  id SERIAL PRIMARY KEY,
  crop_name TEXT UNIQUE NOT NULL,
  category TEXT NOT NULL,
  shelf_life_days INT NOT NULL,
  transport_priority INT NOT NULL, -- 1 (Highest/Express) to 3 (Lowest/Standard)
  ideal_temp_c NUMERIC NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- 4. RAW MATERIAL BATCHES & SPOILAGE METRICS
CREATE TABLE IF NOT EXISTS public.raw_batches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  batch_code TEXT UNIQUE NOT NULL,
  herb_name TEXT NOT NULL,
  farmer_id UUID REFERENCES public.profiles(id),
  geo_location TEXT NOT NULL,
  harvest_date DATE DEFAULT CURRENT_DATE NOT NULL,
  quantity_kg NUMERIC NOT NULL,
  status TEXT DEFAULT 'harvested' CHECK (status IN ('harvested', 'testing', 'processed', 'delivered')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- 5. LAB QUALITY REPORTS
CREATE TABLE IF NOT EXISTS public.lab_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  batch_id UUID REFERENCES public.raw_batches(id) ON DELETE CASCADE,
  lab_inspector_id UUID REFERENCES public.profiles(id),
  purity_percentage NUMERIC(5,2) NOT NULL,
  moisture_level NUMERIC(5,2) NOT NULL,
  heavy_metal_test BOOLEAN DEFAULT TRUE,
  pesticide_free BOOLEAN DEFAULT TRUE,
  certificate_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- 6. FINAL PRODUCTS & QR TRACEABILITY
CREATE TABLE IF NOT EXISTS public.final_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  qr_code_id TEXT UNIQUE NOT NULL,
  product_name TEXT NOT NULL,
  batch_id UUID REFERENCES public.raw_batches(id) ON DELETE CASCADE,
  manufacturer_id UUID REFERENCES public.profiles(id),
  manufacturing_date DATE DEFAULT CURRENT_DATE NOT NULL,
  expiry_date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- 7. DYNAMIC PROCUREMENT & DYNAMIC MARKDOWN ENGINE
CREATE TABLE IF NOT EXISTS public.dynamic_procurement (
  id SERIAL PRIMARY KEY,
  batch_code TEXT NOT NULL,
  crop_name TEXT NOT NULL,
  warehouse_id TEXT REFERENCES public.warehouses(id),
  original_price_per_kg NUMERIC NOT NULL,
  discount_pct INT NOT NULL,
  discounted_price_per_kg NUMERIC NOT NULL,
  spoilage_status TEXT NOT NULL,
  days_until_spoilage INT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- 8. COMMUNITY POLLS & DEMAND FORECASTING
CREATE TABLE IF NOT EXISTS public.community_polls (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  target_audience TEXT NOT NULL, -- 'farmers', 'consumers', 'all'
  option_a TEXT NOT NULL,
  votes_a INT DEFAULT 0,
  option_b TEXT NOT NULL,
  votes_b INT DEFAULT 0,
  option_c TEXT NOT NULL,
  votes_c INT DEFAULT 0,
  advisory_recommendation TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- =================================================================
-- DYNAMIC POSTGRES VIEW FOR REAL-TIME WAREHOUSE QUALITY RANKINGS
-- =================================================================

CREATE OR REPLACE VIEW public.v_warehouse_rankings AS
SELECT 
  id,
  name,
  city,
  state,
  lat,
  lon,
  current_temp_c,
  humidity_pct,
  pest_detected,
  occupied_capacity_tonnes,
  storage_capacity_tonnes,
  -- Dynamic Score Calculation Algorithm (Base 100 - Penalties)
  GREATEST(0, LEAST(100, ROUND(
    100 
    - (ABS(current_temp_c - 4.0) * 10)
    - (CASE 
        WHEN humidity_pct < 80.0 THEN (80.0 - humidity_pct) * 2
        WHEN humidity_pct > 90.0 THEN (humidity_pct - 90.0) * 2
        ELSE 0 
       END)
    - (CASE WHEN pest_detected THEN 30 ELSE 0 END)
    - (CASE WHEN (occupied_capacity_tonnes / NULLIF(storage_capacity_tonnes, 0)) > 0.90 THEN 15 ELSE 0 END)
  ))) AS calculated_rank_score,
  
  -- Grade Classification
  CASE 
    WHEN (100 - (ABS(current_temp_c - 4.0) * 10) - (CASE WHEN pest_detected THEN 30 ELSE 0 END)) >= 85 THEN 'Grade A (Optimal)'
    WHEN (100 - (ABS(current_temp_c - 4.0) * 10) - (CASE WHEN pest_detected THEN 30 ELSE 0 END)) >= 60 THEN 'Grade B (Warning)'
    ELSE 'Grade C (Critical / Action Required)'
  END AS warehouse_grade

FROM public.warehouses
ORDER BY calculated_rank_score DESC;

-- =================================================================
-- STORED PROCEDURE & TRIGGER FOR AUTOMATIC RANK SCORE UPDATES
-- =================================================================

CREATE OR REPLACE FUNCTION update_warehouse_rank_score()
RETURNS TRIGGER 
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.rank_score := GREATEST(0, LEAST(100, ROUND(
    100 
    - (ABS(NEW.current_temp_c - 4.0) * 10)
    - (CASE 
        WHEN NEW.humidity_pct < 80.0 THEN (80.0 - NEW.humidity_pct) * 2
        WHEN NEW.humidity_pct > 90.0 THEN (NEW.humidity_pct - 90.0) * 2
        ELSE 0 
       END)
    - (CASE WHEN NEW.pest_detected THEN 30 ELSE 0 END)
    - (CASE WHEN (NEW.occupied_capacity_tonnes / NULLIF(NEW.storage_capacity_tonnes, 0)) > 0.90 THEN 15 ELSE 0 END)
  )));
  
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_update_warehouse_score ON public.warehouses;

CREATE TRIGGER trg_update_warehouse_score
BEFORE INSERT OR UPDATE OF current_temp_c, humidity_pct, pest_detected, occupied_capacity_tonnes
ON public.warehouses
FOR EACH ROW
EXECUTE FUNCTION update_warehouse_rank_score();

-- =================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.warehouses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crop_catalog ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.raw_batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lab_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.final_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dynamic_procurement ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_polls ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public profiles viewable" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Public warehouses viewable" ON public.warehouses FOR SELECT USING (true);
CREATE POLICY "Public crop catalog viewable" ON public.crop_catalog FOR SELECT USING (true);
CREATE POLICY "Public raw batches viewable" ON public.raw_batches FOR SELECT USING (true);
CREATE POLICY "Public lab reports viewable" ON public.lab_reports FOR SELECT USING (true);
CREATE POLICY "Public final products viewable" ON public.final_products FOR SELECT USING (true);
CREATE POLICY "Public dynamic procurement viewable" ON public.dynamic_procurement FOR SELECT USING (true);
CREATE POLICY "Public community polls viewable" ON public.community_polls FOR SELECT USING (true);

-- =================================================================
-- POPULATE PRODUCTION-READY SEED DATA
-- =================================================================

TRUNCATE public.profiles, public.warehouses, public.crop_catalog, public.raw_batches, public.lab_reports, public.final_products, public.dynamic_procurement, public.community_polls RESTART IDENTITY CASCADE;

-- 1. Profiles
INSERT INTO public.profiles (id, full_name, role, organization) VALUES
('00000000-0000-0000-0000-000000000001', 'Ramesh Patel', 'farmer', 'Vidisha Organic Farmers Collective'),
('00000000-0000-0000-0000-000000000002', 'Suresh Deshmukh', 'farmer', 'Nashik Agro Producers Co'),
('00000000-0000-0000-0000-000000000003', 'Dr. Ananya Sharma', 'lab_inspector', 'AgriQuality Labs Bhopal'),
('00000000-0000-0000-0000-000000000004', 'Vikram Singh', 'distributor', 'Gwalior Logistics Hub'),
('00000000-0000-0000-0000-000000000005', 'Priya Verma', 'consumer', 'Retail Consumer Network');

-- 2. Warehouses (IoT Cold-Chain)
INSERT INTO public.warehouses (id, name, city, state, lat, lon, current_temp_c, humidity_pct, pest_detected, storage_capacity_tonnes, occupied_capacity_tonnes, rank_score) VALUES
('WH-GWL-01', 'Gwalior Central Cold Depot', 'Gwalior', 'Madhya Pradesh', 26.2183, 78.1828, 4.2, 85.0, FALSE, 500.0, 320.0, 98),
('WH-NSK-01', 'Nashik Perishable Agri Hub', 'Nashik', 'Maharashtra', 19.9975, 73.7898, 11.5, 92.0, TRUE, 1000.0, 850.0, 45), -- Temperature breach & pest alert!
('WH-IND-01', 'Indore Malwa Silo & Storage', 'Indore', 'Madhya Pradesh', 22.7196, 75.8577, 3.8, 82.0, FALSE, 800.0, 410.0, 96),
('WH-DEL-01', 'Azadpur Terminal Depot', 'Delhi', 'Delhi NCR', 28.7041, 77.1025, 5.0, 88.0, FALSE, 1500.0, 1300.0, 91);

-- 3. Crop Catalog (Perishability Priority)
INSERT INTO public.crop_catalog (crop_name, category, shelf_life_days, transport_priority, ideal_temp_c) VALUES
('Tomato', 'Vegetable', 5, 1, 4.0),
('Dasheri Mango', 'Fruit', 4, 1, 6.0),
('Spinach', 'Leafy Vegetable', 3, 1, 2.0),
('Ashwagandha', 'Ayurvedic Herb', 180, 3, 15.0),
('Banana', 'Fruit', 6, 1, 13.0),
('Onion', 'Vegetable', 90, 3, 10.0),
('Potato', 'Tubers', 120, 3, 8.0);

-- 4. Raw Batches
INSERT INTO public.raw_batches (id, batch_code, herb_name, farmer_id, geo_location, harvest_date, quantity_kg, status) VALUES
('b0000000-0000-0000-0000-000000000001', 'LOT-TOM-2026-001', 'Tomato', '00000000-0000-0000-0000-000000000001', 'Vidisha, MP (23.5257° N, 77.8081° E)', CURRENT_DATE - INTERVAL '3 days', 2500.0, 'testing'),
('b0000000-0000-0000-0000-000000000002', 'LOT-ASH-2026-004', 'Ashwagandha', '00000000-0000-0000-0000-000000000001', 'Vidisha, MP (23.5257° N, 77.8081° E)', CURRENT_DATE - INTERVAL '12 days', 800.0, 'processed'),
('b0000000-0000-0000-0000-000000000003', 'LOT-ONI-2026-012', 'Onion', '00000000-0000-0000-0000-000000000002', 'Nashik, MH (19.9975° N, 73.7898° E)', CURRENT_DATE - INTERVAL '10 days', 10000.0, 'harvested');

-- 5. Lab Reports
INSERT INTO public.lab_reports (id, batch_id, lab_inspector_id, purity_percentage, moisture_level, heavy_metal_test, pesticide_free, certificate_url) VALUES
(gen_random_uuid(), 'b0000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000003', 96.5, 88.2, TRUE, TRUE, 'https://ayutrace1.vercel.app/certs/LOT-TOM-2026-001.pdf'),
(gen_random_uuid(), 'b0000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000003', 99.1, 8.5, TRUE, TRUE, 'https://ayutrace1.vercel.app/certs/LOT-ASH-2026-004.pdf');

-- 6. Final Products & QR Traceability
INSERT INTO public.final_products (id, qr_code_id, product_name, batch_id, manufacturer_id, manufacturing_date, expiry_date) VALUES
(gen_random_uuid(), 'AYU-TOM-88912', 'Fresh Organic Tomato Puree', 'b0000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000004', CURRENT_DATE - INTERVAL '1 day', CURRENT_DATE + INTERVAL '4 days'),
(gen_random_uuid(), 'AYU-ASH-10042', 'Pure Organic Ashwagandha Powder 250g', 'b0000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000004', CURRENT_DATE - INTERVAL '5 days', CURRENT_DATE + INTERVAL '365 days');

-- 7. Dynamic Procurement Engine
INSERT INTO public.dynamic_procurement (batch_code, crop_name, warehouse_id, original_price_per_kg, discount_pct, discounted_price_per_kg, spoilage_status, days_until_spoilage) VALUES
('LOT-TOM-2026-001', 'Tomato', 'WH-NSK-01', 30.00, 60, 12.00, 'HIGH SPOILAGE RISK (Temp Breach)', 1),
('LOT-MGO-GWL-002', 'Dasheri Mango', 'WH-GWL-01', 85.00, 54, 39.00, 'HIGH SPOILAGE RISK (Express Dispatch)', 2),
('LOT-SPN-2026-003', 'Spinach', 'WH-GWL-01', 25.00, 40, 15.00, 'MODERATE SPOILAGE RISK', 2),
('LOT-ONI-2026-012', 'Onion', 'WH-IND-01', 20.00, 0, 20.00, 'FRESH', 80);

-- 8. Community Polls & Demand Forecasting
INSERT INTO public.community_polls (title, target_audience, option_a, votes_a, option_b, votes_b, option_c, votes_c, advisory_recommendation) VALUES
('Rabi Season Planting Advisory - Vidisha/Gwalior Belt', 'farmers', 'Shift 30% area to Pulses', 142, 'Continue Tomato Cultivation', 45, 'Switch to Organic Ashwagandha', 89, 'RECOMMENDED: High market risk for Tomato overproduction. Shift to Pulses/Ashwagandha.'),
('Consumer Direct Demand Poll - Festival Season', 'consumers', 'Organic Herbal Teas', 310, 'Fresh Chemical-Free Vegetables', 520, 'Ayurvedic Wellness Supplements', 210, 'High consumer demand detected for Chemical-Free Vegetables in Metro Hubs.');
