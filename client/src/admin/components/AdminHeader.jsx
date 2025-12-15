import React from "react";
import { useSelector } from "react-redux";

const AdminHeader = () => {
  const { admin } = useSelector((s) => s.admin);
  const name = admin?.name || "Admin";
  const initial = name.charAt(0).toUpperCase();

  return (
    <header className="w-full bg-red-700 text-white px-6 py-4 flex justify-between items-center shadow">
      {/* Left: Title */}
      <div>
        <h1 className="text-lg font-semibold tracking-wide">Admin Dashboard</h1>
        <p className="text-xs text-red-100 opacity-90">Manage the entire store</p>
      </div>

      {/* Right: Admin Info */}
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-full bg-red-900 flex items-center justify-center text-sm font-bold">
          {initial}
        </div>
        <p className="text-sm font-medium">Hi, {name}</p>
      </div>
    </header>
  );
};

export default AdminHeader;
