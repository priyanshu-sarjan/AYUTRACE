import { useState } from "react";
import { useRoute, useLocation } from "wouter";
import {
  ShieldCheck,
  MapPin,
  Calendar,
  Thermometer,
  QrCode,
  Truck,
  ArrowLeft,
  ShoppingBag,
  Zap,
  Award,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { MOCK_PRODUCTS } from "@/lib/supabase-api";

export default function ProductDetail() {
  const [, params] = useRoute("/products/:id");
  const [, setLocation] = useLocation();
  const [showQRModal, setShowQRModal] = useState(false);

  const product = MOCK_PRODUCTS.find((p) => p.id === params?.id) || MOCK_PRODUCTS[0];

  const traceTimeline = [
    {
      stage: "1. Farm Harvest",
      location: "Nashik Organic Farm #12, Maharashtra",
      date: "Aug 06, 2026",
      status: "Verified Grade A Harvest",
      icon: "🌾",
    },
    {
      stage: "2. Cold Storage Hub",
      location: "Nashik Cold Storage Hub #1 (Temp: 3.8°C)",
      date: "Aug 06, 2026",
      status: "IoT Sensor Verified (Humidity 88.5%)",
      icon: "🏬",
    },
    {
      stage: "3. Priority Transport",
      location: "Priority 1 Refrigerated Express Transit",
      date: "Aug 07, 2026",
      status: "In-Transit to Distribution Hub",
      icon: "🚛",
    },
    {
      stage: "4. Consumer Retail",
      location: "AyuTrace Fresh Delivery Hub",
      date: "Expected Today",
      status: "Ready for Delivery",
      icon: "🛒",
    },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      {/* Back Button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setLocation("/products")}
        className="gap-2 text-xs text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Marketplace
      </Button>

      {/* Main Details Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Product Image & QR Code (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="relative rounded-2xl overflow-hidden border border-border/60 bg-muted aspect-square shadow-lg">
            <img
              src={product.image_url}
              alt={product.title}
              className="w-full h-full object-cover"
            />
            <Badge className="absolute top-4 left-4 bg-emerald-600 text-white font-bold px-3 py-1 text-xs">
              <ShieldCheck className="w-3.5 h-3.5 mr-1" /> QR Traceability Verified
            </Badge>
          </div>

          <Card
            onClick={() => setShowQRModal(!showQRModal)}
            className="border-dashed border-2 border-primary/40 bg-primary/5 hover:bg-primary/10 transition-all cursor-pointer p-4 text-center"
          >
            <div className="flex items-center justify-center gap-3">
              <QrCode className="w-8 h-8 text-primary" />
              <div className="text-left">
                <h4 className="font-bold text-sm">Scan QR Code for Live Audit Trail</h4>
                <p className="text-xs text-muted-foreground">Batch: {product.batch_number}</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Right Column: Information & Traceability Timeline (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="space-y-2 border-b border-border/40 pb-5">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs bg-emerald-500/10 text-emerald-400 border-emerald-500/30">
                {product.category}
              </Badge>
              <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30 text-xs">
                <Zap className="w-3 h-3 mr-1" /> Priority 1 Express
              </Badge>
            </div>
            <h1 className="text-3xl font-serif font-bold">{product.title}</h1>
            <p className="text-muted-foreground text-sm leading-relaxed">{product.description}</p>
          </div>

          {/* Pricing & Order Action */}
          <div className="flex items-center justify-between bg-card border border-border/60 p-4 rounded-2xl">
            <div>
              <span className="text-xs text-muted-foreground block">Guaranteed Price</span>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-emerald-400">
                  ₹{product.discount_price || product.price}
                </span>
                {product.discount_price && (
                  <span className="text-sm line-through text-muted-foreground">₹{product.price}</span>
                )}
              </div>
            </div>
            <Button size="lg" className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2 font-bold">
              <ShoppingBag className="w-5 h-5" /> Buy Fresh Batch
            </Button>
          </div>

          {/* Freshness Health Metric */}
          <div className="space-y-2 bg-muted/30 border border-border/50 p-4 rounded-2xl">
            <div className="flex justify-between text-xs font-medium">
              <span>Computer Vision Freshness Score</span>
              <span className="font-bold text-emerald-400">{product.freshness_score}%</span>
            </div>
            <Progress value={product.freshness_score} className="h-2.5" />
          </div>

          {/* Farm-to-Table Supply Chain Traceability Timeline */}
          <div className="space-y-4">
            <h3 className="font-serif font-bold text-lg flex items-center gap-2">
              <Truck className="w-5 h-5 text-primary" /> Farm-to-Table Live Traceability Journey
            </h3>
            <div className="space-y-3">
              {traceTimeline.map((step, idx) => (
                <div
                  key={idx}
                  className="flex gap-3 bg-background border border-border/60 p-3.5 rounded-xl items-start"
                >
                  <span className="text-xl p-2 rounded-lg bg-muted shrink-0">{step.icon}</span>
                  <div className="flex-1 text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-sm text-foreground">{step.stage}</h4>
                      <span className="text-[11px] text-muted-foreground">{step.date}</span>
                    </div>
                    <p className="text-muted-foreground">{step.location}</p>
                    <span className="inline-block text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                      ✓ {step.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
