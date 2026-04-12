import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertOrderSchema, type InsertOrder } from "@shared/schema";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Copy, Upload, Loader2, CheckCircle, AlertTriangle, Flame, Rocket, Heart, Eye, Users, ChevronRight } from "lucide-react";
import { SiTiktok } from "react-icons/si";

const SERVICES = [
  {
    id: "LikesInstant",
    label: "Likes — Instant · High Quality 🔥",
    shortLabel: "Instant Likes",
    price: 1310,
    priceLabel: "₦1,310 / 1,000 likes",
    minQty: 1000,
    hot: true,
    icon: Flame,
    accentColor: "#FE2C55",
  },
  {
    id: "ViewsFast",
    label: "Views — Fast · High Quality 🚀",
    shortLabel: "Fast Views",
    price: 530,
    priceLabel: "₦1,060 / 2,000 views",
    minQty: 2000,
    hot: true,
    icon: Rocket,
    accentColor: "#25F4EE",
  },
  {
    id: "Likes",
    label: "Likes — Standard",
    shortLabel: "Standard Likes",
    price: 500,
    priceLabel: "₦500 / 1,000 likes",
    minQty: 1000,
    hot: false,
    icon: Heart,
    accentColor: "#FE2C55",
  },
  {
    id: "Views",
    label: "Views — Standard",
    shortLabel: "Standard Views",
    price: 500,
    priceLabel: "₦500 / 1,000 views",
    minQty: 1000,
    hot: false,
    icon: Eye,
    accentColor: "#25F4EE",
  },
  {
    id: "Followers",
    label: "Followers",
    shortLabel: "Followers",
    price: 3500,
    priceLabel: "₦3,500 / 1,000 followers",
    minQty: 1000,
    hot: false,
    icon: Users,
    accentColor: "#A855F7",
  },
];

const BANK = {
  name: "KEHINDE AYOMIDE MUKAIL",
  number: "9013247595",
  bank: "PalmPay",
};

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
  const selectedService = SERVICES.find((s) => s.id === selectedServiceId)!;

  useEffect(() => {
    if (selectedService) {
      const amount = Math.round((quantity / 1000) * selectedService.price);
      form.setValue("totalAmount", amount);
    }
  }, [selectedServiceId, quantity]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "Copied to clipboard" });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast({ variant: "destructive", title: "File too large", description: "Maximum size is 5 MB." });
      return;
    }
    setReceiptFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      if (!result?.startsWith("data:image")) {
        toast({ variant: "destructive", title: "Invalid file", description: "Please upload a valid image." });
        return;
      }
      form.setValue("receiptUrl", result);
    };
    reader.onerror = () =>
      toast({ variant: "destructive", title: "Upload failed", description: "Could not read the file. Please try again." });
    reader.readAsDataURL(file);
  };

  const onSubmit = async (data: InsertOrder) => {
    if (step === 1) {
      if (data.quantity < selectedService.minQty) {
        toast({
          variant: "destructive",
          title: "Quantity too low",
          description: `Minimum order for this service is ${selectedService.minQty.toLocaleString()} units.`,
        });
        return;
      }
      setStep(2);
      return;
    }
    if (!receiptFile) {
      toast({ variant: "destructive", title: "Receipt required", description: "Please attach your payment receipt before submitting." });
      return;
    }
    try {
      setProcessing(true);
      await apiRequest("POST", "/api/orders", data);
      setTimeout(() => { setProcessing(false); setStep(3); }, 10000);
    } catch (error: any) {
      setProcessing(false);
      toast({ variant: "destructive", title: "Submission failed", description: error.message });
    }
  };

  /* ── Processing screen ── */
  if (processing) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-screen bg-[#050505]">
        <div className="text-center space-y-6 px-6">
          <div className="relative w-20 h-20 mx-auto">
            <div className="absolute inset-0 rounded-full border-2 border-[#FE2C55]/30 animate-ping" />
            <div className="w-20 h-20 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
              <Loader2 className="w-9 h-9 animate-spin text-[#25F4EE]" />
            </div>
          </div>
          <div>
            <p className="text-white font-bold text-lg">Verifying your payment…</p>
            <p className="text-white/40 text-sm mt-1">Please keep this window open. This may take a moment.</p>
          </div>
        </div>
      </div>
    );
  }

  /* ── Success screen ── */
  if (step === 3) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-screen bg-[#050505] px-4">
        <div className="w-full max-w-sm text-center space-y-6">
          <div className="w-20 h-20 rounded-full bg-[#25F4EE]/10 border border-[#25F4EE]/20 flex items-center justify-center mx-auto">
            <CheckCircle className="w-10 h-10 text-[#25F4EE]" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-white">Order Received</h2>
            <p className="text-white/50 text-sm mt-2 leading-relaxed">
              Your order has been submitted successfully. Growth will begin once payment is confirmed.
            </p>
          </div>
          <Button
            data-testid="button-new-order"
            onClick={() => window.location.reload()}
            className="w-full bg-[#FE2C55] hover:bg-[#e02449] text-white font-bold h-12 rounded-xl transition-all"
          >
            Place Another Order
          </Button>
        </div>
      </div>
    );
  }

  /* ── Main form ── */
  return (
    <div className="min-h-screen bg-[#050505] flex flex-col items-center px-4 py-8">
      {/* Subtle background glows */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-[#FE2C55] rounded-full blur-[160px] opacity-[0.06]" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-[#25F4EE] rounded-full blur-[160px] opacity-[0.06]" />
      </div>

      <div className="w-full max-w-md relative z-10 space-y-6">

        {/* Brand header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center">
              <SiTiktok className="w-6 h-6 text-black" />
            </div>
            <div>
              <p className="text-white font-black text-base tracking-tight leading-none">
                TIKTOK<span className="text-[#FE2C55]">BOOST</span>
              </p>
              <p className="text-white/30 text-[10px] uppercase tracking-widest mt-0.5">Premium Growth</p>
            </div>
          </div>
          {/* Step indicator */}
          <div className="flex items-center gap-1.5">
            <div className={`h-1.5 w-8 rounded-full transition-all ${step >= 1 ? "bg-[#FE2C55]" : "bg-white/10"}`} />
            <div className={`h-1.5 w-8 rounded-full transition-all ${step >= 2 ? "bg-[#25F4EE]" : "bg-white/10"}`} />
          </div>
        </div>

        {step === 1 && (
          <>
            {/* Hot Recommendations */}
            <div>
              <p className="text-white/40 text-[10px] font-bold uppercase tracking-[0.2em] mb-3">
                🔥 Recommended Services
              </p>
              <div className="grid grid-cols-2 gap-3">
                {SERVICES.filter((s) => s.hot).map((svc) => {
                  const Icon = svc.icon;
                  const isSelected = selectedServiceId === svc.id;
                  return (
                    <button
                      key={svc.id}
                      data-testid={`button-recommend-${svc.id}`}
                      type="button"
                      onClick={() => {
                        form.setValue("service", svc.id);
                        form.setValue("quantity", svc.minQty);
                        form.setValue("totalAmount", Math.round((svc.minQty / 1000) * svc.price));
                      }}
                      className={`text-left p-4 rounded-2xl border transition-all active:scale-[0.97] ${
                        isSelected
                          ? "border-white/30 bg-white/10"
                          : "border-white/8 bg-white/[0.03] hover:bg-white/[0.06] hover:border-white/15"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <span
                          className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full"
                          style={{ background: `${svc.accentColor}20`, color: svc.accentColor }}
                        >
                          HOT
                        </span>
                        <Icon className="w-4 h-4" style={{ color: svc.accentColor }} />
                      </div>
                      <p className="text-white font-bold text-sm leading-tight">{svc.shortLabel}</p>
                      <p className="text-white/40 text-[11px] mt-1">{svc.priceLabel}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Order form card */}
            <Card className="bg-white/[0.04] border-white/10 rounded-2xl overflow-hidden">
              <div className="h-px bg-gradient-to-r from-transparent via-white/15 to-transparent" />
              <CardContent className="p-5 space-y-5">
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">

                    {/* TikTok link */}
                    <FormField
                      control={form.control}
                      name="link"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-white/50 text-[10px] font-bold uppercase tracking-[0.2em]">
                            TikTok Link
                          </FormLabel>
                          <FormControl>
                            <Input
                              data-testid="input-link"
                              placeholder="https://www.tiktok.com/@username/video/..."
                              className="bg-white/5 border-white/10 text-white h-12 rounded-xl placeholder:text-white/20 text-sm focus:border-white/30 focus:ring-0 focus:bg-white/[0.07] transition-all"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage className="text-[#FE2C55] text-[10px] font-semibold" />
                        </FormItem>
                      )}
                    />

                    {/* Service selector — custom button group */}
                    <FormField
                      control={form.control}
                      name="service"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-white/50 text-[10px] font-bold uppercase tracking-[0.2em]">
                            Service
                          </FormLabel>
                          <div className="space-y-2">
                            {SERVICES.map((svc) => {
                              const Icon = svc.icon;
                              const isSelected = field.value === svc.id;
                              return (
                                <button
                                  key={svc.id}
                                  type="button"
                                  data-testid={`button-service-${svc.id}`}
                                  onClick={() => {
                                    field.onChange(svc.id);
                                    if (quantity < svc.minQty) form.setValue("quantity", svc.minQty);
                                  }}
                                  className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border text-left transition-all ${
                                    isSelected
                                      ? "border-white/25 bg-white/10"
                                      : "border-white/8 bg-white/[0.02] hover:bg-white/[0.05] hover:border-white/15"
                                  }`}
                                >
                                  <div className="flex items-center gap-3">
                                    <Icon className="w-4 h-4 flex-shrink-0" style={{ color: svc.accentColor }} />
                                    <div>
                                      <p className={`text-sm font-semibold leading-tight ${isSelected ? "text-white" : "text-white/70"}`}>
                                        {svc.label}
                                      </p>
                                      <p className="text-white/35 text-[11px] mt-0.5">{svc.priceLabel}</p>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                                    {svc.hot && (
                                      <span
                                        className="text-[8px] font-black uppercase px-1.5 py-0.5 rounded-full"
                                        style={{ background: `${svc.accentColor}20`, color: svc.accentColor }}
                                      >
                                        HOT
                                      </span>
                                    )}
                                    <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all ${isSelected ? "border-white bg-white" : "border-white/20"}`}>
                                      {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-black" />}
                                    </div>
                                  </div>
                                </button>
                              );
                            })}
                          </div>
                          <FormMessage className="text-[#FE2C55] text-[10px] font-semibold" />
                        </FormItem>
                      )}
                    />

                    {/* Quantity */}
                    <FormField
                      control={form.control}
                      name="quantity"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-white/50 text-[10px] font-bold uppercase tracking-[0.2em]">
                            Quantity
                            <span className="ml-2 text-white/25 normal-case tracking-normal font-normal">
                              (min {selectedService.minQty.toLocaleString()})
                            </span>
                          </FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Input
                                data-testid="input-quantity"
                                type="number"
                                min={selectedService.minQty}
                                step={100}
                                className="bg-white/5 border-white/10 text-white h-12 rounded-xl text-sm focus:border-white/30 focus:ring-0 focus:bg-white/[0.07] pr-16 transition-all font-bold"
                                {...field}
                                onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                              />
                              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-white/20 text-[10px] font-bold uppercase tracking-widest">
                                units
                              </span>
                            </div>
                          </FormControl>
                          <FormMessage className="text-[#FE2C55] text-[10px] font-semibold" />
                        </FormItem>
                      )}
                    />

                    {/* Total */}
                    <div className="flex items-center justify-between px-4 py-4 rounded-xl bg-white/[0.05] border border-white/8">
                      <div>
                        <p className="text-white/40 text-[10px] font-bold uppercase tracking-[0.2em]">Total Amount</p>
                        <p data-testid="text-total-amount" className="text-2xl font-black text-white mt-0.5">
                          ₦{form.watch("totalAmount").toLocaleString()}
                        </p>
                      </div>
                      <ChevronRight className="w-5 h-5 text-white/20" />
                    </div>

                    <Button
                      data-testid="button-proceed-payment"
                      type="submit"
                      className="w-full h-12 rounded-xl bg-[#FE2C55] hover:bg-[#e02449] text-white font-bold text-sm uppercase tracking-widest transition-all active:scale-[0.98] shadow-lg shadow-[#FE2C55]/20"
                    >
                      Proceed to Payment
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </>
        )}

        {step === 2 && (
          <div className="space-y-5 animate-in fade-in slide-in-from-bottom-3 duration-300">
            <div>
              <h2 className="text-white font-black text-xl">Complete Your Payment</h2>
              <p className="text-white/40 text-sm mt-1">Transfer the exact amount to the account below, then upload your receipt.</p>
            </div>

            {/* Bank details card */}
            <Card className="bg-white/[0.04] border-white/10 rounded-2xl overflow-hidden">
              <div className="h-px bg-gradient-to-r from-transparent via-[#25F4EE]/30 to-transparent" />
              <CardContent className="p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <p className="text-white/40 text-[10px] font-bold uppercase tracking-[0.2em]">Bank Transfer Details</p>
                  <span className="text-xs font-bold text-white/50 bg-white/5 px-2.5 py-1 rounded-full border border-white/10">
                    {BANK.bank}
                  </span>
                </div>

                <div className="space-y-3 pt-1">
                  <div>
                    <p className="text-white/30 text-[10px] uppercase tracking-widest font-bold mb-0.5">Account Name</p>
                    <p className="text-white font-bold text-sm">{BANK.name}</p>
                  </div>
                  <div>
                    <p className="text-white/30 text-[10px] uppercase tracking-widest font-bold mb-0.5">Amount to Send</p>
                    <p className="text-[#FE2C55] font-black text-3xl tracking-tight">
                      ₦{form.getValues("totalAmount").toLocaleString()}
                    </p>
                  </div>
                  <div className="flex items-end justify-between pt-3 border-t border-white/[0.06]">
                    <div>
                      <p className="text-white/30 text-[10px] uppercase tracking-widest font-bold mb-0.5">Account Number</p>
                      <p className="text-white font-black text-2xl">{BANK.number}</p>
                    </div>
                    <Button
                      data-testid="button-copy-account"
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-10 px-4 bg-white/5 text-white/60 hover:bg-white/10 hover:text-white rounded-xl border border-white/10 gap-2 transition-all font-semibold text-xs"
                      onClick={() => copyToClipboard(BANK.number)}
                    >
                      <Copy className="w-3.5 h-3.5" /> Copy
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Receipt upload */}
            <Card className="bg-white/[0.04] border-white/10 rounded-2xl overflow-hidden">
              <CardContent className="p-5 space-y-4">
                <div>
                  <p className="text-white font-bold text-sm">Upload Payment Receipt</p>
                  <p className="text-white/50 text-xs mt-1 leading-relaxed">
                    After making the transfer, upload a clear screenshot of your payment receipt below.
                  </p>
                </div>

                {/* Important notice */}
                <div className="flex gap-3 p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/25">
                  <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <p className="text-amber-400 text-xs font-bold">Important — Read Before Uploading</p>
                    <p className="text-amber-300/80 text-[11px] leading-relaxed">
                      Your receipt <strong className="text-amber-300">must clearly show your sender's account name</strong>.
                      Orders submitted without a visible account name on the receipt <strong className="text-amber-300">will not be processed</strong>.
                    </p>
                  </div>
                </div>

                {/* Upload area */}
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)}>
                    <FormField
                      control={form.control}
                      name="receiptUrl"
                      render={() => (
                        <FormItem>
                          <FormControl>
                            <label
                              data-testid="label-upload-receipt"
                              className="flex flex-col items-center gap-3 p-6 rounded-xl border-2 border-dashed border-white/10 hover:border-white/25 bg-white/[0.02] hover:bg-white/[0.05] cursor-pointer transition-all group"
                            >
                              <Input type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
                              <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center group-hover:scale-105 transition-transform">
                                {receiptFile
                                  ? <CheckCircle className="w-6 h-6 text-[#25F4EE]" />
                                  : <Upload className="w-6 h-6 text-white/30 group-hover:text-white/50 transition-colors" />
                                }
                              </div>
                              {receiptFile ? (
                                <div className="text-center">
                                  <p className="text-[#25F4EE] font-semibold text-sm">Receipt attached</p>
                                  <p className="text-white/30 text-[11px] mt-0.5 truncate max-w-[200px]">{receiptFile.name}</p>
                                </div>
                              ) : (
                                <div className="text-center">
                                  <p className="text-white/50 font-semibold text-sm">Tap to upload screenshot</p>
                                  <p className="text-white/25 text-[11px] mt-0.5">PNG, JPG — max 5 MB</p>
                                </div>
                              )}
                            </label>
                          </FormControl>
                          <FormMessage className="text-[#FE2C55] text-[10px] font-semibold" />
                        </FormItem>
                      )}
                    />

                    <div className="flex gap-3 mt-4">
                      <Button
                        data-testid="button-go-back"
                        type="button"
                        variant="ghost"
                        onClick={() => setStep(1)}
                        className="flex-1 h-12 rounded-xl text-white/50 hover:text-white hover:bg-white/5 border border-white/10 font-semibold text-sm transition-all"
                      >
                        Go Back
                      </Button>
                      <Button
                        data-testid="button-submit-order"
                        type="submit"
                        className="flex-[2] h-12 rounded-xl bg-[#25F4EE] hover:bg-[#1ad4cc] text-black font-bold text-sm uppercase tracking-wider transition-all active:scale-[0.98] shadow-lg shadow-[#25F4EE]/15"
                      >
                        Submit Order
                      </Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>

            {/* Secured note */}
            <p className="text-center text-white/20 text-[10px] font-semibold uppercase tracking-widest pb-4">
              🔒 &nbsp; Secured &amp; Confidential Transaction
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
