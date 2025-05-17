import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const faqs = [
  {
    question: "Is this service really free?",
    answer: "Yes, our basic follower boost service is completely free. We offer this as a way to introduce creators to our platform. For more advanced growth features, we offer premium packages."
  },
  {
    question: "Is it safe to use this service?",
    answer: "Absolutely! We never ask for your password or any sensitive information. Our process is completely secure and complies with TikTok's terms of service."
  },
  {
    question: "How long does it take to receive followers?",
    answer: "The delivery process begins immediately after your request is submitted. You'll start seeing new followers within a few hours, with complete delivery within 24 hours."
  },
  {
    question: "Are these real followers?",
    answer: "Yes, we provide real TikTok users who are interested in content like yours. This helps not only increase your follower count but also improves your engagement rate."
  },
  {
    question: "How many times can I use this service?",
    answer: "Our free service can be used once every 24 hours per TikTok account. This helps ensure sustainable growth for your profile."
  }
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  
  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };
  
  return (
    <section className="py-16 px-4 md:px-8">
      <div className="max-w-4xl mx-auto">
        <motion.div 
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl md:text-4xl font-montserrat font-bold mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-lg text-gray-600">
            Everything you need to know about our TikTok follower service
          </p>
        </motion.div>
        
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <motion.div 
              key={index}
              className="border border-gray-200 rounded-lg overflow-hidden"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <button 
                className="flex justify-between items-center w-full px-6 py-4 text-left font-medium focus:outline-none"
                onClick={() => toggleFAQ(index)}
              >
                <span>{faq.question}</span>
                <ChevronDown 
                  className={`text-gray-400 transition-transform duration-200 ${openIndex === index ? 'transform rotate-180' : ''}`}
                />
              </button>
              
              <AnimatePresence>
                {openIndex === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="px-6 pb-4">
                      <p className="text-gray-600">{faq.answer}</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
