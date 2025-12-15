import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getAllUsers, deleteUser } from "../../redux/slices/userSlice";

const UserManage = () => {
  const dispatch = useDispatch();
  const { users = [] } = useSelector((s) => s.user);

  // UI State
  const [search, setSearch] = useState("");
  const [sortField, setSortField] = useState("name");
  const [sortOrder, setSortOrder] = useState("asc");
  const [page, setPage] = useState(1);
  const perPage = 10;

  useEffect(() => {
    dispatch(getAllUsers());
  }, [dispatch]);

  // Reset to first page when filters/sort change
  useEffect(() => {
    setPage(1);
  }, [search, sortField, sortOrder]);

  // Filter + Sort
  const filtered = useMemo(() => {
    let arr = [...users];
    const q = search.trim().toLowerCase();

    if (q) {
      arr = arr.filter(
        (u) =>
          u.name.toLowerCase().includes(q) ||
          u.email.toLowerCase().includes(q)
      );
    }

    arr.sort((a, b) => {
      let av = a[sortField].toLowerCase();
      let bv = b[sortField].toLowerCase();

      if (sortOrder === "asc") return av > bv ? 1 : -1;
      return av < bv ? 1 : -1;
    });

    return arr;
  }, [users, search, sortField, sortOrder]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const paginated = filtered.slice((page - 1) * perPage, page * perPage);

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
    <div className="p-6 bg-gray-100 dark:bg-gray-900 min-h-screen">
      <div className="max-w-5xl mx-auto dark:text-white">
        {/* HEADER */}
        <div className="mb-6">
          <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">
            Users / Manage
          </p>
          <h1 className="text-2xl font-semibold mt-1 text-gray-900 dark:text-white">
            User Management
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            View, search, and manage all registered users.
          </p>
        </div>

        {/* CONTROLS PANEL */}
        <div className="mb-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3 shadow-sm">
          <div className="flex-1">
            <label className="text-xs font-medium text-gray-600 dark:text-gray-400 block mb-1">
              Search
            </label>
            <input
              type="text"
              placeholder="Search by name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full px-3 py-2 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm"
            />
            {search && (
              <p className="mt-1 text-[11px] text-gray-500 dark:text-gray-400">
                Showing results for: <span className="font-semibold">{search}</span>
              </p>
            )}
          </div>

          <div className="flex flex-col items-end gap-2 text-sm">
            <div className="text-gray-600 dark:text-gray-400">
              {filtered.length} user{filtered.length !== 1 && "s"} • Page{" "}
              {page}/{totalPages}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              Total users: {users.length}
              {filtered.length !== users.length && (
                <> • Filtered: {filtered.length}</>
              )}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => toggleSort("name")}
                className={`px-3 py-1 rounded border text-xs ${
                  sortField === "name"
                    ? "bg-gray-800 text-white dark:bg-gray-200 dark:text-gray-900"
                    : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-100 border-gray-300 dark:border-gray-600"
                }`}
              >
                Name {sortField === "name" ? (sortOrder === "asc" ? "↑" : "↓") : "↕"}
              </button>
              <button
                onClick={() => toggleSort("email")}
                className={`px-3 py-1 rounded border text-xs ${
                  sortField === "email"
                    ? "bg-gray-800 text-white dark:bg-gray-200 dark:text-gray-900"
                    : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-100 border-gray-300 dark:border-gray-600"
                }`}
              >
                Email {sortField === "email" ? (sortOrder === "asc" ? "↑" : "↓") : "↕"}
              </button>
              <button
                onClick={handleReset}
                className="px-3 py-1 rounded border text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-100 border-gray-300 dark:border-gray-600 hover:bg-gray-200 dark:hover:bg-gray-600"
              >
                Reset
              </button>
            </div>
          </div>
        </div>

        {/* TABLE */}
        <div className="overflow-x-auto shadow rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
          <table className="w-full text-sm">
            <thead className="bg-gray-100 dark:bg-gray-800 dark:text-gray-200">
              <tr>
                <th className="p-3 text-left w-10">#</th>
                <th
                  className="p-3 text-left cursor-pointer"
                  onClick={() => toggleSort("name")}
                >
                  Name{" "}
                  {sortField === "name" ? (sortOrder === "asc" ? "↑" : "↓") : "↕"}
                </th>
                <th
                  className="p-3 text-left cursor-pointer"
                  onClick={() => toggleSort("email")}
                >
                  Email{" "}
                  {sortField === "email" ? (sortOrder === "asc" ? "↑" : "↓") : "↕"}
                </th>
                <th className="p-3 text-center">Action</th>
              </tr>
            </thead>

            <tbody className="dark:text-gray-100">
              {paginated.length === 0 && (
                <tr>
                  <td
                    colSpan="4"
                    className="p-6 text-center text-gray-500 dark:text-gray-400"
                  >
                    No users found
                  </td>
                </tr>
              )}

              {paginated.map((u, idx) => (
                <tr
                  key={u._id}
                  className="border-t border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-900 transition"
                >
                  <td className="p-3 text-xs text-gray-500 dark:text-gray-400">
                    {(page - 1) * perPage + idx + 1}
                  </td>
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-xs font-semibold text-gray-700 dark:text-gray-200">
                        {u.name?.charAt(0)?.toUpperCase() || "U"}
                      </div>
                      <span>{u.name}</span>
                    </div>
                  </td>
                  <td className="p-3">{u.email}</td>

                  <td className="p-3 text-center">
                    <button
                      onClick={() => confirmDelete(u._id)}
                      className="bg-red-600 hover:bg-red-700 text-white px-4 py-1.5 rounded-md text-xs font-medium transition"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* PAGINATION */}
        <div className="mt-4 flex items-center justify-between">
          {/* Prev */}
          {page > 1 ? (
            <button
              onClick={() => setPage(page - 1)}
              className="px-3 py-1 rounded bg-gray-200 dark:bg-gray-700 text-sm hover:bg-gray-300 dark:hover:bg-gray-600"
            >
              Prev
            </button>
          ) : (
            <div />
          )}

          {/* Page numbers */}
          <div className="flex items-center gap-1">
            {Array.from({ length: totalPages }).map((_, i) => (
              <button
                key={i}
                onClick={() => setPage(i + 1)}
                className={`px-3 py-1 rounded text-sm ${
                  page === i + 1
                    ? "bg-gray-800 text-white dark:bg-gray-200 dark:text-gray-900"
                    : "bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600"
                }`}
              >
                {i + 1}
              </button>
            ))}
          </div>

          {/* Next */}
          {page < totalPages ? (
            <button
              onClick={() => setPage(page + 1)}
              className="px-3 py-1 rounded bg-gray-200 dark:bg-gray-700 text-sm hover:bg-gray-300 dark:hover:bg-gray-600"
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
