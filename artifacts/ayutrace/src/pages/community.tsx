import { useRef } from "react";
import { useListCommunityPosts, useSubmitFeedback } from "@workspace/api-client-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { ChevronLeft, ChevronRight, Heart, Megaphone, TrendingUp, Leaf } from "lucide-react";

const COMMUNITY_CATEGORIES = [
  { key: "announcement", label: "Latest Announcements", icon: <Megaphone className="w-5 h-5" />, color: "text-blue-400" },
  { key: "wellness", label: "Health & Wellness", icon: <Leaf className="w-5 h-5" />, color: "text-green-400" },
  { key: "trending", label: "Trending in Ayurveda", icon: <TrendingUp className="w-5 h-5" />, color: "text-primary" },
] as const;

function PostRow({ category, label, icon, color }: { category: string; label: string; icon: React.ReactNode; color: string }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const scroll = (dir: number) => scrollRef.current?.scrollBy({ left: dir * 280, behavior: "smooth" });
  const { data, isLoading } = useListCommunityPosts({ category: category as any, limit: 10 }, {
    query: { queryKey: ["posts", category] },
  });
  const posts = data?.posts ?? [];

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between px-4 md:px-8">
        <div className={`flex items-center gap-2 font-serif font-bold text-xl ${color}`}>
          {icon} {label}
        </div>
        <div className="flex gap-1">
          <Button variant="ghost" size="icon" onClick={() => scroll(-1)} className="rounded-full w-8 h-8"><ChevronLeft className="w-4 h-4" /></Button>
          <Button variant="ghost" size="icon" onClick={() => scroll(1)} className="rounded-full w-8 h-8"><ChevronRight className="w-4 h-4" /></Button>
        </div>
      </div>
      <div ref={scrollRef} className="flex gap-4 overflow-x-auto pb-2 px-4 md:px-8 snap-x snap-mandatory" style={{ scrollbarWidth: "none" }}>
        {isLoading
          ? Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="snap-start shrink-0 w-72"><Skeleton className="h-44 w-72 rounded-xl" /></div>
            ))
          : posts.length === 0
          ? <p className="text-muted-foreground text-sm pl-1">No posts yet.</p>
          : posts.map((post) => (
              <div key={post.id} className="snap-start shrink-0 w-72 group cursor-pointer">
                <Card className="border border-border hover:border-primary/30 transition-colors h-44 flex flex-col">
                  <CardContent className="p-4 flex-1 flex flex-col justify-between">
                    <div className="space-y-2">
                      <p className="font-semibold text-sm line-clamp-2 leading-snug">{post.title}</p>
                      <p className="text-xs text-muted-foreground line-clamp-3 leading-relaxed">{post.content}</p>
                    </div>
                    <div className="flex items-center justify-between mt-3">
                      <div>
                        <p className="text-xs font-medium">{post.authorName}</p>
                        <p className="text-xs text-muted-foreground">{new Date(post.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</p>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Heart className="w-3.5 h-3.5" /> {post.likes}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ))}
      </div>
    </div>
  );
}

function FeedbackForm() {
  const { toast } = useToast();
  const { register, handleSubmit, reset, formState: { errors } } = useForm<{
    name: string; email: string; subject: string; message: string; rating: number;
  }>();
  const { mutate: submitFeedback, isPending } = useSubmitFeedback({
    mutation: {
      onSuccess: () => { toast({ title: "Feedback submitted!", description: "Thank you for your message." }); reset(); },
      onError: () => toast({ title: "Error", description: "Failed to submit feedback.", variant: "destructive" }),
    },
  });

  return (
    <div className="max-w-2xl mx-auto px-4 md:px-8 py-10">
      <div className="space-y-2 mb-8">
        <h2 className="text-2xl font-serif font-bold">Feedback & Complaints</h2>
        <p className="text-muted-foreground">We value every voice in our community. Share your experience or report an issue.</p>
      </div>
      <Card className="border border-border">
        <CardContent className="p-6">
          <form onSubmit={handleSubmit((data) => submitFeedback({ data: { ...data, rating: Number(data.rating) } }))} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="name">Name</Label>
                <Input id="name" placeholder="Your name" {...register("name", { required: true })} className={errors.name ? "border-destructive" : ""} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="you@example.com" {...register("email", { required: true })} className={errors.email ? "border-destructive" : ""} />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="subject">Subject</Label>
              <Input id="subject" placeholder="What is your feedback about?" {...register("subject", { required: true })} className={errors.subject ? "border-destructive" : ""} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="message">Message</Label>
              <Textarea id="message" placeholder="Share your thoughts, experience, or report an issue..." rows={4} {...register("message", { required: true })} className={errors.message ? "border-destructive" : ""} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="rating">Rating (1-5)</Label>
              <Input id="rating" type="number" min={1} max={5} placeholder="5" {...register("rating")} />
            </div>
            <Button type="submit" className="w-full" disabled={isPending}>
              {isPending ? "Submitting..." : "Submit Feedback"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export default function CommunityPage() {
  return (
    <div className="pb-20 space-y-10 pt-8">
      <div className="px-4 md:px-8">
        <h1 className="text-4xl font-serif font-bold">Community</h1>
        <p className="text-muted-foreground mt-1">Announcements, wellness wisdom, and trending discoveries</p>
      </div>
      {COMMUNITY_CATEGORIES.map((cat) => (
        <PostRow key={cat.key} category={cat.key} label={cat.label} icon={cat.icon} color={cat.color} />
      ))}
      <div className="border-t border-border" />
      <FeedbackForm />
    </div>
  );
}
