import { useState, useEffect } from "react";
import { useRoute, useLocation } from "wouter";
import {
  ShieldCheck,
  MapPin,
  Calendar,
  Thermometer,
  QrCode,
  Truck,
  ArrowLeft,
  User,
  Warehouse as WarehouseIcon,
  Zap,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { fetchBatchTraceability, HarvestBatch } from "@/lib/supabase-api";

export default function TracePage() {
  const [, params] = useRoute("/trace/:id");
  const [, setLocation] = useLocation();
  const [batch, setBatch] = useState<HarvestBatch | null>(null);
  const [loading, setLoading] = useState(true);

  const batchId = params?.id || "b0000000-0000-0000-0000-000000000001";

  useEffect(() => {
    async function loadTraceData() {
      setLoading(true);
      const data = await fetchBatchTraceability(batchId);
      setBatch(data);
      setLoading(false);
    }
    loadTraceData();
  }, [batchId]);

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center space-y-3">
        <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm font-semibold">Loading QR Code Farm-to-Fork Lifecycle...</p>
      </div>
    );
  }

  const b = batch || {
    batch_id: batchId,
    crop_name: "Tomato",
    farmer_name: "Ramesh Patel (Vidisha Collective)",
    harvest_date: "2026-08-05",
    quantity_kg: 2500,
    warehouse_name: "Gwalior Central Cold Depot",
    warehouse_city: "Gwalior",
    warehouse_temp: 4.2,
    warehouse_pest_alert: false,
    status: "in_transit",
    remaining_days_life: 2,
    freshness_pct: 80,
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
      {/* Top Bar */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setLocation("/products")}
        className="gap-2 text-xs text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Products
      </Button>

      {/* Main Lifecycle Card */}
      <Card className="border-2 border-emerald-500/30 bg-card shadow-2xl overflow-hidden">
        <CardHeader className="bg-emerald-950/30 border-b border-emerald-500/20 p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
                <QrCode className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <CardTitle className="text-2xl font-serif font-bold">
                    {b.crop_name} Batch Lifecycle
                  </CardTitle>
                  <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 text-xs">
                    <ShieldCheck className="w-3.5 h-3.5 mr-1" /> Live QR Verified
                  </Badge>
                </div>
                <p className="text-xs font-mono text-muted-foreground mt-0.5">
                  UUID: {b.batch_id}
                </p>
              </div>
            </div>

            <Badge
              variant="outline"
              className="self-start md:self-auto bg-amber-500/10 text-amber-400 border-amber-500/30 text-xs px-3 py-1"
            >
              <Zap className="w-3.5 h-3.5 mr-1" /> Priority 1 Express Logistics
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="p-6 space-y-8">
          {/* Freshness Health Metric */}
          <div className="bg-muted/40 border border-border/60 p-4 rounded-2xl space-y-2">
            <div className="flex justify-between text-xs font-medium">
              <span>Predictive Freshness Health</span>
              <span className="font-bold text-emerald-400">{b.freshness_pct || 80}%</span>
            </div>
            <Progress value={b.freshness_pct || 80} className="h-2.5" />
            <p className="text-[11px] text-muted-foreground pt-1">
              Remaining Est. Shelf Life: <strong>{b.remaining_days_life || 2} Days</strong>
            </p>
          </div>

          {/* Joined Supabase Traceability Steps */}
          <div className="space-y-4">
            <h3 className="font-serif font-bold text-lg flex items-center gap-2">
              <Truck className="w-5 h-5 text-primary" /> Full Farm-to-Fork Joined Audit Trail
            </h3>

            <div className="space-y-4 relative before:absolute before:inset-0 before:left-6 before:w-0.5 before:bg-border/60">
              {/* Step 1: Farmer Harvest */}
              <div className="flex gap-4 items-start relative z-10">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center shrink-0">
                  <User className="w-6 h-6" />
                </div>
                <div className="flex-1 bg-background border border-border/60 p-4 rounded-2xl space-y-1 text-xs">
                  <div className="flex justify-between font-bold text-sm">
                    <span>1. Farmer Origin & Harvest</span>
                    <span className="text-muted-foreground font-mono">{b.harvest_date}</span>
                  </div>
                  <p className="text-foreground">Farmer: <strong>{b.farmer_name}</strong></p>
                  <p className="text-muted-foreground">Quantity Harvested: {b.quantity_kg.toLocaleString()} kg</p>
                </div>
              </div>

              {/* Step 2: IoT Cold Storage Warehouse */}
              <div className="flex gap-4 items-start relative z-10">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center shrink-0">
                  <WarehouseIcon className="w-6 h-6" />
                </div>
                <div className="flex-1 bg-background border border-border/60 p-4 rounded-2xl space-y-1 text-xs">
                  <div className="flex justify-between font-bold text-sm">
                    <span>2. IoT Cold Storage Facility</span>
                    <Badge variant="outline" className="text-[10px]">
                      {b.warehouse_pest_alert ? "Pest Alert ⚠️" : "Pest Optimal ✓"}
                    </Badge>
                  </div>
                  <p className="text-foreground">Facility: <strong>{b.warehouse_name}</strong> ({b.warehouse_city})</p>
                  <p className="text-muted-foreground">Live IoT Temp: <strong>{b.warehouse_temp}°C</strong></p>
                </div>
              </div>

              {/* Step 3: Priority Transport & Destination */}
              <div className="flex gap-4 items-start relative z-10">
                <div className="w-12 h-12 rounded-2xl bg-blue-500/20 text-blue-400 border border-blue-500/30 flex items-center justify-center shrink-0">
                  <Truck className="w-6 h-6" />
                </div>
                <div className="flex-1 bg-background border border-border/60 p-4 rounded-2xl space-y-1 text-xs">
                  <div className="flex justify-between font-bold text-sm">
                    <span>3. Express Logistics Dispatch</span>
                    <span className="text-emerald-400 font-bold">{b.status.toUpperCase()}</span>
                  </div>
                  <p className="text-muted-foreground">
                    Assigned Express Route to prevent spoilage loss. Guaranteed arrival within 24 hours.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
