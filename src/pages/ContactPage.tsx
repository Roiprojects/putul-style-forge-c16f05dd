import { motion } from "framer-motion";
import { Mail, Phone, MapPin, MessageCircle } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const ContactPage = () => {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Message sent! We'll get back to you soon.");
    setForm({ name: "", email: "", subject: "", message: "" });
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="bg-primary text-primary-foreground py-12 md:py-16">
        <div className="container mx-auto px-4 md:px-8 text-center">
          <p className="text-secondary tracking-[0.3em] uppercase text-xs mb-2">Get in Touch</p>
          <h1 className="font-heading text-3xl md:text-5xl font-semibold">Contact Us</h1>
        </div>
      </div>

      <div className="container mx-auto px-4 md:px-8 py-16">
        <div className="grid md:grid-cols-2 gap-16">
          {/* Contact Info */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
            <h2 className="font-heading text-2xl font-semibold mb-6">We'd Love to Hear From You</h2>
            <p className="text-muted-foreground mb-8">
              Whether you have a question about our products, need styling advice, or just want to say hello — we're here for you.
            </p>
            <div className="space-y-6">
              {[
                { icon: Phone, label: "Phone", value: "+91 98765 43210" },
                { icon: Mail, label: "Email", value: "support@putulfashions.com" },
                { icon: MessageCircle, label: "WhatsApp", value: "+91 98765 43210" },
                { icon: MapPin, label: "Address", value: "Nanakpuri Colony, Khatipura Road, Jaipur, Rajasthan 302006" },
              ].map(c => (
                <div key={c.label} className="flex items-start gap-4">
                  <div className="w-10 h-10 border border-secondary flex items-center justify-center flex-shrink-0">
                    <c.icon size={16} className="text-secondary" />
                  </div>
                  <div>
                    <p className="text-xs tracking-widest uppercase font-semibold mb-1">{c.label}</p>
                    <p className="text-sm text-muted-foreground">{c.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Form */}
          <motion.form
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            onSubmit={handleSubmit}
            className="space-y-4"
          >
            <div>
              <label className="text-xs tracking-widest uppercase font-semibold mb-1 block">Name</label>
              <input
                type="text"
                required
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                className="w-full border border-border bg-transparent px-4 py-3 text-sm focus:outline-none focus:border-secondary transition-colors"
              />
            </div>
            <div>
              <label className="text-xs tracking-widest uppercase font-semibold mb-1 block">Email</label>
              <input
                type="email"
                required
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                className="w-full border border-border bg-transparent px-4 py-3 text-sm focus:outline-none focus:border-secondary transition-colors"
              />
            </div>
            <div>
              <label className="text-xs tracking-widest uppercase font-semibold mb-1 block">Subject</label>
              <input
                type="text"
                required
                value={form.subject}
                onChange={e => setForm({ ...form, subject: e.target.value })}
                className="w-full border border-border bg-transparent px-4 py-3 text-sm focus:outline-none focus:border-secondary transition-colors"
              />
            </div>
            <div>
              <label className="text-xs tracking-widest uppercase font-semibold mb-1 block">Message</label>
              <textarea
                rows={5}
                required
                value={form.message}
                onChange={e => setForm({ ...form, message: e.target.value })}
                className="w-full border border-border bg-transparent px-4 py-3 text-sm focus:outline-none focus:border-secondary transition-colors resize-none"
              />
            </div>
            <button type="submit" className="btn-primary w-full text-center">
              Send Message
            </button>
          </motion.form>
        </div>

        {/* Map placeholder */}
        <div className="mt-16 bg-accent h-64 md:h-96 flex items-center justify-center">
          <div className="text-center">
            <MapPin size={32} className="mx-auto text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">Nanakpuri Colony, Khatipura Road, Jaipur, Rajasthan 302006</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
