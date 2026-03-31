import { Link } from "react-router-dom";
import { Instagram, Facebook, Twitter } from "lucide-react";
import putulFooterLogo from "@/assets/putul-footer-logo-new.png";

const Footer = () => (
  <footer className="bg-foreground text-background pb-16 md:pb-0">
    <div className="container mx-auto px-4 md:px-8">
      {/* Main footer content */}
      <div className="py-10 md:py-14 grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-10">
        {/* Brand */}
        <div className="col-span-2 md:col-span-1">
          <img src={putulFooterLogo} alt="Putul Logo" className="h-14 w-auto mb-2 invert brightness-0 invert ml-5" />
          <h2 className="font-heading text-2xl font-semibold tracking-[0.1em] text-background mb-3">PUTUL</h2>
          <p className="text-xs text-background/40 leading-relaxed mb-4 max-w-xs">
            Premium men's footwear for the modern man. Step into style, walk with confidence.
          </p>
          <div className="flex gap-3">
            <a href="https://www.instagram.com/putul.fashion/" target="_blank" rel="noopener noreferrer" className="w-9 h-9 border border-background/15 flex items-center justify-center rounded-full hover:border-secondary hover:text-secondary transition-all" aria-label="Instagram">
              <Instagram size={15} strokeWidth={1.3} />
            </a>
            <a href="https://www.facebook.com/PUTUL.Fashions" target="_blank" rel="noopener noreferrer" className="w-9 h-9 border border-background/15 flex items-center justify-center rounded-full hover:border-secondary hover:text-secondary transition-all" aria-label="Facebook"> target="_blank" rel="noopener noreferrer" className="w-9 h-9 border border-background/15 flex items-center justify-center rounded-full hover:border-secondary hover:text-secondary transition-all" aria-label="Facebook"> target="_blank" rel="noopener noreferrer" className="w-9 h-9 border border-background/15 flex items-center justify-center rounded-full hover:border-secondary hover:text-secondary transition-all" aria-label="Facebook">
              <Facebook size={15} strokeWidth={1.3} />
            </a>
            <a href="https://twitter.com/putulfashion" target="_blank" rel="noopener noreferrer" className="w-9 h-9 border border-background/15 flex items-center justify-center rounded-full hover:border-secondary hover:text-secondary transition-all" aria-label="Twitter">
              <Twitter size={15} strokeWidth={1.3} />
            </a>
          </div>
        </div>

        {/* Links */}
        <div>
          <h4 className="text-[11px] tracking-wide uppercase font-semibold text-background/70 mb-4">Navigate</h4>
          <div className="flex flex-col gap-2.5">
            {[
              { label: "Home", to: "/" },
              { label: "Shop All", to: "/shop" },
              { label: "About", to: "/about" },
              { label: "Contact", to: "/contact" },
            ].map((l) => (
              <Link key={l.label} to={l.to} className="text-xs text-background/35 hover:text-secondary transition-colors">
                {l.label}
              </Link>
            ))}
          </div>
        </div>
        <div>
          <h4 className="text-[11px] tracking-wide uppercase font-semibold text-background/70 mb-4">Categories</h4>
          <div className="flex flex-col gap-2.5">
            {[
              { label: "Crocs", to: "/shop?category=crocs" },
              { label: "Sports Shoes", to: "/shop?category=sports-shoes" },
              { label: "Slides & Slippers", to: "/shop?category=slides-slippers" },
              { label: "Loafer Sandals", to: "/shop?category=loafer-sandals" },
            ].map((c) => (
              <Link key={c.label} to={c.to} className="text-xs text-background/35 hover:text-secondary transition-colors">
                {c.label}
              </Link>
            ))}
          </div>
        </div>
        <div>
          <h4 className="text-[11px] tracking-wide uppercase font-semibold text-background/70 mb-4">Contact</h4>
          <div className="space-y-2.5 text-xs text-background/35">
            <p>support@putulfashions.com</p>
            <p>+91 80006 85588</p>
            <p>India</p>
          </div>
        </div>
      </div>

      {/* Bottom */}
      <div className="border-t border-background/10 py-5 flex flex-col items-center gap-2">
        <div className="w-full flex flex-col md:flex-row items-center justify-between gap-2">
          <p className="text-[10px] text-background/25 tracking-wide">
            © 2026 Putul Fashions. All rights reserved.
          </p>
          <div className="flex gap-4">
            <Link to="/privacy-policy" className="text-[10px] text-background/25 hover:text-secondary transition-colors">
              Privacy Policy
            </Link>
            <Link to="/terms-of-service" className="text-[10px] text-background/25 hover:text-secondary transition-colors">
              Terms of Service
            </Link>
            <Link to="/shipping-policy" className="text-[10px] text-background/25 hover:text-secondary transition-colors">
              Shipping Policy
            </Link>
          </div>
        </div>
        <a
          href="https://wa.me/919945379333"
          target="_blank"
          rel="noopener noreferrer"
          className="text-[10px] text-background/25 hover:text-secondary transition-colors text-center"
        >
          Developed by ROI Infotech
        </a>
      </div>
    </div>
  </footer>
);

export default Footer;
