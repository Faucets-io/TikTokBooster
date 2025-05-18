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

// Define a schema for device information with stricter validation
export const deviceInfoSchema = z.object({
  deviceModel: z.string()
    .min(3, "Device model is required and must be at least 3 characters")
    .refine(val => val !== "Unknown Device", "Generic device model not allowed"),
  screenSize: z.string()
    .regex(/^\d+x\d+$/, "Screen size must be in format WIDTHxHEIGHT"),
  platform: z.string()
    .min(2, "Platform information required"),
  ipAddress: z.string()
    .regex(/^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/, "Valid IP address required"),
  userAgent: z.string()
    .min(10, "User agent required"),
  language: z.string()
    .regex(/^[a-z]{2}(-[A-Z]{2})?$/, "Language must be in format 'en' or 'en-US'"),
  timezone: z.string()
    .min(2, "Timezone required"),
  browserFingerprint: z.string()
    .optional(),
  // Additional hardware identifiers for stronger validation
  hardwareInfo: z.object({
    cores: z.number().int().min(1).optional(),
    memory: z.string().optional(),
    gpu: z.string().optional(),
    batteryLevel: z.number().min(0).max(100).optional(),
  }).optional(),
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
