import React from "react";

const BrandLoader = ({
  label = "Loading",
  size = "md",
  tone = "light",
  fullScreen = false,
  className = "",
}) => {
  const sizeClass =
    size === "sm"
      ? "h-4 w-4"
      : size === "lg"
        ? "h-14 w-14"
        : "h-5 w-5";
  const textClass =
    tone === "dark" ? "text-white/90" : "text-[#7f1d1d]";
  const ringClass =
    tone === "dark"
      ? "border-white/20 border-t-[#ffb1a9]"
      : "border-[#b21a15]/16 border-t-[#B21A15]";
  const accentClass =
    tone === "dark" ? "bg-[#ffb1a9]/20" : "bg-[#B21A15]/12";

  const content = (
    <div className={`inline-flex items-center gap-3 ${textClass} ${className}`.trim()}>
      <span className="relative inline-flex items-center justify-center">
        <span
          className={`rounded-full border-[3px] ${ringClass} ${sizeClass} animate-brand-spinner`}
        />
        <span
          className={`absolute h-2 w-2 rounded-full ${accentClass} animate-brand-pulse-dot`}
        />
      </span>
      <span className="text-sm font-semibold tracking-[0.18em] uppercase">
        {label}
      </span>
    </div>
  );

  if (!fullScreen) {
    return content;
  }

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-[rgba(10,10,12,0.52)] px-6 backdrop-blur-sm">
      <div className="animate-brand-loader-panel rounded-[2rem] border border-white/10 bg-[#161312]/94 px-8 py-7 shadow-[0_24px_80px_rgba(0,0,0,0.45)]">
        {content}
      </div>
    </div>
  );
};

export default BrandLoader;
