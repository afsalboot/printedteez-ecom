import React, { useEffect } from "react";
import { useDispatch } from "react-redux";

import HeroSection from "../components/HeroSection.jsx";
import CategorySection from "../components/CategorySection.jsx";
import TrendingSection from "../components/TrendingSection.jsx";
import FlashSaleSection from "../components/FlashSaleSection.jsx";
import FeaturedSection from "../components/FeaturedSection.jsx";
import NewArrivalsSection from "../components/NewArrivalsSection.jsx";
import BestSellersSection from "../components/BestSellersSection.jsx";
import LimitedEditionSection from "../components/LimitedEditionSection.jsx";
import DealsSection from "../components/DealsSection.jsx";

import {
  fetchFeaturedProducts,
  fetchTrendingProducts,
  fetchNewArrivals,
  fetchBestSellers,
  fetchFlashSaleProducts,
  fetchLimitedEditionProducts,
  fetchDeals,
  fetchCategories,
} from "../redux/slices/productSlice.jsx";

const Home = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchFeaturedProducts());
    dispatch(fetchTrendingProducts());
    dispatch(fetchNewArrivals());
    dispatch(fetchBestSellers());
    dispatch(fetchFlashSaleProducts());
    dispatch(fetchLimitedEditionProducts());
    dispatch(fetchDeals());
    dispatch(fetchCategories());
  }, [dispatch]);

  return (
    <main className="min-h-screen bg-[#faf7f5] text-gray-900 dark:bg-neutral-950 dark:text-gray-100">
      <HeroSection />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 lg:py-16">
        <section className="mb-12 sm:mb-14 lg:mb-16">
          <div className="rounded-[2rem] border border-[#B21A15]/10 bg-white px-5 py-5 sm:px-7 sm:py-6 shadow-sm">
            <div className="grid gap-6 md:grid-cols-3 md:items-center">
              <div>
                <p className="text-[11px] uppercase tracking-[0.3em] text-[#B21A15]/60 mb-2">
                  Minimal Storefront
                </p>
                <h2 className="text-xl sm:text-2xl font-semibold tracking-tight">
                  A cleaner shopping experience built around fewer, better picks.
                </h2>
              </div>
              <p className="text-sm leading-6 text-gray-600 md:col-span-2">
                Explore focused edits, current offers, and standout pieces in a
                calmer layout that puts the products first while keeping the
                PrintedTeez energy intact.
              </p>
            </div>
          </div>
        </section>

        <div className="space-y-14 sm:space-y-16 lg:space-y-20">
          <CategorySection />
          <FlashSaleSection />
          <FeaturedSection />
          <TrendingSection />
          <NewArrivalsSection />
          <BestSellersSection />
          <LimitedEditionSection />
          <DealsSection />
        </div>
      </div>
    </main>
  );
};

export default Home;
