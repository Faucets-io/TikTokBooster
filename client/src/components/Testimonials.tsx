import { motion } from "framer-motion";
import { Star } from "lucide-react";

const testimonials = [
  {
    username: "@dance_queen22",
    rating: 5,
    text: "I got over 500 new followers in just one day! My videos are getting way more views now. This service really works!",
    followers: "1,250+"
  },
  {
    username: "@urban_beats",
    rating: 5,
    text: "I was skeptical at first, but this actually worked! I've been trying to grow my account for months, and this gave me the boost I needed.",
    followers: "2,500+"
  },
  {
    username: "@comedy_king",
    rating: 4.5,
    text: "Not only did I get more followers, but my engagement rate went up too! My videos started appearing on more For You pages. Highly recommend!",
    followers: "3,100+"
  }
];

export default function Testimonials() {
  return (
    <section id="testimonials" className="py-16 px-4 md:px-8">
      <div className="max-w-7xl mx-auto">
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl md:text-4xl font-montserrat font-bold mb-4">
            Creator Success Stories
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            See how creators have boosted their TikTok presence with our service
          </p>
        </motion.div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              className="bg-white p-6 rounded-xl shadow-sm border border-gray-100"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.2 }}
              viewport={{ once: true }}
            >
              <div className="flex items-center mb-4">
                <div className="h-12 w-12 rounded-full bg-gradient-to-br from-[#25F4EE] to-[#FE2C55] flex items-center justify-center text-white font-bold">
                  {testimonial.username.charAt(1).toUpperCase()}
                </div>
                <div className="ml-3">
                  <h4 className="font-montserrat font-semibold">{testimonial.username}</h4>
                  <div className="flex items-center">
                    {[...Array(Math.floor(testimonial.rating))].map((_, i) => (
                      <Star key={i} className="h-3 w-3 text-yellow-400 fill-current" />
                    ))}
                    {testimonial.rating % 1 !== 0 && (
                      <svg 
                        className="h-3 w-3 text-yellow-400"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77V2Z"
                          fill="currentColor"
                        />
                        <path
                          d="M12 2V17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.5"
                        />
                      </svg>
                    )}
                  </div>
                </div>
              </div>
              <p className="text-gray-600 text-sm">{testimonial.text}</p>
              <div className="mt-4 text-sm text-gray-500">
                Followers Gained: <span className="font-semibold text-black">{testimonial.followers}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
