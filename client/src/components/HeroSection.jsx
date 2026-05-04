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
        <div className="absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-black/10 to-transparent sm:hidden" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-16 lg:px-8 lg:py-24">
        <div className="grid items-start gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:gap-12">
          <div className="order-2 max-w-2xl lg:order-1">
            <p className="text-xs uppercase tracking-[0.38em] text-white/70 mb-5">
              PrintedTeez
            </p>

            <h1 className="text-4xl font-semibold leading-[0.95] tracking-tight sm:text-5xl lg:text-7xl">
              Modern fits,
              <br />
              minimal attitude.
            </h1>

            <p className="mt-5 max-w-xl text-sm leading-7 text-white/80 sm:mt-6 sm:text-base lg:text-lg">
              Discover clean silhouettes, bold everyday staples, and limited
              drops designed to elevate your wardrobe without overcomplicating
              it.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row gap-3 sm:items-center">
              <button
                onClick={() => navigate("/shop")}
                className="px-6 py-3.5 rounded-full bg-white text-[#B21A15] text-sm font-semibold shadow-[0_16px_36px_rgba(0,0,0,0.12)] hover:bg-white/90 transition"
              >
                Shop Collection
              </button>

              <button
                onClick={() => navigate("/shop?sort=newest")}
                className="px-6 py-3.5 rounded-full border border-white/25 bg-white/4 text-sm font-medium text-white/90 hover:bg-white/10 transition"
              >
                New Arrivals
              </button>
            </div>

            <div className="mt-8 grid max-w-lg grid-cols-3 gap-3 sm:mt-10 sm:gap-4">
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

          <div className="relative order-1 min-h-[360px] sm:min-h-[480px] lg:order-2 lg:mt-0 lg:min-h-[620px]">
            <div className="absolute inset-x-3 bottom-4 top-6 rounded-[2rem] border border-white/10 bg-white/6 backdrop-blur-[3px] sm:inset-x-10 sm:bottom-6 sm:rounded-[2.5rem]" />
            <div className="absolute left-4 top-12 h-24 w-24 rounded-full bg-white/8 blur-2xl sm:left-10 sm:top-14 sm:h-28 sm:w-28" />
            <div className="absolute bottom-16 right-4 h-24 w-24 rounded-full bg-black/15 blur-3xl sm:bottom-20 sm:right-10 sm:h-32 sm:w-32" />
            <div className="absolute left-1/2 top-5 h-16 w-40 -translate-x-1/2 rounded-full bg-white/10 blur-2xl sm:hidden" />

            <div className="absolute left-1 top-4 w-[40%] max-w-[190px] rotate-[-8deg] rounded-[1.6rem] border border-white/12 bg-white/8 p-2.5 shadow-[0_30px_60px_rgba(0,0,0,0.16)] backdrop-blur-sm sm:left-0 sm:top-16 sm:max-w-[250px] sm:rounded-[2rem] sm:p-3">
              <div className="overflow-hidden rounded-[1.4rem] bg-[#c7443d]">
                <img
                  src={hero2}
                  alt="PrintedTeez portrait edit"
                  className="h-[180px] w-full object-cover object-top sm:h-[300px]"
                />
              </div>
            </div>

            <div className="absolute right-1 top-0 w-[46%] max-w-[210px] rotate-[8deg] rounded-[1.6rem] border border-white/12 bg-white/8 p-2.5 shadow-[0_30px_60px_rgba(0,0,0,0.16)] backdrop-blur-sm sm:right-4 sm:top-0 sm:max-w-[280px] sm:rounded-[2rem] sm:p-3">
              <div className="overflow-hidden rounded-[1.4rem] bg-[#cc4c45]">
                <img
                  src={hero1}
                  alt="PrintedTeez product edit"
                  className="h-[210px] w-full object-cover object-top sm:h-[360px]"
                />
              </div>
            </div>

            <div className="absolute bottom-5 left-[13%] right-[3%] rounded-[1.6rem] border border-white/12 bg-[linear-gradient(135deg,rgba(255,255,255,0.2),rgba(0,0,0,0.18))] px-4 py-4 shadow-[0_25px_50px_rgba(0,0,0,0.24)] backdrop-blur-md sm:bottom-10 sm:left-[20%] sm:right-[10%] sm:rounded-[2rem] sm:px-5 sm:py-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[11px] uppercase tracking-[0.3em] text-white/60">
                    Curated Drop
                  </p>
                  <p className="mt-2 text-[1.05rem] font-semibold leading-tight sm:text-2xl">
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
