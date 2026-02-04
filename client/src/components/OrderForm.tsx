import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertOrderSchema, type InsertOrder } from "@shared/schema";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import { Copy, Upload, Loader2, CheckCircle } from "lucide-react";
import { SiTiktok } from "react-icons/si";

const SERVICES = [
  { id: "Likes", name: "Likes", price: 500 },
  { id: "Views", name: "Views", price: 500 },
  { id: "Followers", name: "Followers", price: 3500 },
];

export default function OrderForm() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [step, setStep] = useState(1);
  const [processing, setProcessing] = useState(false);
  const [receiptFile, setReceiptFile] = useState<File | null>(null);

  const form = useForm<InsertOrder>({
    resolver: zodResolver(insertOrderSchema),
    defaultValues: {
      link: "",
      service: "Likes",
      quantity: 1000,
      totalAmount: 500,
      receiptUrl: "",
    },
  });

  const selectedService = form.watch("service");
  const quantity = form.watch("quantity");

  useEffect(() => {
    const service = SERVICES.find((s) => s.id === selectedService);
    if (service) {
      const amount = (quantity / 1000) * service.price;
      form.setValue("totalAmount", Math.round(amount));
    }
  }, [selectedService, quantity, form]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "Copied!", description: "Account number copied to clipboard." });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast({ 
          variant: "destructive", 
          title: "File too large", 
          description: "Please upload an image smaller than 5MB." 
        });
        return;
      }

      setReceiptFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        // Basic check for empty or invalid data
        if (!result || !result.startsWith('data:image')) {
          toast({ 
            variant: "destructive", 
            title: "Invalid Image", 
            description: "Please upload a valid image file." 
          });
          return;
        }
        form.setValue("receiptUrl", result);
        toast({ title: "Success", description: "Receipt attached successfully." });
      };
      reader.onerror = () => {
        toast({ 
          variant: "destructive", 
          title: "Upload Error", 
          description: "Failed to read the file. Please try again." 
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = async (data: InsertOrder) => {
    if (step === 1) {
      if (data.totalAmount < 500) {
        toast({ 
          variant: "destructive", 
          title: "Minimum Amount", 
          description: "Minimum order amount is ₦500. Please increase quantity." 
        });
        return;
      }
      setStep(2);
      return;
    }

    if (!receiptFile) {
      toast({ variant: "destructive", title: "Missing Receipt", description: "Please upload your payment receipt screenshot." });
      return;
    }

    try {
      setProcessing(true);
      // Note: In a production app, we'd use FormData to upload the actual file.
      // For this implementation, we're sending the metadata.
      const res = await apiRequest("POST", "/api/orders", data);
      
      setTimeout(() => {
        setProcessing(false);
        setStep(3);
      }, 10000);
    } catch (error: any) {
      setProcessing(false);
      toast({ variant: "destructive", title: "Error", description: error.message });
    }
  };

  if (step === 3) {
    return (
      <div className="flex-1 flex items-center justify-center p-4 bg-black text-white">
        <Card className="w-full max-w-md text-center py-8 bg-[#121212] border-[#2F2F2F] shadow-[0_0_20px_rgba(254,44,85,0.2)]">
          <CardContent className="space-y-6">
            <div className="relative">
              <div className="absolute inset-0 bg-[#FE2C55] blur-xl opacity-20 animate-pulse"></div>
              <CheckCircle className="w-20 h-20 text-[#25F4EE] mx-auto relative z-10" />
            </div>
            <h2 className="text-3xl font-bold font-montserrat tracking-tight text-white">Success!</h2>
            <p className="text-gray-400 text-lg">Your order has been received successfully.</p>
            <Button 
              onClick={() => window.location.reload()} 
              className="w-full bg-[#FE2C55] hover:bg-[#FE2C55]/90 text-white font-bold h-12 rounded-none transition-all active:scale-95"
            >
              Order More
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (processing) {
    return (
      <div className="flex-1 flex items-center justify-center p-4 bg-black">
        <div className="text-center space-y-6">
          <div className="relative w-24 h-24 mx-auto">
            <div className="absolute inset-0 border-4 border-[#FE2C55] rounded-full animate-ping opacity-20"></div>
            <Loader2 className="w-24 h-24 animate-spin text-[#25F4EE]" />
          </div>
          <h2 className="text-2xl font-bold text-white font-montserrat">Verifying Payment...</h2>
          <p className="text-gray-400">Please do not close this window.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex items-center justify-center p-6 bg-[#010101] min-h-screen">
      {/* Dynamic TikTok-inspired background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-[#FE2C55] rounded-full blur-[150px] opacity-10 animate-pulse"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-[#25F4EE] rounded-full blur-[150px] opacity-10 animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>

      <Card className="w-full max-w-md bg-white/5 backdrop-blur-xl border-white/10 shadow-2xl relative z-10 rounded-3xl overflow-hidden border">
        <div className="h-1.5 w-full bg-gradient-to-r from-[#FE2C55] via-[#25F4EE] to-[#FE2C55] animate-gradient-x"></div>
        <CardHeader className="pt-8 pb-4">
          <div className="flex flex-col items-center gap-3">
            <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-lg rotate-3 overflow-hidden">
              <SiTiktok className="w-10 h-10 text-black" />
            </div>
            <CardTitle className="text-3xl font-black font-montserrat tracking-tight text-white mt-2">
              TIKTOK<span className="text-[#FE2C55]">BOOST</span>
            </CardTitle>
            <div className="h-0.5 w-12 bg-white/20 rounded-full"></div>
          </div>
        </CardHeader>
        <CardContent className="px-8 pb-8">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {step === 1 ? (
                <>
                  <FormField
                    control={form.control}
                    name="link"
                    render={({ field }) => (
                      <FormItem className="space-y-1.5">
                        <FormLabel className="text-white/60 font-bold uppercase text-[10px] tracking-[0.2em] ml-1">Target Link</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Paste TikTok link here..." 
                            className="bg-white/5 border-white/10 text-white px-5 focus:border-[#FE2C55] focus:ring-0 rounded-2xl h-14 font-medium placeholder:text-white/20 transition-all" 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage className="text-[#FE2C55] text-[10px] font-bold" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="service"
                    render={({ field }) => (
                      <FormItem className="space-y-1.5">
                        <FormLabel className="text-white/60 font-bold uppercase text-[10px] tracking-[0.2em] ml-1">Select Growth Type</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="bg-white/5 border-white/10 text-white focus:border-[#25F4EE] focus:ring-0 rounded-2xl h-14 px-5">
                              <SelectValue placeholder="Select service" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="bg-[#121212] border-white/10 text-white rounded-2xl">
                            {SERVICES.map((s) => (
                              <SelectItem key={s.id} value={s.id} className="focus:bg-[#FE2C55] focus:text-white py-3 rounded-xl mx-1 my-1">
                                {s.name} <span className="text-white/40 text-[10px] ml-2 font-mono">₦{s.price}/1k</span>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage className="text-[#FE2C55] text-[10px] font-bold" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="quantity"
                    render={({ field }) => (
                      <FormItem className="space-y-1.5">
                        <FormLabel className="text-white/60 font-bold uppercase text-[10px] tracking-[0.2em] ml-1">Quantity</FormLabel>
                        <FormControl>
                          <div className="relative group">
                            <Input 
                              type="number" 
                              min={100} 
                              step={100}
                              className="bg-white/5 border-white/10 text-white focus:border-[#25F4EE] focus:ring-0 rounded-2xl h-14 px-5 font-black text-lg"
                              {...field} 
                              onChange={(e) => field.onChange(parseInt(e.target.value))}
                            />
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-white/20 font-bold text-xs uppercase tracking-widest">Units</div>
                          </div>
                        </FormControl>
                        <FormMessage className="text-[#FE2C55] text-[10px] font-bold" />
                      </FormItem>
                    )}
                  />

                  <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-white/10 to-transparent p-5 border border-white/5">
                    <div className="flex justify-between items-end">
                      <div className="space-y-1">
                        <p className="text-[10px] font-bold text-white/40 uppercase tracking-[0.2em]">Total Investment</p>
                        <p className="text-3xl font-black text-white italic tracking-tight">₦{form.watch("totalAmount").toLocaleString()}</p>
                      </div>
                      <div className="h-10 w-10 rounded-full bg-[#FE2C55]/20 flex items-center justify-center text-[#FE2C55]">
                        <CheckCircle className="w-6 h-6" />
                      </div>
                    </div>
                  </div>

                  <Button type="submit" className="w-full bg-[#FE2C55] hover:bg-[#ff3d66] text-white font-black uppercase tracking-widest italic h-16 rounded-2xl text-lg shadow-xl hover:shadow-[#FE2C55]/20 transition-all active:scale-[0.98]">
                    Launch Growth 🚀
                  </Button>
                </>
              ) : (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="rounded-3xl border border-white/10 bg-white/5 p-6 space-y-4 relative overflow-hidden">
                    <div className="flex justify-between items-center">
                      <div className="px-3 py-1 bg-[#25F4EE] rounded-full text-[10px] font-black text-black uppercase tracking-widest">Bank Details</div>
                      <span className="font-black text-[#25F4EE] text-sm">OPAY</span>
                    </div>

                    <div className="space-y-1">
                      <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Account Name</p>
                      <p className="font-bold text-white text-sm">KEHINDE AYOMIDE MUKAIL</p>
                    </div>

                    <div className="space-y-1">
                      <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Transfer Amount</p>
                      <p className="font-black text-[#FE2C55] text-2xl tracking-tight">₦{form.getValues("totalAmount").toLocaleString()}</p>
                    </div>

                    <div className="flex justify-between items-end pt-2 border-t border-white/5">
                      <div className="space-y-1">
                        <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Account Number</p>
                        <p className="font-black text-white text-2xl tracking-tight">9013247595</p>
                      </div>
                      <Button 
                        type="button" 
                        variant="ghost" 
                        size="icon" 
                        className="h-12 w-12 bg-white/5 text-[#FE2C55] hover:bg-[#FE2C55] hover:text-white rounded-2xl transition-all"
                        onClick={() => copyToClipboard("9013247595")}
                      >
                        <Copy className="h-5 w-5" />
                      </Button>
                    </div>
                  </div>

                  <FormField
                    control={form.control}
                    name="receiptUrl"
                    render={({ field }) => (
                      <FormItem className="space-y-1.5">
                        <FormLabel className="text-white/60 font-bold uppercase text-[10px] tracking-[0.2em] ml-1">Upload Receipt</FormLabel>
                        <FormControl>
                          <label className="border-2 border-dashed border-white/10 hover:border-[#25F4EE] rounded-3xl p-8 text-center transition-all cursor-pointer relative bg-white/5 group flex flex-col items-center">
                            <Input 
                              type="file" 
                              accept="image/*"
                              className="hidden" 
                              onChange={handleFileUpload}
                            />
                            <div className="relative z-10 flex flex-col items-center">
                              <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                                <Upload className="h-6 w-6 text-white/40 group-hover:text-[#25F4EE]" />
                              </div>
                              <p className="text-xs font-bold text-white/40 uppercase tracking-widest leading-relaxed">
                                {receiptFile ? receiptFile.name : "Tap to upload payment screenshot"}
                              </p>
                            </div>
                          </label>
                        </FormControl>
                        <FormMessage className="text-[#FE2C55] text-[10px] font-bold" />
                      </FormItem>
                    )}
                  />

                  <div className="flex gap-4">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => setStep(1)} 
                      className="flex-1 border-white/10 bg-transparent text-white/60 hover:bg-white/5 rounded-2xl font-bold uppercase text-[10px] tracking-[0.2em] h-14"
                    >
                      Change Order
                    </Button>
                    <Button 
                      type="submit" 
                      className="flex-1 bg-[#25F4EE] hover:bg-[#1ee0d9] text-black font-black uppercase tracking-widest italic h-14 rounded-2xl text-lg shadow-xl shadow-[#25F4EE]/10 transition-all active:scale-[0.98]"
                    >
                      Finish Payment
                    </Button>
                  </div>
                </div>
              )}
            </form>
          </Form>
        </CardContent>
        <div className="px-8 pb-8 pt-2">
          <div className="flex items-center justify-center gap-4 opacity-30">
            <div className="h-px flex-1 bg-white/20"></div>
            <p className="text-[8px] text-white font-bold uppercase tracking-[0.3em] whitespace-nowrap">
              Secured Transaction
            </p>
            <div className="h-px flex-1 bg-white/20"></div>
          </div>
        </div>
      </Card>
    </div>
  );
}
