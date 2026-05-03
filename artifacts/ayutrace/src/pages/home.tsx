import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useGetTrendingHerbs,
  useGetProductAnnouncements,
  useListCommunityPosts,
} from "@workspace/api-client-react";
import { ArrowRight, Leaf, MapPin, ShieldCheck, Zap, ChevronLeft, ChevronRight } from "lucide-react";
import { useRef, useState } from "react";

function HeroSection() {
  const [, setLocation] = useLocation();
  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1591167525664-84a57716c8c0?w=1600&q=80')",
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-background/90 via-background/60 to-background" />
      <div className="relative z-10 text-center max-w-4xl mx-auto px-4 space-y-8">
        <Badge className="text-xs font-semibold px-4 py-1.5 rounded-full bg-primary/20 text-primary border border-primary/30">
          Soil to Shelf Traceability
        </Badge>
        <h1 className="text-5xl md:text-7xl font-serif font-bold tracking-tight leading-tight">
          The Future of{" "}
          <span className="text-primary">Ayurvedic</span>{" "}
          Supply Chain
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          Trace every herb from farm to your hands. AyuTraceChain brings radical
          transparency to India's ancient botanical ecosystem — verified,
          immutable, and beautifully accessible.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button size="lg" className="gap-2 text-base font-semibold px-8" onClick={() => setLocation("/map")}>
            <MapPin className="w-5 h-5" /> Explore the Map
          </Button>
          <Button size="lg" variant="outline" className="gap-2 text-base px-8" onClick={() => setLocation("/herbs")}>
            Browse Herbs <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
        <div className="flex items-center justify-center gap-8 pt-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-primary" /> Verified Supply Chains</div>
          <div className="flex items-center gap-2"><Leaf className="w-4 h-4 text-primary" /> 100+ Herb Varieties</div>
          <div className="flex items-center gap-2"><Zap className="w-4 h-4 text-primary" /> Real-time Tracking</div>
        </div>
      </div>
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
    </section>
  );
}

function HorizontalScroll({ children, title, viewAllHref }: { children: React.ReactNode; title: string; viewAllHref: string }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const scroll = (dir: number) => {
    if (scrollRef.current) scrollRef.current.scrollBy({ left: dir * 300, behavior: "smooth" });
  };
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between px-4 md:px-8">
        <h2 className="text-2xl font-serif font-bold">{title}</h2>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => scroll(-1)} className="rounded-full"><ChevronLeft className="w-5 h-5" /></Button>
          <Button variant="ghost" size="icon" onClick={() => scroll(1)} className="rounded-full"><ChevronRight className="w-5 h-5" /></Button>
          <Link href={viewAllHref} className="text-sm text-primary hover:underline ml-2">View all</Link>
        </div>
      </div>
      <div ref={scrollRef} className="flex gap-4 overflow-x-auto pb-4 px-4 md:px-8 scrollbar-hide snap-x snap-mandatory" style={{ scrollbarWidth: "none" }}>
        {children}
      </div>
    </div>
  );
}

function TrendingHerbs() {
  const { data, isLoading } = useGetTrendingHerbs();
  const herbs = data?.herbs ?? [];
  return (
    <HorizontalScroll title="Trending Herbs" viewAllHref="/herbs">
      {isLoading
        ? Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="snap-start shrink-0 w-52">
              <Skeleton className="h-52 w-52 rounded-xl" />
              <Skeleton className="h-4 w-32 mt-2 rounded" />
            </div>
          ))
        : herbs.map((herb) => (
            <Link key={herb.id} href={`/herbs/${herb.id}`} className="snap-start shrink-0 w-52 group cursor-pointer">
              <div className="relative h-52 rounded-xl overflow-hidden border border-border">
                <div
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
                  style={{ backgroundImage: `url('https://images.unsplash.com/photo-1600298882525-9c9ba0a7db68?w=400&q=70')` }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-transparent to-transparent" />
                <div className="absolute bottom-3 left-3 right-3">
                  <p className="text-xs text-primary font-semibold">{herb.region}</p>
                  <p className="text-sm font-semibold text-foreground truncate">{herb.name}</p>
                  <p className="text-xs text-muted-foreground italic truncate">{herb.botanicalName}</p>
                </div>
                <div className="absolute top-2 right-2 bg-primary/90 text-primary-foreground text-xs font-bold px-2 py-0.5 rounded-full">
                  #{herb.trendScore}
                </div>
              </div>
            </Link>
          ))}
    </HorizontalScroll>
  );
}

function ProductAnnouncements() {
  const { data, isLoading } = useGetProductAnnouncements();
  const products = data?.products ?? [];
  return (
    <HorizontalScroll title="Latest Product Announcements" viewAllHref="/products">
      {isLoading
        ? Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="snap-start shrink-0 w-64">
              <Skeleton className="h-40 w-64 rounded-xl" />
              <Skeleton className="h-4 w-48 mt-2 rounded" />
            </div>
          ))
        : products.map((product) => (
            <Link key={product.id} href={`/products/${product.id}`} className="snap-start shrink-0 w-64 group">
              <Card className="border border-border hover:border-primary/40 transition-colors overflow-hidden">
                <div className="relative h-40 bg-muted">
                  <div
                    className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
                    style={{ backgroundImage: `url('https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=70')` }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-card/80 to-transparent" />
                  {product.isNew && (
                    <Badge className="absolute top-2 left-2 bg-primary text-primary-foreground text-xs">New</Badge>
                  )}
                </div>
                <CardContent className="p-3">
                  <p className="font-semibold text-sm truncate">{product.name}</p>
                  <div className="flex items-center justify-between mt-1">
                    <p className="text-primary font-bold">₹{product.price}</p>
                    <p className="text-xs text-muted-foreground">{product.sellerName}</p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
    </HorizontalScroll>
  );
}

function CommunityPreviews() {
  const { data, isLoading } = useListCommunityPosts({ limit: 6 });
  const posts = data?.posts ?? [];
  return (
    <HorizontalScroll title="Community Highlights" viewAllHref="/community">
      {isLoading
        ? Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="snap-start shrink-0 w-72">
              <Skeleton className="h-36 w-72 rounded-xl" />
            </div>
          ))
        : posts.map((post) => (
            <Link key={post.id} href="/community" className="snap-start shrink-0 w-72 group">
              <Card className="border border-border hover:border-primary/30 transition-colors h-40 flex flex-col">
                <CardContent className="p-4 flex-1 flex flex-col justify-between">
                  <div>
                    <Badge variant="outline" className="text-xs mb-2 capitalize">{post.category}</Badge>
                    <p className="font-semibold text-sm line-clamp-2 leading-snug">{post.title}</p>
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <p className="text-xs text-muted-foreground">{post.authorName}</p>
                    <p className="text-xs text-muted-foreground">{post.likes} likes</p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
    </HorizontalScroll>
  );
}

function FeatureGrid() {
  const features = [
    { icon: <MapPin className="w-6 h-6 text-primary" />, title: "Geographic Tracing", desc: "See exactly which region of India your herbs come from, down to the district." },
    { icon: <ShieldCheck className="w-6 h-6 text-primary" />, title: "Verified Authenticity", desc: "Every batch is verified at each stage — farm, warehouse, factory, and store." },
    { icon: <Zap className="w-6 h-6 text-primary" />, title: "QR Traceability", desc: "Scan any product's QR code to view its complete, immutable supply chain journey." },
    { icon: <Leaf className="w-6 h-6 text-primary" />, title: "Direct from Farms", desc: "Farmers list herbs directly, cutting middlemen and ensuring fair prices for all." },
  ];
  return (
    <section className="py-20 px-4 md:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-serif font-bold mb-4">Why AyuTraceChain?</h2>
          <p className="text-muted-foreground max-w-xl mx-auto">We are rebuilding trust in the Ayurvedic supply chain, one verified batch at a time.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((f) => (
            <Card key={f.title} className="border border-border bg-card hover:border-primary/30 transition-colors">
              <CardContent className="p-6 space-y-3">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">{f.icon}</div>
                <h3 className="font-serif font-semibold text-lg">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

export default function Home() {
  return (
    <div className="space-y-16 pb-20">
      <HeroSection />
      <TrendingHerbs />
      <ProductAnnouncements />
      <CommunityPreviews />
      <FeatureGrid />
    </div>
  );
}
