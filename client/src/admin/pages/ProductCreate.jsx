import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { createProduct, suggestSKU } from "../../redux/slices/productSlice";
import { useNavigate } from "react-router";
import {
  categories,
  sexOptions,
  materialOptions,
  fabricWeights,
  patternOptions,
  fitOptions,
  neckOptions,
  sleeveOptions,
  fieldLabels,
} from "../../assets/assets";

/* SIZE ORDER */
const sizeOrder = ["XS", "S", "M", "L", "XL", "XXL", "XXXL"];
const getNextSize = (current) => {
  if (!current) return "S";
  const i = sizeOrder.indexOf(current.toUpperCase());
  if (i !== -1 && sizeOrder[i + 1]) return sizeOrder[i + 1];
  return "";
};

/* PRODUCT COLLECTIONS */
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

const ProductCreate = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading } = useSelector((s) => s.products);

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

  const [sizes, setSizes] = useState([{ size: "", stock: "", price: "" }]);
  const [globalImages, setGlobalImages] = useState([
    null,
    null,
    null,
    null,
    null,
  ]);
  const [colors, setColors] = useState([
    { name: "", hex: "#000000", images: Array(5).fill(null) },
  ]);

  const [collections, setCollections] = useState([]);

  const [errors, setErrors] = useState({});
  const errorClass = (field) =>
    errors[field] ? "border-red-500" : "border-gray-300 dark:border-gray-600";

  /* AUTO TAGS */
  const autoTags = (updated) => {
    let tags = [];

    if (updated.category) tags.push(updated.category);
    if (updated.sexCategory) tags.push(updated.sexCategory + " wear");
    if (updated.material) tags.push(updated.material);
    if (updated.fabricWeight) tags.push(updated.fabricWeight);
    if (updated.pattern) tags.push(updated.pattern);
    if (updated.fitType) tags.push(updated.fitType);
    if (updated.neckType) tags.push(updated.neckType);
    if (updated.sleeveType) tags.push(updated.sleeveType);

    let cleaned = tags.map((t) => {
      let lower = t.toLowerCase().trim();
      let words = lower.split(/\s+/);
      let uniqueWords = [...new Set(words)];
      return uniqueWords.join("-");
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

  /* AUTO SKU */
  const autoSKU = async (title) => {
    if (!title) return;
    const sku = await dispatch(suggestSKU(title));
    if (sku) setProduct((p) => ({ ...p, sku }));
  };

  /* SIZE HANDLERS */
  const isRowEmpty = (row) =>
    !row.size.trim() && !row.stock.trim() && !row.price.trim();

  const updateSize = (i, key, value) => {
    const copy = [...sizes];
    copy[i][key] = value;
    setSizes(copy);
  };

  const removeSize = (i) => {
    if (sizes.length === 1) return;
    setSizes(sizes.filter((_, idx) => idx !== i));
  };

  /* COLOR HANDLERS */
  const addColor = () => {
    setColors((prev) => [
      ...prev,
      { name: "", hex: "#000000", images: Array(5).fill(null) },
    ]);
  };

  const removeColor = (i) => {
    if (colors.length === 1) return;
    setColors(colors.filter((_, idx) => idx !== i));
  };

  const updateColor = (i, key, value) => {
    const copy = [...colors];
    copy[i][key] = value;
    setColors(copy);
  };

  /* VALIDATION */
  const validate = () => {
    let e = {};
    if (!product.title) e.title = "Required";
    if (!product.sku) e.sku = "Required";
    if (!product.category) e.category = "Required";
    if (!sizes.some((s) => s.size && s.price))
      e.sizes = "Enter at least one valid size row";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  /* SUBMIT */
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    const fd = new FormData();

    /* SIZES */
    const cleanSizes = sizes
      .filter((s) => s.size && s.price)
      .map((s) => ({
        size: s.size,
        stock: Number(s.stock || 0),
        price: Number(s.price || 0),
      }));

    fd.append("sizes", JSON.stringify(cleanSizes));

    /* COLORS */
    const cleanColors = colors
      .filter((c) => c.name.trim() !== "")
      .map((c) => ({ name: c.name.trim(), hex: c.hex }));

    fd.append("colors", JSON.stringify(cleanColors));

    /* TAGS */
    fd.append(
      "tags",
      JSON.stringify(
        product.tags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean)
      )
    );

    /* COLLECTIONS */
    fd.append("collections", JSON.stringify(collections));

    /* BASIC FIELDS */
    Object.entries(product).forEach(([k, v]) => {
      if (k !== "tags") fd.append(k, v);
    });

    /* GLOBAL IMAGES */
    globalImages.forEach((img) => img && fd.append("images", img));

    /* COLOR IMAGES */
    colors.forEach((c, i) => {
      if (c.name.trim() !== "") {
        c.images.forEach((file) => {
          if (file) fd.append(`colorImages_${i}`, file);
        });
      }
    });

    await dispatch(createProduct(fd));
    navigate("/admin/products/manage");
  };

  return (
    <div className="p-6 bg-gray-100 dark:bg-gray-900 min-h-screen text-gray-900 dark:text-gray-100">
      <div className="max-w-6xl mx-auto">
        {/* HEADER */}
        <div className="mb-6">
          <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">
            Products / New
          </p>
          <h1 className="text-2xl font-semibold mt-1">Create Product</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Add a new product with sizes, colors, images, and visibility flags.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-md border border-gray-200 dark:border-gray-700 space-y-6"
        >
          {/* BASIC INFO */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-semibold text-lg">Basic Information</h2>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Start with a clear name and identifier for this product.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-sm font-medium">
                  Product Title{" "}
                  {errors.title && (
                    <span className="text-xs text-red-500">
                      &nbsp;• {errors.title}
                    </span>
                  )}
                </label>
                <input
                  className={`input bg-gray-100 dark:bg-gray-700 w-full ${errorClass(
                    "title"
                  )}`}
                  placeholder="E.g. Minimal Oversized Tee"
                  value={product.title}
                  onChange={(e) => {
                    updateField("title", e.target.value);
                    autoSKU(e.target.value);
                  }}
                />
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Shown in product listings and search results.
                </p>
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium">
                  SKU{" "}
                  {errors.sku && (
                    <span className="text-xs text-red-500">
                      &nbsp;• {errors.sku}
                    </span>
                  )}
                </label>
                <input
                  className={`input bg-gray-100 dark:bg-gray-700 w-full ${errorClass(
                    "sku"
                  )}`}
                  placeholder="Unique product code"
                  value={product.sku}
                  onChange={(e) => updateField("sku", e.target.value, false)}
                />
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Auto-generated from title but fully editable.
                </p>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium">
                Category{" "}
                {errors.category && (
                  <span className="text-xs text-red-500">
                    &nbsp;• {errors.category}
                  </span>
                )}
              </label>
              <select
                className={`input bg-gray-100 dark:bg-gray-700 w-full ${errorClass(
                  "category"
                )}`}
                value={product.category}
                onChange={(e) => updateField("category", e.target.value)}
              >
                <option value="">Select Category</option>
                {categories.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </div>
          </section>

          {/* ATTRIBUTES */}
          <section className="pt-4 border-t border-gray-200 dark:border-gray-700 space-y-4">
            <div>
              <h2 className="font-semibold text-lg">Product Attributes</h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Define who it’s for and how it feels to wear.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                ["sexCategory", sexOptions],
                ["material", materialOptions],
                ["fabricWeight", fabricWeights],
                ["pattern", patternOptions],
                ["fitType", fitOptions],
                ["neckType", neckOptions],
                ["sleeveType", sleeveOptions],
              ].map(([key, list]) => (
                <div key={key} className="space-y-1">
                  <label className="text-sm font-medium">
                    {fieldLabels[key]}
                  </label>
                  <select
                    className="input bg-gray-100 dark:bg-gray-700 border w-full"
                    value={product[key]}
                    onChange={(e) => updateField(key, e.target.value)}
                  >
                    <option value="">{fieldLabels[key]}</option>
                    {list.map((v) => (
                      <option key={v}>{v}</option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
          </section>

          {/* DESCRIPTION & TAGS */}
          <section className="pt-4 border-t border-gray-200 dark:border-gray-700 space-y-4">
            <div>
              <h2 className="font-semibold text-lg">Description & Tags</h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Help customers understand what makes this product special.
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Description</label>
              <textarea
                className="input bg-gray-100 dark:bg-gray-700 w-full h-28"
                placeholder="Describe the fabric, fit, and use cases..."
                value={product.description}
                onChange={(e) =>
                  updateField("description", e.target.value, false)
                }
              />
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium">Tags</label>
              <input
                className="input bg-gray-100 dark:bg-gray-700 border w-full"
                placeholder="Tags (auto-generated but editable)"
                value={product.tags}
                onChange={(e) => updateField("tags", e.target.value, false)}
              />
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Used for search & recommendations. Comma-separated keywords.
              </p>
            </div>
          </section>

          {/* COLLECTIONS */}
          <section className="pt-4 border-t border-gray-200 dark:border-gray-700 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-semibold text-lg">Collections</h2>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Group this product into themes like “Streetwear” or “Summer”.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {collectionsList.map((c) => (
                <label
                  key={c}
                  className="flex items-center gap-2 bg-gray-100 dark:bg-gray-700 px-3 py-2 rounded-lg cursor-pointer text-sm border border-transparent hover:border-gray-300 dark:hover:border-gray-500 transition"
                >
                  <input
                    type="checkbox"
                    checked={collections.includes(c)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setCollections([...collections, c]);
                      } else {
                        setCollections(
                          collections.filter((col) => col !== c)
                        );
                      }
                    }}
                  />
                  <span className="truncate">{c}</span>
                </label>
              ))}
            </div>
          </section>

          {/* SIZES */}
          <section className="pt-4 border-t border-gray-200 dark:border-gray-700 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-semibold text-lg">Sizes & Pricing</h2>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Configure sizes, stock, and price per size.
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  className="bg-gray-700 dark:bg-gray-600 text-white px-4 py-2 rounded text-xs"
                  onClick={() =>
                    setSizes([
                      ...sizes,
                      {
                        size: getNextSize(sizes[sizes.length - 1].size),
                        stock: "",
                        price: "",
                      },
                    ])
                  }
                >
                  + Add Size
                </button>

                <button
                  type="button"
                  className="bg-red-600 text-white px-4 py-2 rounded text-xs"
                  onClick={() =>
                    setSizes([{ size: "", stock: "", price: "" }])
                  }
                >
                  Reset Sizes
                </button>
              </div>
            </div>

            {errors.sizes && (
              <p className="text-red-500 text-xs">{errors.sizes}</p>
            )}

            <div className="space-y-2">
              <div className="grid grid-cols-4 gap-3 text-xs font-medium text-gray-500 dark:text-gray-400">
                <span>Size</span>
                <span>Stock</span>
                <span>Price</span>
                <span className="text-right">Actions</span>
              </div>

              {sizes.map((s, i) => (
                <div
                  key={i}
                  className="grid grid-cols-4 gap-3 items-center"
                >
                  <input
                    id={`size-${i}`}
                    className="input bg-gray-100 dark:bg-gray-700"
                    placeholder="Size"
                    value={s.size}
                    onChange={(e) =>
                      updateSize(i, "size", e.target.value.toUpperCase())
                    }
                  />

                  <input
                    id={`stock-${i}`}
                    className="input bg-gray-100 dark:bg-gray-700"
                    placeholder="Stock"
                    type="number"
                    value={s.stock}
                    onChange={(e) =>
                      updateSize(i, "stock", e.target.value)
                    }
                  />

                  <input
                    id={`price-${i}`}
                    className="input bg-gray-100 dark:bg-gray-700"
                    placeholder="Price"
                    type="number"
                    value={s.price}
                    onChange={(e) =>
                      updateSize(i, "price", e.target.value)
                    }
                  />

                  <div className="flex justify-end">
                    {i > 0 && (
                      <button
                        className="text-red-500 text-sm"
                        type="button"
                        onClick={() => removeSize(i)}
                      >
                        Remove
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* FLAGS */}
          <section className="pt-4 border-t border-gray-200 dark:border-gray-700 space-y-3">
            <h2 className="font-semibold text-lg">Visibility & Promotions</h2>
            <div className="flex flex-wrap gap-5 mt-1 items-center">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={product.featured}
                  onChange={(e) =>
                    updateField("featured", e.target.checked, false)
                  }
                />
                Featured
              </label>

              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={product.limitedEdition}
                  onChange={(e) =>
                    updateField("limitedEdition", e.target.checked, false)
                  }
                />
                Limited Edition
              </label>

              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={product.flashSale}
                  onChange={(e) =>
                    updateField("flashSale", e.target.checked, false)
                  }
                />
                Flash Sale
              </label>

              <div className="flex items-center gap-2">
                <input
                  type="number"
                  placeholder="Discount %"
                  className="input w-32 bg-gray-100 dark:bg-gray-700 border"
                  value={product.discount}
                  onChange={(e) =>
                    updateField("discount", e.target.value, false)
                  }
                />
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  Applied to final price.
                </span>
              </div>
            </div>
          </section>

          {/* COLORS */}
          <section className="pt-4 border-t border-gray-200 dark:border-gray-700 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-semibold text-lg">Colors & Swatches</h2>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Add color variants with up to 5 images each.
                </p>
              </div>
              <button
                type="button"
                className="bg-gray-700 text-white px-4 py-2 rounded text-xs"
                onClick={addColor}
              >
                + Add Color
              </button>
            </div>

            <div className="space-y-4">
              {colors.map((c, i) => (
                <div
                  key={i}
                  className="p-3 border rounded-lg bg-gray-100 dark:bg-gray-700 space-y-3"
                >
                  <div className="flex gap-3 items-center justify-between">
                    <div className="flex gap-3 items-center flex-1">
                      <input
                        className="input bg-white dark:bg-gray-800 flex-1"
                        placeholder="Color Name"
                        value={c.name}
                        onChange={(e) => updateColor(i, "name", e.target.value)}
                      />

                      <input
                        type="color"
                        className="w-12 h-10 border rounded"
                        value={c.hex}
                        onChange={(e) =>
                          updateColor(i, "hex", e.target.value)
                        }
                      />
                    </div>

                    {i > 0 && (
                      <button
                        className="text-red-500 text-sm"
                        type="button"
                        onClick={() => removeColor(i)}
                      >
                        Remove
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-5 gap-3 mt-1">
                    {c.images.map((img, idx) => (
                      <label
                        key={idx}
                        className="w-full h-20 border-2 border-dashed rounded flex items-center justify-center bg-gray-200 dark:bg-gray-800 cursor-pointer overflow-hidden"
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
                            const copy = [...colors];
                            copy[i].images[idx] = file;
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

          {/* GLOBAL IMAGES */}
          <section className="pt-4 border-t border-gray-200 dark:border-gray-700 space-y-3">
            <h2 className="font-semibold text-lg">Product Gallery</h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Upload up to 5 main images for this product.
            </p>

            <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mt-2">
              {globalImages.map((img, idx) => (
                <label
                  key={idx}
                  className="w-full h-24 border-2 border-dashed rounded flex items-center justify-center cursor-pointer bg-gray-200 dark:bg-gray-700 overflow-hidden"
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
                      const copy = [...globalImages];
                      copy[idx] = file;
                      setGlobalImages(copy);
                    }}
                  />
                </label>
              ))}
            </div>
          </section>

          {/* SUBMIT */}
          <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
            <button className="w-full py-3 bg-red-600 text-white rounded-lg font-semibold tracking-wide shadow-sm hover:shadow-md transform hover:-translate-y-0.5 transition">
              {loading ? "Creating..." : "Create Product"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductCreate;
