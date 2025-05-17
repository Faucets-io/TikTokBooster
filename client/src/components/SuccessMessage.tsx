import { motion } from "framer-motion";
import { CheckCircle } from "lucide-react";

interface SuccessMessageProps {
  username: string;
  followers: string;
}

export default function SuccessMessage({ username, followers }: SuccessMessageProps) {
  return (
    <motion.div 
      className="space-y-6 text-center py-8"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div 
        className="mx-auto h-20 w-20 bg-[#25F4EE]/20 rounded-full flex items-center justify-center"
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        transition={{ 
          type: "spring",
          stiffness: 300,
          damping: 15 
        }}
      >
        <CheckCircle className="h-10 w-10 text-[#25F4EE]" />
      </motion.div>
      
      <motion.h3 
        className="text-xl font-semibold"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        Success! Followers On The Way
      </motion.h3>
      
      <motion.p 
        className="text-gray-300"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        We've processed your request. Your {followers} followers will be delivered to{" "}
        <span className="font-semibold">@{username}</span> within 24 hours.
      </motion.p>
      
      <motion.div 
        className="pt-4"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        <div className="text-sm text-center text-gray-400">
          Redirecting to confirmation page...
        </div>
      </motion.div>
    </motion.div>
  );
}
