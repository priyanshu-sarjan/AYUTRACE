import { useState } from "react";
import { Link } from "wouter";
import { useListHerbs } from "@workspace/api-client-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, Leaf, MapPin, TrendingUp } from "lucide-react";

export default function HerbsPage() {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const { data, isLoading } = useListHerbs(
    debouncedSearch ? { search: debouncedSearch } : {},
    { query: { queryKey: ["herbs", debouncedSearch] } }
  );
  const herbs = data?.herbs ?? [];

  const handleSearch = (val: string) => {
    setSearch(val);
    clearTimeout((window as any)._herbSearchTimer);
    (window as any)._herbSearchTimer = setTimeout(() => setDebouncedSearch(val), 400);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-10 space-y-8">
      <div className="space-y-2">
        <h1 className="text-4xl font-serif font-bold">Herb Directory</h1>
        <p className="text-muted-foreground">Discover India's ancient botanical heritage — from Ashwagandha to Giloy</p>
      </div>

      <div className="relative max-w-lg">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search herbs, botanical names..."
          value={search}
          onChange={(e) => handleSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-48 rounded-xl" />
              <Skeleton className="h-4 w-32 rounded" />
              <Skeleton className="h-3 w-24 rounded" />
            </div>
          ))}
        </div>
      ) : herbs.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">
          <Leaf className="w-12 h-12 mx-auto mb-4 opacity-30" />
          <p className="text-lg">No herbs found for "{search}"</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {herbs.map((herb: any) => (
            <Link key={herb.id} href={`/herbs/${herb.id}`} className="group block">
              <Card className="overflow-hidden border border-border hover:border-primary/40 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
                <div className="relative h-48 bg-muted overflow-hidden">
                  <div
                    className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
                    style={{ backgroundImage: `url('https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=400&q=70')` }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-card/80 via-transparent to-transparent" />
                  <div className="absolute top-2 right-2 flex items-center gap-1 bg-primary/90 text-primary-foreground text-xs font-bold px-2 py-0.5 rounded-full">
                    <TrendingUp className="w-3 h-3" /> {herb.trendScore}
                  </div>
                </div>
                <CardContent className="p-4 space-y-2">
                  <h3 className="font-serif font-bold text-lg leading-tight">{herb.name}</h3>
                  <p className="text-xs text-muted-foreground italic">{herb.botanicalName}</p>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <MapPin className="w-3 h-3" /> {herb.region}
                  </div>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {(herb.benefits ?? []).slice(0, 2).map((b: string) => (
                      <Badge key={b} variant="secondary" className="text-xs">{b}</Badge>
                    ))}
                  </div>
                  {herb.pricePerKg && (
                    <p className="text-primary font-bold text-sm">₹{herb.pricePerKg}/kg</p>
                  )}
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
