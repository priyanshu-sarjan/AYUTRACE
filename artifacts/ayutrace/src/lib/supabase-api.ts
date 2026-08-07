import {
  supabase,
  HerbRecord,
  ProductRecord,
  OrderRecord,
  WarehouseRecord,
  CropRegionRecord,
  CommunityPollRecord,
  DynamicProcurementRecord,
} from "./supabase";

// ==========================================
// 🌿 HERBS & PERISHABLE CROPS API
// ==========================================

export async function fetchHerbs() {
  const { data, error } = await supabase
    .from("herbs")
    .select("*")
    .order("created_at", { ascending: false });

  if (error || !data || data.length === 0) {
    return MOCK_HERBS;
  }
  return data as HerbRecord[];
}

export async function fetchHerbById(id: string) {
  const { data, error } = await supabase
    .from("herbs")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !data) {
    return MOCK_HERBS.find((h) => h.id === id) || MOCK_HERBS[0];
  }
  return data as HerbRecord;
}

export async function addHerbRecord(herb: HerbRecord) {
  const { data, error } = await supabase
    .from("herbs")
    .insert([herb])
    .select()
    .single();

  if (error) throw error;
  return data as HerbRecord;
}

// ==========================================
// 🏬 DYNAMIC WAREHOUSES & RANKINGS VIEW API
// ==========================================

export async function fetchWarehouses() {
  // Query dynamic calculated rankings view if available
  const { data, error } = await supabase
    .from("v_warehouse_rankings")
    .select("*");

  if (error || !data || data.length === 0) {
    // Fallback to direct warehouses table query
    const { data: rawData, error: rawError } = await supabase
      .from("warehouses")
      .select("*")
      .order("rank_score", { ascending: false });

    if (rawError || !rawData || rawData.length === 0) {
      return MOCK_WAREHOUSES;
    }
    return rawData as WarehouseRecord[];
  }
  return data as WarehouseRecord[];
}

// ==========================================
// ⚡ DYNAMIC PROCUREMENT ENGINE API
// ==========================================

export async function fetchDynamicProcurement() {
  const { data, error } = await supabase
    .from("dynamic_procurement")
    .select("*")
    .order("discount_pct", { ascending: false });

  if (error || !data || data.length === 0) {
    return MOCK_DYNAMIC_PROCUREMENT;
  }
  return data as DynamicProcurementRecord[];
}

// ==========================================
// 🗺️ GIS CROP REGIONS API
// ==========================================

export async function fetchCropRegions() {
  const { data, error } = await supabase
    .from("crop_regions")
    .select("*")
    .order("region_name", { ascending: true });

  if (error || !data || data.length === 0) {
    return MOCK_CROP_REGIONS;
  }
  return data as CropRegionRecord[];
}

// ==========================================
// 📦 PRODUCTS & MARKETPLACE API
// ==========================================

export async function fetchProducts() {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .order("created_at", { ascending: false });

  if (error || !data || data.length === 0) {
    return MOCK_PRODUCTS;
  }
  return data as ProductRecord[];
}

export async function fetchProductById(id: string) {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !data) {
    return MOCK_PRODUCTS.find((p) => p.id === id) || MOCK_PRODUCTS[0];
  }
  return data as ProductRecord;
}

export async function createProduct(product: ProductRecord) {
  const { data, error } = await supabase
    .from("products")
    .insert([product])
    .select()
    .single();

  if (error) throw error;
  return data as ProductRecord;
}

// ==========================================
// 🗳️ COMMUNITY POLLS API
// ==========================================

export async function fetchCommunityPolls() {
  const { data, error } = await supabase
    .from("community_polls")
    .select("*")
    .order("created_at", { ascending: false });

  if (error || !data || data.length === 0) {
    return MOCK_POLLS;
  }
  return data as CommunityPollRecord[];
}

export async function voteOnPoll(pollId: string | number, option: "a" | "b" | "c") {
  const poll = (await fetchCommunityPolls()).find((p) => String(p.id) === String(pollId));
  if (!poll) return;

  const updateKey = option === "a" ? "votes_a" : option === "b" ? "votes_b" : "votes_c";
  const currentVal = (poll[updateKey] as number) || 0;

  const { data, error } = await supabase
    .from("community_polls")
    .update({ [updateKey]: currentVal + 1 })
    .eq("id", pollId)
    .select()
    .single();

  if (error) return poll;
  return data as CommunityPollRecord;
}

// ==========================================
// 🔐 AUTHENTICATION API
// ==========================================

export async function signUpWithSupabase(email: string, password: string, role: string, name: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { full_name: name, role: role } },
  });

  if (error) throw error;
  return data;
}

export async function signInWithSupabase(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw error;
  return data;
}

export async function signOutSupabase() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

// ==========================================
// 💡 PRODUCTION-READY SEED DATASET FALLBACKS
// ==========================================

export const MOCK_WAREHOUSES: WarehouseRecord[] = [
  {
    id: "WH-GWL-01",
    name: "Gwalior Central Cold Depot",
    city: "Gwalior",
    state: "Madhya Pradesh",
    lat: 26.2183,
    lon: 78.1828,
    current_temp_c: 4.2,
    humidity_pct: 85.0,
    pest_detected: false,
    storage_capacity_tonnes: 500.0,
    occupied_capacity_tonnes: 320.0,
    rank_score: 98,
    calculated_rank_score: 98,
    warehouse_grade: "Grade A (Optimal)",
  },
  {
    id: "WH-NSK-01",
    name: "Nashik Perishable Agri Hub",
    city: "Nashik",
    state: "Maharashtra",
    lat: 19.9975,
    lon: 73.7898,
    current_temp_c: 11.5, // Temp breach anomaly!
    humidity_pct: 92.0,
    pest_detected: true, // Pest warning!
    storage_capacity_tonnes: 1000.0,
    occupied_capacity_tonnes: 850.0,
    rank_score: 45,
    calculated_rank_score: 45,
    warehouse_grade: "Grade C (Critical / Action Required)",
  },
  {
    id: "WH-IND-01",
    name: "Indore Malwa Silo & Storage",
    city: "Indore",
    state: "Madhya Pradesh",
    lat: 22.7196,
    lon: 75.8577,
    current_temp_c: 3.8,
    humidity_pct: 82.0,
    pest_detected: false,
    storage_capacity_tonnes: 800.0,
    occupied_capacity_tonnes: 410.0,
    rank_score: 96,
    calculated_rank_score: 96,
    warehouse_grade: "Grade A (Optimal)",
  },
  {
    id: "WH-DEL-01",
    name: "Azadpur Terminal Depot",
    city: "Delhi",
    state: "Delhi NCR",
    lat: 28.7041,
    lon: 77.1025,
    current_temp_c: 5.0,
    humidity_pct: 88.0,
    pest_detected: false,
    storage_capacity_tonnes: 1500.0,
    occupied_capacity_tonnes: 1300.0,
    rank_score: 91,
    calculated_rank_score: 91,
    warehouse_grade: "Grade A (Optimal)",
  },
];

export const MOCK_DYNAMIC_PROCUREMENT: DynamicProcurementRecord[] = [
  {
    id: 1,
    batch_code: "LOT-TOM-2026-001",
    crop_name: "Tomato 🍅",
    warehouse_id: "WH-NSK-01",
    original_price_per_kg: 30.0,
    discount_pct: 60,
    discounted_price_per_kg: 12.0,
    spoilage_status: "HIGH SPOILAGE RISK (Temp Breach)",
    days_until_spoilage: 1,
  },
  {
    id: 2,
    batch_code: "LOT-MGO-GWL-002",
    crop_name: "Dasheri Mango 🥭",
    warehouse_id: "WH-GWL-01",
    original_price_per_kg: 85.0,
    discount_pct: 54,
    discounted_price_per_kg: 39.0,
    spoilage_status: "HIGH SPOILAGE RISK (Express Dispatch)",
    days_until_spoilage: 2,
  },
  {
    id: 3,
    batch_code: "LOT-SPN-2026-003",
    crop_name: "Spinach 🥬",
    warehouse_id: "WH-GWL-01",
    original_price_per_kg: 25.0,
    discount_pct: 40,
    discounted_price_per_kg: 15.0,
    spoilage_status: "MODERATE SPOILAGE RISK",
    days_until_spoilage: 2,
  },
  {
    id: 4,
    batch_code: "LOT-ONI-2026-012",
    crop_name: "Onion 🧅",
    warehouse_id: "WH-IND-01",
    original_price_per_kg: 20.0,
    discount_pct: 0,
    discounted_price_per_kg: 20.0,
    spoilage_status: "FRESH",
    days_until_spoilage: 80,
  },
];

export const MOCK_HERBS: HerbRecord[] = [
  {
    id: "herb-gwl-mango",
    name: "Gwalior Dasheri Mangoes 🥭",
    botanical_name: "Mangifera indica",
    category: "Fruit (Ultra-High Perishability)",
    origin: "Gwalior Orchards, MP (26.2183° N, 78.1828° E)",
    harvest_date: "2026-08-05",
    quality_grade: "Grade A Premium",
    lab_tested: true,
    perishability_priority: 1, // Priority 1 Express!
    days_to_spoil: 2,
    gps_coordinates: "26.2183, 78.1828",
    qr_code_url: "https://ayutrace1.vercel.app/herbs/herb-gwl-mango",
  },
  {
    id: "b0000000-0000-0000-0000-000000000001",
    name: "Red Organic Tomatoes 🍅",
    botanical_name: "Solanum lycopersicum",
    category: "Vegetable (High Perishability)",
    origin: "Vidisha / Nashik Collective (23.5257° N, 77.8081° E)",
    harvest_date: "2026-08-04",
    quality_grade: "Grade A",
    lab_tested: true,
    perishability_priority: 1, // Priority 1 Express!
    days_to_spoil: 1,
    gps_coordinates: "19.9975, 73.7898",
    qr_code_url: "https://ayutrace1.vercel.app/certs/LOT-TOM-2026-001.pdf",
  },
  {
    id: "b0000000-0000-0000-0000-000000000002",
    name: "Pure Organic Ashwagandha 🌿",
    botanical_name: "Withania somnifera",
    category: "Ayurvedic Herb (Low Perishability)",
    origin: "Vidisha Organic Farmers Collective, MP",
    harvest_date: "2026-07-26",
    quality_grade: "Grade A+",
    lab_tested: true,
    perishability_priority: 3, // Priority 3 Standard!
    days_to_spoil: 180,
    gps_coordinates: "23.5257, 77.8081",
    qr_code_url: "https://ayutrace1.vercel.app/certs/LOT-ASH-2026-004.pdf",
  },
];

export const MOCK_CROP_REGIONS: (CropRegionRecord & { recommended_alternative_crop?: string })[] = [
  {
    id: "reg-gwl",
    region_name: "Gwalior Fruit Belt",
    state: "Madhya Pradesh",
    major_crop: "Dasheri Mango 🥭",
    production_status: "Overproduction Risk",
    estimated_yield_tons: 32000,
    active_farmers_count: 2100,
    geo_coords: "26.2183, 78.1828",
    recommended_alternative_crop: "Shift 30% area to Guava 🍐 or Mustard 🌾 (High Spoilage Risk - Express Dispatch!)",
  },
  {
    id: "reg-1",
    region_name: "Nashik Tomato & Grape Belt",
    state: "Maharashtra",
    major_crop: "Red Tomato 🍅",
    production_status: "Overproduction Risk",
    estimated_yield_tons: 48000,
    active_farmers_count: 3400,
    geo_coords: "19.9975, 73.7898",
    recommended_alternative_crop: "Spinach 🥬 or Pulses (To prevent 40% market loss)",
  },
  {
    id: "reg-ind",
    region_name: "Indore Malwa Agriculture Belt",
    state: "Madhya Pradesh",
    major_crop: "Onion & Wheat 🧅",
    production_status: "Optimal",
    estimated_yield_tons: 65000,
    active_farmers_count: 4100,
    geo_coords: "22.7196, 75.8577",
    recommended_alternative_crop: "Safe Ambient Silo Storage (Priority 3 Standard Transport)",
  },
];

export const MOCK_PRODUCTS: ProductRecord[] = [
  {
    id: "prod-1",
    title: "Fresh Organic Tomato Puree (500g)",
    description: "Derived from Lot LOT-TOM-2026-001 (Vidisha/Nashik harvest). Lab tested for 96.5% purity.",
    price: 120,
    discount_price: 48,
    is_clearance: true,
    category: "Fresh Vegetables",
    image_url: "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=500&q=80",
    batch_number: "AYU-TOM-88912",
    freshness_score: 75,
    stock_quantity: 45,
  },
  {
    id: "prod-mango-gwl",
    title: "Gwalior Sweet Dasheri Mangoes 🥭 (4 kg Box)",
    description: "High perishability batch nearing peak ripeness! Priority 1 Cold-Chain Express shipping to prevent spoilage.",
    price: 350,
    discount_price: 160,
    is_clearance: true,
    category: "Fresh Fruits",
    image_url: "https://images.unsplash.com/photo-1553279768-865429fa0078?w=500&q=80",
    batch_number: "BATCH-MGO-GWL-2026",
    freshness_score: 74,
    stock_quantity: 30,
  },
  {
    id: "prod-2",
    title: "Pure Organic Ashwagandha Powder 250g",
    description: "Certified pesticide-free Ashwagandha from Vidisha Farmers Collective. Full QR lab audit trail.",
    price: 450,
    discount_price: 450,
    is_clearance: false,
    category: "Ayurvedic Herb",
    image_url: "https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?w=500&q=80",
    batch_number: "AYU-ASH-10042",
    freshness_score: 99,
    stock_quantity: 120,
  },
];

export const MOCK_POLLS: CommunityPollRecord[] = [
  {
    id: 1,
    title: "Rabi Season Planting Advisory - Vidisha/Gwalior Belt",
    target_audience: "farmers",
    option_a: "Shift 30% area to Pulses",
    votes_a: 142,
    option_b: "Continue Tomato Cultivation",
    votes_b: 45,
    option_c: "Switch to Organic Ashwagandha",
    votes_c: 89,
    advisory_recommendation: "RECOMMENDED: High market risk for Tomato overproduction. Shift to Pulses/Ashwagandha.",
  },
  {
    id: 2,
    title: "Consumer Direct Demand Poll - Festival Season",
    target_audience: "consumers",
    option_a: "Organic Herbal Teas",
    votes_a: 310,
    option_b: "Fresh Chemical-Free Vegetables",
    votes_b: 520,
    option_c: "Ayurvedic Wellness Supplements",
    votes_c: 210,
    advisory_recommendation: "High consumer demand detected for Chemical-Free Vegetables in Metro Hubs.",
  },
];
