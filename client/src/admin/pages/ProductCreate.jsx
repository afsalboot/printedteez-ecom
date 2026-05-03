import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router";
import { ArrowLeft } from "lucide-react";
import {
  createProduct,
  fetchAdminCategories,
  suggestSKU,
} from "../../redux/slices/productSlice";
import {
  fabricWeights,
  fieldLabels,
  fitOptions,
  materialOptions,
  neckOptions,
  patternOptions,
  sexOptions,
  sleeveOptions,
} from "../../assets/assets";

const sizeOrder = ["XS", "S", "M", "L", "XL", "XXL", "XXXL"];
const sizeBatchCount = 2;
const priceStep = 100;

const getNextSize = (current) => {
  if (!current) return "S";
  const i = sizeOrder.indexOf(current.toUpperCase());
  if (i !== -1 && sizeOrder[i + 1]) return sizeOrder[i + 1];
  return "";
};

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

const collectionsList = [
  "Streetwear",
  "Anime",
  "Minimal",
  "Retro",
  "Vintage",
  "Sports",
  "Gym",
  "Summer",
  "Winter",
  "Festival",
  "Couple Wear",
  "Trending",
  "New Arrivals",
  "Best Sellers",
  "Limited Edition",
];

const cardClass =
  "rounded-[1.8rem] border border-white/60 bg-white/95 p-6 shadow-[0_18px_40px_rgba(15,23,42,0.06)] backdrop-blur-sm";
const labelClass = "text-sm font-semibold text-slate-800";
const helperClass = "text-xs leading-5 text-slate-500";
const inputClass =
  "w-full rounded-2xl border border-slate-200 bg-[#fbfaf7] px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-[#B21A15] focus:bg-white";

const ProductCreate = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, adminCategories = [] } = useSelector((s) => s.products);

  const [product, setProduct] = useState({
    title: "",
    sku: "",
    description: "",
    category: "",
    sexCategory: "",
    material: "",
    fitType: "",
    neckType: "",
    sleeveType: "",
    fabricWeight: "",
    pattern: "",
    tags: "",
    featured: false,
    flashSale: false,
    limitedEdition: false,
    discount: 0,
  });

  const [globalImages, setGlobalImages] = useState([null, null, null, null, null]);
  const [sizeChart, setSizeChart] = useState([
    { size: "", length: "", width: "", chest: "" },
  ]);
  const [colors, setColors] = useState([
    {
      name: "",
      hex: "#000000",
      images: Array(5).fill(null),
      sizes: [{ size: "", stock: "", price: "" }],
    },
  ]);
  const [collections, setCollections] = useState([]);
  const [errors, setErrors] = useState({});

  React.useEffect(() => {
    dispatch(fetchAdminCategories());
  }, [dispatch]);

  const errorClass = (field) =>
    errors[field] ? "border-red-500 focus:border-red-500" : "border-slate-200";

  const autoTags = (updated) => {
    const tags = [];

    if (updated.category) tags.push(updated.category);
    if (updated.sexCategory) tags.push(`${updated.sexCategory} wear`);
    if (updated.material) tags.push(updated.material);
    if (updated.fabricWeight) tags.push(updated.fabricWeight);
    if (updated.pattern) tags.push(updated.pattern);
    if (updated.fitType) tags.push(updated.fitType);
    if (updated.neckType) tags.push(updated.neckType);
    if (updated.sleeveType) tags.push(updated.sleeveType);

    const cleaned = tags.map((tag) => {
      const lower = tag.toLowerCase().trim();
      const words = lower.split(/\s+/);
      return [...new Set(words)].join("-");
    });

    updated.tags = [...new Set(cleaned)].join(", ");
  };

  const updateField = (key, value, regenerate = true) => {
    setProduct((prev) => {
      const updated = { ...prev, [key]: value };
      if (regenerate) autoTags(updated);
      return updated;
    });
  };

  const autoSKU = async (title) => {
    if (!title) return;
    const sku = await dispatch(suggestSKU(title));
    if (sku) setProduct((prev) => ({ ...prev, sku }));
  };

  const addColor = () => {
    setColors((prev) => [
      ...prev,
      {
        name: "",
        hex: "#000000",
        images: Array(5).fill(null),
        sizes: [{ size: "", stock: "", price: "" }],
      },
    ]);
  };

  const removeColor = (index) => {
    if (colors.length === 1) return;
    setColors(colors.filter((_, idx) => idx !== index));
  };

  const updateColor = (index, key, value) => {
    const copy = [...colors];
    copy[index][key] = value;
    setColors(copy);
  };

  const updateSizeChartRow = (index, key, value) => {
    const copy = [...sizeChart];
    copy[index][key] = value;
    setSizeChart(copy);
  };

  const addSizeChartRow = () => {
    setSizeChart((prev) => [
      ...prev,
      {
        size: getNextSize(prev[prev.length - 1]?.size),
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

  const updateColorSize = (colorIndex, sizeIndex, key, value) => {
    const copy = [...colors];
    copy[colorIndex].sizes[sizeIndex][key] = value;
    setColors(copy);
  };

  const addColorSize = (colorIndex) => {
    setColors((prev) => {
      const copy = [...prev];
      const currentSizes = copy[colorIndex].sizes || [];
      const autoBatch = buildAutoSizeBatch(currentSizes);

      copy[colorIndex].sizes =
        autoBatch.length > 0
          ? [...currentSizes, ...autoBatch]
          : [
              ...currentSizes,
              {
                size: getNextSize(currentSizes[currentSizes.length - 1]?.size),
                stock: "",
                price: "",
              },
            ];
      return copy;
    });
  };

  const removeColorSize = (colorIndex, sizeIndex) => {
    setColors((prev) => {
      const copy = [...prev];
      if ((copy[colorIndex].sizes || []).length === 1) return prev;
      copy[colorIndex].sizes = copy[colorIndex].sizes.filter(
        (_, idx) => idx !== sizeIndex
      );
      return copy;
    });
  };

  const validate = () => {
    const nextErrors = {};
    if (!product.title) nextErrors.title = "Required";
    if (!product.sku) nextErrors.sku = "Required";
    if (!product.category) nextErrors.category = "Required";
    const hasValidColorVariant = colors.some(
      (color) =>
        color.name.trim() &&
        (color.sizes || []).some((size) => size.size && size.price)
    );
    if (!hasValidColorVariant) {
      nextErrors.sizes = "Add at least one color with one valid size row";
    }
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    const fd = new FormData();

    const cleanColors = colors
      .filter((color) => color.name.trim() !== "")
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

    const cleanSizes = cleanColors.reduce((acc, color) => {
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

    fd.append("sizes", JSON.stringify(cleanSizes));
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
    fd.append("colors", JSON.stringify(cleanColors));

    fd.append(
      "tags",
      JSON.stringify(
        product.tags
          .split(",")
          .map((tag) => tag.trim())
          .filter(Boolean)
      )
    );

    fd.append("collections", JSON.stringify(collections));

    Object.entries(product).forEach(([key, value]) => {
      if (key !== "tags") fd.append(key, value);
    });

    globalImages.forEach((img) => img && fd.append("images", img));

    colors.forEach((color, colorIndex) => {
      if (color.name.trim() !== "") {
        color.images.forEach((file) => {
          if (file) fd.append(`colorImages_${colorIndex}`, file);
        });
      }
    });

    const result = await dispatch(createProduct(fd));
    if (result?.ok) {
      navigate("/admin/products/manage");
    }
  };

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
  const activeColors = colors.filter((color) => color.name.trim() !== "").length;
  const uploadedGalleryCount = globalImages.filter(Boolean).length;

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(178,26,21,0.08),_transparent_28%),linear-gradient(180deg,_#f8f4ef_0%,_#f1ebe4_100%)] p-5 text-slate-900">
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
            <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-[#B21A15]">
              Products / New
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
              Create Product
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600">
              Build a product entry with clearer sections for merchandising,
              inventory, visuals, and promotion settings.
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

        <form onSubmit={handleSubmit} className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
          <div className="space-y-6">
            <section className={cardClass}>
              <div className="mb-5">
                <h2 className="text-xl font-semibold">Basic Information</h2>
                <p className={`mt-1 ${helperClass}`}>
                  Define the product identity first: title, SKU, category, and description.
                </p>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className={labelClass}>
                    Product Title
                    {errors.title ? (
                      <span className="ml-2 text-xs font-medium text-red-500">
                        {errors.title}
                      </span>
                    ) : null}
                  </label>
                  <input
                    className={`${inputClass} mt-2 ${errorClass("title")}`}
                    placeholder="Minimal Oversized Tee"
                    value={product.title}
                    onChange={(e) => {
                      updateField("title", e.target.value);
                      autoSKU(e.target.value);
                    }}
                  />
                  <p className={`mt-2 ${helperClass}`}>
                    This title appears in listings, search, and product pages.
                  </p>
                </div>

                <div>
                  <label className={labelClass}>
                    SKU
                    {errors.sku ? (
                      <span className="ml-2 text-xs font-medium text-red-500">
                        {errors.sku}
                      </span>
                    ) : null}
                  </label>
                  <input
                    className={`${inputClass} mt-2 ${errorClass("sku")}`}
                    placeholder="Unique inventory code"
                    value={product.sku}
                    onChange={(e) => updateField("sku", e.target.value, false)}
                  />
                  <p className={`mt-2 ${helperClass}`}>
                    Auto-suggested from title, but still fully editable.
                  </p>
                </div>
              </div>

              <div className="mt-5 grid gap-4 md:grid-cols-2">
                <div>
                  <label className={labelClass}>
                    Category
                    {errors.category ? (
                      <span className="ml-2 text-xs font-medium text-red-500">
                        {errors.category}
                      </span>
                    ) : null}
                  </label>
                  <select
                    className={`${inputClass} mt-2 ${errorClass("category")}`}
                    value={product.category}
                    onChange={(e) => updateField("category", e.target.value)}
                  >
                    <option value="">Select Category</option>
                    {adminCategories.map((category) => (
                      <option key={category._id} value={category.name}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className={labelClass}>Tags</label>
                  <input
                    className={`${inputClass} mt-2`}
                    placeholder="Auto-generated tags, editable"
                    value={product.tags}
                    onChange={(e) => updateField("tags", e.target.value, false)}
                  />
                </div>
              </div>

              <div className="mt-5">
                <label className={labelClass}>Description</label>
                <textarea
                  className={`${inputClass} mt-2 h-32 resize-none`}
                  placeholder="Describe fabric, fit, personality, and selling points..."
                  value={product.description}
                  onChange={(e) => updateField("description", e.target.value, false)}
                />
              </div>
            </section>

            <section className={cardClass}>
              <div className="mb-5 flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-xl font-semibold">Size Chart</h2>
                  <p className={`mt-1 ${helperClass}`}>
                    Add garment measurements such as length, width, and chest for each size.
                  </p>
                </div>
                <button
                  type="button"
                  className="rounded-full border border-slate-200 bg-[#fbfaf7] px-4 py-2 text-xs font-semibold text-slate-700 transition hover:border-slate-300"
                  onClick={addSizeChartRow}
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
                          className="text-sm font-medium text-red-500"
                          type="button"
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

            <section className={cardClass}>
              <div className="mb-5">
                <h2 className="text-xl font-semibold">Product Attributes</h2>
                <p className={`mt-1 ${helperClass}`}>
                  Define who the product is for and how it behaves visually and physically.
                </p>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                {[
                  ["sexCategory", sexOptions],
                  ["material", materialOptions],
                  ["fabricWeight", fabricWeights],
                  ["pattern", patternOptions],
                  ["fitType", fitOptions],
                  ["neckType", neckOptions],
                  ["sleeveType", sleeveOptions],
                ].map(([key, list]) => (
                  <div key={key}>
                    <label className={labelClass}>{fieldLabels[key]}</label>
                    <select
                      className={`${inputClass} mt-2`}
                      value={product[key]}
                      onChange={(e) => updateField(key, e.target.value)}
                    >
                      <option value="">{fieldLabels[key]}</option>
                      {list.map((value) => (
                        <option key={value}>{value}</option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>
            </section>

            <section className={cardClass}>
              <div className="mb-5 flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-xl font-semibold">Collections</h2>
                  <p className={`mt-1 ${helperClass}`}>
                    Attach this product to themed discovery rails and seasonal edits.
                  </p>
                </div>
                <span className="rounded-full bg-[#f7eee8] px-3 py-1 text-xs font-semibold text-[#B21A15]">
                  {collections.length} selected
                </span>
              </div>

              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {collectionsList.map((collection) => (
                  <label
                    key={collection}
                    className={`flex cursor-pointer items-center gap-3 rounded-2xl border px-4 py-3 text-sm transition ${
                      collections.includes(collection)
                        ? "border-[#B21A15] bg-[#fff5f2] text-[#7f1f18]"
                        : "border-slate-200 bg-[#fbfaf7] text-slate-700 hover:border-slate-300"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={collections.includes(collection)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setCollections([...collections, collection]);
                        } else {
                          setCollections(collections.filter((c) => c !== collection));
                        }
                      }}
                    />
                    <span className="truncate">{collection}</span>
                  </label>
                ))}
              </div>
            </section>

            <section className={cardClass}>
              <div className="mb-5 flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-xl font-semibold">Inventory By Color</h2>
                  <p className={`mt-1 ${helperClass}`}>
                    Each color keeps its own sizes, stock, and pricing. At least one valid color variant is required.
                  </p>
                  {errors.sizes ? (
                    <p className="mt-2 text-xs font-medium text-red-500">
                      {errors.sizes}
                    </p>
                  ) : null}
                </div>
              </div>

              <div className="space-y-4">
                {colors.map((color, colorIndex) => (
                  <div
                    key={colorIndex}
                    className="rounded-[1.5rem] border border-slate-200 bg-[#fbfaf7] p-4"
                  >
                    <div className="mb-3 flex items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-slate-900">
                          {color.name.trim() || `Color ${colorIndex + 1}`}
                        </p>
                        <p className="text-xs text-slate-500">
                          Size rows here apply only to this color.
                        </p>
                      </div>
                      <button
                        type="button"
                        className="rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 transition hover:border-slate-300"
                        onClick={() => addColorSize(colorIndex)}
                      >
                        Add Size
                      </button>
                    </div>

                    <div className="space-y-3">
                      {(color.sizes || []).map((size, sizeIndex) => (
                        <div
                          key={sizeIndex}
                          className="grid gap-3 rounded-[1.3rem] border border-slate-200 bg-white p-4 md:grid-cols-[1fr_1fr_1fr_auto]"
                        >
                          <input
                            className={inputClass}
                            placeholder="Size"
                            value={size.size}
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
                            placeholder="Stock"
                            type="number"
                            value={size.stock}
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
                            placeholder="Price"
                            type="number"
                            value={size.price}
                            onChange={(e) =>
                              updateColorSize(
                                colorIndex,
                                sizeIndex,
                                "price",
                                e.target.value
                              )
                            }
                          />
                          <div className="flex items-center justify-end">
                            {sizeIndex > 0 && (
                              <button
                                className="text-sm font-medium text-red-500"
                                type="button"
                                onClick={() => removeColorSize(colorIndex, sizeIndex)}
                              >
                                Remove
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className={cardClass}>
              <div className="mb-5 flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-xl font-semibold">Visibility & Promotions</h2>
                  <p className={`mt-1 ${helperClass}`}>
                    Control discoverability and campaign placement for this product.
                  </p>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <label className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-[#fbfaf7] px-4 py-4 text-sm font-medium text-slate-800">
                  <input
                    type="checkbox"
                    checked={product.featured}
                    onChange={(e) => updateField("featured", e.target.checked, false)}
                  />
                  Featured product
                </label>
                <label className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-[#fbfaf7] px-4 py-4 text-sm font-medium text-slate-800">
                  <input
                    type="checkbox"
                    checked={product.limitedEdition}
                    onChange={(e) =>
                      updateField("limitedEdition", e.target.checked, false)
                    }
                  />
                  Limited edition
                </label>
                <label className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-[#fbfaf7] px-4 py-4 text-sm font-medium text-slate-800">
                  <input
                    type="checkbox"
                    checked={product.flashSale}
                    onChange={(e) => updateField("flashSale", e.target.checked, false)}
                  />
                  Flash sale enabled
                </label>
                <div className="rounded-2xl border border-slate-200 bg-[#fbfaf7] px-4 py-4">
                  <label className={labelClass}>Discount %</label>
                  <input
                    type="number"
                    placeholder="0"
                    className={`${inputClass} mt-2`}
                    value={product.discount}
                    onChange={(e) => updateField("discount", e.target.value, false)}
                  />
                </div>
              </div>
            </section>

            <section className={cardClass}>
              <div className="mb-5 flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-xl font-semibold">Colors & Variant Images</h2>
                  <p className={`mt-1 ${helperClass}`}>
                    Add swatches, upload images, and define stock by color.
                  </p>
                </div>
                <button
                  type="button"
                  className="rounded-full border border-slate-200 bg-[#fbfaf7] px-4 py-2 text-xs font-semibold text-slate-700 transition hover:border-slate-300"
                  onClick={addColor}
                >
                  Add Color
                </button>
              </div>

              <div className="space-y-5">
                {colors.map((color, colorIndex) => (
                  <div
                    key={colorIndex}
                    className="rounded-[1.5rem] border border-slate-200 bg-[#fbfaf7] p-4"
                  >
                    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                      <div className="grid flex-1 gap-3 md:grid-cols-[minmax(0,1fr)_90px]">
                        <input
                          className={inputClass}
                          placeholder="Color name"
                          value={color.name}
                          onChange={(e) =>
                            updateColor(colorIndex, "name", e.target.value)
                          }
                        />
                        <input
                          type="color"
                          className="h-12 w-full rounded-2xl border border-slate-200 bg-white p-1"
                          value={color.hex}
                          onChange={(e) =>
                            updateColor(colorIndex, "hex", e.target.value)
                          }
                        />
                      </div>

                      {colorIndex > 0 && (
                        <button
                          className="text-sm font-medium text-red-500"
                          type="button"
                          onClick={() => removeColor(colorIndex)}
                        >
                          Remove
                        </button>
                      )}
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-5">
                      {color.images.map((img, imageIndex) => (
                        <label
                          key={imageIndex}
                          className="flex h-24 cursor-pointer items-center justify-center overflow-hidden rounded-[1.2rem] border-2 border-dashed border-slate-200 bg-white"
                        >
                          {img ? (
                            <img
                              src={URL.createObjectURL(img)}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <span className="text-3xl text-slate-300">+</span>
                          )}

                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files[0];
                              if (!file) return;
                              const copy = [...colors];
                              copy[colorIndex].images[imageIndex] = file;
                              setColors(copy);
                            }}
                          />
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className={cardClass}>
              <div className="mb-5">
                <h2 className="text-xl font-semibold">Product Gallery</h2>
                <p className={`mt-1 ${helperClass}`}>
                  Upload the main gallery images used in listing previews and detail pages.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
                {globalImages.map((img, index) => (
                  <label
                    key={index}
                    className="flex h-28 cursor-pointer items-center justify-center overflow-hidden rounded-[1.4rem] border-2 border-dashed border-slate-200 bg-[#fbfaf7]"
                  >
                    {img ? (
                      <img
                        src={URL.createObjectURL(img)}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <span className="text-3xl text-slate-300">+</span>
                    )}

                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files[0];
                        if (!file) return;
                        const copy = [...globalImages];
                        copy[index] = file;
                        setGlobalImages(copy);
                      }}
                    />
                  </label>
                ))}
              </div>
            </section>

            <div className="rounded-[1.8rem] border border-white/60 bg-white/95 p-5 shadow-[0_18px_40px_rgba(15,23,42,0.06)]">
              <button className="w-full rounded-full bg-[#B21A15] px-6 py-4 text-sm font-semibold tracking-[0.12em] text-white uppercase transition hover:bg-[#97150f]">
                {loading ? "Creating..." : "Create Product"}
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
                  {globalImages[0] ? (
                    <img
                      src={URL.createObjectURL(globalImages[0])}
                      alt="Preview"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span className="text-sm text-slate-400">Main image preview</span>
                  )}
                </div>
                <div className="p-4">
                  <p className="text-lg font-semibold text-slate-950">
                    {product.title || "Untitled product"}
                  </p>
                  <p className="mt-1 text-sm text-slate-500">
                    {product.category || "No category selected"}
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
                    {product.sku || "--"}
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
                    {uploadedGalleryCount}/5
                  </p>
                </div>
              </div>
            </div>

            <div className={cardClass}>
              <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#B21A15]">
                Merchandising Notes
              </p>
              <div className="mt-4 space-y-4 text-sm leading-6 text-slate-600">
                <p>Use strong product titles and keep descriptions focused on fit, feel, and why the piece stands out.</p>
                <p>At least one valid size and price row is required before submission.</p>
                <p>Color variants only count once they have a name. Empty color rows are ignored on submit.</p>
              </div>
            </div>
          </aside>
        </form>
      </div>
    </div>
  );
};

export default ProductCreate;
