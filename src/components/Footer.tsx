import { Link } from "react-router-dom";
import { Instagram, Facebook, Twitter } from "lucide-react";

const Footer = () => (
  <footer className="bg-foreground text-background grain-overlay">
    <div className="container mx-auto px-6 md:px-12 relative z-10">
      {/* Top — large brand statement */}
      <div className="py-20 md:py-28 border-b border-background/10">
        <div className="grid md:grid-cols-2 gap-12 items-end">
          <div>
            <h2 className="font-heading text-5xl md:text-7xl font-light tracking-tight text-background leading-[1.05]">
              PUTUL
            </h2>
            <p className="text-background/30 text-sm font-light leading-[2] mt-4 max-w-sm">
              Step Into Style. Walk With Confidence. Premium men's footwear for the modern man.
            </p>
          </div>
          <div className="flex md:justify-end gap-4">
            <a href="#" className="w-10 h-10 border border-background/15 flex items-center justify-center hover:border-secondary hover:text-secondary transition-all duration-500" aria-label="Instagram">
              <Instagram size={15} strokeWidth={1.2} />
            </a>
            <a href="#" className="w-10 h-10 border border-background/15 flex items-center justify-center hover:border-secondary hover:text-secondary transition-all duration-500" aria-label="Facebook">
              <Facebook size={15} strokeWidth={1.2} />
            </a>
            <a href="#" className="w-10 h-10 border border-background/15 flex items-center justify-center hover:border-secondary hover:text-secondary transition-all duration-500" aria-label="Twitter">
              <Twitter size={15} strokeWidth={1.2} />
            </a>
          </div>
        </div>
      </div>

      {/* Links */}
      <div className="py-14 grid grid-cols-2 md:grid-cols-4 gap-10">
        <div>
          <h4 className="text-[9px] tracking-[0.3em] uppercase text-secondary mb-6">Navigate</h4>
          <div className="flex flex-col gap-3">
            {[
              { label: "Home", to: "/" },
              { label: "Shop All", to: "/shop" },
              { label: "About", to: "/about" },
              { label: "Contact", to: "/contact" },
            ].map((l) => (
              <Link key={l.label} to={l.to} className="text-xs text-background/30 hover:text-secondary transition-colors font-light">
                {l.label}
              </Link>
            ))}
          </div>
        </div>
        <div>
          <h4 className="text-[9px] tracking-[0.3em] uppercase text-secondary mb-6">Categories</h4>
          <div className="flex flex-col gap-3">
            {["Crocs", "Sports Shoes", "Slides & Slippers", "Loafer Sandals"].map((c) => (
              <Link key={c} to="/shop" className="text-xs text-background/30 hover:text-secondary transition-colors font-light">
                {c}
              </Link>
            ))}
          </div>
        </div>
        <div>
          <h4 className="text-[9px] tracking-[0.3em] uppercase text-secondary mb-6">Contact</h4>
          <div className="space-y-3 text-xs text-background/30 font-light">
            <p>support@putulfashions.com</p>
            <p>+91 98765 43210</p>
            <p>India</p>
          </div>
        </div>
        <div>
          <h4 className="text-[9px] tracking-[0.3em] uppercase text-secondary mb-6">Legal</h4>
          <div className="flex flex-col gap-3">
            {["Privacy Policy", "Terms of Service", "Shipping Policy"].map((t) => (
              <a key={t} href="#" className="text-xs text-background/30 hover:text-secondary transition-colors font-light">
                {t}
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom */}
      <div className="border-t border-background/10 py-8">
        <p className="text-[10px] text-background/20 tracking-wider text-center">
          © 2026 Putul Fashions. All rights reserved.
        </p>
      </div>
    </div>
  </footer>
);

export default Footer;
