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
    <main
      className="
        min-h-screen
        bg-linear-to-b from-white to-gray-50
        dark:from-black dark:to-neutral-900
        text-gray-900 dark:text-gray-100
      "
    >
      {/* HERO → Full width always */}
      <HeroSection />

      {/* CONTENT CONTAINER */}
      <div
        className="
          max-w-7xl mx-auto
          px-3 sm:px-4 md:px-6
          pb-16 sm:pb-20
        "
      >
        {/* SECTION SPACING */}
        <div className="space-y-14 sm:space-y-16 md:space-y-20">
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
