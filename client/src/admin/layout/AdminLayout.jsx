import React, { useEffect, useState } from "react";
import { Outlet } from "react-router";
import AdminSidebar from "../components/AdminSidebar";
import AdminHeader from "../components/AdminHeader";
import PageReveal from "../../components/PageReveal";

const AdminLayout = () => {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = mobileNavOpen ? "hidden" : previousOverflow;

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [mobileNavOpen]);

  return (
    <div className="flex min-h-screen items-stretch bg-[#f6f1f1] text-gray-900 transition-colors dark:bg-[#0f1115] dark:text-gray-100">
      <AdminSidebar
        mobileNavOpen={mobileNavOpen}
        setMobileNavOpen={setMobileNavOpen}
      />

      <div className="relative flex min-w-0 flex-1 flex-col">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(220,38,38,0.14),_transparent_34%),radial-gradient(circle_at_bottom_left,_rgba(153,27,27,0.1),_transparent_28%)] dark:bg-[radial-gradient(circle_at_top_right,_rgba(220,38,38,0.18),_transparent_34%),radial-gradient(circle_at_bottom_left,_rgba(153,27,27,0.14),_transparent_28%)]" />

        <div className="relative shrink-0">
          <AdminHeader
            mobileNavOpen={mobileNavOpen}
            setMobileNavOpen={setMobileNavOpen}
          />
        </div>

        <div className="relative flex-1">
          <main className="mx-auto w-full max-w-[1600px] p-3 sm:p-4 md:p-6">
            <PageReveal>
              <Outlet />
            </PageReveal>
          </main>
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;
