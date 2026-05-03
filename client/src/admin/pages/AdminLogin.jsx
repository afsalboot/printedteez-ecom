import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { adminLogin } from "../../redux/slices/adminSlice";
import { useNavigate } from "react-router";

const AdminLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { loading, error } = useSelector((s) => s.admin);

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      alert("Please enter email & password");
      return;
    }

    const res = await dispatch(adminLogin({ email, password }));

    if (res?.token) {
      navigate("/admin/dashboard");
    }
  };

  return (
    <div className="w-full h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 transition">
      {/* Background accent */}
      <div className="absolute inset-0 pointer-events-none opacity-20">
        <div className="w-72 h-72 bg-red-600 rounded-full blur-3xl absolute -top-16 -left-10" />
        <div className="w-72 h-72 bg-red-700 rounded-full blur-3xl absolute bottom-0 right-0" />
      </div>

      <div className="relative bg-white dark:bg-gray-800 w-[420px] p-8 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700">
        {/* Header */}
        <div className="text-center mb-6">
          <p className="inline-flex items-center px-3 py-1 rounded-full text-[11px] font-medium bg-red-50 text-red-600 dark:bg-red-900/40 dark:text-red-200 mb-2">
            Store Admin
          </p>
          <h1 className="text-3xl font-semibold text-red-600 dark:text-red-400">
            Admin Login
          </h1>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Sign in to manage products, orders & users.
          </p>
        </div>

        {/* Error */}
        {error && (
          <p className="text-red-500 text-center mb-3 text-sm bg-red-50 dark:bg-red-900/40 px-3 py-2 rounded-md border border-red-200 dark:border-red-700">
            {error}
          </p>
        )}

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-600 dark:text-gray-300">
              Email
            </label>
            <input
              type="email"
              placeholder="admin@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border rounded-lg bg-gray-50 dark:bg-gray-700 dark:text-white dark:border-gray-600 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-600 dark:text-gray-300">
              Password
            </label>
            <input
              type="password"
              
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border rounded-lg bg-gray-50 dark:bg-gray-700 dark:text-white dark:border-gray-600 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
            />
          </div>

          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
            <span>Use your admin credentials to continue.</span>
            {/* Placeholder for future "Forgot password?" */}
            {/* <button type="button" className="text-red-600 dark:text-red-400 font-medium">
              Forgot?
            </button> */}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-red-600 text-white py-3 rounded-lg hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800 transition text-sm font-medium disabled:opacity-70 disabled:cursor-not-allowed mt-2"
          >
            {loading ? "Logging in..." : "Login Now"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;
