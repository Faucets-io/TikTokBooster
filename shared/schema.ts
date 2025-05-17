import { pgTable, text, serial, integer, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const tikTokSubmissions = pgTable("tiktok_submissions", {
  id: serial("id").primaryKey(),
  username: text("username").notNull(),
  followersRequested: integer("followers_requested").notNull(),
  email: text("email"),
  createdAt: text("created_at").notNull().default(new Date().toISOString()),
  processed: boolean("processed").notNull().default(false),
});

export const insertSubmissionSchema = createInsertSchema(tikTokSubmissions).pick({
  username: true,
  followersRequested: true,
  email: true,
});

export type InsertSubmission = z.infer<typeof insertSubmissionSchema>;
export type Submission = typeof tikTokSubmissions.$inferSelect;
