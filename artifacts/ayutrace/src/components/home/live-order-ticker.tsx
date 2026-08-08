import { useState, useEffect } from "react";
import { Activity, Flame, ShieldCheck, MapPin, CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface TickerEvent {
  id: string;
  icon: string;
  text: string;
  time: string;
  badgeText: string;
  badgeClass: string;
}

const EVENTS: TickerEvent[] = [
  { id: "1", icon: "🍅", text: "Nashik Farmer Ramesh dispatched 500kg Organic Tomatoes to Chilled Express", time: "Just now", badgeText: "Priority 1 Transit", badgeClass: "bg-emerald-500/20 text-emerald-400 border-emerald-500/40" },
  { id: "2", icon: "🥭", text: "Gwalior Mango Surplus 54% Flash Discount triggered - 180 boxes sold in Mumbai", time: "2m ago", badgeText: "Rescue Flash Sale", badgeClass: "bg-amber-500/20 text-amber-400 border-amber-500/40" },
  { id: "3", icon: "❄️", text: "Bhopal Regional Hub temp auto-adjusted to 3.8°C via IoT Telemetry Sensor", time: "5m ago", badgeText: "IoT Telemetry", badgeClass: "bg-teal-500/20 text-teal-400 border-teal-500/40" },
  { id: "4", icon: "🌿", text: "Wayanad Ashwagandha batch BATCH-HERB-991 certified 98% Grade A", time: "8m ago", badgeText: "Quality Certified", badgeClass: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40" },
];

export function LiveOrderTicker() {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % EVENTS.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  const currentEvent = EVENTS[currentIndex];

  return (
    <div className="w-full bg-card/80 border border-emerald-500/20 rounded-2xl p-3 px-4 backdrop-blur-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-md">
      <div className="flex items-center gap-2.5 min-w-0">
        <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
          <Activity className="w-4 h-4 animate-pulse" />
        </div>
        <div className="flex items-center gap-2 overflow-hidden">
          <span className="text-lg shrink-0">{currentEvent.icon}</span>
          <p className="text-xs font-medium text-foreground truncate transition-all duration-300">
            {currentEvent.text}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
        <Badge className={`text-[10px] ${currentEvent.badgeClass}`}>
          {currentEvent.badgeText}
        </Badge>
        <span className="text-[10px] text-muted-foreground font-mono">{currentEvent.time}</span>
      </div>
    </div>
  );
}
