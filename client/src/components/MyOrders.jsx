// src/pages/MyOrders.jsx
import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router";
import { getMyOrders } from "../redux/slices/orderSlice";
import { Loader2, Package, ShoppingBag } from "lucide-react";

const statusColors = {
  pending:
    "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-700",
  processing:
    "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-700",
  shipped:
    "bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-300 dark:border-indigo-700",
  delivered:
    "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-700",
  cancelled:
    "bg-red-50 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-700",
};

const prettyStatus = (status = "") =>
  status.charAt(0).toUpperCase() + status.slice(1);

const MyOrders = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { myOrders = [], loading, error } = useSelector(
    (s) => s.orderData || s.order || {}
  );

  useEffect(() => {
    dispatch(getMyOrders());
  }, [dispatch]);

  // Go to product or order details (you can change this later if you add /orders/:id)
  const handleViewDetails = (orderId) => {
    navigate(`/product/${orderId}`);
  };

  return (
    <div className="min-h-screen bg-linear-to-b from-white to-gray-50 dark:from-black dark:to-slate-950">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-gray-900 dark:text-gray-100">
        {/* HEADER */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-black text-white dark:bg-white dark:text-black shadow-sm">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-semibold leading-tight">
                My Orders
              </h1>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Track your recent purchases and view order details.
              </p>
            </div>
          </div>
        </div>

        {/* LOADING */}
        {loading && (
          <div className="flex items-center justify-center py-16">
            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Loading your orders...</span>
            </div>
          </div>
        )}

        {/* ERROR */}
        {!loading && error && (
          <div className="py-10">
            <div className="rounded-2xl border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/40 px-4 py-3 text-sm text-red-700 dark:text-red-300">
              {error || "Failed to load orders. Please try again."}
            </div>
          </div>
        )}

        {/* EMPTY STATE */}
        {!loading && !error && myOrders.length === 0 && (
          <div className="py-16 flex flex-col items-center text-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gray-100 dark:bg-slate-800">
              <Package className="w-7 h-7 text-gray-400 dark:text-gray-300" />
            </div>
            <div>
              <h2 className="text-lg font-semibold mb-1">
                You have no orders yet
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm">
                Browse products and place your first order. Your purchases will
                appear here for easy tracking.
              </p>
            </div>
            <button
              type="button"
              onClick={() => navigate("/")}
              className="mt-2 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-full bg-black text-white dark:bg-white dark:text-black text-sm font-semibold hover:bg-gray-900 dark:hover:bg-gray-200 transition shadow-sm hover:shadow-md"
            >
              Start Shopping
            </button>
          </div>
        )}

        {/* ORDERS LIST */}
        {!loading && !error && myOrders.length > 0 && (
          <div className="space-y-4">
            {myOrders.map((order) => {
              const status = (order.status || "pending").toLowerCase();
              const badgeClass =
                statusColors[status] || statusColors["pending"];

              const created = order.createdAt
                ? new Date(order.createdAt)
                : null;

              const firstItem = order.items?.[0];

              // your product data
              const itemName =
                firstItem?.title ||
                firstItem?.productName ||
                firstItem?.product?.name ||
                "Items";
              const itemImage = firstItem?.image;
              const itemCount = order.items?.length || 0;

              const totalAmount =
                order.finalAmount ??
                order.subTotal ??
                order.totalAmount ??
                order.amount ??
                order.total ??
                order.paymentInfo?.amount ??
                0;

              const paymentLabel =
                order.paymentMethod === "stripe" ||
                order.paymentMethod === "card"
                  ? "Online"
                  : order.paymentMethod === "cod"
                  ? "Cash on Delivery"
                  : order.paymentMethod || "Not specified";

              const discountAmount =
                order.couponApplied?.discountAmount ?? 0;

              return (
                <div
                  key={order._id}
                  className="rounded-2xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-sm px-4 py-4 sm:px-5 sm:py-5"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    {/* Left main info + image */}
                    <div className="flex-1 flex gap-3">
                      {itemImage && (
                        <img
                          src={itemImage}
                          alt={itemName}
                          className="h-16 w-16 sm:h-20 sm:w-20 rounded-lg object-cover border border-gray-200 dark:border-slate-700 shrink-0"
                        />
                      )}

                      <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            Order ID:
                          </p>
                          <p className="text-xs sm:text-sm font-mono truncate max-w-[220px] sm:max-w-xs">
                            {order._id}
                          </p>
                        </div>

                        <p className="text-sm sm:text-base font-semibold">
                          {itemName}
                          {itemCount > 1 && (
                            <span className="text-xs font-normal text-gray-500 dark:text-gray-400 ml-1">
                              + {itemCount - 1} more item
                              {itemCount - 1 > 1 ? "s" : ""}
                            </span>
                          )}
                        </p>

                        {/* Meta info */}
                        <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-gray-500 dark:text-gray-400">
                          {created && (
                            <span>
                              Placed on{" "}
                              {created.toLocaleDateString(undefined, {
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                              })}
                            </span>
                          )}
                          <span className="hidden sm:inline">•</span>
                          <span>Payment: {paymentLabel}</span>
                          {discountAmount > 0 && (
                            <>
                              <span className="hidden sm:inline">•</span>
                              <span>Discount: ₹{discountAmount}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Right summary & actions */}
                    <div className="flex flex-col items-end gap-2 min-w-[120px]">
                      {/* Status + amount */}
                      <div className="flex flex-col items-end gap-1">
                        <span
                          className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-medium ${badgeClass}`}
                        >
                          {prettyStatus(status)}
                        </span>
                        <p className="text-sm font-semibold">
                          ₹{Number(totalAmount).toFixed(2)}
                        </p>
                      </div>

                      {/* Actions */}
                      <button
                        type="button"
                        onClick={() => handleViewDetails(order._id)}
                        className="mt-1 inline-flex items-center justify-center rounded-full border border-gray-300 dark:border-slate-600 px-3 py-1.5 text-[11px] font-medium hover:bg-gray-50 dark:hover:bg-slate-800 transition"
                      >
                        View details
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyOrders;
