import React from "react";
import { Link } from "react-router";
import {
  ArrowRight,
  Facebook,
  Instagram,
  Mail,
  MapPin,
  Phone,
  Twitter,
} from "lucide-react";

const Footer = () => {
  return (
    <footer className="mt-14 border-t border-black/5 bg-[#161312] text-[#f6efe8] dark:border-white/8 dark:bg-[linear-gradient(180deg,_#0f1116_0%,_#151821_55%,_#1a1f29_100%)]">
      <div className="mx-auto max-w-7xl px-6 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="rounded-[2rem] border border-white/10 bg-[linear-gradient(145deg,_rgba(178,26,21,0.22),_rgba(255,255,255,0.02))] p-6 sm:p-8 dark:border-[#ff8f82]/14 dark:bg-[radial-gradient(circle_at_top_left,_rgba(197,58,45,0.22),_transparent_34%),linear-gradient(145deg,_rgba(31,26,32,0.96),_rgba(20,24,31,0.92))]">
            <div className="flex items-center gap-4">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#f3b2aa]">
                  PrintedTeez
                </p>
                <p className="mt-1 text-sm text-white/70">
                  Everyday streetwear with a sharper visual edge.
                </p>
              </div>
            </div>

            <h2 className="mt-8 max-w-xl text-3xl font-semibold leading-tight text-white sm:text-4xl">
              Wear the graphic. Keep the silhouette clean.
            </h2>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-white/72">
              PrintedTeez blends bold print language with wearable fits, cleaner finishes,
              and pieces designed to stay in rotation.
            </p>

            <div className="mt-7 flex flex-wrap gap-3">
              <Link
                to="/shop"
                className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-semibold text-[#161312] transition hover:bg-[#f5ebe4] dark:bg-[#c53a2d] dark:text-white dark:shadow-[0_14px_30px_rgba(197,58,45,0.28)] dark:hover:bg-[#d44739]"
              >
                Shop Collection
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/about"
                className="inline-flex items-center rounded-full border border-white/15 px-5 py-3 text-sm font-semibold text-white transition hover:border-white/35 dark:border-white/12 dark:bg-white/4 dark:hover:bg-white/8"
              >
                Our Story
              </Link>
            </div>
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            <div className="rounded-[2rem] border border-white/8 bg-white/4 p-6 dark:border-white/10 dark:bg-white/4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#f3b2aa]">
                Explore
              </p>
              <div className="mt-5 grid gap-3 text-sm text-white/78">
                <Link to="/shop" className="transition hover:text-white">
                  All Products
                </Link>
                <Link to="/event" className="transition hover:text-white">
                  Events
                </Link>
                <Link to="/blog" className="transition hover:text-white">
                  Blog
                </Link>
                <Link to="/about" className="transition hover:text-white">
                  About
                </Link>
                <Link to="/contact" className="transition hover:text-white">
                  Contact
                </Link>
              </div>
            </div>

            <div className="rounded-[2rem] border border-white/8 bg-white/4 p-6 dark:border-white/10 dark:bg-white/4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#f3b2aa]">
                Contact
              </p>
              <div className="mt-5 grid gap-4 text-sm text-white/78">
                <div className="flex items-start gap-3">
                  <Mail className="mt-0.5 h-4 w-4 text-[#f3b2aa]" />
                  <span>support@printedteez.com</span>
                </div>
                <div className="flex items-start gap-3">
                  <Phone className="mt-0.5 h-4 w-4 text-[#f3b2aa]" />
                  <span>+91 98765 43210</span>
                </div>
                <div className="flex items-start gap-3">
                  <MapPin className="mt-0.5 h-4 w-4 text-[#f3b2aa]" />
                  <span>Bengaluru, India</span>
                </div>
              </div>
            </div>

            <div className="rounded-[2rem] border border-white/8 bg-white/4 p-6 dark:border-white/10 dark:bg-white/4 sm:col-span-2">
              <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#f3b2aa]">
                    Follow Along
                  </p>
                  <p className="mt-2 text-sm text-white/70">
                    New drops, styling references, and product updates.
                  </p>
                </div>
                <div className="flex gap-3">
                  <a
                    href="#"
                    aria-label="Facebook"
                    className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/12 text-white/80 transition hover:border-white/30 hover:text-white dark:bg-white/4"
                  >
                    <Facebook size={16} />
                  </a>
                  <a
                    href="#"
                    aria-label="Instagram"
                    className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/12 text-white/80 transition hover:border-white/30 hover:text-white dark:bg-white/4"
                  >
                    <Instagram size={16} />
                  </a>
                  <a
                    href="#"
                    aria-label="Twitter"
                    className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/12 text-white/80 transition hover:border-white/30 hover:text-white dark:bg-white/4"
                  >
                    <Twitter size={16} />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-3 border-t border-white/8 pt-6 text-xs text-white/50 sm:flex-row sm:items-center sm:justify-between">
          <p>&copy; {new Date().getFullYear()} PrintedTeez. All rights reserved.</p>
          <div className="flex flex-wrap gap-4">
            <Link to="/contact" className="transition hover:text-white/80">
              Support
            </Link>
            <Link to="/about" className="transition hover:text-white/80">
              Brand
            </Link>
            <Link to="/shop" className="transition hover:text-white/80">
              Shop
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
