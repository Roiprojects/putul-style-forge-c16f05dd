import { Link } from "react-router-dom";
import { Instagram, Facebook, Twitter } from "lucide-react";

const Footer = () => (
  <footer className="bg-foreground text-background">
    <div className="container mx-auto px-4 md:px-8 py-16 md:py-20">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
        <div className="md:col-span-1">
          <h2 className="font-heading text-3xl font-bold mb-4 text-background">PUTUL</h2>
          <p className="text-background/50 text-sm leading-relaxed mb-6">
            Step Into Style. Walk With Confidence. Premium men's footwear for the modern man.
          </p>
          <div className="flex gap-3">
            <a href="#" className="w-10 h-10 border border-background/20 flex items-center justify-center hover:border-secondary hover:text-secondary transition-colors" aria-label="Instagram">
              <Instagram size={16} />
            </a>
            <a href="#" className="w-10 h-10 border border-background/20 flex items-center justify-center hover:border-secondary hover:text-secondary transition-colors" aria-label="Facebook">
              <Facebook size={16} />
            </a>
            <a href="#" className="w-10 h-10 border border-background/20 flex items-center justify-center hover:border-secondary hover:text-secondary transition-colors" aria-label="Twitter">
              <Twitter size={16} />
            </a>
          </div>
        </div>
        <div>
          <h4 className="text-xs tracking-[0.2em] uppercase font-semibold text-secondary mb-6">Quick Links</h4>
          <div className="flex flex-col gap-3">
            {[
              { label: "Home", to: "/" },
              { label: "Shop All", to: "/shop" },
              { label: "About Us", to: "/about" },
              { label: "Contact", to: "/contact" },
            ].map((l) => (
              <Link key={l.label} to={l.to} className="text-sm text-background/50 hover:text-secondary transition-colors">
                {l.label}
              </Link>
            ))}
          </div>
        </div>
        <div>
          <h4 className="text-xs tracking-[0.2em] uppercase font-semibold text-secondary mb-6">Categories</h4>
          <div className="flex flex-col gap-3">
            {["Crocs", "Sports Shoes", "Slides & Slippers", "Loafer Sandals"].map((c) => (
              <Link key={c} to="/shop" className="text-sm text-background/50 hover:text-secondary transition-colors">
                {c}
              </Link>
            ))}
          </div>
        </div>
        <div>
          <h4 className="text-xs tracking-[0.2em] uppercase font-semibold text-secondary mb-6">Contact</h4>
          <div className="space-y-3 text-sm text-background/50">
            <p>support@putulfashions.com</p>
            <p>+91 98765 43210</p>
            <p className="leading-relaxed">India</p>
          </div>
        </div>
      </div>
      <div className="border-t border-background/10 mt-14 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
        <p className="text-xs text-background/30">© 2026 Putul Fashions. All rights reserved.</p>
        <div className="flex gap-6">
          {["Privacy Policy", "Terms of Service", "Shipping Policy"].map((t) => (
            <a key={t} href="#" className="text-xs text-background/30 hover:text-secondary transition-colors">
              {t}
            </a>
          ))}
        </div>
      </div>
    </div>
  </footer>
);

export default Footer;
