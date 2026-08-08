import { useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polyline } from "react-leaflet";
import L from "leaflet";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  MapPin,
  Thermometer,
  ShieldCheck,
  AlertTriangle,
  Zap,
  Warehouse,
  Truck,
  Sprout,
  CheckCircle2,
} from "lucide-react";
import { MOCK_WAREHOUSES, MOCK_CROP_REGIONS } from "@/lib/supabase-api";

// Custom Leaflet Icons for GIS map
const warehouseIconOk = L.divIcon({
  className: "",
  html: `<div style="background:#10b981;width:26px;height:26px;border-radius:50%;border:3px solid white;box-shadow:0 0 10px rgba(16,185,129,0.8);display:flex;align-items:center;justify-content:center;color:white;font-size:12px;font-weight:bold;">📦</div>`,
  iconSize: [26, 26],
  iconAnchor: [13, 13],
});

const warehouseIconWarning = L.divIcon({
  className: "",
  html: `<div style="background:#f59e0b;width:26px;height:26px;border-radius:50%;border:3px solid white;box-shadow:0 0 10px rgba(245,158,11,0.8);display:flex;align-items:center;justify-content:center;color:white;font-size:12px;font-weight:bold;">⚠️</div>`,
  iconSize: [26, 26],
  iconAnchor: [13, 13],
});

const farmIcon = L.divIcon({
  className: "",
  html: `<div style="background:#22c55e;width:28px;height:28px;border-radius:50%;border:3px solid white;box-shadow:0 0 12px rgba(34,197,94,0.9);display:flex;align-items:center;justify-content:center;color:white;font-size:14px;">🌾</div>`,
  iconSize: [28, 28],
  iconAnchor: [14, 14],
});

// Priority Transport Polyline Routes
// Priority 1 Express Route: Gwalior Mangoes 🥭 -> Delhi Azadpur Mandi
const PRIORITY_1_MANGO_ROUTE: [number, number][] = [
  [26.2183, 78.1828], // Gwalior Orchards
  [28.7041, 77.1025], // Delhi Azadpur Hub
];

// Priority 1 Express Route: Nashik Tomatoes 🍅 -> Navi Mumbai APMC
const PRIORITY_1_TOMATO_ROUTE: [number, number][] = [
  [19.9975, 73.7898], // Nashik Farm
  [19.0760, 72.9981], // Navi Mumbai Hub
];

import { CropMap } from "@/components/CropMap";

// Priority 3 Standard Route: Lasalgaon Onions 🧅 -> Kolar Hub
const PRIORITY_3_ONION_ROUTE: [number, number][] = [
  [20.1477, 74.2307], // Lasalgaon Onion Belt
  [13.1367, 78.1291], // Kolar Hub
];

export default function MapPage() {
  const [viewMode, setViewMode] = useState<"overproduction" | "logistics">("overproduction");
  const [selectedRegion, setSelectedRegion] = useState<string>("reg-gwl");
  const [activeTab, setActiveTab] = useState<"warehouses" | "regions" | "logistics">("regions");

  return (
    <div className="flex flex-col min-h-[calc(100vh-4rem)] bg-background p-4 space-y-4">
      {/* View Mode Header Switcher */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-card p-3 rounded-2xl border border-border/60 shadow-sm">
        <div>
          <h1 className="text-xl font-serif font-bold text-foreground">
            AYUTRACE GIS Supply Chain & Overproduction Map
          </h1>
          <p className="text-xs text-muted-foreground">
            Real-time district overproduction tracking & agricultural logistics routing
          </p>
        </div>

        <div className="flex items-center gap-2 bg-muted/60 p-1 rounded-xl">
          <Button
            size="sm"
            variant={viewMode === "overproduction" ? "default" : "ghost"}
            onClick={() => setViewMode("overproduction")}
            className="text-xs h-8 gap-1.5 font-semibold"
          >
            🚨 Geo-Tagged Overproduction Map (CSV Dataset)
          </Button>
          <Button
            size="sm"
            variant={viewMode === "logistics" ? "default" : "ghost"}
            onClick={() => setViewMode("logistics")}
            className="text-xs h-8 gap-1.5 font-semibold"
          >
            📦 Warehouse & Route GIS
          </Button>
        </div>
      </div>

      {viewMode === "overproduction" ? (
        <CropMap />
      ) : (
        <div className="flex flex-col md:flex-row h-[75vh] gap-0 bg-background overflow-hidden rounded-2xl border border-border/60 shadow-xl relative">
      {/* GIS Interactive Map Viewport */}
      <div className="flex-1 relative h-[50vh] md:h-full">
        <MapContainer
          center={[22.5937, 78.9629]}
          zoom={5}
          style={{ height: "100%", width: "100%" }}
          className="z-0"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {/* Render City Warehouses Pins Safely */}
          {MOCK_WAREHOUSES.map((wh) => {
            let coords: [number, number] = [20.5937, 78.9629];
            if (wh.lat != null && wh.lon != null) {
              coords = [wh.lat, wh.lon];
            } else if (wh.location_coords && typeof wh.location_coords === "string") {
              coords = wh.location_coords.split(",").map((c) => parseFloat(c.trim())) as [number, number];
            }

            return (
              <Marker
                key={wh.id}
                position={coords}
                icon={(wh as any).pest_detected || wh.pest_alert_status === "Warning" ? warehouseIconWarning : warehouseIconOk}
              >
                <Popup>
                  <div className="p-1 space-y-1.5 text-xs text-foreground">
                    <h4 className="font-bold text-sm text-emerald-600 flex items-center gap-1">
                      <Warehouse className="w-3.5 h-3.5" /> {wh.name}
                    </h4>
                    <p className="text-muted-foreground">Location: {(wh as any).city || (wh as any).location_name}, {(wh as any).state || ""}</p>
                    <div className="grid grid-cols-2 gap-1.5 bg-muted/60 p-2 rounded-lg">
                      <div>🌡️ Temp: <strong>{wh.current_temp_c ?? wh.temperature_celsius}°C</strong></div>
                      <div>💧 Humidity: <strong>{wh.humidity_pct ?? wh.humidity_percent}%</strong></div>
                    </div>
                    <p className="text-[11px] font-semibold text-amber-600">
                      Pest Alert: {(wh as any).pest_detected ? "Detected ⚠️" : "Optimal"} | Rank Score: #{wh.calculated_rank_score ?? wh.rank_score}
                    </p>
                  </div>
                </Popup>
              </Marker>
            );
          })}

          {/* Render Regional Crop Belts Pins Safely */}
          {MOCK_CROP_REGIONS.map((reg) => {
            let coords: [number, number] = [20.5937, 78.9629];
            if (reg.geo_coords && typeof reg.geo_coords === "string") {
              coords = reg.geo_coords.split(",").map((c) => parseFloat(c.trim())) as [number, number];
            }

            return (
              <Marker key={reg.id} position={coords} icon={farmIcon}>
                <Popup>
                  <div className="p-1.5 text-xs space-y-1 text-foreground">
                    <h4 className="font-bold text-sm">{reg.region_name}</h4>
                    <p>Dominant Crop: <strong>{reg.major_crop}</strong></p>
                    <p>Status: <span className="text-red-500 font-bold">{reg.production_status}</span></p>
                    <p>Est. Yield: {reg.estimated_yield_tons.toLocaleString()} Tons</p>
                    {reg.recommended_alternative_crop && (
                      <p className="text-emerald-600 font-semibold mt-1">
                        🌱 Area Advice: {reg.recommended_alternative_crop}
                      </p>
                    )}
                  </div>
                </Popup>
              </Marker>
            );
          })}

          {/* Polyline Route Priority 1: Gwalior Mangoes 🥭 (Orange Express Polyline) */}
          <Polyline
            positions={PRIORITY_1_MANGO_ROUTE}
            pathOptions={{ color: "#f97316", weight: 5, dashArray: "10, 10" }}
          />

          {/* Polyline Route Priority 1: Nashik Tomatoes 🍅 (Red Express Polyline) */}
          <Polyline
            positions={PRIORITY_1_TOMATO_ROUTE}
            pathOptions={{ color: "#ef4444", weight: 4, dashArray: "8, 8" }}
          />

          {/* Polyline Route Priority 3: Lasalgaon Onions 🧅 (Green Standard Polyline) */}
          <Polyline
            positions={PRIORITY_3_ONION_ROUTE}
            pathOptions={{ color: "#10b981", weight: 3 }}
          />
        </MapContainer>

        {/* Floating Route Legend */}
        <div className="absolute bottom-4 left-4 z-[400] bg-card/95 backdrop-blur-md border border-border/60 p-3.5 rounded-2xl shadow-xl text-xs space-y-2 max-w-[300px]">
          <h4 className="font-bold flex items-center gap-1.5 text-foreground">
            <Truck className="w-4 h-4 text-primary" /> Spoilage-Priority Route Queue
          </h4>
          <div className="space-y-1.5 text-[11px]">
            <div className="flex items-center gap-2">
              <span className="w-5 h-1.5 bg-orange-500 rounded-full inline-block" />
              <span>Priority 1: Gwalior Mangoes 🥭 (Express 2-Day Life)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-5 h-1.5 bg-red-500 rounded-full inline-block" />
              <span>Priority 1: Nashik Tomatoes 🍅 (Express 3-Day Life)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-5 h-1.5 bg-emerald-500 rounded-full inline-block" />
              <span>Priority 3: Lasalgaon Onions 🧅 (Standard 45-Day Life)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Sidebar Controls & Regional Farmer Advice */}
      <div className="w-full md:w-[420px] bg-card border-l border-border/60 p-4 space-y-4 overflow-y-auto custom-scrollbar">
        <div>
          <h2 className="text-xl font-serif font-bold flex items-center gap-2">
            <MapPin className="w-5 h-5 text-primary" /> Regional Crop GIS & Spoilage Control
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Area-wise crop dominance, cold storage ranks & regional farmer sowing advice
          </p>
        </div>

        {/* Tab Controls */}
        <div className="grid grid-cols-3 gap-1 bg-muted/60 p-1 rounded-xl">
          <Button
            size="sm"
            variant={activeTab === "regions" ? "default" : "ghost"}
            onClick={() => setActiveTab("regions")}
            className="text-xs h-8"
          >
            Crop Belts
          </Button>
          <Button
            size="sm"
            variant={activeTab === "warehouses" ? "default" : "ghost"}
            onClick={() => setActiveTab("warehouses")}
            className="text-xs h-8"
          >
            Cold Hubs
          </Button>
          <Button
            size="sm"
            variant={activeTab === "logistics" ? "default" : "ghost"}
            onClick={() => setActiveTab("logistics")}
            className="text-xs h-8"
          >
            Priority Queue
          </Button>
        </div>

        {/* Tab Content 1: GIS Crop Regions & Area-Wise Farmer Advice */}
        {activeTab === "regions" && (
          <div className="space-y-3">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Regional Crop Dominance & Farmer Recommendations
            </h3>
            {MOCK_CROP_REGIONS.map((reg) => (
              <Card
                key={reg.id}
                onClick={() => setSelectedRegion(reg.id || "")}
                className={`border cursor-pointer transition-all ${
                  selectedRegion === reg.id
                    ? "border-primary bg-primary/10"
                    : "border-border/60 hover:border-primary/40 bg-background/60"
                }`}
              >
                <CardContent className="p-4 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-sm text-foreground">{reg.region_name}</h4>
                    <Badge
                      className={
                        reg.production_status === "Overproduction Risk"
                          ? "bg-red-500/20 text-red-400 border-red-500/40"
                          : "bg-emerald-500/20 text-emerald-400 border-emerald-500/40"
                      }
                    >
                      {reg.production_status === "Overproduction Risk" && (
                        <AlertTriangle className="w-3 h-3 mr-1" />
                      )}
                      {reg.production_status}
                    </Badge>
                  </div>

                  <p className="text-xs text-muted-foreground">
                    Dominant Crop: <strong className="text-foreground">{reg.major_crop}</strong> ({reg.estimated_yield_tons.toLocaleString()} Tons)
                  </p>

                  {/* Area-Wise Farmer Crop Advice Box */}
                  <div className="bg-emerald-950/30 border border-emerald-500/30 rounded-xl p-2.5 text-xs text-emerald-300 space-y-1">
                    <span className="font-bold flex items-center gap-1 text-[11px] text-emerald-400">
                      <Sprout className="w-3.5 h-3.5" /> Area-Wise Farmer Advice:
                    </span>
                    <p className="text-[11px] leading-tight">
                      {reg.recommended_alternative_crop || "Maintain current crop rotation balance."}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Tab Content 2: Warehouses IoT Quality Ranking */}
        {activeTab === "warehouses" && (
          <div className="space-y-3">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              City Warehouse Cold Storage Ranks
            </h3>
            {MOCK_WAREHOUSES.map((wh) => (
              <Card
                key={wh.id}
                className="border border-border/60 hover:border-primary/40 transition-all bg-background/60"
              >
                <CardContent className="p-3.5 space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-sm flex items-center gap-1.5">
                      <Warehouse className="w-4 h-4 text-emerald-400" /> {wh.name}
                    </h4>
                    <Badge
                      className={
                        (wh.calculated_rank_score ?? wh.rank_score) >= 80
                          ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/40"
                          : "bg-amber-500/20 text-amber-400 border-amber-500/40"
                      }
                    >
                      Rank #{wh.calculated_rank_score ?? wh.rank_score}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <Thermometer className="w-3.5 h-3.5 text-blue-400" />
                      <span>{wh.current_temp_c ?? wh.temperature_celsius}°C (Cold)</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Pest: {(wh as any).pest_detected ? "Detected ⚠️" : "Optimal"}</span>
                    </div>
                  </div>

                  <div className="space-y-1 pt-1">
                    <div className="flex justify-between text-[11px] text-muted-foreground">
                      <span>Occupied Capacity</span>
                      <span className="font-bold">
                        {Math.round(
                          (((wh.occupied_capacity_tonnes ?? (wh as any).capacity_used_pct ?? 50) as number) /
                            ((wh.storage_capacity_tonnes ?? 100) as number)) *
                            100
                        )}
                        %
                      </span>
                    </div>
                    <div className="w-full bg-muted h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-primary h-full rounded-full"
                        style={{
                          width: `${Math.min(
                            100,
                            Math.round(
                              (((wh.occupied_capacity_tonnes ?? (wh as any).capacity_used_pct ?? 50) as number) /
                                ((wh.storage_capacity_tonnes ?? 100) as number)) *
                                100
                            )
                          )}%`,
                        }}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Tab Content 3: Smart Spoilage Priority Queue */}
        {activeTab === "logistics" && (
          <div className="space-y-3">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              City-Wise Priority Transportation Queue
            </h3>
            <Card className="border-orange-500/40 bg-orange-950/20">
              <CardHeader className="p-3 pb-2">
                <CardTitle className="text-sm text-orange-400 flex items-center gap-1.5">
                  <Zap className="w-4 h-4" /> Priority 1: Gwalior Mangoes 🥭 & Nashik Tomatoes 🍅
                </CardTitle>
              </CardHeader>
              <CardContent className="p-3 pt-0 text-xs space-y-1 text-foreground/90">
                <p><strong>Gwalior Hub:</strong> Dasheri Mangoes (2 Days Life) &rarr; Refrigerated Express SLA</p>
                <p><strong>Nashik Hub:</strong> Red Tomatoes (3 Days Life) &rarr; Express Refrigerated Truck</p>
              </CardContent>
            </Card>

            <Card className="border-emerald-500/30 bg-emerald-950/20">
              <CardHeader className="p-3 pb-2">
                <CardTitle className="text-sm text-emerald-400 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" /> Priority 3: Lasalgaon Red Onions 🧅
                </CardTitle>
              </CardHeader>
              <CardContent className="p-3 pt-0 text-xs space-y-1 text-foreground/90">
                <p><strong>Lasalgaon Hub:</strong> Red Onions (45 Days Life) &rarr; Standard Ventilated Transit</p>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
      </div>
      )}
    </div>
  );
}





