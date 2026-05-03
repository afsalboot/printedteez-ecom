import React from "react";
import { useSelector } from "react-redux";
import ProductCard from "./ProductCard.jsx";
import SectionWrapper from "./SectionWrapper.jsx";

const getLowestPrice = (item) => {
  if (Array.isArray(item.sizes) && item.sizes.length) {
    const prices = item.sizes
      .map((size) => Number(size.price))
      .filter((price) => !Number.isNaN(price));
    return prices.length ? Math.min(...prices) : 0;
  }
  return Number(item.price) || 0;
};

const LimitedEditionSection = () => {
  const { limitedEditionProducts = [] } = useSelector(
    (state) => state.products
  );
  const { list = [] } = useSelector((state) => state.sections);

  const sectionData = list.find((s) => s.type === "limited_edition");
  if (!sectionData || !limitedEditionProducts.length) return null;

  return (
    <SectionWrapper {...sectionData}>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
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
