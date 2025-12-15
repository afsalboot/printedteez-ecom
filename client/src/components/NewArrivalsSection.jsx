import React from "react";
import { useSelector } from "react-redux";
import ProductCard from "./ProductCard.jsx";
import SectionWrapper from "./SectionWrapper.jsx";

const NewArrivalsSection = () => {
  const { newArrivals = [], loading } = useSelector((state) => state.products);
  const { list = [] } = useSelector((state) => state.sections);

  // get config from admin
  const sectionData = list.find((s) => s.type === "new_arrivals");

  // hide if admin removed or no data
  if (!sectionData || !newArrivals.length) return null;

  const getLowestPrice = (item) => {
    if (Array.isArray(item.sizes) && item.sizes.length) {
      const prices = item.sizes
        .map((s) => Number(s.price))
        .filter((p) => !Number.isNaN(p));

      return prices.length ? Math.min(...prices) : 0;
    }

    return Number(item.price) || 0;
  };

  return (
    <SectionWrapper
      title={sectionData.title}
      subtitle={sectionData.subtitle}
      extra={sectionData.extra}
    >
      {/* Loading text */}
      {loading && (
        <p className="w-full text-center text-xs text-gray-500 mb-3">
          Loading new arrivals...
        </p>
      )}

      {/* Products grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {newArrivals.map((item) => (
          <ProductCard
            key={item._id}
            id={item._id}
            image={
              item.colors?.[0]?.images?.[0] ||
              item.images?.[0] ||
              "/no-image.png"
            }
            title={item.title}
            price={getLowestPrice(item)}
            badge="New"
          />
        ))}
      </div>

      {/* Optional Explore button controlled by Admin "extra" */}
      {sectionData.extra && (
        <div className="w-full flex justify-center mt-6">
          <button className="px-6 py-2 bg-black text-white rounded-full text-sm hover:opacity-90 transition">
            {sectionData.extra}
          </button>
        </div>
      )}
    </SectionWrapper>
  );
};

export default NewArrivalsSection;
