import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  CheckCircle2,
  Eye,
  EyeOff,
  FolderKanban,
  ImagePlus,
  LayoutGrid,
  PencilLine,
  Plus,
  Search,
  SlidersHorizontal,
  Trash2,
  X,
} from "lucide-react";
import {
  createCategory,
  deleteCategory,
  fetchAdminCategories,
  updateCategory,
} from "../../redux/slices/productSlice";

const emptyForm = {
  name: "",
  order: "",
  isActive: true,
  image: null,
};

const statCardClasses =
  "rounded-[28px] border border-red-100/80 bg-white/90 p-4 shadow-sm";

const CategoryManage = () => {
  const dispatch = useDispatch();
  const { adminCategories = [], loading, error } = useSelector(
    (s) => s.products || {}
  );

  const [editingId, setEditingId] = useState("");
  const [form, setForm] = useState(emptyForm);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    dispatch(fetchAdminCategories());
  }, [dispatch]);

  const sortedCategories = useMemo(
    () => [...adminCategories].sort((a, b) => (a.order || 0) - (b.order || 0)),
    [adminCategories]
  );

  const filteredCategories = useMemo(() => {
    const query = search.trim().toLowerCase();

    return sortedCategories.filter((category) => {
      const matchesSearch =
        !query || category.name?.toLowerCase().includes(query);

      const matchesStatus =
        statusFilter === "all"
          ? true
          : statusFilter === "active"
          ? category.isActive !== false
          : category.isActive === false;

      return matchesSearch && matchesStatus;
    });
  }, [search, sortedCategories, statusFilter]);

  const stats = useMemo(() => {
    const active = sortedCategories.filter((category) => category.isActive !== false).length;
    const withImages = sortedCategories.filter((category) => !!category.imageUrl).length;

    return {
      total: sortedCategories.length,
      active,
      hidden: sortedCategories.length - active,
      withImages,
    };
  }, [sortedCategories]);

  const selectedCategory = useMemo(
    () => sortedCategories.find((category) => category._id === editingId) || null,
    [editingId, sortedCategories]
  );

  const previewUrl = useMemo(() => {
    if (form.image) return URL.createObjectURL(form.image);
    return selectedCategory?.imageUrl || "";
  }, [form.image, selectedCategory]);

  useEffect(() => {
    if (!form.image) return undefined;

    return () => {
      URL.revokeObjectURL(previewUrl);
    };
  }, [form.image, previewUrl]);

  const resetForm = () => {
    setEditingId("");
    setForm(emptyForm);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return;

    const fd = new FormData();
    fd.append("name", form.name.trim());
    fd.append("order", form.order || 0);
    fd.append("isActive", String(form.isActive));
    if (form.image) fd.append("image", form.image);

    const result = editingId
      ? await dispatch(updateCategory(editingId, fd))
      : await dispatch(createCategory(fd));

    if (result?.ok) {
      resetForm();
      dispatch(fetchAdminCategories());
    }
  };

  const startEdit = (category) => {
    setEditingId(category._id);
    setForm({
      name: category.name || "",
      order: category.order ?? 0,
      isActive: category.isActive !== false,
      image: null,
    });
  };

  const handleDelete = async (category) => {
    if (!window.confirm(`Delete category "${category.name}"?`)) return;
    const result = await dispatch(deleteCategory(category._id));
    if (result?.ok) {
      dispatch(fetchAdminCategories());
      if (editingId === category._id) resetForm();
    }
  };

  return (
    <div className="rounded-[32px] border border-red-100/70 bg-white/75 p-5 text-gray-900 shadow-[0_24px_80px_rgba(15,23,42,0.06)] backdrop-blur-sm md:p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        <section className="grid gap-4 xl:grid-cols-[1.25fr_0.9fr]">
          <div className="overflow-hidden rounded-[32px] border border-red-100/80 bg-[linear-gradient(135deg,#991b1b_0%,#dc2626_52%,#fecaca_140%)] p-6 text-white shadow-[0_20px_60px_rgba(153,27,27,0.24)]">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-2xl">
                <p className="text-xs uppercase tracking-[0.34em] text-red-100/90">
                  Catalog / Categories
                </p>
                <h1 className="mt-3 text-3xl font-semibold sm:text-4xl">
                  Shape the storefront story
                </h1>
                <p className="mt-3 max-w-xl text-sm leading-6 text-red-50/90">
                  Build category tiles that feel curated, keep navigation clean,
                  and control what shoppers see first.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <div className="rounded-2xl border border-white/20 bg-white/10 p-3 backdrop-blur-sm">
                  <p className="text-[11px] uppercase tracking-[0.24em] text-red-100/80">
                    Total
                  </p>
                  <p className="mt-2 text-2xl font-semibold">{stats.total}</p>
                </div>
                <div className="rounded-2xl border border-white/20 bg-white/10 p-3 backdrop-blur-sm">
                  <p className="text-[11px] uppercase tracking-[0.24em] text-red-100/80">
                    Active
                  </p>
                  <p className="mt-2 text-2xl font-semibold">{stats.active}</p>
                </div>
                <div className="rounded-2xl border border-white/20 bg-white/10 p-3 backdrop-blur-sm">
                  <p className="text-[11px] uppercase tracking-[0.24em] text-red-100/80">
                    Hidden
                  </p>
                  <p className="mt-2 text-2xl font-semibold">{stats.hidden}</p>
                </div>
                <div className="rounded-2xl border border-white/20 bg-white/10 p-3 backdrop-blur-sm">
                  <p className="text-[11px] uppercase tracking-[0.24em] text-red-100/80">
                    With Image
                  </p>
                  <p className="mt-2 text-2xl font-semibold">{stats.withImages}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3 xl:grid-cols-1">
            <div className={statCardClasses}>
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-red-50 text-red-600">
                  <LayoutGrid className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">
                    Ordered presentation
                  </p>
                  <p className="text-xs text-gray-500">
                    Lower order values surface first.
                  </p>
                </div>
              </div>
            </div>

            <div className={statCardClasses}>
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                  <CheckCircle2 className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">
                    Storefront visibility
                  </p>
                  <p className="text-xs text-gray-500">
                    Toggle categories on or off without deleting them.
                  </p>
                </div>
              </div>
            </div>

            <div className={statCardClasses}>
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-50 text-amber-600">
                  <ImagePlus className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">
                    Visual consistency
                  </p>
                  <p className="text-xs text-gray-500">
                    Keep every category tile covered with an image.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="grid gap-6 xl:grid-cols-[390px_1fr]">
          <form
            onSubmit={handleSubmit}
            className="overflow-hidden rounded-[32px] border border-red-100 bg-white shadow-sm"
          >
            <div className="border-b border-red-100 bg-[linear-gradient(180deg,rgba(254,242,242,0.95),rgba(255,255,255,1))] p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.28em] text-red-500">
                    Editor
                  </p>
                  <h2 className="mt-2 text-2xl font-semibold text-gray-900">
                    {editingId ? "Refine category" : "Create category"}
                  </h2>
                  <p className="mt-2 text-sm text-gray-600">
                    Give each collection a sharp name, a hero image, and a clear
                    display order.
                  </p>
                </div>

                {editingId ? (
                  <button
                    type="button"
                    onClick={resetForm}
                    className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-red-100 text-gray-500 transition hover:bg-red-50"
                    aria-label="Close edit mode"
                  >
                    <X className="h-4 w-4" />
                  </button>
                ) : null}
              </div>
            </div>

            <div className="space-y-5 p-5">
              <div className="overflow-hidden rounded-[28px] border border-dashed border-red-200 bg-red-50/60">
                <div className="aspect-[4/3] overflow-hidden bg-[radial-gradient(circle_at_top,_rgba(254,202,202,0.7),transparent_55%),linear-gradient(180deg,rgba(255,255,255,0.85),rgba(254,242,242,1))]">
                  {previewUrl ? (
                    <img
                      src={previewUrl}
                      alt={form.name || selectedCategory?.name || "Category preview"}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full flex-col items-center justify-center gap-3 px-6 text-center">
                      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-red-500 shadow-sm">
                        <FolderKanban className="h-6 w-6" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900">
                          Visual preview
                        </p>
                        <p className="mt-1 text-xs leading-5 text-gray-500">
                          Upload artwork to preview how this category tile will feel.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700">
                  Category name
                </label>
                <input
                  className="input h-12 w-full rounded-2xl border border-red-100 bg-red-50/50 px-4 text-sm"
                  value={form.name}
                  onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                  placeholder="E.g. Oversized Tees"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-gray-700">
                    Display order
                  </label>
                  <input
                    type="number"
                    className="input h-12 w-full rounded-2xl border border-red-100 bg-red-50/50 px-4 text-sm"
                    value={form.order}
                    onChange={(e) => setForm((prev) => ({ ...prev, order: e.target.value }))}
                    placeholder="0"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-gray-700">
                    Cover image
                  </label>
                  <label className="flex h-12 cursor-pointer items-center gap-3 rounded-2xl border border-red-100 bg-red-50/50 px-4 text-sm text-gray-600 transition hover:bg-red-50">
                    <ImagePlus className="h-4 w-4 text-red-500" />
                    <span className="truncate">
                      {form.image ? form.image.name : "Choose image"}
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) =>
                        setForm((prev) => ({
                          ...prev,
                          image: e.target.files?.[0] || null,
                        }))
                      }
                    />
                  </label>
                </div>
              </div>

              <label className="flex items-center justify-between gap-4 rounded-2xl border border-red-100 bg-white p-4">
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    Active on storefront
                  </p>
                  <p className="mt-1 text-xs text-gray-500">
                    Hidden categories stay in admin tools but disappear from shoppers.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    setForm((prev) => ({ ...prev, isActive: !prev.isActive }))
                  }
                  className={`relative inline-flex h-8 w-14 items-center rounded-full transition ${
                    form.isActive ? "bg-red-600" : "bg-gray-300"
                  }`}
                  aria-pressed={form.isActive}
                >
                  <span
                    className={`inline-block h-6 w-6 rounded-full bg-white shadow-sm transition ${
                      form.isActive ? "translate-x-7" : "translate-x-1"
                    }`}
                  />
                </button>
              </label>

              <div className="flex flex-wrap gap-3 pt-1">
                <button
                  className="inline-flex items-center gap-2 rounded-2xl bg-red-600 px-4 py-3 text-sm font-medium text-white shadow-sm transition hover:bg-red-700"
                >
                  {editingId ? (
                    <PencilLine className="h-4 w-4" />
                  ) : (
                    <Plus className="h-4 w-4" />
                  )}
                  <span>
                    {loading
                      ? "Saving..."
                      : editingId
                      ? "Update Category"
                      : "Create Category"}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={resetForm}
                  className="rounded-2xl border border-red-100 px-4 py-3 text-sm font-medium text-gray-700 transition hover:bg-red-50"
                >
                  Reset
                </button>
              </div>

              {error ? <p className="text-sm text-red-600">{error}</p> : null}
            </div>
          </form>

          <section className="rounded-[32px] border border-red-100 bg-white p-5 shadow-sm">
            <div className="flex flex-col gap-4 border-b border-red-100 pb-4 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.28em] text-red-500">
                  Library
                </p>
                <h2 className="mt-2 text-2xl font-semibold text-gray-900">
                  Category collection
                </h2>
                <p className="mt-2 text-sm text-gray-600">
                  Search, audit visibility, and jump straight into edits.
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <div className="relative">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search categories"
                    className="input h-11 w-full min-w-[220px] rounded-2xl border border-red-100 bg-red-50/50 pl-9 pr-4 text-sm sm:w-[260px]"
                  />
                </div>

                <div className="flex items-center gap-2 rounded-2xl border border-red-100 bg-red-50/60 p-1">
                  <div className="flex items-center gap-1 px-2 text-xs font-medium text-red-600">
                    <SlidersHorizontal className="h-3.5 w-3.5" />
                    <span>Status</span>
                  </div>
                  {["all", "active", "hidden"].map((status) => (
                    <button
                      key={status}
                      type="button"
                      onClick={() => setStatusFilter(status)}
                      className={`rounded-xl px-3 py-2 text-xs font-medium capitalize transition ${
                        statusFilter === status
                          ? "bg-white text-red-700 shadow-sm"
                          : "text-gray-500 hover:bg-white/70"
                      }`}
                    >
                      {status}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
              <p>
                {loading
                  ? "Refreshing categories..."
                  : `${filteredCategories.length} of ${sortedCategories.length} categories shown`}
              </p>
              <span className="rounded-full border border-red-100 bg-red-50 px-3 py-1 text-xs font-medium text-red-700">
                Sorted by order
              </span>
            </div>

            {filteredCategories.length === 0 ? (
              <div className="mt-6 rounded-[28px] border border-dashed border-red-200 bg-red-50/40 px-6 py-14 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-red-500 shadow-sm">
                  <FolderKanban className="h-6 w-6" />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-gray-900">
                  No categories match
                </h3>
                <p className="mt-2 text-sm text-gray-500">
                  Adjust the search or status filter to see more items.
                </p>
              </div>
            ) : (
              <div className="mt-6 grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
                {filteredCategories.map((category) => {
                  const isEditing = editingId === category._id;

                  return (
                    <article
                      key={category._id}
                      className={`group overflow-hidden rounded-[28px] border transition ${
                        isEditing
                          ? "border-red-300 bg-red-50/40 shadow-[0_18px_40px_rgba(220,38,38,0.12)]"
                          : "border-red-100 bg-white hover:-translate-y-0.5 hover:shadow-[0_18px_36px_rgba(15,23,42,0.08)]"
                      }`}
                    >
                      <div className="relative aspect-[5/3] overflow-hidden bg-[linear-gradient(180deg,#fef2f2,#fff)]">
                        {category.imageUrl ? (
                          <img
                            src={category.imageUrl}
                            alt={category.name}
                            className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
                          />
                        ) : (
                          <div className="flex h-full flex-col items-center justify-center gap-2 text-center">
                            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-red-500 shadow-sm">
                              <ImagePlus className="h-5 w-5" />
                            </div>
                            <p className="text-xs uppercase tracking-[0.24em] text-gray-400">
                              No image
                            </p>
                          </div>
                        )}

                        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/45 to-transparent p-4">
                          <div className="flex items-end justify-between gap-3 text-white">
                            <div>
                              <p className="text-lg font-semibold">{category.name}</p>
                              <p className="mt-1 text-xs uppercase tracking-[0.24em] text-white/80">
                                Display order {category.order ?? 0}
                              </p>
                            </div>
                            <span
                              className={`rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] ${
                                category.isActive !== false
                                  ? "bg-emerald-400/90 text-emerald-950"
                                  : "bg-white/90 text-gray-700"
                              }`}
                            >
                              {category.isActive !== false ? "Active" : "Hidden"}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4 p-4">
                        <div className="flex items-center justify-between rounded-2xl border border-red-100 bg-red-50/50 px-4 py-3">
                          <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                            {category.isActive !== false ? (
                              <Eye className="h-4 w-4 text-emerald-600" />
                            ) : (
                              <EyeOff className="h-4 w-4 text-gray-500" />
                            )}
                            <span>
                              {category.isActive !== false
                                ? "Visible to shoppers"
                                : "Hidden from shoppers"}
                            </span>
                          </div>
                          {isEditing ? (
                            <span className="rounded-full bg-white px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-red-700 shadow-sm">
                              Editing
                            </span>
                          ) : null}
                        </div>

                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => startEdit(category)}
                            className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl bg-red-600 px-4 py-3 text-sm font-medium text-white transition hover:bg-red-700"
                          >
                            <PencilLine className="h-4 w-4" />
                            <span>Edit</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(category)}
                            className="inline-flex items-center justify-center rounded-2xl border border-red-100 px-4 py-3 text-gray-600 transition hover:bg-red-50 hover:text-red-700"
                            aria-label={`Delete ${category.name}`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
};

export default CategoryManage;
