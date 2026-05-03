import React, { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { fetchCategories } from "../redux/slices/productSlice.jsx";
import SectionWrapper from "./SectionWrapper.jsx";

const CategorySection = () => {
  const dispatch = useDispatch();
  const scrollRef = useRef(null);
  const { categories = [] } = useSelector((state) => state.products);
  const { list = [] } = useSelector((state) => state.sections);

  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  const scrollByAmount = (direction) => {
    const container = scrollRef.current;
    if (!container) return;

    const amount = Math.round(container.clientWidth * 0.8);
    container.scrollBy({
      left: direction === "left" ? -amount : amount,
      behavior: "smooth",
    });
  };

  const sectionData = list.find((s) => s.type === "categories");
  if (!sectionData || !categories.length) return null;

  return (
    <SectionWrapper
      title={sectionData.title}
      subtitle={sectionData.subtitle}
      extra={sectionData.extra}
    >
      <div className="space-y-4">
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={() => scrollByAmount("left")}
            className="flex h-11 w-11 items-center justify-center rounded-full border border-[#B21A15]/15 bg-white text-[#B21A15] shadow-sm hover:bg-[#B21A15] hover:text-white transition"
            aria-label="Scroll categories left"
          >
            <ChevronLeft size={18} />
          </button>

          <button
            type="button"
            onClick={() => scrollByAmount("right")}
            className="flex h-11 w-11 items-center justify-center rounded-full border border-[#B21A15]/15 bg-white text-[#B21A15] shadow-sm hover:bg-[#B21A15] hover:text-white transition"
            aria-label="Scroll categories right"
          >
            <ChevronRight size={18} />
          </button>
        </div>

        <div
          ref={scrollRef}
          className="overflow-x-auto pb-3 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          <div className="flex gap-4 min-w-max">
            {categories.map((cat) => (
              <Link
                key={cat._id || cat.name}
                to={`/shop?category=${encodeURIComponent(cat.name)}`}
                className="group relative w-[220px] h-[280px] shrink-0 overflow-hidden rounded-[1.7rem] border border-[#B21A15]/10 bg-white shadow-sm hover:-translate-y-1 hover:shadow-xl transition"
              >
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent z-10" />

                {cat.imageUrl ? (
                  <img
                    src={cat.imageUrl}
                    alt={cat.name}
                    className="w-full h-full object-cover transition duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="w-full h-full bg-[linear-gradient(135deg,#f3d7d5,#ffffff,#d96a63)]" />
                )}

                <div className="absolute inset-x-0 bottom-0 z-20 p-5">
                  <p className="text-[11px] uppercase tracking-[0.26em] text-white/70 mb-2">
                    Category
                  </p>
                  <div className="flex items-end justify-between gap-3">
                    <h3 className="text-xl font-semibold text-white leading-tight">
                      {cat.name}
                    </h3>
                    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white/15 backdrop-blur-sm text-white group-hover:bg-white group-hover:text-[#B21A15] transition">
                      →
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </SectionWrapper>
  );
};

export default CategorySection;
