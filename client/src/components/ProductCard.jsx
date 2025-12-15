import React from "react";
import { useNavigate } from "react-router";
import BlurCircle from "./BlurCircle.jsx";

const ProductCard = ({ id, image, title, price, badge }) => {
  const navigate = useNavigate();

  const goToDetails = () => {
    navigate(`/product/${id}`);
  };

  return (
    <div
      onClick={goToDetails}
      className="relative bg-[#D9D9D9]/20 rounded-xl overflow-hidden cursor-pointer 
                 w-[267px] h-[440px] 
                 transition transform hover:-translate-y-1 hover:shadow-lg"
    >
      {/* BLUR ELEMENTS */}
      <BlurCircle bottom="5px" left="20px" />
      <BlurCircle bottom="5px" right="20px" />

      {/* BADGE */}
      {badge && (
        <span className="absolute top-3 left-3 bg-[#EB1C23] text-white text-xs font-light px-3 py-1 rounded-full z-10">
          {badge}
        </span>
      )}

      {/* IMAGE WRAPPER */}
      <div className="w-full h-[340px]">
        <img
          src={image || "/placeholder.png"}
          alt={title || "product"}
          className="w-full h-full object-cover rounded-t-xl"
        />
      </div>

      {/* TITLE */}
      <div className="p-3">
        <h1 className="text-sm font-extralight text-left truncate">{title}</h1>
      </div>

      {/* BUY BUTTON */}
      <div className="text-right px-3">
        <button
          onClick={(e) => {
            e.stopPropagation(); // prevent triggering parent navigate
            navigate(`/product/${id}`);
          }}
          className="w-[117px] h-7 bg-[#EB1C23]/50 text-sm font-extralight mb-3 rounded-sm cursor-pointer hover:bg-[#EB1C23]/70 transition"
        >
          ₹{price} | Buy
        </button>
      </div>
    </div>
  );
};

export default ProductCard;
