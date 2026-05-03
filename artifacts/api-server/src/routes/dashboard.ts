import { Router } from "express";
import { db, ordersTable, productsTable, herbsTable, usersTable } from "@workspace/db";
import { eq, desc, count, sum } from "drizzle-orm";

const router = Router();

function getUserId(req: any): number {
  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith("Bearer mock_jwt_")) {
    try {
      const payload = JSON.parse(Buffer.from(authHeader.replace("Bearer mock_jwt_", ""), "base64").toString());
      return payload.userId;
    } catch {}
  }
  return 1;
}

router.get("/farmer", async (req, res) => {
  const userId = getUserId(req);
  const herbs = await db.select().from(herbsTable).limit(5);
  const orders = await db.select().from(ordersTable).orderBy(desc(ordersTable.createdAt)).limit(5);
  const allOrders = await db.select().from(ordersTable);
  const totalRevenue = allOrders.reduce((sum, o) => sum + o.totalPrice, 0);

  res.json({
    totalHerbs: herbs.length,
    totalRevenue,
    activeOrders: allOrders.filter(o => o.status === "pending" || o.status === "processing").length,
    pendingShipments: allOrders.filter(o => o.status === "processing").length,
    topHerbs: herbs.map(h => ({
      id: h.id, name: h.name, botanicalName: h.botanicalName, region: h.region,
      latitude: h.latitude, longitude: h.longitude, imageUrl: h.imageUrl ?? undefined,
      benefits: h.benefits ?? [], uses: h.uses ?? undefined, harvestSeason: h.harvestSeason ?? undefined,
      currentStock: h.currentStock ?? 0, pricePerKg: h.pricePerKg ?? undefined, trendScore: h.trendScore ?? 0,
    })),
    recentOrders: await Promise.all(orders.slice(0, 3).map(async o => {
      const products = await db.select().from(productsTable).where(eq(productsTable.id, o.productId));
      return { id: o.id, productId: o.productId, productName: products[0]?.name ?? "Product", productImageUrl: products[0]?.imageUrl ?? undefined, quantity: o.quantity, totalPrice: o.totalPrice, status: o.status, batchId: o.batchId ?? undefined, createdAt: o.createdAt.toISOString() };
    })),
  });
});

router.get("/consumer", async (req, res) => {
  const userId = getUserId(req);
  const orders = await db.select().from(ordersTable).where(eq(ordersTable.consumerId, userId)).orderBy(desc(ordersTable.createdAt));
  const totalSpent = orders.reduce((s, o) => s + o.totalPrice, 0);
  const products = await db.select().from(productsTable).limit(4);

  const formattedOrders = await Promise.all(orders.slice(0, 5).map(async o => {
    const prods = await db.select().from(productsTable).where(eq(productsTable.id, o.productId));
    return { id: o.id, productId: o.productId, productName: prods[0]?.name ?? "Product", productImageUrl: prods[0]?.imageUrl ?? undefined, quantity: o.quantity, totalPrice: o.totalPrice, status: o.status, batchId: o.batchId ?? undefined, createdAt: o.createdAt.toISOString() };
  }));

  const recommended = await Promise.all(products.map(async p => {
    const sellers = await db.select().from(usersTable).where(eq(usersTable.id, p.sellerId));
    return { id: p.id, name: p.name, description: p.description ?? undefined, category: p.category ?? undefined, imageUrl: p.imageUrl ?? undefined, price: p.price, stockQty: p.stockQty ?? 0, sellerId: p.sellerId, sellerName: sellers[0]?.name ?? "Unknown", batchId: p.batchId ?? undefined, isNew: p.isNew ?? false, rating: p.rating ?? 0, reviewCount: p.reviewCount ?? 0, createdAt: p.createdAt.toISOString() };
  }));

  res.json({
    totalOrders: orders.length,
    activeOrders: orders.filter(o => ["pending", "processing", "shipped"].includes(o.status)).length,
    totalSpent,
    recentOrders: formattedOrders,
    recommendedProducts: recommended,
  });
});

router.get("/seller", async (req, res) => {
  const userId = getUserId(req);
  const products = await db.select().from(productsTable).where(eq(productsTable.id, userId));
  const allProducts = await db.select().from(productsTable).limit(6);
  const orders = await db.select().from(ordersTable).orderBy(desc(ordersTable.createdAt)).limit(5);
  const totalRevenue = orders.reduce((s, o) => s + o.totalPrice, 0);

  const formattedProducts = await Promise.all(allProducts.slice(0, 4).map(async p => {
    const sellers = await db.select().from(usersTable).where(eq(usersTable.id, p.sellerId));
    return { id: p.id, name: p.name, description: p.description ?? undefined, category: p.category ?? undefined, imageUrl: p.imageUrl ?? undefined, price: p.price, stockQty: p.stockQty ?? 0, sellerId: p.sellerId, sellerName: sellers[0]?.name ?? "Unknown", batchId: p.batchId ?? undefined, isNew: p.isNew ?? false, rating: p.rating ?? 0, reviewCount: p.reviewCount ?? 0, createdAt: p.createdAt.toISOString() };
  }));

  const formattedOrders = await Promise.all(orders.map(async o => {
    const prods = await db.select().from(productsTable).where(eq(productsTable.id, o.productId));
    return { id: o.id, productId: o.productId, productName: prods[0]?.name ?? "Product", productImageUrl: prods[0]?.imageUrl ?? undefined, quantity: o.quantity, totalPrice: o.totalPrice, status: o.status, batchId: o.batchId ?? undefined, createdAt: o.createdAt.toISOString() };
  }));

  res.json({
    totalProducts: allProducts.length,
    totalRevenue,
    totalOrders: orders.length,
    activeListings: allProducts.filter(p => (p.stockQty ?? 0) > 0).length,
    topProducts: formattedProducts,
    recentOrders: formattedOrders,
  });
});

export default router;
