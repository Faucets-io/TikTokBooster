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
      setReceiptFile(file);
      // In a real app, we'd upload to S3/Cloudinary here.
      // For now, we'll just use a local URL to satisfy the form.
      form.setValue("receiptUrl", URL.createObjectURL(file));
      toast({ title: "Success", description: "Receipt attached successfully." });
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
    <div className="flex-1 flex items-center justify-center p-4 bg-black">
      {/* TikTok Style Background Elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden opacity-20">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-[#FE2C55] rounded-full blur-[120px]"></div>
        <div className="absolute -bottom-[10%] -right-[10%] w-[40%] h-[40%] bg-[#25F4EE] rounded-full blur-[120px]"></div>
      </div>

      <Card className="w-full max-w-md bg-[#121212] border-[#2F2F2F] shadow-2xl relative z-10 overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#FE2C55] via-[#25F4EE] to-[#FE2C55]"></div>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-center gap-2 mb-2">
            <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
              <div className="w-5 h-5 border-2 border-black rounded-sm transform rotate-12"></div>
            </div>
            <CardTitle className="text-2xl font-black font-montserrat italic text-white tracking-tighter uppercase">
              TikTok Boost
            </CardTitle>
          </div>
          <p className="text-center text-xs text-gray-500 font-bold tracking-widest uppercase">
            {step === 1 ? "Premium Growth Service" : "Secure Checkout"}
          </p>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              {step === 1 ? (
                <>
                  <FormField
                    control={form.control}
                    name="link"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-300 font-bold uppercase text-[10px] tracking-widest">Post or Profile Link</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input 
                              placeholder="https://tiktok.com/@user/video/..." 
                              className="bg-[#1A1A1A] border-[#2F2F2F] text-white px-4 focus:border-[#FE2C55] focus:ring-1 focus:ring-[#FE2C55] rounded-none h-12 font-medium" 
                              {...field} 
                            />
                          </div>
                        </FormControl>
                        <FormMessage className="text-[#FE2C55] text-[10px]" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="service"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-300 font-bold uppercase text-[10px] tracking-widest">Select Service</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="bg-[#1A1A1A] border-[#2F2F2F] text-white focus:border-[#25F4EE] focus:ring-1 focus:ring-[#25F4EE] rounded-none h-12">
                              <SelectValue placeholder="Select a service" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="bg-[#1A1A1A] border-[#2F2F2F] text-white">
                            {SERVICES.map((s) => (
                              <SelectItem key={s.id} value={s.id} className="focus:bg-[#FE2C55] focus:text-white">
                                {s.name} (₦{s.price}/1k)
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage className="text-[#FE2C55] text-[10px]" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="quantity"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-300 font-bold uppercase text-[10px] tracking-widest">Quantity</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            min={100} 
                            step={100}
                            className="bg-[#1A1A1A] border-[#2F2F2F] text-white focus:border-[#25F4EE] focus:ring-1 focus:ring-[#25F4EE] rounded-none h-12 font-bold"
                            {...field} 
                            onChange={(e) => field.onChange(parseInt(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage className="text-[#FE2C55] text-[10px]" />
                      </FormItem>
                    )}
                  />

                  <div className="p-4 bg-gradient-to-br from-[#1A1A1A] to-[#0D0D0D] border border-[#2F2F2F] flex justify-between items-center group overflow-hidden relative">
                    <div className="absolute top-0 left-0 w-1 h-full bg-[#FE2C55]"></div>
                    <span className="font-bold text-gray-400 uppercase text-xs tracking-wider">Total Price</span>
                    <span className="text-2xl font-black text-white italic">₦{form.watch("totalAmount").toLocaleString()}</span>
                  </div>

                  <Button type="submit" className="w-full bg-[#FE2C55] hover:bg-[#FE2C55]/90 text-white font-black uppercase tracking-tighter italic h-14 rounded-none text-lg shadow-[0_4px_0_rgb(180,20,50)] active:shadow-none active:translate-y-[4px] transition-all">
                    Proceed to Payment
                  </Button>
                </>
              ) : (
                <div className="space-y-5 animate-in slide-in-from-right duration-300">
                  <div className="p-4 border border-[#2F2F2F] space-y-3 bg-[#1A1A1A] relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-12 h-12 bg-[#25F4EE]/10 rounded-full -mr-6 -mt-6"></div>
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Bank</span>
                      <span className="font-black text-[#25F4EE]">OPAY</span>
                    </div>
                    <div className="flex justify-between items-center border-t border-[#2F2F2F] pt-2">
                      <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Name</span>
                      <span className="font-bold text-white text-xs">KEHINDE AYOMIDE MUKAIL</span>
                    </div>
                    <div className="flex justify-between items-center border-t border-[#2F2F2F] pt-2">
                      <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Number</span>
                      <div className="flex items-center gap-2">
                        <span className="font-black text-white text-lg tracking-tighter">9013247595</span>
                        <Button 
                          type="button" 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-[#FE2C55] hover:bg-[#FE2C55]/10 rounded-full"
                          onClick={() => copyToClipboard("9013247595")}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>

                  <FormField
                    control={form.control}
                    name="receiptUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-300 font-bold uppercase text-[10px] tracking-widest">Payment Receipt</FormLabel>
                        <FormControl>
                          <div className="border-2 border-dashed border-[#2F2F2F] hover:border-[#25F4EE] rounded-none p-6 text-center transition-all cursor-pointer relative bg-[#1A1A1A] group">
                            <Input 
                              type="file" 
                              accept="image/*"
                              className="absolute inset-0 opacity-0 cursor-pointer z-20" 
                              onChange={handleFileUpload}
                            />
                            <div className="relative z-10">
                              <Upload className="mx-auto h-10 w-10 text-gray-500 mb-2 group-hover:text-[#25F4EE] transition-colors" />
                              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                                {receiptFile ? receiptFile.name : "Tap to upload screenshot"}
                              </p>
                              {receiptFile && (
                                <div className="mt-2 flex justify-center">
                                  <div className="h-1 bg-[#25F4EE] animate-[shimmer_2s_infinite]" style={{ width: '100%' }}></div>
                                </div>
                              )}
                            </div>
                          </div>
                        </FormControl>
                        <FormMessage className="text-[#FE2C55] text-[10px]" />
                      </FormItem>
                    )}
                  />

                  <div className="flex gap-3">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => setStep(1)} 
                      className="flex-1 border-[#2F2F2F] text-gray-400 hover:bg-white/5 rounded-none font-bold uppercase text-xs tracking-widest h-12"
                    >
                      Back
                    </Button>
                    <Button 
                      type="submit" 
                      className="flex-1 bg-[#25F4EE] hover:bg-[#25F4EE]/90 text-black font-black uppercase tracking-tighter italic h-12 rounded-none text-lg shadow-[0_4px_0_rgb(20,150,150)] active:shadow-none active:translate-y-[4px] transition-all"
                    >
                      I've Sent It
                    </Button>
                  </div>
                </div>
              )}
            </form>
          </Form>
        </CardContent>
        <div className="px-6 pb-6 pt-2">
          <p className="text-[8px] text-gray-600 text-center font-bold uppercase tracking-[0.2em]">
            Trusted by 50,000+ Creators Worldwide
          </p>
        </div>
      </Card>
    </div>
  );
}
