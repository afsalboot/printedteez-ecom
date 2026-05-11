import React, { useEffect } from "react";
import { useSelector } from "react-redux";
import { Routes, Route, Navigate } from "react-router";
import Layout from "./layout/Layout.jsx";
import Home from "./pages/Home.jsx";
import Signup from "./pages/Signup.jsx";
import Login from "./pages/Login.jsx";
import ProductList from "./pages/productList.jsx";
import ProductDetails from "./pages/ProductDetails.jsx";
import Cart from "./pages/Cart.jsx";
import Checkout from "./pages/Checkout.jsx";
import Profile from "./pages/Profile.jsx";
import UpdateProfile from "./components/UpdateProfile.jsx";

/* Admin Pages */
import AdminLogin from "./admin/pages/AdminLogin.jsx";
import Dashboard from "./admin/pages/Dashboard.jsx";
import ProductManage from "./admin/pages/ProductManage.jsx";
import ProductCreate from "./admin/pages/ProductCreate.jsx";
import CategoryManage from "./admin/pages/CategoryManage.jsx";
import UserManage from "./admin/pages/UserManage.jsx";
import OrderManage from "./admin/pages/OrderManage.jsx";
import CouponManage from "./admin/pages/CouponManage.jsx";
import AdminLayout from "./admin/layout/AdminLayout.jsx";
import CouponCreate from "./admin/pages/CouponCreate.jsx";
import Settings from "./admin/components/Settings.jsx";
import ProductUpdate from "./admin/components/ProductUpdate.jsx";
import ProductAdminDetails from "./admin/pages/ProductAdminDetails.jsx";
import CouponUpdate from "./admin/components/CouponUpdate.jsx";
import AdminSections from "./admin/components/AdminSections.jsx";
import SitePagesManage from "./admin/pages/SitePagesManage.jsx";
import Events from "./components/Events.jsx";
import About from "./components/About.jsx";
import Contact from "./components/Contact.jsx";
import Blog from "./components/Blog.jsx";
import PaymentSuccess from "./components/PaymentSuccess.jsx";
import MyOrders from "./components/MyOrders.jsx";
import ThemeSync from "./ui/ThemeSync.jsx";
import PageReveal from "./components/PageReveal.jsx";

const App = () => {
  const darkMode = useSelector((state) => state.ui.darkMode);
  const { adminToken } = useSelector((state) => state.admin);

  /* Dark Mode Toggle */
  useEffect(() => {
    if (darkMode) document.documentElement.classList.add("dark");
    else document.documentElement.classList.remove("dark");
  }, [darkMode]);

  /* Admin Protected Route */
  const AdminProtected = ({ children }) => {
    return adminToken ? children : <Navigate to="/admin/login" replace />;
  };

  const withReveal = (element) => <PageReveal>{element}</PageReveal>;

  return (
    <>
      <ThemeSync />
      <Routes>
      {/* USER ROUTES */}
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/shop" element={<ProductList />} />
        <Route path="/product/:id" element={<ProductDetails />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/settings" element={<UpdateProfile />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/blog" element={<Blog />} />
        <Route path="/event" element={<Events />} />
      </Route>

      <Route path="/register" element={withReveal(<Signup />)} />
      <Route path="/login" element={withReveal(<Login />)} />
      <Route path="/payment-success" element={withReveal(<PaymentSuccess />)} />
      <Route path="/orders" element={withReveal(<MyOrders />)} />

      {/* ADMIN LOGIN */}
      <Route path="/admin/login" element={withReveal(<AdminLogin />)} />

      {/* ADMIN PROTECTED AREA */}
      <Route
        path="/admin"
        element={
          <AdminProtected>
            <AdminLayout />
          </AdminProtected>
        }
      >
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="products/manage" element={<ProductManage />} />
        <Route path="categories" element={<CategoryManage />} />
        <Route path="products/create" element={<ProductCreate />} />
        <Route path="products/:id" element={<ProductAdminDetails />} />
        <Route path="users" element={<UserManage />} />
        <Route path="orders" element={<OrderManage />} />
        <Route path="coupons/manage" element={<CouponManage />} />
        <Route path="coupons/create" element={<CouponCreate />} />
        <Route path="settings" element={<Settings />} />
        <Route path="products/edit/:id" element={<ProductUpdate />} />
        <Route path="coupons/edit/:id" element={<CouponUpdate />} />
        <Route path="section" element={<AdminSections />} />
        <Route path="site-pages" element={<SitePagesManage />} />
      </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
};

export default App;
