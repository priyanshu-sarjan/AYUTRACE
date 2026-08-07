import { useState } from "react";
import { Bot, Send, User, Sprout, AlertTriangle, ShieldCheck, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Message {
  id: string;
  sender: "bot" | "user";
  text: string;
  category?: "protection" | "planning" | "spoilage" | "market";
  timestamp: string;
}

const PRESET_QUESTIONS = [
  "How to protect Tomato crops from blight in high humidity?",
  "Is there overproduction of Tomatoes in Nashik region?",
  "What is the best storage temperature for Onions to prevent rotting?",
  "Which crop should I sow next season based on market demand?",
];

export function CropAdvisoryBot() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      sender: "bot",
      text: "Namaste Farmer! 🌾 I am your Agri-Fresh AI Crop Advisor. Ask me about crop protection, pest control, regional overproduction warnings, or storage tips to prevent spoilage.",
      category: "planning",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSend = (textToSend?: string) => {
    const query = textToSend || input;
    if (!query.trim()) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      sender: "user",
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInput("");
    setLoading(true);

    // Simulate AI response logic with tailored agricultural intelligence
    setTimeout(() => {
      let botResponse = "";
      let cat: Message["category"] = "protection";

      const lower = query.toLowerCase();
      if (lower.includes("tomato") || lower.includes("blight") || lower.includes("humidity")) {
        botResponse =
          "🛡️ **Tomato Crop Protection Tip**: Early blight thrives above 80% humidity. Apply copper-based fungicide spray every 7–10 days. Maintain row spacing of 60cm to improve air circulation. Also, prioritize harvesting ripe tomatoes immediately as they are Priority 1 express transport items!";
        cat = "protection";
      } else if (lower.includes("overproduction") || lower.includes("nashik") || lower.includes("sow")) {
        botResponse =
          "⚠️ **Regional Market Alert**: Nashik region currently has a 42% overproduction risk for Tomatoes this season. We advise diversifying into **Spinach 🥬** or **Carrots 🥕** for your next sowing cycle to secure 30% higher market margins.";
        cat = "planning";
      } else if (lower.includes("onion") || lower.includes("storage") || lower.includes("rotting")) {
        botResponse =
          "🧅 **Onion Cold Storage Guide**: Keep storage temperature at 0°C to 4°C with 65–70% relative humidity. Ensure proper curing (drying outer skins in shade for 7 days) before storing to prevent neck rot and sprouting.";
        cat = "spoilage";
      } else {
        botResponse =
          "🌱 **Smart Farming Advice**: To reduce spoilage loss, always log your harvest batch on AyuTrace as soon as picked. Our smart dispatching algorithm will assign high-priority transport to perishable goods automatically!";
        cat = "market";
      }

      const botMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: "bot",
        text: botResponse,
        category: cat,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };

      setMessages((prev) => [...prev, botMsg]);
      setLoading(false);
    }, 800);
  };

  return (
    <Card className="border border-emerald-500/30 bg-card/95 shadow-xl">
      <CardHeader className="bg-emerald-950/30 border-b border-emerald-500/20 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
            <Bot className="w-6 h-6" />
          </div>
          <div>
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              Kisan Mitra AI (Crop Protection & Advisory)
              <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/30 text-[10px]">
                Active
              </Badge>
            </CardTitle>
            <CardDescription className="text-xs">
              Real-time advice on crop protection, overproduction warnings & spoilage control
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-4 space-y-4">
        {/* Message Container */}
        <div className="h-[320px] overflow-y-auto space-y-3 pr-2 custom-scrollbar">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex gap-3 ${m.sender === "user" ? "justify-end" : "justify-start"}`}
            >
              {m.sender === "bot" && (
                <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0 mt-1">
                  <Sprout className="w-4 h-4" />
                </div>
              )}
              <div
                className={`max-w-[82%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                  m.sender === "user"
                    ? "bg-primary text-primary-foreground rounded-tr-none"
                    : "bg-muted/80 border border-border/60 text-foreground rounded-tl-none"
                }`}
              >
                <div className="whitespace-pre-line">{m.text}</div>
                <span className="text-[10px] opacity-60 block mt-1 text-right">{m.timestamp}</span>
              </div>
              {m.sender === "user" && (
                <div className="w-8 h-8 rounded-lg bg-primary/20 border border-primary/30 flex items-center justify-center text-primary shrink-0 mt-1">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          ))}
          {loading && (
            <div className="flex gap-2 items-center text-xs text-muted-foreground italic pl-10">
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-emerald-400" />
              Kisan Mitra is analyzing regional crop data...
            </div>
          )}
        </div>

        {/* Quick Question Chips */}
        <div className="space-y-1.5 pt-2 border-t border-border/40">
          <p className="text-[11px] font-medium text-muted-foreground flex items-center gap-1">
            <AlertTriangle className="w-3 h-3 text-amber-400" /> Quick Farmer Queries:
          </p>
          <div className="flex flex-wrap gap-1.5">
            {PRESET_QUESTIONS.map((q, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(q)}
                className="text-xs bg-muted/60 hover:bg-emerald-500/10 hover:border-emerald-500/40 border border-border/60 rounded-full px-3 py-1 transition-all text-left truncate max-w-[280px]"
              >
                {q}
              </button>
            ))}
          </div>
        </div>

        {/* Input Controls */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex gap-2"
        >
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about crop diseases, pest remedies, or overproduction..."
            className="flex-1 bg-background/60"
          />
          <Button type="submit" disabled={loading || !input.trim()} className="bg-emerald-600 hover:bg-emerald-700">
            <Send className="w-4 h-4" />
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
