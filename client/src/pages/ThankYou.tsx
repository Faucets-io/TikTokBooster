import { useParams, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle, Home } from "lucide-react";
import { Submission } from "@shared/schema";

export default function ThankYou() {
  const { id } = useParams<{ id: string }>();
  
  const { data, isLoading, isError } = useQuery<{ submission: Submission }>({
    queryKey: [`/api/submission/${id}`],
    enabled: !!id,
  });
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-black text-white">
        <div className="flex-grow flex flex-col items-center justify-center p-8">
          <Loader2 className="h-12 w-12 text-[#25F4EE] animate-spin mb-4" />
          <h1 className="text-2xl md:text-3xl font-montserrat font-bold">Loading your submission...</h1>
        </div>
      </div>
    );
  }
  
  if (isError || !data) {
    return (
      <div className="min-h-screen flex flex-col bg-black text-white">
        <div className="flex-grow flex flex-col items-center justify-center p-8">
          <div className="max-w-md w-full p-8 bg-[#1D1D1D] rounded-xl shadow-lg border border-gray-800">
            <h1 className="text-2xl md:text-3xl font-montserrat font-bold text-center mb-4">Something went wrong</h1>
            <p className="text-gray-400 text-center mb-6">We couldn't find your submission. Please try again.</p>
            <div className="flex justify-center">
              <Link href="/">
                <Button className="bg-[#FE2C55] hover:bg-[#FE2C55]/90 text-white">
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
  
  const { submission } = data;
  
  return (
    <div className="min-h-screen flex flex-col bg-black text-white">
      <div className="flex-grow flex flex-col items-center justify-center p-8">
        {/* Animated TikTok background */}
        <div className="absolute inset-0 overflow-hidden opacity-30">
          <div className="absolute top-10 left-10 w-40 h-40 rounded-full bg-[#25F4EE] blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-10 w-60 h-60 rounded-full bg-[#FE2C55] blur-3xl animate-pulse"></div>
          <div className="absolute top-1/3 right-1/4 w-32 h-32 rounded-full bg-white blur-3xl animate-pulse"></div>
        </div>
        
        <div className="relative z-10 max-w-md w-full p-8 bg-[#1D1D1D] rounded-xl shadow-lg border border-gray-800">
          <div className="flex flex-col items-center">
            <div className="h-20 w-20 bg-gradient-to-r from-[#25F4EE]/20 to-[#FE2C55]/20 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="h-10 w-10 text-[#25F4EE]" />
            </div>
            <h1 className="text-2xl md:text-3xl font-montserrat font-bold text-center mb-2 bg-gradient-to-r from-[#25F4EE] to-[#FE2C55] bg-clip-text text-transparent">Success!</h1>
            <h2 className="text-lg text-gray-300 text-center mb-6">Your followers are on the way</h2>
            
            <div className="w-full bg-[#0d0d0d] p-4 rounded-lg mb-6 border border-gray-800">
              <div className="flex justify-between mb-2">
                <span className="text-gray-400">Username:</span>
                <span className="font-semibold text-white">@{submission.username}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-gray-400">Followers:</span>
                <span className="font-semibold text-[#25F4EE]">{submission.followersRequested}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Status:</span>
                <span className="font-semibold text-green-400">Processing</span>
              </div>
            </div>
            
            <p className="text-center text-gray-400 mb-6">
              Your followers will be delivered within 24 hours. Keep creating awesome content!
            </p>
            
            <Link href="/">
              <Button className="bg-[#FE2C55] hover:bg-[#FE2C55]/90 text-white">
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
