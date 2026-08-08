import { useState } from "react";
import { useLocation } from "wouter";
import { Search, ShoppingBag, Sparkles, Filter, ShieldCheck, Zap, Flame } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DynamicDiscountBanner } from "@/components/discounts/dynamic-discount-banner";
import { VisionSpoilageScanner } from "@/components/spoilage/vision-scanner";
import { MOCK_PRODUCTS } from "@/lib/supabase-api";

export default function ProductsPage() {
  const [, setLocation] = useLocation();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [showScanner, setShowScanner] = useState(false);

  const filteredProducts = MOCK_PRODUCTS.filter((p) => {
    const matchesSearch =
      p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCat =
      selectedCategory === "all" ||
      (selectedCategory === "clearance" && p.is_clearance) ||
      p.category?.toLowerCase() === selectedCategory.toLowerCase();
    return matchesSearch && matchesCat;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      {/* Dynamic Flash Discount Clearance Banner */}
      <DynamicDiscountBanner />

      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold">Fresh Produce & Rescue Marketplace</h1>
          <p className="text-muted-foreground text-sm">
            Direct farm-to-table perishable produce with QR traceability & dynamic spoilage discounts
          </p>
        </div>
        <Button
          onClick={() => setShowScanner(!showScanner)}
          className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2 shadow-md"
        >
          <Sparkles className="w-4 h-4" />
          {showScanner ? "Close Vision Scanner" : "AI Vision Freshness Scanner"}
        </Button>
      </div>

      {/* Computer Vision Scanner Drawer */}
      {showScanner && <VisionSpoilageScanner />}

      {/* Filters & Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-3 text-muted-foreground" />
          <Input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search tomatoes, onions, apples, or batch number..."
            className="pl-9 bg-card"
          />
        </div>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant={selectedCategory === "all" ? "default" : "outline"}
            onClick={() => setSelectedCategory("all")}
            className="text-xs"
          >
            All Products
          </Button>
          <Button
            size="sm"
            variant={selectedCategory === "clearance" ? "default" : "outline"}
            onClick={() => setSelectedCategory("clearance")}
            className="text-xs gap-1 border-amber-500/40 text-amber-400"
          >
            <Flame className="w-3.5 h-3.5" /> Rescue Deals
          </Button>
        </div>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProducts.map((product) => (
          <Card
            key={product.id}
            onClick={() => setLocation(`/products/${product.id}`)}
            className="group cursor-pointer border border-border/60 hover:border-primary/50 transition-all overflow-hidden bg-card hover:shadow-xl flex flex-col"
          >
            <div className="relative h-48 overflow-hidden bg-muted">
              <img
                src={product.image_url}
                alt={product.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              {product.is_clearance && (
                <Badge className="absolute top-3 left-3 bg-red-600 text-white font-bold px-2.5 py-1">
                  CLEARANCE {Math.round(((product.price - (product.discount_price || product.price)) / product.price) * 100)}% OFF
                </Badge>
              )}
              <Badge className="absolute top-3 right-3 bg-card/90 backdrop-blur-md text-emerald-400 border border-emerald-500/30 text-xs">
                Freshness {product.freshness_score}%
              </Badge>
            </div>

            <CardContent className="p-5 flex-1 flex flex-col justify-between space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span className="font-mono">{product.batch_number}</span>
                  <span className="flex items-center gap-1 text-emerald-400">
                    <ShieldCheck className="w-3.5 h-3.5" /> QR Verified
                  </span>
                </div>
                <h3 className="font-bold text-lg group-hover:text-primary transition-colors">
                  {product.title}
                </h3>
                <p className="text-xs text-muted-foreground line-clamp-2">
                  {product.description}
                </p>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-border/40">
                <div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-xl font-bold text-emerald-400">
                      ₹{product.discount_price || product.price}
                    </span>
                    {product.discount_price && (
                      <span className="text-xs line-through text-muted-foreground">
                        ₹{product.price}
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] text-muted-foreground">Stock: {(product as any).stock_quantity ?? product.stock_qty ?? 100} available</span>
                </div>
                <Button size="sm" className="gap-1.5 text-xs">
                  <ShoppingBag className="w-3.5 h-3.5" /> Buy Now
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
