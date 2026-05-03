import { Router } from "express";
import { db, supplyChainBatchesTable, supplyChainStepsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { GetSupplyChainJourneyParams } from "@workspace/api-zod";

const router = Router();

router.get("/:batchId", async (req, res) => {
  const parsed = GetSupplyChainJourneyParams.safeParse({ batchId: req.params.batchId });
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid batchId" });
    return;
  }
  const { batchId } = parsed.data;

  const batches = await db.select().from(supplyChainBatchesTable).where(eq(supplyChainBatchesTable.batchId, batchId));
  const batch = batches[0];

  if (!batch) {
    const simulatedJourney = {
      batchId,
      herbName: "Ashwagandha",
      currentStage: "store",
      steps: [
        { stage: "farm", location: "Rajasthan, India", latitude: 27.0238, longitude: 74.2179, timestamp: new Date(Date.now() - 30 * 86400000).toISOString(), notes: "Harvested from certified organic farm", verified: true },
        { stage: "warehouse", location: "Jaipur Warehouse, Rajasthan", latitude: 26.9124, longitude: 75.7873, timestamp: new Date(Date.now() - 25 * 86400000).toISOString(), notes: "Quality tested, graded A+", verified: true },
        { stage: "factory", location: "Pune Processing Plant, Maharashtra", latitude: 18.5204, longitude: 73.8567, timestamp: new Date(Date.now() - 15 * 86400000).toISOString(), notes: "Extracted and encapsulated per GMP standards", verified: true },
        { stage: "store", location: "Mumbai Distribution Center", latitude: 19.0760, longitude: 72.8777, timestamp: new Date(Date.now() - 5 * 86400000).toISOString(), notes: "Packaged and ready for retail", verified: true },
      ],
    };
    res.json(simulatedJourney);
    return;
  }

  const steps = await db.select().from(supplyChainStepsTable).where(eq(supplyChainStepsTable.batchId, batchId));
  res.json({
    batchId: batch.batchId,
    herbName: batch.herbName,
    currentStage: batch.currentStage,
    steps: steps.map(s => ({
      stage: s.stage,
      location: s.location,
      latitude: s.latitude ?? undefined,
      longitude: s.longitude ?? undefined,
      timestamp: s.timestamp.toISOString(),
      notes: s.notes ?? undefined,
      verified: s.verified ?? false,
    })),
  });
});

export default router;
