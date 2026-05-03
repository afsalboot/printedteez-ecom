import React from "react";
import { useNavigate } from "react-router";
import { hero2, hero1 } from "../assets/assets.js";

const HeroSection = () => {
  const navigate = useNavigate();

  return (
    <section className="relative overflow-hidden bg-[#B21A15] text-white">
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.18),transparent_35%),radial-gradient(circle_at_bottom_right,rgba(0,0,0,0.18),transparent_40%)]" />
        <div className="absolute left-[-12%] top-16 h-72 w-72 rounded-full border border-white/10" />
        <div className="absolute right-[-8%] bottom-10 h-96 w-96 rounded-full border border-white/10" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 lg:py-24">
        <div className="grid lg:grid-cols-[1.05fr_0.95fr] gap-12 items-center">
          <div className="max-w-2xl">
            <p className="text-xs uppercase tracking-[0.38em] text-white/70 mb-5">
              PrintedTeez
            </p>

            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-semibold leading-[0.95] tracking-tight">
              Modern fits,
              <br />
              minimal attitude.
            </h1>

            <p className="mt-6 max-w-xl text-sm sm:text-base lg:text-lg leading-7 text-white/80">
              Discover clean silhouettes, bold everyday staples, and limited
              drops designed to elevate your wardrobe without overcomplicating
              it.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row gap-3 sm:items-center">
              <button
                onClick={() => navigate("/shop")}
                className="px-6 py-3 rounded-full bg-white text-[#B21A15] text-sm font-semibold hover:bg-white/90 transition"
              >
                Shop Collection
              </button>

              <button
                onClick={() => navigate("/shop?sort=newest")}
                className="px-6 py-3 rounded-full border border-white/25 text-sm font-medium text-white/90 hover:bg-white/10 transition"
              >
                New Arrivals
              </button>
            </div>

            <div className="mt-10 grid grid-cols-3 gap-4 max-w-lg">
              <div>
                <p className="text-2xl sm:text-3xl font-semibold">01</p>
                <p className="mt-1 text-xs sm:text-sm text-white/70">
                  Focused styles
                </p>
              </div>
              <div>
                <p className="text-2xl sm:text-3xl font-semibold">24h</p>
                <p className="mt-1 text-xs sm:text-sm text-white/70">
                  Flash updates
                </p>
              </div>
              <div>
                <p className="text-2xl sm:text-3xl font-semibold">New</p>
                <p className="mt-1 text-xs sm:text-sm text-white/70">
                  Weekly drops
                </p>
              </div>
            </div>
          </div>

          <div className="relative min-h-[380px] sm:min-h-[480px] lg:min-h-[620px]">
            <div className="absolute inset-x-10 top-6 bottom-6 rounded-[2.5rem] border border-white/10 bg-white/6 backdrop-blur-[3px]" />
            <div className="absolute left-10 top-14 h-28 w-28 rounded-full bg-white/8 blur-2xl" />
            <div className="absolute right-10 bottom-20 h-32 w-32 rounded-full bg-black/15 blur-3xl" />

            <div className="absolute left-0 top-16 w-[44%] max-w-[250px] rotate-[-8deg] rounded-[2rem] border border-white/12 bg-white/8 p-3 shadow-[0_30px_60px_rgba(0,0,0,0.16)] backdrop-blur-sm">
              <div className="overflow-hidden rounded-[1.4rem] bg-[#c7443d]">
                <img
                  src={hero2}
                  alt="PrintedTeez portrait edit"
                  className="h-[260px] sm:h-[300px] w-full object-cover object-top"
                />
              </div>
            </div>

            <div className="absolute right-4 top-0 w-[48%] max-w-[280px] rotate-[8deg] rounded-[2rem] border border-white/12 bg-white/8 p-3 shadow-[0_30px_60px_rgba(0,0,0,0.16)] backdrop-blur-sm">
              <div className="overflow-hidden rounded-[1.4rem] bg-[#cc4c45]">
                <img
                  src={hero1}
                  alt="PrintedTeez product edit"
                  className="h-[320px] sm:h-[360px] w-full object-cover object-top"
                />
              </div>
            </div>

            <div className="absolute left-[20%] bottom-10 right-[10%] rounded-[2rem] border border-white/12 bg-black/20 backdrop-blur-md px-5 py-5 shadow-[0_25px_50px_rgba(0,0,0,0.2)]">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[11px] uppercase tracking-[0.3em] text-white/60">
                    Curated Drop
                  </p>
                  <p className="mt-2 text-lg sm:text-2xl font-semibold leading-tight">
                    Strong silhouettes.
                    <br />
                    Cleaner statement pieces.
                  </p>
                </div>

                <div className="hidden sm:flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-white/15 bg-white/10 text-white/80">
                  →
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-2 text-[11px] uppercase tracking-[0.22em] text-white/65">
                <span className="rounded-full border border-white/10 px-3 py-1">
                  Street Edit
                </span>
                <span className="rounded-full border border-white/10 px-3 py-1">
                  Minimal Drop
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
