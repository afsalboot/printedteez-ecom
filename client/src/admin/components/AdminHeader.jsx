import React from "react";
import { useSelector } from "react-redux";
import { useLocation } from "react-router";
import { CalendarDays, Menu, ShieldCheck, X } from "lucide-react";

const pageMeta = [
  {
    match: "/admin/dashboard",
    title: "Control Center",
    subtitle: "Track store performance and monitor daily activity.",
  },
  {
    match: "/admin/products",
    title: "Catalog Workspace",
    subtitle: "Manage products, pricing, stock, and merchandising.",
  },
  {
    match: "/admin/categories",
    title: "Category Manager",
    subtitle: "Organize storefront groupings and product form options.",
  },
  {
    match: "/admin/orders",
    title: "Order Desk",
    subtitle: "Review incoming orders and keep fulfillment moving.",
  },
  {
    match: "/admin/users",
    title: "Customer Directory",
    subtitle: "Search, review, and manage registered shoppers.",
  },
  {
    match: "/admin/coupons",
    title: "Promotion Console",
    subtitle: "Tune discounts and campaign-based offers.",
  },
  {
    match: "/admin/section",
    title: "Home Sections",
    subtitle: "Control the storefront layout and featured sections.",
  },
  {
    match: "/admin/site-pages",
    title: "Site Content",
    subtitle: "Update About, Blog, and Contact page content from one workspace.",
  },
  {
    match: "/admin/settings",
    title: "Admin Settings",
    subtitle: "Adjust workspace preferences and admin options.",
  },
];

const AdminHeader = ({ mobileNavOpen = false, setMobileNavOpen = () => {} }) => {
  const { admin } = useSelector((s) => s.admin);
  const location = useLocation();
  const name = admin?.name || "Admin";
  const initial = name.charAt(0).toUpperCase();
  const today = new Date().toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
  const currentPage =
    pageMeta.find((item) => location.pathname.startsWith(item.match)) ||
    pageMeta[0];

  return (
    <header className="sticky top-0 z-20 border-b border-red-200/70 bg-white/88 backdrop-blur-xl">
      <div className="mx-auto flex w-full max-w-[1600px] items-center justify-between gap-3 px-4 py-4 md:px-6">
        <div className="min-w-0">
          <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.3em] text-red-500">
            <button
              type="button"
              onClick={() => setMobileNavOpen((prev) => !prev)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-red-100 bg-white text-red-600 shadow-sm lg:hidden"
              aria-label={mobileNavOpen ? "Close admin navigation" : "Open admin navigation"}
              aria-expanded={mobileNavOpen}
            >
              {mobileNavOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>Admin Workspace</span>
          </div>
          <h1 className="mt-1 text-xl font-semibold text-gray-900 sm:text-2xl">
            {currentPage.title}
          </h1>
          <p className="mt-1 max-w-xl text-sm text-gray-600">
            {currentPage.subtitle}
          </p>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <div className="hidden rounded-2xl border border-red-100 bg-red-50 px-4 py-2 text-right md:block">
            <div className="flex items-center justify-end gap-2 text-xs font-medium text-red-600">
              <CalendarDays className="h-3.5 w-3.5" />
              <span>{today}</span>
            </div>
            <p className="mt-1 text-xs text-gray-500">Admin session active</p>
          </div>

          <div className="flex items-center gap-3 rounded-2xl border border-red-100 bg-white px-3 py-2 shadow-sm">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-red-700 text-sm font-bold text-white shadow-[0_10px_24px_rgba(220,38,38,0.35)]">
              {initial}
            </div>
            <div className="hidden sm:block">
              <p className="text-xs uppercase tracking-[0.24em] text-gray-400">
                Signed in
              </p>
              <p className="text-sm font-semibold text-gray-900">{name}</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;
