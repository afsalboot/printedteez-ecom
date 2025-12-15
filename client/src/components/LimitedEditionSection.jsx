import React from "react";
import { useSelector } from "react-redux";
import ProductCard from "./ProductCard.jsx";
import SectionWrapper from "./SectionWrapper.jsx";

const LimitedEditionSection = () => {
  const { limitedEditionProducts = [], loading } = useSelector(
    (state) => state.products
  );
  const { list = [] } = useSelector((state) => state.sections);

  // Find the matching section config from admin
  const sectionData = list.find((s) => s.type === "limited_edition");

  // Hide if admin removed this section OR no products available
  if (!sectionData || !limitedEditionProducts.length) return null;

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
      {/* Loading state */}
      {loading && (
        <p className="w-full text-center text-xs text-gray-500 mb-3">
          Loading limited drops...
        </p>
      )}

      {/* Products grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {limitedEditionProducts.map((item) => (
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
            badge="Limited"
          />
        ))}
      </div>
    </SectionWrapper>
  );
};

export default LimitedEditionSection;
