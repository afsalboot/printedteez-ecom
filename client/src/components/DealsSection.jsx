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
              className="p-5 rounded-2xl border shadow-sm hover:shadow-lg transition"
            >
              <h3 className="text-lg sm:text-xl font-mono tracking-widest break-all text-red-600">
                {d.code}
              </h3>

              <p className="text-sm mt-2">{d.description}</p>

              <button
                onClick={() => copy(d.code)}
                className="mt-4 px-4 py-2 bg-red-600 text-white rounded-full text-sm"
              >
                Copy Code
              </button>
            </div>
          ))}
        </div>
      </SectionWrapper>

      {copied && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 bg-red-600 text-white px-4 py-2 rounded-full text-sm">
          Copied!
        </div>
      )}
    </>
  );
};

export default DealsSection;
