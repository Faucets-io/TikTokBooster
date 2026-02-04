import { useParams, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle, Home } from "lucide-react";
import { Order } from "@shared/schema";

export default function ThankYou() {
  const { id } = useParams<{ id: string }>();
  
  const { data, isLoading, isError } = useQuery<Order>({
    queryKey: [`/api/orders/${id}`],
    enabled: !!id,
  });
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-background text-foreground">
        <div className="flex-grow flex flex-col items-center justify-center p-8">
          <Loader2 className="h-12 w-12 text-primary animate-spin mb-4" />
          <h1 className="text-2xl md:text-3xl font-bold">Loading your order...</h1>
        </div>
      </div>
    );
  }
  
  if (isError || !data) {
    return (
      <div className="min-h-screen flex flex-col bg-background text-foreground">
        <div className="flex-grow flex flex-col items-center justify-center p-8">
          <div className="max-w-md w-full p-8 bg-card rounded-xl shadow-lg border">
            <h1 className="text-2xl md:text-3xl font-bold text-center mb-4">Something went wrong</h1>
            <p className="text-muted-foreground text-center mb-6">We couldn't find your order. Please try again.</p>
            <div className="flex justify-center">
              <Link href="/">
                <Button>
                  <Home className="mr-2 h-4 w-4" />
                  Return Home
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  const order = data;
  
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <div className="flex-grow flex flex-col items-center justify-center p-8">
        <div className="max-w-md w-full p-8 bg-card rounded-xl shadow-lg border">
          <div className="flex flex-col items-center">
            <div className="h-20 w-20 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="h-10 w-10 text-primary" />
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-center mb-2 text-primary">Success!</h1>
            <h2 className="text-lg text-muted-foreground text-center mb-6">Your order has been received</h2>
            
            <div className="w-full bg-muted p-4 rounded-lg mb-6">
              <div className="flex justify-between mb-2">
                <span className="text-muted-foreground">Username:</span>
                <span className="font-semibold">@{order.username}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-muted-foreground">Service:</span>
                <span className="font-semibold">{order.service}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-muted-foreground">Quantity:</span>
                <span className="font-semibold">{order.quantity.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Status:</span>
                <span className="font-semibold text-green-600">Processing</span>
              </div>
            </div>
            
            <p className="text-center text-muted-foreground mb-6">
              Your boost will be delivered soon. Thank you for choosing our service!
            </p>
            
            <Link href="/">
              <Button className="w-full">
                <Home className="mr-2 h-4 w-4" />
                Return Home
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
