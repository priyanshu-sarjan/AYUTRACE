import { useAuth } from "@/hooks/use-auth";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/ui/theme-provider";
import { Moon, Sun, Leaf, Map as MapIcon, ShoppingBag, Users, LayoutDashboard, LogOut } from "lucide-react";

export function Navbar() {
  const { user, logout, isAuthenticated } = useAuth();
  const { theme, setTheme } = useTheme();
  const [, setLocation] = useLocation();

  const handleLogout = () => {
    logout();
    setLocation("/");
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur-md">
      <div className="container flex h-16 items-center justify-between mx-auto px-4">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="bg-primary text-primary-foreground p-1.5 rounded-md group-hover:scale-105 transition-transform">
            <Leaf className="w-5 h-5" />
          </div>
          <span className="font-serif font-bold text-xl tracking-tight text-foreground">
            AyuTraceChain
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-6">
          <Link href="/map" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors flex items-center gap-1.5">
            <MapIcon className="w-4 h-4" /> Trace
          </Link>
          <Link href="/herbs" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors flex items-center gap-1.5">
            <Leaf className="w-4 h-4" /> Herbs
          </Link>
          <Link href="/products" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors flex items-center gap-1.5">
            <ShoppingBag className="w-4 h-4" /> Marketplace
          </Link>
          <Link href="/community" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors flex items-center gap-1.5">
            <Users className="w-4 h-4" /> Community
          </Link>
        </nav>

        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="text-muted-foreground hover:text-foreground"
          >
            {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>

          {isAuthenticated ? (
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => setLocation("/dashboard")} className="gap-1.5">
                <LayoutDashboard className="w-4 h-4" /> Dashboard
              </Button>
              <Button variant="ghost" size="icon" onClick={handleLogout} className="text-muted-foreground hover:text-destructive">
                <LogOut className="h-5 w-5" />
              </Button>
            </div>
          ) : (
            <Button size="sm" onClick={() => setLocation("/login")}>
              Sign In
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
