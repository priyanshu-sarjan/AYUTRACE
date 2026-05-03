import { Link } from "wouter";
import { Leaf } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-border bg-card mt-auto">
      <div className="container py-12 mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Leaf className="w-5 h-5 text-primary" />
              <span className="font-serif font-bold text-lg">AyuTraceChain</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Empowering the Ayurvedic supply chain with transparency, authenticity, and direct access.
            </p>
          </div>
          <div>
            <h3 className="font-semibold mb-4 text-foreground">Explore</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/map" className="hover:text-primary transition-colors">Supply Chain Map</Link></li>
              <li><Link href="/herbs" className="hover:text-primary transition-colors">Herb Directory</Link></li>
              <li><Link href="/products" className="hover:text-primary transition-colors">Marketplace</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-4 text-foreground">Community</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/community" className="hover:text-primary transition-colors">Forums & News</Link></li>
              <li><Link href="/login" className="hover:text-primary transition-colors">Join as Farmer</Link></li>
              <li><Link href="/login" className="hover:text-primary transition-colors">Join as Seller</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-4 text-foreground">Legal</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="#" className="hover:text-primary transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Terms of Service</a></li>
            </ul>
          </div>
        </div>
        <div className="mt-12 pt-8 border-t border-border text-center text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} AyuTraceChain. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
