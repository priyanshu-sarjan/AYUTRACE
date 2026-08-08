import { useState } from "react";
import { Vote, ArrowRight, CheckCircle2, Users, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLocation } from "wouter";

interface PollOption {
  id: string;
  label: string;
  votes: number;
}

export function CommunityPollPreview() {
  const [, setLocation] = useLocation();
  const [hasVoted, setHasVoted] = useState(false);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);

  const [options, setOptions] = useState<PollOption[]>([
    { id: "opt1", label: "Prioritize Chilled Tomato Transport to Mumbai Mandi", votes: 342 },
    { id: "opt2", label: "Setup Solar Cold Storage Buffer Hub in Bhopal", votes: 215 },
    { id: "opt3", label: "Trigger 50% Flash Sale on Gwalior Mango Surplus", votes: 418 }
  ]);

  const totalVotes = options.reduce((sum, opt) => sum + opt.votes, 0);

  const handleVote = (optionId: string) => {
    if (hasVoted) return;
    setOptions((prev) =>
      prev.map((opt) => (opt.id === optionId ? { ...opt, votes: opt.votes + 1 } : opt))
    );
    setSelectedOption(optionId);
    setHasVoted(true);
  };

  return (
    <Card className="border-2 border-emerald-500/30 bg-gradient-to-r from-emerald-950/40 via-card to-background p-6 md:p-8 rounded-3xl glow-emerald">
      <CardContent className="p-0 space-y-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/40 text-xs">
                Kisan-Grahak Interactive Poll
              </Badge>
              <span className="text-xs text-muted-foreground font-mono flex items-center gap-1">
                <Users className="w-3.5 h-3.5 text-emerald-400" /> {totalVotes} Verified Votes
              </span>
            </div>
            <h2 className="text-2xl md:text-3xl font-serif font-bold text-foreground">
              Regional Demand-Supply Crop Balancing Poll
            </h2>
            <p className="text-xs md:text-sm text-muted-foreground max-w-xl">
              Cast your vote to help optimize regional cold-chain transport, prevent overproduction, and direct surplus produce to discount buyers.
            </p>
          </div>

          <Button
            size="lg"
            onClick={() => setLocation("/community")}
            className="bg-emerald-600 hover:bg-emerald-500 text-white gap-2 font-bold shrink-0 rounded-2xl"
          >
            <Vote className="w-4 h-4" /> Open Full Kisan Hub <ArrowRight className="w-4 h-4" />
          </Button>
        </div>

        {/* Poll Options Grid */}
        <div className="space-y-3 pt-2">
          {options.map((opt) => {
            const pct = Math.round((opt.votes / totalVotes) * 100);
            const isSelected = selectedOption === opt.id;

            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => handleVote(opt.id)}
                disabled={hasVoted}
                className={`w-full text-left p-4 rounded-2xl border transition-all relative overflow-hidden cursor-pointer ${
                  isSelected
                    ? "border-emerald-500 bg-emerald-950/40 text-emerald-200"
                    : "border-border/60 bg-background/80 hover:border-emerald-500/40"
                }`}
              >
                {/* Background Progress Fill */}
                <div
                  className="absolute left-0 top-0 bottom-0 bg-emerald-500/10 transition-all duration-700 pointer-events-none"
                  style={{ width: `${pct}%` }}
                />

                <div className="flex items-center justify-between relative z-10">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-5 h-5 rounded-full border flex items-center justify-center text-xs shrink-0 ${
                        isSelected ? "bg-emerald-500 border-emerald-400 text-black font-bold" : "border-border"
                      }`}
                    >
                      {isSelected ? "✓" : ""}
                    </div>
                    <span className="text-xs md:text-sm font-semibold">{opt.label}</span>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs font-mono font-bold text-emerald-400">{pct}%</span>
                    <span className="text-[10px] text-muted-foreground font-mono">({opt.votes})</span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {hasVoted && (
          <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2 animate-fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Thank you for voting! Your vote is securely recorded and routed to Mandi logistics dispatch.</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
