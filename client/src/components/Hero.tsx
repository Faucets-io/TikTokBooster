import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { ChevronRight } from "lucide-react";

interface HeroProps {
  scrollToForm: () => void;
}

export default function Hero({ scrollToForm }: HeroProps) {
  return (
    <section className="relative overflow-hidden pt-10 pb-8 md:pt-20 md:pb-16 px-4 md:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between">
          <motion.div 
            className="md:w-1/2 mb-10 md:mb-0"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="relative inline-block mb-4">
              <span className="inline-block bg-black text-white text-xs px-3 py-1 rounded-full">
                LIMITED TIME OFFER
              </span>
              <div className="absolute -top-1 -right-1 h-2 w-2 bg-[#FE2C55] rounded-full animate-pulse"></div>
            </div>
            
            <h1 className="text-4xl md:text-6xl font-montserrat font-bold leading-tight mb-4">
              Get <span className="tiktok-gradient">Free TikTok</span> Followers Instantly
            </h1>
            
            <p className="text-lg text-gray-700 mb-8 max-w-lg">
              Boost your TikTok presence with our official growth service. 
              Join thousands of creators who have increased their audience effortlessly.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                onClick={scrollToForm}
                className="tiktok-btn-gradient text-white font-semibold px-8 py-6 rounded-full text-center transition transform hover:scale-105"
              >
                Get Free Followers
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
              
              <Button 
                variant="outline"
                onClick={() => {
                  document.getElementById("how-it-works")?.scrollIntoView({
                    behavior: "smooth"
                  });
                }}
                className="bg-gray-100 hover:bg-gray-200 text-black font-semibold px-8 py-6 rounded-full text-center transition border-0"
              >
                How It Works
              </Button>
            </div>
            
            <div className="mt-8 flex items-center">
              <div className="flex -space-x-2">
                <div className="h-10 w-10 rounded-full border-2 border-white bg-[#25F4EE] flex items-center justify-center text-white font-bold">A</div>
                <div className="h-10 w-10 rounded-full border-2 border-white bg-[#FE2C55] flex items-center justify-center text-white font-bold">B</div>
                <div className="h-10 w-10 rounded-full border-2 border-white bg-black flex items-center justify-center text-white font-bold">C</div>
                <div className="h-10 w-10 rounded-full border-2 border-white bg-gray-800 flex items-center justify-center text-white font-bold">D</div>
                <div className="h-10 w-10 rounded-full border-2 border-white bg-gray-100 flex items-center justify-center text-xs font-medium">+2k</div>
              </div>
              <div className="ml-3 text-sm text-gray-600">
                <strong>2,000+</strong> creators helped today
              </div>
            </div>
          </motion.div>
          
          <motion.div 
            className="md:w-1/2 relative"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            {/* TikTok-style phone mockup */}
            <div className="relative">
              <div className="bg-black rounded-3xl shadow-2xl overflow-hidden p-2">
                <div className="rounded-2xl overflow-hidden aspect-[9/16] bg-gray-800">
                  <div className="w-full h-full bg-gradient-to-br from-gray-900 to-black p-4 flex flex-col">
                    <div className="flex items-center mb-4">
                      <div className="w-10 h-10 rounded-full bg-[#25F4EE]"></div>
                      <div className="ml-2">
                        <div className="h-4 w-32 bg-gray-700 rounded-md"></div>
                        <div className="h-3 w-20 bg-gray-700 rounded-md mt-1"></div>
                      </div>
                      <div className="ml-auto">
                        <div className="h-8 w-8 rounded-full bg-gray-700"></div>
                      </div>
                    </div>
                    
                    <div className="flex-grow flex items-center justify-center">
                      <div className="text-center">
                        <div className="h-20 w-20 mx-auto rounded-full bg-gradient-to-r from-[#25F4EE] to-[#FE2C55] flex items-center justify-center text-white text-2xl font-bold mb-4">
                          +
                        </div>
                        <div className="h-6 w-40 mx-auto bg-gray-700 rounded-md"></div>
                        <div className="h-4 w-32 mx-auto bg-gray-700 rounded-md mt-2"></div>
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center mt-4">
                      <div className="h-10 w-10 rounded-full bg-gray-700"></div>
                      <div className="h-10 w-10 rounded-full bg-gray-700"></div>
                      <div className="h-10 w-10 rounded-full bg-gray-700"></div>
                      <div className="h-10 w-10 rounded-full bg-gray-700"></div>
                    </div>
                  </div>
                </div>
              </div>
              
              <motion.div 
                className="absolute top-10 right-10 bg-white rounded-lg p-3 shadow-lg"
                animate={{ y: [0, -10, 0] }}
                transition={{ 
                  repeat: Infinity, 
                  duration: 2,
                  ease: "easeInOut"
                }}
              >
                <div className="flex items-center space-x-2">
                  <svg className="h-5 w-5 text-[#FE2C55]" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                  </svg>
                  <span className="font-semibold">+500 Followers</span>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
