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

  const sectionData = list.find((s) => s.type === "categories");
  if (!sectionData || !categories.length) return null;

  return (
    <SectionWrapper
      title={sectionData.title}
      subtitle={sectionData.subtitle}
      extra={sectionData.extra}
    >
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
        {categories.map((cat, i) => (
          <Link
            key={i}
            to={`/shop?category=${encodeURIComponent(cat)}`}
            className="
              bg-[#EB1C23] text-white text-sm font-medium
              min-h-11 sm:min-h-[50px]
              flex items-center justify-center rounded-xl
              hover:-translate-y-0.5 transition
            "
          >
            {cat}
          </Link>
        ))}
      </div>
    </SectionWrapper>
  );
};

export default CategorySection;
