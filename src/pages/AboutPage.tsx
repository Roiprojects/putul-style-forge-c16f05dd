import { motion } from "framer-motion";
import gallery6 from "@/assets/gallery-6.jpg";
import gallery1 from "@/assets/gallery-1.jpg";

const AboutPage = () => (
  <div className="pt-20 md:pt-24 min-h-screen">
    {/* Hero */}
    <div className="relative h-[50vh] overflow-hidden">
      <img src={gallery6} alt="About Putul Fashions" className="w-full h-full object-cover" />
      <div className="absolute inset-0 bg-foreground/60" />
      <div className="absolute inset-0 flex items-center justify-center">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
          <p className="text-secondary tracking-[0.3em] uppercase text-xs mb-2">Our Story</p>
          <h1 className="font-heading text-4xl md:text-6xl font-bold text-background">About Us</h1>
        </motion.div>
      </div>
    </div>

    <div className="container mx-auto px-4 md:px-8 py-20">
      <div className="grid md:grid-cols-2 gap-16 items-center">
        <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
          <p className="text-secondary tracking-[0.3em] uppercase text-xs mb-2">The Brand</p>
          <h2 className="font-heading text-3xl md:text-4xl font-semibold mb-6">Putul Fashions</h2>
          <div className="space-y-4 text-muted-foreground leading-relaxed">
            <p>
              Putul Fashions is a men's footwear brand dedicated to delivering stylish, comfortable, and affordable shoes for every occasion. From everyday casuals to sporty essentials, we bring you footwear that keeps you moving in style.
            </p>
            <p>
              Our collection spans across Crocs, Sports Shoes, Slides & Slippers, and Loafer Sandals — crafted using premium materials like EVA, Airmix soles, and high-grade PVC for lasting comfort and durability.
            </p>
            <p>
              Founded with the belief that great footwear shouldn't break the bank, Putul Fashions offers trending designs at prices that make quality accessible to everyone across India.
            </p>
          </div>
        </motion.div>
        <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
          <img src={gallery1} alt="Putul Fashions footwear" className="w-full aspect-[3/4] object-cover" />
        </motion.div>
      </div>

      {/* Mission */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="mt-20 bg-primary text-primary-foreground p-12 md:p-20 text-center"
      >
        <p className="text-secondary tracking-[0.3em] uppercase text-xs mb-4">Our Mission</p>
        <h3 className="font-heading text-2xl md:text-4xl font-semibold max-w-2xl mx-auto leading-relaxed">
          To provide stylish, comfortable, and affordable footwear that empowers every man to walk with confidence.
        </h3>
      </motion.div>

      {/* Values */}
      <div className="mt-20 grid md:grid-cols-3 gap-8">
        {[
          { title: "Comfort First", desc: "Every sole is engineered for all-day comfort using lightweight EVA and cushioned Airmix technology." },
          { title: "Style Forward", desc: "From classic loafers to bold sports shoes, our designs keep pace with the latest trends across India." },
          { title: "Value for Money", desc: "Premium quality footwear at honest prices — because looking good shouldn't cost a fortune." },
        ].map((v, i) => (
          <motion.div
            key={v.title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            className="text-center p-8 border border-border"
          >
            <h4 className="font-heading text-xl font-semibold mb-3">{v.title}</h4>
            <p className="text-sm text-muted-foreground">{v.desc}</p>
          </motion.div>
        ))}
      </div>
    </div>
  </div>
);

export default AboutPage;
