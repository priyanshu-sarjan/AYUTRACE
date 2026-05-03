import { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from "react-leaflet";
import L from "leaflet";
import { useGetHerbMapPins, useGetSupplyChainJourney } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Leaf, MapPin, CheckCircle, Circle, ArrowRight } from "lucide-react";

const STAGE_COLORS: Record<string, string> = {
  farm: "#22c55e",
  warehouse: "#f59e0b",
  factory: "#3b82f6",
  store: "#a855f7",
  consumer: "#ec4899",
};

const STAGE_LABELS: Record<string, string> = {
  farm: "Farm",
  warehouse: "Warehouse",
  factory: "Factory",
  store: "Store",
  consumer: "Consumer",
};

function createHerbIcon(color: string) {
  return L.divIcon({
    className: "",
    html: `<div style="background:${color};width:14px;height:14px;border-radius:50%;border:2px solid white;box-shadow:0 0 0 2px ${color}44;"></div>`,
    iconSize: [14, 14],
    iconAnchor: [7, 7],
  });
}

function createStageIcon(stage: string) {
  const color = STAGE_COLORS[stage] ?? "#888";
  return L.divIcon({
    className: "",
    html: `<div style="background:${color};width:16px;height:16px;border-radius:50%;border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.4);"></div>`,
    iconSize: [16, 16],
    iconAnchor: [8, 8],
  });
}

const DEMO_BATCHES = ["BATCH-ASH-2024-001", "BATCH-TUR-2024-001", "BATCH-BRA-2024-001"];

function FitBoundsOnPins({ pins }: { pins: { latitude: number; longitude: number }[] }) {
  const map = useMap();
  useEffect(() => {
    if (pins.length > 0) {
      const bounds = L.latLngBounds(pins.map((p) => [p.latitude, p.longitude]));
      map.fitBounds(bounds, { padding: [40, 40] });
    }
  }, [pins, map]);
  return null;
}

export default function MapPage() {
  const { data: pinsData } = useGetHerbMapPins();
  const pins = pinsData?.pins ?? [];
  const [selectedBatch, setSelectedBatch] = useState<string | null>(null);
  const { data: journeyData } = useGetSupplyChainJourney(selectedBatch ?? "BATCH-ASH-2024-001", {
    query: { enabled: !!selectedBatch, queryKey: ["supply-chain", selectedBatch] },
  });

  const journeySteps = journeyData?.steps ?? [];
  const journeyPoints = journeySteps
    .filter((s) => s.latitude != null && s.longitude != null)
    .map((s) => [s.latitude!, s.longitude!] as [number, number]);

  return (
    <div className="flex flex-col md:flex-row h-[calc(100vh-4rem)] gap-0">
      <div className="flex-1 relative">
        <MapContainer
          center={[22.5937, 78.9629]}
          zoom={5}
          style={{ height: "100%", width: "100%" }}
          className="z-0"
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          />
          {pins.length > 0 && <FitBoundsOnPins pins={pins} />}
          {pins.map((pin) => (
            <Marker key={pin.id} position={[pin.latitude, pin.longitude]} icon={createHerbIcon("#22c55e")}>
              <Popup>
                <div className="text-sm font-semibold">{pin.name}</div>
                <div className="text-xs text-gray-500">{pin.region}</div>
              </Popup>
            </Marker>
          ))}
          {selectedBatch && journeyPoints.length > 1 && (
            <Polyline positions={journeyPoints} color="#f59e0b" weight={3} dashArray="8 6" />
          )}
          {selectedBatch &&
            journeySteps
              .filter((s) => s.latitude != null && s.longitude != null)
              .map((step, i) => (
                <Marker key={i} position={[step.latitude!, step.longitude!]} icon={createStageIcon(step.stage)}>
                  <Popup>
                    <div className="text-sm font-bold">{STAGE_LABELS[step.stage]}</div>
                    <div className="text-xs">{step.location}</div>
                    {step.notes && <div className="text-xs text-gray-500 mt-1">{step.notes}</div>}
                  </Popup>
                </Marker>
              ))}
        </MapContainer>
        <div className="absolute top-4 left-4 z-10 bg-card/90 backdrop-blur-sm rounded-xl border border-border p-3 flex flex-col gap-2 shadow-lg">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Herb Regions</p>
          <div className="flex items-center gap-2 text-xs"><span className="w-3 h-3 rounded-full bg-green-500 inline-block" /> Active Cultivation</div>
          {selectedBatch && (
            <>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mt-1">Supply Chain</p>
              {Object.entries(STAGE_LABELS).map(([k, v]) => (
                <div key={k} className="flex items-center gap-2 text-xs">
                  <span className="w-3 h-3 rounded-full inline-block" style={{ background: STAGE_COLORS[k] }} /> {v}
                </div>
              ))}
            </>
          )}
        </div>
      </div>

      <div className="w-full md:w-80 bg-card border-l border-border overflow-y-auto flex flex-col">
        <div className="p-4 border-b border-border">
          <h2 className="font-serif font-bold text-lg flex items-center gap-2">
            <MapPin className="w-5 h-5 text-primary" /> Supply Chain Tracer
          </h2>
          <p className="text-xs text-muted-foreground mt-1">Select a batch to animate its journey across India</p>
        </div>
        <div className="p-4 space-y-2">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Select Batch</p>
          {DEMO_BATCHES.map((b) => (
            <Button
              key={b}
              variant={selectedBatch === b ? "default" : "outline"}
              size="sm"
              className="w-full justify-start font-mono text-xs"
              onClick={() => setSelectedBatch(selectedBatch === b ? null : b)}
            >
              {b}
            </Button>
          ))}
        </div>
        {selectedBatch && journeyData && (
          <div className="p-4 flex-1">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">Journey: {journeyData.herbName}</p>
            <div className="space-y-0">
              {journeyData.steps.map((step, i) => (
                <div key={i} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center border-2 shrink-0"
                      style={{ borderColor: STAGE_COLORS[step.stage], backgroundColor: STAGE_COLORS[step.stage] + "22" }}
                    >
                      {step.verified ? (
                        <CheckCircle className="w-4 h-4" style={{ color: STAGE_COLORS[step.stage] }} />
                      ) : (
                        <Circle className="w-4 h-4 text-muted-foreground" />
                      )}
                    </div>
                    {i < journeyData.steps.length - 1 && (
                      <div className="w-px flex-1 bg-border my-1" />
                    )}
                  </div>
                  <div className="pb-4">
                    <p className="font-semibold text-sm capitalize">{STAGE_LABELS[step.stage]}</p>
                    <p className="text-xs text-muted-foreground">{step.location}</p>
                    {step.notes && <p className="text-xs text-muted-foreground/70 italic mt-0.5">{step.notes}</p>}
                    <p className="text-xs text-primary/80 mt-0.5">
                      {new Date(step.timestamp).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        <div className="p-4 border-t border-border">
          <p className="text-xs text-muted-foreground">
            {pins.length} herb cultivation zones mapped across India.
          </p>
        </div>
      </div>
    </div>
  );
}
