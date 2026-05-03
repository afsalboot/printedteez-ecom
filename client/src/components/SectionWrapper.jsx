import React from "react";

const SectionWrapper = ({ title, subtitle, extra, children }) => {
  return (
    <section className="relative">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between mb-7 md:mb-8">
        <div className="max-w-2xl">
          <p className="text-[11px] uppercase tracking-[0.28em] text-[#B21A15]/65 mb-3">
            PrintedTeez Edit
          </p>

          <h2 className="text-2xl sm:text-3xl lg:text-[2rem] font-semibold tracking-tight text-gray-900 dark:text-white">
            {title}
          </h2>

          {subtitle && (
            <p className="text-sm sm:text-[15px] text-gray-600 dark:text-gray-300 mt-2 leading-6">
              {subtitle}
            </p>
          )}
        </div>

        {extra && (
          <div className="self-start md:self-auto rounded-full border border-[#B21A15]/15 bg-[#B21A15]/5 px-4 py-2 text-xs text-[#B21A15] dark:text-red-300">
            {extra}
          </div>
        )}
      </div>

      <div>{children}</div>
    </section>
  );
};

export default SectionWrapper;
