import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  listCoupons,
  deleteCoupon,
  toggleCouponStatus,
} from "../../redux/slices/couponSlice";
import { useNavigate } from "react-router";

/* Icons */
import { Trash2, Pencil, Repeat, BadgePlus, Copy } from "lucide-react";

const CouponManage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { coupons = [] } = useSelector((s) => s.coupon || {});

  /* STATE */
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [sortField, setSortField] = useState("code");
  const [sortOrder, setSortOrder] = useState("asc");
  const [page, setPage] = useState(1);
  const perPage = 10;
  const [copied, setCopied] = useState(null);

  useEffect(() => {
    dispatch(listCoupons());
  }, [dispatch]);

  // Reset to first page whenever filters/sort change
  useEffect(() => {
    setPage(1);
  }, [search, statusFilter, sortField, sortOrder]);

  /* FILTER + SEARCH + SORT */
  const filtered = useMemo(() => {
    let data = [...coupons];

    if (search.trim()) {
      const q = search.toLowerCase();
      data = data.filter(
        (c) =>
          c.code.toLowerCase().includes(q) ||
          c.discountType.toLowerCase().includes(q)
      );
    }

    if (statusFilter) {
      data = data.filter((c) =>
        statusFilter === "active" ? c.isActive : !c.isActive
      );
    }

    // sorting
    data.sort((a, b) => {
      let av = a[sortField];
      let bv = b[sortField];

      if (typeof av === "string") av = av.toLowerCase();
      if (typeof bv === "string") bv = bv.toLowerCase();

      if (sortOrder === "asc") return av > bv ? 1 : -1;
      return av < bv ? 1 : -1;
    });

    return data;
  }, [coupons, search, statusFilter, sortField, sortOrder]);

  const totalPages = Math.ceil(filtered.length / perPage);
  const paginated = filtered.slice((page - 1) * perPage, page * perPage);

  useEffect(() => {
    if (page > totalPages && totalPages > 0) setPage(1);
  }, [totalPages, page]);

  /* SORT HANDLER */
  const toggleSort = (field) => {
    if (sortField === field) {
      setSortOrder((o) => (o === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  /* COPY CODE */
  const copyCode = async (code) => {
    await navigator.clipboard.writeText(code);
    setCopied(code);
    setTimeout(() => setCopied(null), 1500);
  };

  const activeCount = coupons.filter((c) => c.isActive).length;

  return (
    <div className="p-6 bg-gray-100 dark:bg-gray-900 min-h-screen text-gray-900 dark:text-gray-100">
      <div className="max-w-5xl mx-auto">
        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-6">
          <div>
            <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">
              Coupons / Manage
            </p>
            <h1 className="text-2xl font-semibold mt-1">Manage Coupons</h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              View, filter, and control all discount codes in your store.
            </p>
          </div>

          <button
            onClick={() => navigate("/admin/coupons/create")}
            className="bg-red-600 flex gap-2 items-center text-white px-4 py-2 rounded hover:bg-red-700 transition dark:bg-red-500 dark:hover:bg-red-600 text-sm shadow-sm"
          >
            <BadgePlus size={18} /> Create Coupon
          </button>
        </div>

        {/* CONTROLS PANEL */}
        <div className="mb-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-4 flex flex-col gap-3 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div className="flex flex-1 flex-wrap gap-2">
              <div className="flex-1 min-w-[200px]">
                <label className="text-xs font-medium text-gray-600 dark:text-gray-400 block mb-1">
                  Search
                </label>
                <input
                  type="text"
                  placeholder="Search code or type..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full px-3 py-2 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm"
                />
              </div>

              <div className="min-w-[160px]">
                <label className="text-xs font-medium text-gray-600 dark:text-gray-400 block mb-1">
                  Status
                </label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-3 py-2 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 dark:text-gray-100 text-sm"
                >
                  <option value="">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

              <div className="flex flex-col justify-end">
                <span className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                  &nbsp;
                </span>
                <button
                  onClick={() => {
                    setSearch("");
                    setStatusFilter("");
                    setSortField("code");
                    setSortOrder("asc");
                  }}
                  className="px-3 py-2 rounded bg-gray-200 dark:bg-gray-700 text-sm hover:bg-gray-300 dark:hover:bg-gray-600"
                >
                  Reset
                </button>
              </div>
            </div>

            <div className="flex flex-col items-end gap-1 text-sm">
              <div className="text-gray-500 dark:text-gray-400">
                {filtered.length} result(s) • Page {page}/{totalPages || 1}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                Active: {activeCount} • Inactive: {coupons.length - activeCount}
              </div>
            </div>
          </div>
        </div>

        {/* TABLE */}
        <div className="overflow-x-auto shadow rounded-2xl bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700">
          <table className="w-full text-sm">
            <thead className="bg-gray-200 dark:bg-gray-800 dark:text-gray-200">
              <tr className="text-center">
                <th
                  className="p-3 border-b cursor-pointer"
                  onClick={() => toggleSort("code")}
                >
                  Code{" "}
                  {sortField === "code"
                    ? sortOrder === "asc"
                      ? "↑"
                      : "↓"
                    : "↕"}
                </th>

                <th
                  className="p-3 border-b cursor-pointer"
                  onClick={() => toggleSort("discountType")}
                >
                  Type{" "}
                  {sortField === "discountType"
                    ? sortOrder === "asc"
                      ? "↑"
                      : "↓"
                    : "↕"}
                </th>

                <th
                  className="p-3 border-b cursor-pointer"
                  onClick={() => toggleSort("amount")}
                >
                  Amount{" "}
                  {sortField === "amount"
                    ? sortOrder === "asc"
                      ? "↑"
                      : "↓"
                    : "↕"}
                </th>

                <th
                  className="p-3 border-b cursor-pointer"
                  onClick={() => toggleSort("isActive")}
                >
                  Status{" "}
                  {sortField === "isActive"
                    ? sortOrder === "asc"
                      ? "↑"
                      : "↓"
                    : "↕"}
                </th>

                <th className="p-3 border-b">Toggle</th>
                <th className="p-3 border-b">Edit</th>
                <th className="p-3 border-b">Delete</th>
              </tr>
            </thead>

            <tbody className="dark:bg-gray-900">
              {paginated.map((c) => (
                <tr
                  key={c._id}
                  className="border-b border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                >
                  {/* CODE + COPY BUTTON */}
                  <td className="p-3 text-center font-semibold">
                    <div className="flex items-center justify-center gap-2">
                      <span className="px-2 py-1 rounded bg-gray-100 dark:bg-gray-700">
                        {c.code}
                      </span>
                      <button
                        onClick={() => copyCode(c.code)}
                        className="p-1 rounded bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600"
                        title="Copy code"
                      >
                        <Copy size={14} />
                      </button>
                      {copied === c.code && (
                        <span className="text-xs text-green-500">
                          Copied
                        </span>
                      )}
                    </div>
                  </td>

                  <td className="p-3 text-center capitalize">
                    {c.discountType}
                  </td>
                  <td className="p-3 text-center">
                    {c.discountType === "percentage"
                      ? `${c.amount}%`
                      : `₹${c.amount}`}
                  </td>

                  <td className="p-3 text-center">
                    {c.isActive ? (
                      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300">
                        Active
                      </span>
                    ) : (
                      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300">
                        Inactive
                      </span>
                    )}
                  </td>

                  <td className="p-3 text-center">
                    <button
                      onClick={() => dispatch(toggleCouponStatus(c._id))}
                      className="p-2 bg-blue-600 text-white rounded hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
                      title="Toggle status"
                    >
                      <Repeat size={18} />
                    </button>
                  </td>

                  <td className="p-3 text-center">
                    <button
                      onClick={() => navigate(`/admin/coupons/edit/${c._id}`)}
                      className="p-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 dark:bg-yellow-400 dark:hover:bg-yellow-500"
                      title="Edit coupon"
                    >
                      <Pencil size={18} />
                    </button>
                  </td>

                  <td className="p-3 text-center">
                    <button
                      onClick={() => dispatch(deleteCoupon(c._id))}
                      className="p-2 bg-red-600 text-white rounded hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600"
                      title="Delete coupon"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}

              {paginated.length === 0 && (
                <tr>
                  <td
                    colSpan="7"
                    className="p-6 text-center text-gray-500 dark:text-gray-400"
                  >
                    No coupons found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* FINAL PAGINATION — ONLY SHOW BUTTONS WHEN NEEDED */}
        <div className="mt-4 flex items-center justify-between text-sm">
          {/* Prev only if page > 1 */}
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

          <span className="text-gray-600 dark:text-gray-400">
            Page {page} of {totalPages || 1}
          </span>

          {/* Next only if page < totalPages */}
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

export default CouponManage;
