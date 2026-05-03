import React from "react";
import { NavLink, useNavigate } from "react-router";
import {
  Home,
  Package,
  Users,
  ShoppingCart,
  LogOut,
  TicketPercent,
  Settings,
  LayoutGrid,
  Tags,
} from "lucide-react";
import { useDispatch } from "react-redux";
import { adminLogout } from "../../redux/slices/adminSlice";

const navItems = [
  { to: "/admin/dashboard", icon: Home, label: "Dashboard" },
  { to: "/admin/products/manage", icon: Package, label: "Product Manage" },
  { to: "/admin/categories", icon: Tags, label: "Categories" },
  { to: "/admin/users", icon: Users, label: "User Manage" },
  { to: "/admin/coupons/manage", icon: TicketPercent, label: "Coupon Manage" },
  { to: "/admin/orders", icon: ShoppingCart, label: "Order Manage" },
  { to: "/admin/section", icon: LayoutGrid, label: "Sections" },
];

const AdminSidebar = ({
  mobileNavOpen = false,
  setMobileNavOpen = () => {},
}) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(adminLogout());
    setMobileNavOpen(false);
    navigate("/");
  };

  const linkClasses = ({ isActive }) =>
    [
      "group flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition-all duration-200",
      isActive
        ? "bg-white text-red-700 shadow-[0_16px_40px_rgba(127,29,29,0.35)]"
        : "text-red-50/90 hover:bg-red-800/70 hover:text-white",
    ].join(" ");

  const handleNavigate = () => {
    setMobileNavOpen(false);
  };

  const sidebarContent = (
    <div className="flex min-h-full flex-col px-5 py-6">
        <div className="rounded-[28px] border border-white/15 bg-gradient-to-br from-red-600 to-red-800 p-5 shadow-[0_24px_60px_rgba(127,29,29,0.45)]">
          <p className="text-[11px] uppercase tracking-[0.42em] text-red-100/80">
            PrintedTeez
          </p>
          <h2 className="mt-3 text-2xl font-semibold tracking-[0.18em]">
            ADMIN PANEL
          </h2>
          <p className="mt-2 text-sm leading-6 text-red-50/85">
            Manage products, orders, users, and storefront sections from one place.
          </p>

          <div className="mt-5 grid grid-cols-2 gap-3 text-xs">
            <div className="rounded-2xl bg-white/10 px-3 py-3 backdrop-blur-sm">
              <p className="text-red-100/70">Workspace</p>
              <p className="mt-1 font-semibold text-white">Store Control</p>
            </div>
            <div className="rounded-2xl bg-white/10 px-3 py-3 backdrop-blur-sm">
              <p className="text-red-100/70">Mode</p>
              <p className="mt-1 font-semibold text-white">Live Admin</p>
            </div>
          </div>
        </div>

        <div className="mt-8">
          <p className="px-2 text-[11px] uppercase tracking-[0.32em] text-red-100/65">
            Navigation
          </p>
          <nav className="mt-3 flex flex-1 flex-col gap-2">
            {navItems.map(({ to, icon: Icon, label }) => (
              <NavLink key={to} to={to} className={linkClasses} onClick={handleNavigate}>
                <Icon size={18} />
                <span>{label}</span>
              </NavLink>
            ))}
          </nav>
        </div>

        <div className="mt-auto border-t border-white/15 pt-5">
          <NavLink to="/admin/settings" className={linkClasses} onClick={handleNavigate}>
            <Settings size={18} />
            <span>Settings</span>
          </NavLink>

          <button
            onClick={handleLogout}
            className="mt-2 flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm font-medium text-red-50/90 transition hover:bg-red-800/70 hover:text-white"
          >
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
    </div>
  );

  return (
    <>
      <aside className="hidden w-[280px] shrink-0 self-start bg-red-700 text-white lg:sticky lg:top-0 lg:flex lg:h-screen lg:flex-col lg:overflow-y-auto">
        {sidebarContent}
      </aside>

      {mobileNavOpen ? (
        <div
          className="fixed inset-0 z-40 bg-slate-950/45 backdrop-blur-[2px] lg:hidden"
          onClick={() => setMobileNavOpen(false)}
        >
          <aside
            className="h-full w-[min(86vw,320px)] overflow-y-auto bg-red-700 text-white shadow-[0_24px_60px_rgba(15,23,42,0.35)]"
            onClick={(e) => e.stopPropagation()}
          >
            {sidebarContent}
          </aside>
        </div>
      ) : null}
    </>
  );
};

export default AdminSidebar;
