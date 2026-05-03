import { useState } from "react";
import { Link } from "wouter";
import { useListProducts } from "@workspace/api-client-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, ShoppingBag, Star } from "lucide-react";

const CATEGORIES = ["All", "Adaptogen", "Anti-inflammatory", "Nootropic", "Detox", "Herbal Tea", "Immunity", "Women Health"];

export default function ProductsPage() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");

  const params: Record<string, string | number> = {};
  if (search) params.search = search;
  if (category !== "All") params.category = category;

  const { data, isLoading } = useListProducts(params, {
    query: { queryKey: ["products", search, category] },
  });
  const products = data?.products ?? [];

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-10 space-y-8">
      <div className="space-y-2">
        <h1 className="text-4xl font-serif font-bold">Marketplace</h1>
        <p className="text-muted-foreground">Ethically sourced, fully traceable Ayurvedic products</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <div className="flex gap-2 flex-wrap">
        {CATEGORIES.map((cat) => (
          <Button
            key={cat}
            variant={category === cat ? "default" : "outline"}
            size="sm"
            onClick={() => setCategory(cat)}
            className="rounded-full"
          >
            {cat}
          </Button>
        ))}
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-48 rounded-xl" />
              <Skeleton className="h-5 w-40 rounded" />
              <Skeleton className="h-4 w-24 rounded" />
            </div>
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">
          <ShoppingBag className="w-12 h-12 mx-auto mb-4 opacity-30" />
          <p className="text-lg">No products found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <Link key={product.id} href={`/products/${product.id}`} className="group block">
              <Card className="overflow-hidden border border-border hover:border-primary/40 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
                <div className="relative h-48 bg-muted overflow-hidden">
                  <div
                    className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
                    style={{ backgroundImage: `url('https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=70')` }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-card/80 to-transparent" />
                  {product.isNew && (
                    <Badge className="absolute top-2 left-2 bg-primary text-primary-foreground text-xs">New</Badge>
                  )}
                </div>
                <CardContent className="p-4 space-y-2">
                  <p className="text-xs text-muted-foreground">{product.category}</p>
                  <h3 className="font-semibold leading-tight line-clamp-2">{product.name}</h3>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Star className="w-3 h-3 fill-primary text-primary" />
                    {product.rating?.toFixed(1)} ({product.reviewCount})
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-primary font-bold text-lg">₹{product.price}</p>
                    <p className="text-xs text-muted-foreground truncate ml-2">{product.sellerName}</p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
