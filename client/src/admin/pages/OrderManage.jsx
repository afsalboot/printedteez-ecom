import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  adminOrderList,
  updateStatus,
  adminDeleteOrder, // 👈 NEW
} from "../../redux/slices/orderSlice";

// backend uses: "processing","shipped","delivered","cancelled"
const STATUS_STYLES = {
  processing:
    "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300",
  shipped:
    "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
  delivered:
    "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
  cancelled:
    "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
  default: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200",
};

const formatStatus = (s) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : "");

const OrderManage = () => {
  const dispatch = useDispatch();
  const { adminOrders = [], loading } = useSelector((s) => s.order || {});

  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const perPage = 10;
  const [sortField, setSortField] = useState("_id");
  const [sortOrder, setSortOrder] = useState("desc");
  const [copiedId, setCopiedId] = useState(null);

  useEffect(() => {
    dispatch(adminOrderList());
  }, [dispatch]);

  // reset to page 1 when filters/search change
  useEffect(() => {
    setPage(1);
  }, [query, statusFilter]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let arr = Array.isArray(adminOrders) ? [...adminOrders] : [];

    if (q) {
      arr = arr.filter(
        (o) =>
          (o._id && o._id.toLowerCase().includes(q)) ||
          (o.user?.name && o.user.name.toLowerCase().includes(q))
      );
    }

    if (statusFilter) {
      arr = arr.filter((o) => (o.status || "") === statusFilter);
    }

    // Sorting
    arr.sort((a, b) => {
      let av = a[sortField];
      let bv = b[sortField];

      if (sortField === "user") {
        av = a.user?.name || "";
        bv = b.user?.name || "";
      }

      if (typeof av === "number" && typeof bv === "number") {
        return sortOrder === "asc" ? av - bv : bv - av;
      }

      av = av ? String(av).toLowerCase() : "";
      bv = bv ? String(bv).toLowerCase() : "";

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
  }, [totalPages, page]);

  const toggleSort = (field) => {
    if (sortField === field) {
      setSortOrder((o) => (o === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  const handleCopy = async (id) => {
    await navigator.clipboard.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  const handleStatusUpdate = (orderId, newStatus) => {
    if (!newStatus) return;
    dispatch(updateStatus(orderId, newStatus)); // sends lowercase status
  };

  const handleDelete = (orderId) => {
    if (!window.confirm("Delete this order permanently?")) return;
    dispatch(adminDeleteOrder(orderId));
  };

  const activeCount = filtered.filter((o) => o.status !== "cancelled").length;

  return (
    <div className="p-6 bg-gray-100 dark:bg-gray-900 min-h-screen text-gray-900 dark:text-gray-100">
      <div className="max-w-6xl mx-auto">
        {/* HEADER */}
        <div className="mb-6">
          <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">
            Orders / Manage
          </p>
          <h1 className="text-2xl font-semibold mt-1">Order Management</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Search, filter, and update order statuses across your store.
          </p>
        </div>

        {/* CONTROLS PANEL */}
        <div className="flex flex-col gap-3 mb-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-4 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div className="flex flex-1 flex-wrap gap-2">
              <div className="flex-1 min-w-[220px]">
                <label className="text-xs font-medium text-gray-600 dark:text-gray-400 block mb-1">
                  Search
                </label>
                <input
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search Order ID or User..."
                  className="w-full px-3 py-2 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm"
                />
              </div>

              <div className="min-w-[180px]">
                <label className="text-xs font-medium text-gray-600 dark:text-gray-400 block mb-1">
                  Status
                </label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-3 py-2 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm"
                >
                  <option value="">All statuses</option>
                  <option value="processing">Processing</option>
                  <option value="shipped">Shipped</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              <div className="flex flex-col justify-end">
                <span className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                  &nbsp;
                </span>
                <button
                  onClick={() => {
                    setQuery("");
                    setStatusFilter("");
                    setSortField("_id");
                    setSortOrder("desc");
                  }}
                  className="px-3 py-2 rounded bg-gray-200 dark:bg-gray-700 text-sm hover:bg-gray-300 dark:hover:bg-gray-600"
                >
                  Reset
                </button>
              </div>
            </div>

            <div className="flex flex-col items-end gap-1 text-sm">
              <div className="text-gray-500 dark:text-gray-400">
                {filtered.length} result(s) • Page {page} / {totalPages}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                Active (non-cancelled): {activeCount}
              </div>
            </div>
          </div>
        </div>

        {loading && (
          <p className="mb-4 text-sm text-gray-500 dark:text-gray-400">
            Loading orders...
          </p>
        )}

        {/* TABLE CARD */}
        <div className="overflow-x-auto shadow rounded-2xl bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700">
          <table className="w-full text-sm">
            <thead className="bg-gray-200 dark:bg-gray-800">
              <tr className="text-center">
                <th
                  className="p-3 border-b cursor-pointer"
                  onClick={() => toggleSort("_id")}
                >
                  Order ID
                  {sortField === "_id"
                    ? sortOrder === "asc"
                      ? " ↑"
                      : " ↓"
                    : " ↕"}
                </th>

                <th
                  className="p-3 border-b cursor-pointer"
                  onClick={() => toggleSort("user")}
                >
                  Customer
                  {sortField === "user"
                    ? sortOrder === "asc"
                      ? " ↑"
                      : " ↓"
                    : " ↕"}
                </th>

                <th
                  className="p-3 border-b cursor-pointer"
                  onClick={() => toggleSort("finalAmount")}
                >
                  Total
                  {sortField === "finalAmount"
                    ? sortOrder === "asc"
                      ? " ↑"
                      : " ↓"
                    : " ↕"}
                </th>

                <th
                  className="p-3 border-b cursor-pointer"
                  onClick={() => toggleSort("status")}
                >
                  Status
                  {sortField === "status"
                    ? sortOrder === "asc"
                      ? " ↑"
                      : " ↓"
                    : " ↕"}
                </th>

                <th className="p-3 border-b">Update</th>
                <th className="p-3 border-b">Actions</th>
              </tr>
            </thead>

            <tbody>
              {paginated.length === 0 && !loading && (
                <tr>
                  <td
                    colSpan="6"
                    className="p-6 text-center text-gray-500 dark:text-gray-400"
                  >
                    No orders found.
                  </td>
                </tr>
              )}

              {paginated.map((o) => (
                <tr
                  key={o._id}
                  className="border-b dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-900 transition"
                >
                  {/* ORDER ID + COPY */}
                  <td className="p-3 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <span className="font-mono text-xs md:text-sm">
                        {o._id.slice(0, 8)}...
                      </span>
                      <button
                        onClick={() => handleCopy(o._id)}
                        className="px-2 py-1 rounded bg-gray-200 dark:bg-gray-700 text-xs hover:bg-gray-300 dark:hover:bg-gray-600"
                      >
                        {copiedId === o._id ? "Copied" : "Copy"}
                      </button>
                    </div>
                  </td>

                  {/* USER */}
                  <td className="p-3 text-center">
                    <div className="font-medium">{o.user?.name}</div>
                    <div className="text-xs text-gray-500">
                      {o.user?.email}
                    </div>
                  </td>

                  {/* TOTAL */}
                  <td className="p-3 text-center font-semibold">
                    ₹{o.finalAmount}
                  </td>

                  {/* STATUS */}
                  <td className="p-3 text-center">
                    <span
                      className={`px-3 py-1 text-xs md:text-sm rounded-full font-semibold ${
                        STATUS_STYLES[o.status] || STATUS_STYLES.default
                      }`}
                    >
                      {formatStatus(o.status)}
                    </span>
                  </td>

                  {/* UPDATE STATUS */}
                  <td className="p-3 text-center">
                    <select
                      value=""
                      onChange={(e) =>
                        handleStatusUpdate(o._id, e.target.value)
                      }
                      className="border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 p-2 rounded text-xs md:text-sm"
                    >
                      <option value="">Change</option>
                      <option value="processing">Processing</option>
                      <option value="shipped">Shipped</option>
                      <option value="delivered">Delivered</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </td>

                  {/* DELETE */}
                  <td className="p-3 text-center">
                    <button
                      onClick={() => handleDelete(o._id)}
                      className="px-3 py-1 rounded bg-red-500 text-white text-xs md:text-sm hover:bg-red-600"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="mt-4 flex items-center justify-between text-sm">
          {page > 1 ? (
            <button
              onClick={() => setPage((p) => p - 1)}
              className="px-3 py-1 rounded bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600"
            >
              Prev
            </button>
          ) : (
            <div />
          )}

          <div className="flex items-center gap-1">
            {Array.from({ length: totalPages }).map((_, i) => (
              <button
                key={i}
                onClick={() => setPage(i + 1)}
                className={`px-3 py-1 rounded ${
                  page === i + 1
                    ? "bg-gray-800 text-white dark:bg-gray-200 dark:text-gray-900"
                    : "bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600"
                }`}
              >
                {i + 1}
              </button>
            ))}
          </div>

          {page < totalPages ? (
            <button
              onClick={() => setPage((p) => p + 1)}
              className="px-3 py-1 rounded bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600"
            >
              Next
            </button>
          ) : (
            <div />
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderManage;
