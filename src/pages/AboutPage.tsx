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
              Putul Fashions is a modern fashion brand focused on delivering stylish and comfortable men's clothing. We combine contemporary fashion trends with high-quality materials to create outfits that are perfect for everyday wear.
            </p>
            <p>
              Founded with the belief that every man deserves to look and feel confident, we curate collections that bridge the gap between luxury fashion and everyday affordability.
            </p>
            <p>
              From premium cotton t-shirts to statement jackets, every piece in our collection is thoughtfully designed and rigorously tested for quality, fit, and durability.
            </p>
          </div>
        </motion.div>
        <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
          <img src={gallery1} alt="Fashion lifestyle" className="w-full aspect-[3/4] object-cover" />
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
          To provide stylish, comfortable, and affordable fashion for modern men.
        </h3>
      </motion.div>

      {/* Values */}
      <div className="mt-20 grid md:grid-cols-3 gap-8">
        {[
          { title: "Quality First", desc: "We never compromise on materials. Every fabric is hand-selected for softness, durability, and feel." },
          { title: "Style Forward", desc: "Our design team stays ahead of global fashion trends to bring you the latest looks every season." },
          { title: "Customer Love", desc: "Your satisfaction drives us. From easy returns to responsive support, we're here for you." },
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
