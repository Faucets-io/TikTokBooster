import { motion } from "framer-motion";
import { UserPlus, Cog, Rocket } from "lucide-react";

const steps = [
  {
    icon: <UserPlus className="h-8 w-8 tiktok-gradient" />,
    title: "1. Enter Your Username",
    description: "Simply provide your TikTok username (without the @ symbol)"
  },
  {
    icon: <Cog className="h-8 w-8 tiktok-gradient animate-spin-slow" />,
    title: "2. We Process Your Request",
    description: "Our system verifies your account and prepares your followers"
  },
  {
    icon: <Rocket className="h-8 w-8 tiktok-gradient" />,
    title: "3. Watch Your Followers Grow",
    description: "Your new followers will be added to your account within 24 hours"
  }
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="py-16 px-4 md:px-8">
      <div className="max-w-7xl mx-auto">
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl md:text-4xl font-montserrat font-bold mb-4">How It Works</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Get more TikTok followers with our simple 3-step process
          </p>
        </motion.div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {steps.map((step, index) => (
            <motion.div 
              key={index}
              className="text-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.2 }}
              viewport={{ once: true }}
            >
              <div className="h-20 w-20 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-6">
                {step.icon}
              </div>
              <h3 className="text-xl font-montserrat font-semibold mb-3">{step.title}</h3>
              <p className="text-gray-600">{step.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
