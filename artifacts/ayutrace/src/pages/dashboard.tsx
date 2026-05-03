import { useLocation, Link } from "wouter";
import { useGetFarmerDashboard, useGetConsumerDashboard, useGetSellerDashboard } from "@workspace/api-client-react";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Leaf, ShoppingBag, TrendingUp, Package, IndianRupee, BarChart3, Star, ArrowRight } from "lucide-react";

function StatCard({ title, value, icon, color = "text-primary" }: { title: string; value: string | number; icon: React.ReactNode; color?: string }) {
  return (
    <Card className="border border-border">
      <CardContent className="p-5 flex items-center gap-4">
        <div className={`w-10 h-10 rounded-xl bg-muted flex items-center justify-center ${color}`}>{icon}</div>
        <div>
          <p className="text-sm text-muted-foreground">{title}</p>
          <p className="text-2xl font-bold font-serif">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function FarmerDash() {
  const { data, isLoading } = useGetFarmerDashboard();
  if (isLoading) return <div className="grid grid-cols-2 md:grid-cols-4 gap-4">{Array.from({length:4}).map((_,i)=><Skeleton key={i} className="h-24 rounded-xl"/>)}</div>;
  if (!data) return null;
  return (
    <div className="space-y-8">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard title="Total Herbs" value={data.totalHerbs} icon={<Leaf className="w-5 h-5"/>}/>
        <StatCard title="Revenue" value={`₹${(data.totalRevenue ?? 0).toLocaleString("en-IN")}`} icon={<IndianRupee className="w-5 h-5"/>}/>
        <StatCard title="Active Orders" value={data.activeOrders} icon={<Package className="w-5 h-5"/>}/>
        <StatCard title="Pending Shipments" value={data.pendingShipments} icon={<TrendingUp className="w-5 h-5"/>}/>
      </div>
      {data.topHerbs && data.topHerbs.length > 0 && (
        <div>
          <h2 className="text-xl font-serif font-bold mb-4">Your Herbs</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {data.topHerbs.map((herb) => (
              <Link key={herb.id} href={`/herbs/${herb.id}`}>
                <Card className="border border-border hover:border-primary/30 cursor-pointer transition-colors">
                  <CardContent className="p-4 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                      <Leaf className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm truncate">{herb.name}</p>
                      <p className="text-xs text-muted-foreground">{herb.region}</p>
                      <p className="text-xs text-primary font-medium">{herb.currentStock?.toLocaleString()} kg in stock</p>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      )}
      {data.recentOrders && data.recentOrders.length > 0 && (
        <div>
          <h2 className="text-xl font-serif font-bold mb-4">Recent Orders</h2>
          <div className="space-y-3">
            {data.recentOrders.map((order) => (
              <Card key={order.id} className="border border-border">
                <CardContent className="p-4 flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-sm">{order.productName}</p>
                    <p className="text-xs text-muted-foreground">Qty: {order.quantity} · ₹{order.totalPrice.toLocaleString()}</p>
                  </div>
                  <Badge variant={order.status === "delivered" ? "default" : "secondary"} className="capitalize">{order.status}</Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function ConsumerDash() {
  const { data, isLoading } = useGetConsumerDashboard();
  if (isLoading) return <div className="grid grid-cols-2 md:grid-cols-3 gap-4">{Array.from({length:3}).map((_,i)=><Skeleton key={i} className="h-24 rounded-xl"/>)}</div>;
  if (!data) return null;
  return (
    <div className="space-y-8">
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <StatCard title="Total Orders" value={data.totalOrders} icon={<ShoppingBag className="w-5 h-5"/>}/>
        <StatCard title="Active Orders" value={data.activeOrders} icon={<Package className="w-5 h-5"/>}/>
        <StatCard title="Total Spent" value={`₹${(data.totalSpent ?? 0).toLocaleString("en-IN")}`} icon={<IndianRupee className="w-5 h-5"/>}/>
      </div>
      {data.recentOrders && data.recentOrders.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-serif font-bold">Recent Orders</h2>
            <Link href="/orders" className="text-sm text-primary hover:underline flex items-center gap-1">View all <ArrowRight className="w-3 h-3"/></Link>
          </div>
          <div className="space-y-3">
            {data.recentOrders.map((order) => (
              <Card key={order.id} className="border border-border">
                <CardContent className="p-4 flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-sm">{order.productName}</p>
                    <p className="text-xs text-muted-foreground">{new Date(order.createdAt).toLocaleDateString("en-IN")}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-primary font-bold text-sm">₹{order.totalPrice.toLocaleString()}</p>
                    <Badge variant="secondary" className="text-xs capitalize">{order.status}</Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
      {data.recommendedProducts && data.recommendedProducts.length > 0 && (
        <div>
          <h2 className="text-xl font-serif font-bold mb-4">Recommended for You</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {data.recommendedProducts.map((p) => (
              <Link key={p.id} href={`/products/${p.id}`}>
                <Card className="border border-border hover:border-primary/30 cursor-pointer transition-colors">
                  <CardContent className="p-4">
                    <p className="font-semibold text-sm truncate">{p.name}</p>
                    <div className="flex items-center gap-1 mt-1">
                      <Star className="w-3 h-3 fill-primary text-primary"/>
                      <span className="text-xs text-muted-foreground">{p.rating?.toFixed(1)}</span>
                    </div>
                    <p className="text-primary font-bold mt-2">₹{p.price}</p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function SellerDash() {
  const { data, isLoading } = useGetSellerDashboard();
  if (isLoading) return <div className="grid grid-cols-2 md:grid-cols-4 gap-4">{Array.from({length:4}).map((_,i)=><Skeleton key={i} className="h-24 rounded-xl"/>)}</div>;
  if (!data) return null;
  return (
    <div className="space-y-8">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard title="Total Products" value={data.totalProducts} icon={<Package className="w-5 h-5"/>}/>
        <StatCard title="Revenue" value={`₹${(data.totalRevenue ?? 0).toLocaleString("en-IN")}`} icon={<IndianRupee className="w-5 h-5"/>}/>
        <StatCard title="Total Orders" value={data.totalOrders} icon={<ShoppingBag className="w-5 h-5"/>}/>
        <StatCard title="Active Listings" value={data.activeListings} icon={<BarChart3 className="w-5 h-5"/>}/>
      </div>
      {data.topProducts && data.topProducts.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-serif font-bold">Your Top Products</h2>
            <Link href="/products" className="text-sm text-primary hover:underline">View all</Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {data.topProducts.map((p) => (
              <Link key={p.id} href={`/products/${p.id}`}>
                <Card className="border border-border hover:border-primary/30 cursor-pointer transition-colors">
                  <CardContent className="p-4">
                    <p className="font-semibold text-sm truncate">{p.name}</p>
                    <div className="flex items-center gap-1 mt-1">
                      <Star className="w-3 h-3 fill-primary text-primary"/>
                      <span className="text-xs text-muted-foreground">{p.rating?.toFixed(1)} ({p.reviewCount})</span>
                    </div>
                    <p className="text-primary font-bold mt-2">₹{p.price}</p>
                    <p className="text-xs text-muted-foreground">{p.stockQty} in stock</p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function DashboardPage() {
  const { user, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <p className="text-muted-foreground">Please sign in to access your dashboard.</p>
        <Button onClick={() => setLocation("/login")}>Sign In</Button>
      </div>
    );
  }

  const roleLabel = { farmer: "Farmer", consumer: "Consumer", seller: "Seller" }[user?.role ?? "consumer"] ?? "Dashboard";
  const RoleDash = user?.role === "farmer" ? FarmerDash : user?.role === "seller" ? SellerDash : ConsumerDash;

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-10 space-y-8">
      <div>
        <Badge variant="outline" className="mb-2 capitalize">{user?.role}</Badge>
        <h1 className="text-4xl font-serif font-bold">Welcome, {user?.name}</h1>
        <p className="text-muted-foreground">{roleLabel} Dashboard — your complete overview</p>
      </div>
      <RoleDash />
    </div>
  );
}
