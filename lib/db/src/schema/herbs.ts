import { pgTable, serial, text, real, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const herbsTable = pgTable("herbs", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  botanicalName: text("botanical_name").notNull(),
  region: text("region").notNull(),
  latitude: real("latitude").notNull(),
  longitude: real("longitude").notNull(),
  imageUrl: text("image_url"),
  benefits: text("benefits").array(),
  uses: text("uses"),
  harvestSeason: text("harvest_season"),
  currentStock: integer("current_stock").default(0),
  pricePerKg: real("price_per_kg"),
  trendScore: integer("trend_score").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertHerbSchema = createInsertSchema(herbsTable).omit({ id: true, createdAt: true });
export type InsertHerb = z.infer<typeof insertHerbSchema>;
export type Herb = typeof herbsTable.$inferSelect;
