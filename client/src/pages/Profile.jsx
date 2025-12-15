import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchProfile,
  updateProfile,
  changePassword,
  deleteMyAccount,
} from "../redux/slices/userSlice";
import { logout } from "../redux/slices/authSlice";
import { getMyOrders } from "../redux/slices/orderSlice";

const tabs = ["User data", "Order history", "View history"];

const statusColors = {
  pending:
    "bg-gray-100 text-gray-700 dark:bg-gray-900 dark:text-gray-300",
  processing:
    "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300",
  shipped:
    "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
  delivered:
    "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
  cancelled:
    "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300",
};

const fallbackImage = "https://placehold.co/400x300/cccccc/969696.webp?text=No%20image&font=lato"

const Profile = () => {
  const dispatch = useDispatch();

  const { profile, loading, error, message } = useSelector(
    (state) => state.user
  );

  const { myOrders = [], loading: orderLoading } = useSelector(
    (state) => state.order
  );

  const [activeTab, setActiveTab] = useState(0);
  const [expanded, setExpanded] = useState(null);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [avatar, setAvatar] = useState(null);

  const [oldPass, setOldPass] = useState("");
  const [newPass, setNewPass] = useState("");

  useEffect(() => {
    dispatch(fetchProfile());
    dispatch(getMyOrders());
  }, [dispatch]);

  useEffect(() => {
    if (profile) {
      setName(profile.name || "");
      setPhone(profile.phone || "");
    }
  }, [profile]);

  const handleUpdate = () => {
    const fd = new FormData();
    fd.append("name", name);
    fd.append("phone", phone);
    if (avatar) fd.append("avatar", avatar);
    dispatch(updateProfile(fd));
  };

  const handlePasswordChange = () => {
    if (!oldPass || !newPass) return;
    dispatch(changePassword({ oldPassword: oldPass, newPassword: newPass }));
  };

  const handleAccountDelete = () => {
    if (window.confirm("Are you sure? This is permanent.")) {
      dispatch(deleteMyAccount());
      dispatch(logout());
    }
  };

  return (
    <div className="min-h-screen px-4 md:px-10 py-8 bg-[#F7F7F7] dark:bg-[#0D0D0D] transition">
      <h1 className="text-3xl font-semibold text-gray-900 dark:text-gray-100">
        Profile
      </h1>

      {/* Tabs */}
      <div className="flex gap-6 mt-6 border-b border-gray-300 dark:border-gray-700">
        {tabs.map((tab, idx) => (
          <button
            key={idx}
            onClick={() => setActiveTab(idx)}
            className={`pb-2 px-2 text-lg transition relative ${
              activeTab === idx
                ? "text-[#B21A15] dark:text-[#FF6A63] font-semibold"
                : "text-gray-600 dark:text-gray-400"
            }`}
          >
            {tab}
            {activeTab === idx && (
              <span className="absolute left-0 bottom-0 w-full h-[3px] bg-[#B21A15] dark:bg-[#FF6A63] rounded-full"></span>
            )}
          </button>
        ))}
      </div>

      {/* TAB CONTENT */}
      <div className="mt-8">
        {/* -------------------- USER DATA TAB -------------------- */}
        {activeTab === 0 && (
          <div className="space-y-6">
            {/* Personal Data */}
            <div className="bg-white dark:bg-[#1A1A1A] shadow-sm rounded-2xl p-6">
              <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">
                Personal Data
              </h2>

              <div className="space-y-4">
                <div>
                  <p className="text-gray-600 dark:text-gray-400">Name</p>
                  <input
                    className="bg-transparent border-b border-gray-300 dark:border-gray-600 focus:border-[#B21A15] dark:focus:border-[#FF6A63] w-full outline-none text-gray-900 dark:text-gray-100 py-1"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>

                <div>
                  <p className="text-gray-600 dark:text-gray-400">Phone</p>
                  <input
                    className="bg-transparent border-b border-gray-300 dark:border-gray-600 focus:border-[#B21A15] dark:focus:border-[#FF6A63] w-full outline-none text-gray-900 dark:text-gray-100 py-1"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>

                <div>
                  <p className="text-gray-600 dark:text-gray-400">Avatar</p>
                  <input
                    type="file"
                    className="text-gray-700 dark:text-gray-300"
                    onChange={(e) => setAvatar(e.target.files[0])}
                  />
                </div>
              </div>

              <button
                onClick={handleUpdate}
                className="mt-6 px-6 py-2 bg-[#B21A15] dark:bg-[#FF6A63] hover:opacity-90 text-white rounded-xl"
              >
                Update Profile
              </button>

              {message && (
                <p className="text-green-600 dark:text-green-400 mt-3">
                  {message}
                </p>
              )}
              {error && (
                <p className="text-red-600 dark:text-red-400 mt-2">
                  {error}
                </p>
              )}
            </div>

            {/* Password */}
            <div className="bg-white dark:bg-[#1A1A1A] shadow-sm rounded-2xl p-6">
              <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">
                Login & Password
              </h2>

              <div className="space-y-4">
                <div>
                  <p className="text-gray-600 dark:text-gray-400">
                    Old Password
                  </p>
                  <input
                    type="password"
                    className="bg-transparent border-b w-full border-gray-300 dark:border-gray-600 focus:border-[#B21A15] dark:focus:border-[#FF6A63] outline-none text-gray-100 py-1"
                    value={oldPass}
                    onChange={(e) => setOldPass(e.target.value)}
                  />
                </div>

                <div>
                  <p className="text-gray-600 dark:text-gray-400">
                    New Password
                  </p>
                  <input
                    type="password"
                    className="bg-transparent border-b w-full border-gray-300 dark:border-gray-600 focus:border-[#B21A15] dark:focus:border-[#FF6A63] outline-none text-gray-100 py-1"
                    value={newPass}
                    onChange={(e) => setNewPass(e.target.value)}
                  />
                </div>
              </div>

              <button
                onClick={handlePasswordChange}
                className="mt-6 px-6 py-2 bg-[#B21A15] dark:bg-[#FF6A63] hover:opacity-90 text-white rounded-xl"
              >
                Change Password
              </button>
            </div>

            {/* Delete Account */}
            <div className="bg-white dark:bg-[#1A1A1A] shadow-sm rounded-2xl p-6">
              <button
                onClick={handleAccountDelete}
                className="px-6 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700"
              >
                Delete My Account
              </button>
            </div>
          </div>
        )}

        {/* -------------------- ORDER HISTORY TAB -------------------- */}
        {activeTab === 1 && (
          <div>
            {orderLoading && (
              <p className="text-gray-600 dark:text-gray-300">Loading…</p>
            )}

            {!orderLoading && (!myOrders || myOrders.length === 0) && (
              <p className="text-gray-600 dark:text-gray-300">
                No orders found.
              </p>
            )}

            <div className="space-y-6">
              {myOrders?.map((order) => (
                <div
                  key={order._id}
                  className="bg-white dark:bg-[#1A1A1A] shadow-sm rounded-2xl p-6 border border-gray-200 dark:border-[#333]"
                >
                  {/* Amount + Status */}
                  <div className="flex justify-between items-center mb-2">
                    <div>
                      <p className="text-2xl font-bold text-black dark:text-white">
                        ₹{order.finalAmount}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Order ID: {order._id.slice(-6).toUpperCase()}
                      </p>
                    </div>

                    <span
                      className={`px-3 py-1 rounded-full text-sm capitalize ${
                        statusColors[order.status] || ""
                      }`}
                    >
                      {order.status}
                    </span>
                  </div>

                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                    Ordered on:{" "}
                    {order.createdAt
                      ? new Date(order.createdAt).toLocaleString()
                      : "N/A"}
                  </p>

                  {/* Item Images Row */}
                  <div className="flex gap-4 overflow-x-auto py-2">
                    {order.items?.map((item) => (
                      <div
                        key={item._id}
                        className="flex items-center gap-3 min-w-[200px]"
                      >
                        <img
                          src={item.image || fallbackImage}
                          alt={item.title}
                          className="w-16 h-16 object-cover rounded"
                          onError={(e) => {
                            e.currentTarget.src = fallbackImage;
                          }}
                        />
                        <div>
                          <p className="font-medium text-gray-900 dark:text-gray-100">
                            {item.title}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            Size: {item.size} • Qty: {item.qty}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Expand Button */}
                  <button
                    onClick={() =>
                      setExpanded(expanded === order._id ? null : order._id)
                    }
                    className="mt-4 text-[#B21A15] dark:text-[#FF6A63] font-medium"
                  >
                    {expanded === order._id
                      ? "Hide details ▲"
                      : "View details ▼"}
                  </button>

                  {/* Expanded Section */}
                  {expanded === order._id && (
                    <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 space-y-4">
                      {order.items?.map((item) => (
                        <div
                          key={item._id}
                          className="flex justify-between items-center"
                        >
                          <div>
                            <p className="text-gray-900 dark:text-gray-200 font-medium">
                              {item.title}
                            </p>
                            <p className="text-gray-500 dark:text-gray-400 text-sm">
                              Size: {item.size} • Qty: {item.qty}
                            </p>
                          </div>

                          <p className="text-gray-800 dark:text-gray-300 font-medium">
                            ₹{item.price * item.qty}
                          </p>
                        </div>
                      ))}

                      {/* Delivery Address */}
                      <div className="pt-2">
                        <p className="text-gray-500 dark:text-gray-400 text-sm">
                          Delivery Address:
                        </p>
                        <p className="text-gray-800 dark:text-gray-200">
                          {order.shippingAddress?.name},{" "}
                          {order.shippingAddress?.city},{" "}
                          {order.shippingAddress?.state} -{" "}
                          {order.shippingAddress?.postalCode}
                        </p>
                      </div>

                      <button className="mt-4 px-4 py-2 rounded-xl bg-[#B21A15] dark:bg-[#FF6A63] hover:opacity-90 text-white text-sm">
                        Leave a Review
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* -------------------- VIEW HISTORY TAB -------------------- */}
        {activeTab === 2 && (
          <p className="text-gray-600 dark:text-gray-300">
            View history coming soon.
          </p>
        )}
      </div>
    </div>
  );
};

export default Profile;
