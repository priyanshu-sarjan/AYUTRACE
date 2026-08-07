import { Flame, Timer, ShoppingCart, ArrowRight, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useLocation } from "wouter";

export function DynamicDiscountBanner() {
  const [, setLocation] = useLocation();

  const clearanceItems = [
    {
      id: "prod-mango-gwl",
      title: "Gwalior Sweet Dasheri Mangoes 🥭 (4 kg Box)",
      originalPrice: 350,
      discountPrice: 160,
      discountPct: 54,
      timeLeft: "14 Hours Remaining",
      reason: "High Spoilage Risk - Spoilage Date Approaching! Priority 1 Transport",
      image: "https://images.unsplash.com/photo-1553279768-865429fa0078?w=500&q=80",
    },
    {
      id: "prod-1",
      title: "Fresh Nashik Tomatoes 🍅 (5 kg Pack)",
      originalPrice: 180,
      discountPrice: 90,
      discountPct: 50,
      timeLeft: "18 Hours Remaining",
      reason: "Perishable Batch - 3 Days Life Post-Harvest",
      image: "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=500&q=80",
    },
  ];

  return (
    <Card className="border-2 border-amber-500/40 bg-gradient-to-r from-amber-950/40 via-card to-background overflow-hidden shadow-lg">
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-amber-500/20 pb-4 mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <Flame className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-serif font-bold text-amber-300">
                  Zero Food Waste: Dynamic Clearance Flash Sales
                </h3>
                <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/40 text-xs">
                  50%+ OFF
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                Automated dynamic price drops on Gwalior Mangoes & Nashik Tomatoes nearing spoilage
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setLocation("/products")}
            className="border-amber-500/40 text-amber-400 hover:bg-amber-500/10 gap-1.5 text-xs"
          >
            Explore All Rescue Deals <ArrowRight className="w-3.5 h-3.5" />
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {clearanceItems.map((item) => (
            <div
              key={item.id}
              className="flex items-center gap-4 bg-background/80 border border-amber-500/20 rounded-2xl p-3.5 hover:border-amber-500/40 transition-all"
            >
              <img
                src={item.image}
                alt={item.title}
                className="w-20 h-20 rounded-xl object-cover shrink-0 border border-border/40"
              />
              <div className="flex-1 space-y-1.5 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-amber-400 flex items-center gap-1">
                    <Timer className="w-3.5 h-3.5" /> {item.timeLeft}
                  </span>
                  <Badge className="bg-red-500/20 text-red-400 border-red-500/30 text-[10px]">
                    {item.discountPct}% OFF
                  </Badge>
                </div>
                <h4 className="font-bold text-sm truncate">{item.title}</h4>
                <p className="text-[11px] text-muted-foreground truncate">{item.reason}</p>
                <div className="flex items-center justify-between pt-1">
                  <div className="flex items-baseline gap-2">
                    <span className="text-base font-bold text-emerald-400">₹{item.discountPrice}</span>
                    <span className="text-xs line-through text-muted-foreground">₹{item.originalPrice}</span>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => setLocation(`/products/${item.id}`)}
                    className="h-7 px-3 text-xs bg-amber-600 hover:bg-amber-700 text-white gap-1"
                  >
                    <ShoppingCart className="w-3 h-3" /> Buy Now
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
