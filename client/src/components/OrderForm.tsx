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
  const [orderId, setOrderId] = useState<number | null>(null);

  const form = useForm<InsertOrder>({
    resolver: zodResolver(insertOrderSchema),
    defaultValues: {
      username: "",
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

  const onSubmit = async (data: InsertOrder) => {
    if (step === 1) {
      setStep(2);
      return;
    }

    try {
      setProcessing(true);
      const res = await apiRequest("POST", "/api/orders", data);
      const order = await res.json();
      setOrderId(order.id);
      
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
      <div className="flex-1 flex items-center justify-center p-4">
        <Card className="w-full max-w-md text-center py-8">
          <CardContent className="space-y-4">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto" />
            <h2 className="text-2xl font-bold">Success!</h2>
            <p className="text-muted-foreground">Your order has been received successfully.</p>
            <Button onClick={() => window.location.href = "/"} className="w-full">
              Back to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (processing) {
    return (
      <div className="flex-1 flex items-center justify-center p-4">
        <Card className="w-full max-w-md text-center py-12">
          <CardContent className="space-y-4">
            <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto" />
            <h2 className="text-xl font-semibold">Processing Your Order</h2>
            <p className="text-muted-foreground">Please wait while we verify your payment...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex-1 flex items-center justify-center p-4 bg-background">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">
            {step === 1 ? "Boost Your Social Media" : "Complete Payment"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {step === 1 ? (
                <>
                  <FormField
                    control={form.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Social Media Username</FormLabel>
                        <FormControl>
                          <Input placeholder="@username" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="service"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Select Service</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a service" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {SERVICES.map((s) => (
                              <SelectItem key={s.id} value={s.id}>
                                {s.name} (₦{s.price}/1k)
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="quantity"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Quantity (Min 1,000)</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            min={1000} 
                            step={100}
                            {...field} 
                            onChange={(e) => field.onChange(parseInt(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="p-4 bg-muted rounded-lg flex justify-between items-center">
                    <span className="font-semibold">Total Amount:</span>
                    <span className="text-xl font-bold text-primary">₦{form.watch("totalAmount").toLocaleString()}</span>
                  </div>

                  <Button type="submit" className="w-full text-lg h-12">
                    Proceed to Payment
                  </Button>
                </>
              ) : (
                <div className="space-y-6">
                  <div className="p-4 border rounded-lg space-y-3 bg-muted/50">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Bank:</span>
                      <span className="font-semibold">OPAY</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Account Name:</span>
                      <span className="font-bold text-xs">KEHINDE AYOMIDE MUKAIL</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Account Number:</span>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold">9013247595</span>
                        <Button 
                          type="button" 
                          variant="ghost" 
                          size="icon" 
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
                        <FormLabel>Upload Payment Receipt (Screenshot)</FormLabel>
                        <FormControl>
                          <div className="border-2 border-dashed rounded-lg p-8 text-center hover:bg-muted/50 transition-colors cursor-pointer relative">
                            <Input 
                              type="file" 
                              className="absolute inset-0 opacity-0 cursor-pointer" 
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) field.onChange(URL.createObjectURL(file));
                              }}
                            />
                            <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-2" />
                            <p className="text-sm text-muted-foreground">
                              {field.value ? "Receipt Selected" : "Tap to upload your payment receipt"}
                            </p>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex gap-4">
                    <Button type="button" variant="outline" onClick={() => setStep(1)} className="flex-1">
                      Back
                    </Button>
                    <Button type="submit" className="flex-1">
                      I've Sent It
                    </Button>
                  </div>
                </div>
              )}
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
