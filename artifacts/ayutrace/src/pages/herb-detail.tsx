import { useRoute, useLocation } from "wouter";
import { useGetHerb, useGetSupplyChainJourney } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ArrowLeft, MapPin, Leaf, QrCode, CheckCircle, Circle, Truck, Building2, Store, User, TreePine } from "lucide-react";

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

function SupplyChainModal({ batchId }: { batchId: string }) {
  const { data, isLoading } = useGetSupplyChainJourney(batchId, {
    query: { enabled: !!batchId, queryKey: ["supply-chain", batchId] },
  });
  const steps = data?.steps ?? [];
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <QrCode className="w-4 h-4" /> Trace Batch Journey
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="font-serif">Supply Chain Journey</DialogTitle>
          <p className="text-xs text-muted-foreground font-mono">{batchId}</p>
        </DialogHeader>
        {isLoading ? (
          <div className="space-y-3">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-14 rounded-lg" />)}</div>
        ) : (
          <div className="space-y-0">
            {steps.map((step, i) => (
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
                  {i < steps.length - 1 && <div className="w-px flex-1 bg-border my-1" />}
                </div>
                <div className="pb-4">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-sm capitalize">{step.stage}</p>
                    {step.verified && <CheckCircle className="w-3.5 h-3.5 text-green-500" />}
                  </div>
                  <p className="text-xs text-muted-foreground">{step.location}</p>
                  {step.notes && <p className="text-xs text-muted-foreground/70 italic mt-0.5">{step.notes}</p>}
                  <p className="text-xs text-primary/80 mt-0.5">
                    {new Date(step.timestamp).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

export default function HerbDetail() {
  const [, params] = useRoute("/herbs/:id");
  const [, setLocation] = useLocation();
  const herbId = Number(params?.id);
  const { data: herb, isLoading } = useGetHerb(herbId, {
    query: { enabled: !!herbId, queryKey: ["herb", herbId] },
  });

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto px-4 md:px-8 py-10 space-y-6">
        <Skeleton className="h-8 w-48 rounded" />
        <Skeleton className="h-64 rounded-2xl" />
        <div className="grid grid-cols-2 gap-4">
          <Skeleton className="h-32 rounded-xl" />
          <Skeleton className="h-32 rounded-xl" />
        </div>
      </div>
    );
  }

  if (!herb) return <div className="p-8 text-center text-muted-foreground">Herb not found.</div>;

  return (
    <div className="max-w-5xl mx-auto px-4 md:px-8 py-10 space-y-8">
      <Button variant="ghost" className="gap-2 -ml-2" onClick={() => setLocation("/herbs")}>
        <ArrowLeft className="w-4 h-4" /> Back to Herbs
      </Button>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="relative rounded-2xl overflow-hidden h-72 bg-muted">
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url('https://images.unsplash.com/photo-1600298882525-9c9ba0a7db68?w=700&q=80')` }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background/60 to-transparent" />
        </div>

        <div className="space-y-4">
          <div>
            <h1 className="text-4xl font-serif font-bold">{herb.name}</h1>
            <p className="text-muted-foreground italic text-lg">{herb.botanicalName}</p>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="w-4 h-4 text-primary" /> {herb.region}
          </div>
          {herb.uses && <p className="text-sm text-muted-foreground leading-relaxed">{herb.uses}</p>}
          <div className="flex flex-wrap gap-2">
            {(herb.benefits ?? []).map((b) => (
              <Badge key={b} variant="secondary">{b}</Badge>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-3 mt-4">
            {herb.harvestSeason && (
              <div className="bg-muted/50 rounded-lg p-3">
                <p className="text-xs text-muted-foreground">Harvest Season</p>
                <p className="font-semibold text-sm">{herb.harvestSeason}</p>
              </div>
            )}
            {herb.pricePerKg && (
              <div className="bg-muted/50 rounded-lg p-3">
                <p className="text-xs text-muted-foreground">Market Price</p>
                <p className="font-semibold text-sm text-primary">₹{herb.pricePerKg}/kg</p>
              </div>
            )}
            {herb.currentStock != null && (
              <div className="bg-muted/50 rounded-lg p-3">
                <p className="text-xs text-muted-foreground">Current Stock</p>
                <p className="font-semibold text-sm">{herb.currentStock.toLocaleString()} kg</p>
              </div>
            )}
            {herb.trendScore != null && (
              <div className="bg-muted/50 rounded-lg p-3">
                <p className="text-xs text-muted-foreground">Trend Score</p>
                <p className="font-semibold text-sm text-primary">#{herb.trendScore}</p>
              </div>
            )}
          </div>
          <div className="flex gap-3 pt-2">
            <SupplyChainModal batchId={`BATCH-${herb.name.slice(0, 3).toUpperCase()}-2024-001`} />
            <Button onClick={() => setLocation("/products")}>View Products</Button>
          </div>
        </div>
      </div>

      {(herb as any).sellers && (herb as any).sellers.length > 0 && (
        <div>
          <h2 className="text-xl font-serif font-bold mb-4">Available From</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {(herb as any).sellers.map((seller: any) => (
              <Card key={seller.id} className="border border-border">
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                    <Leaf className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm">{seller.name}</p>
                    <p className="text-xs text-muted-foreground capitalize">{seller.role}</p>
                    {seller.region && <p className="text-xs text-muted-foreground">{seller.region}</p>}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
