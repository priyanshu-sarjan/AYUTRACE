import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

// Custom Leaflet Markers using L.divIcon
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
      animation: pulse-red 2s infinite ease-in-out;
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
      map.flyTo(coords, 9, { duration: 1.2 });
    }
  }, [coords, map]);
  return null;
}

export function CropMap() {
  const [data, setData] = useState<OverproductionDataset | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "overproducing" | "standard">("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedDistrict, setSelectedDistrict] = useState<DistrictData | null>(null);
  const [flyCoords, setFlyCoords] = useState<[number, number] | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      // Try fetching from root or public path
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
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 min-h-[580px]">
        {/* Map Viewport (Lg 8 cols) */}
        <div className="lg:col-span-8 flex flex-col space-y-3">
          {/* Map Controls Header */}
          <div className="flex flex-wrap items-center justify-between gap-2 bg-card p-3 rounded-2xl border border-border/60">
            <div className="flex items-center gap-1.5">
              <Button
                size="sm"
                variant={filter === "all" ? "default" : "outline"}
                onClick={() => setFilter("all")}
                className="text-xs h-8"
              >
                All Districts ({data.districts.length})
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
            </div>

            <div className="relative w-full sm:w-56">
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
          <div className="relative flex-1 rounded-2xl overflow-hidden border border-border/60 shadow-xl min-h-[460px]">
            <MapContainer
              center={[10.8, 78.7]}
              zoom={7.5}
              style={{ height: "100%", width: "100%", minHeight: "460px" }}
              className="z-0"
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />

              <MapCenterController coords={flyCoords} />

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
            <div className="absolute bottom-4 left-4 z-[400] bg-card/95 backdrop-blur-md border border-border/60 p-3 rounded-xl shadow-lg text-xs space-y-1.5 max-w-[240px]">
              <h5 className="font-bold text-[11px] uppercase tracking-wider text-muted-foreground">
                Map Legend
              </h5>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-red-500 border border-white inline-block shadow-sm" />
                <span className="text-foreground text-[11px] font-medium">
                  Overproducing District (&ge; {data.metadata.thresholdProductivityTonnesPerHa} T/Ha)
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-emerald-500 border border-white inline-block shadow-sm" />
                <span className="text-foreground text-[11px]">
                  Standard Productivity District (&lt; {data.metadata.thresholdProductivityTonnesPerHa} T/Ha)
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar District List & Inspector (Lg 4 cols) */}
        <div className="lg:col-span-4 flex flex-col bg-card border border-border/60 rounded-2xl p-4 space-y-3 overflow-hidden">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-foreground flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-primary" /> District Breakdown
            </h3>
            <Badge variant="outline" className="text-[11px]">
              {filteredDistricts.length} results
            </Badge>
          </div>

          {/* District Scroll List */}
          <div className="flex-1 overflow-y-auto space-y-2 pr-1 max-h-[480px] custom-scrollbar">
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
                      <span>Overproduction Flag</span>
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
