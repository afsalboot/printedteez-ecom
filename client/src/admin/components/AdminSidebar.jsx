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
} from "lucide-react";
import { useDispatch } from "react-redux";
import { adminLogout } from "../../redux/slices/adminSlice";

const AdminSidebar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(adminLogout());
    navigate("/");
  };

  const linkClasses = ({ isActive }) =>
    [
      "sidebar-item",
      "flex items-center gap-2 px-6 py-3 text-sm font-medium transition",
      isActive
        ? "bg-red-800/90 shadow-inner"
        : "hover:bg-red-800/80 hover:bg-opacity-90",
    ].join(" ");

  return (
    <div className="w-[230px] h-full bg-red-700 text-white flex flex-col py-6">

      {/* BRAND */}
      <div className="px-6 mb-8">
        <h2 className="text-lg font-semibold tracking-[0.25em] text-center">
          ADMIN PANEL
        </h2>
        <p className="text-[11px] text-center mt-1 opacity-80">
          Manage store, users & orders
        </p>
      </div>

      {/* MAIN NAV */}
      <nav className="flex-1 flex flex-col gap-1">
        <NavLink to="/admin/dashboard" className={linkClasses}>
          <Home size={18} />
          <span>Dashboard</span>
        </NavLink>

        <NavLink to="/admin/products/manage" className={linkClasses}>
          <Package size={18} />
          <span>Product Manage</span>
        </NavLink>

        <NavLink to="/admin/users" className={linkClasses}>
          <Users size={18} />
          <span>User Manage</span>
        </NavLink>

        <NavLink to="/admin/coupons/manage" className={linkClasses}>
          <TicketPercent size={18} />
          <span>Coupon Manage</span>
        </NavLink>

        <NavLink to="/admin/orders" className={linkClasses}>
          <ShoppingCart size={18} />
          <span>Order Manage</span>
        </NavLink>

        <NavLink to="/admin/section" className={linkClasses}>
          <LayoutGrid size={18} />
          <span>Sections</span>
        </NavLink>
      </nav>

      {/* BOTTOM */}
      <div className="mt-4 border-t border-red-500/40 pt-3">
        <NavLink to="/admin/settings" className={linkClasses}>
          <Settings size={18} />
          <span>Settings</span>
        </NavLink>

        <button
          onClick={handleLogout}
          className="mt-1 flex items-center gap-2 px-6 py-3 text-sm font-medium w-full text-left hover:bg-red-800/80 transition"
        >
          <LogOut size={18} />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
};

export default AdminSidebar;
