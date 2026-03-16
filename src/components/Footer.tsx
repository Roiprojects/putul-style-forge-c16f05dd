import { Link } from "react-router-dom";
import { Instagram, Facebook, Twitter } from "lucide-react";
import logo from "@/assets/logo.png";

const Footer = () => (
  <footer className="bg-primary text-primary-foreground">
    <div className="container mx-auto px-4 md:px-8 py-16">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
        <div>
          <img src={logo} alt="Putul Fashions" className="h-12 w-auto brightness-0 invert mb-4" />
          <p className="text-primary-foreground/70 text-sm leading-relaxed">
            Step Into Style. Walk With Confidence. Premium men's fashion for the modern man.
          </p>
        </div>
        <div>
          <h4 className="font-heading text-lg mb-4 text-secondary">Quick Links</h4>
          <div className="flex flex-col gap-2">
            {["Home", "Shop", "About", "Contact"].map(l => (
              <Link key={l} to={l === "Home" ? "/" : `/${l.toLowerCase()}`} className="text-sm text-primary-foreground/70 hover:text-secondary transition-colors">
                {l}
              </Link>
            ))}
          </div>
        </div>
        <div>
          <h4 className="font-heading text-lg mb-4 text-secondary">Categories</h4>
          <div className="flex flex-col gap-2">
            {["T-Shirts", "Shirts", "Jeans", "Jackets", "Hoodies"].map(c => (
              <Link key={c} to="/shop" className="text-sm text-primary-foreground/70 hover:text-secondary transition-colors">
                {c}
              </Link>
            ))}
          </div>
        </div>
        <div>
          <h4 className="font-heading text-lg mb-4 text-secondary">Follow Us</h4>
          <div className="flex gap-4">
            <a href="#" className="p-2 border border-primary-foreground/20 hover:border-secondary hover:text-secondary transition-colors" aria-label="Instagram">
              <Instagram size={18} />
            </a>
            <a href="#" className="p-2 border border-primary-foreground/20 hover:border-secondary hover:text-secondary transition-colors" aria-label="Facebook">
              <Facebook size={18} />
            </a>
            <a href="#" className="p-2 border border-primary-foreground/20 hover:border-secondary hover:text-secondary transition-colors" aria-label="Twitter">
              <Twitter size={18} />
            </a>
          </div>
          <p className="text-sm text-primary-foreground/50 mt-6">support@putulfashions.com</p>
          <p className="text-sm text-primary-foreground/50">+91 98765 43210</p>
        </div>
      </div>
      <div className="border-t border-primary-foreground/10 mt-12 pt-8 text-center">
        <p className="text-xs text-primary-foreground/40">© 2026 Putul Fashions. All rights reserved.</p>
      </div>
    </div>
  </footer>
);

export default Footer;
