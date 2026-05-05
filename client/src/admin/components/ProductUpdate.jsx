import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchAdminCategories,
  fetchProductById,
  updateProduct,
  suggestSKU,
} from "../../redux/slices/productSlice.jsx";
import { useParams, useNavigate } from "react-router";
import { ArrowLeft } from "lucide-react";
import {materialOptions, sexOptions, fabricWeights, patternOptions, fitOptions, neckOptions, sleeveOptions, collectionsList} from "../../assets/assets.js";

/* SIZE ORDER */
const sizeOrder = ["XS", "S", "M", "L", "XL", "XXL", "XXXL"];
const sizeBatchCount = 2;
const priceStep = 100;

const getNextSize = (current) => {
  if (!current) return "S";
  const i = sizeOrder.indexOf(current.toUpperCase());
  return i !== -1 && sizeOrder[i + 1] ? sizeOrder[i + 1] : "";
};

const cardClass =
  "rounded-[1.8rem] border border-white/60 bg-white/95 p-4 shadow-[0_18px_40px_rgba(15,23,42,0.06)] backdrop-blur-sm sm:p-6";
const labelClass = "text-sm font-semibold text-slate-800";
const helperClass = "text-xs leading-5 text-slate-500";
const inputClass =
  "w-full rounded-2xl border border-slate-200 bg-[#fbfaf7] px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-[#B21A15] focus:bg-white";

const buildAutoSizeBatch = (sizes = []) => {
  const filledSizes = sizes.filter((size) => size.size?.trim());
  const lastSize = filledSizes[filledSizes.length - 1];
  const lastIndex = sizeOrder.indexOf(lastSize?.size?.toUpperCase() || "");

  if (lastIndex === -1) return [];

  const nextSizes = sizeOrder.slice(lastIndex + 1, lastIndex + 1 + sizeBatchCount);
  const baseStock = lastSize?.stock ?? "";
  const basePrice = Number(lastSize?.price || 0);
  const usePriceStep = lastIndex >= sizeOrder.indexOf("M");

  return nextSizes.map((size, index) => ({
    size,
    stock: baseStock,
    price: usePriceStep
      ? String(basePrice + priceStep * (index + 1))
      : String(lastSize?.price ?? ""),
  }));
};

const ProductUpdate = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const dispatch = useDispatch();
  const { product, loading, adminCategories = [] } = useSelector((s) => s.products);

  const [form, setForm] = useState(null);
  const [existingImages, setExistingImages] = useState([]);
  const [removedImages, setRemovedImages] = useState([]);
  const [newImages, setNewImages] = useState([null, null, null, null, null]);
  const [sizeChart, setSizeChart] = useState([
    { size: "", length: "", width: "", chest: "" },
  ]);

  const [colors, setColors] = useState([
    { name: "", hex: "#000000", images: [], sizes: [{ size: "", stock: "", price: "" }] },
  ]);
  const [removedColorImagesMap, setRemovedColorImagesMap] = useState({});
  const [newColorImages, setNewColorImages] = useState([Array(5).fill(null)]);

  /* NEW: COLLECTIONS */
  const [collections, setCollections] = useState([]);

  const emptyColor = () => ({
    name: "",
    hex: "#000000",
    images: [],
    sizes: [{ size: "", stock: "", price: "" }],
  });

  /* FETCH */
  useEffect(() => {
    if (!id) return;
    dispatch(fetchProductById(id));
  }, [id, dispatch]);

  useEffect(() => {
    dispatch(fetchAdminCategories());
  }, [dispatch]);

  /* LOAD PRODUCT */
  useEffect(() => {
    if (!product) return;

    setForm({
      title: product.title || "",
      sku: product.sku || "",
      description: product.description || "",
      category: product.category || "",
      sexCategory: product.sexCategory || "",
      material: product.material || "",
      fabricWeight: product.fabricWeight || "",
      pattern: product.pattern || "",
      fitType: product.fitType || "",
      neckType: product.neckType || "",
      sleeveType: product.sleeveType || "",
      tags: Array.isArray(product.tags)
        ? product.tags.join(", ")
        : product.tags || "",
      featured: !!product.featured,
      flashSale: !!product.flashSale,
      discount: product.discount ?? 0,
      limitedEdition: !!product.limitedEdition,
    });

    setCollections(Array.isArray(product.collections) ? [...product.collections] : []);

    setExistingImages(Array.isArray(product.images) ? [...product.images] : []);
    setSizeChart(
      Array.isArray(product.sizeChart) && product.sizeChart.length
        ? product.sizeChart.map((row) => ({
            size: row.size || "",
            length: row.length ?? "",
            width: row.width ?? "",
            chest: row.chest ?? "",
          }))
        : [{ size: "", length: "", width: "", chest: "" }]
    );
    setRemovedImages([]);
    setNewImages([null, null, null, null, null]);

    const loadedColors = Array.isArray(product.colors)
      ? product.colors.map((c) => ({
          name: c.name || "",
          hex: c.hex || "#000000",
          images: Array.isArray(c.images) ? [...c.images] : [],
          sizes:
            Array.isArray(c.sizes) && c.sizes.length
              ? c.sizes.map((size) => ({
                  size: size.size || "",
                  stock: size.stock ?? "",
                  price: size.price ?? "",
                }))
              : [{ size: "", stock: "", price: "" }],
        }))
      : [emptyColor()];

    setColors(loadedColors);

    const initRemovedMap = {};
    loadedColors.forEach((_, i) => (initRemovedMap[i] = new Set()));
    setRemovedColorImagesMap(initRemovedMap);

    setNewColorImages(loadedColors.map(() => Array(5).fill(null)));
  }, [product]);

  /* AUTO TAGS */
  const autoTags = (u) => {
    const arr = [];
    if (u.title) arr.push(u.title);
    if (u.category) arr.push(u.category);
    if (u.sexCategory) arr.push(u.sexCategory + " Wear");
    if (u.material) arr.push(u.material);
    if (u.fabricWeight) arr.push(u.fabricWeight);
    if (u.pattern) arr.push(u.pattern);
    if (u.fitType) arr.push(u.fitType);
    if (u.neckType) arr.push(u.neckType);
    if (u.sleeveType) arr.push(u.sleeveType);

    u.tags = [...new Set(arr)].join(", ");
  };

  const updateField = (key, value, regen = true) => {
    setForm((prev) => {
      const u = { ...prev, [key]: value };
      if (regen) autoTags(u);
      return u;
    });
  };

  const trySuggestSKU = async (title) => {
    if (!title) return;
    const out = await dispatch(suggestSKU(title));
    if (out) setForm((prev) => ({ ...prev, sku: out }));
  };

  const updateColorSize = (colorIndex, sizeIndex, key, value) => {
    setColors((prev) => {
      return prev.map((color, currentColorIndex) => {
        if (currentColorIndex !== colorIndex) return color;

        return {
          ...color,
          sizes: (color.sizes || []).map((size, currentSizeIndex) =>
            currentSizeIndex === sizeIndex ? { ...size, [key]: value } : size
          ),
        };
      });
    });
  };

  const updateSizeChartRow = (index, key, value) => {
    setSizeChart((prev) => {
      return prev.map((row, currentIndex) =>
        currentIndex === index ? { ...row, [key]: value } : row
      );
    });
  };

  const addSizeChartRow = () => {
    setSizeChart((prev) => [
      ...prev,
      {
        size: getNextSize(prev[prev.length - 1]?.size || ""),
        length: "",
        width: "",
        chest: "",
      },
    ]);
  };

  const removeSizeChartRow = (index) => {
    if (sizeChart.length === 1) return;
    setSizeChart((prev) => prev.filter((_, idx) => idx !== index));
  };

  const addColorSizeRow = (colorIndex) => {
    setColors((prev) => {
      return prev.map((color, currentColorIndex) => {
        if (currentColorIndex !== colorIndex) return color;

        const current = color.sizes || [];
        const autoBatch = buildAutoSizeBatch(current);

        return {
          ...color,
          sizes:
            autoBatch.length > 0
              ? [...current, ...autoBatch]
              : [
                  ...current,
                  {
                    size: getNextSize(current[current.length - 1]?.size || ""),
                    stock: "",
                    price: "",
                  },
                ],
        };
      });
    });
  };

  const removeColorSizeRow = (colorIndex, sizeIndex) => {
    setColors((prev) => {
      if ((prev[colorIndex]?.sizes || []).length === 1) return prev;

      return prev.map((color, currentColorIndex) => {
        if (currentColorIndex !== colorIndex) return color;

        return {
          ...color,
          sizes: (color.sizes || []).filter((_, idx) => idx !== sizeIndex),
        };
      });
    });
  };

  /* SUBMIT */
  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!form) return;

    const fd = new FormData();

    /* BASIC FIELDS */
    [
      "title",
      "sku",
      "description",
      "category",
      "sexCategory",
      "material",
      "fabricWeight",
      "pattern",
      "fitType",
      "neckType",
      "sleeveType",
      "featured",
      "flashSale",
      "discount",
      "limitedEdition",
    ].forEach((k) => fd.append(k, form[k]));

    /* TAGS */
    fd.append(
      "tags",
      JSON.stringify(
        form.tags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean)
      )
    );

    const cleanColors = colors
      .filter((color) => color.name.trim())
      .map((color) => ({
        name: color.name.trim(),
        hex: color.hex,
        sizes: (color.sizes || [])
          .filter((size) => size.size && size.price)
          .map((size) => ({
            size: size.size,
            stock: Number(size.stock || 0),
            price: Number(size.price || 0),
          })),
      }))
      .filter((color) => color.sizes.length > 0);

    const summarySizes = cleanColors.reduce((acc, color) => {
      color.sizes.forEach((size) => {
        const existing = acc.find((entry) => entry.size === size.size);
        if (existing) {
          existing.stock += Number(size.stock || 0);
          existing.price = Math.min(existing.price, Number(size.price || 0));
        } else {
          acc.push({ ...size });
        }
      });
      return acc;
    }, []);

    /* SIZES */
    fd.append("sizes", JSON.stringify(summarySizes));
    fd.append(
      "sizeChart",
      JSON.stringify(
        sizeChart
          .filter((row) => row.size)
          .map((row) => ({
            size: row.size,
            length: Number(row.length || 0),
            width: Number(row.width || 0),
            chest: Number(row.chest || 0),
          }))
      )
    );

    /* COLORS (meta + sizes) */
    fd.append(
      "colors",
      JSON.stringify(cleanColors)
    );

    /* NEW: COLLECTIONS */
    fd.append("collections", JSON.stringify(collections));

    /* REMOVED GLOBAL IMAGES */
    fd.append("removedImages", JSON.stringify(removedImages));

    /* REMOVED COLOR IMAGES */
    const removedColorPayload = [];
    Object.keys(removedColorImagesMap).forEach((key) => {
      const set = removedColorImagesMap[key];
      if (set.size) {
        removedColorPayload.push({
          colorIndex: Number(key),
          removedUrls: Array.from(set),
        });
      }
    });
    fd.append("removedColorImages", JSON.stringify(removedColorPayload));

    /* NEW GLOBAL IMAGES */
    newImages.forEach((file) => file && fd.append("images", file));

    /* NEW COLOR IMAGES */
    newColorImages.forEach((arr, colorIndex) => {
      arr.forEach((file) => {
        if (file) fd.append(`colorImages_${colorIndex}`, file);
      });
    });

    const result = await dispatch(updateProduct(id, fd));
    if (result?.ok) {
      navigate("/admin/products/manage");
    }
  };

  if (!form) {
    return (
      <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(178,26,21,0.08),_transparent_28%),linear-gradient(180deg,_#f8f4ef_0%,_#f1ebe4_100%)] p-3 text-slate-900 sm:p-5">
        <div className="mx-auto max-w-7xl rounded-[1.8rem] border border-white/60 bg-white/95 p-8 text-center shadow-[0_18px_40px_rgba(15,23,42,0.06)]">
          Loading...
        </div>
      </div>
    );
  }

  const activeColors = colors.filter((color) => color.name.trim() !== "").length;
  const validSizes = colors.flatMap((color) =>
    (color.name.trim() ? color.sizes || [] : []).filter(
      (size) => size.size && size.price
    )
  );
  const previewPrice = validSizes.length
    ? Math.min(...validSizes.map((size) => Number(size.price || 0)))
    : 0;
  const totalStock = validSizes.reduce(
    (sum, size) => sum + Number(size.stock || 0),
    0
  );
  const uploadedGalleryCount = existingImages.filter(Boolean).length + newImages.filter(Boolean).length;

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(178,26,21,0.08),_transparent_28%),linear-gradient(180deg,_#f8f4ef_0%,_#f1ebe4_100%)] p-3 text-slate-900 sm:p-5">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/80 px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-white"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </button>
            <p className="mt-4 text-[11px] font-semibold uppercase tracking-[0.3em] text-[#B21A15]">
              Products / Manage
            </p>
            <div className="mt-2 flex flex-wrap items-center gap-3">
              <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                Update Product
              </h1>
              <span className="rounded-full border border-white/70 bg-white/80 px-4 py-2 text-xs font-semibold tracking-[0.18em] text-slate-500">
                ID: {id}
              </span>
            </div>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600">
              Refine merchandising details, inventory by color, imagery, and campaign settings with the same layout as the create flow.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-[1.5rem] border border-white/70 bg-white/80 px-4 py-4 shadow-sm">
              <p className="text-[11px] uppercase tracking-[0.18em] text-slate-500">
                Starting Price
              </p>
              <p className="mt-2 text-xl font-semibold">
                {previewPrice ? `Rs. ${previewPrice}` : "--"}
              </p>
            </div>
            <div className="rounded-[1.5rem] border border-white/70 bg-white/80 px-4 py-4 shadow-sm">
              <p className="text-[11px] uppercase tracking-[0.18em] text-slate-500">
                Stock Preview
              </p>
              <p className="mt-2 text-xl font-semibold">{totalStock}</p>
            </div>
            <div className="rounded-[1.5rem] border border-white/70 bg-white/80 px-4 py-4 shadow-sm">
              <p className="text-[11px] uppercase tracking-[0.18em] text-slate-500">
                Variants
              </p>
              <p className="mt-2 text-xl font-semibold">{activeColors}</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleUpdate} className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
          <div className="space-y-6">
          {/* BASIC INFO */}
          <section className={cardClass}>
            <div className="mb-5">
              <div>
                <h2 className="text-xl font-semibold">Basic Information</h2>
                <p className={`mt-1 ${helperClass}`}>
                  Name your product and define its primary category.
                </p>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-1">
                <label className={labelClass}>Product Title</label>
                <input
                  className={`${inputClass} mt-2`}
                  placeholder="E.g. Minimal Oversized Tee"
                  value={form.title}
                  onChange={(e) => updateField("title", e.target.value)}
                  onBlur={(e) => trySuggestSKU(e.target.value)}
                />
                <p className={`mt-2 ${helperClass}`}>
                  This is what customers see in listings and search.
                </p>
              </div>

              <div className="space-y-1">
                <label className={labelClass}>SKU</label>
                <input
                  className={`${inputClass} mt-2`}
                  placeholder="Auto-suggested or custom SKU"
                  value={form.sku}
                  onChange={(e) => updateField("sku", e.target.value, false)}
                />
                <p className={`mt-2 ${helperClass}`}>
                  Keep it unique to make inventory easier to track.
                </p>
              </div>
            </div>

            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <div className="space-y-1">
                <label className={labelClass}>Category</label>
                <select
                  className={`${inputClass} mt-2`}
                  value={form.category}
                  onChange={(e) => updateField("category", e.target.value)}
                >
                  <option value="">Select Category</option>
                  {adminCategories.map((c) => (
                    <option key={c._id} value={c.name}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className={labelClass}>Tags</label>
                <input
                  className={`${inputClass} mt-2`}
                  placeholder="Tags (editable, comma separated)"
                  value={form.tags}
                  onChange={(e) => updateField("tags", e.target.value, false)}
                />
                <p className={`mt-2 ${helperClass}`}>
                  Used for search & recommendations. Auto-updated from fields.
                </p>
              </div>
            </div>
          </section>

          <section className={cardClass}>
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold">Size Chart</h2>
                <p className={`mt-1 ${helperClass}`}>
                  Add garment measurements like length, width, and chest for each size.
                </p>
              </div>
              <button
                type="button"
                onClick={addSizeChartRow}
                className="rounded-full border border-slate-200 bg-[#fbfaf7] px-4 py-2 text-xs font-semibold text-slate-700 transition hover:border-slate-300"
              >
                Add Chart Row
              </button>
            </div>

            <div className="space-y-3">
              {sizeChart.map((row, index) => (
                <div
                  key={index}
                  className="grid gap-3 rounded-[1.3rem] border border-slate-200 bg-[#fbfaf7] p-4 md:grid-cols-[1fr_1fr_1fr_1fr_auto]"
                >
                  <input
                    className={inputClass}
                    placeholder="Size"
                    value={row.size}
                    onChange={(e) =>
                      updateSizeChartRow(index, "size", e.target.value.toUpperCase())
                    }
                  />
                  <input
                    className={inputClass}
                    placeholder="Length"
                    type="number"
                    value={row.length}
                    onChange={(e) => updateSizeChartRow(index, "length", e.target.value)}
                  />
                  <input
                    className={inputClass}
                    placeholder="Width"
                    type="number"
                    value={row.width}
                    onChange={(e) => updateSizeChartRow(index, "width", e.target.value)}
                  />
                  <input
                    className={inputClass}
                    placeholder="Chest"
                    type="number"
                    value={row.chest}
                    onChange={(e) => updateSizeChartRow(index, "chest", e.target.value)}
                  />
                  <div className="flex items-center justify-end">
                    {index > 0 && (
                      <button
                        type="button"
                        className="text-sm font-medium text-red-500"
                        onClick={() => removeSizeChartRow(index)}
                      >
                        Remove
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* COLLECTIONS */}
          <section className={cardClass}>
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold">Collections</h2>
                <p className={`mt-1 ${helperClass}`}>
                  Add this product to themed collections for easier discovery.
                </p>
              </div>
              <span className="rounded-full bg-[#f7eee8] px-3 py-1 text-xs font-semibold text-[#B21A15]">
                {collections.length} selected
              </span>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {collectionsList.map((c) => (
                <label
                  key={c}
                  className={`flex cursor-pointer items-center gap-3 rounded-2xl border px-4 py-3 text-sm transition ${
                    collections.includes(c)
                      ? "border-[#B21A15] bg-[#fff5f2] text-[#7f1f18]"
                      : "border-slate-200 bg-[#fbfaf7] text-slate-700 hover:border-slate-300"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={collections.includes(c)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setCollections([...collections, c]);
                      } else {
                        setCollections(collections.filter((col) => col !== c));
                      }
                    }}
                  />
                  <span className="truncate">{c}</span>
                </label>
              ))}
            </div>
          </section>

          {/* ATTRIBUTES */}
          <section className={cardClass}>
            <div className="mb-5">
              <div>
                <h2 className="text-xl font-semibold">Product Attributes</h2>
                <p className={`mt-1 ${helperClass}`}>
                  Define the type, feel, and style of this product.
                </p>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-1">
                <label className={labelClass}>Gender</label>
                <select
                  className={`${inputClass} mt-2`}
                  value={form.sexCategory}
                  onChange={(e) => updateField("sexCategory", e.target.value)}
                >
                  <option value="">Select Gender</option>
                  {sexOptions.map((opt) => (
                    <option key={opt}>{opt}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className={labelClass}>Material</label>
                <select
                  className={`${inputClass} mt-2`}
                  value={form.material}
                  onChange={(e) => updateField("material", e.target.value)}
                >
                  <option value="">Select Material</option>
                  {materialOptions.map((m) => (
                    <option key={m}>{m}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className={labelClass}>Fabric GSM</label>
                <select
                  className={`${inputClass} mt-2`}
                  value={form.fabricWeight}
                  onChange={(e) => updateField("fabricWeight", e.target.value)}
                >
                  <option value="">Select GSM</option>
                  {fabricWeights.map((w) => (
                    <option key={w}>{w}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className={labelClass}>Pattern</label>
                <select
                  className={`${inputClass} mt-2`}
                  value={form.pattern}
                  onChange={(e) => updateField("pattern", e.target.value)}
                >
                  <option value="">Select Pattern</option>
                  {patternOptions.map((p) => (
                    <option key={p}>{p}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className={labelClass}>Fit Type</label>
                <select
                  className={`${inputClass} mt-2`}
                  value={form.fitType}
                  onChange={(e) => updateField("fitType", e.target.value)}
                >
                  <option value="">Select Fit</option>
                  {fitOptions.map((f) => (
                    <option key={f}>{f}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className={labelClass}>Neck Type</label>
                <select
                  className={`${inputClass} mt-2`}
                  value={form.neckType}
                  onChange={(e) => updateField("neckType", e.target.value)}
                >
                  <option value="">Select Neck</option>
                  {neckOptions.map((n) => (
                    <option key={n}>{n}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className={labelClass}>Sleeve Type</label>
                <select
                  className={`${inputClass} mt-2`}
                  value={form.sleeveType}
                  onChange={(e) => updateField("sleeveType", e.target.value)}
                >
                  <option value="">Select Sleeve</option>
                  {sleeveOptions.map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
              </div>
            </div>
          </section>

          {/* DESCRIPTION */}
          <section className={cardClass}>
            <h2 className="text-xl font-semibold">Description</h2>
            <p className={`mt-1 ${helperClass}`}>
              Highlight what makes this piece special. Keep it punchy but clear.
            </p>
            <textarea
              className={`${inputClass} mt-4 h-32 resize-none`}
              value={form.description}
              onChange={(e) => updateField("description", e.target.value, false)}
            />
          </section>

          {/* SIZES */}
          <section className={cardClass}>
            <div className="mb-5">
              <div>
                <h2 className="text-xl font-semibold">Inventory By Color</h2>
                <p className={`mt-1 ${helperClass}`}>
                  Manage sizes, stock, and pricing inside each color variant.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              {colors.map((c, colorIndex) => (
                <div
                  key={colorIndex}
                  className="rounded-[1.5rem] border border-slate-200 bg-[#fbfaf7] p-4"
                >
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-slate-900">
                        {c.name || `Color ${colorIndex + 1}`}
                      </p>
                      <p className="text-xs text-slate-500">
                        These rows apply only to this color.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => addColorSizeRow(colorIndex)}
                      className="rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 transition hover:border-slate-300"
                    >
                      + Add Size
                    </button>
                  </div>

                  <div className="space-y-2">
                    <div className="grid grid-cols-3 gap-3 text-xs font-medium text-slate-500">
                      <span>Size</span>
                      <span>Stock</span>
                      <span>Price</span>
                    </div>

                    {(c.sizes || []).map((s, sizeIndex) => (
                      <div
                        key={sizeIndex}
                        className="grid gap-3 rounded-[1.3rem] border border-slate-200 bg-white p-4 md:grid-cols-[1fr_1fr_1fr_auto]"
                      >
                        <input
                          className={inputClass}
                          value={s.size}
                          placeholder="Size"
                          onChange={(e) =>
                            updateColorSize(
                              colorIndex,
                              sizeIndex,
                              "size",
                              e.target.value.toUpperCase()
                            )
                          }
                        />
                        <input
                          className={inputClass}
                          value={s.stock}
                          type="number"
                          placeholder="Stock"
                          onChange={(e) =>
                            updateColorSize(
                              colorIndex,
                              sizeIndex,
                              "stock",
                              e.target.value
                            )
                          }
                        />
                        <input
                          className={inputClass}
                          value={s.price}
                          type="number"
                          placeholder="Price"
                          onChange={(e) =>
                            updateColorSize(
                              colorIndex,
                              sizeIndex,
                              "price",
                              e.target.value
                            )
                          }
                        />
                        <div className="flex justify-end">
                          {sizeIndex > 0 ? (
                            <button
                              type="button"
                              className="text-sm font-medium text-red-500"
                              onClick={() => removeColorSizeRow(colorIndex, sizeIndex)}
                            >
                              Remove
                            </button>
                          ) : null}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* FLAGS / PROMOTIONS */}
          <section className={cardClass}>
            <div className="mb-5">
              <h2 className="text-xl font-semibold">Visibility & Promotions</h2>
              <p className={`mt-1 ${helperClass}`}>
                Control discoverability and promotional settings for this product.
              </p>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={form.featured}
                  onChange={(e) =>
                    updateField("featured", e.target.checked, false)
                  }
                />
                Featured
              </label>

              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={form.limitedEdition}
                  onChange={(e) =>
                    updateField("limitedEdition", e.target.checked, false)
                  }
                />
                Limited Edition
              </label>

              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={form.flashSale}
                  onChange={(e) =>
                    updateField("flashSale", e.target.checked, false)
                  }
                />
                Flash Sale
              </label>

              <div className="rounded-2xl border border-slate-200 bg-[#fbfaf7] px-4 py-4">
                <label className={labelClass}>Discount %</label>
                <input
                  type="number"
                  className={`${inputClass} mt-2`}
                  placeholder="Discount %"
                  value={form.discount}
                  onChange={(e) =>
                    updateField("discount", e.target.value, false)
                  }
                />
              </div>
            </div>
          </section>

          {/* COLOR SECTION */}
          <section className={cardClass}>
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold">Colors & Swatches</h2>
                <p className={`mt-1 ${helperClass}`}>
                  Set up color variants with their own images and stock rows.
                </p>
              </div>
              <button
                type="button"
                className="rounded-full border border-slate-200 bg-[#fbfaf7] px-4 py-2 text-xs font-semibold text-slate-700 transition hover:border-slate-300"
                onClick={() => {
                  setColors((prev) => [...prev, emptyColor()]);
                  setNewColorImages((prev) => [...prev, Array(5).fill(null)]);
                }}
              >
                + Add Color
              </button>
            </div>

            <div className="space-y-4">
              {colors.map((c, colorIndex) => (
                <div
                  key={colorIndex}
                  className="rounded-[1.5rem] border border-slate-200 bg-[#fbfaf7] p-4"
                >
                  <div className="flex justify-between items-start gap-3">
                    <div className="flex gap-3 items-center flex-1">
                      <div className="space-y-1 flex-1">
                        <label className={labelClass}>Color Name</label>
                        <input
                          className={`${inputClass} mt-2`}
                          placeholder="E.g. Jet Black"
                          value={c.name}
                          onChange={(e) => {
                            setColors((prev) =>
                              prev.map((color, index) =>
                                index === colorIndex
                                  ? { ...color, name: e.target.value }
                                  : color
                              )
                            );
                          }}
                        />
                      </div>

                      <div className="space-y-1 flex-shrink-0">
                        <label className={labelClass}>Color Swatch</label>
                        <input
                          type="color"
                          className="mt-2 h-12 w-20 rounded-2xl border border-slate-200 bg-white p-1"
                          value={c.hex}
                          onChange={(e) => {
                            setColors((prev) =>
                              prev.map((color, index) =>
                                index === colorIndex
                                  ? { ...color, hex: e.target.value }
                                  : color
                              )
                            );
                          }}
                        />
                      </div>
                    </div>

                    {colorIndex > 0 && (
                      <button
                        type="button"
                        className="text-xs text-red-500"
                        onClick={() => {
                          if (colors.length === 1) return;
                          setColors((prev) =>
                            prev.filter((_, idx) => idx !== colorIndex)
                          );
                          setNewColorImages((prev) =>
                            prev.filter((_, idx) => idx !== colorIndex)
                          );
                          setRemovedColorImagesMap((prev) => {
                            const next = {};
                            Object.keys(prev).forEach((key) => {
                              const numericKey = Number(key);
                              if (numericKey === colorIndex) return;
                              next[numericKey > colorIndex ? numericKey - 1 : numericKey] =
                                prev[key];
                            });
                            return next;
                          });
                        }}
                      >
                        Remove
                      </button>
                    )}
                  </div>

                  {/* EXISTING color images */}
                  {!!(c.images || []).length && (
                    <div className="mt-2">
                      <p className={`${labelClass} mb-2`}>
                        Existing Images
                      </p>
                      <div className="flex gap-3 flex-wrap">
                        {(c.images || []).map((url, idx) => {
                          const removed =
                            removedColorImagesMap[colorIndex]?.has(url);
                          return (
                            <div key={idx} className="relative">
                              <img
                                src={url}
                                className={`h-20 w-20 rounded-xl border object-cover ${
                                  removed ? "opacity-40" : ""
                                }`}
                              />
                              <button
                                type="button"
                                onClick={() => {
                                  setRemovedColorImagesMap((m) => {
                                    const cp = { ...m };
                                    const nextSet = new Set(cp[colorIndex] || []);
                                    if (nextSet.has(url)) nextSet.delete(url);
                                    else nextSet.add(url);
                                    cp[colorIndex] = nextSet;
                                    return cp;
                                  });
                                }}
                                className={`absolute top-1 right-1 text-xs px-2 py-1 rounded ${
                                  removed ? "bg-green-600" : "bg-red-500"
                                } text-white`}
                              >
                                {removed ? "Undo" : "Remove"}
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* NEW color images */}
                  <div className="mt-2">
                    <p className={`${labelClass} mb-2`}>
                      Add / Replace Color Images
                    </p>
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
                      {newColorImages[colorIndex].map((img, idx) => (
                        <label
                          key={idx}
                          className="flex h-20 w-full cursor-pointer items-center justify-center overflow-hidden rounded-[1.2rem] border-2 border-dashed border-slate-200 bg-white"
                        >
                          {img ? (
                            <img
                              src={URL.createObjectURL(img)}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span className="text-3xl text-gray-500">+</span>
                          )}

                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files[0];
                              if (!file) return;
                              setNewColorImages((prev) =>
                                prev.map((images, currentColorIndex) =>
                                  currentColorIndex === colorIndex
                                    ? images.map((image, imageIndex) =>
                                        imageIndex === idx ? file : image
                                      )
                                    : images
                                )
                              );
                            }}
                          />
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* GLOBAL PRODUCT IMAGES */}
          <section className={cardClass}>
            <h2 className="text-xl font-semibold">Product Gallery</h2>
            <p className={`mt-1 ${helperClass}`}>
              These images are used across the store for this product.
            </p>

            <div className="mt-5 grid grid-cols-2 gap-4 md:grid-cols-5">
              {existingImages.map((url, idx) => {
                const removed = removedImages.includes(url);
                return (
                  <div key={idx} className="relative">
                    <img
                      src={url}
                      className={`h-24 w-24 rounded-[1.2rem] border object-cover ${
                        removed ? "opacity-40" : ""
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setRemovedImages((prev) =>
                          prev.includes(url)
                            ? prev.filter((u) => u !== url)
                            : [...prev, url]
                        )
                      }
                      className={`absolute top-1 right-1 text-xs px-2 py-1 rounded ${
                        removed ? "bg-green-600" : "bg-red-500"
                      } text-white`}
                    >
                      {removed ? "Undo" : "Remove"}
                    </button>
                  </div>
                );
              })}

              {newImages.map((file, i) => (
                <label
                  key={i}
                  className="flex h-24 w-24 cursor-pointer items-center justify-center overflow-hidden rounded-[1.2rem] border-2 border-dashed border-slate-200 bg-[#fbfaf7]"
                >
                  {file ? (
                    <img
                      src={URL.createObjectURL(file)}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-3xl text-gray-500">+</span>
                  )}

                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const f = e.target.files[0];
                      if (!f) return;
                      setNewImages((prev) =>
                        prev.map((image, index) => (index === i ? f : image))
                      );
                    }}
                  />
                </label>
              ))}
            </div>
          </section>

          {/* SUBMIT */}
          <div className="rounded-[1.8rem] border border-white/60 bg-white/95 p-5 shadow-[0_18px_40px_rgba(15,23,42,0.06)]">
            <button className="w-full rounded-full bg-[#B21A15] px-6 py-4 text-sm font-semibold uppercase tracking-[0.12em] text-white transition hover:bg-[#97150f]">
              {loading ? "Updating..." : "Update Product"}
            </button>
          </div>
          </div>

          <aside className="space-y-6 xl:sticky xl:top-8 xl:self-start">
            <div className={cardClass}>
              <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#B21A15]">
                Live Snapshot
              </p>
              <h2 className="mt-2 text-2xl font-semibold">Product Preview</h2>

              <div className="mt-5 overflow-hidden rounded-[1.6rem] border border-slate-200 bg-[#fbfaf7]">
                <div className="flex min-h-[220px] items-center justify-center bg-[#f2ece6]">
                  {existingImages[0] || newImages[0] ? (
                    <img
                      src={
                        newImages[0]
                          ? URL.createObjectURL(newImages[0])
                          : existingImages[0]
                      }
                      alt="Preview"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span className="text-sm text-slate-400">Main image preview</span>
                  )}
                </div>
                <div className="p-4">
                  <p className="text-lg font-semibold text-slate-950">
                    {form.title || "Untitled product"}
                  </p>
                  <p className="mt-1 text-sm text-slate-500">
                    {form.category || "No category selected"}
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {collections.slice(0, 3).map((collection) => (
                      <span
                        key={collection}
                        className="rounded-full bg-white px-3 py-1 text-[11px] font-medium text-slate-600"
                      >
                        {collection}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-5 grid gap-3">
                <div className="rounded-[1.4rem] bg-[#fbfaf7] px-4 py-4">
                  <p className="text-[11px] uppercase tracking-[0.18em] text-slate-500">
                    SKU
                  </p>
                  <p className="mt-2 font-semibold text-slate-900">
                    {form.sku || "--"}
                  </p>
                </div>
                <div className="rounded-[1.4rem] bg-[#fbfaf7] px-4 py-4">
                  <p className="text-[11px] uppercase tracking-[0.18em] text-slate-500">
                    Colors Added
                  </p>
                  <p className="mt-2 font-semibold text-slate-900">{activeColors}</p>
                </div>
                <div className="rounded-[1.4rem] bg-[#fbfaf7] px-4 py-4">
                  <p className="text-[11px] uppercase tracking-[0.18em] text-slate-500">
                    Gallery Uploads
                  </p>
                  <p className="mt-2 font-semibold text-slate-900">
                    {uploadedGalleryCount}
                  </p>
                </div>
              </div>
            </div>

            <div className={cardClass}>
              <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#B21A15]">
                Editing Notes
              </p>
              <div className="mt-4 space-y-4 text-sm leading-6 text-slate-600">
                <p>Adjust stock and pricing inside each color block so storefront availability stays accurate.</p>
                <p>Use the remove toggles to clean up old gallery images before adding replacements.</p>
                <p>Changes here keep the same structure and merchandising rhythm as the create product page.</p>
              </div>
            </div>
          </aside>
        </form>
      </div>
    </div>
  );
};

export default ProductUpdate;
