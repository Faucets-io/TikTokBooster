import { useParams, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle, Home } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Submission } from "@shared/schema";

export default function ThankYou() {
  const { id } = useParams<{ id: string }>();
  
  const { data, isLoading, isError } = useQuery<{ submission: Submission }>({
    queryKey: [`/api/submission/${id}`],
    enabled: !!id,
  });
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-grow flex flex-col items-center justify-center p-8">
          <Loader2 className="h-12 w-12 text-[#25F4EE] animate-spin mb-4" />
          <h1 className="text-2xl md:text-3xl font-montserrat font-bold">Loading your submission...</h1>
        </div>
        <Footer />
      </div>
    );
  }
  
  if (isError || !data) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-grow flex flex-col items-center justify-center p-8">
          <div className="max-w-md w-full p-8 bg-white rounded-xl shadow-lg">
            <h1 className="text-2xl md:text-3xl font-montserrat font-bold text-center mb-4">Something went wrong</h1>
            <p className="text-gray-600 text-center mb-6">We couldn't find your submission. Please try again.</p>
            <div className="flex justify-center">
              <Link href="/">
                <Button className="bg-black hover:bg-gray-800 text-white">
                  <Home className="mr-2 h-4 w-4" />
                  Return Home
                </Button>
              </Link>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }
  
  const { submission } = data;
  
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="flex-grow flex flex-col items-center justify-center p-8 bg-gray-50">
        <div className="max-w-md w-full p-8 bg-white rounded-xl shadow-lg">
          <div className="flex flex-col items-center">
            <div className="h-20 w-20 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="h-10 w-10 text-[#25F4EE]" />
            </div>
            <h1 className="text-2xl md:text-3xl font-montserrat font-bold text-center mb-2">Success!</h1>
            <h2 className="text-lg text-gray-700 text-center mb-6">Your followers are on the way</h2>
            
            <div className="w-full bg-gray-100 p-4 rounded-lg mb-6">
              <div className="flex justify-between mb-2">
                <span className="text-gray-600">Username:</span>
                <span className="font-semibold">@{submission.username}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-gray-600">Followers:</span>
                <span className="font-semibold">{submission.followersRequested}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Status:</span>
                <span className="font-semibold text-green-600">Processing</span>
              </div>
            </div>
            
            <p className="text-center text-gray-600 mb-6">
              Your followers will be delivered within 24 hours. Keep creating awesome content!
            </p>
            
            <Link href="/">
              <Button className="tiktok-btn-gradient text-white">
                <Home className="mr-2 h-4 w-4" />
                Return Home
              </Button>
            </Link>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
