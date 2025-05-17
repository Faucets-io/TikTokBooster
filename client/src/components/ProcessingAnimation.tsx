import { useState, useEffect } from "react";
import { motion } from "framer-motion";

const steps = [
  "Connecting to TikTok servers...",
  "Verifying account...",
  "Account found! Preparing followers...",
  "Processing request...",
  "Almost done! Finalizing..."
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
          return prev + 2;
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
    <div className="space-y-6 text-center py-4">
      <div className="mx-auto">
        <motion.div 
          className="h-20 w-20 mx-auto rounded-full border-4 border-t-transparent animate-spin"
          style={{ borderColor: 'rgb(37, 244, 238) transparent transparent transparent' }}
        />
      </div>
      
      <h3 className="text-xl font-semibold">Processing Your Request...</h3>
      
      <div className="space-y-2 text-sm text-gray-400">
        <p>{steps[currentStep]}</p>
        <div className="w-full bg-gray-700 rounded-full h-2 overflow-hidden">
          <motion.div 
            className="bg-gradient-to-r from-[#25F4EE] to-[#FE2C55] h-full rounded-full"
            style={{ width: `${progress}%` }}
            initial={{ width: 0 }}
          />
        </div>
      </div>
    </div>
  );
}
