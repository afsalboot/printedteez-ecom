import React, { useState } from "react";
import { useSelector } from "react-redux";
import SectionWrapper from "./SectionWrapper.jsx";

const DealsSection = () => {
  const { deals = [] } = useSelector((state) => state.products);
  const { list = [] } = useSelector((state) => state.sections);
  const sectionData = list.find((s) => s.type === "deals");

  const [copied, setCopied] = useState(false);
  if (!sectionData || !deals.length) return null;

  const copy = async (code) => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <>
      <SectionWrapper {...sectionData}>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {deals.map((d) => (
            <div
              key={d._id}
              className="p-5 rounded-[1.6rem] border border-[#B21A15]/10 bg-white shadow-sm hover:shadow-lg transition"
            >
              <p className="text-[11px] uppercase tracking-[0.24em] text-[#B21A15]/55 mb-3">
                Offer Code
              </p>

              <h3 className="text-lg sm:text-xl font-mono tracking-widest break-all text-red-600">
                {d.code}
              </h3>

              <p className="text-sm mt-3 text-gray-600">{d.description}</p>

              <button
                onClick={() => copy(d.code)}
                className="mt-5 px-4 py-2 bg-red-600 text-white rounded-full text-sm font-medium"
              >
                Copy Code
              </button>
            </div>
          ))}
        </div>
      </SectionWrapper>

      {copied && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 bg-red-600 text-white px-4 py-2 rounded-full text-sm shadow-lg">
          Copied!
        </div>
      )}
    </>
  );
};

export default DealsSection;
