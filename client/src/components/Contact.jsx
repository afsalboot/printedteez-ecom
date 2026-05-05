import React, { useEffect, useState } from "react";
import {
  Mail,
  Phone,
  MapPin,
  Facebook,
  Instagram,
  MessageCircle,
  Send,
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { getSitePage } from "../redux/slices/sitePageSlice.jsx";

const socialIcons = {
  facebook: Facebook,
  instagram: Instagram,
  whatsapp: MessageCircle,
};

const Contact = () => {
  const dispatch = useDispatch();
  const { pages = {}, loading } = useSelector((state) => state.sitePages);
  const contactPage = pages.contact;
  const hero = contactPage?.hero || {};
  const content = contactPage?.content || {};
  const chips = Array.isArray(content.chips) ? content.chips : [];
  const socials = Array.isArray(content.socials) ? content.socials : [];
  const [formState, setFormState] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (!contactPage) {
      dispatch(getSitePage("contact"));
    }
  }, [contactPage, dispatch]);

  const handleChange = (field, value) => {
    setFormState((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const subject = encodeURIComponent(formState.subject || "Store inquiry");
    const body = encodeURIComponent(
      `Name: ${formState.name}\nEmail: ${formState.email}\nPhone: ${formState.phone}\n\n${formState.message}`
    );
    window.location.href = `mailto:${content.email || "support@printedteez.com"}?subject=${subject}&body=${body}`;
    setSubmitted(true);
  };

  return (
    <div className="w-full bg-transparent text-slate-900 dark:text-slate-100">
      <div className="relative overflow-hidden bg-gradient-to-r from-[#B21A15] via-[#c5261f] to-red-700 text-white">
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_top,_white,_transparent_60%)]" />
        <div className="relative mx-auto flex min-h-[280px] max-w-6xl flex-col items-center justify-center px-4 py-16 text-center sm:min-h-[320px]">
          <p className="text-xs uppercase tracking-[0.34em] text-white/75">
            {hero.eyebrow || "Contact / Support"}
          </p>
          <h1 className="mt-4 text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl">
            {hero.title || "Contact Us"}
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-white/90 sm:text-base">
            {hero.subtitle || "Loading contact details..."}
          </p>
          <span className="mt-5 inline-flex rounded-full border border-white/30 bg-white/10 px-4 py-1.5 text-[11px] uppercase tracking-[0.2em] backdrop-blur-sm">
            {hero.badge || "We reply within 24 hours"}
          </span>
        </div>
      </div>

      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:px-6 sm:py-14 lg:grid-cols-[minmax(0,1fr)_420px] lg:gap-12">
        <div>
          <h2 className="text-2xl font-semibold text-slate-950 dark:text-white sm:text-3xl">
            {content.formTitle || "Send a Message"}
          </h2>
          <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300">
            {content.formIntro || "Have a question about an order, product, or collaboration?"}
          </p>

          <div className="mt-6 rounded-[2rem] border border-slate-200/80 bg-white/90 p-5 shadow-[0_18px_50px_rgba(15,23,42,0.08)] dark:border-white/10 dark:bg-white/[0.05] sm:p-6">
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="grid gap-4 sm:grid-cols-2">
                <input className="w-full rounded-2xl border border-slate-200 bg-[#fbfaf7] px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-[#B21A15] focus:bg-white dark:border-white/10 dark:bg-white/[0.04] dark:text-white dark:placeholder:text-slate-400" placeholder="Your Name" value={formState.name} onChange={(e) => handleChange("name", e.target.value)} required />
                <input className="w-full rounded-2xl border border-slate-200 bg-[#fbfaf7] px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-[#B21A15] focus:bg-white dark:border-white/10 dark:bg-white/[0.04] dark:text-white dark:placeholder:text-slate-400" type="email" placeholder="you@example.com" value={formState.email} onChange={(e) => handleChange("email", e.target.value)} required />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <input className="w-full rounded-2xl border border-slate-200 bg-[#fbfaf7] px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-[#B21A15] focus:bg-white dark:border-white/10 dark:bg-white/[0.04] dark:text-white dark:placeholder:text-slate-400" placeholder="+91 98765 43210" value={formState.phone} onChange={(e) => handleChange("phone", e.target.value)} />
                <input className="w-full rounded-2xl border border-slate-200 bg-[#fbfaf7] px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-[#B21A15] focus:bg-white dark:border-white/10 dark:bg-white/[0.04] dark:text-white dark:placeholder:text-slate-400" placeholder="Subject" value={formState.subject} onChange={(e) => handleChange("subject", e.target.value)} required />
              </div>
              <textarea className="min-h-[160px] w-full rounded-2xl border border-slate-200 bg-[#fbfaf7] px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-[#B21A15] focus:bg-white dark:border-white/10 dark:bg-white/[0.04] dark:text-white dark:placeholder:text-slate-400" placeholder="Write your message here..." value={formState.message} onChange={(e) => handleChange("message", e.target.value)} required />
              <button className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#B21A15] px-6 py-3.5 text-sm font-semibold text-white shadow-[0_18px_40px_rgba(178,26,21,0.25)] transition hover:bg-[#97150f]" type="submit">
                <Send className="h-4 w-4" />
                Send Message
              </button>
              <p className="text-center text-[11px] leading-5 text-slate-500 dark:text-slate-400">
                {submitted
                  ? "Your email app should open with the inquiry details filled in."
                  : content.responseNote || "By submitting, you agree to be contacted regarding your inquiry."}
              </p>
            </form>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-[2rem] border border-slate-200/80 bg-white/90 p-5 shadow-[0_18px_50px_rgba(15,23,42,0.08)] dark:border-white/10 dark:bg-white/[0.05] sm:p-6">
            <h2 className="text-2xl font-semibold text-slate-950 dark:text-white">
              {content.infoTitle || "Get In Touch"}
            </h2>
            <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300">
              {content.infoIntro || "Prefer talking directly? Reach us through email, phone, or social channels."}
            </p>

            <div className="mt-6 space-y-4">
              <p className="flex items-center gap-3 text-sm text-slate-700 dark:text-slate-200">
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#B21A15]/10 text-[#B21A15]">
                  <Mail className="h-4.5 w-4.5" />
                </span>
                {content.email}
              </p>
              <p className="flex items-center gap-3 text-sm text-slate-700 dark:text-slate-200">
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#B21A15]/10 text-[#B21A15]">
                  <Phone className="h-4.5 w-4.5" />
                </span>
                {content.phone}
              </p>
              <p className="flex items-center gap-3 text-sm text-slate-700 dark:text-slate-200">
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#B21A15]/10 text-[#B21A15]">
                  <MapPin className="h-4.5 w-4.5" />
                </span>
                {content.address}
              </p>
            </div>

            <div className="mt-6 flex flex-wrap gap-2 text-[11px]">
              {chips.map((chip, index) => (
                <span key={`${chip}-${index}`} className="rounded-full bg-[#f4efe9] px-3 py-1.5 uppercase tracking-[0.14em] text-slate-700 dark:bg-white/[0.06] dark:text-slate-200">
                  {chip}
                </span>
              ))}
            </div>
          </div>

          <div className="rounded-[2rem] border border-slate-200/80 bg-[#20171a] p-5 text-white shadow-[0_18px_50px_rgba(15,23,42,0.14)] sm:p-6">
            <h3 className="text-lg font-semibold">Follow Us</h3>
            <p className="mt-3 text-sm leading-7 text-white/70">
              Stay updated with new drops, offers, and behind-the-scenes updates.
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              {socials.map((item, index) => {
                const Icon =
                  socialIcons[item.label?.toLowerCase()] || MessageCircle;
                return (
                  <a
                    key={`${item.label || "social"}-${index}`}
                    href={item.url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-white/15"
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </a>
                );
              })}
            </div>
          </div>

          <div className="overflow-hidden rounded-[2rem] border border-slate-200/80 bg-white shadow-[0_18px_50px_rgba(15,23,42,0.08)] dark:border-white/10 dark:bg-white/[0.05]">
            <iframe
              src={content.mapEmbedUrl}
              width="100%"
              height="280"
              style={{ border: 0 }}
              allowFullScreen=""
              loading="lazy"
              title="Google Map"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>

          {!contactPage && loading ? (
            <p className="text-sm text-slate-500 dark:text-slate-400">Loading contact content...</p>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default Contact;
