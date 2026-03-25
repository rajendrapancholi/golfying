import Link from "next/link";
import { Heart, Globe, GlobeIcon } from "lucide-react";
import { FiGithub } from "react-icons/fi";
import { FaLinkedin, FaXTwitter } from "react-icons/fa6";

export default function Footer() {
  return (
    <footer className="border-t border-border bg-muted/30 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand & Mission (PRD Section 01) */}
          <div className="md:col-span-2 space-y-4">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-6 h-6 bg-primary rounded-md flex items-center justify-center text-white font-black text-[10px]">
                G
              </div>
              <span className="text-lg font-black tracking-tighter text-foreground">
                Golf<span className="text-primary">ying</span>
              </span>
            </Link>
            <p className="text-sm text-muted-foreground max-w-xs leading-relaxed">
              A premium performance platform where every round fuels global
              impact. 10% of every subscription goes directly to your chosen
              mission.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="text-xs font-black uppercase tracking-widest text-foreground">
              Platform
            </h4>
            <nav className="flex flex-col gap-2 text-sm text-muted-foreground">
              <Link
                href="/charities"
                className="hover:text-primary transition-colors"
              >
                Explore Charities
              </Link>
              <Link
                href="/#mechanics"
                className="hover:text-primary transition-colors"
              >
                Draw Mechanics
              </Link>
              <Link
                href="/subscribe"
                className="hover:text-primary transition-colors"
              >
                Pricing Plans
              </Link>
            </nav>
          </div>

          {/* Legal & Social */}
          <div className="space-y-4">
            <h4 className="text-xs font-black uppercase tracking-widest text-foreground">
              Legal
            </h4>
            <nav className="flex flex-col gap-2 text-sm text-muted-foreground">
              <Link
                href="/privacy"
                className="hover:text-primary transition-colors"
              >
                Privacy Policy
              </Link>
              <Link
                href="/terms"
                className="hover:text-primary transition-colors"
              >
                Terms of Service
              </Link>
              <div className="flex gap-4 pt-2">
                <Link
                  href={"https://github.com/rajendrapancholi"}
                  target="_blank"
                >
                  <FiGithub
                    size={16}
                    className="cursor-pointer hover:text-primary"
                  />
                </Link>
                <Link
                  href={
                    "https://www.linkedin.com/in/rajendra-pancholi-11a3a5286/"
                  }
                  target="_blank"
                >
                  <FaLinkedin
                    size={16}
                    className="cursor-pointer hover:text-primary"
                  />
                </Link>
                <Link
                  href={"https://rajendrapancholi.vercel.app/"}
                  target="_blank"
                >
                  <GlobeIcon
                    size={16}
                    className="cursor-pointer hover:text-primary"
                  />
                </Link>
              </div>
            </nav>
          </div>
        </div>

        {/* Bottom Bar (PRD Compliance) */}
        <div className="mt-12 pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em]">
            © 2026 GOLFYING · POWERED BY DIGITAL HEROES
          </p>
          <div className="flex items-center gap-2 text-[10px] font-black text-primary uppercase tracking-widest">
            <Heart size={12} className="fill-current" />
            Supporting Impact Through Sport
            <Globe size={12} />
          </div>
        </div>
      </div>
    </footer>
  );
}
