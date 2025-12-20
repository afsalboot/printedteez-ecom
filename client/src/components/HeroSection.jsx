import React from "react";
import { hero2, hero1 } from "../assets/assets.js";
import { useNavigate } from "react-router";

const HeroSection = () => {
  const navigate = useNavigate();

  return (
    <div className="relative w-full min-h-[90vh] md:min-h-screen bg-[#B21A15] text-white flex items-center justify-center overflow-hidden">

      {/* Decorative Image 1 */}
      <img
        src={hero1}
        alt="hero-graphic-1"
        className="
          pointer-events-none absolute
          w-[220px] sm:w-[300px] md:w-[480px] lg:w-[540px]
          top-[55%] sm:top-[45%] md:top-[20%]
          left-[50%] sm:left-[55%] md:left-[65%]
          -translate-x-1/2
          opacity-80
        "
      />

      {/* Decorative Image 2 */}
      <img
        src={hero2}
        alt="hero-graphic-2"
        className="
          pointer-events-none absolute
          w-[260px] sm:w-[360px] md:w-[560px] lg:w-[670px]
          top-[10%] sm:top-[8%] md:top-[10%]
          right-[50%] sm:right-[55%] md:right-[56%]
          translate-x-1/2
          opacity-80
        "
      />

      {/* Center Content */}
      <div className="relative z-10 text-center px-4 sm:px-6 max-w-xl">
        <h1 className="text-3xl sm:text-4xl md:text-6xl font-bold leading-tight">
          Upgrade Your Style
        </h1>

        <p className="text-gray-200 text-sm sm:text-base md:text-lg mt-3">
          Discover exclusive fashion & lifestyle products
        </p>

        <button
          onClick={() => navigate("/shop")}
          className="
            mt-6 px-6 sm:px-7 py-3
            text-sm sm:text-base
            font-semibold
            bg-white text-[#EB1C23]
            rounded-lg
            hover:opacity-90 transition
          "
        >
          Shop Now
        </button>
      </div>
    </div>
  );
};

export default HeroSection;
