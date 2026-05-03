import { Router } from "express";
import { db, ordersTable, productsTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";
import { CreateOrderBody } from "@workspace/api-zod";

const router = Router();

function getUserId(req: any): number {
  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith("Bearer mock_jwt_")) {
    try {
      const payload = JSON.parse(Buffer.from(authHeader.replace("Bearer mock_jwt_", ""), "base64").toString());
      return payload.userId;
    } catch { /* use default */ }
  }
  return 1;
}

async function formatOrder(order: typeof ordersTable.$inferSelect) {
  const products = await db.select().from(productsTable).where(eq(productsTable.id, order.productId));
  const product = products[0];
  return {
    id: order.id,
    productId: order.productId,
    productName: product?.name ?? "Unknown Product",
    productImageUrl: product?.imageUrl ?? undefined,
    quantity: order.quantity,
    totalPrice: order.totalPrice,
    status: order.status,
    batchId: order.batchId ?? undefined,
    createdAt: order.createdAt.toISOString(),
  };
}

router.get("/", async (req, res) => {
  const userId = getUserId(req);
  const orders = await db.select().from(ordersTable)
    .where(eq(ordersTable.consumerId, userId))
    .orderBy(desc(ordersTable.createdAt));
  const formatted = await Promise.all(orders.map(formatOrder));
  res.json({ orders: formatted, total: formatted.length });
});

router.post("/", async (req, res) => {
  const parsed = CreateOrderBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid request", details: parsed.error });
    return;
  }
  const userId = getUserId(req);
  const { productId, quantity } = parsed.data;
  const products = await db.select().from(productsTable).where(eq(productsTable.id, productId));
  const product = products[0];
  if (!product) {
    res.status(404).json({ error: "Product not found" });
    return;
  }
  const [order] = await db.insert(ordersTable).values({
    consumerId: userId,
    productId,
    quantity,
    totalPrice: product.price * quantity,
    status: "pending",
    batchId: product.batchId ?? `BATCH-${Date.now()}`,
  }).returning();
  res.status(201).json(await formatOrder(order));
});

router.get("/:id/track", async (req, res) => {
  const orderId = Number(req.params.id);
  const orders = await db.select().from(ordersTable).where(eq(ordersTable.id, orderId));
  const order = orders[0];
  if (!order) {
    res.status(404).json({ error: "Order not found" });
    return;
  }
  const batchId = order.batchId ?? `BATCH-${orderId}`;
  const journey = {
    batchId,
    herbName: "Ashwagandha",
    currentStage: order.status === "delivered" ? "consumer" : order.status === "shipped" ? "store" : "factory",
    steps: [
      { stage: "farm", location: "Rajasthan, India", latitude: 27.0238, longitude: 74.2179, timestamp: new Date(Date.now() - 30 * 86400000).toISOString(), notes: "Harvested organically", verified: true },
      { stage: "warehouse", location: "Jaipur Warehouse", latitude: 26.9124, longitude: 75.7873, timestamp: new Date(Date.now() - 20 * 86400000).toISOString(), notes: "Quality verified", verified: true },
      { stage: "factory", location: "Pune Processing Plant", latitude: 18.5204, longitude: 73.8567, timestamp: new Date(Date.now() - 10 * 86400000).toISOString(), notes: "Processed & packaged", verified: true },
      { stage: "store", location: "Mumbai Dispatch Hub", latitude: 19.0760, longitude: 72.8777, timestamp: new Date(Date.now() - 3 * 86400000).toISOString(), notes: "Dispatched to consumer", verified: order.status !== "pending" },
    ],
  };
  res.json(journey);
});

export default router;
