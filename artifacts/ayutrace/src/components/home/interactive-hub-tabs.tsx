import { useState } from "react";
import { useLocation } from "wouter";
import {
  MapPin,
  TrendingUp,
  Warehouse,
  ShieldCheck,
  Zap,
  Activity,
  ArrowRight,
  Sparkles,
  Thermometer,
  AlertTriangle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface MandiRate {
  crop: string;
  emoji: string;
  mandi: string;
  price: string;
  trend: string;
  spoilageRisk: string;
}

const MANDI_RATES: MandiRate[] = [
  { crop: "Nashik Tomato", emoji: "🍅", mandi: "Lasalgaon Mandi, Nashik", price: "₹18/kg", trend: "+4%", spoilageRisk: "Low (Chilled Hub)" },
  { crop: "Gwalior Mango", emoji: "🥭", mandi: "Gwalior APMC Mandi", price: "₹42/kg", trend: "-12%", spoilageRisk: "High (Clearance Deal)" },
  { crop: "Bhopal Onion", emoji: "🧅", mandi: "Bhopal Karond Mandi", price: "₹24/kg", trend: "+2%", spoilageRisk: "Minimal (Standard)" },
  { crop: "Kerala Ashwagandha", emoji: "🌿", mandi: "Kochi Spice Market", price: "₹380/kg", trend: "+8%", spoilageRisk: "Zero (Dehydrated)" },
];

interface ColdHub {
  name: string;
  city: string;
  capacityPct: number;
  temp: string;
  status: "Optimal" | "High Load" | "Maintenance";
}

const COLD_HUBS: ColdHub[] = [
  { name: "Mumbai Central Refrigerated Hub", city: "Mumbai, MH", capacityPct: 78, temp: "3.8°C", status: "Optimal" },
  { name: "Bhopal Regional Solar Cold Storage", city: "Bhopal, MP", capacityPct: 92, temp: "4.1°C", status: "High Load" },
  { name: "Gwalior Agri-Fresh Warehouse", city: "Gwalior, MP", capacityPct: 64, temp: "5.0°C", status: "Optimal" },
  { name: "Pune APMC Chilled Depot", city: "Pune, MH", capacityPct: 45, temp: "4.5°C", status: "Optimal" }
];

export function InteractiveHubTabs() {
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState<"hubs" | "mandi" | "routing">("hubs");

  return (
    <div className="space-y-6">
      {/* Header & Tabs Navigation */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-serif font-bold text-foreground">Live Regional Grid & Mandi Intelligence</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Monitor real-time cold storage capacity, Mandi pricing trends, and automated priority transport routes.
          </p>
        </div>

        {/* Tab Buttons */}
        <div className="flex bg-card/80 p-1.5 rounded-2xl border border-border/60 self-stretch md:self-auto gap-1">
          <button
            type="button"
            onClick={() => setActiveTab("hubs")}
            className={`flex-1 md:flex-none px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === "hubs"
                ? "bg-emerald-600 text-white shadow-md shadow-emerald-950/40"
                : "text-muted-foreground hover:text-foreground hover:bg-background/40"
            }`}
          >
            <Warehouse className="w-3.5 h-3.5" /> Cold Hubs ({COLD_HUBS.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("mandi")}
            className={`flex-1 md:flex-none px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === "mandi"
                ? "bg-emerald-600 text-white shadow-md shadow-emerald-950/40"
                : "text-muted-foreground hover:text-foreground hover:bg-background/40"
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" /> Live Mandi Rates
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("routing")}
            className={`flex-1 md:flex-none px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === "routing"
                ? "bg-emerald-600 text-white shadow-md shadow-emerald-950/40"
                : "text-muted-foreground hover:text-foreground hover:bg-background/40"
            }`}
          >
            <Zap className="w-3.5 h-3.5" /> Priority Routing
          </button>
        </div>
      </div>

      {/* Tab 1: Cold Storage Hubs */}
      {activeTab === "hubs" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {COLD_HUBS.map((hub, idx) => (
            <Card
              key={idx}
              className="border border-border/60 bg-card hover:border-emerald-500/40 transition-all p-5 rounded-2xl space-y-3 group"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-bold text-sm text-foreground group-hover:text-emerald-400 transition-colors">
                    {hub.name}
                  </h3>
                  <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3 h-3 text-emerald-400" /> {hub.city}
                  </p>
                </div>
                <Badge
                  className={
                    hub.status === "High Load"
                      ? "bg-amber-500/20 text-amber-400 border-amber-500/30 text-[10px]"
                      : "bg-emerald-500/20 text-emerald-400 border-emerald-500/30 text-[10px]"
                  }
                >
                  {hub.status}
                </Badge>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Occupied Storage Capacity</span>
                  <span className="font-mono font-bold text-foreground">{hub.capacityPct}%</span>
                </div>
                <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      hub.capacityPct > 85 ? "bg-amber-500" : "bg-emerald-500"
                    }`}
                    style={{ width: `${hub.capacityPct}%` }}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between text-xs pt-1 border-t border-border/50">
                <span className="text-muted-foreground flex items-center gap-1">
                  <Thermometer className="w-3.5 h-3.5 text-emerald-400" /> Temperature:{" "}
                  <strong className="text-foreground font-mono">{hub.temp}</strong>
                </span>
                <button
                  type="button"
                  onClick={() => setLocation("/map")}
                  className="text-emerald-400 hover:underline font-semibold flex items-center gap-1 text-xs cursor-pointer"
                >
                  View on GIS Map <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Tab 2: Mandi Prices */}
      {activeTab === "mandi" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {MANDI_RATES.map((rate, idx) => (
            <Card key={idx} className="border border-border/60 bg-card p-4 rounded-2xl space-y-2 hover:border-emerald-500/40 transition-all">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{rate.emoji}</span>
                <div>
                  <h4 className="font-bold text-xs">{rate.crop}</h4>
                  <p className="text-[10px] text-muted-foreground truncate">{rate.mandi}</p>
                </div>
              </div>

              <div className="flex items-baseline justify-between pt-1">
                <span className="text-lg font-extrabold font-mono text-emerald-400">{rate.price}</span>
                <span className={`text-xs font-mono font-bold ${rate.trend.startsWith("+") ? "text-emerald-400" : "text-amber-400"}`}>
                  {rate.trend}
                </span>
              </div>

              <div className="text-[10px] text-muted-foreground pt-1 border-t border-border/40 flex justify-between">
                <span>Spoilage Index:</span>
                <span className="text-foreground font-medium">{rate.spoilageRisk}</span>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Tab 3: Priority Transport Routing */}
      {activeTab === "routing" && (
        <Card className="border border-emerald-500/30 bg-emerald-950/20 p-6 rounded-2xl space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold font-serif text-emerald-300">Automated Perishable Routing Algorithm</h3>
              <p className="text-xs text-muted-foreground">
                Perishable items (Tomatoes 🍅 & Berries 🍓) are assigned Priority 1 Air-Chilled Transit, while non-perishable crops (Onions 🧅 & Wheat 🌾) take standard freight.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2 text-xs">
            <div className="bg-background/80 p-3.5 rounded-xl border border-border/60 space-y-1">
              <Badge className="bg-red-500/20 text-red-400 border-red-500/30 text-[10px]">Priority 1 Express</Badge>
              <div className="font-bold text-foreground">Highly Perishable Produce</div>
              <p className="text-[11px] text-muted-foreground">Refrigerated express transit directly to city distribution hubs.</p>
            </div>
            <div className="bg-background/80 p-3.5 rounded-xl border border-border/60 space-y-1">
              <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30 text-[10px]">Priority 2 Standard</Badge>
              <div className="font-bold text-foreground">Medium Shelf Life Crops</div>
              <p className="text-[11px] text-muted-foreground">Solar cold storage buffer hubs with clearance sale triggers.</p>
            </div>
            <div className="bg-background/80 p-3.5 rounded-xl border border-border/60 space-y-1">
              <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 text-[10px]">Priority 3 Bulk</Badge>
              <div className="font-bold text-foreground">Long Life Grains & Spices</div>
              <p className="text-[11px] text-muted-foreground">Standard warehousing and moisture-controlled grain silos.</p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
