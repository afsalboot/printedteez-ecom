import React from "react";
import { hero2, hero1 } from "../assets/assets.js";
import { useNavigate } from "react-router";

const HeroSection = () => {
  const navigate = useNavigate();

  return (
    <div className="relative w-full h-screen bg-[#B21A15] text-white flex items-center justify-center overflow-hidden">

      {/* Decorative Images */}
      <img
        src={hero1}
        alt="hero-graphic-1"
        className="pointer-events-none absolute w-[400px] md:w-[540px] top-[25%] md:top-[20%] left-[55%] md:left-[65%] opacity-90"
      />

      <img
        src={hero2}
        alt="hero-graphic-2"
        className="pointer-events-none absolute w-[480px] md:w-[670px] top-[5%] md:top-[10%] right-[45%] md:right-[56%] opacity-90"
      />

      {/* Center Content */}
      <div className="relative z-10 text-center px-4">
        <h1 className="text-4xl md:text-6xl font-bold leading-tight">
          Upgrade Your Style
        </h1>

        <p className="text-gray-300 text-sm md:text-base mt-2">
          Discover exclusive fashion & lifestyle products
        </p>

        <button
          onClick={() => navigate("/shop")}
          className="px-7 py-3 font-semibold bg-white text-[#EB1C23] rounded-lg mt-6 cursor-pointer hover:opacity-90 transition"
        >
          Shop Now
        </button>
      </div>
    </div>
  );
};

export default HeroSection;
