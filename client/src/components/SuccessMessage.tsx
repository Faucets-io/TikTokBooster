import { motion } from "framer-motion";
import { CheckCircle, Star, Heart, TrendingUp, Sparkles } from "lucide-react";

interface SuccessMessageProps {
  username: string;
  followers: string;
}

export default function SuccessMessage({ username, followers }: SuccessMessageProps) {
  return (
    <motion.div 
      className="space-y-8 text-center py-10"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div 
        className="relative mx-auto h-28 w-28 bg-gradient-to-b from-[#25F4EE]/20 to-[#FE2C55]/20 rounded-full flex items-center justify-center overflow-hidden"
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        transition={{ 
          type: "spring",
          stiffness: 300,
          damping: 15 
        }}
      >
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-[#25F4EE]/10 to-[#FE2C55]/10"
          animate={{ 
            rotate: [0, 360],
            scale: [1, 1.1, 1]
          }}
          transition={{ 
            rotate: { repeat: Infinity, duration: 10, ease: "linear" },
            scale: { repeat: Infinity, duration: 3, ease: "easeInOut" }
          }}
        />
        <CheckCircle className="h-14 w-14 text-[#25F4EE] z-10" />
        
        {/* Particles */}
        <motion.div 
          className="absolute h-3 w-3 rounded-full bg-[#FE2C55]"
          initial={{ x: 0, y: 0 }}
          animate={{ x: [0, 30, -20], y: [0, -30, 20], opacity: [1, 0.5, 0] }}
          transition={{ repeat: Infinity, duration: 2, repeatDelay: 0.2 }}
        />
        <motion.div 
          className="absolute h-2 w-2 rounded-full bg-[#25F4EE]"
          initial={{ x: 0, y: 0 }}
          animate={{ x: [0, -20, 30], y: [0, -20, -30], opacity: [1, 0.5, 0] }}
          transition={{ repeat: Infinity, duration: 2.5, repeatDelay: 0.1 }}
        />
      </motion.div>
      
      <motion.div 
        className="text-center space-y-3"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <h3 className="text-2xl font-bold bg-gradient-to-r from-[#25F4EE] to-[#FE2C55] bg-clip-text text-transparent">
          Success! You're All Set
        </h3>
        
        <p className="text-lg text-gray-200">
          <span className="font-semibold">@{username}</span>, your order for{" "}
          <span className="font-semibold text-[#25F4EE]">{followers}</span> followers is confirmed!
        </p>
      </motion.div>
      
      <motion.div 
        className="bg-[#0d0d0d] p-5 rounded-2xl border border-gray-800"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <div className="flex flex-col space-y-3">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <TrendingUp className="mr-2 h-5 w-5 text-[#25F4EE]" />
              <span className="text-gray-300">Followers</span>
            </div>
            <span className="font-bold">{followers}</span>
          </div>
          
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <Star className="mr-2 h-5 w-5 text-[#FE2C55]" />
              <span className="text-gray-300">Status</span>
            </div>
            <span className="font-bold text-green-400">Processing</span>
          </div>
          
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <Heart className="mr-2 h-5 w-5 text-[#FE2C55]" />
              <span className="text-gray-300">Delivery</span>
            </div>
            <span className="font-bold">Within 24 hours</span>
          </div>
        </div>
      </motion.div>
      
      <motion.div 
        className="pt-2"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        <div className="flex items-center justify-center text-gray-400 animate-pulse">
          <Sparkles className="h-4 w-4 mr-2 text-[#25F4EE]" />
          <span>Redirecting to confirmation page...</span>
        </div>
      </motion.div>
    </motion.div>
  );
}
