import { Router } from "express";
import { db, herbsTable, usersTable, productsTable } from "@workspace/db";
import { eq, ilike, or, desc } from "drizzle-orm";
import { ListHerbsQueryParams, GetHerbParams } from "@workspace/api-zod";

const router = Router();

function formatHerb(herb: typeof herbsTable.$inferSelect) {
  return {
    id: herb.id,
    name: herb.name,
    botanicalName: herb.botanicalName,
    region: herb.region,
    latitude: herb.latitude,
    longitude: herb.longitude,
    imageUrl: herb.imageUrl ?? undefined,
    benefits: herb.benefits ?? [],
    uses: herb.uses ?? undefined,
    harvestSeason: herb.harvestSeason ?? undefined,
    currentStock: herb.currentStock ?? 0,
    pricePerKg: herb.pricePerKg ?? undefined,
    trendScore: herb.trendScore ?? 0,
  };
}

router.get("/", async (req, res) => {
  const parsed = ListHerbsQueryParams.safeParse(req.query);
  const params = parsed.success ? parsed.data : {};
  const { search, region, limit = 20, offset = 0 } = params;

  let herbs = await db.select().from(herbsTable);

  if (search) {
    herbs = herbs.filter(h =>
      h.name.toLowerCase().includes(search.toLowerCase()) ||
      h.botanicalName.toLowerCase().includes(search.toLowerCase())
    );
  }
  if (region) {
    herbs = herbs.filter(h => h.region.toLowerCase().includes(region.toLowerCase()));
  }

  const total = herbs.length;
  const paginated = herbs.slice(Number(offset), Number(offset) + Number(limit));

  res.json({ herbs: paginated.map(formatHerb), total });
});

router.get("/trending", async (req, res) => {
  const herbs = await db.select().from(herbsTable).orderBy(desc(herbsTable.trendScore)).limit(10);
  res.json({ herbs: herbs.map(formatHerb), total: herbs.length });
});

router.get("/map-pins", async (req, res) => {
  const herbs = await db.select().from(herbsTable);
  const pins = herbs.map(h => ({
    id: h.id,
    name: h.name,
    latitude: h.latitude,
    longitude: h.longitude,
    region: h.region,
    herbCount: 1,
  }));
  res.json({ pins });
});

router.get("/:id", async (req, res) => {
  const parsed = GetHerbParams.safeParse({ id: Number(req.params.id) });
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }
  const herbs = await db.select().from(herbsTable).where(eq(herbsTable.id, parsed.data.id));
  const herb = herbs[0];
  if (!herb) {
    res.status(404).json({ error: "Herb not found" });
    return;
  }

  const sellers = await db.select().from(usersTable).where(eq(usersTable.role, "farmer")).limit(3);
  const recentBatches = ["BATCH-" + herb.id + "-001", "BATCH-" + herb.id + "-002"];

  res.json({
    ...formatHerb(herb),
    sellers: sellers.map(s => ({
      id: s.id, name: s.name, email: s.email, role: s.role,
      region: s.region ?? undefined, avatarUrl: s.avatarUrl ?? undefined,
    })),
    recentBatches,
  });
});

export default router;
