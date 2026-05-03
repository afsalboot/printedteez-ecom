import React from "react";
import {
  Mail,
  Phone,
  MapPin,
  Facebook,
  Instagram,
  MessageCircle,
} from "lucide-react";

const Contact = () => {
  return (
    <div className="w-full bg-white">
      {/* HEADER */}
      <div className="w-full h-64 bg-gradient-to-r from-[#B21A15] to-red-700 flex flex-col justify-center items-center text-white text-center relative overflow-hidden">
        {/* soft glow */}
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_top,_white,_transparent_60%)]" />
        <div className="relative px-4">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-wide">
            Contact Us
          </h1>
          <p className="text-sm md:text-base mt-3 opacity-95 max-w-xl mx-auto">
            We’re here to help! Reach out to us for support, queries, or feedback.
          </p>
          <span className="inline-flex mt-4 px-4 py-1 rounded-full border border-white/40 text-[11px] uppercase tracking-[0.18em] bg-white/10 backdrop-blur-sm">
            We reply within 24 hours
          </span>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="max-w-6xl mx-auto px-6 py-14 grid md:grid-cols-2 gap-12 lg:gap-16">
        {/* LEFT — CONTACT FORM */}
        <div>
          <h2 className="text-2xl md:text-3xl font-semibold text-gray-900 mb-2">
            Send a Message
          </h2>
          <p className="text-sm text-gray-500 mb-6">
            Have a question about an order, product, or collaboration? Drop a message
            and we’ll get back to you as soon as possible.
          </p>

          <div className="bg-gray-50 rounded-2xl p-5 md:p-6 shadow-sm border border-gray-100">
            <form className="space-y-5">
              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-700">
                  Name
                </label>
                <input
                  type="text"
                  placeholder="Your Name"
                  className="w-full border border-gray-300 rounded-lg px-3 py-3 text-sm focus:ring-2 focus:ring-[#B21A15] focus:border-[#B21A15] outline-none transition"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-700">
                  Email
                </label>
                <input
                  type="email"
                  placeholder="you@example.com"
                  className="w-full border border-gray-300 rounded-lg px-3 py-3 text-sm focus:ring-2 focus:ring-[#B21A15] focus:border-[#B21A15] outline-none transition"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-gray-700">
                    Phone (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="+91 98765 43210"
                    className="w-full border border-gray-300 rounded-lg px-3 py-3 text-sm focus:ring-2 focus:ring-[#B21A15] focus:border-[#B21A15] outline-none transition"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-gray-700">
                    Subject
                  </label>
                  <input
                    type="text"
                    placeholder="Order issue, product query..."
                    className="w-full border border-gray-300 rounded-lg px-3 py-3 text-sm focus:ring-2 focus:ring-[#B21A15] focus:border-[#B21A15] outline-none transition"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-700">
                  Message
                </label>
                <textarea
                  rows={5}
                  placeholder="Write your message here..."
                  className="w-full border border-gray-300 rounded-lg px-3 py-3 text-sm resize-none focus:ring-2 focus:ring-[#B21A15] focus:border-[#B21A15] outline-none transition"
                ></textarea>
              </div>

              <button
                type="submit"
                className="w-full bg-[#B21A15] text-white py-3.5 rounded-lg font-medium text-sm tracking-wide hover:opacity-90 hover:translate-y-[1px] active:translate-y-0 transition-all shadow-md"
              >
                Send Message
              </button>

              <p className="text-[11px] text-gray-500 text-center mt-1">
                By submitting, you agree to be contacted regarding your inquiry.
              </p>
            </form>
          </div>
        </div>

        {/* RIGHT — CONTACT INFO */}
        <div>
          <h2 className="text-2xl md:text-3xl font-semibold text-gray-900 mb-2">
            Get In Touch
          </h2>
          <p className="text-sm text-gray-500 mb-6">
            Prefer talking directly? Reach us through email, phone, or social channels.
          </p>

          <div className="space-y-4 text-gray-700">
            <p className="flex items-center gap-3 text-sm">
              <span className="p-2.5 rounded-full bg-[#B21A15]/10 text-[#B21A15]">
                <Mail size={18} />
              </span>
              support@yourbrand.com
            </p>
            <p className="flex items-center gap-3 text-sm">
              <span className="p-2.5 rounded-full bg-[#B21A15]/10 text-[#B21A15]">
                <Phone size={18} />
              </span>
              +91 98765 43210
            </p>
            <p className="flex items-center gap-3 text-sm">
              <span className="p-2.5 rounded-full bg-[#B21A15]/10 text-[#B21A15]">
                <MapPin size={18} />
              </span>
              Kochi, Kerala, India
            </p>
          </div>

          {/* quick chips */}
          <div className="mt-5 flex flex-wrap gap-2 text-[11px]">
            <span className="px-3 py-1 rounded-full bg-gray-100 text-gray-700">
              Order Support
            </span>
            <span className="px-3 py-1 rounded-full bg-gray-100 text-gray-700">
              Bulk / Corporate
            </span>
            <span className="px-3 py-1 rounded-full bg-gray-100 text-gray-700">
              Collaboration
            </span>
          </div>

          <hr className="my-7 border-gray-200" />

          {/* SOCIALS */}
          <h3 className="text-lg font-semibold text-gray-900 mb-3">
            Follow Us
          </h3>
          <p className="text-sm text-gray-500 mb-3">
            Stay updated with drops, offers & behind-the-scenes.
          </p>
          <div className="flex items-center gap-4">
            <a
              href="#"
              className="p-2.5 bg-gray-100 rounded-full hover:bg-[#B21A15] hover:text-white transition flex items-center justify-center shadow-sm"
            >
              <Facebook size={20} />
            </a>
            <a
              href="#"
              className="p-2.5 bg-gray-100 rounded-full hover:bg-[#B21A15] hover:text-white transition flex items-center justify-center shadow-sm"
            >
              <Instagram size={20} />
            </a>
            <a
              href="#"
              className="p-2.5 bg-gray-100 rounded-full hover:bg-[#B21A15] hover:text-white transition flex items-center justify-center shadow-sm"
            >
              <MessageCircle size={20} />
            </a>
          </div>

          {/* MAP */}
          <div className="mt-8 rounded-2xl overflow-hidden shadow-md border border-gray-100">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d62938.32731854086!2d76.2517649!3d9.9816356!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3b080d036df59d63%3A0xa0e99dbd7a73a0e9!2sKochi%2C%20Kerala!5e0!3m2!1sen!2sin!4v1706776777003!5m2!1sen!2sin"
              width="100%"
              height="250"
              style={{ border: 0 }}
              allowFullScreen=""
              loading="lazy"
              title="Google Map"
              referrerPolicy="no-referrer-when-downgrade"
            ></iframe>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
