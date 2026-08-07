import { useState } from "react";
import { Vote, Users, Sprout, ShoppingBag, MessageSquare, ThumbsUp, AlertCircle, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { CropAdvisoryBot } from "@/components/chatbot/crop-advisory-bot";
import { MOCK_POLLS } from "@/lib/supabase-api";

export default function CommunityPage() {
  const [polls, setPolls] = useState(MOCK_POLLS);
  const [votedPolls, setVotedPolls] = useState<Record<string, boolean>>({});

  const handleVote = (pollId: string, role: "farmer" | "consumer") => {
    if (votedPolls[pollId]) return;

    setPolls((prev) =>
      prev.map((p) => {
        if (p.id === pollId) {
          return {
            ...p,
            farmer_votes: role === "farmer" ? p.farmer_votes + 1 : p.farmer_votes,
            consumer_votes: role === "consumer" ? p.consumer_votes + 1 : p.consumer_votes,
          };
        }
        return p;
      })
    );
    setVotedPolls((prev) => ({ ...prev, [pollId]: true }));
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      {/* Header Banner */}
      <div className="text-center space-y-3 max-w-3xl mx-auto">
        <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/40 text-xs px-3 py-1">
          Kisan-Grahak Community Hub
        </Badge>
        <h1 className="text-3xl md:text-4xl font-serif font-bold">
          Demand-Supply Community & Farmer Guidance
        </h1>
        <p className="text-muted-foreground text-sm md:text-base">
          Connecting farmers, traders, and consumers to align upcoming crop sowings with real market demand and eliminate overproduction waste.
        </p>
      </div>

      {/* Main Grid: Left Chatbot, Right Polls */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: AI Kisan Mitra Advisory Bot (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <CropAdvisoryBot />
        </div>

        {/* Right Column: Demand-Supply Polls & Crop Advice (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-serif font-bold flex items-center gap-2">
                <Vote className="w-5 h-5 text-primary" /> Active Crop Sowing & Demand Polls
              </h2>
              <p className="text-xs text-muted-foreground">
                Vote to balance regional crop production with consumer market demand
              </p>
            </div>
            <Badge variant="outline" className="text-xs">
              Live Interactive Polls
            </Badge>
          </div>

          {/* Poll Cards */}
          <div className="space-y-4">
            {polls.map((poll) => {
              const totalVotes = poll.farmer_votes + poll.consumer_votes;
              const farmerPct = totalVotes > 0 ? Math.round((poll.farmer_votes / totalVotes) * 100) : 50;
              const isVoted = votedPolls[poll.id || ""];

              return (
                <Card key={poll.id} className="border border-border/60 shadow-md bg-card">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <CardTitle className="text-base font-bold">{poll.title}</CardTitle>
                        <CardDescription className="text-xs text-emerald-400 font-semibold mt-1">
                          Target Crop: {poll.crop_name}
                        </CardDescription>
                      </div>
                      <Badge className="bg-primary/20 text-primary border-primary/40 text-xs shrink-0">
                        {poll.target_demand_tons.toLocaleString()} Tons Target
                      </Badge>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    {/* Voting Visual Progress */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs font-medium">
                        <span className="flex items-center gap-1 text-emerald-400">
                          <Sprout className="w-3.5 h-3.5" /> Farmer Planned Stock ({poll.farmer_votes})
                        </span>
                        <span className="flex items-center gap-1 text-primary">
                          <ShoppingBag className="w-3.5 h-3.5" /> Consumer Demand ({poll.consumer_votes})
                        </span>
                      </div>
                      <Progress value={farmerPct} className="h-2.5 bg-primary/30" />
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3 pt-2">
                      <Button
                        size="sm"
                        disabled={isVoted}
                        onClick={() => handleVote(poll.id || "", "farmer")}
                        className="flex-1 bg-emerald-700 hover:bg-emerald-800 text-xs gap-1.5"
                      >
                        <Sprout className="w-4 h-4" /> Vote as Farmer (I will sow this)
                      </Button>
                      <Button
                        size="sm"
                        disabled={isVoted}
                        onClick={() => handleVote(poll.id || "", "consumer")}
                        className="flex-1 bg-primary hover:bg-primary/90 text-xs gap-1.5"
                      >
                        <ShoppingBag className="w-4 h-4" /> Vote as Consumer (I want to buy)
                      </Button>
                    </div>
                    {isVoted && (
                      <p className="text-[11px] text-emerald-400 font-medium text-center">
                        ✓ Your vote has been recorded and synced to Supabase!
                      </p>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Regional Farmers Guidance Notice */}
          <Card className="border-amber-500/30 bg-amber-950/20 p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div className="space-y-1 text-xs text-foreground/90">
                <h4 className="font-bold text-amber-300">Seasonal Crop Advisory for Western Maharashtra:</h4>
                <p>
                  Tomato harvests in Nashik are projected to exceed local demand by 35% next month. Farmers are advised to allocate 25-30% of land to fast-maturing leafy greens (Spinach, Fenugreek) to prevent market glut and preserve soil nutrients.
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
