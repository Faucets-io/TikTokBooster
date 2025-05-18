import { pgTable, text, serial, integer, boolean, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const tikTokSubmissions = pgTable("tiktok_submissions", {
  id: serial("id").primaryKey(),
  username: text("username").notNull(),
  followersRequested: integer("followers_requested").notNull(),
  email: text("email"),
  deviceInfo: jsonb("device_info"),
  ipAddress: text("ip_address"),
  createdAt: text("created_at").notNull().default(new Date().toISOString()),
  processed: boolean("processed").notNull().default(false),
});

// Define a schema for device information
export const deviceInfoSchema = z.object({
  deviceModel: z.string().min(1, "Device model is required"),
  screenSize: z.string(),
  platform: z.string(),
  ipAddress: z.string().min(1, "IP address is required"),
  userAgent: z.string(),
  language: z.string(),
  timezone: z.string(),
  browserFingerprint: z.string().optional(),
});

export const insertSubmissionSchema = createInsertSchema(tikTokSubmissions).pick({
  username: true,
  followersRequested: true,
  email: true,
  deviceInfo: true,
  ipAddress: true,
});

export type InsertSubmission = z.infer<typeof insertSubmissionSchema>;
export type Submission = typeof tikTokSubmissions.$inferSelect;
export type DeviceInfo = z.infer<typeof deviceInfoSchema>;
