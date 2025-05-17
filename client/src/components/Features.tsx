import { motion } from "framer-motion";
import { Zap, Shield, UserCheck, Heart, Tag, Headphones } from "lucide-react";

const features = [
  {
    icon: <Zap className="h-5 w-5 text-[#25F4EE]" />,
    title: "Instant Delivery",
    description: "Start seeing results within minutes of your request"
  },
  {
    icon: <Shield className="h-5 w-5 text-[#25F4EE]" />,
    title: "100% Safe & Secure",
    description: "No password required, completely secure process"
  },
  {
    icon: <UserCheck className="h-5 w-5 text-[#25F4EE]" />,
    title: "Real Followers",
    description: "Get high-quality followers, not bots or fake accounts"
  },
  {
    icon: <Heart className="h-5 w-5 text-[#25F4EE]" />,
    title: "Engagement Boost",
    description: "More followers leads to more likes and comments"
  },
  {
    icon: <Tag className="h-5 w-5 text-[#25F4EE]" />,
    title: "Completely Free",
    description: "No credit card, no hidden fees, 100% free service"
  },
  {
    icon: <Headphones className="h-5 w-5 text-[#25F4EE]" />,
    title: "24/7 Support",
    description: "Our team is always available to help with any questions"
  }
];

export default function Features() {
  return (
    <section id="features" className="py-16 px-4 md:px-8 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl md:text-4xl font-montserrat font-bold mb-4">
            Why Choose Our Service
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            The preferred choice for TikTok creators looking to boost their presence
          </p>
        </motion.div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div 
              key={index}
              className="bg-white p-6 rounded-xl shadow-sm"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <div className="flex items-start mb-4">
                <div className="h-12 w-12 rounded-lg bg-black flex items-center justify-center flex-shrink-0">
                  {feature.icon}
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-montserrat font-semibold">{feature.title}</h3>
                  <p className="text-gray-600 text-sm mt-1">{feature.description}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
