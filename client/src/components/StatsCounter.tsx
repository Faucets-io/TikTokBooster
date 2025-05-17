import { motion } from "framer-motion";

const stats = [
  { count: "50K+", label: "Followers Delivered" },
  { count: "10K+", label: "Happy Creators" },
  { count: "99%", label: "Satisfaction Rate" },
  { count: "24h", label: "Delivery Time" }
];

export default function StatsCounter() {
  return (
    <section className="bg-gray-50 py-12 px-4 md:px-8 overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              className="counter-item bg-white p-6 rounded-xl shadow-sm text-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <div className="text-3xl font-montserrat font-bold tiktok-gradient">
                {stat.count}
              </div>
              <div className="text-sm text-gray-600 mt-1">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
