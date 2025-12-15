import React from "react";
import { useSelector } from "react-redux";
import ProductCard from "./ProductCard.jsx";
import SectionWrapper from "./SectionWrapper.jsx";

const BestSellersSection = () => {
  const { bestSellers = [] } = useSelector((state) => state.products);
  const { list = [] } = useSelector((state) => state.sections);

  const sectionData = list.find((s) => s.type === "best_sellers");
  if (!sectionData || !bestSellers.length) return null;

  return (
    <SectionWrapper {...sectionData}>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
        {bestSellers.map((item) => (
          <ProductCard
            key={item._id}
            id={item._id}
            image={
              item.colors?.[0]?.images?.[0] ||
              item.images?.[0] ||
              "/no-image.png"
            }
            title={item.title}
            price={item.price}
            badge="Best Seller"
          />
        ))}
      </div>
    </SectionWrapper>
  );
};

export default BestSellersSection;
