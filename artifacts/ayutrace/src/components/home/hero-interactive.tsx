import { useState } from "react";
import { useLocation } from "wouter";
import {
  MapPin,
  Flame,
  Search,
  CheckCircle2,
  Thermometer,
  ShieldCheck,
  QrCode,
  ArrowRight,
  TrendingDown,
  Sparkles,
  Zap,
  Activity,
  ChevronRight,
  Copy,
  Check
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface SampleBatch {
  id: string;
  name: string;
  location: string;
  temp: string;
  humidity: string;
  freshness: number;
  grade: string;
  hash: string;
  status: string;
  steps: { title: string; time: string; status: "completed" | "current" | "upcoming" }[];
}

const SAMPLE_BATCHES: Record<string, SampleBatch> = {
  "BATCH-TOMATO-882": {
    id: "BATCH-TOMATO-882",
    name: "Nashik Organic Chilled Tomatoes 🍅",
    location: "Nashik Mandi → Mumbai Cold Hub",
    temp: "4.2°C (Optimal)",
    humidity: "86%",
    freshness: 94,
    grade: "Grade A+ Premium",
    hash: "0x8f4b...3e1a9",
    status: "Priority Chilled Transit",
    steps: [
      { title: "Harvested & Geo-Tagged at Farm", time: "06:30 AM", status: "completed" },
      { title: "IoT Cold Storage Hub Arrival (Nashik)", time: "09:15 AM", status: "completed" },
      { title: "Chilled Express Transport (Temp 4.2°C)", time: "11:45 AM", status: "current" },
      { title: "Mumbai Distribution Center Dispatch", time: "ETA 03:30 PM", status: "upcoming" }
    ]
  },
  "BATCH-MANGO-409": {
    id: "BATCH-MANGO-409",
    name: "Gwalior Sweet Dasheri Mangoes 🥭",
    location: "Gwalior Farm → Bhopal Hub",
    temp: "6.5°C (Chilled)",
    humidity: "78%",
    freshness: 82,
    grade: "Grade A Rescue Clearance",
    hash: "0x3c7e...9a4d2",
    status: "Flash Clearance Sale Active (54% OFF)",
    steps: [
      { title: "Harvest & AI Vision Scan", time: "Yesterday 04:00 PM", status: "completed" },
      { title: "GIS Hub Transit (Gwalior)", time: "Yesterday 08:30 PM", status: "completed" },
      { title: "Dynamic Clearance Discount Triggered", time: "Today 08:00 AM", status: "completed" },
      { title: "Last-Mile Delivery Dispatch", time: "In Progress", status: "current" }
    ]
  },
  "BATCH-HERB-991": {
    id: "BATCH-HERB-991",
    name: "Kerala Organic Ashwagandha Roots 🌿",
    location: "Wayanad Farm → Kochi Export Dock",
    temp: "18.0°C (Ambient Controlled)",
    humidity: "55%",
    freshness: 98,
    grade: "Ayurvedic Export Grade",
    hash: "0x9d11...f8e23",
    status: "Quality Certified & Blockchain Verified",
    steps: [
      { title: "Organically Harvested in Wayanad", time: "2 Days Ago", status: "completed" },
      { title: "Lab Lab Quality Audit & Moisture Test", time: "Yesterday", status: "completed" },
      { title: "Sealed IoT Container Shipping", time: "Today 06:00 AM", status: "completed" },
      { title: "Port Export Clearance", time: "Ready for Dispatch", status: "current" }
    ]
  }
};

export function HeroInteractiveSection() {
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBatch, setSelectedBatch] = useState<SampleBatch | null>(null);
  const [copiedHash, setCopiedHash] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const query = searchQuery.trim().toUpperCase();
    if (SAMPLE_BATCHES[query]) {
      setSelectedBatch(SAMPLE_BATCHES[query]);
    } else if (query) {
      // Default fallback mock batch for any user input
      setSelectedBatch({
        id: query,
        name: `Perishable Agri Batch (${query}) 🌾`,
        location: "Regional GIS Mandi → Hub Transit",
        temp: "5.1°C (Monitored)",
        humidity: "82%",
        freshness: 89,
        grade: "Verified Quality Grade A",
        hash: `0x${Math.random().toString(16).substring(2, 10)}...${Math.random().toString(16).substring(2, 6)}`,
        status: "IoT Active Tracking",
        steps: [
          { title: "Farm Origin Geo-Tagged", time: "07:00 AM", status: "completed" },
          { title: "Cold Storage Ingestion", time: "10:30 AM", status: "completed" },
          { title: "Transit Quality Telemetry", time: "Active", status: "current" },
          { title: "Destination Mandi Clearance", time: "Scheduled", status: "upcoming" }
        ]
      });
    } else {
      setSelectedBatch(SAMPLE_BATCHES["BATCH-TOMATO-882"]);
    }
  };

  const copyHash = (hash: string) => {
    navigator.clipboard.writeText(hash);
    setCopiedHash(true);
    setTimeout(() => setCopiedHash(false), 2000);
  };

  return (
    <section className="relative pt-8 pb-12 px-4 max-w-7xl mx-auto space-y-10 overflow-hidden">
      {/* Background Decorative Ambient Glowing Orbs */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute top-1/3 right-10 w-72 h-72 bg-amber-500/10 rounded-full blur-3xl pointer-events-none -z-10" />

      {/* Main Hero Header Header */}
      <div className="text-center space-y-5 max-w-4xl mx-auto">
        <div className="inline-flex items-center gap-2 bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 px-4 py-1.5 rounded-full text-xs font-semibold backdrop-blur-md animate-pulse">
          <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
          <span>Next-Gen Zero Spoilage Agri-Tech Platform</span>
        </div>

        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif font-extrabold tracking-tight leading-[1.15] text-foreground">
          Pioneering <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-amber-300">Zero Food Waste</span> across Farm, Mandi & Retail
        </h1>

        <p className="text-muted-foreground text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
          AyuTrace Agri-Fresh integrates <span className="text-foreground font-medium">IoT Cold-Chain Telemetry</span>, <span className="text-foreground font-medium">GIS Geo-Tagging</span>, <span className="text-foreground font-medium">Computer Vision Quality Scoring</span>, and <span className="text-foreground font-medium">Dynamic Rescue Pricing</span>.
        </p>

        {/* CTA Button Bar */}
        <div className="flex flex-wrap justify-center items-center gap-3 pt-2">
          <Button
            size="lg"
            onClick={() => setLocation("/map")}
            className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm px-6 py-6 rounded-2xl shadow-xl shadow-emerald-950/40 hover:scale-[1.02] active:scale-[0.98] transition-all gap-2"
          >
            <MapPin className="w-4 h-4" /> Live GIS Hubs & Map
          </Button>

          <Button
            size="lg"
            variant="outline"
            onClick={() => setLocation("/products")}
            className="border-amber-500/40 text-amber-300 hover:bg-amber-500/10 font-semibold text-sm px-6 py-6 rounded-2xl backdrop-blur-md hover:scale-[1.02] active:scale-[0.98] transition-all gap-2"
          >
            <Flame className="w-4 h-4 text-amber-400 animate-bounce" /> Dynamic Rescue Deals
          </Button>

          <Button
            size="lg"
            variant="secondary"
            onClick={() => setSelectedBatch(SAMPLE_BATCHES["BATCH-TOMATO-882"])}
            className="bg-card hover:bg-card/80 border border-border text-foreground font-semibold text-sm px-6 py-6 rounded-2xl hover:scale-[1.02] active:scale-[0.98] transition-all gap-2"
          >
            <QrCode className="w-4 h-4 text-emerald-400" /> Interactive Batch Demo
          </Button>
        </div>
      </div>

      {/* Interactive Quick Trace Search Bar Card */}
      <Card className="max-w-3xl mx-auto border border-emerald-500/30 bg-card/80 backdrop-blur-xl shadow-2xl rounded-3xl p-6 glow-emerald transition-all">
        <CardContent className="p-0 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400">
                <Search className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold font-serif text-foreground">Interactive Farm-to-Fork Batch Tracer</h3>
                <p className="text-xs text-muted-foreground">Enter any Batch ID or click a sample below to inspect real-time cold chain telemetry</p>
              </div>
            </div>
            <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/40 text-[11px] hidden sm:flex items-center gap-1">
              <Activity className="w-3 h-3 animate-pulse" /> Live Telemetry
            </Badge>
          </div>

          <form onSubmit={handleSearch} className="flex gap-2">
            <Input
              type="text"
              placeholder="Enter Batch ID (e.g. BATCH-TOMATO-882, BATCH-MANGO-409)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-background/80 border-emerald-500/30 text-sm h-12 rounded-xl focus-visible:ring-emerald-500"
            />
            <Button type="submit" className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold h-12 px-6 rounded-xl shrink-0 gap-1">
              Trace <ArrowRight className="w-4 h-4" />
            </Button>
          </form>

          {/* Quick Preset Batch Chips */}
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <span className="text-xs text-muted-foreground font-medium">Try Demo Batches:</span>
            {Object.values(SAMPLE_BATCHES).map((batch) => (
              <button
                key={batch.id}
                type="button"
                onClick={() => {
                  setSearchQuery(batch.id);
                  setSelectedBatch(batch);
                }}
                className="text-xs px-3 py-1.5 rounded-lg bg-emerald-950/40 border border-emerald-800/40 text-emerald-300 hover:bg-emerald-900/60 hover:border-emerald-500/60 transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <span>{batch.id}</span>
                <span className="text-[10px] text-emerald-400/80">({batch.name.split(" ")[1]})</span>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Live Interactive Telemetry Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-5xl mx-auto">
        <div className="bg-card/70 border border-border/80 rounded-2xl p-4 text-center space-y-1 hover:border-emerald-500/40 transition-all">
          <div className="text-2xl sm:text-3xl font-extrabold font-mono text-emerald-400">48,290+ kg</div>
          <div className="text-xs text-muted-foreground font-medium">Food Spoilage Rescued</div>
        </div>
        <div className="bg-card/70 border border-border/80 rounded-2xl p-4 text-center space-y-1 hover:border-amber-500/40 transition-all">
          <div className="text-2xl sm:text-3xl font-extrabold font-mono text-amber-400">142 Hubs</div>
          <div className="text-xs text-muted-foreground font-medium">IoT Cold Storage Active</div>
        </div>
        <div className="bg-card/70 border border-border/80 rounded-2xl p-4 text-center space-y-1 hover:border-teal-500/40 transition-all">
          <div className="text-2xl sm:text-3xl font-extrabold font-mono text-teal-400">99.4%</div>
          <div className="text-xs text-muted-foreground font-medium">Cold-Chain Uptime</div>
        </div>
        <div className="bg-card/70 border border-border/80 rounded-2xl p-4 text-center space-y-1 hover:border-emerald-500/40 transition-all">
          <div className="text-2xl sm:text-3xl font-extrabold font-mono text-emerald-300">12,450+</div>
          <div className="text-xs text-muted-foreground font-medium">AI Computer Vision Scans</div>
        </div>
      </div>

      {/* Batch Details Modal Dialog */}
      <Dialog open={!!selectedBatch} onOpenChange={(open) => !open && setSelectedBatch(null)}>
        {selectedBatch && (
          <DialogContent className="max-w-xl bg-card border-emerald-500/40 text-foreground rounded-3xl p-6 space-y-5">
            <DialogHeader className="space-y-1 text-left">
              <div className="flex items-center justify-between">
                <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/40 text-xs">
                  {selectedBatch.id}
                </Badge>
                <span className="text-xs font-mono text-muted-foreground flex items-center gap-1">
                  <Activity className="w-3.5 h-3.5 text-emerald-400 animate-pulse" /> {selectedBatch.status}
                </span>
              </div>
              <DialogTitle className="text-xl font-bold font-serif">{selectedBatch.name}</DialogTitle>
              <p className="text-xs text-muted-foreground">{selectedBatch.location}</p>
            </DialogHeader>

            {/* Metrics Breakdown Grid */}
            <div className="grid grid-cols-3 gap-3 bg-background/80 p-3.5 rounded-2xl border border-border/60 text-center">
              <div>
                <span className="text-[11px] text-muted-foreground block">Cold Temp</span>
                <span className="text-sm font-bold text-emerald-400 flex items-center justify-center gap-1 mt-0.5">
                  <Thermometer className="w-3.5 h-3.5" /> {selectedBatch.temp}
                </span>
              </div>
              <div>
                <span className="text-[11px] text-muted-foreground block">Freshness Score</span>
                <span className="text-sm font-bold text-amber-400 mt-0.5 block">{selectedBatch.freshness}%</span>
              </div>
              <div>
                <span className="text-[11px] text-muted-foreground block">Quality Grade</span>
                <span className="text-xs font-semibold text-emerald-300 mt-0.5 block">{selectedBatch.grade}</span>
              </div>
            </div>

            {/* Step Timeline */}
            <div className="space-y-3 pt-1">
              <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Farm-to-Fork Live Timeline</h4>
              <div className="space-y-2.5 pl-2 border-l-2 border-emerald-500/30">
                {selectedBatch.steps.map((step, idx) => (
                  <div key={idx} className="relative pl-4">
                    <div
                      className={`absolute -left-[13px] top-1 w-4 h-4 rounded-full border-2 flex items-center justify-center text-[8px] ${
                        step.status === "completed"
                          ? "bg-emerald-500 border-emerald-400 text-black font-bold"
                          : step.status === "current"
                          ? "bg-amber-500 border-amber-400 animate-ping"
                          : "bg-muted border-border"
                      }`}
                    >
                      {step.status === "completed" ? "✓" : ""}
                    </div>
                    <div className="flex items-center justify-between">
                      <span className={`text-xs font-medium ${step.status === "current" ? "text-amber-400 font-bold" : "text-foreground"}`}>
                        {step.title}
                      </span>
                      <span className="text-[10px] text-muted-foreground">{step.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Blockchain Hash Footer */}
            <div className="flex items-center justify-between pt-2 border-t border-border text-xs text-muted-foreground">
              <span className="font-mono text-[11px] truncate max-w-[280px]">Hash: {selectedBatch.hash}</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => copyHash(selectedBatch.hash)}
                className="h-7 text-xs text-emerald-400 hover:text-emerald-300 gap-1"
              >
                {copiedHash ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedHash ? "Copied" : "Copy Hash"}
              </Button>
            </div>
          </DialogContent>
        )}
      </Dialog>
    </section>
  );
}
