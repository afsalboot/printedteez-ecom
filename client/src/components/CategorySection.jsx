import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router";
import { fetchCategories } from "../redux/slices/productSlice.jsx";
import SectionWrapper from "./SectionWrapper.jsx";

const CategorySection = () => {
  const dispatch = useDispatch();
  const { categories = [] } = useSelector((state) => state.products);
  const { list = [] } = useSelector((state) => state.sections);

  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  // Section configuration from admin
  const sectionData = list.find((s) => s.type === "categories");

  if (!sectionData || !categories?.length) return null;

  // Split categories
  const firstSection = categories.slice(0, 5);
  const secondSection = categories.slice(5, 9);

  return (
    <SectionWrapper
      title={sectionData.title}
      subtitle={sectionData.subtitle}
      extra={sectionData.extra}
    >
      <div className="mt-6 px-4 w-full max-w-5xl mx-auto">
        {/* 1st Section → 5 items */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {firstSection.map((cat, index) => (
            <Link
              key={index}
              to={`/shop?category=${encodeURIComponent(cat)}`}
              className="
                bg-[#EB1C23] text-white font-medium text-sm
                p-3 rounded-xl text-center shadow-md
                hover:-translate-y-0.5 transition
                flex items-center justify-center
                min-h-[50px]
              "
            >
              {cat}
            </Link>
          ))}
        </div>

        {/* 2nd Section → 4 items */}
        {secondSection.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mt-6">
            {secondSection.map((cat, index) => (
              <Link
                key={index}
                to={`/shop?category=${encodeURIComponent(cat)}`}
                className="
                  bg-[#EB1C23] text-white font-medium text-sm
                  p-3 rounded-xl text-center shadow-md
                  hover:-translate-y-0.5 transition
                  flex items-center justify-center
                  min-h-[50px]
                "
              >
                {cat}
              </Link>
            ))}
          </div>
        )}

        {/* Optional Bottom Button */}
        {sectionData.extra && (
          <div className="w-full flex justify-center mt-6">
            <button className="px-6 py-2 bg-[#EB1C23] text-white rounded-full text-sm hover:opacity-90 transition">
              {sectionData.extra}
            </button>
          </div>
        )}
      </div>
    </SectionWrapper>
  );
};

export default CategorySection;
