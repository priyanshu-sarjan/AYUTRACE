import { Router } from "express";
import { db, productsTable, usersTable, herbsTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";
import { ListProductsQueryParams, CreateProductBody, GetProductParams } from "@workspace/api-zod";

const router = Router();

async function formatProduct(product: typeof productsTable.$inferSelect) {
  const seller = await db.select().from(usersTable).where(eq(usersTable.id, product.sellerId));
  let herbName: string | undefined;
  if (product.herbId) {
    const herbs = await db.select().from(herbsTable).where(eq(herbsTable.id, product.herbId));
    herbName = herbs[0]?.name;
  }
  return {
    id: product.id,
    name: product.name,
    description: product.description ?? undefined,
    category: product.category ?? undefined,
    imageUrl: product.imageUrl ?? undefined,
    price: product.price,
    stockQty: product.stockQty ?? 0,
    sellerId: product.sellerId,
    sellerName: seller[0]?.name ?? "Unknown",
    herbId: product.herbId ?? undefined,
    herbName,
    batchId: product.batchId ?? undefined,
    isNew: product.isNew ?? false,
    rating: product.rating ?? 0,
    reviewCount: product.reviewCount ?? 0,
    createdAt: product.createdAt.toISOString(),
  };
}

router.get("/", async (req, res) => {
  const parsed = ListProductsQueryParams.safeParse(req.query);
  const params = parsed.success ? parsed.data : {};
  const { category, sellerId, search, limit = 20, offset = 0 } = params;

  let products = await db.select().from(productsTable).orderBy(desc(productsTable.createdAt));

  if (category) products = products.filter(p => p.category === category);
  if (sellerId) products = products.filter(p => p.sellerId === Number(sellerId));
  if (search) products = products.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));

  const total = products.length;
  const paginated = products.slice(Number(offset), Number(offset) + Number(limit));
  const formatted = await Promise.all(paginated.map(formatProduct));
  res.json({ products: formatted, total });
});

router.post("/", async (req, res) => {
  const parsed = CreateProductBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid request", details: parsed.error });
    return;
  }
  const authHeader = req.headers.authorization;
  let sellerId = 1;
  if (authHeader?.startsWith("Bearer mock_jwt_")) {
    try {
      const payload = JSON.parse(Buffer.from(authHeader.replace("Bearer mock_jwt_", ""), "base64").toString());
      sellerId = payload.userId;
    } catch { /* use default */ }
  }
  const [product] = await db.insert(productsTable).values({
    ...parsed.data,
    sellerId,
    batchId: `BATCH-${Date.now()}`,
  }).returning();
  res.status(201).json(await formatProduct(product));
});

router.get("/announcements", async (req, res) => {
  const products = await db.select().from(productsTable)
    .where(eq(productsTable.isNew, true))
    .orderBy(desc(productsTable.createdAt))
    .limit(10);
  const formatted = await Promise.all(products.map(formatProduct));
  res.json({ products: formatted, total: formatted.length });
});

router.get("/:id", async (req, res) => {
  const parsed = GetProductParams.safeParse({ id: Number(req.params.id) });
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }
  const products = await db.select().from(productsTable).where(eq(productsTable.id, parsed.data.id));
  const product = products[0];
  if (!product) {
    res.status(404).json({ error: "Product not found" });
    return;
  }
  res.json(await formatProduct(product));
});

export default router;
