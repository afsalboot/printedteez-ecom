import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, NavLink, useNavigate } from "react-router";
import { Search, ShoppingCart, UserIcon, Menu, X } from "lucide-react";
import { logo } from "../assets/assets.js";
import { getCart } from "../redux/slices/cartSlice.jsx";
import { fetchProfile } from "../redux/slices/userSlice.jsx";
import {
  fetchSuggestions,
  clearSuggestions,
} from "../redux/slices/searchSlice.jsx";

const Navbar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { user } = useSelector((s) => s.auth);
  const { items = [] } = useSelector((s) => s.cart);
  const { profile } = useSelector((s) => s.user);
  const { suggestions = [] } = useSelector((s) => s.search || {});

  const [searchQuery, setSearchQuery] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const [touchStartY, setTouchStartY] = useState(0);
  const [touchEndY, setTouchEndY] = useState(0);

  const cartCount = items.reduce(
    (total, item) => total + (item.quantity || 1),
    0
  );

  useEffect(() => {
    if (user) {
      dispatch(getCart());
      dispatch(fetchProfile());
    }
  }, [user, dispatch]);

  // Search (desktop + mobile)
  useEffect(() => {
    if (!searchQuery.trim()) {
      dispatch(clearSuggestions());
      return;
    }

    const timer = setTimeout(() => {
      dispatch(fetchSuggestions(searchQuery));
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery, dispatch]);

  const handleSelectProduct = (id) => {
    setSearchQuery("");
    dispatch(clearSuggestions());
    navigate(`/product/${id}`);
    setMobileMenuOpen(false);
  };

  // Swipe down to close mobile menu
  const handleTouchStart = (e) => setTouchStartY(e.touches[0].clientY);
  const handleTouchMove = (e) => setTouchEndY(e.touches[0].clientY);
  const handleTouchEnd = () => {
    if (touchEndY - touchStartY > 80) {
      setMobileMenuOpen(false);
    }
  };

  return (
    <div className="w-full">
      {/* NAVBAR */}
      <nav className="w-full h-[70px] bg-[#B21A15] text-white shadow-md">
        <div className="max-w-7xl mx-auto h-full px-4 flex items-center justify-between">
          {/* MOBILE HAMBURGER */}
          <button
            className="md:hidden"
            onClick={() => setMobileMenuOpen(true)}
          >
            <Menu size={26} />
          </button>

          {/* LOGO */}
          <Link to="/" className="h-10 flex items-center">
            <img src={logo} alt="logo" className="h-full" />
          </Link>

          {/* DESKTOP CONTENT */}
          <div className="hidden md:flex items-center gap-6 w-full justify-end">
            {/* LINKS */}
            <ul className="flex items-center gap-6 text-sm font-medium">
              <NavLink to="/">Home</NavLink>
              <NavLink to="/shop">Shop</NavLink>
              <NavLink to="/event">Event</NavLink>
              <NavLink to="/blog">Blog</NavLink>
              <NavLink to="/about">About</NavLink>
              <NavLink to="/contact">Contact</NavLink>
            </ul>

            {/* SEARCH */}
            <div className="relative">
              <div className="flex items-center bg-white/20 rounded-lg px-3 py-2">
                <Search size={16} />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search products"
                  className="bg-transparent outline-none text-sm ml-2 w-44 placeholder:text-white/70"
                />
              </div>

              {/* SUGGESTIONS */}
              {suggestions.length > 0 && (
                <div className="absolute top-full mt-2 w-64 bg-white text-black rounded-xl shadow-lg overflow-hidden z-50">
                  {suggestions.slice(0, 5).map((item) => (
                    <button
                      key={item._id}
                      onClick={() => handleSelectProduct(item._id)}
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-100 text-left"
                    >
                      <img
                        src={item.thumbnail || item.images?.[0]}
                        alt={item.title}
                        className="w-10 h-10 rounded-md object-cover"
                      />
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">
                          {item.title}
                        </p>
                        {item.price && (
                          <p className="text-xs text-gray-500">
                            ₹{item.price}
                          </p>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* CART */}
            <Link to="/cart" className="relative">
              <ShoppingCart size={20} />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-white text-[#B21A15] text-[10px] px-1.5 rounded-full font-semibold">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* EXPLORE / PROFILE */}
            {!user ? (
              <Link to="/login" className="text-sm font-medium">
                Explore
              </Link>
            ) : (
              <Link to="/profile">
                {profile?.profileImageUrl ? (
                  <img
                    src={profile.profileImageUrl}
                    alt="profile"
                    className="w-8 h-8 rounded-lg object-cover"
                  />
                ) : (
                  <UserIcon size={22} />
                )}
              </Link>
            )}
          </div>

          {/* MOBILE RIGHT */}
          <div className="md:hidden">
            {!user ? (
              <Link to="/login" className="text-sm font-medium">
                Explore
              </Link>
            ) : (
              <Link to="/profile">
                <UserIcon size={22} />
              </Link>
            )}
          </div>
        </div>
      </nav>

      {/* MOBILE MENU */}
      <div
        className={`fixed inset-0 z-50 md:hidden ${
          mobileMenuOpen ? "visible" : "invisible"
        }`}
      >
        <div
          onClick={() => setMobileMenuOpen(false)}
          className={`absolute inset-0 bg-black/40 transition-opacity ${
            mobileMenuOpen ? "opacity-100" : "opacity-0"
          }`}
        />

        <div
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          className={`absolute bottom-0 left-0 w-full h-[85%] bg-[#B21A15] rounded-t-3xl transition-transform ${
            mobileMenuOpen ? "translate-y-0" : "translate-y-full"
          }`}
        >
          <div className="w-12 h-1.5 bg-white/40 rounded-full mx-auto mt-3 mb-5" />

          <div className="flex justify-between items-center px-6 mb-6">
            <img src={logo} alt="logo" className="h-9" />
            <X size={26} onClick={() => setMobileMenuOpen(false)} />
          </div>

          <div className="px-6 mb-6">
            <div className="flex items-center bg-white/15 rounded-xl px-4 py-3">
              <Search size={18} />
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products"
                className="bg-transparent ml-3 outline-none text-sm w-full"
              />
            </div>
          </div>

          <div className="flex flex-col gap-6 px-6 text-lg font-medium">
            <NavLink to="/" onClick={() => setMobileMenuOpen(false)}>
              Home
            </NavLink>
            <NavLink to="/shop" onClick={() => setMobileMenuOpen(false)}>
              Shop
            </NavLink>
            <NavLink to="/event" onClick={() => setMobileMenuOpen(false)}>
              Event
            </NavLink>
            <NavLink to="/blog" onClick={() => setMobileMenuOpen(false)}>
              Blog
            </NavLink>
            <NavLink to="/about" onClick={() => setMobileMenuOpen(false)}>
              About
            </NavLink>
            <NavLink to="/contact" onClick={() => setMobileMenuOpen(false)}>
              Contact
            </NavLink>
          </div>

          <div className="absolute bottom-6 w-full px-6">
            <Link
              to="/cart"
              onClick={() => setMobileMenuOpen(false)}
              className="flex justify-center items-center gap-2 bg-white text-[#B21A15] py-3 rounded-xl font-semibold"
            >
              <ShoppingCart size={18} />
              Cart ({cartCount})
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
