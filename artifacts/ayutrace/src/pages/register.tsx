import { useState } from "react";
import { useLocation } from "wouter";
import { useRegister } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { Leaf, Sprout, ShoppingBag, Building2 } from "lucide-react";

const ROLES = [
  { value: "farmer", label: "Farmer", icon: <Sprout className="w-5 h-5" /> },
  { value: "consumer", label: "Consumer", icon: <ShoppingBag className="w-5 h-5" /> },
  { value: "seller", label: "Seller / Company", icon: <Building2 className="w-5 h-5" /> },
] as const;

type Role = "farmer" | "consumer" | "seller";

export default function RegisterPage() {
  const [, setLocation] = useLocation();
  const { setAuth } = useAuth();
  const { toast } = useToast();
  const [role, setRole] = useState<Role>("consumer");
  const [form, setForm] = useState({ name: "", email: "", password: "", region: "" });

  const { mutate: register, isPending } = useRegister({
    mutation: {
      onSuccess: (data) => {
        setAuth(data.token, data.user);
        toast({ title: `Welcome, ${data.user.name}!`, description: "Your account has been created." });
        setLocation("/dashboard");
      },
      onError: (err: any) => toast({ title: "Registration failed", description: err?.data?.error ?? "Please try again.", variant: "destructive" }),
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    register({ data: { ...form, role } });
  };

  const update = (key: string, val: string) => setForm((f) => ({ ...f, [key]: val }));

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center mx-auto">
            <Leaf className="w-6 h-6 text-primary" />
          </div>
          <h1 className="text-3xl font-serif font-bold">Create Account</h1>
          <p className="text-muted-foreground">Join the AyuTraceChain ecosystem</p>
        </div>

        <div>
          <p className="text-sm font-medium mb-3 text-center text-muted-foreground">I am joining as a...</p>
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
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" placeholder="Your name" value={form.name} onChange={(e) => update("name", e.target.value)} required />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="you@example.com" value={form.email} onChange={(e) => update("email", e.target.value)} required />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" placeholder="Minimum 6 characters" value={form.password} onChange={(e) => update("password", e.target.value)} required />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="region">Region (optional)</Label>
                <Input id="region" placeholder="e.g. Rajasthan, Maharashtra" value={form.region} onChange={(e) => update("region", e.target.value)} />
              </div>
              <Button type="submit" className="w-full" disabled={isPending}>
                {isPending ? "Creating account..." : "Create Account"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <p className="text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <button onClick={() => setLocation("/login")} className="text-primary hover:underline font-medium">Sign in</button>
        </p>
      </div>
    </div>
  );
}
