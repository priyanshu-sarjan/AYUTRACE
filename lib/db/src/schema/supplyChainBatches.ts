import { pgTable, serial, text, real, boolean, timestamp, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const supplyChainBatchesTable = pgTable("supply_chain_batches", {
  id: serial("id").primaryKey(),
  batchId: text("batch_id").notNull().unique(),
  herbId: integer("herb_id"),
  herbName: text("herb_name").notNull(),
  currentStage: text("current_stage").notNull().default("farm"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const supplyChainStepsTable = pgTable("supply_chain_steps", {
  id: serial("id").primaryKey(),
  batchId: text("batch_id").notNull(),
  stage: text("stage").notNull(),
  location: text("location").notNull(),
  latitude: real("latitude"),
  longitude: real("longitude"),
  notes: text("notes"),
  verified: boolean("verified").default(false),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
});

export const insertBatchSchema = createInsertSchema(supplyChainBatchesTable).omit({ id: true, createdAt: true });
export type InsertBatch = z.infer<typeof insertBatchSchema>;
export type Batch = typeof supplyChainBatchesTable.$inferSelect;

export const insertStepSchema = createInsertSchema(supplyChainStepsTable).omit({ id: true });
export type InsertStep = z.infer<typeof insertStepSchema>;
export type SupplyChainStep = typeof supplyChainStepsTable.$inferSelect;
