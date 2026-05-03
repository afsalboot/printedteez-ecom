import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  adminOrderList,
  updateStatus,
  adminDeleteOrder,
  fetchAdminOrderDetails,
  updateTrackingDetails,
  clearSelectedAdminOrder,
} from "../../redux/slices/orderSlice";
import {
  CalendarDays,
  ChevronRight,
  ExternalLink,
  PackageSearch,
  Printer,
  Search,
  ShoppingBag,
  Truck,
  UserRound,
} from "lucide-react";

const STATUS_STYLES = {
  pending: "bg-gray-100 text-gray-700",
  processing: "bg-yellow-100 text-yellow-800",
  shipped: "bg-blue-100 text-blue-800",
  delivered: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
  default: "bg-gray-100 text-gray-700",
};

const formatStatus = (status = "") =>
  status ? status.charAt(0).toUpperCase() + status.slice(1) : "Unknown";

const formatAmount = (value) =>
  `₹${Number(value || 0).toLocaleString("en-IN", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`;

const formatDate = (value) =>
  value
    ? new Date(value).toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "-";

const getOrderShortId = (id = "") =>
  id ? `${id.slice(0, 6)}-${id.slice(-4)}`.toUpperCase() : "ORDER";

const getCustomerInitial = (order) =>
  (order?.user?.name || order?.user?.email || "U").charAt(0).toUpperCase();

const getPrimaryItemImage = (order) =>
  order?.items?.find((item) => item.image)?.image || "";

const openPrintWindow = (title, html) => {
  const win = window.open("", "_blank", "width=900,height=700");
  if (!win) return;

  win.document.write(`
    <html>
      <head>
        <title>${title}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 24px; color: #222; }
          h1,h2,h3 { margin: 0 0 12px; }
          table { width: 100%; border-collapse: collapse; margin-top: 16px; }
          td, th { border: 1px solid #ddd; padding: 8px; text-align: left; }
        </style>
      </head>
      <body>${html}</body>
    </html>
  `);
  win.document.close();
  win.focus();
  win.print();
};

const buildAddressPrintHtml = (order) => {
  const address = order?.shippingAddress || {};
  return `
    <h1>Shipping Address</h1>
    <p><strong>Order ID:</strong> ${order?._id || "-"}</p>
    <p><strong>Customer:</strong> ${order?.user?.name || "-"}</p>
    <p><strong>Phone:</strong> ${address.phone || "-"}</p>
    <p>
      ${address.name || ""}<br/>
      ${address.line1 || ""}<br/>
      ${address.line2 || ""}<br/>
      ${address.city || ""}, ${address.state || ""}<br/>
      ${address.postalCode || ""}, ${address.country || ""}
    </p>
  `;
};

const OrderManage = () => {
  const dispatch = useDispatch();
  const {
    adminOrders = [],
    selectedAdminOrder,
    selectedUserOrders = [],
    loading,
    error,
  } = useSelector((s) => s.order || {});

  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const perPage = 10;
  const [sortField, setSortField] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");
  const [trackingForm, setTrackingForm] = useState({
    carrier: "",
    trackingId: "",
    trackingUrl: "",
  });
  const [savingStatusId, setSavingStatusId] = useState("");
  const [statusDrafts, setStatusDrafts] = useState({});

  useEffect(() => {
    dispatch(adminOrderList());
    return () => {
      dispatch(clearSelectedAdminOrder());
    };
  }, [dispatch]);

  useEffect(() => {
    setPage(1);
  }, [query, statusFilter, sortField, sortOrder]);

  useEffect(() => {
    setTrackingForm({
      carrier: selectedAdminOrder?.tracking?.carrier || "",
      trackingId: selectedAdminOrder?.tracking?.trackingId || "",
      trackingUrl: selectedAdminOrder?.tracking?.trackingUrl || "",
    });
  }, [selectedAdminOrder]);

  useEffect(() => {
    const nextDrafts = {};
    adminOrders.forEach((order) => {
      nextDrafts[order._id] = order.status || "pending";
    });
    setStatusDrafts(nextDrafts);
  }, [adminOrders]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let arr = Array.isArray(adminOrders) ? [...adminOrders] : [];

    if (q) {
      arr = arr.filter((o) => {
        const amount = String(o.finalAmount ?? o.subTotal ?? "");
        return (
          o._id?.toLowerCase().includes(q) ||
          o.user?.name?.toLowerCase().includes(q) ||
          o.user?.email?.toLowerCase().includes(q) ||
          o.tracking?.trackingId?.toLowerCase().includes(q) ||
          amount.includes(q)
        );
      });
    }

    if (statusFilter) {
      arr = arr.filter((o) => o.status === statusFilter);
    }

    arr.sort((a, b) => {
      let av;
      let bv;

      if (sortField === "customer") {
        av = (a.user?.name || "").toLowerCase();
        bv = (b.user?.name || "").toLowerCase();
      } else if (sortField === "amount") {
        av = Number(a.finalAmount ?? a.subTotal ?? 0);
        bv = Number(b.finalAmount ?? b.subTotal ?? 0);
      } else if (sortField === "createdAt") {
        av = new Date(a.createdAt || 0).getTime();
        bv = new Date(b.createdAt || 0).getTime();
      } else {
        av = (a[sortField] || "").toString().toLowerCase();
        bv = (b[sortField] || "").toString().toLowerCase();
      }

      if (typeof av === "number" && typeof bv === "number") {
        return sortOrder === "asc" ? av - bv : bv - av;
      }

      if (av < bv) return sortOrder === "asc" ? -1 : 1;
      if (av > bv) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });

    return arr;
  }, [adminOrders, query, statusFilter, sortField, sortOrder]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const paginated = filtered.slice((page - 1) * perPage, page * perPage);

  useEffect(() => {
    if (page > totalPages) setPage(1);
  }, [page, totalPages]);

  const openOrder = async (orderId) => {
    await dispatch(fetchAdminOrderDetails(orderId));
  };

  const handleStatusUpdate = async (orderId, newStatus) => {
    if (!newStatus) return;
    const previousStatus =
      adminOrders.find((order) => order._id === orderId)?.status || "pending";
    setStatusDrafts((prev) => ({ ...prev, [orderId]: newStatus }));
    setSavingStatusId(orderId);
    const result = await dispatch(updateStatus(orderId, newStatus));
    if (result?.ok) {
      await dispatch(adminOrderList(page));
      if (selectedAdminOrder?._id === orderId) {
        await dispatch(fetchAdminOrderDetails(orderId));
      }
    } else {
      setStatusDrafts((prev) => ({ ...prev, [orderId]: previousStatus }));
    }
    setSavingStatusId("");
  };

  const handleDelete = async (orderId) => {
    if (!window.confirm("Delete this order permanently?")) return;
    await dispatch(adminDeleteOrder(orderId));
  };

  const handleTrackingSave = async (e) => {
    e.preventDefault();
    if (!selectedAdminOrder?._id) return;
    const result = await dispatch(
      updateTrackingDetails(selectedAdminOrder._id, trackingForm)
    );
    if (result?.ok) {
      dispatch(fetchAdminOrderDetails(selectedAdminOrder._id));
    }
  };

  return (
    <div className="rounded-[32px] border border-red-100/70 bg-white/80 p-6 text-gray-900 shadow-[0_24px_80px_rgba(15,23,42,0.06)] backdrop-blur-sm">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6">
          <p className="text-xs uppercase tracking-wide text-red-500">
            Orders / Manage
          </p>
          <h1 className="mt-1 text-3xl font-semibold">Order Management</h1>
          <p className="mt-2 text-sm text-gray-600">
            Click any order to view address, items, payment details, invoice print,
            tracking details, and that customer&apos;s other orders.
          </p>
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.08fr_0.92fr]">
          <div className="space-y-4">
            <div className="rounded-[28px] border border-red-100 bg-white p-5 shadow-sm">
              <div className="grid gap-3 md:grid-cols-[1.5fr_0.9fr_auto_auto] md:items-end">
                <div>
                  <label className="mb-1 block text-xs font-medium text-gray-600">
                    Search
                  </label>
                  <div className="relative">
                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <input
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder="Search order, user, email, tracking..."
                      className="w-full rounded-2xl border border-red-100 bg-red-50/40 py-3 pl-10 pr-3 text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-1 block text-xs font-medium text-gray-600">
                    Status
                  </label>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full rounded-2xl border border-red-100 bg-red-50/40 px-3 py-3 text-sm"
                  >
                    <option value="">All statuses</option>
                    <option value="pending">Pending</option>
                    <option value="processing">Processing</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>

                <div>
                  <label className="mb-1 block text-xs font-medium text-gray-600">
                    Sort
                  </label>
                  <select
                    value={sortField}
                    onChange={(e) => setSortField(e.target.value)}
                    className="w-full rounded-2xl border border-red-100 bg-white px-3 py-3 text-sm"
                  >
                    <option value="createdAt">Date</option>
                    <option value="customer">Customer</option>
                    <option value="amount">Amount</option>
                    <option value="status">Status</option>
                  </select>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"))
                  }
                  className="rounded-2xl border border-red-100 bg-white px-4 py-3 text-sm hover:bg-red-50"
                >
                  {sortOrder === "asc" ? "Asc" : "Desc"}
                </button>
              </div>
            </div>

            {error && <p className="text-sm text-red-600">{error}</p>}

            <div className="space-y-3">
              {paginated.map((order) => {
                const primaryImage = getPrimaryItemImage(order);
                const isSelected = selectedAdminOrder?._id === order._id;

                return (
                  <div
                    key={order._id}
                    className={`rounded-[30px] border p-5 shadow-sm transition ${
                      isSelected
                        ? "border-red-300 bg-red-50/60"
                        : "border-red-100 bg-white hover:border-red-200"
                    }`}
                  >
                    <div className="flex flex-col gap-5">
                      <button
                        type="button"
                        onClick={() => openOrder(order._id)}
                        className="min-w-0 self-start text-left"
                      >
                        <div className="flex flex-col gap-4">
                          <div className="flex items-center gap-3">
                            {primaryImage ? (
                              <img
                                src={primaryImage}
                                alt="Order item"
                                className="h-16 w-16 rounded-2xl object-cover shadow-sm"
                              />
                            ) : (
                              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 text-red-600 shadow-sm">
                                <ShoppingBag className="h-7 w-7" />
                              </div>
                            )}

                            <div className="min-w-0">
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="rounded-full bg-red-600 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-white">
                                  {getOrderShortId(order._id)}
                                </span>
                                <span
                                  className={`rounded-full px-3 py-1 text-xs font-semibold ${
                                    STATUS_STYLES[order.status] ||
                                    STATUS_STYLES.default
                                  }`}
                                >
                                  {formatStatus(order.status)}
                                </span>
                              </div>
                              <p className="mt-2 break-all font-mono text-sm text-gray-700">
                                {order._id}
                              </p>
                            </div>
                          </div>

                          <div className="grid min-w-0 gap-3 md:grid-cols-2 xl:grid-cols-3">
                            <div className="min-w-0 overflow-hidden rounded-[22px] border border-red-100 bg-gradient-to-br from-red-50 to-white p-3">
                              <p className="text-xs uppercase tracking-wide text-gray-400">
                                Customer
                              </p>
                              <div className="mt-2 flex items-start gap-3">
                                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-red-600 text-sm font-semibold text-white shadow-sm">
                                  {getCustomerInitial(order)}
                                </div>
                                <div className="min-w-0">
                                  <p className="truncate text-sm font-semibold text-gray-900">
                                    {order.user?.name || "Unknown customer"}
                                  </p>
                                  <p className="mt-0.5 break-words text-xs leading-5 text-gray-500">
                                    {order.user?.email || "-"}
                                  </p>
                                </div>
                              </div>
                            </div>

                            <div className="rounded-[22px] border border-red-100 bg-white/90 p-3">
                              <p className="text-xs uppercase tracking-wide text-gray-400">
                                Date
                              </p>
                              <div className="mt-2 flex items-start gap-2">
                                <CalendarDays className="mt-0.5 h-4 w-4 shrink-0 text-red-500" />
                                <p className="text-sm leading-6 text-gray-700">
                                  {formatDate(order.createdAt)}
                                </p>
                              </div>
                            </div>

                            <div className="rounded-[22px] border border-red-100 bg-white/90 p-3">
                              <p className="text-xs uppercase tracking-wide text-gray-400">
                                Tracking
                              </p>
                              <p className="mt-2 text-sm leading-6 text-gray-700">
                                {order.tracking?.trackingId || "Not added"}
                              </p>
                            </div>
                          </div>
                        </div>
                      </button>

                      <div className="grid gap-4 rounded-[24px] border border-red-100 bg-white p-4 lg:grid-cols-[minmax(0,1fr)_220px] lg:items-end">
                        <div className="flex flex-wrap items-end justify-between gap-4">
                          <div>
                            <p className="text-xs uppercase tracking-wide text-gray-400">
                              Amount
                            </p>
                            <p className="mt-1 text-3xl font-semibold text-gray-900">
                              {formatAmount(order.finalAmount ?? order.subTotal)}
                            </p>
                          </div>

                          <div className="rounded-full border border-red-100 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700">
                            Current: {formatStatus(order.status)}
                          </div>
                        </div>

                        <div className="grid gap-3">
                          <select
                            value={statusDrafts[order._id] || order.status || "pending"}
                            onChange={(e) =>
                              handleStatusUpdate(order._id, e.target.value)
                            }
                            className="rounded-2xl border border-red-100 bg-white px-3 py-3 text-sm"
                          >
                            <option value="pending">Pending</option>
                            <option value="processing">Processing</option>
                            <option value="shipped">Shipped</option>
                            <option value="delivered">Delivered</option>
                            <option value="cancelled">Cancelled</option>
                          </select>

                          <div className="flex flex-wrap items-center justify-between gap-3">
                            <button
                              type="button"
                              onClick={() => openOrder(order._id)}
                              className="inline-flex items-center gap-2 text-sm font-medium text-red-600 hover:text-red-700"
                            >
                              View details
                              <ChevronRight className="h-4 w-4" />
                            </button>

                            <button
                              type="button"
                              onClick={() => handleDelete(order._id)}
                              className="rounded-2xl bg-red-600 px-4 py-2 text-sm text-white hover:bg-red-700"
                            >
                              Delete
                            </button>
                          </div>

                          {savingStatusId === order._id && (
                            <p className="text-xs text-gray-500">
                              Updating status...
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}

              {!loading && paginated.length === 0 && (
                <div className="rounded-[28px] border border-red-100 bg-white p-8 text-center text-sm text-gray-500">
                  No orders found.
                </div>
              )}
            </div>

            {filtered.length > 0 && (
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  disabled={page === 1}
                  onClick={() => setPage((prev) => prev - 1)}
                  className="rounded-xl border border-red-100 bg-white px-3 py-2 text-sm disabled:opacity-40"
                >
                  Prev
                </button>
                <p className="text-sm text-gray-500">
                  Page {page} / {totalPages}
                </p>
                <button
                  type="button"
                  disabled={page === totalPages}
                  onClick={() => setPage((prev) => prev + 1)}
                  className="rounded-xl border border-red-100 bg-white px-3 py-2 text-sm disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            )}
          </div>

          <div className="rounded-[32px] border border-red-100 bg-white p-5 shadow-sm">
            {!selectedAdminOrder ? (
              <div className="flex min-h-[640px] flex-col items-center justify-center text-center">
                <PackageSearch className="h-12 w-12 text-red-300" />
                <h2 className="mt-4 text-xl font-semibold text-gray-900">
                  Select an order
                </h2>
                <p className="mt-2 max-w-sm text-sm text-gray-500">
                  Click any order on the left to open its full details, customer
                  address, invoice, tracking information, and order history.
                </p>
              </div>
            ) : (
              <div className="space-y-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-xs uppercase tracking-wide text-red-500">
                      Order Details
                    </p>
                        <div className="mt-2 flex flex-wrap items-center gap-2">
                          <span className="rounded-full bg-red-600 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-white">
                            {getOrderShortId(selectedAdminOrder._id)}
                          </span>
                      <h2 className="break-all text-xl font-semibold leading-tight text-gray-900">
                            {selectedAdminOrder._id}
                          </h2>
                        </div>
                    <p className="mt-2 text-sm text-gray-500">
                      {formatDate(selectedAdminOrder.createdAt)}
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        openPrintWindow(
                          "Shipping Address",
                          buildAddressPrintHtml(selectedAdminOrder)
                        )
                      }
                      className="inline-flex items-center gap-2 rounded-2xl border border-red-100 bg-white px-3 py-2 text-sm hover:bg-red-50"
                    >
                      <Printer className="h-4 w-4" />
                      Address Print
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        openPrintWindow(
                          "Invoice",
                          selectedAdminOrder.invoiceHtml || "<p>No invoice found.</p>"
                        )
                      }
                      className="inline-flex items-center gap-2 rounded-2xl bg-red-600 px-3 py-2 text-sm text-white hover:bg-red-700"
                    >
                      <Printer className="h-4 w-4" />
                      Invoice Print
                    </button>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="rounded-[24px] border border-red-100 bg-red-50/40 p-4">
                    <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-900">
                      <UserRound className="h-4 w-4 text-red-500" />
                      Customer
                    </div>
                    <p className="font-semibold">{selectedAdminOrder.user?.name || "-"}</p>
                    <p className="break-all text-sm text-gray-600">
                      {selectedAdminOrder.user?.email || "-"}
                    </p>
                    <p className="text-sm text-gray-600">
                      {selectedAdminOrder.user?.mobile ||
                        selectedAdminOrder.shippingAddress?.phone ||
                        "-"}
                    </p>
                  </div>

                  <div className="rounded-[24px] border border-red-100 bg-red-50/40 p-4">
                    <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-900">
                      <Truck className="h-4 w-4 text-red-500" />
                      Shipping Address
                    </div>
                    <p className="text-sm leading-6 text-gray-700">
                      {selectedAdminOrder.shippingAddress?.name || "-"}
                      <br />
                      {selectedAdminOrder.shippingAddress?.line1 || "-"}
                      {selectedAdminOrder.shippingAddress?.line2 ? (
                        <>
                          <br />
                          {selectedAdminOrder.shippingAddress.line2}
                        </>
                      ) : null}
                      <br />
                      {selectedAdminOrder.shippingAddress?.city || "-"},{" "}
                      {selectedAdminOrder.shippingAddress?.state || "-"}
                      <br />
                      {selectedAdminOrder.shippingAddress?.postalCode || "-"},{" "}
                      {selectedAdminOrder.shippingAddress?.country || "-"}
                      <br />
                      {selectedAdminOrder.shippingAddress?.phone || "-"}
                    </p>
                  </div>
                </div>

                <div className="rounded-[24px] border border-red-100 bg-white p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-gray-900">
                      Payment & totals
                    </h3>
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        STATUS_STYLES[selectedAdminOrder.status] ||
                        STATUS_STYLES.default
                      }`}
                    >
                      {formatStatus(selectedAdminOrder.status)}
                    </span>
                  </div>
                  <div className="grid gap-3 md:grid-cols-2">
                    <p className="text-sm text-gray-600">
                      Payment method:{" "}
                      <span className="font-semibold text-gray-900">
                        {selectedAdminOrder.paymentMethod || "-"}
                      </span>
                    </p>
                    <p className="text-sm text-gray-600">
                      Paid:{" "}
                      <span className="font-semibold text-gray-900">
                        {selectedAdminOrder.paymentInfo?.paid ? "Yes" : "No"}
                      </span>
                    </p>
                    <p className="text-sm text-gray-600">
                      Subtotal:{" "}
                      <span className="font-semibold text-gray-900">
                        {formatAmount(selectedAdminOrder.subTotal)}
                      </span>
                    </p>
                    <p className="text-sm text-gray-600">
                      Final amount:{" "}
                      <span className="font-semibold text-gray-900">
                        {formatAmount(selectedAdminOrder.finalAmount)}
                      </span>
                    </p>
                    <p className="text-sm text-gray-600">
                      Transaction ID:{" "}
                      <span className="font-semibold text-gray-900">
                        {selectedAdminOrder.paymentInfo?.txnId ||
                          selectedAdminOrder.paymentInfo?.upiTxnId ||
                          "-"}
                      </span>
                    </p>
                    <p className="text-sm text-gray-600">
                      Coupon:{" "}
                      <span className="font-semibold text-gray-900">
                        {selectedAdminOrder.couponApplied?.code || "-"}
                      </span>
                    </p>
                  </div>
                </div>

                <form
                  onSubmit={handleTrackingSave}
                  className="rounded-[24px] border border-red-100 bg-white p-4"
                >
                  <div className="mb-3 flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-gray-900">
                      Tracking details
                    </h3>
                    {selectedAdminOrder.tracking?.updatedAt && (
                      <p className="text-xs text-gray-500">
                        Updated {formatDate(selectedAdminOrder.tracking.updatedAt)}
                      </p>
                    )}
                  </div>
                  <div className="grid gap-3">
                    <input
                      value={trackingForm.carrier}
                      onChange={(e) =>
                        setTrackingForm((prev) => ({
                          ...prev,
                          carrier: e.target.value,
                        }))
                      }
                      placeholder="Carrier name"
                      className="rounded-2xl border border-red-100 px-3 py-3 text-sm"
                    />
                    <input
                      value={trackingForm.trackingId}
                      onChange={(e) =>
                        setTrackingForm((prev) => ({
                          ...prev,
                          trackingId: e.target.value,
                        }))
                      }
                      placeholder="Tracking ID / number"
                      className="rounded-2xl border border-red-100 px-3 py-3 text-sm"
                    />
                    <input
                      value={trackingForm.trackingUrl}
                      onChange={(e) =>
                        setTrackingForm((prev) => ({
                          ...prev,
                          trackingUrl: e.target.value,
                        }))
                      }
                      placeholder="Tracking URL"
                      className="rounded-2xl border border-red-100 px-3 py-3 text-sm"
                    />
                  </div>
                  <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                    {selectedAdminOrder.tracking?.trackingUrl ? (
                      <a
                        href={selectedAdminOrder.tracking.trackingUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 text-sm text-red-600 hover:text-red-700"
                      >
                        <ExternalLink className="h-4 w-4" />
                        Open tracking link
                      </a>
                    ) : (
                      <span className="text-sm text-gray-400">
                        Add a link if you want quick courier access.
                      </span>
                    )}
                    <button
                      type="submit"
                      className="rounded-2xl bg-red-600 px-4 py-2 text-sm text-white hover:bg-red-700"
                    >
                      Save Tracking
                    </button>
                  </div>
                </form>

                <div className="rounded-[24px] border border-red-100 bg-white p-4">
                  <h3 className="mb-3 text-sm font-semibold text-gray-900">
                    Ordered items
                  </h3>
                  <div className="space-y-3">
                    {(selectedAdminOrder.items || []).map((item, index) => (
                      <div
                        key={`${item.productId || item.title}-${index}`}
                        className="flex items-center gap-3 rounded-2xl border border-red-50 p-3"
                      >
                        <img
                          src={item.image || "https://placehold.co/80x80?text=Item"}
                          alt={item.title}
                          className="h-16 w-16 rounded-xl object-cover"
                        />
                        <div className="min-w-0 flex-1">
                          <p className="font-semibold text-gray-900">{item.title}</p>
                          <p className="text-sm text-gray-500">
                            {item.color ? `${item.color} • ` : ""}
                            Size {item.size} • Qty {item.qty}
                          </p>
                        </div>
                        <p className="text-sm font-semibold text-gray-900">
                          {formatAmount(Number(item.price) * Number(item.qty))}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-[24px] border border-red-100 bg-white p-4">
                  <h3 className="mb-3 text-sm font-semibold text-gray-900">
                    This customer&apos;s other orders
                  </h3>
                  {selectedUserOrders.length === 0 ? (
                    <p className="text-sm text-gray-500">
                      No other orders found for this customer.
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {selectedUserOrders.map((order) => (
                        <button
                          key={order._id}
                          type="button"
                          onClick={() => openOrder(order._id)}
                          className="flex w-full items-center justify-between gap-3 rounded-2xl border border-red-50 px-3 py-3 text-left hover:bg-red-50/40"
                        >
                          <div className="min-w-0">
                            <p className="font-mono text-sm text-gray-800">
                              {getOrderShortId(order._id)}
                            </p>
                            <p className="truncate text-xs text-gray-500">
                              {formatDate(order.createdAt)}
                            </p>
                          </div>
                          <div className="flex items-center gap-3">
                            <span
                              className={`rounded-full px-3 py-1 text-xs font-semibold ${
                                STATUS_STYLES[order.status] || STATUS_STYLES.default
                              }`}
                            >
                              {formatStatus(order.status)}
                            </span>
                            <span className="text-sm font-semibold text-gray-900">
                              {formatAmount(order.finalAmount ?? order.subTotal)}
                            </span>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderManage;
