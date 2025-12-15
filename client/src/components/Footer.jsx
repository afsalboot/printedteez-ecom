import React from "react";
import { Link } from "react-router";
import { Facebook, Instagram, Twitter, Mail, Phone, MapPin } from "lucide-react";
import { logo } from "../assets/assets";

const Footer = () => {
  return (
    <footer className="bg-[#B21A15] text-white pt-12 pb-6 mt-10 shadow-inner">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-10 md:gap-12">

        {/* BRAND */}
        <div>
          <Link to="/" className="flex items-center mb-4 group">
            <img
              src={logo}
              alt="logo"
              className="h-12 object-contain transition-transform duration-200 group-hover:scale-105"
            />
          </Link>
          <p className="text-sm text-gray-100 leading-relaxed max-w-xs">
            Premium streetwear inspired by culture, design & lifestyle.
            Quality-first apparel made for everyday comfort.
          </p>

          {/* SOCIAL ICONS */}
          <div className="flex gap-3 mt-5">
            <a
              href="#"
              className="bg-white/15 p-2.5 rounded-lg hover:bg-white/25 hover:-translate-y-[1px] hover:scale-105 transition-all duration-150 flex items-center justify-center"
              aria-label="Facebook"
            >
              <Facebook size={16} />
            </a>
            <a
              href="#"
              className="bg-white/15 p-2.5 rounded-lg hover:bg-white/25 hover:-translate-y-[1px] hover:scale-105 transition-all duration-150 flex items-center justify-center"
              aria-label="Instagram"
            >
              <Instagram size={16} />
            </a>
            <a
              href="#"
              className="bg-white/15 p-2.5 rounded-lg hover:bg-white/25 hover:-translate-y-[1px] hover:scale-105 transition-all duration-150 flex items-center justify-center"
              aria-label="Twitter"
            >
              <Twitter size={16} />
            </a>
          </div>
        </div>

        {/* SHOP LINKS */}
        <div>
          <h3 className="text-lg font-semibold mb-4 tracking-wide">
            Shop
          </h3>
          <ul className="space-y-2 text-sm text-gray-100">
            <li>
              <Link
                to="/shop"
                className="hover:underline hover:underline-offset-4 transition"
              >
                All Products
              </Link>
            </li>
            <li>
              <Link
                to="/collections/streetwear"
                className="hover:underline hover:underline-offset-4 transition"
              >
                Streetwear
              </Link>
            </li>
            <li>
              <Link
                to="/collections/minimal"
                className="hover:underline hover:underline-offset-4 transition"
              >
                Minimal
              </Link>
            </li>
            <li>
              <Link
                to="/collections/summer"
                className="hover:underline hover:underline-offset-4 transition"
              >
                Summer Collection
              </Link>
            </li>
            <li>
              <Link
                to="/collections/new"
                className="hover:underline hover:underline-offset-4 transition"
              >
                New Arrivals
              </Link>
            </li>
          </ul>
        </div>

        {/* SUPPORT LINKS */}
        <div>
          <h3 className="text-lg font-semibold mb-4 tracking-wide">
            Support
          </h3>
          <ul className="space-y-2 text-sm text-gray-100">
            <li>
              <Link
                to="/contact"
                className="hover:underline hover:underline-offset-4 transition"
              >
                Contact Us
              </Link>
            </li>
            <li>
              <Link
                to="/faq"
                className="hover:underline hover:underline-offset-4 transition"
              >
                FAQ
              </Link>
            </li>
            <li>
              <Link
                to="/shipping"
                className="hover:underline hover:underline-offset-4 transition"
              >
                Shipping Info
              </Link>
            </li>
            <li>
              <Link
                to="/returns"
                className="hover:underline hover:underline-offset-4 transition"
              >
                Return Policy
              </Link>
            </li>
            <li>
              <Link
                to="/privacy"
                className="hover:underline hover:underline-offset-4 transition"
              >
                Privacy Policy
              </Link>
            </li>
          </ul>
        </div>

        {/* CONTACT */}
        <div>
          <h3 className="text-lg font-semibold mb-4 tracking-wide">
            Get in Touch
          </h3>
          <ul className="space-y-3 text-sm text-gray-100">
            <li className="flex items-start gap-3">
              <span className="mt-[2px] bg-white/15 rounded-full p-1.5 flex items-center justify-center">
                <Mail size={14} />
              </span>
              <span>support@printedteez.com</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="mt-[2px] bg-white/15 rounded-full p-1.5 flex items-center justify-center">
                <Phone size={14} />
              </span>
              <span>+91 98765 43210</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="mt-[2px] bg-white/15 rounded-full p-1.5 flex items-center justify-center">
                <MapPin size={14} />
              </span>
              <span>Bengaluru, India</span>
            </li>
          </ul>
        </div>
      </div>

      {/* BOTTOM BAR */}
      <div className="mt-8 border-t border-white/20 pt-4">
        <p className="text-center text-xs text-gray-100 tracking-wide">
          © {new Date().getFullYear()} PrintedTeez. All Rights Reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
