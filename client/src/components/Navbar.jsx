import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, NavLink, useNavigate } from "react-router";
import {
  Menu,
  Search,
  ShoppingBag,
  UserIcon,
  X,
} from "lucide-react";
import { logo } from "../assets/assets.js";
import { getCart } from "../redux/slices/cartSlice.jsx";
import { fetchProfile } from "../redux/slices/userSlice.jsx";
import {
  clearSuggestions,
  fetchSuggestions,
} from "../redux/slices/searchSlice.jsx";

const navItems = [
  { to: "/", label: "Home" },
  { to: "/shop", label: "Shop" },
  { to: "/event", label: "Event" },
  { to: "/blog", label: "Blog" },
  { to: "/about", label: "About" },
  { to: "/contact", label: "Contact" },
];

const Navbar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { user, token } = useSelector((s) => s.auth);
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
    if (token) {
      dispatch(getCart());
      dispatch(fetchProfile());
    }
  }, [token, dispatch]);

  useEffect(() => {
    if (!searchQuery.trim()) {
      dispatch(clearSuggestions());
      return;
    }

    const timeout = setTimeout(
      () => dispatch(fetchSuggestions(searchQuery)),
      300
    );

    return () => clearTimeout(timeout);
  }, [dispatch, searchQuery]);

  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? "hidden" : "auto";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [mobileMenuOpen]);

  const handleSelectProduct = (id) => {
    setSearchQuery("");
    dispatch(clearSuggestions());
    navigate(`/product/${id}`);
    setMobileMenuOpen(false);
  };

  const handleTouchStart = (e) => setTouchStartY(e.touches[0].clientY);
  const handleTouchMove = (e) => setTouchEndY(e.touches[0].clientY);
  const handleTouchEnd = () => {
    if (touchEndY - touchStartY > 80) {
      setMobileMenuOpen(false);
    }
  };

  return (
    <div className="w-full border-b border-black/5 bg-[rgba(252,249,245,0.92)] backdrop-blur-xl">
      <nav className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <button
            type="button"
            className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-black/10 text-gray-700 md:hidden"
            onClick={() => setMobileMenuOpen(true)}
          >
            <Menu size={20} />
          </button>

          <Link to="/" className="flex items-center gap-3">
            <img src={logo} alt="PrintedTeez" className="h-11 w-auto object-contain" />
            <div className="hidden sm:block">
              <p className="text-[11px] font-semibold uppercase tracking-[0.26em] text-[#B21A15]">
                PrintedTeez
              </p>
              <p className="text-xs text-gray-500">Modern streetwear essentials</p>
            </div>
          </Link>
        </div>

        <div className="hidden lg:flex lg:items-center lg:gap-8">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `text-sm font-medium transition ${
                  isActive ? "text-[#B21A15]" : "text-gray-700 hover:text-black"
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </div>

        <div className="hidden min-w-0 flex-1 items-center justify-end gap-3 md:flex">
          <div className="relative w-full max-w-xs lg:max-w-sm">
            <div className="flex items-center rounded-full border border-black/10 bg-white px-4 py-3 shadow-sm">
              <Search size={16} className="text-gray-400" />
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products"
                className="ml-3 w-full bg-transparent text-sm text-gray-800 outline-none placeholder:text-gray-400"
              />
            </div>

            {suggestions.length > 0 && (
              <div className="absolute top-full z-50 mt-3 w-full overflow-hidden rounded-[1.2rem] border border-black/5 bg-white shadow-[0_20px_40px_rgba(15,23,42,0.10)]">
                {suggestions.slice(0, 5).map((item) => (
                  <button
                    key={item._id}
                    onClick={() => handleSelectProduct(item._id)}
                    className="flex w-full items-center gap-3 px-4 py-3 text-left transition hover:bg-[#faf6f1]"
                  >
                    <img
                      src={item.thumbnail || item.images?.[0]}
                      alt={item.title}
                      className="h-11 w-11 rounded-xl object-cover"
                    />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-gray-900">
                        {item.title}
                      </p>
                      {item.price && (
                        <p className="text-xs text-gray-500">Rs. {item.price}</p>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          <Link
            to="/cart"
            className="relative inline-flex h-11 w-11 items-center justify-center rounded-full border border-black/10 bg-white text-gray-800 shadow-sm transition hover:border-black"
          >
            <ShoppingBag size={18} />
            {cartCount > 0 && (
              <span className="absolute -right-1 -top-1 inline-flex min-w-5 items-center justify-center rounded-full bg-[#B21A15] px-1.5 py-0.5 text-[10px] font-semibold text-white">
                {cartCount}
              </span>
            )}
          </Link>

          {!user ? (
            <Link
              to="/login"
              className="inline-flex items-center gap-2 rounded-full bg-[#B21A15] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#99150f]"
            >
              <UserIcon size={16} />
              Sign In
            </Link>
          ) : (
            <Link
              to="/profile"
              className="inline-flex h-11 w-11 items-center justify-center overflow-hidden rounded-full border border-black/10 bg-white shadow-sm"
            >
              {profile?.profileImageUrl ? (
                <img
                  src={profile.profileImageUrl}
                  alt="profile"
                  className="h-full w-full object-cover"
                />
              ) : (
                <UserIcon size={18} className="text-gray-700" />
              )}
            </Link>
          )}
        </div>

        <div className="flex items-center gap-2 md:hidden">
          <Link
            to="/cart"
            className="relative inline-flex h-11 w-11 items-center justify-center rounded-full border border-black/10 bg-white text-gray-800 shadow-sm"
          >
            <ShoppingBag size={18} />
            {cartCount > 0 && (
              <span className="absolute -right-1 -top-1 inline-flex min-w-5 items-center justify-center rounded-full bg-[#B21A15] px-1.5 py-0.5 text-[10px] font-semibold text-white">
                {cartCount}
              </span>
            )}
          </Link>
          {!user ? (
            <Link
              to="/login"
              className="rounded-full bg-[#B21A15] px-4 py-2 text-sm font-semibold text-white"
            >
              Login
            </Link>
          ) : (
            <Link
              to="/profile"
              className="inline-flex h-11 w-11 items-center justify-center overflow-hidden rounded-full border border-black/10 bg-white"
            >
              {profile?.profileImageUrl ? (
                <img
                  src={profile.profileImageUrl}
                  alt="profile"
                  className="h-full w-full object-cover"
                />
              ) : (
                <UserIcon size={18} className="text-gray-700" />
              )}
            </Link>
          )}
        </div>
      </nav>

      <div
        className={`fixed inset-0 z-50 md:hidden ${
          mobileMenuOpen ? "visible" : "invisible"
        }`}
      >
        <div
          className={`absolute inset-0 bg-black/40 transition-opacity ${
            mobileMenuOpen ? "opacity-100" : "opacity-0"
          }`}
          onClick={(e) =>
            e.target === e.currentTarget && setMobileMenuOpen(false)
          }
        />

        <div
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          className={`absolute bottom-0 left-0 right-0 rounded-t-[2rem] bg-[#fcf8f4] p-6 shadow-2xl transition-transform ${
            mobileMenuOpen ? "translate-y-0" : "translate-y-full"
          }`}
        >
          <div className="mx-auto mb-5 h-1.5 w-12 rounded-full bg-black/10" />

          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.26em] text-[#B21A15]">
                PrintedTeez
              </p>
              <p className="mt-1 text-sm text-gray-500">
                Streetwear with a cleaner edge
              </p>
            </div>
            <button
              type="button"
              onClick={() => setMobileMenuOpen(false)}
              className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-black/10"
            >
              <X size={18} />
            </button>
          </div>

          <div className="relative mt-6">
            <div className="flex items-center rounded-full border border-black/10 bg-white px-4 py-3 shadow-sm">
              <Search size={16} className="text-gray-400" />
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products"
                className="ml-3 w-full bg-transparent text-sm text-gray-800 outline-none placeholder:text-gray-400"
              />
            </div>

            {suggestions.length > 0 && (
              <div className="mt-3 overflow-hidden rounded-[1.2rem] border border-black/5 bg-white shadow-lg">
                {suggestions.slice(0, 5).map((item) => (
                  <button
                    key={item._id}
                    onClick={() => handleSelectProduct(item._id)}
                    className="flex w-full items-center gap-3 px-4 py-3 text-left transition hover:bg-[#faf6f1]"
                  >
                    <img
                      src={item.thumbnail || item.images?.[0]}
                      alt={item.title}
                      className="h-11 w-11 rounded-xl object-cover"
                    />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-gray-900">
                        {item.title}
                      </p>
                      {item.price && (
                        <p className="text-xs text-gray-500">Rs. {item.price}</p>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="mt-8 grid gap-2">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => setMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `rounded-2xl px-4 py-3 text-base font-medium transition ${
                    isActive
                      ? "bg-[#B21A15] text-white"
                      : "text-gray-800 hover:bg-[#f2ebe3]"
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
