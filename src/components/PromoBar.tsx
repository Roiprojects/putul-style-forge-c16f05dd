import { motion } from "framer-motion";

const promos = [
  "Save Min 50% on all orders",
  "Free Shipping on All Orders",
  "GET 10% off on Orders above ₹799 | Use GET10",
  "GET 15% off on Orders above ₹1299 | Use GET15",
];

const PromoBar = () => {
  return (
    <div className="bg-secondary text-secondary-foreground overflow-hidden h-8 flex items-center">
      <motion.div
        className="flex whitespace-nowrap gap-16"
        animate={{ x: [0, -1200] }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
      >
        {[...promos, ...promos, ...promos].map((p, i) => (
          <span key={i} className="text-[11px] tracking-wider uppercase font-medium">
            {p}
            <span className="mx-8 opacity-40">✦</span>
          </span>
        ))}
      </motion.div>
    </div>
  );
};

export default PromoBar;
