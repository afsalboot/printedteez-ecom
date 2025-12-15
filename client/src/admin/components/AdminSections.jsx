import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  getSections,
  createSection,
  updateSection,
  deleteSection,
} from "../../redux/slices/sectionSlice.jsx";
import { SECTION_TYPES } from "../../assets/assets.js";

const AdminSections = () => {
  const dispatch = useDispatch();
  const { list = [], loading, error } = useSelector((state) => state.sections);

  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);

  const [form, setForm] = useState({
    type: "",
    title: "",
    subtitle: "",
    extra: "",
    order: 0,
  });

  useEffect(() => {
    dispatch(getSections());
  }, [dispatch]);

  const startCreate = () => {
    setForm({ type: "", title: "", subtitle: "", extra: "", order: 0 });
    setEditing(null);
    setShowForm(true);
  };

  const startEdit = (section) => {
    setForm({
      type: section.type || "",
      title: section.title || "",
      subtitle: section.subtitle || "",
      extra: section.extra || "",
      order: section.order ?? 0,
    });
    setEditing(section._id);
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (editing) {
      await dispatch(updateSection(editing, form));
    } else {
      await dispatch(createSection(form));
    }

    setShowForm(false);
    setEditing(null);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure?")) return;
    dispatch(deleteSection(id));
  };

  const closeForm = () => {
    setShowForm(false);
    setEditing(null);
  };

  const sortedList = [...list].sort((a, b) => (a.order || 0) - (b.order || 0));

  return (
    <div className="p-6 bg-gray-100 dark:bg-gray-900 min-h-screen text-gray-900 dark:text-gray-100">
      <div className="max-w-5xl mx-auto">
        {/* HEADER */}
        <div className="mb-6">
          <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">
            Homepage / Sections
          </p>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mt-1">
            <div>
              <h1 className="text-3xl font-bold">Manage Sections</h1>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Configure homepage sections like hero, collections, banners, and more.
              </p>
            </div>

            <button
              onClick={startCreate}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium shadow-sm hover:bg-blue-700 transition"
            >
              + Add Section
            </button>
          </div>
        </div>

        {/* STATUS */}
        {(loading || error) && (
          <div className="mb-4">
            {loading && (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Loading sections...
              </p>
            )}
            {error && (
              <p className="text-sm text-red-500">
                {typeof error === "string" ? error : "Failed to load sections"}
              </p>
            )}
          </div>
        )}

        {/* FORM MODAL */}
        {showForm && (
          <div className="fixed inset-0 z-40 bg-black/40 flex justify-center items-center px-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-md border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between px-6 pt-5 pb-3 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-xl font-semibold">
                  {editing ? "Edit Section" : "Create Section"}
                </h2>
                <button
                  onClick={closeForm}
                  className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 text-sm"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSubmit} className="px-6 pb-5 pt-3 space-y-3">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-gray-600 dark:text-gray-400">
                    Section Type
                  </label>
                  <select
                    className="w-full border border-gray-300 dark:border-gray-600 p-2.5 rounded-lg bg-white dark:bg-gray-800 text-sm"
                    value={form.type}
                    onChange={(e) => setForm({ ...form, type: e.target.value })}
                    required
                  >
                    <option value="">Select Section Type</option>
                    {SECTION_TYPES.map((t) => (
                      <option key={t.value} value={t.value}>
                        {t.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-gray-600 dark:text-gray-400">
                    Title
                  </label>
                  <input
                    className="w-full border border-gray-300 dark:border-gray-600 p-2.5 rounded-lg bg-white dark:bg-gray-800 text-sm"
                    placeholder="Title"
                    value={form.title}
                    onChange={(e) =>
                      setForm({ ...form, title: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-gray-600 dark:text-gray-400">
                    Subtitle (optional)
                  </label>
                  <input
                    className="w-full border border-gray-300 dark:border-gray-600 p-2.5 rounded-lg bg-white dark:bg-gray-800 text-sm"
                    placeholder="Subtitle"
                    value={form.subtitle}
                    onChange={(e) =>
                      setForm({ ...form, subtitle: e.target.value })
                    }
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-gray-600 dark:text-gray-400">
                    Extra small text (optional)
                  </label>
                  <input
                    className="w-full border border-gray-300 dark:border-gray-600 p-2.5 rounded-lg bg-white dark:bg-gray-800 text-sm"
                    placeholder="Extra small text"
                    value={form.extra}
                    onChange={(e) =>
                      setForm({ ...form, extra: e.target.value })
                    }
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-gray-600 dark:text-gray-400">
                    Order (for display sorting)
                  </label>
                  <input
                    className="w-full border border-gray-300 dark:border-gray-600 p-2.5 rounded-lg bg-white dark:bg-gray-800 text-sm"
                    placeholder="Order (0, 1, 2...)"
                    type="number"
                    value={form.order}
                    onChange={(e) =>
                      setForm({ ...form, order: Number(e.target.value) })
                    }
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-sm rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600"
                    onClick={closeForm}
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm rounded-lg"
                  >
                    {editing ? "Update Section" : "Create Section"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* SECTIONS TABLE */}
        <div className="mt-6 bg-white dark:bg-gray-800 shadow rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
            <h2 className="text-sm font-semibold">All Sections</h2>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {sortedList.length} section{sortedList.length !== 1 && "s"}
            </span>
          </div>

          <table className="w-full text-sm">
            <thead className="bg-gray-100 dark:bg-gray-800 dark:text-gray-200">
              <tr>
                <th className="p-3 text-left w-32">Type</th>
                <th className="p-3 text-left">Title</th>
                <th className="p-3 text-left">Subtitle</th>
                <th className="p-3 text-left">Extra</th>
                <th className="p-3 text-left w-24">Order</th>
                <th className="p-3 text-left w-40">Actions</th>
              </tr>
            </thead>

            <tbody>
              {sortedList.length === 0 && !loading && (
                <tr>
                  <td
                    colSpan="6"
                    className="text-center p-6 text-gray-500 dark:text-gray-400"
                  >
                    No sections found
                  </td>
                </tr>
              )}

              {sortedList.map((sec) => (
                <tr
                  key={sec._id}
                  className="border-t border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-900 transition"
                >
                  <td className="p-3 text-xs uppercase tracking-wide text-gray-600 dark:text-gray-300">
                    {sec.type}
                  </td>
                  <td className="p-3 font-medium">{sec.title}</td>
                  <td className="p-3 text-gray-600 dark:text-gray-300">
                    {sec.subtitle || "-"}
                  </td>
                  <td className="p-3 text-gray-600 dark:text-gray-300">
                    {sec.extra || "-"}
                  </td>
                  <td className="p-3">{sec.order}</td>

                  <td className="p-3">
                    <div className="flex gap-2">
                      <button
                        onClick={() => startEdit(sec)}
                        className="px-3 py-1 bg-yellow-500 text-white rounded text-xs hover:bg-yellow-600"
                      >
                        Edit
                      </button>

                      <button
                        onClick={() => handleDelete(sec._id)}
                        className="px-3 py-1 bg-red-600 text-white rounded text-xs hover:bg-red-700"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminSections;
