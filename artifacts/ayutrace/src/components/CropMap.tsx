import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polygon, Polyline, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  MapPin,
  Search,
  RefreshCw,
  BarChart3,
  Layers,
  Sprout,
  Truck,
  Eye,
  Navigation,
} from "lucide-react";

// Data Types
export interface DistrictData {
  sNo: number;
  state: string;
  district: string;
  areaHa: number;
  productionTonnes: number;
  productivity: number;
  isOverproducing: boolean;
  pctAboveAverage: number;
  lat: number;
  lng: number;
}

export interface OverproductionDataset {
  metadata: {
    generatedAt: string;
    dataset: string;
    cropCategory: string;
    totalDistricts: number;
    overproducingDistrictsCount: number;
    overallAvgProductivityTonnesPerHa: number;
    thresholdProductivityTonnesPerHa: number;
    thresholdPct: number;
  };
  districts: DistrictData[];
}

export interface TransportRoute {
  id: string;
  name: string;
  fromName: string;
  toName: string;
  waypoints: [number, number][];
  color: string;
  cargo: string;
  estHours: number;
  truckEmoji: string;
}

// Transportation Routes connecting Surplus Districts to Logistics & Consumption Hubs
const SURPLUS_TRANSPORT_ROUTES: TransportRoute[] = [
  {
    id: "route-ariyalur-chennai",
    name: "Ariyalur Vegetable Surplus ➔ Chennai Central APMC",
    fromName: "Ariyalur (44.6 T/Ha)",
    toName: "Chennai Wholesale Hub",
    waypoints: [
      [11.1401, 79.0786], // Ariyalur
      [11.7480, 79.7714], // Cuddalore Transit
      [12.8342, 79.7036], // Kancheepuram Checkpoint
      [13.0827, 80.2707], // Chennai APMC
    ],
    color: "#ef4444",
    cargo: "Tapioca & Mixed Vegetables (72,500 T)",
    estHours: 5.5,
    truckEmoji: "🚚",
  },
  {
    id: "route-theni-madurai",
    name: "Theni Horticulture Express ➔ Madurai Cold Chain",
    fromName: "Theni (37.1 T/Ha)",
    toName: "Madurai Logistics Hub",
    waypoints: [
      [10.0104, 77.4768], // Theni
      [9.9252, 78.1198],  // Madurai Hub
    ],
    color: "#f97316",
    cargo: "Tomatoes & Green Chillies (274,000 T)",
    estHours: 2.0,
    truckEmoji: "🚛",
  },
  {
    id: "route-nilgiris-coimbatore",
    name: "Nilgiris Hill Harvest ➔ Coimbatore Wholesale Mandi",
    fromName: "The Nilgiris (35.5 T/Ha)",
    toName: "Coimbatore APMC",
    waypoints: [
      [11.4916, 76.7337], // Nilgiris
      [11.3410, 77.7172], // Erode Bypass
      [11.0168, 76.9558], // Coimbatore Mandi
    ],
    color: "#eab308",
    cargo: "Carrots, Cabbage & Potatoes (158,000 T)",
    estHours: 3.2,
    truckEmoji: "🚚",
  },
  {
    id: "route-karur-trichy",
    name: "Karur Produce Corridor ➔ Trichy Processing Hub",
    fromName: "Karur (37.2 T/Ha)",
    toName: "Trichy Processing Complex",
    waypoints: [
      [10.9601, 78.0766], // Karur
      [10.7905, 78.7047], // Trichy Hub
    ],
    color: "#ef4444",
    cargo: "Gourd & Drumsticks (120,000 T)",
    estHours: 1.8,
    truckEmoji: "🚛",
  },
  {
    id: "route-krishnagiri-hosur",
    name: "Krishnagiri Border SLA ➔ Hosur Inter-State Terminal",
    fromName: "Krishnagiri (27.2 T/Ha)",
    toName: "Hosur Logistics Terminal",
    waypoints: [
      [12.5186, 78.2137], // Krishnagiri
      [12.7409, 77.8253], // Hosur Border Hub
    ],
    color: "#10b981",
    cargo: "Mangoes & Polyhouse Crops (265,000 T)",
    estHours: 1.2,
    truckEmoji: "🚚",
  },
];

// Real district shape profiles based on geographic characteristics of Tamil Nadu districts
const DISTRICT_SHAPE_PROFILES: Record<string, number[][]> = {
  "Cuddalore": [[0.15, -0.05], [0.12, 0.08], [0.02, 0.12], [-0.10, 0.09], [-0.16, -0.02], [-0.08, -0.11], [0.05, -0.10]],
  "Nagapattinam": [[0.18, -0.04], [0.10, 0.06], [-0.02, 0.10], [-0.14, 0.08], [-0.18, -0.02], [-0.05, -0.08]],
  "Ramanadhapuram": [[0.06, -0.15], [0.08, 0.05], [0.02, 0.20], [-0.06, 0.18], [-0.09, -0.05], [-0.04, -0.16]],
  "Thoothukudi": [[0.12, -0.08], [0.10, 0.06], [-0.05, 0.12], [-0.15, 0.05], [-0.12, -0.10], [0.02, -0.11]],
  "Kanyakumari": [[0.08, -0.06], [0.06, 0.06], [-0.04, 0.08], [-0.09, 0.02], [-0.06, -0.07]],
  "The Nilgiris": [[0.12, -0.12], [0.14, 0.02], [0.08, 0.14], [-0.04, 0.12], [-0.12, 0.02], [-0.10, -0.14]],
  "Dharmapuri": [[0.16, -0.10], [0.18, 0.08], [0.05, 0.16], [-0.12, 0.12], [-0.18, -0.06], [-0.06, -0.14]],
  "Dindigul": [[0.14, -0.14], [0.16, 0.05], [0.06, 0.15], [-0.10, 0.12], [-0.16, -0.08], [-0.04, -0.16]],
  "Namakkal": [[0.15, -0.12], [0.16, 0.10], [0.04, 0.16], [-0.12, 0.10], [-0.16, -0.08], [-0.02, -0.14]],
  "Ariyalur": [[0.10, -0.08], [0.09, 0.07], [0.02, 0.10], [-0.08, 0.07], [-0.10, -0.06], [0.02, -0.08]],
  "Karur": [[0.11, -0.10], [0.12, 0.08], [0.03, 0.12], [-0.09, 0.08], [-0.11, -0.07], [-0.01, -0.09]],
  "Theni": [[0.13, -0.10], [0.11, 0.08], [0.01, 0.11], [-0.11, 0.07], [-0.12, -0.08], [-0.02, -0.09]],
  "Krishnagiri": [[0.14, -0.11], [0.15, 0.09], [0.03, 0.14], [-0.10, 0.11], [-0.15, -0.07], [-0.02, -0.12]],
  "Trichy": [[0.13, -0.11], [0.14, 0.09], [0.02, 0.13], [-0.10, 0.09], [-0.14, -0.07], [0.01, -0.10]],
  "Erode": [[0.15, -0.12], [0.14, 0.10], [0.02, 0.14], [-0.12, 0.10], [-0.15, -0.08], [0.01, -0.11]],
};

// Generic realistic boundary generator calibrated strictly to Area (Ha) from dataset
function generateDistrictPolygon(district: DistrictData): [number, number][] {
  // Physical scale factor: polygon radius in degrees strictly proportional to sqrt(Area in Ha)
  const scale = 0.0010 * Math.sqrt(district.areaHa);
  const profile = DISTRICT_SHAPE_PROFILES[district.district];

  if (profile) {
    return profile.map(([dLat, dLng]) => [
      district.lat + dLat * (scale / 0.14),
      district.lng + dLng * (scale / 0.14)
    ]);
  }

  // Fallback smooth polygon scaled strictly to Area (Ha)
  const points: [number, number][] = [];
  const vertices = 12;
  for (let i = 0; i < vertices; i++) {
    const angle = (i * 2 * Math.PI) / vertices;
    const latOffset = Math.cos(angle) * scale * 0.9;
    const lngOffset = Math.sin(angle) * scale * 1.1;
    points.push([district.lat + latOffset, district.lng + lngOffset]);
  }
  return points;
}

// Custom Leaflet Pin Markers using L.divIcon
const overproducingIcon = L.divIcon({
  className: "custom-leaflet-pin-overproducing",
  html: `
    <div style="
      background: linear-gradient(135deg, #ef4444, #dc2626);
      width: 32px;
      height: 32px;
      border-radius: 50%;
      border: 3px solid #ffffff;
      box-shadow: 0 0 16px rgba(239, 68, 68, 0.9), 0 4px 6px rgba(0,0,0,0.3);
      display: flex;
      align-items: center;
      justify-content: center;
      color: #ffffff;
      font-size: 15px;
      font-weight: bold;
    ">
      🚨
    </div>
  `,
  iconSize: [32, 32],
  iconAnchor: [16, 16],
  popupAnchor: [0, -16],
});

const standardIcon = L.divIcon({
  className: "custom-leaflet-pin-standard",
  html: `
    <div style="
      background: linear-gradient(135deg, #10b981, #059669);
      width: 28px;
      height: 28px;
      border-radius: 50%;
      border: 3px solid #ffffff;
      box-shadow: 0 0 10px rgba(16, 185, 129, 0.6), 0 2px 4px rgba(0,0,0,0.2);
      display: flex;
      align-items: center;
      justify-content: center;
      color: #ffffff;
      font-size: 13px;
    ">
      🌾
    </div>
  `,
  iconSize: [28, 28],
  iconAnchor: [14, 14],
  popupAnchor: [0, -14],
});

// Helper component to center map smoothly on selected district
function MapCenterController({ coords }: { coords: [number, number] | null }) {
  const map = useMap();
  useEffect(() => {
    if (coords) {
      map.flyTo(coords, 8.5, { duration: 1.2 });
    }
  }, [coords, map]);
  return null;
}

// Animated Moving Truck Marker Component
function MovingTruckMarker({ route }: { route: TransportRoute }) {
  const [currentPos, setCurrentPos] = useState<[number, number]>(route.waypoints[0]);
  const [progress, setProgress] = useState<number>(0);

  useEffect(() => {
    let animId: number;
    let startTime: number | null = null;
    const duration = 16000 + (route.estHours * 1200); // 16-22 sec animation cycle

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const elapsed = (timestamp - startTime) % duration;
      const p = elapsed / duration;
      setProgress(p);

      // Multi-segment interpolation along route waypoints
      const numSegments = route.waypoints.length - 1;
      const segmentProgress = p * numSegments;
      const segmentIndex = Math.min(Math.floor(segmentProgress), numSegments - 1);
      const localP = segmentProgress - segmentIndex;

      const p1 = route.waypoints[segmentIndex];
      const p2 = route.waypoints[segmentIndex + 1];

      const lat = p1[0] + (p2[0] - p1[0]) * localP;
      const lng = p1[1] + (p2[1] - p1[1]) * localP;

      setCurrentPos([lat, lng]);
      animId = requestAnimationFrame(animate);
    };

    animId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animId);
  }, [route]);

  const truckIcon = L.divIcon({
    className: "custom-truck-animated-pin",
    html: `
      <div style="
        background: ${route.color};
        width: 32px;
        height: 32px;
        border-radius: 50%;
        border: 2px solid #ffffff;
        box-shadow: 0 0 14px ${route.color}, 0 2px 6px rgba(0,0,0,0.4);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 16px;
        transform: scale(1.1);
      ">
        ${route.truckEmoji}
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  });

  return (
    <Marker position={currentPos} icon={truckIcon}>
      <Popup>
        <div className="p-1 space-y-1.5 text-xs text-foreground min-w-[210px]">
          <h4 className="font-bold text-sm text-amber-500 flex items-center gap-1">
            <Truck className="w-4 h-4 text-primary" /> Active Logistics Transit
          </h4>
          <p className="font-semibold text-foreground">{route.name}</p>
          <div className="bg-muted/60 p-2 rounded-xl text-[11px] space-y-1">
            <p>From: <strong>{route.fromName}</strong></p>
            <p>Destination: <strong>{route.toName}</strong></p>
            <p>Cargo: <strong className="text-emerald-400">{route.cargo}</strong></p>
            <p>Transit ETA: <strong>~{route.estHours} Hours</strong></p>
            <p>Route Progress: <strong>{(progress * 100).toFixed(0)}% Completed</strong></p>
          </div>
        </div>
      </Popup>
    </Marker>
  );
}

export function CropMap() {
  const [data, setData] = useState<OverproductionDataset | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "overproducing" | "standard">("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedDistrict, setSelectedDistrict] = useState<DistrictData | null>(null);
  const [flyCoords, setFlyCoords] = useState<[number, number] | null>(null);
  const [showPolygons, setShowPolygons] = useState<boolean>(true);
  const [showRoutes, setShowRoutes] = useState<boolean>(true);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const baseUrl = import.meta.env.BASE_URL ? import.meta.env.BASE_URL.replace(/\/$/, "") : "";
      const jsonUrl = `${baseUrl}/geotagged_overproduction.json`;
      const res = await fetch(jsonUrl);
      if (!res.ok) {
        throw new Error(`Failed to load overproduction dataset (${res.status} ${res.statusText})`);
      }
      const json: OverproductionDataset = await res.json();
      setData(json);
    } catch (err: any) {
      console.error("Error fetching geotagged overproduction data:", err);
      setError(err.message || "Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] p-8 space-y-4 text-center bg-card rounded-2xl border border-border/60">
        <RefreshCw className="w-10 h-10 animate-spin text-primary" />
        <p className="text-sm font-medium text-muted-foreground">
          Loading district overproduction dataset & GIS coordinates...
        </p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-6 bg-red-500/10 border border-red-500/30 rounded-2xl text-red-400 space-y-3">
        <div className="flex items-center gap-2 font-bold text-lg">
          <AlertTriangle className="w-6 h-6 text-red-500" />
          <span>Dataset Load Error</span>
        </div>
        <p className="text-xs text-red-300">
          {error || "Could not fetch geotagged_overproduction.json from public directory."}
        </p>
        <p className="text-xs text-muted-foreground">
          Ensure you have executed <code className="bg-background px-1.5 py-0.5 rounded text-primary">node scripts/processData.js</code> to generate the file.
        </p>
        <Button size="sm" onClick={fetchData} className="gap-2">
          <RefreshCw className="w-4 h-4" /> Retry Loading
        </Button>
      </div>
    );
  }

  // Filter districts based on search query & active filter tab
  const filteredDistricts = data.districts.filter((d) => {
    const matchesSearch = d.district.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          d.state.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;

    if (filter === "overproducing") return d.isOverproducing;
    if (filter === "standard") return !d.isOverproducing;
    return true;
  });

  const overproducingDistricts = data.districts.filter((d) => d.isOverproducing);
  const topOverproducer = [...data.districts].sort((a, b) => b.productivity - a.productivity)[0];

  return (
    <div className="flex flex-col space-y-4">
      {/* Top Banner & KPI Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <Card className="border-border/60 bg-card/80 backdrop-blur-sm">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
                Total Districts Analyzed
              </p>
              <h3 className="text-2xl font-bold font-mono text-foreground mt-1">
                {data.metadata.totalDistricts}
              </h3>
              <p className="text-[11px] text-muted-foreground mt-0.5">Tamil Nadu Crop Abstract</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <Layers className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-red-500/40 bg-red-950/20 backdrop-blur-sm">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-red-400 font-medium uppercase tracking-wider">
                Overproducing Districts 🚨
              </p>
              <h3 className="text-2xl font-bold font-mono text-red-400 mt-1">
                {data.metadata.overproducingDistrictsCount}
              </h3>
              <p className="text-[11px] text-red-300/80 mt-0.5">
                {((data.metadata.overproducingDistrictsCount / data.metadata.totalDistricts) * 100).toFixed(0)}% of total region
              </p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-red-500/20 text-red-400 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/60 bg-card/80 backdrop-blur-sm">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
                State Avg Productivity
              </p>
              <h3 className="text-2xl font-bold font-mono text-foreground mt-1">
                {data.metadata.overallAvgProductivityTonnesPerHa}{" "}
                <span className="text-xs font-normal text-muted-foreground">T/Ha</span>
              </h3>
              <p className="text-[11px] text-emerald-500 font-semibold mt-0.5">
                Threshold (+20%): {data.metadata.thresholdProductivityTonnesPerHa} T/Ha
              </p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/60 bg-card/80 backdrop-blur-sm">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
                Peak Overproducer
              </p>
              <h3 className="text-lg font-bold text-foreground mt-1 truncate max-w-[140px]">
                {topOverproducer ? topOverproducer.district : "N/A"}
              </h3>
              <p className="text-[11px] text-red-400 font-semibold mt-0.5">
                {topOverproducer ? `${topOverproducer.productivity} T/Ha (+${topOverproducer.pctAboveAverage}%)` : ""}
              </p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
              <BarChart3 className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Map & Filter Controls Container */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 min-h-[600px]">
        {/* Map Viewport (Lg 8 cols) */}
        <div className="lg:col-span-8 flex flex-col space-y-3">
          {/* Map Controls Header */}
          <div className="flex flex-wrap items-center justify-between gap-2 bg-card p-3 rounded-2xl border border-border/60 shadow-sm">
            <div className="flex flex-wrap items-center gap-1.5">
              <Button
                size="sm"
                variant={filter === "all" ? "default" : "outline"}
                onClick={() => setFilter("all")}
                className="text-xs h-8"
              >
                All ({data.districts.length})
              </Button>
              <Button
                size="sm"
                variant={filter === "overproducing" ? "destructive" : "outline"}
                onClick={() => setFilter("overproducing")}
                className="text-xs h-8 gap-1.5"
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                Overproducing ({overproducingDistricts.length})
              </Button>
              <Button
                size="sm"
                variant={filter === "standard" ? "secondary" : "outline"}
                onClick={() => setFilter("standard")}
                className="text-xs h-8 gap-1.5"
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                Standard ({data.districts.length - overproducingDistricts.length})
              </Button>

              <div className="h-4 w-[1px] bg-border mx-1 hidden sm:block" />

              {/* Layer Toggles */}
              <Button
                size="sm"
                variant={showPolygons ? "default" : "outline"}
                onClick={() => setShowPolygons(!showPolygons)}
                className="text-xs h-8 gap-1"
                title="Toggle District Polygon Boundaries"
              >
                <Eye className="w-3.5 h-3.5" />
                Polygons
              </Button>

              <Button
                size="sm"
                variant={showRoutes ? "default" : "outline"}
                onClick={() => setShowRoutes(!showRoutes)}
                className="text-xs h-8 gap-1 text-amber-400"
                title="Toggle Animated Moving Truck Routes"
              >
                <Truck className="w-3.5 h-3.5" />
                Trucks 🚚
              </Button>
            </div>

            <div className="relative w-full sm:w-48">
              <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search district..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 text-xs h-8 bg-background/80"
              />
            </div>
          </div>

          {/* Map Box */}
          <div className="relative flex-1 rounded-2xl overflow-hidden border border-border/60 shadow-xl min-h-[500px]">
            <MapContainer
              center={[10.8, 78.7]}
              zoom={7.5}
              style={{ height: "100%", width: "100%", minHeight: "500px" }}
              className="z-0"
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />

              <MapCenterController coords={flyCoords} />

              {/* Render Closed Polygon Shapes over Districts */}
              {showPolygons &&
                filteredDistricts.map((district) => {
                  const polyPoints = generateDistrictPolygon(district);
                  const isOver = district.isOverproducing;

                  return (
                    <Polygon
                      key={`poly-${district.district}`}
                      positions={polyPoints}
                      pathOptions={{
                        color: isOver ? "#dc2626" : "#059669",
                        fillColor: isOver ? "#ef4444" : "#10b981",
                        fillOpacity: isOver ? 0.35 : 0.18,
                        weight: isOver ? 2.5 : 1.5,
                        dashArray: isOver ? "6, 6" : undefined,
                      }}
                      eventHandlers={{
                        click: () => {
                          setSelectedDistrict(district);
                          setFlyCoords([district.lat, district.lng]);
                        },
                      }}
                    >
                      <Popup>
                        <div className="p-1 space-y-1.5 text-xs text-foreground">
                          <h4 className="font-bold text-sm text-foreground flex items-center gap-1">
                            <Navigation className="w-3.5 h-3.5 text-primary" /> {district.district} Boundary Zone
                          </h4>
                          <p>Category: <strong className={isOver ? "text-red-500" : "text-emerald-600"}>{isOver ? "Overproducing District Zone" : "Standard Yield District Zone"}</strong></p>
                          <p>Area Extent: {district.areaHa.toLocaleString()} Ha</p>
                          <p>Productivity: <strong>{district.productivity} Tonnes/Ha</strong></p>
                        </div>
                      </Popup>
                    </Polygon>
                  );
                })}

              {/* Render Animated Moving Truck Routes & Polylines */}
              {showRoutes &&
                SURPLUS_TRANSPORT_ROUTES.map((route) => (
                  <React.Fragment key={route.id}>
                    {/* Polyline corridor line */}
                    <Polyline
                      positions={route.waypoints}
                      pathOptions={{
                        color: route.color,
                        weight: 4,
                        dashArray: "8, 12",
                        opacity: 0.85,
                      }}
                    />
                    {/* Animated Moving Truck */}
                    <MovingTruckMarker route={route} />
                  </React.Fragment>
                ))}

              {/* Render Pins */}
              {filteredDistricts.map((district) => (
                <Marker
                  key={district.district}
                  position={[district.lat, district.lng]}
                  icon={district.isOverproducing ? overproducingIcon : standardIcon}
                  eventHandlers={{
                    click: () => {
                      setSelectedDistrict(district);
                      setFlyCoords([district.lat, district.lng]);
                    },
                  }}
                >
                  <Popup className="leaflet-popup-custom">
                    <div className="p-1 space-y-2 text-xs text-foreground min-w-[210px]">
                      <div className="flex items-center justify-between">
                        <h4 className="font-bold text-sm text-foreground flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-primary" /> {district.district}
                        </h4>
                        <Badge
                          className={
                            district.isOverproducing
                              ? "bg-red-500/20 text-red-500 border-red-500/40 text-[10px]"
                              : "bg-emerald-500/20 text-emerald-600 border-emerald-500/40 text-[10px]"
                          }
                        >
                          {district.isOverproducing ? "OVERPRODUCING" : "NORMAL YIELD"}
                        </Badge>
                      </div>

                      <p className="text-muted-foreground text-[11px]">
                        State: <strong className="text-foreground">{district.state}</strong>
                      </p>

                      <div className="grid grid-cols-2 gap-1.5 bg-muted/60 p-2 rounded-xl text-[11px]">
                        <div>
                          Area: <strong>{district.areaHa.toLocaleString()} Ha</strong>
                        </div>
                        <div>
                          Yield: <strong>{district.productionTonnes.toLocaleString()} T</strong>
                        </div>
                        <div className="col-span-2 text-primary font-bold">
                          Productivity: {district.productivity} Tonnes/Ha
                        </div>
                      </div>

                      {district.isOverproducing ? (
                        <div className="bg-red-950/40 border border-red-500/30 rounded-xl p-2 text-red-300 text-[11px] space-y-1">
                          <div className="font-bold flex items-center gap-1 text-red-400">
                            <AlertTriangle className="w-3 h-3" /> Surplus Alert: +{district.pctAboveAverage}% Above State Avg
                          </div>
                          <p className="leading-tight text-[10px] text-red-200/80">
                            Recommended: Route excess produce to processing centers or cold chain hubs to prevent market glut & spoilage.
                          </p>
                        </div>
                      ) : (
                        <div className="bg-emerald-950/30 border border-emerald-500/30 rounded-xl p-2 text-emerald-300 text-[11px]">
                          <span className="font-semibold flex items-center gap-1 text-emerald-400">
                            <Sprout className="w-3 h-3" /> Balanced Yield:
                          </span>
                          <p className="text-[10px]">Productivity aligned with regional agronomic baseline.</p>
                        </div>
                      )}
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>

            {/* Map Legend Overlay */}
            <div className="absolute bottom-4 left-4 z-[400] bg-card/95 backdrop-blur-md border border-border/60 p-3 rounded-xl shadow-lg text-xs space-y-1.5 max-w-[260px]">
              <h5 className="font-bold text-[11px] uppercase tracking-wider text-muted-foreground">
                GIS Polygon & Logistics Legend
              </h5>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-sm bg-red-500/40 border border-red-500 inline-block shadow-sm" />
                <span className="text-foreground text-[11px] font-medium">
                  Overproducing District Polygon Boundary
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-sm bg-emerald-500/30 border border-emerald-500 inline-block shadow-sm" />
                <span className="text-foreground text-[11px]">
                  Standard District Polygon Boundary
                </span>
              </div>
              <div className="flex items-center gap-2 pt-1 border-t border-border/50">
                <span className="text-base">🚚</span>
                <span className="text-amber-400 text-[11px] font-bold">
                  Moving Truck Logistics SLA Route
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar District List & Active Truck Queue Inspector (Lg 4 cols) */}
        <div className="lg:col-span-4 flex flex-col bg-card border border-border/60 rounded-2xl p-4 space-y-3 overflow-hidden">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-foreground flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-primary" /> District & Route Inspector
            </h3>
            <Badge variant="outline" className="text-[11px]">
              {filteredDistricts.length} Districts
            </Badge>
          </div>

          {/* Active Moving Truck Routes Card Box */}
          <div className="space-y-2 bg-muted/40 p-2.5 rounded-xl border border-border/60">
            <h4 className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
              <Truck className="w-3.5 h-3.5" /> Moving Surplus Transport Lines ({SURPLUS_TRANSPORT_ROUTES.length})
            </h4>
            <div className="space-y-1.5 max-h-[140px] overflow-y-auto pr-1 text-[11px] custom-scrollbar">
              {SURPLUS_TRANSPORT_ROUTES.map((r) => (
                <div
                  key={r.id}
                  onClick={() => setFlyCoords(r.waypoints[0])}
                  className="p-2 rounded-lg bg-background border border-border/60 hover:border-amber-500/50 cursor-pointer transition-all space-y-0.5"
                >
                  <div className="flex items-center justify-between font-bold">
                    <span className="text-foreground flex items-center gap-1">
                      <span>{r.truckEmoji}</span> {r.fromName}
                    </span>
                    <span className="text-amber-400 text-[10px]">~{r.estHours}h SLA</span>
                  </div>
                  <p className="text-muted-foreground text-[10px]">Destination: {r.toName}</p>
                </div>
              ))}
            </div>
          </div>

          {/* District Scroll List */}
          <div className="flex-1 overflow-y-auto space-y-2 pr-1 max-h-[320px] custom-scrollbar">
            {filteredDistricts.length === 0 ? (
              <div className="text-center py-8 text-xs text-muted-foreground">
                No districts match your search query or filter.
              </div>
            ) : (
              filteredDistricts.map((d) => (
                <div
                  key={d.district}
                  onClick={() => {
                    setSelectedDistrict(d);
                    setFlyCoords([d.lat, d.lng]);
                  }}
                  className={`p-3 rounded-xl border text-xs cursor-pointer transition-all space-y-1.5 ${
                    selectedDistrict?.district === d.district
                      ? "border-primary bg-primary/10 shadow-sm"
                      : d.isOverproducing
                      ? "border-red-500/30 bg-red-950/10 hover:border-red-500/60"
                      : "border-border/60 hover:border-primary/40 bg-background/60"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-foreground">{d.district}</span>
                    <Badge
                      className={
                        d.isOverproducing
                          ? "bg-red-500/20 text-red-400 border-red-500/40 text-[10px]"
                          : "bg-emerald-500/20 text-emerald-400 border-emerald-500/40 text-[10px]"
                      }
                    >
                      {d.productivity} T/Ha
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                    <span>Area: {d.areaHa.toLocaleString()} Ha</span>
                    <span>Prod: {d.productionTonnes.toLocaleString()} T</span>
                  </div>

                  {d.isOverproducing && (
                    <div className="text-[10px] text-red-400 font-medium flex items-center justify-between pt-0.5">
                      <span>Polygon Zone Active</span>
                      <span className="font-bold">+{d.pctAboveAverage}% vs Avg</span>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default CropMap;
