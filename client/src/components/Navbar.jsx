import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, NavLink, useNavigate } from "react-router";
import { Search, ShoppingCart, UserIcon } from "lucide-react";
import { logo } from "../assets/assets.js";
import Theme from "../ui/Theme.jsx";
import { getCart } from "../redux/slices/cartSlice.jsx";
import { getActiveOffers } from "../redux/slices/couponSlice.jsx";
import { fetchProfile } from "../redux/slices/userSlice.jsx";
import {
  fetchSuggestions,
  clearSuggestions,
} from "../redux/slices/searchSlice.jsx";

const Navbar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { user } = useSelector((state) => state.auth);
  const { items = [] } = useSelector((state) => state.cart);
  const { profile } = useSelector((state) => state.user);
  const { suggestions = [], loading } = useSelector(
    (state) => state.search || {}
  );


  const [searchQuery, setSearchQuery] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);

  const cartCount = user
    ? items.reduce((total, item) => total + (item.quantity || 1), 0)
    : 0;

  useEffect(() => {
    dispatch(getActiveOffers());
  }, [dispatch]);

  useEffect(() => {
    if (user) {
      dispatch(getCart());
      dispatch(fetchProfile());
    }
  }, [user, dispatch]);

  // Debounced search
  useEffect(() => {
    if (!searchQuery.trim()) {
      dispatch(clearSuggestions());
      setShowDropdown(false);
      return;
    }

    const id = setTimeout(() => {
      dispatch(fetchSuggestions(searchQuery));
      setShowDropdown(true);
    }, 300);

    return () => clearTimeout(id);
  }, [searchQuery, dispatch]);

  const handleSelectProduct = (productId) => {
    setShowDropdown(false);
    dispatch(clearSuggestions());
    setSearchQuery("");
    navigate(`/product/${productId}`);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && suggestions.length > 0) {
      handleSelectProduct(suggestions[0]._id);
    }
  };

  const navLinkClass = ({ isActive }) =>
    [
      "relative text-sm font-light tracking-wide transition-all duration-200",
      "hover:underline underline-offset-8 hover:scale-[1.03]",
      "px-1 py-0.5",
      isActive ? "underline font-semibold" : "opacity-90 hover:opacity-100",
    ]
      .filter(Boolean)
      .join(" ");

  return (
    <div className="w-full">
      <nav className="w-full h-[70px] bg-[#B21A15] text-white flex items-center shadow-md border-b border-white/10 backdrop-blur-sm">
        <div className="max-w-7xl w-full mx-auto flex items-center justify-between px-4 gap-6">
          {/* LEFT — LOGO */}
          <Link
            to="/"
            className="flex items-center w-[200px] h-10 shrink-0 cursor-pointer group"
          >
            <img
              src={logo}
              alt="logo"
              className="h-full w-auto object-contain transition-transform duration-200 group-hover:scale-105"
            />
          </Link>

          {/* CENTER — NAV */}
          <ul className="hidden md:flex items-center gap-6">
            <NavLink to="/" className={navLinkClass}>
              Home
            </NavLink>
            <NavLink to="/shop" className={navLinkClass}>
              Shop
            </NavLink>
            <NavLink to="/event" className={navLinkClass}>
              Event
            </NavLink>
            <NavLink to="/about" className={navLinkClass}>
              About
            </NavLink>
            <NavLink to="/contact" className={navLinkClass}>
              Contact
            </NavLink>
            <NavLink to="/blog" className={navLinkClass}>
              Blog
            </NavLink>
          </ul>

          {/* RIGHT — SEARCH + CART + ACCOUNT */}
          <div className="flex items-center gap-3 md:gap-4">
            {/* SEARCH */}
            <div className="relative flex items-center bg-[#DDDEDF]/50 px-3 py-2 rounded-2xl gap-2 shadow-sm focus-within:ring-2 focus-within:ring-[#DDDEDF]/80 focus-within:ring-offset-0 transition-all duration-200">
              <input
                type="text"
                placeholder="Search"
                className="bg-transparent outline-none text-sm text-[#DDDEDF]/80 placeholder:text-gray-200 w-28 md:w-44 lg:w-56 focus:w-32 md:focus:w-52 lg:focus:w-64 transition-all duration-200"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                onFocus={() => {
                  if (suggestions.length > 0) setShowDropdown(true);
                }}
                onBlur={() => {
                  // delay so click on suggestion still works
                  setTimeout(() => setShowDropdown(false), 150);
                }}
                aria-label="Search products"
              />
              <button
                className="bg-[#DDDEDF]/50 w-[29px] h-[27px] rounded-lg flex items-center justify-center hover:scale-105 active:scale-95 transition-transform duration-150"
                type="button"
              >
                <Search size={18} />
              </button>

              {/* DROPDOWN */}
              {showDropdown && suggestions.length > 0 && (
                <div className="absolute top-full left-0 mt-2 w-[260px] md:w-[320px] bg-white text-black rounded-xl shadow-xl max-h-72 overflow-y-auto z-50 border border-gray-100">
                  {loading && (
                    <div className="px-4 py-3 text-xs text-gray-500 border-b border-gray-100">
                      Searching...
                    </div>
                  )}

                  {suggestions.map((item) => (
                    <button
                      key={item._id}
                      type="button"
                      onMouseDown={(e) => {
                        e.preventDefault();
                        handleSelectProduct(item._id);
                      }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-gray-50 transition-colors duration-150"
                    >
                      {item.thumbnail && (
                        <img
                          src={item.thumbnail}
                          alt={item.title}
                          className="w-9 h-9 rounded object-cover flex-shrink-0"
                        />
                      )}
                      <div className="flex flex-col min-w-0">
                        <span className="text-xs font-medium line-clamp-1">
                          {item.title}
                        </span>
                        <span className="text-[11px] text-gray-500">
                          {item.sku} • ₹{item.price}
                          {item.discount > 0 && (
                            <span className="ml-1 text-red-500">
                              ({item.discount}% off)
                            </span>
                          )}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* CART */}
            <Link
              to="/cart"
              className="relative bg-[#DDDEDF]/50 w-[30px] h-[29px] rounded-lg flex items-center justify-center cursor-pointer hover:scale-105 active:scale-95 transition-transform duration-150 shadow-sm"
              aria-label="Cart"
            >
              <ShoppingCart size={18} />
              {user && cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-600 text-[10px] px-1.5 rounded-full min-w-[18px] text-center font-semibold shadow-sm">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* ACCOUNT */}
            <div className="flex items-center gap-2">
              {!user ? (
                <Link
                  to="/login"
                  className="bg-[#DDDEDF]/50 px-4 py-2 rounded-2xl text-sm text-white font-medium hover:bg-[#DDDEDF]/70 hover:translate-y-px active:translate-y-0 transition-all duration-150 shadow-sm"
                >
                  Explore
                </Link>
              ) : (
                <Link
                  to="/profile"
                  className="flex items-center gap-2 group"
                  aria-label="Profile"
                >
                  {profile?.profileImageUrl ? (
                    <img
                      src={profile.profileImageUrl}
                      alt="profile"
                      className="w-8 h-8 rounded-lg object-cover border border-white/40 shadow-sm group-hover:scale-105 transition-transform duration-150"
                    />
                  ) : (
                    <UserIcon className="w-8 h-8 rounded-lg p-1 bg-[#DDDEDF]/50 group-hover:scale-105 transition-transform duration-150" />
                  )}
                </Link>
              )}
            </div>
          </div>
        </div>
      </nav>
    </div>
  );
};

export default Navbar;
