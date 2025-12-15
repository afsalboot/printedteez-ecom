import React from "react";

const SectionWrapper = ({ title, subtitle, extra, children }) => {
  return (
    <section className="mt-16 px-6 text-center">
      
      {/* Heading */}
      <div className="max-w-2xl mx-auto">
        <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white">
          {title}
        </h2>

        {subtitle && (
          <p className="text-gray-600 dark:text-gray-300 mt-1 text-sm">
            {subtitle}
          </p>
        )}

        {extra && (
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {extra}
          </p>
        )}
      </div>

      {/* Content */}
      <div className="mt-8 flex flex-wrap justify-center gap-6">
        {children}
      </div>
    </section>
  );
};

export default SectionWrapper;
