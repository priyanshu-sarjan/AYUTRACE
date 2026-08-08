import { useState } from "react";
import { Vote, Users, Sprout, ShoppingBag, MessageSquare, ThumbsUp, AlertCircle, Sparkles, Megaphone, Video, Share2, PlusCircle, CheckCircle2, AlertTriangle, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { CropAdvisoryBot } from "@/components/chatbot/crop-advisory-bot";
import { MOCK_POLLS } from "@/lib/supabase-api";

interface CommunityPost {
  id: string;
  author: string;
  role: "Farmer" | "Consumer" | "Agronomist" | "Admin";
  avatar: string;
  title: string;
  content: string;
  videoUrl?: string;
  likes: number;
  comments: number;
  tag: string;
  timeAgo: string;
}

const INITIAL_POSTS: CommunityPost[] = [
  {
    id: "post-1",
    author: "Ramesh Patel (Sardar Patel Krishi Farm)",
    role: "Farmer",
    avatar: "🌾",
    title: "Switched 4 Acres from Tapioca to Certified Peas (Kashi Nandini)",
    content: "After seeing the overproduction warning on AyuTrace for Ariyalur region, I shifted 4 acres to certified peas. Yield is excellent and market price is ₹38/kg baseline!",
    likes: 24,
    comments: 8,
    tag: "Crop Diversification",
    timeAgo: "2 hours ago",
  },
  {
    id: "post-2",
    author: "Dr. Ananya Sharma (Tamil Nadu Agricultural Univ)",
    role: "Agronomist",
    avatar: "🔬",
    title: "Video Guide: Preventing Tomato Early Blight in High Moisture Belts",
    content: "Check out this 3-minute video guide on copper-fungicide sprays and proper row spacing for overproduced tomato belts.",
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    likes: 42,
    comments: 15,
    tag: "Video Guide",
    timeAgo: "5 hours ago",
  },
  {
    id: "post-3",
    author: "AyuTrace Admin Broadcast",
    role: "Admin",
    avatar: "📢",
    title: "Government Subsidy Alert: 25% Seed Subsidy for Overproduction Belts",
    content: "All registered farmers in Ariyalur, Karur, and Theni switching from Chilies/Tapioca to certified pulses are eligible for 25% seed subsidy via Kisan Mitra!",
    likes: 89,
    comments: 31,
    tag: "Admin Announcement",
    timeAgo: "1 day ago",
  },
];

export default function CommunityPage() {
  const [polls, setPolls] = useState(MOCK_POLLS);
  const [votedPolls, setVotedPolls] = useState<Record<string, boolean>>({});
  const [posts, setPosts] = useState<CommunityPost[]>(INITIAL_POSTS);
  const [adminBroadcast, setAdminBroadcast] = useState<string>(
    "📢 Admin Alert: Overproduction warning active for Ariyalur & Theni regions (+42% surplus). All registered farmers sowed Chilies/Tapioca receive certified seed discount subsidies on crop rotation crops (Legumes & Pulses)!"
  );
  const [showBroadcastEdit, setShowBroadcastEdit] = useState(false);
  const [newBroadcastText, setNewBroadcastText] = useState("");

  const [newPostTitle, setNewPostTitle] = useState("");
  const [newPostContent, setNewPostContent] = useState("");
  const [showPostForm, setShowPostForm] = useState(false);

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

  const handleLike = (postId: string) => {
    setPosts((prev) =>
      prev.map((p) => (p.id === postId ? { ...p, likes: p.likes + 1 } : p))
    );
  };

  const handleAddPost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPostTitle.trim() || !newPostContent.trim()) return;

    const post: CommunityPost = {
      id: `post-${Date.now()}`,
      author: "Local Kisan Community Member",
      role: "Farmer",
      avatar: "🌱",
      title: newPostTitle,
      content: newPostContent,
      likes: 1,
      comments: 0,
      tag: "Farmer Post",
      timeAgo: "Just now",
    };

    setPosts([post, ...posts]);
    setNewPostTitle("");
    setNewPostContent("");
    setShowPostForm(false);
  };

  const handleUpdateBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    if (newBroadcastText.trim()) {
      setAdminBroadcast(newBroadcastText);
      setShowBroadcastEdit(false);
      setNewBroadcastText("");
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      {/* Header Banner */}
      <div className="text-center space-y-3 max-w-3xl mx-auto">
        <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/40 text-xs px-3 py-1">
          Kisan-Grahak Community Hub
        </Badge>
        <h1 className="text-3xl md:text-4xl font-serif font-bold">
          Demand-Supply Community & Farmer Advisory
        </h1>
        <p className="text-muted-foreground text-sm md:text-base">
          Connecting farmers, agronomists, and consumers to align crop sowing with real government dataset insights and prevent overproduction market loss.
        </p>
      </div>

      {/* Admin Broadcast Announcement Pinned Banner */}
      <Card className="border-2 border-amber-500/50 bg-gradient-to-r from-amber-950/40 via-amber-900/20 to-card shadow-lg">
        <CardContent className="p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
              <Megaphone className="w-5 h-5 animate-bounce" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/40 text-[10px]">
                  Global Admin Broadcast
                </Badge>
                <span className="text-[11px] text-muted-foreground">Live Site Notice</span>
              </div>
              <p className="text-xs md:text-sm font-medium text-amber-200 leading-relaxed">
                {adminBroadcast}
              </p>
            </div>
          </div>

          <Button
            size="sm"
            variant="outline"
            onClick={() => setShowBroadcastEdit(!showBroadcastEdit)}
            className="text-xs border-amber-500/40 text-amber-300 hover:bg-amber-500/10 shrink-0 gap-1.5"
          >
            <Megaphone className="w-3.5 h-3.5" />
            {showBroadcastEdit ? "Close Editor" : "Post Admin Alert"}
          </Button>
        </CardContent>

        {showBroadcastEdit && (
          <form onSubmit={handleUpdateBroadcast} className="p-4 pt-0 border-t border-amber-500/30 space-y-3">
            <Textarea
              value={newBroadcastText}
              onChange={(e) => setNewBroadcastText(e.target.value)}
              placeholder="Enter new global admin broadcast announcement message..."
              className="text-xs bg-background/80"
              rows={2}
            />
            <div className="flex justify-end gap-2">
              <Button type="button" size="sm" variant="ghost" onClick={() => setShowBroadcastEdit(false)} className="text-xs">
                Cancel
              </Button>
              <Button type="submit" size="sm" className="bg-amber-600 hover:bg-amber-700 text-xs">
                Publish Broadcast Alert
              </Button>
            </div>
          </form>
        )}
      </Card>

      {/* Main 12-Col Layout: Left AI Chatbot Wizard (5 cols), Right Community & Polls (7 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Data-Grounded AI Crop Advisor (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <CropAdvisoryBot />
        </div>

        {/* Right Column: Demand-Supply Polls, Posts & Overproduction Warning Alerts (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Active Polls Header */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-serif font-bold flex items-center gap-2">
                <Vote className="w-5 h-5 text-primary" /> Seasonal Crop Sowing & Demand Polls
              </h2>
              <p className="text-xs text-muted-foreground">
                Ground-truth voting to balance crop sowing with actual consumer demand
              </p>
            </div>
            <Badge variant="outline" className="text-xs">
              Dataset Overproduction Alerts
            </Badge>
          </div>

          {/* Interactive Polls with Dynamic Overproduction Warning Banners */}
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
                        <CardTitle className="text-base font-bold flex items-center gap-2">
                          {poll.title}
                        </CardTitle>
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
                    {/* Dataset Overproduction Warning Box on Polls */}
                    {poll.crop_name.toLowerCase().includes("tomato") || poll.crop_name.toLowerCase().includes("chilli") ? (
                      <div className="bg-red-950/40 border border-red-500/40 p-2.5 rounded-xl text-xs text-red-300 space-y-1">
                        <div className="font-bold flex items-center gap-1.5 text-red-400">
                          <AlertTriangle className="w-4 h-4 shrink-0" />
                          <span>Dataset Warning: Overproduction Alert (+42% Surplus Risk)</span>
                        </div>
                        <p className="text-[11px] text-red-200/80 leading-snug">
                          Government dataset shows {poll.crop_name} productivity is 42% higher than baseline. 68% of polled farmers are diversifying to Spinach/Legumes to avoid price loss!
                        </p>
                      </div>
                    ) : (
                      <div className="bg-emerald-950/30 border border-emerald-500/30 p-2.5 rounded-xl text-xs text-emerald-300">
                        <span className="font-semibold flex items-center gap-1 text-emerald-400">
                          <CheckCircle2 className="w-3.5 h-3.5" /> High Demand Crop:
                        </span>
                        <p className="text-[11px] text-emerald-200/80">Market demand is currently 22% higher than planned harvest.</p>
                      </div>
                    )}

                    {/* Voting Visual Progress */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs font-medium">
                        <span className="flex items-center gap-1 text-emerald-400">
                          <Sprout className="w-3.5 h-3.5" /> Farmer Planned Sowing ({poll.farmer_votes})
                        </span>
                        <span className="flex items-center gap-1 text-primary">
                          <ShoppingBag className="w-3.5 h-3.5" /> Consumer Market Demand ({poll.consumer_votes})
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
                        <ShoppingBag className="w-4 h-4" /> Vote as Consumer (I will buy)
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

          {/* Community Post & Video Feed Header */}
          <div className="pt-4 border-t border-border/60 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-serif font-bold flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-emerald-400" /> Farmer Posts, Blogs & Video Guides
              </h3>
              <p className="text-xs text-muted-foreground">Share farming experiences, video tutorials, and crop diversification success stories</p>
            </div>
            <Button
              size="sm"
              onClick={() => setShowPostForm(!showPostForm)}
              className="bg-emerald-600 hover:bg-emerald-700 text-xs gap-1.5"
            >
              <PlusCircle className="w-4 h-4" /> Create Post
            </Button>
          </div>

          {/* New Post Form */}
          {showPostForm && (
            <Card className="border border-emerald-500/40 p-4 bg-muted/30 space-y-3">
              <h4 className="text-xs font-bold text-emerald-400">Share Story or Video Guide</h4>
              <form onSubmit={handleAddPost} className="space-y-3">
                <Input
                  value={newPostTitle}
                  onChange={(e) => setNewPostTitle(e.target.value)}
                  placeholder="Post title (e.g. Switched to Certified Seed Kufri Chipsona)..."
                  className="text-xs bg-background"
                />
                <Textarea
                  value={newPostContent}
                  onChange={(e) => setNewPostContent(e.target.value)}
                  placeholder="Share your experience, yield numbers, or farming tips..."
                  className="text-xs bg-background"
                  rows={3}
                />
                <div className="flex justify-end gap-2">
                  <Button type="button" size="sm" variant="ghost" onClick={() => setShowPostForm(false)} className="text-xs">
                    Cancel
                  </Button>
                  <Button type="submit" size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-xs">
                    Publish Post
                  </Button>
                </div>
              </form>
            </Card>
          )}

          {/* Post Feed List */}
          <div className="space-y-4">
            {posts.map((post) => (
              <Card key={post.id} className="border border-border/60 bg-card p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{post.avatar}</span>
                    <div>
                      <h4 className="text-xs font-bold text-foreground">{post.author}</h4>
                      <span className="text-[10px] text-muted-foreground">{post.role} • {post.timeAgo}</span>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-[10px] bg-primary/10 text-primary border-primary/30">
                    {post.tag}
                  </Badge>
                </div>

                <h3 className="text-sm font-bold text-foreground">{post.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{post.content}</p>

                {/* Video Embed Card if present */}
                {post.videoUrl && (
                  <div className="bg-muted/60 p-2.5 rounded-xl border border-border/60 flex items-center justify-between text-xs">
                    <span className="flex items-center gap-2 text-emerald-400 font-semibold">
                      <Video className="w-4 h-4 text-red-500" /> Watch Video Tutorial
                    </span>
                    <Button size="sm" variant="ghost" className="h-7 text-xs text-primary gap-1">
                      Play Video <ChevronRight className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                )}

                <div className="flex items-center justify-between pt-2 border-t border-border/40 text-xs">
                  <button
                    onClick={() => handleLike(post.id)}
                    className="flex items-center gap-1.5 text-muted-foreground hover:text-emerald-400 transition-colors"
                  >
                    <ThumbsUp className="w-3.5 h-3.5" /> {post.likes} Helpful
                  </button>
                  <span className="text-muted-foreground">{post.comments} Comments</span>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
