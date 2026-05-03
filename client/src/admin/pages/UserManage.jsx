import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Search, RefreshCw, Trash2, Users, Mail, Shield } from "lucide-react";
import { getAllUsers, deleteUser } from "../../redux/slices/userSlice";

const cardClass =
  "rounded-[1.8rem] border border-white/60 bg-white/95 p-6 shadow-[0_18px_40px_rgba(15,23,42,0.06)] backdrop-blur-sm";

const UserManage = () => {
  const dispatch = useDispatch();
  const { users = [] } = useSelector((s) => s.user);

  const [search, setSearch] = useState("");
  const [sortField, setSortField] = useState("name");
  const [sortOrder, setSortOrder] = useState("asc");
  const [page, setPage] = useState(1);
  const perPage = 10;

  useEffect(() => {
    dispatch(getAllUsers());
  }, [dispatch]);

  useEffect(() => {
    setPage(1);
  }, [search, sortField, sortOrder]);

  const filtered = useMemo(() => {
    let arr = [...users];
    const q = search.trim().toLowerCase();

    if (q) {
      arr = arr.filter(
        (u) =>
          u.name?.toLowerCase().includes(q) ||
          u.email?.toLowerCase().includes(q)
      );
    }

    arr.sort((a, b) => {
      const av = (a[sortField] || "").toString().toLowerCase();
      const bv = (b[sortField] || "").toString().toLowerCase();
      if (sortOrder === "asc") return av > bv ? 1 : -1;
      return av < bv ? 1 : -1;
    });

    return arr;
  }, [users, search, sortField, sortOrder]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const paginated = filtered.slice((page - 1) * perPage, page * perPage);
  const verifiedCount = users.filter((user) => user.verified).length;

  const toggleSort = (field) => {
    if (sortField === field) {
      setSortOrder((o) => (o === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  const confirmDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      dispatch(deleteUser(id));
    }
  };

  const handleReset = () => {
    setSearch("");
    setSortField("name");
    setSortOrder("asc");
    setPage(1);
  };

  return (
    <div className="rounded-[32px] border border-red-100/70 bg-white/80 p-6 shadow-[0_24px_80px_rgba(15,23,42,0.06)] backdrop-blur-sm">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-[#B21A15]">
              Users / Manage
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
              User Management
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600">
              Review customer accounts, search quickly, and keep your user base tidy from one focused workspace.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-[1.5rem] border border-white/70 bg-white/80 px-4 py-4 shadow-sm">
              <p className="text-[11px] uppercase tracking-[0.18em] text-slate-500">
                Total Users
              </p>
              <p className="mt-2 text-xl font-semibold text-slate-950">{users.length}</p>
            </div>
            <div className="rounded-[1.5rem] border border-white/70 bg-white/80 px-4 py-4 shadow-sm">
              <p className="text-[11px] uppercase tracking-[0.18em] text-slate-500">
                Verified
              </p>
              <p className="mt-2 text-xl font-semibold text-slate-950">{verifiedCount}</p>
            </div>
            <div className="rounded-[1.5rem] border border-white/70 bg-white/80 px-4 py-4 shadow-sm">
              <p className="text-[11px] uppercase tracking-[0.18em] text-slate-500">
                Visible Rows
              </p>
              <p className="mt-2 text-xl font-semibold text-slate-950">{filtered.length}</p>
            </div>
          </div>
        </div>

        <div className={`${cardClass} mb-6`}>
          <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
            <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_auto_auto]">
              <div>
                <label className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                  <Search className="h-3.5 w-3.5 text-[#B21A15]" />
                  Search Users
                </label>
                <div className="relative">
                  <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search by name or email..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full rounded-2xl border border-slate-200 bg-[#fbfaf7] py-3 pl-11 pr-4 text-sm text-slate-900 outline-none transition focus:border-[#B21A15] focus:bg-white"
                  />
                </div>
              </div>

              <button
                onClick={() => toggleSort("name")}
                className={`rounded-2xl border px-4 py-3 text-sm font-semibold transition ${
                  sortField === "name"
                    ? "border-[#B21A15] bg-[#B21A15] text-white"
                    : "border-slate-200 bg-[#fbfaf7] text-slate-700 hover:border-slate-300"
                }`}
              >
                Name {sortField === "name" ? (sortOrder === "asc" ? "↑" : "↓") : "↕"}
              </button>

              <button
                onClick={() => toggleSort("email")}
                className={`rounded-2xl border px-4 py-3 text-sm font-semibold transition ${
                  sortField === "email"
                    ? "border-[#B21A15] bg-[#B21A15] text-white"
                    : "border-slate-200 bg-[#fbfaf7] text-slate-700 hover:border-slate-300"
                }`}
              >
                Email {sortField === "email" ? (sortOrder === "asc" ? "↑" : "↓") : "↕"}
              </button>
            </div>

            <button
              onClick={handleReset}
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
              <h2 className="text-lg font-semibold text-slate-950">Customer Directory</h2>
              <p className="mt-1 text-sm text-slate-500">
                {filtered.length} user{filtered.length !== 1 ? "s" : ""} • Page {page} of {totalPages}
              </p>
            </div>
            <div className="text-sm text-slate-500">
              Showing {filtered.length === 0 ? 0 : (page - 1) * perPage + 1}-
              {Math.min(page * perPage, filtered.length)} of {filtered.length}
            </div>
          </div>

          {paginated.length === 0 ? (
            <div className="px-6 py-14 text-center text-sm text-slate-500">
              No users found.
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {paginated.map((u, idx) => (
                <div
                  key={u._id}
                  className="grid gap-4 px-6 py-5 transition hover:bg-[#fcfaf7] md:grid-cols-[56px_minmax(0,1fr)_220px_160px]"
                >
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#f7eee8] text-sm font-semibold text-[#B21A15]">
                    {(page - 1) * perPage + idx + 1}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-full bg-slate-900 text-sm font-semibold text-white">
                        {u.name?.charAt(0)?.toUpperCase() || "U"}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate font-semibold text-slate-950">{u.name || "Unnamed User"}</p>
                        <p className="mt-1 truncate text-sm text-slate-500">{u.mobile || "-"}</p>
                      </div>
                    </div>
                  </div>

                  <div className="min-w-0">
                    <div className="inline-flex items-center gap-2 rounded-full bg-[#fbfaf7] px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                      <Mail className="h-3.5 w-3.5" />
                      Email
                    </div>
                    <p className="mt-3 truncate text-sm text-slate-700">{u.email}</p>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-3 md:justify-end">
                    <span
                      className={`inline-flex items-center gap-2 rounded-full px-3 py-2 text-xs font-semibold ${
                        u.verified
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-amber-100 text-amber-700"
                      }`}
                    >
                      <Shield className="h-3.5 w-3.5" />
                      {u.verified ? "Verified" : "Pending"}
                    </span>

                    <button
                      onClick={() => confirmDelete(u._id)}
                      className="inline-flex items-center gap-2 rounded-full border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-100"
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
              onClick={() => setPage(page - 1)}
              className="rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-[#faf7f2]"
            >
              Prev
            </button>
          ) : (
            <div />
          )}

          <div className="flex items-center gap-2">
            {Array.from({ length: totalPages }).map((_, i) => (
              <button
                key={i}
                onClick={() => setPage(i + 1)}
                className={`rounded-2xl px-4 py-2.5 text-sm font-semibold transition ${
                  page === i + 1
                    ? "bg-[#B21A15] text-white"
                    : "border border-slate-200 bg-white text-slate-700 hover:bg-[#faf7f2]"
                }`}
              >
                {i + 1}
              </button>
            ))}
          </div>

          {page < totalPages ? (
            <button
              onClick={() => setPage(page + 1)}
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

export default UserManage;
