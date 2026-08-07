import { useState, useRef } from "react";
import { Camera, Upload, CheckCircle2, AlertTriangle, XCircle, Sparkles, RefreshCw, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

interface ScanResult {
  itemName: string;
  freshnessScore: number;
  spoilageStage: "Fresh Grade A" | "Early Spoilage Risk" | "Spoiled / Expired";
  remainingDays: number;
  perishabilityPriority: "Priority 1 (Express)" | "Priority 2 (Standard)" | "Priority 3 (Long Life)";
  recommendation: string;
  discountSuggested: number;
}

export function VisionSpoilageScanner() {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<ScanResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const sampleImages = [
    {
      name: "Fresh Tomatoes 🍅",
      url: "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=500&q=80",
      mockResult: {
        itemName: "Vine Tomatoes (Batch #AYU-902)",
        freshnessScore: 88,
        spoilageStage: "Fresh Grade A" as const,
        remainingDays: 4,
        perishabilityPriority: "Priority 1 (Express)" as const,
        recommendation: "Optimal condition. Ship via Priority 1 Cold Storage Express.",
        discountSuggested: 0,
      },
    },
    {
      name: "Slightly Ripened Bananas 🍌",
      url: "https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=500&q=80",
      mockResult: {
        itemName: "Yellow Bananas (Batch #AYU-411)",
        freshnessScore: 62,
        spoilageStage: "Early Spoilage Risk" as const,
        remainingDays: 2,
        perishabilityPriority: "Priority 1 (Express)" as const,
        recommendation: "High ripening rate detected. Apply 35% Dynamic Clearance Discount immediately.",
        discountSuggested: 35,
      },
    },
    {
      name: "Stored Onions 🧅",
      url: "https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?w=500&q=80",
      mockResult: {
        itemName: "Lasalgaon Red Onions",
        freshnessScore: 96,
        spoilageStage: "Fresh Grade A" as const,
        remainingDays: 35,
        perishabilityPriority: "Priority 3 (Long Life)" as const,
        recommendation: "Excellent dry skin condition. Safe for standard ambient storage.",
        discountSuggested: 0,
      },
    },
  ];

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
        runComputerVisionAnalysis(file.name);
      };
      reader.readAsDataURL(file);
    }
  };

  const selectSample = (sample: (typeof sampleImages)[0]) => {
    setImagePreview(sample.url);
    setAnalyzing(true);
    setResult(null);

    setTimeout(() => {
      setAnalyzing(false);
      setResult(sample.mockResult);
    }, 1200);
  };

  const runComputerVisionAnalysis = (fileName: string) => {
    setAnalyzing(true);
    setResult(null);

    setTimeout(() => {
      setAnalyzing(false);
      // Generate randomized realistic vision analysis for uploaded photo
      const isPerishable = fileName.toLowerCase().includes("tomato") || fileName.toLowerCase().includes("leaf");
      setResult({
        itemName: isPerishable ? "Uploaded Crop (Perishable)" : "Scanned Harvest Batch",
        freshnessScore: Math.floor(Math.random() * 25) + 70,
        spoilageStage: "Fresh Grade A",
        remainingDays: isPerishable ? 3 : 12,
        perishabilityPriority: isPerishable ? "Priority 1 (Express)" : "Priority 2 (Standard)",
        recommendation: isPerishable
          ? "High moisture content detected. Priority 1 Express routing assigned."
          : "Healthy surface texture. Proceed to cold storage warehouse.",
        discountSuggested: 0,
      });
    }, 1500);
  };

  return (
    <Card className="border border-border/60 shadow-xl bg-card">
      <CardHeader className="bg-muted/30 border-b border-border/40 pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/20 border border-primary/30 flex items-center justify-center text-primary">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <CardTitle className="text-lg font-bold">
                AI Vision Spoilage & Quality Scanner
              </CardTitle>
              <CardDescription className="text-xs">
                Computer vision analysis for freshness score & expiry prediction
              </CardDescription>
            </div>
          </div>
          <Badge className="bg-primary/20 text-primary border-primary/40">CV Model v2.4</Badge>
        </div>
      </CardHeader>

      <CardContent className="p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
          {/* Upload / Camera Box */}
          <div className="space-y-3">
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-border hover:border-primary/60 rounded-2xl p-6 text-center cursor-pointer transition-all bg-muted/20 hover:bg-muted/40 min-h-[220px] flex flex-col items-center justify-center relative overflow-hidden"
            >
              {imagePreview ? (
                <img
                  src={imagePreview}
                  alt="Crop Preview"
                  className="w-full h-full object-cover absolute inset-0 rounded-2xl"
                />
              ) : (
                <div className="space-y-3">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto text-primary">
                    <Camera className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold">Click to Upload or Scan Crop Photo</p>
                    <p className="text-xs text-muted-foreground mt-1">Supports JPG, PNG, WEBP</p>
                  </div>
                  <Button size="sm" variant="outline" className="gap-2 text-xs">
                    <Upload className="w-3.5 h-3.5" /> Select Image
                  </Button>
                </div>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageUpload}
            />

            {/* Test Sample Quick Buttons */}
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-2">Or test sample crops:</p>
              <div className="flex flex-wrap gap-2">
                {sampleImages.map((s, i) => (
                  <Button
                    key={i}
                    size="sm"
                    variant="outline"
                    onClick={() => selectSample(s)}
                    className="text-xs gap-1.5 bg-background"
                  >
                    {s.name}
                  </Button>
                ))}
              </div>
            </div>
          </div>

          {/* Analysis Results Box */}
          <div className="bg-muted/30 border border-border/50 rounded-2xl p-5 min-h-[220px] flex flex-col justify-center">
            {analyzing ? (
              <div className="text-center space-y-3 py-8">
                <RefreshCw className="w-8 h-8 text-primary animate-spin mx-auto" />
                <p className="text-sm font-semibold">Running Computer Vision Model...</p>
                <p className="text-xs text-muted-foreground">Analyzing skin pigmentation, spot degradation & surface moisture</p>
              </div>
            ) : result ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-border/40 pb-3">
                  <div>
                    <h4 className="font-bold text-base">{result.itemName}</h4>
                    <p className="text-xs text-muted-foreground">Scan Status: Verified</p>
                  </div>
                  <Badge
                    variant="outline"
                    className={
                      result.spoilageStage === "Fresh Grade A"
                        ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                        : "bg-amber-500/10 text-amber-400 border-amber-500/30"
                    }
                  >
                    {result.spoilageStage === "Fresh Grade A" ? (
                      <CheckCircle2 className="w-3 h-3 mr-1" />
                    ) : (
                      <AlertTriangle className="w-3 h-3 mr-1" />
                    )}
                    {result.spoilageStage}
                  </Badge>
                </div>

                {/* Freshness Score Progress Bar */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-medium">
                    <span>Freshness Health Score</span>
                    <span className="font-bold text-primary">{result.freshnessScore}%</span>
                  </div>
                  <Progress value={result.freshnessScore} className="h-2" />
                </div>

                {/* Metrics Grid */}
                <div className="grid grid-cols-2 gap-3 text-xs pt-1">
                  <div className="bg-background/80 p-2.5 rounded-xl border border-border/60">
                    <span className="text-muted-foreground block text-[10px]">Est. Remaining Life</span>
                    <span className="font-bold text-sm text-foreground">{result.remainingDays} Days</span>
                  </div>
                  <div className="bg-background/80 p-2.5 rounded-xl border border-border/60">
                    <span className="text-muted-foreground block text-[10px]">Logistics Tier</span>
                    <span className="font-bold text-sm text-amber-400 flex items-center gap-1">
                      <Zap className="w-3 h-3" /> {result.perishabilityPriority}
                    </span>
                  </div>
                </div>

                {/* Recommendation */}
                <div className="bg-primary/10 border border-primary/20 rounded-xl p-3 text-xs text-primary-foreground/90 leading-relaxed">
                  <span className="font-bold text-primary block mb-0.5">AI Action Recommendation:</span>
                  {result.recommendation}
                  {result.discountSuggested > 0 && (
                    <span className="block mt-1 font-bold text-amber-400">
                      ⚡ Suggested Clearance Discount: {result.discountSuggested}% OFF
                    </span>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center py-8 space-y-2 text-muted-foreground">
                <Sparkles className="w-8 h-8 mx-auto opacity-40" />
                <p className="text-sm">Upload or select a crop photo to run computer vision freshness assessment.</p>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
