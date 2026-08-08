import { useState, useMemo } from "react";
import {
  Thermometer,
  Clock,
  Flame,
  ShieldCheck,
  AlertTriangle,
  Truck,
  Sparkles,
  Zap,
  RotateCcw,
  ShoppingBag,
  Sliders
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { useLocation } from "wouter";

interface CropProfile {
  id: string;
  name: string;
  emoji: string;
  idealTemp: number; // in °C
  baseShelfHours: number;
  tempSensitivity: number; // multiplier for temp deviation penalty
}

const CROPS: CropProfile[] = [
  { id: "tomato", name: "Nashik Tomato", emoji: "🍅", idealTemp: 5, baseShelfHours: 120, tempSensitivity: 3.5 },
  { id: "mango", name: "Gwalior Mango", emoji: "🥭", idealTemp: 8, baseShelfHours: 96, tempSensitivity: 3.0 },
  { id: "spinach", name: "Fresh Leafy Greens", emoji: "🥬", idealTemp: 3, baseShelfHours: 72, tempSensitivity: 5.0 },
  { id: "ashwagandha", name: "Ashwagandha Roots", emoji: "🌿", idealTemp: 18, baseShelfHours: 360, tempSensitivity: 1.2 },
];

export function ColdChainSimulator() {
  const [, setLocation] = useLocation();
  const [selectedCropId, setSelectedCropId] = useState<string>("tomato");
  const [transitHours, setTransitHours] = useState<number>(36);
  const [temperature, setTemperature] = useState<number>(14);

  const activeCrop = CROPS.find((c) => c.id === selectedCropId) || CROPS[0];

  // Real-time calculation logic for spoilage risk and discount
  const calculation = useMemo(() => {
    const tempDiff = Math.max(0, temperature - activeCrop.idealTemp);
    const decayHoursPenalty = tempDiff * activeCrop.tempSensitivity * (transitHours / 24);
    const effectiveHoursUsed = transitHours + decayHoursPenalty;

    const remainingHours = Math.max(0, Math.round(activeCrop.baseShelfHours - effectiveHoursUsed));
    const spoilageRiskPct = Math.min(100, Math.round((effectiveHoursUsed / activeCrop.baseShelfHours) * 100));

    let riskLevel: "low" | "medium" | "critical" = "low";
    let recommendedAction = "Standard Chilled Transit";
    let recommendedDiscount = 0;

    if (spoilageRiskPct >= 70) {
      riskLevel = "critical";
      recommendedAction = "PRIORITY 1 EXPRESS DISPATCH + 60% Clearance Flash Sale";
      recommendedDiscount = 60;
    } else if (spoilageRiskPct >= 40) {
      riskLevel = "medium";
      recommendedAction = "Chilled Air-Freight & 30% Dynamic Discount Clearance";
      recommendedDiscount = 30;
    } else {
      riskLevel = "low";
      recommendedAction = "Optimal Cold Storage - Transit Grade A Premium";
      recommendedDiscount = 0;
    }

    return {
      remainingHours,
      spoilageRiskPct,
      riskLevel,
      recommendedAction,
      recommendedDiscount
    };
  }, [activeCrop, transitHours, temperature]);

  const resetSimulator = () => {
    setTransitHours(36);
    setTemperature(14);
    setSelectedCropId("tomato");
  };

  return (
    <Card className="border border-emerald-500/30 bg-card/90 backdrop-blur-xl shadow-2xl rounded-3xl overflow-hidden glow-emerald">
      <CardContent className="p-6 md:p-8 space-y-6">
        {/* Header Title */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-border/60 pb-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0">
              <Sliders className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-bold font-serif text-foreground">Interactive Cold-Chain & Spoilage Simulator</h3>
                <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/40 text-[10px]">
                  Real-time AI Engine
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                Simulate how transit time and storage temperature affect crop degradation, shelf-life, and automated discount triggers.
              </p>
            </div>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={resetSimulator}
            className="text-xs text-muted-foreground hover:text-foreground gap-1 self-end sm:self-auto"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Reset Demo
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Controls Column (Left) */}
          <div className="lg:col-span-6 space-y-6">
            {/* Step 1: Select Crop */}
            <div className="space-y-2.5">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">
                1. Select Perishable Crop Batch
              </label>
              <div className="grid grid-cols-2 gap-2.5">
                {CROPS.map((crop) => (
                  <button
                    key={crop.id}
                    type="button"
                    onClick={() => setSelectedCropId(crop.id)}
                    className={`p-3 rounded-2xl border text-left transition-all flex items-center gap-2.5 cursor-pointer ${
                      selectedCropId === crop.id
                        ? "bg-emerald-950/60 border-emerald-500 text-emerald-300 shadow-md shadow-emerald-950/50"
                        : "bg-background/70 border-border/60 text-muted-foreground hover:border-emerald-500/30 hover:text-foreground"
                    }`}
                  >
                    <span className="text-2xl">{crop.emoji}</span>
                    <div>
                      <div className="text-xs font-bold leading-tight">{crop.name}</div>
                      <div className="text-[10px] text-muted-foreground">Ideal: {crop.idealTemp}°C</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Step 2: Slider for Transit Hours */}
            <div className="space-y-3 bg-background/60 p-4 rounded-2xl border border-border/60">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-foreground flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-emerald-400" /> Transit Duration
                </span>
                <span className="font-mono font-bold text-emerald-400 text-sm">{transitHours} Hours</span>
              </div>
              <Slider
                value={[transitHours]}
                min={4}
                max={96}
                step={2}
                onValueChange={(val) => setTransitHours(val[0])}
                className="py-1 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-muted-foreground font-mono">
                <span>4h (Express)</span>
                <span>48h (Regional Transit)</span>
                <span>96h (Long Haul)</span>
              </div>
            </div>

            {/* Step 3: Slider for Storage Temp */}
            <div className="space-y-3 bg-background/60 p-4 rounded-2xl border border-border/60">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-foreground flex items-center gap-1.5">
                  <Thermometer className={`w-4 h-4 ${temperature > 20 ? "text-red-400" : "text-emerald-400"}`} />
                  Storage Temperature
                </span>
                <span className={`font-mono font-bold text-sm ${temperature > 20 ? "text-red-400" : "text-emerald-400"}`}>
                  {temperature}°C
                </span>
              </div>
              <Slider
                value={[temperature]}
                min={1}
                max={35}
                step={1}
                onValueChange={(val) => setTemperature(val[0])}
                className="py-1 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-muted-foreground font-mono">
                <span>1°C (Chilled)</span>
                <span>15°C (Ambient Hub)</span>
                <span>35°C (Extreme Heat)</span>
              </div>
            </div>
          </div>

          {/* Real-time Results Display (Right) */}
          <div className="lg:col-span-6 flex flex-col justify-between space-y-4 bg-background/90 p-6 rounded-2xl border border-emerald-500/20">
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  Live AI Predictive Diagnostics
                </span>
                <Badge
                  className={
                    calculation.riskLevel === "critical"
                      ? "bg-red-500/20 text-red-400 border-red-500/40"
                      : calculation.riskLevel === "medium"
                      ? "bg-amber-500/20 text-amber-400 border-amber-500/40"
                      : "bg-emerald-500/20 text-emerald-400 border-emerald-500/40"
                  }
                >
                  {calculation.riskLevel === "critical"
                    ? "⚠️ HIGH SPOILAGE RISK"
                    : calculation.riskLevel === "medium"
                    ? "⚡ MODERATE DECAY"
                    : "✅ OPTIMAL FRESHNESS"}
                </Badge>
              </div>

              {/* Spoilage Risk Bar */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground font-medium">Spoilage Index Score</span>
                  <span className="font-mono font-bold text-foreground">{calculation.spoilageRiskPct}%</span>
                </div>
                <div className="w-full h-3 bg-muted rounded-full overflow-hidden p-0.5 border border-border/50">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      calculation.spoilageRiskPct > 70
                        ? "bg-gradient-to-r from-amber-500 to-red-500"
                        : calculation.spoilageRiskPct > 35
                        ? "bg-gradient-to-r from-emerald-500 to-amber-500"
                        : "bg-emerald-500"
                    }`}
                    style={{ width: `${calculation.spoilageRiskPct}%` }}
                  />
                </div>
              </div>

              {/* Grid of Calculated Outputs */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-card p-3.5 rounded-xl border border-border/60 space-y-1">
                  <span className="text-[11px] text-muted-foreground block">Remaining Shelf-Life</span>
                  <span className="text-lg font-bold font-mono text-emerald-400 flex items-center gap-1">
                    <Clock className="w-4 h-4" /> ~{calculation.remainingHours} hrs
                  </span>
                </div>

                <div className="bg-card p-3.5 rounded-xl border border-border/60 space-y-1">
                  <span className="text-[11px] text-muted-foreground block">Zero-Waste Discount</span>
                  <span className="text-lg font-bold font-mono text-amber-400 flex items-center gap-1">
                    <Flame className="w-4 h-4" /> {calculation.recommendedDiscount}% OFF
                  </span>
                </div>
              </div>

              {/* Recommended Logistics Action */}
              <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-800/40 space-y-1.5">
                <span className="text-[11px] text-emerald-400 font-bold uppercase tracking-wider flex items-center gap-1">
                  <Truck className="w-3.5 h-3.5" /> Automated Supply Chain Recommendation
                </span>
                <p className="text-xs text-emerald-200 font-medium leading-relaxed">
                  {calculation.recommendedAction}
                </p>
              </div>
            </div>

            {/* Action CTA Button */}
            <div className="pt-2">
              <Button
                onClick={() => setLocation(calculation.recommendedDiscount > 0 ? "/products" : "/map")}
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-semibold py-5 rounded-xl text-xs gap-2"
              >
                <ShoppingBag className="w-4 h-4" />
                {calculation.recommendedDiscount > 0
                  ? `View ${calculation.recommendedDiscount}% OFF Rescue Deals`
                  : "Explore Cold Storage GIS Map"}
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
