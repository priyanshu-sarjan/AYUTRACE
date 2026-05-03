import { useState } from "react";
import { useLocation } from "wouter";
import { useLogin } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { Leaf, Sprout, ShoppingBag, Building2 } from "lucide-react";

const ROLES = [
  { value: "farmer", label: "Farmer", icon: <Sprout className="w-5 h-5" />, desc: "List herbs, manage inventory, sell directly" },
  { value: "consumer", label: "Consumer", icon: <ShoppingBag className="w-5 h-5" />, desc: "Browse, purchase, and track your orders" },
  { value: "seller", label: "Seller / Company", icon: <Building2 className="w-5 h-5" />, desc: "List products, manage store inventory" },
] as const;

type Role = "farmer" | "consumer" | "seller";

export default function LoginPage() {
  const [, setLocation] = useLocation();
  const { setAuth } = useAuth();
  const { toast } = useToast();
  const [role, setRole] = useState<Role>("consumer");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const DEMO = {
    farmer: { email: "arjun@farm.in", password: "password" },
    consumer: { email: "priya@consumer.in", password: "password" },
    seller: { email: "admin@vedalife.in", password: "password" },
  };

  const { mutate: login, isPending } = useLogin({
    mutation: {
      onSuccess: (data) => {
        setAuth(data.token, data.user);
        toast({ title: `Welcome back, ${data.user.name}!` });
        setLocation("/dashboard");
      },
      onError: () => toast({ title: "Login failed", description: "Invalid email or password.", variant: "destructive" }),
    },
  });

  const fillDemo = () => {
    setEmail(DEMO[role].email);
    setPassword(DEMO[role].password);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login({ data: { email, password, role } });
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center mx-auto">
            <Leaf className="w-6 h-6 text-primary" />
          </div>
          <h1 className="text-3xl font-serif font-bold">Sign In</h1>
          <p className="text-muted-foreground">Access your AyuTraceChain dashboard</p>
        </div>

        <div>
          <p className="text-sm font-medium mb-3 text-center text-muted-foreground">I am a...</p>
          <div className="grid grid-cols-3 gap-3">
            {ROLES.map((r) => (
              <button
                key={r.value}
                type="button"
                onClick={() => setRole(r.value)}
                className={`flex flex-col items-center gap-2 p-3 rounded-xl border transition-all text-center ${
                  role === r.value
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border hover:border-primary/40 text-muted-foreground"
                }`}
              >
                {r.icon}
                <span className="text-xs font-semibold leading-tight">{r.label}</span>
              </button>
            ))}
          </div>
        </div>

        <Card className="border border-border">
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required />
              </div>
              <Button type="submit" className="w-full" disabled={isPending}>
                {isPending ? "Signing in..." : "Sign In"}
              </Button>
              <Button type="button" variant="outline" className="w-full" onClick={fillDemo}>
                Use Demo Account ({ROLES.find(r => r.value === role)?.label})
              </Button>
            </form>
          </CardContent>
        </Card>

        <p className="text-center text-sm text-muted-foreground">
          Don't have an account?{" "}
          <button onClick={() => setLocation("/register")} className="text-primary hover:underline font-medium">Create one</button>
        </p>
      </div>
    </div>
  );
}
