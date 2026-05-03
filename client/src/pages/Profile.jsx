import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router";
import {
  changePassword,
  clearUserFeedback,
  deleteMyAccount,
  editSavedAddress,
  fetchProfile,
  fetchSavedAddresses,
  removeSavedAddress,
  saveAddress,
  updateProfile,
} from "../redux/slices/userSlice";
import {
  cancelOrder,
  getMyOrders,
  updateShippingAddress,
} from "../redux/slices/orderSlice";
import { logout } from "../redux/slices/authSlice";
import { getWishlist, toggleWishlist } from "../redux/slices/wishlistSlice";
import {
  Bell,
  Heart,
  LogOut,
  MapPin,
  MoonStar,
  Package,
  PencilLine,
  ShieldCheck,
  Trash2,
  UserRound,
} from "lucide-react";

const tabs = [
  { id: "overview", label: "Overview", icon: UserRound },
  { id: "edit", label: "Edit Profile", icon: PencilLine },
  { id: "orders", label: "Orders", icon: Package },
  { id: "wishlist", label: "Wishlist", icon: Heart },
  { id: "addresses", label: "Addresses", icon: MapPin },
  { id: "preferences", label: "Preferences", icon: MoonStar },
  { id: "security", label: "Security", icon: ShieldCheck },
  { id: "danger", label: "Danger Zone", icon: Trash2 },
];

const statusColors = {
  pending: "bg-gray-100 text-gray-700",
  processing: "bg-yellow-100 text-yellow-700",
  shipped: "bg-blue-100 text-blue-700",
  delivered: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
};

const emptyAddressForm = {
  label: "Home",
  fullName: "",
  phone: "",
  line1: "",
  line2: "",
  city: "",
  state: "",
  postalCode: "",
  country: "India",
  isDefault: false,
};

const formatCurrency = (value) =>
  `Rs. ${Number(value || 0).toLocaleString("en-IN", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`;

const prettyStatus = (status = "") =>
  status ? status.charAt(0).toUpperCase() + status.slice(1) : "Pending";

const isOrderEditable = (status = "") =>
  ["pending", "processing"].includes(status.toLowerCase());

const buildAddressForm = (address = {}) => ({
  label: address.label || "Home",
  fullName: address.fullName || address.name || "",
  phone: address.phone || "",
  line1: address.line1 || address.address || "",
  line2: address.line2 || "",
  city: address.city || "",
  state: address.state || "",
  postalCode: address.postalCode || "",
  country: address.country || "India",
  isDefault: Boolean(address.isDefault),
});

const formatAddress = (address = {}) =>
  [
    address.line1,
    address.line2,
    address.city,
    address.state,
    address.postalCode,
    address.country,
  ]
    .filter(Boolean)
    .join(", ");

const looksLikeEmail = (value = "") => /\S+@\S+\.\S+/.test(String(value).trim());

const buildDisplayName = (profile = {}, authUser = {}) => {
  const profileName = String(profile?.name || "").trim();
  const authName = String(authUser?.name || "").trim();
  const email = String(profile?.email || authUser?.email || "").trim();

  if (profileName && !looksLikeEmail(profileName)) return profileName;
  if (authName && !looksLikeEmail(authName)) return authName;

  if (email) {
    const localPart = email.split("@")[0] || "";
    return localPart
      .replace(/[._-]+/g, " ")
      .replace(/\b\w/g, (char) => char.toUpperCase());
  }

  return "Your account";
};

const getOrderDiscount = (order = {}) => {
  const explicitDiscount = Number(order?.couponApplied?.discountAmount || 0);
  if (explicitDiscount > 0) return explicitDiscount;

  const subTotal = Number(order?.subTotal || 0);
  const finalAmount = Number(order?.finalAmount ?? subTotal);
  return Math.max(subTotal - finalAmount, 0);
};

const getOrderQty = (order = {}) =>
  (order.items || []).reduce((sum, item) => sum + Number(item.qty || 1), 0);

const Profile = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { token, user: authUser } = useSelector((s) => s.auth || {});
  const { profile, savedAddresses = [], loading, message, error } = useSelector(
    (s) => s.user || {}
  );
  const { myOrders = [] } = useSelector((s) => s.order || {});
  const { items: wishlistItems = [], loading: wishlistLoading } = useSelector(
    (s) => s.wishlist || {}
  );

  const [activeTab, setActiveTab] = useState("overview");
  const [form, setForm] = useState({
    name: "",
    email: "",
    mobile: "",
  });
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState("");
  const [oldPass, setOldPass] = useState("");
  const [newPass, setNewPass] = useState("");
  const [darkMode, setDarkMode] = useState(
    document.documentElement.classList.contains("dark")
  );
  const [notifications, setNotifications] = useState(() => {
    try {
      const raw = localStorage.getItem("profileNotifications");
      return raw
        ? JSON.parse(raw)
        : {
            orderUpdates: true,
            promotions: true,
            securityAlerts: true,
          };
    } catch {
      return {
        orderUpdates: true,
        promotions: true,
        securityAlerts: true,
      };
    }
  });
  const [addressForm, setAddressForm] = useState(emptyAddressForm);
  const [editingAddressId, setEditingAddressId] = useState(null);
  const [expandedOrderId, setExpandedOrderId] = useState(null);
  const [editingOrderAddressId, setEditingOrderAddressId] = useState(null);
  const [orderAddressForm, setOrderAddressForm] = useState(buildAddressForm());

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }

    dispatch(fetchProfile());
    dispatch(fetchSavedAddresses());
    dispatch(getMyOrders());
    dispatch(getWishlist());
  }, [dispatch, token, navigate]);

  useEffect(() => {
    if (!profile) return;
    setForm({
      name: profile.name || "",
      email: profile.email || "",
      mobile: profile.mobile?.toString() || "",
    });
    setAvatarPreview(profile.profileImageUrl || "");
  }, [profile]);

  useEffect(() => {
    localStorage.setItem("theme", darkMode ? "dark" : "light");
    document.documentElement.classList.toggle("dark", darkMode);
  }, [darkMode]);

  useEffect(() => {
    localStorage.setItem("profileNotifications", JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    return () => {
      dispatch(clearUserFeedback());
    };
  }, [dispatch]);

  const totalSpent = useMemo(
    () =>
      myOrders.reduce(
        (sum, order) => sum + Number(order.finalAmount ?? order.subTotal ?? 0),
        0
      ),
    [myOrders]
  );

  const activeOrdersCount = useMemo(
    () => myOrders.filter((order) => order.status !== "cancelled").length,
    [myOrders]
  );

  const recentOrder = myOrders[0];

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const handleProfileSave = (e) => {
    e.preventDefault();
    const fd = new FormData();
    fd.append("name", form.name.trim());
    fd.append("email", form.email.trim());
    fd.append("mobile", form.mobile.trim());
    if (avatarFile) fd.append("avatar", avatarFile);
    dispatch(updateProfile(fd));
  };

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    if (!oldPass.trim() || !newPass.trim()) return;
    await dispatch(
      changePassword({
        oldPassword: oldPass,
        newPassword: newPass,
      })
    );
    setOldPass("");
    setNewPass("");
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  const handleDeleteAccount = async () => {
    if (!window.confirm("This action is permanent. Delete your account?")) return;
    await dispatch(deleteMyAccount());
    dispatch(logout());
    navigate("/");
  };

  const toggleTheme = () => setDarkMode((prev) => !prev);

  const togglePreference = (key) => {
    setNotifications((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const resetAddressEditor = () => {
    setEditingAddressId(null);
    setAddressForm({
      ...emptyAddressForm,
      fullName: profile?.name || "",
      phone: profile?.mobile?.toString() || "",
    });
  };

  const handleAddressSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      ...addressForm,
      fullName: addressForm.fullName.trim(),
      phone: addressForm.phone.trim(),
      line1: addressForm.line1.trim(),
      line2: addressForm.line2.trim(),
      city: addressForm.city.trim(),
      state: addressForm.state.trim(),
      postalCode: addressForm.postalCode.trim(),
      country: addressForm.country.trim() || "India",
      label: addressForm.label.trim() || "Home",
    };

    const result = editingAddressId
      ? await dispatch(editSavedAddress(editingAddressId, payload))
      : await dispatch(saveAddress(payload));

    if (result?.ok) resetAddressEditor();
  };

  const startAddressEdit = (address) => {
    setActiveTab("addresses");
    setEditingAddressId(address._id);
    setAddressForm(buildAddressForm(address));
  };

  const startOrderAddressEdit = (order) => {
    setEditingOrderAddressId(order._id);
    setOrderAddressForm(buildAddressForm(order.shippingAddress || {}));
  };

  const handleUseSavedAddressForOrder = (address) => {
    setOrderAddressForm(buildAddressForm(address));
  };

  const handleOrderAddressSubmit = async (orderId) => {
    const result = await dispatch(
      updateShippingAddress(orderId, {
        shippingAddress: {
          name: orderAddressForm.fullName.trim(),
          phone: orderAddressForm.phone.trim(),
          line1: orderAddressForm.line1.trim(),
          line2: orderAddressForm.line2.trim(),
          city: orderAddressForm.city.trim(),
          state: orderAddressForm.state.trim(),
          postalCode: orderAddressForm.postalCode.trim(),
          country: orderAddressForm.country.trim() || "India",
        },
      })
    );

    if (result?.ok) {
      setEditingOrderAddressId(null);
      setOrderAddressForm(buildAddressForm());
    }
  };

  const handleOrderCancel = async (orderId) => {
    if (!window.confirm("Cancel this order?")) return;
    await dispatch(cancelOrder(orderId));
  };

  const sidebarAvatar = avatarPreview || profile?.profileImageUrl || "";
  const displayName = buildDisplayName(profile, authUser);
  const displayInitial = displayName?.[0]?.toUpperCase() || "U";

  return (
    <div className="min-h-screen bg-[#f6f2f2] p-4 text-gray-900 dark:bg-[#0d0d0d] dark:text-gray-100 md:p-8">
      <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[300px_minmax(0,1fr)]">
        <aside className="rounded-[28px] bg-white p-6 shadow-[0_24px_70px_rgba(15,23,42,0.06)] dark:bg-[#171717]">
          <div className="text-center">
            {sidebarAvatar ? (
              <img
                src={sidebarAvatar}
                alt="Profile"
                className="mx-auto h-24 w-24 rounded-full object-cover shadow-md"
              />
            ) : (
              <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-[#B21A15] text-3xl font-semibold text-white">
                {displayInitial}
              </div>
            )}
            <h2 className="mt-4 text-xl font-semibold">
              {displayName}
            </h2>
            <p className="mt-1 break-all text-sm text-gray-500">
              {profile?.email || "No email"}
            </p>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3">
            <div className="rounded-2xl bg-red-50 p-3 text-left dark:bg-[#211313]">
              <p className="text-xs uppercase tracking-wide text-gray-400">
                Active orders
              </p>
              <p className="mt-1 text-lg font-semibold">{activeOrdersCount}</p>
            </div>
            <div className="rounded-2xl bg-red-50 p-3 text-left dark:bg-[#211313]">
              <p className="text-xs uppercase tracking-wide text-gray-400">
                Addresses
              </p>
              <p className="mt-1 text-lg font-semibold">{savedAddresses.length}</p>
            </div>
          </div>

          <nav className="mt-8 space-y-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    dispatch(clearUserFeedback());
                    setActiveTab(tab.id);
                  }}
                  className={`flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm font-medium transition ${
                    activeTab === tab.id
                      ? "bg-[#B21A15] text-white shadow-sm"
                      : "text-gray-600 hover:bg-red-50 dark:text-gray-300 dark:hover:bg-[#222]"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>

          <button
            onClick={handleLogout}
            className="mt-8 flex w-full items-center justify-center gap-2 rounded-2xl bg-gray-900 px-4 py-3 text-sm font-medium text-white dark:bg-white dark:text-black"
          >
            <LogOut className="h-4 w-4" /> Logout
          </button>
        </aside>

        <main className="rounded-[28px] bg-white p-6 shadow-[0_24px_70px_rgba(15,23,42,0.06)] dark:bg-[#171717]">
          <div className="mb-6">
            <p className="text-xs uppercase tracking-[0.3em] text-[#B21A15]">
              Account Center
            </p>
            <h1 className="mt-2 text-3xl font-semibold">
              {tabs.find((tab) => tab.id === activeTab)?.label}
            </h1>
          </div>

          {(message || error) && (
            <div
              className={`mb-5 rounded-2xl px-4 py-3 text-sm ${
                error
                  ? "bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-300"
                  : "bg-green-50 text-green-700 dark:bg-green-950/30 dark:text-green-300"
              }`}
            >
              {error || message}
            </div>
          )}

          {activeTab === "overview" && (
            <div className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="rounded-[24px] bg-red-50 p-5 dark:bg-[#211313]">
                  <p className="text-sm text-gray-500">Total orders</p>
                  <p className="mt-2 text-3xl font-semibold">{myOrders.length}</p>
                </div>
                <div className="rounded-[24px] bg-red-50 p-5 dark:bg-[#211313]">
                  <p className="text-sm text-gray-500">Wishlist items</p>
                  <p className="mt-2 text-3xl font-semibold">{wishlistItems.length}</p>
                </div>
                <div className="rounded-[24px] bg-red-50 p-5 dark:bg-[#211313]">
                  <p className="text-sm text-gray-500">Total spent</p>
                  <p className="mt-2 text-3xl font-semibold">
                    {formatCurrency(totalSpent)}
                  </p>
                </div>
              </div>

              <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
                <div className="rounded-[24px] border border-red-100 p-5 dark:border-[#2a2a2a]">
                  <h2 className="text-lg font-semibold">Account summary</h2>
                  <div className="mt-4 space-y-3 text-sm">
                    <div className="flex justify-between gap-4">
                      <span className="text-gray-500">Member since</span>
                      <span className="font-medium">
                        {profile?.createdAt
                          ? new Date(profile.createdAt).toLocaleDateString()
                          : "-"}
                      </span>
                    </div>
                    <div className="flex justify-between gap-4">
                      <span className="text-gray-500">Email</span>
                      <span className="break-all font-medium">{profile?.email || "-"}</span>
                    </div>
                    <div className="flex justify-between gap-4">
                      <span className="text-gray-500">Mobile</span>
                      <span className="font-medium">{profile?.mobile || "-"}</span>
                    </div>
                    <div className="flex justify-between gap-4">
                      <span className="text-gray-500">Saved addresses</span>
                      <span className="font-medium">{savedAddresses.length}</span>
                    </div>
                  </div>
                </div>

                <div className="rounded-[24px] border border-red-100 p-5 dark:border-[#2a2a2a]">
                  <h2 className="text-lg font-semibold">Recent activity</h2>
                  {recentOrder ? (
                    <div className="mt-4 rounded-2xl bg-red-50 p-4 dark:bg-[#211313]">
                      <p className="text-xs uppercase tracking-wide text-gray-400">
                        Latest order
                      </p>
                      <p className="mt-2 font-mono text-sm">{recentOrder._id}</p>
                      <p className="mt-2 text-sm text-gray-500">
                        {new Date(recentOrder.createdAt).toLocaleDateString()}
                      </p>
                      <div className="mt-3 flex items-center justify-between gap-3">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-medium ${
                            statusColors[recentOrder.status] || statusColors.pending
                          }`}
                        >
                          {prettyStatus(recentOrder.status)}
                        </span>
                        <span className="font-semibold">
                          {formatCurrency(recentOrder.finalAmount)}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <p className="mt-4 text-sm text-gray-500">
                      No order activity yet.
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === "edit" && (
            <form onSubmit={handleProfileSave} className="max-w-3xl space-y-5">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                {avatarPreview ? (
                  <img
                    src={avatarPreview}
                    alt="Preview"
                    className="h-24 w-24 rounded-full object-cover shadow-md"
                  />
                ) : (
                  <div className="flex h-24 w-24 items-center justify-center rounded-full bg-[#B21A15] text-3xl font-semibold text-white">
                    {form.name?.[0]?.toUpperCase() || "U"}
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium">Profile photo</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    className="mt-2 text-sm"
                  />
                  <p className="mt-2 text-xs text-gray-500">
                    Recommended: square image under 2MB.
                  </p>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium">Full name</label>
                  <input
                    value={form.name}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, name: e.target.value }))
                    }
                    className="w-full rounded-2xl border border-gray-300 bg-transparent px-4 py-3 dark:border-[#333]"
                    placeholder="Your full name"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium">Mobile</label>
                  <input
                    value={form.mobile}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, mobile: e.target.value }))
                    }
                    className="w-full rounded-2xl border border-gray-300 bg-transparent px-4 py-3 dark:border-[#333]"
                    placeholder="Your mobile number"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">Email</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, email: e.target.value }))
                  }
                  className="w-full rounded-2xl border border-gray-300 bg-transparent px-4 py-3 dark:border-[#333]"
                  placeholder="Your email address"
                />
              </div>

              <div className="flex flex-wrap gap-3">
                <button
                  type="submit"
                  disabled={loading}
                  className="rounded-2xl bg-[#B21A15] px-6 py-3 text-sm font-medium text-white disabled:opacity-60"
                >
                  {loading ? "Saving..." : "Save changes"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    dispatch(clearUserFeedback());
                    setForm({
                      name: profile?.name || "",
                      email: profile?.email || "",
                      mobile: profile?.mobile?.toString() || "",
                    });
                    setAvatarFile(null);
                    setAvatarPreview(profile?.profileImageUrl || "");
                  }}
                  className="rounded-2xl border px-6 py-3 text-sm font-medium"
                >
                  Reset
                </button>
              </div>
            </form>
          )}

          {activeTab === "orders" && (
            <div className="space-y-4">
              {myOrders.length === 0 ? (
                <div className="rounded-[24px] border border-dashed border-red-200 p-10 text-center text-gray-500">
                  No orders yet.
                </div>
              ) : (
                myOrders.map((order) => {
                  const firstItem = order.items?.[0];
                  const expanded = expandedOrderId === order._id;
                  const editingOrderAddress = editingOrderAddressId === order._id;
                  const canEdit = isOrderEditable(order.status);
                  const orderDiscount = getOrderDiscount(order);
                  const orderQty = getOrderQty(order);

                  return (
                    <div
                      key={order._id}
                      className="rounded-[24px] border border-red-100 p-5 dark:border-[#2a2a2a]"
                    >
                      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                        <div className="flex min-w-0 gap-4">
                          {firstItem?.image ? (
                            <img
                              src={firstItem.image}
                              alt={firstItem.title}
                              className="h-20 w-20 rounded-2xl object-cover"
                            />
                          ) : (
                            <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-red-50 text-[#B21A15]">
                              <Package className="h-8 w-8" />
                            </div>
                          )}
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="rounded-full bg-red-600 px-3 py-1 text-xs font-semibold uppercase tracking-[0.25em] text-white">
                                {order._id.slice(-8)}
                              </span>
                              <span
                                className={`rounded-full px-3 py-1 text-xs font-medium ${
                                  statusColors[order.status] || statusColors.pending
                                }`}
                              >
                                {prettyStatus(order.status)}
                              </span>
                            </div>
                            <p className="mt-3 break-all font-mono text-sm text-gray-500">
                              {order._id}
                            </p>
                            <p className="mt-2 text-base font-semibold">
                              {firstItem?.title || "Order items"}
                            </p>
                            <p className="mt-1 text-sm text-gray-500">
                              Placed on {new Date(order.createdAt).toLocaleString()}
                            </p>
                          </div>
                        </div>

                        <div className="rounded-[24px] bg-red-50 p-4 dark:bg-[#211313] lg:min-w-[240px]">
                          <p className="text-xs uppercase tracking-wide text-gray-400">
                            {orderDiscount > 0 ? "Final total" : "Order total"}
                          </p>
                          <p className="mt-2 text-3xl font-semibold">
                            {formatCurrency(order.finalAmount)}
                          </p>
                          {orderDiscount > 0 && (
                            <p className="mt-2 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                              Saved {formatCurrency(orderDiscount)}
                              {order.couponApplied?.code
                                ? ` with ${order.couponApplied.code}`
                                : ""}
                            </p>
                          )}
                          <p className="mt-1 text-xs text-gray-500">
                            Subtotal {formatCurrency(order.subTotal)}
                          </p>
                          <div className="mt-4 flex flex-wrap gap-2">
                            <button
                              type="button"
                              onClick={() =>
                                setExpandedOrderId(expanded ? null : order._id)
                              }
                              className="rounded-2xl border border-red-200 px-4 py-2 text-sm font-medium text-[#B21A15]"
                            >
                              {expanded ? "Hide details" : "View details"}
                            </button>
                            {canEdit && order.status !== "cancelled" && (
                              <button
                                type="button"
                                onClick={() => handleOrderCancel(order._id)}
                                className="rounded-2xl bg-red-600 px-4 py-2 text-sm font-medium text-white"
                              >
                                Cancel order
                              </button>
                            )}
                          </div>
                        </div>
                      </div>

                      {expanded && (
                        <div className="mt-6 grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
                          <div className="space-y-4">
                            <div className="rounded-[24px] bg-[#faf7f7] p-4 dark:bg-[#1f1f1f]">
                              <div className="flex items-center justify-between gap-3">
                                <h3 className="text-lg font-semibold">Items</h3>
                                <span className="text-sm text-gray-500">
                                  {orderQty} unit{orderQty === 1 ? "" : "s"}
                                </span>
                              </div>
                              <div className="mt-4 space-y-3">
                                {(order.items || []).map((item, index) => (
                                  <div
                                    key={`${order._id}-${item.productId}-${index}`}
                                    className="flex items-center gap-3 rounded-2xl bg-white p-3 dark:bg-[#171717]"
                                  >
                                    {item.image ? (
                                      <img
                                        src={item.image}
                                        alt={item.title}
                                        className="h-16 w-16 rounded-2xl object-cover"
                                      />
                                    ) : (
                                      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 text-[#B21A15]">
                                        <Package className="h-6 w-6" />
                                      </div>
                                    )}
                                    <div className="min-w-0 flex-1">
                                      <p className="font-semibold">{item.title}</p>
                                      <p className="text-sm text-gray-500">
                                        {item.color ? `${item.color} · ` : ""}
                                        Size {item.size || "-"} · Qty {item.qty || 1}
                                      </p>
                                    </div>
                                    <p className="font-semibold">
                                      {formatCurrency(
                                        Number(item.price || 0) * Number(item.qty || 1)
                                      )}
                                    </p>
                                  </div>
                                ))}
                              </div>
                            </div>

                            <div className="rounded-[24px] bg-[#faf7f7] p-4 dark:bg-[#1f1f1f]">
                              <div className="flex items-center justify-between gap-3">
                                <h3 className="text-lg font-semibold">
                                  Delivery address
                                </h3>
                                {canEdit && (
                                  <button
                                    type="button"
                                    onClick={() =>
                                      editingOrderAddress
                                        ? setEditingOrderAddressId(null)
                                        : startOrderAddressEdit(order)
                                    }
                                    className="text-sm font-medium text-[#B21A15]"
                                  >
                                    {editingOrderAddress ? "Close edit" : "Edit address"}
                                  </button>
                                )}
                              </div>

                              <div className="mt-4 rounded-2xl bg-white p-4 text-sm dark:bg-[#171717]">
                                <p className="font-semibold">
                                  {order.shippingAddress?.name || "-"}
                                </p>
                                <p className="mt-1 text-gray-500">
                                  {formatAddress(order.shippingAddress)}
                                </p>
                                <p className="mt-2 text-gray-500">
                                  {order.shippingAddress?.phone || "-"}
                                </p>
                              </div>

                              {editingOrderAddress && (
                                <div className="mt-4 space-y-4 rounded-2xl border border-red-100 p-4 dark:border-[#2a2a2a]">
                                  {savedAddresses.length > 0 && (
                                    <div className="grid gap-3 md:grid-cols-2">
                                      {savedAddresses.map((address) => (
                                        <button
                                          key={address._id}
                                          type="button"
                                          onClick={() =>
                                            handleUseSavedAddressForOrder(address)
                                          }
                                          className="rounded-2xl border border-red-100 p-3 text-left hover:bg-red-50 dark:border-[#2a2a2a] dark:hover:bg-[#222]"
                                        >
                                          <p className="font-medium">{address.label}</p>
                                          <p className="mt-1 text-sm text-gray-500">
                                            {address.fullName}
                                          </p>
                                          <p className="mt-1 text-xs text-gray-500">
                                            {formatAddress(address)}
                                          </p>
                                        </button>
                                      ))}
                                    </div>
                                  )}

                                  <div className="grid gap-4 md:grid-cols-2">
                                    <input
                                      value={orderAddressForm.fullName}
                                      onChange={(e) =>
                                        setOrderAddressForm((prev) => ({
                                          ...prev,
                                          fullName: e.target.value,
                                        }))
                                      }
                                      className="rounded-2xl border border-gray-300 bg-transparent px-4 py-3 dark:border-[#333]"
                                      placeholder="Full name"
                                    />
                                    <input
                                      value={orderAddressForm.phone}
                                      onChange={(e) =>
                                        setOrderAddressForm((prev) => ({
                                          ...prev,
                                          phone: e.target.value,
                                        }))
                                      }
                                      className="rounded-2xl border border-gray-300 bg-transparent px-4 py-3 dark:border-[#333]"
                                      placeholder="Phone"
                                    />
                                  </div>
                                  <input
                                    value={orderAddressForm.line1}
                                    onChange={(e) =>
                                      setOrderAddressForm((prev) => ({
                                        ...prev,
                                        line1: e.target.value,
                                      }))
                                    }
                                    className="w-full rounded-2xl border border-gray-300 bg-transparent px-4 py-3 dark:border-[#333]"
                                    placeholder="Address line 1"
                                  />
                                  <input
                                    value={orderAddressForm.line2}
                                    onChange={(e) =>
                                      setOrderAddressForm((prev) => ({
                                        ...prev,
                                        line2: e.target.value,
                                      }))
                                    }
                                    className="w-full rounded-2xl border border-gray-300 bg-transparent px-4 py-3 dark:border-[#333]"
                                    placeholder="Address line 2"
                                  />
                                  <div className="grid gap-4 md:grid-cols-2">
                                    <input
                                      value={orderAddressForm.city}
                                      onChange={(e) =>
                                        setOrderAddressForm((prev) => ({
                                          ...prev,
                                          city: e.target.value,
                                        }))
                                      }
                                      className="rounded-2xl border border-gray-300 bg-transparent px-4 py-3 dark:border-[#333]"
                                      placeholder="City"
                                    />
                                    <input
                                      value={orderAddressForm.state}
                                      onChange={(e) =>
                                        setOrderAddressForm((prev) => ({
                                          ...prev,
                                          state: e.target.value,
                                        }))
                                      }
                                      className="rounded-2xl border border-gray-300 bg-transparent px-4 py-3 dark:border-[#333]"
                                      placeholder="State"
                                    />
                                  </div>
                                  <div className="grid gap-4 md:grid-cols-2">
                                    <input
                                      value={orderAddressForm.postalCode}
                                      onChange={(e) =>
                                        setOrderAddressForm((prev) => ({
                                          ...prev,
                                          postalCode: e.target.value,
                                        }))
                                      }
                                      className="rounded-2xl border border-gray-300 bg-transparent px-4 py-3 dark:border-[#333]"
                                      placeholder="Postal code"
                                    />
                                    <input
                                      value={orderAddressForm.country}
                                      onChange={(e) =>
                                        setOrderAddressForm((prev) => ({
                                          ...prev,
                                          country: e.target.value,
                                        }))
                                      }
                                      className="rounded-2xl border border-gray-300 bg-transparent px-4 py-3 dark:border-[#333]"
                                      placeholder="Country"
                                    />
                                  </div>
                                  <div className="flex flex-wrap gap-3">
                                    <button
                                      type="button"
                                      onClick={() => handleOrderAddressSubmit(order._id)}
                                      className="rounded-2xl bg-[#B21A15] px-5 py-3 text-sm font-medium text-white"
                                    >
                                      Save order address
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => setEditingOrderAddressId(null)}
                                      className="rounded-2xl border px-5 py-3 text-sm font-medium"
                                    >
                                      Cancel
                                    </button>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="space-y-4">
                            <div className="rounded-[24px] bg-[#faf7f7] p-4 dark:bg-[#1f1f1f]">
                              <h3 className="text-lg font-semibold">Payment</h3>
                              <div className="mt-4 space-y-3 text-sm">
                                <div className="flex justify-between gap-4">
                                  <span className="text-gray-500">Method</span>
                                  <span className="font-medium uppercase">
                                    {order.paymentMethod || "-"}
                                  </span>
                                </div>
                                <div className="flex justify-between gap-4">
                                  <span className="text-gray-500">Paid</span>
                                  <span className="font-medium">
                                    {order.paymentInfo?.paid ? "Yes" : "No"}
                                  </span>
                                </div>
                                <div className="flex justify-between gap-4">
                                  <span className="text-gray-500">Subtotal</span>
                                  <span className="font-medium">
                                    {formatCurrency(order.subTotal)}
                                  </span>
                                </div>
                                {orderDiscount > 0 && (
                                  <div className="flex justify-between gap-4">
                                    <span className="text-gray-500">
                                      Discount
                                      {order.couponApplied?.code
                                        ? ` (${order.couponApplied.code})`
                                        : ""}
                                    </span>
                                    <span className="font-medium text-emerald-600 dark:text-emerald-400">
                                      -{formatCurrency(orderDiscount)}
                                    </span>
                                  </div>
                                )}
                                <div className="flex justify-between gap-4">
                                  <span className="text-gray-500">Final amount</span>
                                  <span className="font-medium">
                                    {formatCurrency(order.finalAmount)}
                                  </span>
                                </div>
                                <div className="flex justify-between gap-4">
                                  <span className="text-gray-500">Tracking</span>
                                  <span className="font-medium">
                                    {order.tracking?.trackingId || "Not assigned"}
                                  </span>
                                </div>
                              </div>
                            </div>

                            {order.tracking?.trackingUrl && (
                              <a
                                href={order.tracking.trackingUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="block rounded-[24px] border border-red-100 p-4 text-sm font-medium text-[#B21A15] dark:border-[#2a2a2a]"
                              >
                                Track shipment
                              </a>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          )}

          {activeTab === "wishlist" && (
            <div className="space-y-4">
              {wishlistLoading && wishlistItems.length === 0 ? (
                <p className="text-sm text-gray-500">Loading wishlist...</p>
              ) : wishlistItems.length === 0 ? (
                <div className="rounded-[24px] border border-dashed border-red-200 p-10 text-center text-gray-500">
                  Your wishlist is empty.
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2">
                  {wishlistItems.map((item) => (
                    <div
                      key={item._id}
                      className="rounded-[24px] border border-red-100 p-4 dark:border-[#2a2a2a]"
                    >
                      <div className="flex gap-4">
                        {item.images?.[0] ? (
                          <img
                            src={item.images[0]}
                            alt={item.title}
                            className="h-24 w-24 rounded-2xl object-cover"
                          />
                        ) : (
                          <div className="flex h-24 w-24 items-center justify-center rounded-2xl bg-red-50 text-[#B21A15]">
                            <Heart className="h-7 w-7" />
                          </div>
                        )}
                        <div className="min-w-0 flex-1">
                          <p className="font-semibold">{item.title}</p>
                          <p className="mt-1 text-sm text-gray-500">
                            {item.category || "Uncategorized"}
                          </p>
                          <div className="mt-4 flex flex-wrap gap-2">
                            <button
                              type="button"
                              onClick={() => navigate(`/product/${item._id}`)}
                              className="rounded-2xl bg-[#B21A15] px-4 py-2 text-sm font-medium text-white"
                            >
                              View product
                            </button>
                            <button
                              type="button"
                              onClick={() => dispatch(toggleWishlist(item._id))}
                              className="rounded-2xl border px-4 py-2 text-sm font-medium text-red-600"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === "addresses" && (
            <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
              <div className="space-y-4">
                {savedAddresses.length === 0 ? (
                  <div className="rounded-[24px] border border-dashed border-red-200 p-10 text-center text-gray-500">
                    No saved addresses yet.
                  </div>
                ) : (
                  savedAddresses.map((address) => (
                    <div
                      key={address._id}
                      className="rounded-[24px] border border-red-100 p-5 dark:border-[#2a2a2a]"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="text-lg font-semibold">
                              {address.label || "Address"}
                            </h3>
                            {address.isDefault && (
                              <span className="rounded-full bg-[#B21A15] px-3 py-1 text-[10px] font-semibold uppercase tracking-wide text-white">
                                Default
                              </span>
                            )}
                          </div>
                          <p className="mt-3 font-medium">{address.fullName}</p>
                          <p className="mt-1 text-sm text-gray-500">{address.phone}</p>
                          <p className="mt-2 text-sm text-gray-500">
                            {formatAddress(address)}
                          </p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={() => startAddressEdit(address)}
                            className="rounded-2xl border px-4 py-2 text-sm font-medium text-[#B21A15]"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => dispatch(removeSavedAddress(address._id))}
                            className="rounded-2xl bg-red-600 px-4 py-2 text-sm font-medium text-white"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <form
                onSubmit={handleAddressSubmit}
                className="rounded-[24px] border border-red-100 p-5 dark:border-[#2a2a2a]"
              >
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-semibold">
                      {editingAddressId ? "Edit saved address" : "Save new address"}
                    </h2>
                    <p className="mt-1 text-sm text-gray-500">
                      Keep delivery details ready for faster checkout.
                    </p>
                  </div>
                  {editingAddressId && (
                    <button
                      type="button"
                      onClick={resetAddressEditor}
                      className="text-sm font-medium text-[#B21A15]"
                    >
                      New address
                    </button>
                  )}
                </div>

                <div className="mt-5 space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <input
                      value={addressForm.label}
                      onChange={(e) =>
                        setAddressForm((prev) => ({ ...prev, label: e.target.value }))
                      }
                      className="rounded-2xl border border-gray-300 bg-transparent px-4 py-3 dark:border-[#333]"
                      placeholder="Label"
                    />
                    <input
                      value={addressForm.fullName}
                      onChange={(e) =>
                        setAddressForm((prev) => ({
                          ...prev,
                          fullName: e.target.value,
                        }))
                      }
                      className="rounded-2xl border border-gray-300 bg-transparent px-4 py-3 dark:border-[#333]"
                      placeholder="Full name"
                    />
                  </div>
                  <input
                    value={addressForm.phone}
                    onChange={(e) =>
                      setAddressForm((prev) => ({ ...prev, phone: e.target.value }))
                    }
                    className="w-full rounded-2xl border border-gray-300 bg-transparent px-4 py-3 dark:border-[#333]"
                    placeholder="Phone"
                  />
                  <input
                    value={addressForm.line1}
                    onChange={(e) =>
                      setAddressForm((prev) => ({ ...prev, line1: e.target.value }))
                    }
                    className="w-full rounded-2xl border border-gray-300 bg-transparent px-4 py-3 dark:border-[#333]"
                    placeholder="Address line 1"
                  />
                  <input
                    value={addressForm.line2}
                    onChange={(e) =>
                      setAddressForm((prev) => ({ ...prev, line2: e.target.value }))
                    }
                    className="w-full rounded-2xl border border-gray-300 bg-transparent px-4 py-3 dark:border-[#333]"
                    placeholder="Address line 2"
                  />
                  <div className="grid gap-4 md:grid-cols-2">
                    <input
                      value={addressForm.city}
                      onChange={(e) =>
                        setAddressForm((prev) => ({ ...prev, city: e.target.value }))
                      }
                      className="rounded-2xl border border-gray-300 bg-transparent px-4 py-3 dark:border-[#333]"
                      placeholder="City"
                    />
                    <input
                      value={addressForm.state}
                      onChange={(e) =>
                        setAddressForm((prev) => ({ ...prev, state: e.target.value }))
                      }
                      className="rounded-2xl border border-gray-300 bg-transparent px-4 py-3 dark:border-[#333]"
                      placeholder="State"
                    />
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <input
                      value={addressForm.postalCode}
                      onChange={(e) =>
                        setAddressForm((prev) => ({
                          ...prev,
                          postalCode: e.target.value,
                        }))
                      }
                      className="rounded-2xl border border-gray-300 bg-transparent px-4 py-3 dark:border-[#333]"
                      placeholder="Postal code"
                    />
                    <input
                      value={addressForm.country}
                      onChange={(e) =>
                        setAddressForm((prev) => ({
                          ...prev,
                          country: e.target.value,
                        }))
                      }
                      className="rounded-2xl border border-gray-300 bg-transparent px-4 py-3 dark:border-[#333]"
                      placeholder="Country"
                    />
                  </div>
                  <label className="flex items-center gap-3 text-sm">
                    <input
                      type="checkbox"
                      checked={addressForm.isDefault}
                      onChange={(e) =>
                        setAddressForm((prev) => ({
                          ...prev,
                          isDefault: e.target.checked,
                        }))
                      }
                      className="h-4 w-4 accent-[#B21A15]"
                    />
                    Make this my default address
                  </label>
                  <div className="flex flex-wrap gap-3">
                    <button
                      type="submit"
                      disabled={loading}
                      className="rounded-2xl bg-[#B21A15] px-6 py-3 text-sm font-medium text-white disabled:opacity-60"
                    >
                      {loading
                        ? "Saving..."
                        : editingAddressId
                        ? "Update address"
                        : "Save address"}
                    </button>
                    <button
                      type="button"
                      onClick={resetAddressEditor}
                      className="rounded-2xl border px-6 py-3 text-sm font-medium"
                    >
                      Reset
                    </button>
                  </div>
                </div>
              </form>
            </div>
          )}

          {activeTab === "preferences" && (
            <div className="max-w-3xl space-y-4">
              <div className="flex items-center justify-between rounded-[24px] border border-red-100 p-5 dark:border-[#2a2a2a]">
                <div>
                  <p className="font-medium">Dark mode</p>
                  <p className="text-sm text-gray-500">
                    Toggle the account area color theme.
                  </p>
                </div>
                <button
                  onClick={toggleTheme}
                  className={`relative h-7 w-14 rounded-full transition ${
                    darkMode ? "bg-[#B21A15]" : "bg-gray-300"
                  }`}
                >
                  <span
                    className={`absolute top-1 h-5 w-5 rounded-full bg-white transition ${
                      darkMode ? "left-8" : "left-1"
                    }`}
                  />
                </button>
              </div>

              <div className="rounded-[24px] border border-red-100 p-5 dark:border-[#2a2a2a]">
                <div className="mb-4 flex items-center gap-2">
                  <Bell className="h-4 w-4 text-[#B21A15]" />
                  <h2 className="font-semibold">Notifications</h2>
                </div>
                <div className="space-y-3">
                  {[
                    ["orderUpdates", "Order updates"],
                    ["promotions", "Promotions"],
                    ["securityAlerts", "Security alerts"],
                  ].map(([key, label]) => (
                    <div
                      key={key}
                      className="flex items-center justify-between rounded-2xl bg-red-50 px-4 py-3 dark:bg-[#211313]"
                    >
                      <span className="text-sm">{label}</span>
                      <input
                        type="checkbox"
                        checked={Boolean(notifications[key])}
                        onChange={() => togglePreference(key)}
                        className="h-4 w-4 accent-[#B21A15]"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === "security" && (
            <form onSubmit={handlePasswordUpdate} className="max-w-xl space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium">
                  Current password
                </label>
                <input
                  type="password"
                  value={oldPass}
                  onChange={(e) => setOldPass(e.target.value)}
                  className="w-full rounded-2xl border border-gray-300 bg-transparent px-4 py-3 dark:border-[#333]"
                  placeholder="Enter current password"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium">
                  New password
                </label>
                <input
                  type="password"
                  value={newPass}
                  onChange={(e) => setNewPass(e.target.value)}
                  className="w-full rounded-2xl border border-gray-300 bg-transparent px-4 py-3 dark:border-[#333]"
                  placeholder="Enter new password"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="rounded-2xl bg-[#B21A15] px-6 py-3 text-sm font-medium text-white disabled:opacity-60"
              >
                {loading ? "Updating..." : "Update password"}
              </button>
            </form>
          )}

          {activeTab === "danger" && (
            <div className="max-w-2xl rounded-[24px] border border-red-300 bg-red-50 p-6 dark:bg-red-950/20">
              <h2 className="text-lg font-semibold text-red-700 dark:text-red-300">
                Delete account
              </h2>
              <p className="mt-3 text-sm text-red-600 dark:text-red-300">
                This permanently removes your profile, orders, and saved account
                access from this browser.
              </p>
              <button
                onClick={handleDeleteAccount}
                className="mt-5 rounded-2xl bg-red-600 px-6 py-3 text-sm font-medium text-white"
              >
                Delete my account
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Profile;
