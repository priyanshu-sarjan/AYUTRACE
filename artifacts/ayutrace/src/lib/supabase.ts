import { createClient } from "@supabase/supabase-js";

// Read from VITE_ or NEXT_PUBLIC_ env vars, or default directly to user's live Supabase instance
const supabaseUrl =
  import.meta.env.VITE_SUPABASE_URL ||
  import.meta.env.NEXT_PUBLIC_SUPABASE_URL ||
  "https://eigfrepmbfgioyxejfqt.supabase.co";

const supabaseAnonKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  import.meta.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "sb_publishable_4lWtFcnC0O3zpoDM6Ncr5Q_ALbTLyaH";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * AyuTrace Agri-Fresh Supabase Database Interfaces
 */
export interface HerbRecord {
  id?: string;
  name: string;
  botanical_name?: string;
  category?: string;
  origin?: string;
  farmer_id?: string;
  harvest_date?: string;
  quality_grade?: string;
  lab_tested?: boolean;
  perishability_priority?: number;
  days_to_spoil?: number;
  gps_coordinates?: string;
  qr_code_url?: string;
  created_at?: string;
}

export interface ProductRecord {
  id?: string;
  title: string;
  description?: string;
  price: number;
  discount_price?: number;
  is_clearance?: boolean;
  category?: string;
  image_url?: string;
  batch_number?: string;
  seller_id?: string;
  lab_cert_url?: string;
  freshness_score?: number;
  stock_quantity?: number;
  created_at?: string;
}

export interface OrderRecord {
  id?: string;
  user_id: string;
  product_id: string;
  quantity: number;
  total_price: number;
  shipping_address?: string;
  priority_tier?: number;
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
  created_at?: string;
}

export interface WarehouseRecord {
  id: string;
  name: string;
  city: string;
  state: string;
  lat: number;
  lon: number;
  current_temp_c: number;
  humidity_pct: number;
  pest_detected: boolean;
  storage_capacity_tonnes: number;
  occupied_capacity_tonnes: number;
  rank_score: number;
  calculated_rank_score?: number;
  warehouse_grade?: string;
  created_at?: string;
}

export interface DynamicProcurementRecord {
  id?: number;
  batch_code: string;
  crop_name: string;
  warehouse_id: string;
  original_price_per_kg: number;
  discount_pct: number;
  discounted_price_per_kg: number;
  spoilage_status: string;
  days_until_spoilage: number;
  created_at?: string;
}

export interface CropRegionRecord {
  id?: string;
  region_name: string;
  state: string;
  major_crop: string;
  production_status: "Underproduction" | "Optimal" | "Overproduction Risk";
  estimated_yield_tons: number;
  active_farmers_count: number;
  geo_coords: string;
  recommended_alternative_crop?: string;
  created_at?: string;
}

export interface CommunityPollRecord {
  id?: number | string;
  title: string;
  target_audience?: string;
  crop_name?: string;
  option_a?: string;
  votes_a?: number;
  option_b?: string;
  votes_b?: number;
  option_c?: string;
  votes_c?: number;
  advisory_recommendation?: string;
  target_demand_tons?: number;
  farmer_votes?: number;
  consumer_votes?: number;
  status?: string;
  created_at?: string;
}
