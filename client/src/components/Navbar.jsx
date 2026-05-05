import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, NavLink, useLocation, useNavigate } from "react-router";
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
  const location = useLocation();

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
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = mobileMenuOpen ? "hidden" : previousOverflow;

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [mobileMenuOpen]);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

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
    <div className="relative z-40 w-full border-b border-black/5 bg-[rgba(252,249,245,0.96)] backdrop-blur-xl dark:border-white/8 dark:bg-[rgba(11,13,18,0.84)]">
      <nav className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-6 md:py-4 lg:px-8">
        <div className="flex items-center gap-3">
          <button
            type="button"
            className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-black/10 text-gray-700 dark:border-white/10 dark:text-gray-200 md:hidden"
            onClick={() => setMobileMenuOpen(true)}
          >
            <Menu size={20} />
          </button>

          <Link to="/" className="flex items-center gap-3">
            <img
              src={logo}
              alt="PrintedTeez"
              className="hidden h-11 w-auto object-contain sm:block"
            />
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.26em] text-[#B21A15]">
                PrintedTeez
              </p>
              <p className="hidden text-xs text-gray-500 dark:text-gray-400 sm:block">
                Modern streetwear essentials
              </p>
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
                  isActive ? "text-[#B21A15] dark:text-[#ff8f82]" : "text-gray-700 hover:text-black dark:text-gray-300 dark:hover:text-white"
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </div>

        <div className="hidden min-w-0 flex-1 items-center justify-end gap-3 md:flex">
          <div className="relative w-full max-w-xs lg:max-w-sm">
            <div className="flex items-center rounded-full border border-black/10 bg-white px-4 py-3 shadow-sm dark:border-white/10 dark:bg-white/6 dark:shadow-[0_12px_30px_rgba(0,0,0,0.25)]">
              <Search size={16} className="text-gray-400 dark:text-gray-500" />
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products"
                className="ml-3 w-full bg-transparent text-sm text-gray-800 outline-none placeholder:text-gray-400 dark:text-gray-100 dark:placeholder:text-gray-500"
              />
            </div>

            {suggestions.length > 0 && (
              <div className="absolute top-full z-50 mt-3 w-full overflow-hidden rounded-[1.2rem] border border-black/5 bg-white shadow-[0_20px_40px_rgba(15,23,42,0.10)] dark:border-white/10 dark:bg-[#171b22] dark:shadow-[0_24px_50px_rgba(0,0,0,0.42)]">
                {suggestions.slice(0, 5).map((item) => (
                  <button
                    key={item._id}
                    onClick={() => handleSelectProduct(item._id)}
                    className="flex w-full items-center gap-3 px-4 py-3 text-left transition hover:bg-[#faf6f1] dark:hover:bg-white/6"
                  >
                    <img
                      src={item.thumbnail || item.images?.[0]}
                      alt={item.title}
                      className="h-11 w-11 rounded-xl object-cover"
                    />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-gray-900 dark:text-gray-100">
                        {item.title}
                      </p>
                      {item.price && (
                        <p className="text-xs text-gray-500 dark:text-gray-400">Rs. {item.price}</p>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          <Link
            to="/cart"
            className="relative inline-flex h-11 w-11 items-center justify-center rounded-full border border-black/10 bg-white text-gray-800 shadow-sm transition hover:border-black dark:border-white/10 dark:bg-white/6 dark:text-gray-100 dark:hover:border-white/25"
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
              className="inline-flex items-center gap-2 rounded-full bg-[#B21A15] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#99150f] dark:bg-[#c53a2d] dark:shadow-[0_14px_34px_rgba(197,58,45,0.28)] dark:hover:bg-[#d44739]"
            >
              <UserIcon size={16} />
              Sign In
            </Link>
          ) : (
            <Link
              to="/profile"
              className="inline-flex h-11 w-11 items-center justify-center overflow-hidden rounded-full border border-black/10 bg-white shadow-sm dark:border-white/10 dark:bg-white/6"
            >
              {profile?.profileImageUrl ? (
                <img
                  src={profile.profileImageUrl}
                  alt="profile"
                  className="h-full w-full object-cover"
                />
              ) : (
                <UserIcon size={18} className="text-gray-700 dark:text-gray-200" />
              )}
            </Link>
          )}
        </div>

        <div className="flex items-center gap-2 md:hidden">
          <Link
            to="/cart"
            className="relative inline-flex h-11 w-11 items-center justify-center rounded-full border border-black/10 bg-white text-gray-800 shadow-sm dark:border-white/10 dark:bg-white/6 dark:text-gray-100"
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
              className="rounded-full bg-[#B21A15] px-3.5 py-2 text-sm font-semibold text-white dark:bg-[#c53a2d]"
            >
              Login
            </Link>
          ) : (
            <Link
              to="/profile"
              className="inline-flex h-11 w-11 items-center justify-center overflow-hidden rounded-full border border-black/10 bg-white dark:border-white/10 dark:bg-white/6"
            >
              {profile?.profileImageUrl ? (
                <img
                  src={profile.profileImageUrl}
                  alt="profile"
                  className="h-full w-full object-cover"
                />
              ) : (
                <UserIcon size={18} className="text-gray-700 dark:text-gray-200" />
              )}
            </Link>
          )}
        </div>
      </nav>

      <div
        className={`fixed inset-0 z-[90] md:hidden ${
          mobileMenuOpen ? "pointer-events-auto" : "pointer-events-none"
        }`}
      >
        <div
          className={`absolute inset-0 bg-[rgba(15,23,42,0.18)] backdrop-blur-xl transition-opacity dark:bg-[rgba(4,6,10,0.58)] ${
            mobileMenuOpen ? "opacity-100" : "opacity-0"
          }`}
          onClick={() => setMobileMenuOpen(false)}
        />

        <aside
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          className={`fixed left-0 top-0 flex h-[100dvh] w-[min(88vw,360px)] flex-col overflow-y-auto border-r border-white/40 bg-[linear-gradient(180deg,rgba(252,248,244,0.62),rgba(248,240,234,0.54))] px-5 pb-6 pt-5 shadow-[0_24px_60px_rgba(15,23,42,0.24)] backdrop-blur-[28px] transition-transform dark:border-white/10 dark:bg-[linear-gradient(180deg,rgba(14,16,22,0.82),rgba(20,22,31,0.9))] dark:shadow-[0_24px_70px_rgba(0,0,0,0.42)] ${
            mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.3),rgba(255,255,255,0.08)_28%,rgba(178,26,21,0.05)_100%)]" />
            <div className="absolute -left-10 top-24 h-44 w-44 rounded-full bg-[#B21A15]/14 blur-3xl" />
            <div className="absolute right-0 top-0 h-52 w-52 rounded-full bg-white/45 blur-3xl dark:bg-white/8" />
            <div className="absolute bottom-24 left-8 right-8 h-px bg-gradient-to-r from-transparent via-[#B21A15]/25 to-transparent" />
          </div>

          <div className="relative flex items-center justify-between gap-3 border-b border-black/5 pb-4 dark:border-white/8">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.26em] text-[#B21A15]">
                PrintedTeez
              </p>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Streetwear with a cleaner edge
              </p>
            </div>
            <button
              type="button"
              onClick={() => setMobileMenuOpen(false)}
              className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-black/10 dark:border-white/10 dark:text-gray-100"
            >
              <X size={18} />
            </button>
          </div>

          <div className="relative mt-5 shrink-0">
            <div className="flex items-center rounded-full border border-white/55 bg-white/62 px-4 py-3 shadow-[0_12px_30px_rgba(15,23,42,0.08)] backdrop-blur-md dark:border-white/10 dark:bg-white/6">
              <Search size={16} className="text-gray-400 dark:text-gray-500" />
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products"
                className="ml-3 w-full bg-transparent text-sm text-gray-800 outline-none placeholder:text-gray-400 dark:text-gray-100 dark:placeholder:text-gray-500"
              />
            </div>

            {suggestions.length > 0 && (
              <div className="mt-3 max-h-72 overflow-y-auto rounded-[1.2rem] border border-white/50 bg-white/74 shadow-lg backdrop-blur-md dark:border-white/10 dark:bg-[#171b22]">
                {suggestions.slice(0, 5).map((item) => (
                  <button
                    key={item._id}
                    onClick={() => handleSelectProduct(item._id)}
                    className="flex w-full items-center gap-3 px-4 py-3 text-left transition hover:bg-[#faf6f1] dark:hover:bg-white/6"
                  >
                    <img
                      src={item.thumbnail || item.images?.[0]}
                      alt={item.title}
                      className="h-11 w-11 rounded-xl object-cover"
                    />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-gray-900 dark:text-gray-100">
                        {item.title}
                      </p>
                      {item.price && (
                        <p className="text-xs text-gray-500 dark:text-gray-400">Rs. {item.price}</p>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="relative mt-6 grid shrink-0 gap-2">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => setMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `rounded-2xl px-4 py-3 text-base font-medium backdrop-blur-sm transition ${
                    isActive
                      ? "bg-[#B21A15] text-white shadow-[0_14px_34px_rgba(178,26,21,0.28)]"
                      : "border border-white/18 bg-white/22 text-gray-800 hover:border-white/35 hover:bg-white/34 dark:border-white/10 dark:bg-white/6 dark:text-gray-100 dark:hover:bg-white/12"
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </div>

          <div className="relative mt-6 grid shrink-0 grid-cols-2 gap-3 border-t border-black/5 pt-5 dark:border-white/8">
            <Link
              to="/cart"
              onClick={() => setMobileMenuOpen(false)}
              className="rounded-2xl border border-white/55 bg-white/62 px-4 py-3 text-center text-sm font-medium text-gray-800 shadow-[0_10px_24px_rgba(15,23,42,0.08)] backdrop-blur-md dark:border-white/10 dark:bg-white/6 dark:text-gray-100"
            >
              Cart
            </Link>
            <Link
              to={user ? "/profile" : "/login"}
              onClick={() => setMobileMenuOpen(false)}
              className="rounded-2xl bg-[#B21A15] px-4 py-3 text-center text-sm font-semibold text-white"
            >
              {user ? "Profile" : "Login"}
            </Link>
          </div>

          <div className="relative mt-6 shrink-0 rounded-[1.5rem] border border-white/40 bg-white/48 p-4 backdrop-blur-md">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#B21A15]">
              Quick Note
            </p>
            <p className="mt-2 text-sm leading-6 text-gray-600 dark:text-gray-300">
              Swipe down or tap outside this panel to close the menu.
            </p>
          </div>

          <div className="relative mt-6 shrink-0 pb-2">
            <p className="text-xs leading-6 text-gray-500 dark:text-gray-400">
              PrintedTeez mobile navigation
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default Navbar;
