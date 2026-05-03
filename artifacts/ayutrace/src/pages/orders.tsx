import { useState } from "react";
import { useLocation } from "wouter";
import { useListOrders, useTrackOrder, getTrackOrderQueryKey } from "@workspace/api-client-react";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ShoppingBag, QrCode, CheckCircle, Circle, Truck, Building2, Store, User, TreePine } from "lucide-react";

const STATUS_COLORS: Record<string, string> = {
  pending: "secondary", processing: "outline", shipped: "outline", delivered: "default",
};

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

function OrderTracker({ orderId }: { orderId: number }) {
  const { data: journey, isLoading } = useTrackOrder(orderId, {
    query: { queryKey: getTrackOrderQueryKey(orderId) },
  });

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1.5">
          <QrCode className="w-3.5 h-3.5" /> Track
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="font-serif">Order Tracking</DialogTitle>
        </DialogHeader>
        {isLoading ? (
          <div className="space-y-3">{Array.from({length:4}).map((_,i)=><Skeleton key={i} className="h-14"/>)}</div>
        ) : journey ? (
          <div>
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-muted-foreground">{journey.herbName}</p>
              <Badge className="capitalize">{journey.currentStage}</Badge>
            </div>
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
          </div>
        ) : (
          <p className="text-muted-foreground text-sm">Tracking info unavailable.</p>
        )}
      </DialogContent>
    </Dialog>
  );
}

export default function OrdersPage() {
  const { isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const { data, isLoading } = useListOrders({ query: { enabled: isAuthenticated } });
  const orders = data?.orders ?? [];

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <p className="text-muted-foreground">Please sign in to view your orders.</p>
        <Button onClick={() => setLocation("/login")}>Sign In</Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 md:px-8 py-10 space-y-8">
      <div>
        <h1 className="text-4xl font-serif font-bold">My Orders</h1>
        <p className="text-muted-foreground">Track your purchases and their supply chain journey</p>
      </div>

      {isLoading ? (
        <div className="space-y-4">{Array.from({length:4}).map((_,i)=><Skeleton key={i} className="h-24 rounded-xl"/>)}</div>
      ) : orders.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">
          <ShoppingBag className="w-12 h-12 mx-auto mb-4 opacity-30" />
          <p className="text-lg">No orders yet</p>
          <Button className="mt-4" onClick={() => setLocation("/products")}>Browse Marketplace</Button>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <Card key={order.id} className="border border-border">
              <CardContent className="p-5 flex flex-col sm:flex-row gap-4 sm:items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-lg bg-muted overflow-hidden shrink-0">
                    <div className="w-full h-full bg-cover bg-center" style={{ backgroundImage: `url('https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=200&q=70')` }} />
                  </div>
                  <div>
                    <p className="font-semibold">{order.productName}</p>
                    <p className="text-sm text-muted-foreground">Qty: {order.quantity}</p>
                    <p className="text-xs text-muted-foreground">{new Date(order.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}</p>
                    {order.batchId && <p className="text-xs text-muted-foreground font-mono">{order.batchId}</p>}
                  </div>
                </div>
                <div className="flex flex-col sm:items-end gap-2">
                  <p className="text-primary font-bold text-lg">₹{order.totalPrice.toLocaleString("en-IN")}</p>
                  <Badge variant={(STATUS_COLORS[order.status] ?? "outline") as any} className="capitalize w-fit">{order.status}</Badge>
                  <OrderTracker orderId={order.id} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
