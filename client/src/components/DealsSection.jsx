import React, { useState } from "react";
import { useSelector } from "react-redux";
import SectionWrapper from "./SectionWrapper.jsx";

const DealsSection = () => {
  const { deals = [] } = useSelector((state) => state.products);
  const { list = [] } = useSelector((state) => state.sections);

  const sectionData = list.find((s) => s.type === "deals");

  const [copied, setCopied] = useState(false);

  if (!sectionData || !deals.length) return null;

  const handleCopy = async (code) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);

      setTimeout(() => {
        setCopied(false);
      }, 1500);
    } catch (err) {
      console.error("Failed to copy coupon code", err);
    }
  };

  return (
    <>
      <SectionWrapper
        title={sectionData.title}
        subtitle={sectionData.subtitle}
        extra={sectionData.extra}
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {deals.map((offer) => (
            <div
              key={offer._id}
              className="
                relative p-5 rounded-2xl border
                bg-white dark:bg-neutral-900
                border-red-100 dark:border-red-600/30
                shadow-[0_4px_20px_rgba(255,0,0,0.08)]
                hover:shadow-[0_6px_25px_rgba(255,0,0,0.15)]
                hover:-translate-y-0.5 
                transition-all duration-300
              "
            >
              {/* Pill Label */}
              <div className="flex items-center justify-between mb-4">
                <span
                  className="inline-flex items-center px-3 py-1 rounded-full text-[11px] font-semibold uppercase 
                  bg-red-100 text-red-700 border border-red-200
                  dark:bg-red-700/30 dark:text-red-300 dark:border-red-600/40"
                >
                  Coupon
                </span>
                <span className="text-[11px] italic text-gray-500 dark:text-gray-400">
                  Limited time offer
                </span>
              </div>

              {/* Coupon code */}
              <div className="flex items-center gap-3 mt-1">
                <h3
                  className="
                    text-xl font-bold tracking-[0.25em] font-mono 
                    bg-linear-to-r from-red-500/20 to-red-500/10 
                    dark:from-red-700/30 dark:to-red-700/10
                    text-red-700 dark:text-red-300 
                    px-4 py-1.5 rounded-lg
                  "
                >
                  {offer.code}
                </h3>

                <button
                  onClick={() => handleCopy(offer.code)}
                  className="
                    text-[11px] px-3 py-1.5 rounded-full
                    border border-red-200 bg-red-50 text-red-700
                    hover:bg-red-100 hover:border-red-300
                    dark:bg-red-700/20 dark:text-red-200 dark:border-red-600/40 
                    dark:hover:bg-red-700/30
                    transition
                  "
                >
                  Copy
                </button>
              </div>

              {/* Description */}
              <p className="text-sm mt-3 text-gray-700 dark:text-gray-300 leading-relaxed">
                {offer.description ||
                  "Apply this coupon during checkout to unlock savings."}
              </p>

              {/* Discount line */}
              <p className="text-red-600 dark:text-red-400 font-semibold mt-4 text-sm">
                {offer.discountType === "percentage"
                  ? `${offer.amount}% OFF on eligible orders`
                  : `Flat ₹${offer.amount} OFF on eligible orders`}
              </p>

              {/* Footer Note */}
              <p className="mt-1 text-[11px] text-gray-500 dark:text-gray-400">
                Redeem this code at checkout.
              </p>
            </div>
          ))}
        </div>

        {/* Optional CTA Button */}
        {sectionData.extra && (
          <div className="w-full flex justify-center mt-8">
            <button
              className="
                px-7 py-3 rounded-full text-sm font-medium
                bg-linear-to-r from-red-600 to-red-500 
                text-white shadow-sm
                hover:shadow-[0_4px_20px_rgba(255,0,0,0.3)]
                hover:scale-[1.03]
                transition-all
              "
            >
              {sectionData.extra}
            </button>
          </div>
        )}
      </SectionWrapper>

      {/* COPY SUCCESS TOAST */}
      {copied && (
        <div
          className="
          fixed top-4 left-1/2 -translate-x-1/2
          bg-red-600 text-white text-sm font-medium
          px-4 py-2 rounded-full
          shadow-lg
          dark:bg-red-500
          animate-fade-in-out
          z-9999
        "
        >
          Copied!
        </div>
      )}
    </>
  );
};

export default DealsSection;
