import { Outlet } from "react-router";
import Navbar from "../components/Navbar";
import LiveOffers from "../components/LiveOffers";
import Footer from "../components/Footer";

const Layout = () => {
  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-gray-900">
      <div className="sticky top-0 z-50">
        <LiveOffers />
        <Navbar />
      </div>
      {/* Main content grows to fill space */}
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default Layout;
