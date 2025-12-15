import React from "react";

const Events = () => {
  // Later you can replace this with real deals from API / props / Redux
  const hotDeals = []; // [] = no active mapped products yet

  return (
    <div className="w-full bg-white">
      <div className="max-w-6xl mx-auto px-4 py-8 md:py-12">

        {/* Event Banner */}
        <div className="w-full h-64 bg-gradient-to-r from-[#B21A15] to-red-700 text-white rounded-2xl flex flex-col justify-center items-center shadow-lg relative overflow-hidden">
          {/* Accent Glow */}
          <div className="absolute inset-0 bg-white/10 blur-2xl rounded-full -top-10" />

          <h1 className="text-4xl md:text-5xl font-extrabold tracking-wide drop-shadow-md text-center">
            Mega Festive Sale
          </h1>
          <p className="text-lg mt-3 font-medium opacity-90 text-center">
            Up to <span className="font-bold text-white">60% OFF</span> on all products
          </p>

          {/* Floating Badge */}
          <div className="absolute bottom-3 right-3 bg-white text-red-700 text-xs font-bold px-3 py-1 rounded-full shadow-md animate-pulse">
            Limited Time
          </div>
        </div>

        {/* Hot Deals */}
        <div className="mt-12">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
            <h2 className="text-2xl font-semibold flex items-center gap-2">
              🔥 Hot Deals
            </h2>
            <p className="text-sm text-gray-500">
              Handpicked pieces with the best discounts during this festive drop.
            </p>
          </div>

          <div className="mt-5">
            {hotDeals.length === 0 ? (
              // Skeleton / empty state
              <div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
                  {[1, 2, 3, 4].map((_, i) => (
                    <div
                      key={i}
                      className="bg-gray-100 rounded-xl p-4 shadow-sm hover:shadow-lg transition-shadow duration-200 cursor-pointer"
                    >
                      <div className="w-full h-28 bg-gray-300 rounded-lg animate-pulse" />
                      <div className="mt-3 h-3 w-3/4 bg-gray-300 rounded animate-pulse" />
                      <div className="mt-2 h-3 w-1/2 bg-gray-300 rounded animate-pulse" />
                    </div>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-3">
                  Featured deals are loading… soon this section will show your best offers.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
                {hotDeals.map((deal) => (
                  <div
                    key={deal.id}
                    className="bg-gray-50 rounded-xl p-3 shadow-sm hover:shadow-lg transition-all duration-200 cursor-pointer border border-gray-100"
                  >
                    <div className="w-full h-28 rounded-lg overflow-hidden mb-3">
                      <img
                        src={deal.image}
                        alt={deal.title}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-200"
                      />
                    </div>
                    <p className="text-xs font-medium text-gray-700 line-clamp-2">
                      {deal.title}
                    </p>
                    <p className="text-[11px] text-gray-500 mt-1">
                      <span className="font-semibold text-[#B21A15]">
                        ₹{deal.offerPrice}
                      </span>{" "}
                      <span className="line-through text-gray-400 ml-1">
                        ₹{deal.originalPrice}
                      </span>{" "}
                      <span className="text-[10px] text-green-600 ml-1">
                        ({deal.discount}% OFF)
                      </span>
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Upcoming Events */}
        <div className="mt-12">
          <h2 className="text-2xl font-semibold flex items-center gap-2">
            📅 Upcoming Events
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Stay tuned for new drops, seasonal collections, and exclusive launches.
          </p>

          <ul className="mt-5 space-y-4">
            <li className="p-4 bg-gray-100 rounded-xl shadow-sm hover:shadow-md hover:bg-gray-200 transition duration-200 cursor-pointer flex justify-between items-center">
              <div>
                <span className="font-medium block">New Winter Collection</span>
                <span className="text-xs text-gray-500">Coming Soon</span>
              </div>
              <span className="text-[11px] px-3 py-1 rounded-full bg-white text-gray-700 border border-gray-200">
                Collection Launch
              </span>
            </li>

            <li className="p-4 bg-gray-100 rounded-xl shadow-sm hover:shadow-md hover:bg-gray-200 transition duration-200 cursor-pointer flex justify-between items-center">
              <div>
                <span className="font-medium block">Streetwear Limited Drop</span>
                <span className="text-xs text-gray-500">Jan 15</span>
              </div>
              <span className="text-[11px] px-3 py-1 rounded-full bg-white text-gray-700 border border-gray-200">
                Limited Edition
              </span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Events;
