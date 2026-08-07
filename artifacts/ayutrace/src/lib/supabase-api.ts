import { supabase } from "./supabaseClient";

// Shelf life definitions (in days)
const CROP_SHELF_LIFE: Record<string, number> = {
  Tomato: 5,
  Spinach: 3,
  "Dasheri Mango": 4,
  Banana: 6,
  Apple: 14,
  Onion: 90,
  Potato: 120,
  Ashwagandha: 180,
};

export interface HarvestBatch {
  batch_id: string;
  crop_name: string;
  farmer_id?: string;
  farmer_name?: string;
  harvest_date: string;
  quantity_kg: number;
  warehouse_id?: string;
  warehouse_name?: string;
  warehouse_city?: string;
  warehouse_temp?: number;
  warehouse_pest_alert?: boolean;
  status: string;
  remaining_days_life?: number;
  freshness_pct?: number;
  original_price?: number;
  discount_pct?: number;
  discounted_price?: number;
}

export interface Warehouse {
  id: string;
  name: string;
  location_city: string;
  current_temp_c: number;
  humidity_pct: number;
  pest_alert: boolean;
  rank_score: number;
  lat?: number;
  lon?: number;
  location_coords?: string;
  temperature_celsius?: number;
  humidity_percent?: number;
  pest_alert_status?: string;
  quality_rank?: number;
  calculated_rank_score?: number;
  capacity_used_pct?: number;
  storage_capacity_tonnes?: number;
  occupied_capacity_tonnes?: number;
}

export interface CropRegion {
  id: string;
  region_name: string;
  state: string;
  major_crop: string;
  production_status: "Underproduction" | "Optimal" | "Overproduction Risk";
  estimated_yield_tons: number;
  active_farmers_count: number;
  geo_coords: string;
  recommended_alternative_crop?: string;
}

export interface ProductItem {
  id: string;
  title: string;
  description: string;
  price: number;
  discount_price?: number;
  is_clearance?: boolean;
  category: string;
  image_url: string;
  batch_number: string;
  seller_name: string;
  freshness_score: number;
  days_remaining: number;
}

export interface PollItem {
  id: string;
  title: string;
  crop_name: string;
  target_demand_tons: number;
  farmer_votes: number;
  consumer_votes: number;
  advisory_recommendation: string;
}

// =================================================================
// 1. PREDICTIVE SPOILAGE ENGINE & DYNAMIC MARKDOWN CALCULATOR
// =================================================================

export function calculateBatchSpoilage(
  batch: HarvestBatch,
  warehouse?: Warehouse
): { remainingDays: number; freshnessScore: number; isHighRisk: boolean } {
  const shelfLife = CROP_SHELF_LIFE[batch.crop_name] || 7;
  const harvestTime = new Date(batch.harvest_date).getTime();
  const now = new Date().getTime();
  const daysElapsed = Math.max(0, Math.floor((now - harvestTime) / (1000 * 60 * 60 * 24)));

  // Accelerated spoilage penalty if warehouse temp > 8°C
  let tempPenaltyDays = 0;
  if (warehouse && warehouse.current_temp_c > 8.0) {
    tempPenaltyDays = 2; // Temperature breach accelerates spoilage by 2 days
  }

  const remainingDays = Math.max(0, shelfLife - daysElapsed - tempPenaltyDays);
  const freshnessScore = Math.max(0, Math.round((remainingDays / shelfLife) * 100));
  const isHighRisk = remainingDays <= 2;

  return { remainingDays, freshnessScore, isHighRisk };
}

// =================================================================
// 2. IOT WAREHOUSE RANKING CALCULATOR
// =================================================================

export function calculateWarehouseRankScore(wh: Warehouse): number {
  let score = 100;
  
  // Deduct 10 points for every degree above 4°C
  if (wh.current_temp_c > 4.0) {
    score -= Math.round((wh.current_temp_c - 4.0) * 10);
  }

  // Deduct 30 points if pest alert is true
  if (wh.pest_alert) {
    score -= 30;
  }

  return Math.max(0, Math.min(100, score));
}

// =================================================================
// 3. SUPABASE DATA FETCHERS & TRACEABILITY JOIN
// =================================================================

export async function fetchWarehousesWithRankings(): Promise<Warehouse[]> {
  const { data, error } = await supabase
    .from("warehouses")
    .select("*");

  if (error || !data || data.length === 0) {
    return MOCK_WAREHOUSES;
  }

  // Calculate live IoT rank score for each warehouse & sort top to bottom
  const ranked = (data as Warehouse[]).map((wh) => ({
    ...wh,
    rank_score: calculateWarehouseRankScore(wh),
  }));

  return ranked.sort((a, b) => b.rank_score - a.rank_score);
}

export async function fetchHarvestBatchesWithSpoilage(): Promise<HarvestBatch[]> {
  const { data, error } = await supabase
    .from("harvest_batches")
    .select("*, profiles:farmer_id(full_name), warehouses:warehouse_id(*)");

  if (error || !data || data.length === 0) {
    return MOCK_HARVEST_BATCHES;
  }

  return data.map((b: any) => {
    const wh = b.warehouses;
    const batchObj: HarvestBatch = {
      batch_id: b.batch_id,
      crop_name: b.crop_name,
      farmer_id: b.farmer_id,
      farmer_name: b.profiles?.full_name || "Organic Farmer",
      harvest_date: b.harvest_date,
      quantity_kg: b.quantity_kg,
      warehouse_id: b.warehouse_id,
      warehouse_name: wh?.name,
      warehouse_city: wh?.location_city,
      warehouse_temp: wh?.current_temp_c,
      warehouse_pest_alert: wh?.pest_alert,
      status: b.status,
    };

    const { remainingDays, freshnessScore, isHighRisk } = calculateBatchSpoilage(batchObj, wh);
    
    // Dynamic 50% discount if within 2 days of spoilage
    const basePrice = b.crop_name === "Tomato" ? 30 : b.crop_name === "Dasheri Mango" ? 85 : 25;
    const discountPct = isHighRisk ? 50 : 0;
    const discountedPrice = basePrice * (1 - discountPct / 100);

    return {
      ...batchObj,
      remaining_days_life: remainingDays,
      freshness_pct: freshnessScore,
      original_price: basePrice,
      discount_pct: discountPct,
      discounted_price: discountedPrice,
    };
  });
}

/**
 * Dynamic Route Traceability Join: Fetches complete lifecycle for /trace/[batch_id]
 */
export async function fetchBatchTraceability(batchId: string): Promise<HarvestBatch | null> {
  const { data, error } = await supabase
    .from("harvest_batches")
    .select("*, profiles:farmer_id(full_name, region), warehouses:warehouse_id(*)")
    .eq("batch_id", batchId)
    .single();

  if (error || !data) {
    const mock = MOCK_HARVEST_BATCHES.find((b) => b.batch_id === batchId) || MOCK_HARVEST_BATCHES[0];
    return mock;
  }

  const wh = data.warehouses;
  const batchObj: HarvestBatch = {
    batch_id: data.batch_id,
    crop_name: data.crop_name,
    farmer_id: data.farmer_id,
    farmer_name: data.profiles?.full_name || "Ramesh Patel",
    harvest_date: data.harvest_date,
    quantity_kg: data.quantity_kg,
    warehouse_id: data.warehouse_id,
    warehouse_name: wh?.name || "Gwalior Cold Storage Hub",
    warehouse_city: wh?.location_city || "Gwalior",
    warehouse_temp: wh?.current_temp_c || 4.2,
    warehouse_pest_alert: wh?.pest_alert || false,
    status: data.status,
  };

  const { remainingDays, freshnessScore } = calculateBatchSpoilage(batchObj, wh);
  return {
    ...batchObj,
    remaining_days_life: remainingDays,
    freshness_pct: freshnessScore,
  };
}

export async function signUpWithSupabase(email: string, pass: string, role: string, fullName: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password: pass,
    options: {
      data: {
        full_name: fullName,
        role: role,
      },
    },
  });
  if (error) throw error;
  return data;
}

export async function signInWithSupabase(email: string, pass: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password: pass,
  });
  if (error) throw error;
  return data;
}

// =================================================================
// 4. MOCK DATA FALLBACKS
// =================================================================

export const MOCK_WAREHOUSES: Warehouse[] = [
  {
    id: "WH-GWL-01",
    name: "Gwalior Central Cold Depot",
    location_city: "Gwalior",
    current_temp_c: 4.2,
    humidity_pct: 85.0,
    pest_alert: false,
    rank_score: 98,
    lat: 26.2183,
    lon: 78.1828,
  },
  {
    id: "WH-NSK-01",
    name: "Nashik Perishable Agri Hub",
    location_city: "Nashik",
    current_temp_c: 11.5, // Temp breach!
    humidity_pct: 92.0,
    pest_alert: true, // Pest alert!
    rank_score: 45,
    lat: 19.9975,
    lon: 73.7898,
  },
  {
    id: "WH-IND-01",
    name: "Indore Malwa Silo Hub",
    location_city: "Indore",
    current_temp_c: 3.8,
    humidity_pct: 82.0,
    pest_alert: false,
    rank_score: 96,
    lat: 22.7196,
    lon: 75.8577,
  },
];

export const MOCK_CROP_REGIONS: CropRegion[] = [
  {
    id: "reg-gwl",
    region_name: "Gwalior Agri Belt",
    state: "Madhya Pradesh",
    major_crop: "Dasheri Mangoes",
    production_status: "Overproduction Risk",
    estimated_yield_tons: 4200,
    active_farmers_count: 1240,
    geo_coords: "26.2183, 78.1828",
    recommended_alternative_crop: "Shift 25% area to Ashwagandha & Guava for stable market prices",
  },
  {
    id: "reg-nsk",
    region_name: "Nashik Perishable Zone",
    state: "Maharashtra",
    major_crop: "Red Tomatoes",
    production_status: "Overproduction Risk",
    estimated_yield_tons: 6800,
    active_farmers_count: 2150,
    geo_coords: "19.9975, 73.7898",
    recommended_alternative_crop: "High spoilage risk detected! Utilize express refrigerated transit to Navi Mumbai APMC",
  },
  {
    id: "reg-las",
    region_name: "Lasalgaon Market Hub",
    state: "Maharashtra",
    major_crop: "Red Onions",
    production_status: "Optimal",
    estimated_yield_tons: 12500,
    active_farmers_count: 3400,
    geo_coords: "20.1477, 74.2307",
    recommended_alternative_crop: "High shelf life (90 Days). Standard ventilated transit recommended",
  },
];

export const MOCK_HARVEST_BATCHES: HarvestBatch[] = [
  {
    batch_id: "b0000000-0000-0000-0000-000000000001",
    crop_name: "Tomato",
    farmer_name: "Ramesh Patel (Vidisha Collective)",
    harvest_date: "2026-08-05",
    quantity_kg: 2500,
    warehouse_id: "WH-NSK-01",
    warehouse_name: "Nashik Perishable Agri Hub",
    warehouse_city: "Nashik",
    warehouse_temp: 11.5,
    warehouse_pest_alert: true,
    status: "in_transit",
    remaining_days_life: 1,
    freshness_pct: 70,
    original_price: 30,
    discount_pct: 50,
    discounted_price: 15,
  },
  {
    batch_id: "b0000000-0000-0000-0000-000000000002",
    crop_name: "Dasheri Mango",
    farmer_name: "Vikram Singh (Gwalior Hub)",
    harvest_date: "2026-08-04",
    quantity_kg: 1800,
    warehouse_id: "WH-GWL-01",
    warehouse_name: "Gwalior Central Cold Depot",
    warehouse_city: "Gwalior",
    warehouse_temp: 4.2,
    warehouse_pest_alert: false,
    status: "stored",
    remaining_days_life: 2,
    freshness_pct: 74,
    original_price: 85,
    discount_pct: 50,
    discounted_price: 42.5,
  },
];

export const MOCK_PRODUCTS: ProductItem[] = [
  {
    id: "prod-1",
    title: "Gwalior Fresh Dasheri Mangoes (Flash Sale)",
    description: "Picked fresh from Gwalior orchards. High spoilage risk - 54% clearance discount!",
    price: 85,
    discount_price: 39,
    is_clearance: true,
    category: "Fruits",
    image_url: "https://images.unsplash.com/photo-1553279768-865429fa0078?auto=format&fit=crop&q=80&w=800",
    batch_number: "GWL-MNG-2026",
    seller_name: "Gwalior Farmer Collective",
    freshness_score: 82,
    days_remaining: 2,
  },
  {
    id: "prod-2",
    title: "Nashik Organic Farm Red Tomatoes",
    description: "Farm-fresh tomatoes from Nashik perishable zone. Express cold-chain routed.",
    price: 40,
    discount_price: 20,
    is_clearance: true,
    category: "Vegetables",
    image_url: "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&q=80&w=800",
    batch_number: "NSK-TOM-2026",
    seller_name: "Nashik Organic Cooperative",
    freshness_score: 75,
    days_remaining: 3,
  },
  {
    id: "prod-3",
    title: "Lasalgaon Red Onions (Premium Storage)",
    description: "High shelf-life premium onions stored at optimal ventilated humidity.",
    price: 30,
    discount_price: 30,
    is_clearance: false,
    category: "Vegetables",
    image_url: "https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?auto=format&fit=crop&q=80&w=800",
    batch_number: "LAS-ONN-2026",
    seller_name: "Lasalgaon Agri Hub",
    freshness_score: 95,
    days_remaining: 45,
  },
];

export const MOCK_POLLS: PollItem[] = [
  {
    id: "poll-1",
    title: "Gwalior Region Sowing Balance",
    crop_name: "Dasheri Mangoes vs Ashwagandha",
    target_demand_tons: 3500,
    farmer_votes: 124,
    consumer_votes: 450,
    advisory_recommendation: "Reduce Mango area by 20% to avoid regional spoilage gluts.",
  },
];

export const MOCK_HERBS = [
  {
    id: "herb-1",
    name: "Ashwagandha (Organic Roots)",
    botanical_name: "Withania somnifera",
    category: "Medicinal Roots",
    origin: "Vidisha, Madhya Pradesh",
    harvest_date: "2026-08-01",
    quality_grade: "Grade A+",
    lab_tested: true,
  },
];
