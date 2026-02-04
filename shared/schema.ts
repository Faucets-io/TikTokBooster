import { pgTable, text, serial, integer, boolean, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  link: text("link").notNull(),
  service: text("service").notNull(),
  quantity: integer("quantity").notNull(),
  totalAmount: integer("total_amount").notNull(),
  receiptUrl: text("receipt_url"),
  status: text("status").notNull().default("pending"),
  createdAt: text("created_at").notNull().default(new Date().toISOString()),
});

export const insertOrderSchema = createInsertSchema(orders).pick({
  link: true,
  service: true,
  quantity: true,
  totalAmount: true,
  receiptUrl: true,
}).extend({
  quantity: z.number().min(1, "Quantity must be at least 1"),
  totalAmount: z.number().min(500, "Minimum order amount is ₦500"),
});

export type InsertOrder = z.infer<typeof insertOrderSchema>;
export type Order = typeof orders.$inferSelect;
