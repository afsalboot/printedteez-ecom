import { useEffect, useRef } from "react";
import { Outlet } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import Navbar from "../components/Navbar";
import LiveOffers from "../components/LiveOffers";
import Footer from "../components/Footer";
import PageReveal from "../components/PageReveal";
import { clearWishlist, getWishlist } from "../redux/slices/wishlistSlice";

const Layout = () => {
  const dispatch = useDispatch();
  const { token } = useSelector((state) => state.auth || {});
  const { items = [], loading, loaded, error, message } = useSelector(
    (state) => state.wishlist || {}
  );
  const syncedTokenRef = useRef("");

  useEffect(() => {
    if (!token) {
      syncedTokenRef.current = "";
      if (loaded || items.length > 0 || error || message) {
        dispatch(clearWishlist());
      }
      return;
    }

    if (syncedTokenRef.current !== token) {
      syncedTokenRef.current = token;
      dispatch(clearWishlist());
      dispatch(getWishlist());
      return;
    }

    if (!loading && !loaded) {
      dispatch(getWishlist());
    }
  }, [dispatch, error, items.length, loaded, loading, message, token]);

  return (
    <div className="flex min-h-screen flex-col bg-white text-gray-900 transition-colors dark:bg-[#0b0d12] dark:text-gray-100">
      <div className="sticky top-0 z-50">
        <LiveOffers />
        <Navbar />
      </div>
      {/* Main content grows to fill space */}
      <main className="flex-1">
        <PageReveal>
          <Outlet />
        </PageReveal>
      </main>
      <Footer />
    </div>
  );
};

export default Layout;
