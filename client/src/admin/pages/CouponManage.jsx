import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  listCoupons,
  deleteCoupon,
  toggleCouponStatus,
} from "../../redux/slices/couponSlice";
import { useNavigate } from "react-router";
import {
  Trash2,
  Pencil,
  Repeat,
  BadgePlus,
  Copy,
  Search,
  RefreshCw,
  TicketPercent,
  ShieldCheck,
  CalendarClock,
} from "lucide-react";

const cardClass =
  "rounded-[1.8rem] border border-white/60 bg-white/95 p-6 shadow-[0_18px_40px_rgba(15,23,42,0.06)] backdrop-blur-sm";

const CouponManage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { coupons = [] } = useSelector((s) => s.coupon || {});

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [sortField, setSortField] = useState("code");
  const [sortOrder, setSortOrder] = useState("asc");
  const [page, setPage] = useState(1);
  const [copied, setCopied] = useState(null);
  const perPage = 10;

  useEffect(() => {
    dispatch(listCoupons());
  }, [dispatch]);

  useEffect(() => {
    setPage(1);
  }, [search, statusFilter, sortField, sortOrder]);

  const filtered = useMemo(() => {
    let data = [...coupons];

    if (search.trim()) {
      const q = search.toLowerCase();
      data = data.filter(
        (c) =>
          c.code?.toLowerCase().includes(q) ||
          c.discountType?.toLowerCase().includes(q)
      );
    }

    if (statusFilter) {
      data = data.filter((c) =>
        statusFilter === "active" ? c.isActive : !c.isActive
      );
    }

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

  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const paginated = filtered.slice((page - 1) * perPage, page * perPage);
  const activeCount = coupons.filter((c) => c.isActive).length;
  const expiringSoonCount = coupons.filter((c) => {
    if (!c.expiryDate) return false;
    const expiry = new Date(c.expiryDate).getTime();
    const nextWeek = Date.now() + 7 * 24 * 60 * 60 * 1000;
    return expiry <= nextWeek && expiry >= Date.now();
  }).length;

  useEffect(() => {
    if (page > totalPages && totalPages > 0) setPage(1);
  }, [totalPages, page]);

  const toggleSort = (field) => {
    if (sortField === field) {
      setSortOrder((o) => (o === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  const copyCode = async (code) => {
    await navigator.clipboard.writeText(code);
    setCopied(code);
    setTimeout(() => setCopied(null), 1500);
  };

  const resetFilters = () => {
    setSearch("");
    setStatusFilter("");
    setSortField("code");
    setSortOrder("asc");
    setPage(1);
  };

  return (
    <div className="rounded-[32px] border border-red-100/70 bg-white/80 p-6 shadow-[0_24px_80px_rgba(15,23,42,0.06)] backdrop-blur-sm">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-[#B21A15]">
              Coupons / Manage
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
              Coupon Control Center
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600">
              Review active discount codes, monitor expiry windows, and keep every campaign organized in one clean table.
            </p>
          </div>

          <button
            onClick={() => navigate("/admin/coupons/create")}
            className="inline-flex items-center gap-2 rounded-full bg-[#B21A15] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#97150f]"
          >
            <BadgePlus className="h-4 w-4" />
            Create Coupon
          </button>
        </div>

        <div className="mb-6 grid gap-3 sm:grid-cols-3">
          <div className="rounded-[1.5rem] border border-white/70 bg-white/80 px-4 py-4 shadow-sm">
            <p className="text-[11px] uppercase tracking-[0.18em] text-slate-500">
              Total Coupons
            </p>
            <p className="mt-2 text-xl font-semibold text-slate-950">{coupons.length}</p>
          </div>
          <div className="rounded-[1.5rem] border border-white/70 bg-white/80 px-4 py-4 shadow-sm">
            <p className="text-[11px] uppercase tracking-[0.18em] text-slate-500">
              Active
            </p>
            <p className="mt-2 text-xl font-semibold text-slate-950">{activeCount}</p>
          </div>
          <div className="rounded-[1.5rem] border border-white/70 bg-white/80 px-4 py-4 shadow-sm">
            <p className="text-[11px] uppercase tracking-[0.18em] text-slate-500">
              Expiring Soon
            </p>
            <p className="mt-2 text-xl font-semibold text-slate-950">{expiringSoonCount}</p>
          </div>
        </div>

        <div className={`${cardClass} mb-6`}>
          <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_220px_220px_auto] lg:items-end">
            <div>
              <label className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                <Search className="h-3.5 w-3.5 text-[#B21A15]" />
                Search
              </label>
              <div className="relative">
                <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search code or type..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-[#fbfaf7] py-3 pl-11 pr-4 text-sm text-slate-900 outline-none transition focus:border-[#B21A15] focus:bg-white"
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                Status
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-[#fbfaf7] px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-[#B21A15] focus:bg-white"
              >
                <option value="">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                Sort
              </label>
              <div className="flex gap-2">
                <button
                  onClick={() => toggleSort("code")}
                  className={`flex-1 rounded-2xl border px-4 py-3 text-sm font-semibold transition ${
                    sortField === "code"
                      ? "border-[#B21A15] bg-[#B21A15] text-white"
                      : "border-slate-200 bg-[#fbfaf7] text-slate-700 hover:border-slate-300"
                  }`}
                >
                  Code {sortField === "code" ? (sortOrder === "asc" ? "↑" : "↓") : "↕"}
                </button>
                <button
                  onClick={() => toggleSort("amount")}
                  className={`flex-1 rounded-2xl border px-4 py-3 text-sm font-semibold transition ${
                    sortField === "amount"
                      ? "border-[#B21A15] bg-[#B21A15] text-white"
                      : "border-slate-200 bg-[#fbfaf7] text-slate-700 hover:border-slate-300"
                  }`}
                >
                  Amount {sortField === "amount" ? (sortOrder === "asc" ? "↑" : "↓") : "↕"}
                </button>
              </div>
            </div>

            <button
              onClick={resetFilters}
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-[#faf7f2]"
            >
              <RefreshCw className="h-4 w-4" />
              Reset
            </button>
          </div>
        </div>

        <div className={`${cardClass} overflow-hidden p-0`}>
          <div className="flex flex-col gap-3 border-b border-slate-100 px-6 py-5 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-950">Coupon Library</h2>
              <p className="mt-1 text-sm text-slate-500">
                {filtered.length} coupon{filtered.length !== 1 ? "s" : ""} • Page {page} of {totalPages}
              </p>
            </div>
            <div className="text-sm text-slate-500">
              Active: {activeCount} • Inactive: {coupons.length - activeCount}
            </div>
          </div>

          {paginated.length === 0 ? (
            <div className="px-6 py-14 text-center text-sm text-slate-500">
              No coupons found.
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {paginated.map((c) => (
                <div
                  key={c._id}
                  className="grid gap-4 px-6 py-5 transition hover:bg-[#fcfaf7] lg:grid-cols-[minmax(0,1.2fr)_180px_160px_220px]"
                >
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="inline-flex items-center gap-2 rounded-full bg-[#fff5f2] px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-[#B21A15]">
                        <TicketPercent className="h-3.5 w-3.5" />
                        {c.code}
                      </span>
                      <button
                        onClick={() => copyCode(c.code)}
                        className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-600 transition hover:bg-[#faf7f2]"
                      >
                        <Copy className="h-3.5 w-3.5" />
                        {copied === c.code ? "Copied" : "Copy"}
                      </button>
                    </div>
                    <p className="mt-3 text-sm text-slate-600">
                      {c.description || "No description added for this campaign."}
                    </p>
                  </div>

                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                      Discount
                    </p>
                    <p className="mt-2 font-semibold text-slate-950">
                      {c.discountType === "percentage" ? `${c.amount}% OFF` : `Rs. ${c.amount} OFF`}
                    </p>
                    <p className="mt-1 text-sm text-slate-500">
                      Min order: Rs. {c.minOrderValue || 0}
                    </p>
                  </div>

                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                      Status
                    </p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          c.isActive
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-rose-100 text-rose-700"
                        }`}
                      >
                        {c.isActive ? "Active" : "Inactive"}
                      </span>
                      {c.expiryDate ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                          <CalendarClock className="h-3.5 w-3.5" />
                          {new Date(c.expiryDate).toLocaleDateString()}
                        </span>
                      ) : null}
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 lg:justify-end">
                    <button
                      onClick={() => dispatch(toggleCouponStatus(c._id))}
                      className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700 transition hover:bg-blue-100"
                      title="Toggle status"
                    >
                      <Repeat className="h-4 w-4" />
                      Toggle
                    </button>
                    <button
                      onClick={() => navigate(`/admin/coupons/edit/${c._id}`)}
                      className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-4 py-2 text-sm font-semibold text-amber-700 transition hover:bg-amber-100"
                      title="Edit coupon"
                    >
                      <Pencil className="h-4 w-4" />
                      Edit
                    </button>
                    <button
                      onClick={() => dispatch(deleteCoupon(c._id))}
                      className="inline-flex items-center gap-2 rounded-full border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-100"
                      title="Delete coupon"
                    >
                      <Trash2 className="h-4 w-4" />
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="mt-6 flex items-center justify-between">
          {page > 1 ? (
            <button
              onClick={() => setPage((p) => p - 1)}
              className="rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-[#faf7f2]"
            >
              Prev
            </button>
          ) : (
            <div />
          )}

          <span className="text-sm text-slate-500">
            Page {page} of {totalPages}
          </span>

          {page < totalPages ? (
            <button
              onClick={() => setPage((p) => p + 1)}
              className="rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-[#faf7f2]"
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
