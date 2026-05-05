import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  getSections,
  createSection,
  updateSection,
  deleteSection,
} from "../../redux/slices/sectionSlice.jsx";
import { SECTION_TYPES } from "../../assets/assets.js";
import {
  LayoutPanelTop,
  Plus,
  Pencil,
  Trash2,
  X,
  ArrowUpDown,
  Sparkles,
} from "lucide-react";

const cardClass =
  "rounded-[1.8rem] border border-white/60 bg-white/95 p-4 shadow-[0_18px_40px_rgba(15,23,42,0.06)] backdrop-blur-sm sm:p-6";
const inputClass =
  "w-full rounded-2xl border border-slate-200 bg-[#fbfaf7] px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-[#B21A15] focus:bg-white";
const labelClass = "text-sm font-semibold text-slate-800";
const helperClass = "text-xs leading-5 text-slate-500";

const emptyForm = {
  type: "",
  title: "",
  subtitle: "",
  extra: "",
  order: 0,
};

const AdminSections = () => {
  const dispatch = useDispatch();
  const { list = [], loading, error } = useSelector((state) => state.sections);

  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    dispatch(getSections());
  }, [dispatch]);

  const startCreate = () => {
    setForm(emptyForm);
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

  const sortedList = useMemo(
    () => [...list].sort((a, b) => (a.order || 0) - (b.order || 0)),
    [list]
  );

  return (
    <div className="rounded-[28px] border border-red-100/70 bg-white/80 p-4 shadow-[0_24px_80px_rgba(15,23,42,0.06)] backdrop-blur-sm sm:rounded-[32px] sm:p-6">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-[#B21A15]">
              Homepage / Sections
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
              Home Sections
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600">
              Shape the homepage flow by arranging hero blocks, banners, collections, and supporting content with cleaner controls.
            </p>
          </div>

          <button
            onClick={startCreate}
            className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#B21A15] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#97150f] sm:w-auto"
          >
            <Plus className="h-4 w-4" />
            Add Section
          </button>
        </div>

        <div className="mb-6 grid gap-3 sm:grid-cols-3">
          <div className="rounded-[1.5rem] border border-white/70 bg-white/80 px-4 py-4 shadow-sm">
            <p className="text-[11px] uppercase tracking-[0.18em] text-slate-500">
              Total Sections
            </p>
            <p className="mt-2 text-xl font-semibold text-slate-950">{sortedList.length}</p>
          </div>
          <div className="rounded-[1.5rem] border border-white/70 bg-white/80 px-4 py-4 shadow-sm">
            <p className="text-[11px] uppercase tracking-[0.18em] text-slate-500">
              First Block
            </p>
            <p className="mt-2 text-xl font-semibold text-slate-950">
              {sortedList[0]?.type || "--"}
            </p>
          </div>
          <div className="rounded-[1.5rem] border border-white/70 bg-white/80 px-4 py-4 shadow-sm">
            <p className="text-[11px] uppercase tracking-[0.18em] text-slate-500">
              Status
            </p>
            <p className="mt-2 text-xl font-semibold text-slate-950">
              {loading ? "Syncing" : "Ready"}
            </p>
          </div>
        </div>

        {(loading || error) && (
          <div className="mb-5">
            {loading ? (
              <p className="text-sm text-slate-500">Loading sections...</p>
            ) : null}
            {error ? (
              <p className="text-sm text-red-500">
                {typeof error === "string" ? error : "Failed to load sections"}
              </p>
            ) : null}
          </div>
        )}

        {showForm && (
          <div className="fixed inset-0 z-40 flex items-end justify-center bg-black/35 p-0 sm:items-center sm:px-4">
            <div className="w-full max-w-xl rounded-t-[2rem] border border-white/40 bg-white p-4 shadow-[0_30px_90px_rgba(15,23,42,0.18)] sm:rounded-[2rem] sm:p-6">
              <div className="mb-5 flex items-start justify-between gap-4">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#B21A15]">
                    {editing ? "Sections / Edit" : "Sections / New"}
                  </p>
                  <h2 className="mt-2 text-2xl font-semibold text-slate-950">
                    {editing ? "Edit Section" : "Create Section"}
                  </h2>
                  <p className="mt-2 text-sm text-slate-500">
                    Define the type, copy, and display order for this homepage block.
                  </p>
                </div>
                <button
                  onClick={closeForm}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 text-slate-500 transition hover:bg-slate-50"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className={labelClass}>Section Type</label>
                  <select
                    className={`${inputClass} mt-2`}
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

                <div>
                  <label className={labelClass}>Title</label>
                  <input
                    className={`${inputClass} mt-2`}
                    placeholder="Section title"
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <label className={labelClass}>Subtitle</label>
                  <input
                    className={`${inputClass} mt-2`}
                    placeholder="Optional subtitle"
                    value={form.subtitle}
                    onChange={(e) => setForm({ ...form, subtitle: e.target.value })}
                  />
                </div>

                <div>
                  <label className={labelClass}>Extra Small Text</label>
                  <input
                    className={`${inputClass} mt-2`}
                    placeholder="Optional supporting text"
                    value={form.extra}
                    onChange={(e) => setForm({ ...form, extra: e.target.value })}
                  />
                </div>

                <div>
                  <label className={labelClass}>Display Order</label>
                  <input
                    className={`${inputClass} mt-2`}
                    placeholder="0, 1, 2..."
                    type="number"
                    value={form.order}
                    onChange={(e) =>
                      setForm({ ...form, order: Number(e.target.value) })
                    }
                  />
                  <p className={`mt-2 ${helperClass}`}>
                    Lower numbers appear earlier on the homepage.
                  </p>
                </div>

                <div className="flex flex-col-reverse justify-end gap-3 pt-2 sm:flex-row">
                  <button
                    type="button"
                    className="rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-[#faf7f2]"
                    onClick={closeForm}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="rounded-full bg-[#B21A15] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#97150f]"
                  >
                    {editing ? "Update Section" : "Create Section"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        <div className={`${cardClass} overflow-hidden p-0`}>
          <div className="flex flex-col gap-3 border-b border-slate-100 px-6 py-5 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-950">Section Stack</h2>
              <p className="mt-1 text-sm text-slate-500">
                Manage order, copy, and placement of each homepage section.
              </p>
            </div>
            <div className="inline-flex items-center gap-2 rounded-full bg-[#fbfaf7] px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
              <ArrowUpDown className="h-3.5 w-3.5" />
              Sorted by Order
            </div>
          </div>

          {sortedList.length === 0 && !loading ? (
            <div className="px-6 py-14 text-center text-sm text-slate-500">
              No sections found.
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {sortedList.map((sec) => (
                <div
                  key={sec._id}
                  className="grid gap-4 px-4 py-5 transition hover:bg-[#fcfaf7] sm:px-6 lg:grid-cols-[220px_minmax(0,1fr)_140px_220px]"
                >
                  <div>
                    <span className="inline-flex items-center gap-2 rounded-full bg-[#fff5f2] px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-[#B21A15]">
                      <LayoutPanelTop className="h-3.5 w-3.5" />
                      {sec.type}
                    </span>
                  </div>

                  <div className="min-w-0">
                    <p className="font-semibold text-slate-950">{sec.title}</p>
                    <p className="mt-1 text-sm text-slate-500">
                      {sec.subtitle || "No subtitle"}
                    </p>
                    <p className="mt-2 text-xs uppercase tracking-[0.14em] text-slate-400">
                      {sec.extra || "No extra text"}
                    </p>
                  </div>

                  <div>
                    <p className="text-[11px] uppercase tracking-[0.18em] text-slate-500">
                      Order
                    </p>
                    <p className="mt-2 text-xl font-semibold text-slate-950">
                      {sec.order ?? 0}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 lg:justify-end">
                    <button
                      onClick={() => startEdit(sec)}
                      className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-4 py-2 text-sm font-semibold text-amber-700 transition hover:bg-amber-100"
                    >
                      <Pencil className="h-4 w-4" />
                      Edit
                    </button>

                    <button
                      onClick={() => handleDelete(sec._id)}
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

        <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className={cardClass}>
            <h3 className="text-xl font-semibold text-slate-950">Structure Tips</h3>
            <div className="mt-4 space-y-4 text-sm leading-6 text-slate-600">
              <p>Keep order values spaced out so it’s easy to insert new sections later without renumbering everything.</p>
              <p>Use short, distinct titles to make section management easier when multiple homepage blocks have similar themes.</p>
              <p>Extra text works best as a small helper line rather than a second subtitle.</p>
            </div>
          </div>

          <div className={cardClass}>
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#B21A15]">
              Quick Snapshot
            </p>
            <div className="mt-5 space-y-3">
              {sortedList.slice(0, 3).map((sec) => (
                <div
                  key={sec._id}
                  className="rounded-[1.4rem] bg-[#fbfaf7] px-4 py-4"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-semibold text-slate-900">{sec.title}</p>
                      <p className="mt-1 text-sm text-slate-500">{sec.type}</p>
                    </div>
                    <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-500">
                      #{sec.order ?? 0}
                    </span>
                  </div>
                </div>
              ))}
              {sortedList.length === 0 ? (
                <div className="rounded-[1.4rem] bg-[#fbfaf7] px-4 py-4 text-sm text-slate-500">
                  Add your first section to start shaping the homepage flow.
                </div>
              ) : null}
              {sortedList.length > 3 ? (
                <div className="inline-flex items-center gap-2 rounded-full bg-[#fff5f2] px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-[#B21A15]">
                  <Sparkles className="h-3.5 w-3.5" />
                  {sortedList.length - 3} more section{sortedList.length - 3 !== 1 ? "s" : ""}
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSections;
