import React from "react";
import { Outlet } from "react-router";
import AdminSidebar from "../components/AdminSidebar";
import AdminHeader from "../components/AdminHeader";

const AdminLayout = () => {
  return (
    <div className="flex w-full h-screen bg-gray-100 dark:bg-gray-900">
      
      {/* Sidebar */}
      <AdminSidebar />

      {/* Right Content */}
      <div className="flex-1 flex flex-col">
        
        {/* Sticky Header */}
        <div className="shrink-0">
          <AdminHeader />
        </div>

        {/* Scrollable Main Content */}
        <div className="flex-1 overflow-y-auto p-5 bg-white dark:bg-gray-900 text-black dark:text-white">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;
