import { useLocation } from "wouter";
import {
  Sprout,
  ShieldCheck,
  Zap,
  MapPin,
  Flame,
  Sparkles,
  ArrowRight,
  Truck,
  Warehouse,
  Vote,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DynamicDiscountBanner } from "@/components/discounts/dynamic-discount-banner";
import { VisionSpoilageScanner } from "@/components/spoilage/vision-scanner";

export default function Home() {
  const [, setLocation] = useLocation();

  return (
    <div className="space-y-16 pb-16">
      {/* Hero Section */}
      <section className="relative pt-12 pb-16 px-4 max-w-7xl mx-auto text-center space-y-6">
        <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/40 text-xs px-3 py-1 animate-pulse">
          🌱 Zero Spoilage & Smart Supply Chain Platform
        </Badge>
        <h1 className="text-4xl md:text-6xl font-serif font-bold tracking-tight max-w-4xl mx-auto leading-tight">
          Pioneering <span className="text-emerald-400">Zero Food Waste</span> across Farm, Mandi & Retail
        </h1>
        <p className="text-muted-foreground text-base md:text-lg max-w-2xl mx-auto">
          AyuTrace Agri-Fresh combines IoT Cold-Chain Monitoring, GIS Regional Geo-Tagging, AI Crop Advisory, and Computer Vision Freshness Scoring to optimize perishable distribution.
        </p>

        <div className="flex flex-wrap justify-center gap-4 pt-2">
          <Button
            size="lg"
            onClick={() => setLocation("/map")}
            className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2 text-sm font-bold shadow-lg"
          >
            <MapPin className="w-4 h-4" /> Explore GIS Map & Cold Hubs
          </Button>
          <Button
            size="lg"
            variant="outline"
            onClick={() => setLocation("/products")}
            className="gap-2 text-sm border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/10"
          >
            <Flame className="w-4 h-4 text-amber-400" /> Dynamic Rescue Deals
          </Button>
        </div>
      </section>

      {/* Feature Cards Grid */}
      <section className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border border-border/60 bg-card hover:border-emerald-500/40 transition-all p-6 space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
            <Zap className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold">Priority Transport Routing</h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Perishable items with short shelf-life (Tomatoes 🍅) get Priority 1 Express Transit, while long-life items (Onions 🧅) use standard routing.
          </p>
        </Card>

        <Card className="border border-border/60 bg-card hover:border-emerald-500/40 transition-all p-6 space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
            <Warehouse className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold">IoT Cold-Chain Telemetry</h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            City warehouses are ranked live based on temperature, humidity, capacity, and pest risk metrics to ensure optimal storage quality.
          </p>
        </Card>

        <Card className="border border-border/60 bg-card hover:border-emerald-500/40 transition-all p-6 space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-primary/20 border border-primary/40 flex items-center justify-center text-primary">
            <Sparkles className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold">AI Computer Vision Scanner</h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Scan any crop photo to get a 0-100% freshness score, spoilage stage prediction, and automated clearance discount suggestions.
          </p>
        </Card>
      </section>

      {/* Dynamic Flash Discount Section */}
      <section className="max-w-7xl mx-auto px-4">
        <DynamicDiscountBanner />
      </section>

      {/* Computer Vision Scanner Showcase */}
      <section className="max-w-7xl mx-auto px-4">
        <VisionSpoilageScanner />
      </section>

      {/* Call to Action for Farmers & Community */}
      <section className="max-w-7xl mx-auto px-4">
        <Card className="border-2 border-emerald-500/30 bg-gradient-to-r from-emerald-950/40 via-card to-background p-8 rounded-3xl text-center md:text-left flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/40 text-xs">
              Kisan-Grahak Community
            </Badge>
            <h2 className="text-2xl md:text-3xl font-serif font-bold">
              Join the Demand-Supply Crop Balancing Polls
            </h2>
            <p className="text-xs md:text-sm text-muted-foreground">
              Vote on upcoming crop sowings, receive crop protection AI advice, and prevent regional overproduction.
            </p>
          </div>
          <Button
            size="lg"
            onClick={() => setLocation("/community")}
            className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2 font-bold shrink-0"
          >
            <Vote className="w-4 h-4" /> Open Community Hub <ArrowRight className="w-4 h-4" />
          </Button>
        </Card>
      </section>
    </div>
  );
}
