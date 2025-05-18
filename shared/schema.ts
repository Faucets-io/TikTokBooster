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
  // Enhanced browser fingerprint field storing the comprehensive data
  browserFingerprint: z.string()
    .optional(),
  // Hardware information with expanded properties
  hardwareInfo: z.object({
    cores: z.number().int().min(1).optional(),
    memory: z.string().optional(),
    gpu: z.string().optional(),
    gpuVendor: z.string().optional(),
    touchPoints: z.number().int().min(0).optional(),
    pixelRatio: z.number().min(0).optional(),
    batteryLevel: z.number().min(0).max(100).optional(),
    processors: z.array(z.string()).optional(),
    isWebGL2: z.boolean().optional(),
    maxTextureSize: z.number().optional(),
    extensionCount: z.number().optional(),
    contextLost: z.boolean().optional(),
    graphicsTier: z.string().optional(),
  }).optional(),
  // Detailed fingerprinting data storage
  fingerprintData: z.object({
    canvas: z.string().optional(),
    webgl: z.string().optional(),
    audio: z.string().optional(),
    fonts: z.array(z.string()).optional(),
    mimeTypes: z.array(z.string()).optional(),
    performanceTiming: z.record(z.number()).optional(),
    renderFingerprint: z.array(z.number()).optional(),
    webrtcFingerprint: z.string().optional(),
    cssFingerprint: z.string().optional(),
  }).optional(),
  // Network information 
  networkInfo: z.object({
    downlink: z.string().or(z.number()).optional(),
    effectiveType: z.string().optional(),
    rtt: z.string().or(z.number()).optional(),
    saveData: z.boolean().optional(),
    networkType: z.string().optional(),
    ipVersion: z.string().optional(),
    ipAddressType: z.string().optional(),
    isp: z.string().optional(),
    asn: z.string().optional(),
  }).optional(),
  // Device capabilities
  deviceCapabilities: z.object({
    vibration: z.boolean().optional(),
    orientation: z.boolean().optional(),
    touchscreen: z.boolean().optional(),
    cookiesEnabled: z.boolean().optional(),
    localStorage: z.boolean().optional(),
    sessionStorage: z.boolean().optional(),
    indexedDB: z.boolean().optional(),
    serviceWorker: z.boolean().optional(),
    webRTC: z.boolean().optional(),
    webSocket: z.boolean().optional(),
    geolocation: z.boolean().optional(),
    sensors: z.record(z.boolean()).optional(),
  }).optional(),
  // Device security and integrity checks
  securityChecks: z.object({
    isEmulator: z.boolean().optional(),
    isVirtual: z.boolean().optional(),
    isProxy: z.boolean().optional(),
    isTor: z.boolean().optional(),
    isVpn: z.boolean().optional(),
    emulatorDetails: z.record(z.any()).optional(),
    tamperingDetected: z.boolean().optional(),
    automationDetected: z.boolean().optional(),
    debuggerAttached: z.boolean().optional(),
    jailbreakDetected: z.boolean().optional(),
    rootDetected: z.boolean().optional(),
    integrityScore: z.number().min(0).max(100).optional(),
  }).optional(),
  // Behavioral data
  behavioralData: z.object({
    screenOrientationChanges: z.number().optional(),
    touchBehavior: z.record(z.any()).optional(),
    navigationTiming: z.record(z.any()).optional(),
    interactionPatterns: z.array(z.any()).optional(),
    deviceMotion: z.record(z.any()).optional(),
  }).optional(),
  // Metadata and collection info
  metaData: z.object({
    collectionTimestamp: z.string().optional(),
    sessionDuration: z.number().optional(),
    timezoneOffset: z.number().optional(),
    languages: z.array(z.string()).optional(),
    colorDepth: z.number().optional(),
    doNotTrack: z.string().optional(),
    plugins: z.array(z.string()).optional(),
    platformArchitecture: z.string().optional(),
    platformVersion: z.string().optional(),
    deviceType: z.string().optional(),
    hardwareAccelerated: z.boolean().optional(),
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
