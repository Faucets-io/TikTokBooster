import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Sparkles, Shield, Check, ArrowRight } from "lucide-react";

const steps = [
  "Connecting to TikTok API...",
  "Validating username...",
  "Account found! Setting up follower queue...",
  "Processing your request...",
  "Preparing followers for delivery..."
];

export default function ProcessingAnimation() {
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStep(prev => {
        if (prev < steps.length - 1) {
          return prev + 1;
        }
        clearInterval(interval);
        return prev;
      });
    }, 1000);
    
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev < 100) {
          return prev + 1.5;
        }
        clearInterval(progressInterval);
        return 100;
      });
    }, 100);
    
    return () => {
      clearInterval(interval);
      clearInterval(progressInterval);
    };
  }, []);
  
  return (
    <div className="space-y-8 text-center py-6">
      <div className="mx-auto">
        <div className="relative">
          <motion.div 
            className="h-24 w-24 mx-auto rounded-full border-4 border-t-transparent animate-spin"
            style={{ borderColor: 'rgb(37, 244, 238) transparent transparent transparent' }}
          />
          <motion.div 
            className="absolute inset-0 flex items-center justify-center"
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ repeat: Infinity, duration: 2 }}
          >
            <Sparkles className="h-10 w-10 text-[#FE2C55]" />
          </motion.div>
        </div>
      </div>
      
      <h3 className="text-xl font-semibold bg-gradient-to-r from-[#25F4EE] to-[#FE2C55] bg-clip-text text-transparent">
        Processing Your Request
      </h3>
      
      <div className="space-y-4 text-sm">
        <div className="w-full bg-[#0d0d0d] rounded-full h-3 overflow-hidden border border-gray-800">
          <motion.div 
            className="bg-gradient-to-r from-[#25F4EE] to-[#FE2C55] h-full rounded-full relative"
            style={{ width: `${progress}%` }}
            initial={{ width: 0 }}
          >
            <div className="absolute inset-0 bg-white opacity-20 overflow-hidden">
              <div className="h-full w-20 bg-white rotate-12 translate-x-10 opacity-30 animate-pulse"></div>
            </div>
          </motion.div>
        </div>
        
        <motion.div 
          className="flex items-center justify-center text-gray-300 font-medium"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ repeat: Infinity, duration: 2 }}
        >
          {steps[currentStep]}
        </motion.div>
        
        <div className="flex justify-between items-start pt-2">
          {steps.map((step, index) => (
            <div 
              key={index} 
              className={`flex flex-col items-center ${index <= currentStep ? 'text-[#25F4EE]' : 'text-gray-600'}`}
            >
              <div className={`h-5 w-5 rounded-full flex items-center justify-center text-xs 
                ${index < currentStep 
                  ? 'bg-[#25F4EE] text-black' 
                  : index === currentStep 
                    ? 'bg-[#FE2C55] text-white animate-pulse' 
                    : 'bg-gray-800 text-gray-500'
                }`}
              >
                {index < currentStep ? (
                  <Check className="h-3 w-3" />
                ) : (
                  <span>{index + 1}</span>
                )}
              </div>
              {index < steps.length - 1 && (
                <div className={`h-0.5 w-10 mt-2 hidden md:block
                  ${index < currentStep ? 'bg-[#25F4EE]' : 'bg-gray-800'}`}>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
