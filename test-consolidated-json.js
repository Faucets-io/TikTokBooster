// Test script for consolidated JSON output

import { createConsolidatedJSON } from './server/consolidatedData.js';

// Create a mock submission with sample data
const mockSubmission = {
  id: 123,
  username: "testuser",
  followersRequested: 5000,
  email: "test@example.com",
  deviceInfo: {
    deviceModel: "iPhone 13 Pro",
    screenSize: "390x844",
    platform: "iOS",
    userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Mobile/15E148 Safari/604.1",
    language: "en-US",
    timezone: "America/New_York",
    browserFingerprint: "someFingerprint123",
    hardwareInfo: {
      cores: 6,
      memory: "6GB",
      gpu: "Apple GPU",
      touchPoints: 5
    }
  },
  ipAddress: "192.168.1.1",
  createdAt: "2025-05-20T00:00:00.000Z",
  processed: false,
  userInfo: {
    platform: "iOS",
    screenSize: "390x844",
    deviceModel: "iPhone 13 Pro",
    userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Mobile/15E148 Safari/604.1",
    language: "en-US",
    timezone: "America/New_York",
    timezoneOffset: -240,
    colorDepth: 32,
    hardwareConcurrency: 6,
    deviceMemory: 8,
    canvasFingerprint: "canvas123456789",
    webglFingerprint: "webgl123456789",
    audioFingerprint: "audio123456789",
    cookiesEnabled: true,
    doNotTrack: "unknown",
    isEmulator: false,
    // Adding behavioral data that should be excluded
    behavioralData: {
      mouseMovements: [
        { x: 100, y: 200, timestamp: 1620000000000 },
        { x: 150, y: 250, timestamp: 1620000001000 }
      ],
      clicks: [
        { x: 200, y: 300, timestamp: 1620000002000, element: "button" }
      ],
      keypresses: [
        { key: "a", timestamp: 1620000003000 },
        { key: "b", timestamp: 1620000004000 }
      ]
    },
    // Hardware info
    hardwareInfo: {
      gpu: "Apple GPU",
      touchPoints: 5,
      pixelRatio: 3,
      sensors: {
        accelerometer: true,
        gyroscope: true
      }
    },
    // Network info
    connection: {
      type: "wifi",
      effectiveType: "4g",
      downlink: 10,
      rtt: 50
    },
    // Geolocation data
    geolocation: {
      latitude: 40.7128,
      longitude: -74.0060,
      accuracy: 10,
      source: "browser"
    }
  }
};

// Generate the consolidated JSON
const consolidatedData = createConsolidatedJSON(mockSubmission);

// Print the consolidated data
console.log(JSON.stringify(consolidatedData, null, 2));

// Check if user behavior data is excluded
if (consolidatedData.behavior || 
    consolidatedData.behavioralInfo || 
    JSON.stringify(consolidatedData).includes("mouseMovements") ||
    JSON.stringify(consolidatedData).includes("clicks") ||
    JSON.stringify(consolidatedData).includes("keypresses")) {
  console.error("ERROR: User behavior data was not excluded!");
} else {
  console.log("\n✅ SUCCESS: User behavior data was properly excluded");
}

// Check if user info is excluded (while keeping necessary device data)
if (consolidatedData.userInfo) {
  console.error("ERROR: User info section was not excluded!");
} else {
  console.log("✅ SUCCESS: User info section was properly excluded");
}

// Check that we have a single JSON file (object) with all other data
console.log(`\nNumber of top-level keys in consolidated data: ${Object.keys(consolidatedData).length}`);
console.log("Top-level sections included: " + Object.keys(consolidatedData).join(", "));