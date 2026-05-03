import { useRoute, useLocation } from "wouter";
import { useState } from "react";
import { useGetProduct, useGetSupplyChainJourney, useCreateOrder } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { ArrowLeft, Star, QrCode, CheckCircle, Truck, Building2, Store, User, TreePine, ShoppingCart, Circle } from "lucide-react";

const STAGE_ICONS: Record<string, React.ReactNode> = {
  farm: <TreePine className="w-4 h-4" />,
  warehouse: <Building2 className="w-4 h-4" />,
  factory: <Truck className="w-4 h-4" />,
  store: <Store className="w-4 h-4" />,
  consumer: <User className="w-4 h-4" />,
};
const STAGE_COLORS: Record<string, string> = {
  farm: "#22c55e", warehouse: "#f59e0b", factory: "#3b82f6", store: "#a855f7", consumer: "#ec4899",
};

export default function ProductDetail() {
  const [, params] = useRoute("/products/:id");
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { isAuthenticated } = useAuth();
  const productId = Number(params?.id);

  const { data: product, isLoading } = useGetProduct(productId, {
    query: { enabled: !!productId, queryKey: ["product", productId] },
  });

  const batchId = product?.batchId ?? "";
  const { data: journey } = useGetSupplyChainJourney(batchId, {
    query: { enabled: !!batchId, queryKey: ["supply-chain", batchId] },
  });

  const { mutate: createOrder, isPending } = useCreateOrder({
    mutation: {
      onSuccess: () => {
        toast({ title: "Order placed!", description: "Your order has been placed successfully." });
        setLocation("/orders");
      },
      onError: () => toast({ title: "Order failed", description: "Please sign in to place an order.", variant: "destructive" }),
    },
  });

  const handleBuyNow = () => {
    if (!isAuthenticated) { setLocation("/login"); return; }
    createOrder({ data: { productId, quantity: 1 } });
  };

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto px-4 md:px-8 py-10 space-y-6">
        <Skeleton className="h-8 w-32" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Skeleton className="h-80 rounded-2xl" />
          <div className="space-y-4">
            <Skeleton className="h-8 w-56" />
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-20 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) return <div className="p-8 text-center text-muted-foreground">Product not found.</div>;

  return (
    <div className="max-w-5xl mx-auto px-4 md:px-8 py-10 space-y-8">
      <Button variant="ghost" className="gap-2 -ml-2" onClick={() => setLocation("/products")}>
        <ArrowLeft className="w-4 h-4" /> Back to Marketplace
      </Button>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        <div className="relative rounded-2xl overflow-hidden h-80 bg-muted">
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url('https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=700&q=80')` }}
          />
        </div>

        <div className="space-y-5">
          <div>
            {product.category && <p className="text-xs text-primary font-semibold uppercase tracking-wider mb-1">{product.category}</p>}
            <h1 className="text-3xl font-serif font-bold">{product.name}</h1>
            <p className="text-muted-foreground mt-1">{product.sellerName}</p>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 text-sm">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className={`w-4 h-4 ${i < Math.round(product.rating ?? 0) ? "fill-primary text-primary" : "text-muted-foreground/30"}`} />
              ))}
            </div>
            <span className="text-sm text-muted-foreground">({product.reviewCount} reviews)</span>
          </div>

          {product.description && <p className="text-muted-foreground leading-relaxed">{product.description}</p>}

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-muted/50 rounded-lg p-3">
              <p className="text-xs text-muted-foreground">In Stock</p>
              <p className="font-semibold">{product.stockQty} units</p>
            </div>
            {product.herbName && (
              <div className="bg-muted/50 rounded-lg p-3">
                <p className="text-xs text-muted-foreground">Herb Source</p>
                <p className="font-semibold">{product.herbName}</p>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between pt-2">
            <p className="text-4xl font-bold text-primary">₹{product.price}</p>
            {product.isNew && <Badge className="bg-primary text-primary-foreground">New Arrival</Badge>}
          </div>

          <div className="flex gap-3">
            <Button size="lg" className="flex-1 gap-2" onClick={handleBuyNow} disabled={isPending}>
              <ShoppingCart className="w-5 h-5" />
              {isPending ? "Placing..." : "Buy Now"}
            </Button>
            {batchId && (
              <Dialog>
                <DialogTrigger asChild>
                  <Button size="lg" variant="outline" className="gap-2">
                    <QrCode className="w-5 h-5" /> Trace
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle className="font-serif">Supply Chain Journey</DialogTitle>
                    <p className="text-xs text-muted-foreground font-mono">{batchId}</p>
                  </DialogHeader>
                  {journey ? (
                    <div className="space-y-0">
                      {journey.steps.map((step, i) => (
                        <div key={i} className="flex gap-3">
                          <div className="flex flex-col items-center">
                            <div
                              className="w-9 h-9 rounded-full flex items-center justify-center border-2 shrink-0"
                              style={{ borderColor: STAGE_COLORS[step.stage] ?? "#888", backgroundColor: (STAGE_COLORS[step.stage] ?? "#888") + "22" }}
                            >
                              <span style={{ color: STAGE_COLORS[step.stage] ?? "#888" }}>
                                {STAGE_ICONS[step.stage] ?? <Circle className="w-4 h-4" />}
                              </span>
                            </div>
                            {i < journey.steps.length - 1 && <div className="w-px flex-1 bg-border my-1" />}
                          </div>
                          <div className="pb-4">
                            <div className="flex items-center gap-2">
                              <p className="font-semibold text-sm capitalize">{step.stage}</p>
                              {step.verified && <CheckCircle className="w-3.5 h-3.5 text-green-500" />}
                            </div>
                            <p className="text-xs text-muted-foreground">{step.location}</p>
                            {step.notes && <p className="text-xs text-muted-foreground/70 italic">{step.notes}</p>}
                            <p className="text-xs text-primary/80">
                              {new Date(step.timestamp).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-sm">Loading journey...</p>
                  )}
                </DialogContent>
              </Dialog>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
