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
import { LogOut } from "lucide-react";

const mainTabs = [
  "Profile",
  "Orders",
  "Security",
  "Appearance",
  "Notifications",
  "Danger Zone",
];

const profileTabs = ["Overview", "Edit Profile"];

const statusColors = {
  pending: "bg-gray-100 text-gray-700 dark:bg-gray-900 dark:text-gray-300",
  processing:
    "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300",
  shipped:
    "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
  delivered:
    "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
  cancelled:
    "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300",
};

const Profile = () => {
  const dispatch = useDispatch();
  const { profile, message, error } = useSelector((s) => s.user);
  const { myOrders = [], loading: orderLoading } = useSelector((s) => s.order);

  const [activeTab, setActiveTab] = useState(0);
  const [profileTab, setProfileTab] = useState(0);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [avatar, setAvatar] = useState(null);
  const [oldPass, setOldPass] = useState("");
  const [newPass, setNewPass] = useState("");

  const [darkMode, setDarkMode] = useState(
    document.documentElement.classList.contains("dark")
  );

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
    setProfileTab(0);
  };

  const onLogoutClick = () => {
    if (window.confirm("Are you sure you want to logout?")) {
      dispatch(logout());
      // Optional: Redirect user to login page
      // window.location.href = "/login"; 
    }
  };

  // const toggleTheme = () => {
  //   document.documentElement.classList.toggle("dark");
  //   setDarkMode(!darkMode);
  //   localStorage.setItem("theme", !darkMode ? "dark" : "light");
  // };

  return (
    <div className="min-h-screen bg-[#F7F7F7] dark:bg-[#0D0D0D] p-4 md:p-8">
      <div className="grid grid-cols-1 md:grid-cols-[280px_1fr] gap-6">

        {/* SIDEBAR */}
        <aside className="bg-white dark:bg-[#1A1A1A] rounded-2xl p-6 shadow flex flex-col">
          <div className="text-center">
            <div className="w-20 h-20 mx-auto rounded-full bg-[#B21A15] text-white flex items-center justify-center text-2xl font-bold">
              {profile?.name?.[0]?.toUpperCase() || "U"}
            </div>
            <h3 className="mt-3 font-semibold text-gray-900 dark:text-white">
              {profile?.name || "User"}
            </h3>
            <p className="text-sm text-gray-500">{profile?.email}</p>
          </div>

          <nav className="mt-8 space-y-2 flex-1">
            {mainTabs.map((tab, i) => (
              <button
                key={i}
                onClick={() => {
                  setActiveTab(i);
                  setProfileTab(0);
                }}
                className={`w-full text-left px-4 py-3 rounded-xl transition
                  ${
                    activeTab === i
                      ? "bg-[#B21A15] dark:bg-[#FF6A63] text-white"
                      : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-[#222]"
                  }`}
              >
                {tab}
              </button>
            ))}
          </nav>

          <button
            onClick={onLogoutClick}
            className="mt-6 cursor-pointer flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-gray-900 dark:bg-white text-white dark:text-black"
          >
            <LogOut size={16} /> Logout
          </button>
        </aside>

        {/* CONTENT */}
        <main className="bg-white dark:bg-[#1A1A1A] rounded-2xl p-6 shadow">

          {/* PROFILE */}
          {activeTab === 0 && (
            <div className="space-y-6">

              {/* PROFILE SUB TABS */}
              <div className="flex gap-3">
                {profileTabs.map((tab, i) => (
                  <button
                    key={i}
                    onClick={() => setProfileTab(i)}
                    className={`px-4 py-2 rounded-xl text-sm font-medium
                      ${
                        profileTab === i
                          ? "bg-[#B21A15] dark:bg-[#FF6A63] text-white"
                          : "bg-gray-100 dark:bg-[#222] text-gray-600 dark:text-gray-400"
                      }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              {/* OVERVIEW (ACCOUNT SUMMARY) */}
              {profileTab === 0 && (
                <div className="space-y-6">

                  {/* STATS */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="p-4 rounded-xl bg-gray-50 dark:bg-[#121212]">
                      <p className="text-sm text-gray-500">Total Orders</p>
                      <p className="text-2xl font-bold">{myOrders.length}</p>
                    </div>

                    <div className="p-4 rounded-xl bg-gray-50 dark:bg-[#121212]">
                      <p className="text-sm text-gray-500">Last Order</p>
                      <p className="font-medium">
                        {myOrders.length
                          ? new Date(myOrders[0].createdAt).toLocaleDateString()
                          : "—"}
                      </p>
                    </div>

                    <div className="p-4 rounded-xl bg-gray-50 dark:bg-[#121212]">
                      <p className="text-sm text-gray-500">Account Status</p>
                      <p className="font-medium text-green-600">Active</p>
                    </div>
                  </div>

                  {/* ACCOUNT INFO */}
                  <div className="p-5 rounded-2xl bg-gray-50 dark:bg-[#121212] space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Member since</span>
                      <span className="font-medium">
                        {profile?.createdAt
                          ? new Date(profile.createdAt).toLocaleDateString()
                          : "—"}
                      </span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-gray-500">Email</span>
                      <span className="font-medium">{profile?.email}</span>
                    </div>
                  </div>

                  {/* QUICK ACTIONS */}
                  <div className="flex gap-3">
                    <button
                      onClick={() => setProfileTab(1)}
                      className="px-6 py-2 rounded-xl bg-[#B21A15] dark:bg-[#FF6A63] text-white"
                    >
                      Edit Profile
                    </button>
                    <button
                      onClick={() => setActiveTab(1)}
                      className="px-6 py-2 rounded-xl border"
                    >
                      View Orders
                    </button>
                  </div>
                </div>
              )}

              {/* EDIT PROFILE */}
              {profileTab === 1 && (
                <div className="space-y-4 max-w-xl">
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Full Name"
                    className="w-full border-b bg-transparent py-2"
                  />
                  <input
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Phone Number"
                    className="w-full border-b bg-transparent py-2"
                  />
                  <input
                    type="file"
                    onChange={(e) => setAvatar(e.target.files[0])}
                  />

                  <div className="flex gap-3 pt-4">
                    <button
                      onClick={handleUpdate}
                      className="px-6 py-2 rounded-xl bg-[#B21A15] dark:bg-[#FF6A63] text-white"
                    >
                      Save Changes
                    </button>
                    <button
                      onClick={() => setProfileTab(0)}
                      className="px-6 py-2 rounded-xl border"
                    >
                      Cancel
                    </button>
                  </div>

                  {message && <p className="text-green-500">{message}</p>}
                  {error && <p className="text-red-500">{error}</p>}
                </div>
              )}
            </div>
          )}

          {/* ORDERS */}
          {activeTab === 1 && (
            <div className="space-y-4">
              {orderLoading && <p>Loading orders…</p>}
              {!orderLoading && myOrders.length === 0 && (
                <p className="text-gray-500">No orders yet</p>
              )}
              {myOrders.map((order) => (
                <div
                  key={order._id}
                  className="border rounded-xl p-4 flex justify-between items-center"
                >
                  <div>
                    <p className="font-semibold">₹{order.finalAmount}</p>
                    <p className="text-sm text-gray-500">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-sm ${statusColors[order.status]}`}
                  >
                    {order.status}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* SECURITY */}
          {activeTab === 2 && (
            <div className="space-y-4 max-w-xl">
              <input
                type="password"
                placeholder="Current Password"
                value={oldPass}
                onChange={(e) => setOldPass(e.target.value)}
                className="w-full border-b bg-transparent py-2"
              />
              <input
                type="password"
                placeholder="New Password"
                value={newPass}
                onChange={(e) => setNewPass(e.target.value)}
                className="w-full border-b bg-transparent py-2"
              />
              <button
                onClick={() =>
                  dispatch(
                    changePassword({
                      oldPassword: oldPass,
                      newPassword: newPass,
                    })
                  )
                }
                className="px-6 py-2 rounded-xl bg-[#B21A15] dark:bg-[#FF6A63] text-white"
              >
                Update Password
              </button>
            </div>
          )}

          {/* APPEARANCE */}
          {activeTab === 3 && (
            <div className="flex justify-between items-center max-w-xl border p-4 rounded-xl">
              <div>
                <p className="font-medium">Dark Mode</p>
                <p className="text-sm text-gray-500">Toggle theme</p>
              </div>
              <button
                onClick={toggleTheme}
                className={`w-12 h-6 rounded-full relative ${
                  darkMode ? "bg-[#B21A15]" : "bg-gray-300"
                }`}
              >
                <span
                  className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition ${
                    darkMode ? "translate-x-6" : ""
                  }`}
                />
              </button>
            </div>
          )}

          {/* NOTIFICATIONS */}
          {activeTab === 4 && (
            <div className="space-y-4 max-w-xl">
              {["Order updates", "Promotions", "Security alerts"].map((n) => (
                <div
                  key={n}
                  className="flex justify-between items-center border p-4 rounded-xl"
                >
                  <span>{n}</span>
                  <input
                    type="checkbox"
                    defaultChecked
                    className="accent-[#B21A15]"
                  />
                </div>
              ))}
            </div>
          )}

          {/* DANGER ZONE */}
          {activeTab === 5 && (
            <div className="max-w-xl border border-red-300 bg-red-50 dark:bg-red-950/30 p-4 rounded-xl">
              <p className="text-red-600 mb-4">
                Deleting your account is permanent.
              </p>
              <button
                onClick={() => {
                  if (window.confirm("This action is irreversible. Continue?")) {
                    dispatch(deleteMyAccount());
                    dispatch(logout());
                  }
                }}
                className="px-6 py-2 rounded-xl bg-red-600 text-white"
              >
                Delete Account
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Profile;
