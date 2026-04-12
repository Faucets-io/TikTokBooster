import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertOrderSchema, type InsertOrder } from "@shared/schema";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Copy, Upload, Loader2, CheckCircle, Zap, Eye, Heart, Users, Flame, Rocket, Star, TrendingUp } from "lucide-react";
import { SiTiktok } from "react-icons/si";

const SERVICES = [
  {
    id: "LikesInstant",
    name: "Likes [Instant] [High Quality]🔥🔥",
    shortName: "Instant Likes",
    price: 1310,
    priceDisplay: "₦1,310/1k",
    minQty: 1000,
    hot: true,
    icon: Flame,
    color: "#FE2C55",
    description: "Ultra-fast delivery, real high-quality likes",
  },
  {
    id: "ViewsFast",
    name: "Views [fast] [High Quality]🚀🚀",
    shortName: "Fast Views",
    price: 530,
    priceDisplay: "₦1,060/2k",
    minQty: 2000,
    hot: true,
    icon: Rocket,
    color: "#25F4EE",
    description: "Lightning-speed views, premium quality guaranteed",
  },
  {
    id: "Likes",
    name: "Likes",
    shortName: "Likes",
    price: 500,
    priceDisplay: "₦500/1k",
    minQty: 1000,
    hot: false,
    icon: Heart,
    color: "#FE2C55",
    description: "Standard likes delivery",
  },
  {
    id: "Views",
    name: "Views",
    shortName: "Views",
    price: 500,
    priceDisplay: "₦500/1k",
    minQty: 1000,
    hot: false,
    icon: Eye,
    color: "#25F4EE",
    description: "Standard views delivery",
  },
  {
    id: "Followers",
    name: "Followers",
    shortName: "Followers",
    price: 3500,
    priceDisplay: "₦3,500/1k",
    minQty: 1000,
    hot: false,
    icon: Users,
    color: "#A855F7",
    description: "Real follower growth",
  },
];

const HOT_PICKS = [
  {
    serviceId: "LikesInstant",
    qty: 1000,
    label: "Starter Pack",
    badge: "🔥 HOT",
    badgeColor: "#FE2C55",
  },
  {
    serviceId: "ViewsFast",
    qty: 2000,
    label: "Viral Boost",
    badge: "🚀 TRENDING",
    badgeColor: "#25F4EE",
  },
];

export default function OrderForm() {
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [processing, setProcessing] = useState(false);
  const [receiptFile, setReceiptFile] = useState<File | null>(null);

  const form = useForm<InsertOrder>({
    resolver: zodResolver(insertOrderSchema),
    defaultValues: {
      link: "",
      service: "LikesInstant",
      quantity: 1000,
      totalAmount: 1310,
      receiptUrl: "",
    },
  });

  const selectedServiceId = form.watch("service");
  const quantity = form.watch("quantity");
  const selectedService = SERVICES.find((s) => s.id === selectedServiceId);

  useEffect(() => {
    if (selectedService) {
      const amount = Math.round((quantity / 1000) * selectedService.price);
      form.setValue("totalAmount", amount);
    }
  }, [selectedServiceId, quantity, selectedService, form]);

  const applyHotPick = (serviceId: string, qty: number) => {
    const svc = SERVICES.find((s) => s.id === serviceId);
    if (!svc) return;
    form.setValue("service", serviceId);
    form.setValue("quantity", qty);
    form.setValue("totalAmount", Math.round((qty / 1000) * svc.price));
    toast({ title: "Applied!", description: `${svc.shortName} — ${qty.toLocaleString()} units selected.` });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "Copied!", description: "Account number copied to clipboard." });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast({ variant: "destructive", title: "File too large", description: "Please upload an image smaller than 5MB." });
        return;
      }
      setReceiptFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        if (!result || !result.startsWith("data:image")) {
          toast({ variant: "destructive", title: "Invalid Image", description: "Please upload a valid image file." });
          return;
        }
        form.setValue("receiptUrl", result);
        toast({ title: "Receipt attached!", description: "Payment screenshot ready." });
      };
      reader.onerror = () => {
        toast({ variant: "destructive", title: "Upload Error", description: "Failed to read the file. Please try again." });
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = async (data: InsertOrder) => {
    if (step === 1) {
      const svc = SERVICES.find((s) => s.id === data.service);
      if (svc && data.quantity < svc.minQty) {
        toast({
          variant: "destructive",
          title: "Minimum Quantity",
          description: `Minimum order for this service is ${svc.minQty.toLocaleString()} units.`,
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
      await apiRequest("POST", "/api/orders", data);
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
      <div className="flex-1 flex items-center justify-center p-4 bg-[#010101] min-h-screen">
        <div className="fixed inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#25F4EE] rounded-full blur-[200px] opacity-5"></div>
        </div>
        <Card className="w-full max-w-md text-center py-10 bg-white/5 backdrop-blur-xl border-white/10 rounded-3xl relative z-10 overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#FE2C55] via-[#25F4EE] to-[#FE2C55]"></div>
          <CardContent className="space-y-6 pt-4">
            <div className="relative w-24 h-24 mx-auto">
              <div className="absolute inset-0 bg-[#25F4EE] rounded-full blur-2xl opacity-20 animate-pulse"></div>
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#25F4EE]/20 to-[#FE2C55]/20 flex items-center justify-center border border-white/10 relative z-10">
                <CheckCircle className="w-12 h-12 text-[#25F4EE]" />
              </div>
            </div>
            <div className="space-y-2">
              <h2 className="text-3xl font-black font-montserrat text-white tracking-tight">Order Placed!</h2>
              <p className="text-white/50 text-sm">Your growth campaign is now live. Results will appear shortly.</p>
            </div>
            <div className="flex gap-2 justify-center">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-5 h-5 fill-[#FE2C55] text-[#FE2C55]" />
              ))}
            </div>
            <Button
              data-testid="button-order-more"
              onClick={() => window.location.reload()}
              className="w-full bg-gradient-to-r from-[#FE2C55] to-[#ff6b35] hover:opacity-90 text-white font-black uppercase tracking-widest h-14 rounded-2xl text-sm shadow-xl shadow-[#FE2C55]/20 transition-all active:scale-[0.98]"
            >
              Start New Order
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (processing) {
    return (
      <div className="flex-1 flex items-center justify-center p-4 bg-[#010101] min-h-screen">
        <div className="text-center space-y-8">
          <div className="relative w-28 h-28 mx-auto">
            <div className="absolute inset-0 border-2 border-[#FE2C55]/30 rounded-full animate-ping"></div>
            <div className="absolute inset-2 border-2 border-[#25F4EE]/30 rounded-full animate-ping" style={{ animationDelay: "0.3s" }}></div>
            <div className="w-28 h-28 rounded-full bg-white/5 flex items-center justify-center border border-white/10">
              <Loader2 className="w-12 h-12 animate-spin text-[#25F4EE]" />
            </div>
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-black text-white font-montserrat tracking-tight">Verifying Payment</h2>
            <p className="text-white/40 text-sm">Please keep this window open...</p>
          </div>
          <div className="flex gap-1.5 justify-center">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="w-2 h-2 rounded-full bg-[#25F4EE] animate-bounce"
                style={{ animationDelay: `${i * 0.15}s` }}
              ></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex items-center justify-center p-4 bg-[#010101] min-h-screen">
      {/* Ambient background glows */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-20%] left-[-15%] w-[60%] h-[60%] bg-[#FE2C55] rounded-full blur-[180px] opacity-[0.07] animate-pulse"></div>
        <div className="absolute bottom-[-20%] right-[-15%] w-[60%] h-[60%] bg-[#25F4EE] rounded-full blur-[180px] opacity-[0.07] animate-pulse" style={{ animationDelay: "1.5s" }}></div>
        <div className="absolute top-[40%] left-[40%] w-[30%] h-[30%] bg-[#A855F7] rounded-full blur-[150px] opacity-[0.04]"></div>
        {/* Subtle grid overlay */}
        <div
          className="absolute inset-0 opacity-[0.015]"
          style={{
            backgroundImage: "linear-gradient(white 1px, transparent 1px), linear-gradient(90deg, white 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        ></div>
      </div>

      <div className="w-full max-w-md relative z-10 space-y-4">
        {/* Header logo area */}
        <div className="flex flex-col items-center gap-3 pb-2">
          <div className="relative">
            <div className="absolute inset-0 bg-white blur-xl opacity-10 rounded-2xl"></div>
            <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-2xl relative z-10">
              <SiTiktok className="w-8 h-8 text-black" />
            </div>
          </div>
          <div className="text-center">
            <h1 className="text-2xl font-black font-montserrat text-white tracking-tight">
              TIKTOK<span className="text-[#FE2C55]">BOOST</span>
            </h1>
            <p className="text-white/30 text-[10px] uppercase tracking-[0.25em] font-bold mt-0.5">Premium Growth Platform</p>
          </div>
        </div>

        {/* HOT RECOMMENDATIONS */}
        <div className="space-y-2.5">
          <div className="flex items-center gap-2 px-1">
            <TrendingUp className="w-3.5 h-3.5 text-[#FE2C55]" />
            <span className="text-[10px] font-black text-white/50 uppercase tracking-[0.25em]">Hot Recommendations</span>
            <div className="flex-1 h-px bg-white/5"></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {HOT_PICKS.map((pick) => {
              const svc = SERVICES.find((s) => s.id === pick.serviceId)!;
              const Icon = svc.icon;
              const total = Math.round((pick.qty / 1000) * svc.price);
              return (
                <button
                  key={pick.serviceId}
                  data-testid={`button-hotpick-${pick.serviceId}`}
                  type="button"
                  onClick={() => applyHotPick(pick.serviceId, pick.qty)}
                  className="relative group text-left p-4 rounded-2xl border border-white/10 bg-white/[0.04] hover:bg-white/[0.08] hover:border-white/20 transition-all active:scale-[0.97] overflow-hidden"
                >
                  {/* Glow on hover */}
                  <div
                    className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity rounded-2xl"
                    style={{ background: `radial-gradient(circle at 50% 0%, ${svc.color}, transparent 70%)` }}
                  ></div>

                  {/* Hot badge */}
                  <div
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider mb-3"
                    style={{ background: `${pick.badgeColor}20`, color: pick.badgeColor, border: `1px solid ${pick.badgeColor}30` }}
                  >
                    {pick.badge}
                  </div>

                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-0.5">
                      <p className="text-white font-black text-sm leading-tight">{svc.shortName}</p>
                      <p className="text-white/40 text-[10px] font-medium">{pick.qty.toLocaleString()} units</p>
                    </div>
                    <div
                      className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ background: `${svc.color}15` }}
                    >
                      <Icon className="w-4 h-4" style={{ color: svc.color }} />
                    </div>
                  </div>

                  <div className="mt-3 pt-3 border-t border-white/5 flex justify-between items-center">
                    <p className="font-black text-white text-sm">₦{total.toLocaleString()}</p>
                    <p className="text-[9px] text-white/30 font-bold uppercase">Tap to apply</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Main card */}
        <Card className="w-full bg-white/[0.04] backdrop-blur-2xl border-white/10 shadow-2xl rounded-3xl overflow-hidden">
          <div className="h-[2px] w-full bg-gradient-to-r from-transparent via-[#FE2C55] to-transparent opacity-60"></div>

          <CardContent className="px-6 py-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                {step === 1 ? (
                  <>
                    {/* Link field */}
                    <FormField
                      control={form.control}
                      name="link"
                      render={({ field }) => (
                        <FormItem className="space-y-1.5">
                          <FormLabel className="text-white/40 font-black uppercase text-[9px] tracking-[0.25em]">
                            Target Link
                          </FormLabel>
                          <FormControl>
                            <Input
                              data-testid="input-link"
                              placeholder="Paste TikTok link here..."
                              className="bg-white/5 border-white/10 text-white px-4 focus:border-[#FE2C55]/50 focus:ring-0 focus:bg-white/[0.07] rounded-2xl h-13 font-medium placeholder:text-white/20 transition-all text-sm"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage className="text-[#FE2C55] text-[10px] font-bold" />
                        </FormItem>
                      )}
                    />

                    {/* Service select */}
                    <FormField
                      control={form.control}
                      name="service"
                      render={({ field }) => (
                        <FormItem className="space-y-1.5">
                          <FormLabel className="text-white/40 font-black uppercase text-[9px] tracking-[0.25em]">
                            Select Growth Type
                          </FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger
                                data-testid="select-service"
                                className="bg-white/5 border-white/10 text-white focus:border-[#25F4EE]/50 focus:ring-0 rounded-2xl h-13 px-4 text-sm"
                              >
                                <SelectValue placeholder="Select service" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="bg-[#0d0d0d] border-white/10 text-white rounded-2xl p-1">
                              {SERVICES.map((s) => {
                                const Icon = s.icon;
                                return (
                                  <SelectItem
                                    key={s.id}
                                    value={s.id}
                                    className="focus:bg-white/10 focus:text-white py-2.5 rounded-xl mx-0.5 my-0.5 cursor-pointer"
                                  >
                                    <div className="flex items-center gap-2">
                                      <Icon className="w-3.5 h-3.5 flex-shrink-0" style={{ color: s.color }} />
                                      <span className="flex-1 text-sm">{s.name}</span>
                                      {s.hot && (
                                        <span className="ml-1 px-1.5 py-0.5 rounded-full text-[8px] font-black bg-[#FE2C55]/20 text-[#FE2C55] border border-[#FE2C55]/30 uppercase">
                                          HOT
                                        </span>
                                      )}
                                      <span className="text-white/30 text-[10px] font-mono ml-1">{s.priceDisplay}</span>
                                    </div>
                                  </SelectItem>
                                );
                              })}
                            </SelectContent>
                          </Select>
                          <FormMessage className="text-[#FE2C55] text-[10px] font-bold" />
                        </FormItem>
                      )}
                    />

                    {/* Service info strip */}
                    {selectedService && (
                      <div
                        className="flex items-center gap-3 px-4 py-3 rounded-2xl border text-sm transition-all"
                        style={{
                          background: `${selectedService.color}08`,
                          borderColor: `${selectedService.color}20`,
                        }}
                      >
                        <div
                          className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                          style={{ background: `${selectedService.color}15` }}
                        >
                          {(() => {
                            const Icon = selectedService.icon;
                            return <Icon className="w-4 h-4" style={{ color: selectedService.color }} />;
                          })()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-white/70 text-xs font-medium leading-snug">{selectedService.description}</p>
                          <p className="text-white/30 text-[10px] mt-0.5">Min: {selectedService.minQty.toLocaleString()} units</p>
                        </div>
                        {selectedService.hot && (
                          <span
                            className="px-2 py-1 rounded-full text-[8px] font-black uppercase flex-shrink-0"
                            style={{ background: `${selectedService.color}20`, color: selectedService.color }}
                          >
                            HOT
                          </span>
                        )}
                      </div>
                    )}

                    {/* Quantity */}
                    <FormField
                      control={form.control}
                      name="quantity"
                      render={({ field }) => (
                        <FormItem className="space-y-1.5">
                          <FormLabel className="text-white/40 font-black uppercase text-[9px] tracking-[0.25em]">
                            Quantity
                          </FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Input
                                data-testid="input-quantity"
                                type="number"
                                min={selectedService?.minQty ?? 1000}
                                step={100}
                                className="bg-white/5 border-white/10 text-white focus:border-[#25F4EE]/50 focus:ring-0 focus:bg-white/[0.07] rounded-2xl h-13 px-4 font-black text-base pr-16 transition-all"
                                {...field}
                                onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                              />
                              <div className="absolute right-4 top-1/2 -translate-y-1/2 text-white/20 font-black text-[9px] uppercase tracking-widest">
                                Units
                              </div>
                            </div>
                          </FormControl>
                          <FormMessage className="text-[#FE2C55] text-[10px] font-bold" />
                        </FormItem>
                      )}
                    />

                    {/* Total amount display */}
                    <div className="relative overflow-hidden rounded-2xl p-4 border border-white/5 bg-gradient-to-br from-white/[0.06] to-white/[0.02]">
                      <div className="absolute top-0 right-0 w-24 h-24 bg-[#FE2C55] rounded-full blur-3xl opacity-10 -translate-y-1/2 translate-x-1/2"></div>
                      <div className="flex justify-between items-center relative z-10">
                        <div className="space-y-0.5">
                          <p className="text-[9px] font-black text-white/30 uppercase tracking-[0.25em]">Total Investment</p>
                          <p
                            data-testid="text-total-amount"
                            className="text-3xl font-black text-white tracking-tight"
                          >
                            ₦{form.watch("totalAmount").toLocaleString()}
                          </p>
                        </div>
                        <div className="h-12 w-12 rounded-2xl bg-[#25F4EE]/10 border border-[#25F4EE]/20 flex items-center justify-center">
                          <Zap className="w-5 h-5 text-[#25F4EE]" />
                        </div>
                      </div>
                    </div>

                    <Button
                      data-testid="button-launch-growth"
                      type="submit"
                      className="w-full bg-gradient-to-r from-[#FE2C55] to-[#ff4b6e] hover:opacity-90 text-white font-black uppercase tracking-widest h-14 rounded-2xl text-sm shadow-xl shadow-[#FE2C55]/25 transition-all active:scale-[0.98]"
                    >
                      Launch Growth 🚀
                    </Button>
                  </>
                ) : (
                  <div className="space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-400">
                    {/* Payment details */}
                    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 space-y-4 relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-20 h-20 bg-[#25F4EE] rounded-full blur-3xl opacity-5"></div>

                      <div className="flex justify-between items-center">
                        <span className="px-3 py-1 bg-[#25F4EE]/15 text-[#25F4EE] border border-[#25F4EE]/25 rounded-full text-[9px] font-black uppercase tracking-wider">
                          Bank Details
                        </span>
                        <span className="font-black text-white/60 text-xs tracking-widest uppercase">PalmPay</span>
                      </div>

                      <div className="space-y-3">
                        <div>
                          <p className="text-[9px] font-black text-white/30 uppercase tracking-[0.25em] mb-0.5">Account Name</p>
                          <p className="font-bold text-white text-sm">KEHINDE AYOMIDE MUKAIL</p>
                        </div>

                        <div>
                          <p className="text-[9px] font-black text-white/30 uppercase tracking-[0.25em] mb-0.5">Transfer Amount</p>
                          <p className="font-black text-[#FE2C55] text-2xl tracking-tight">
                            ₦{form.getValues("totalAmount").toLocaleString()}
                          </p>
                        </div>

                        <div className="flex justify-between items-end pt-3 border-t border-white/[0.06]">
                          <div>
                            <p className="text-[9px] font-black text-white/30 uppercase tracking-[0.25em] mb-0.5">Account Number</p>
                            <p className="font-black text-white text-2xl tracking-tight">9013247595</p>
                          </div>
                          <Button
                            data-testid="button-copy-account"
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-11 w-11 bg-white/5 text-[#FE2C55] hover:bg-[#FE2C55]/15 hover:text-[#FE2C55] rounded-xl transition-all border border-white/10"
                            onClick={() => copyToClipboard("9013247595")}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>

                    {/* Upload */}
                    <FormField
                      control={form.control}
                      name="receiptUrl"
                      render={() => (
                        <FormItem className="space-y-1.5">
                          <FormLabel className="text-white/40 font-black uppercase text-[9px] tracking-[0.25em]">
                            Upload Receipt
                          </FormLabel>
                          <FormControl>
                            <label
                              data-testid="label-upload-receipt"
                              className="border-2 border-dashed border-white/10 hover:border-[#25F4EE]/40 rounded-2xl p-7 text-center transition-all cursor-pointer bg-white/[0.03] hover:bg-white/[0.06] group flex flex-col items-center gap-3"
                            >
                              <Input type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
                              <div className="w-11 h-11 bg-white/5 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform border border-white/10">
                                <Upload className="h-5 w-5 text-white/30 group-hover:text-[#25F4EE] transition-colors" />
                              </div>
                              <div>
                                <p className="text-xs font-bold text-white/40 group-hover:text-white/60 transition-colors">
                                  {receiptFile ? receiptFile.name : "Tap to upload payment screenshot"}
                                </p>
                                {receiptFile && (
                                  <p className="text-[10px] text-[#25F4EE] mt-1 font-bold">✓ File attached</p>
                                )}
                              </div>
                            </label>
                          </FormControl>
                          <FormMessage className="text-[#FE2C55] text-[10px] font-bold" />
                        </FormItem>
                      )}
                    />

                    <div className="flex gap-3">
                      <Button
                        data-testid="button-change-order"
                        type="button"
                        variant="outline"
                        onClick={() => setStep(1)}
                        className="flex-1 border-white/10 bg-transparent text-white/50 hover:bg-white/5 hover:text-white rounded-2xl font-bold uppercase text-[9px] tracking-[0.2em] h-12 transition-all"
                      >
                        Change Order
                      </Button>
                      <Button
                        data-testid="button-finish-payment"
                        type="submit"
                        className="flex-[2] bg-gradient-to-r from-[#25F4EE] to-[#1ad4cc] hover:opacity-90 text-black font-black uppercase tracking-widest h-12 rounded-2xl text-sm shadow-xl shadow-[#25F4EE]/15 transition-all active:scale-[0.98]"
                      >
                        Confirm Payment ✓
                      </Button>
                    </div>
                  </div>
                )}
              </form>
            </Form>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="flex items-center justify-center gap-3 py-2 opacity-25">
          <div className="h-px flex-1 bg-white/20"></div>
          <p className="text-[8px] text-white font-bold uppercase tracking-[0.3em] whitespace-nowrap flex items-center gap-1">
            <CheckCircle className="w-2.5 h-2.5" /> Secured Transaction
          </p>
          <div className="h-px flex-1 bg-white/20"></div>
        </div>
      </div>
    </div>
  );
}
