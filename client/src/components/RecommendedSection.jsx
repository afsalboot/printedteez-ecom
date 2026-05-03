import React from "react";
import { useSelector } from "react-redux";
import ProductCard from "./ProductCard.jsx";
import SectionWrapper from "./SectionWrapper.jsx";

const RecommendedSection = () => {
  const { recommendedProducts = [], loading } = useSelector(
    (state) => state.products
  );

  if (!recommendedProducts?.length) return null;

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
      title="Recommended For You"
      subtitle="Curated picks based on your browsing"
    >
      {/* Loading state */}
      {loading && (
        <p className="w-full text-center text-xs text-gray-500 mb-2">
          Loading recommendations...
        </p>
      )}

      {/* HORIZONTAL SLIDER */}
      <div className="relative">
        {/* fade edges for nicer scroll feel */}
        <div className="pointer-events-none absolute inset-y-0 left-0 w-6 bg-linear-to-r from-white to-transparent dark:from-black z-10" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-6 bg-linear-to-l from-white to-transparent dark:from-black z-10" />

        <div
          className="
            flex gap-6 overflow-x-auto scroll-smooth py-4
            -mx-4 px-4
            snap-x snap-mandatory
            [&::-webkit-scrollbar]:hidden
          "
        >
          {recommendedProducts.map((item) => (
            <div
              key={item._id}
              className="min-w-[260px] snap-start flex justify-center"
            >
              <ProductCard
                id={item._id}
                image={
                  item.colors?.[0]?.images?.[0] ||
                  item.images?.[0] ||
                  "/no-image.png"
                }
                title={item.title}
                price={getLowestPrice(item)}
                badge="Recommended"
              />
            </div>
          ))}
        </div>
      </div>

      {/* EXPLORE BUTTON */}
      <div className="w-full flex justify-center mt-6">
        <button className="px-6 py-2 bg-black text-white rounded-full text-sm hover:opacity-90 transition">
          Explore →
        </button>
      </div>
    </SectionWrapper>
  );
};

export default RecommendedSection;
