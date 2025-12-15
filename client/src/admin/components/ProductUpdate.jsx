import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchProductById,
  updateProduct,
  suggestSKU,
} from "../../redux/slices/productSlice.jsx";
import { useParams, useNavigate } from "react-router";
import {categories, materialOptions, sexOptions, fabricWeights, patternOptions, fitOptions, neckOptions, sleeveOptions, collectionsList} from "../../assets/assets.js";

/* SIZE ORDER */
const sizeOrder = ["XS", "S", "M", "L", "XL", "XXL", "XXXL"];
const getNextSize = (current) => {
  if (!current) return "S";
  const i = sizeOrder.indexOf(current.toUpperCase());
  return i !== -1 && sizeOrder[i + 1] ? sizeOrder[i + 1] : "";
};

const ProductUpdate = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const dispatch = useDispatch();
  const { product, loading } = useSelector((s) => s.products);

  const [form, setForm] = useState(null);
  const [sizes, setSizes] = useState([{ size: "", stock: "", price: "" }]);

  const [existingImages, setExistingImages] = useState([]);
  const [removedImages, setRemovedImages] = useState([]);
  const [newImages, setNewImages] = useState([null, null, null, null, null]);

  const [colors, setColors] = useState([{ name: "", hex: "#000000", images: [] }]);
  const [removedColorImagesMap, setRemovedColorImagesMap] = useState({});
  const [newColorImages, setNewColorImages] = useState([Array(5).fill(null)]);

  /* NEW: COLLECTIONS */
  const [collections, setCollections] = useState([]);

  const emptyColor = () => ({ name: "", hex: "#000000", images: [] });

  /* FETCH */
  useEffect(() => {
    if (!id) return;
    dispatch(fetchProductById(id));
  }, [id, dispatch]);

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

    setCollections(Array.isArray(product.collections) ? product.collections : []);

    setSizes(
      product.sizes?.length
        ? product.sizes
        : [{ size: "", stock: "", price: "" }]
    );

    setExistingImages(Array.isArray(product.images) ? product.images : []);
    setRemovedImages([]);
    setNewImages([null, null, null, null, null]);

    const loadedColors = Array.isArray(product.colors)
      ? product.colors.map((c) => ({
          name: c.name,
          hex: c.hex,
          images: Array.isArray(c.images) ? c.images : [],
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

  /* SIZE HELPERS */
  const isRowEmpty = (row) =>
    !row.size.trim() && !row.stock.trim() && !row.price.trim();

  const addSizeRow = () => {
    setSizes((prev) => {
      const last = prev[prev.length - 1];
      if (!last || !isRowEmpty(last)) {
        return [
          ...prev,
          { size: getNextSize(last?.size || ""), stock: "", price: "" },
        ];
      }
      return prev;
    });
  };

  /* SUBMIT */
  const handleUpdate = (e) => {
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

    /* SIZES */
    fd.append("sizes", JSON.stringify(sizes));

    /* COLORS (meta only) */
    fd.append(
      "colors",
      JSON.stringify(colors.map((c) => ({ name: c.name, hex: c.hex })))
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

    dispatch(updateProduct(id, fd));
    setTimeout(() => navigate("/admin/products/manage"), 400);
  };

  if (!form) return <p className="p-6">Loading...</p>;

  return (
    <div className="p-5 bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 min-h-screen">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">
            Products / Manage
          </p>
          <div className="flex items-center justify-between mt-1">
            <h1 className="text-2xl font-semibold">Update Product</h1>
            <span className="text-xs px-3 py-1 rounded-full border bg-gray-100 dark:bg-gray-800">
              ID: {id}
            </span>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Tweak details, update images, and fine-tune how this product appears
            in your store.
          </p>
        </div>

        <form
          onSubmit={handleUpdate}
          className="space-y-6 bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-md border border-gray-200 dark:border-gray-700"
        >
          {/* BASIC INFO */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-semibold text-lg">Basic Information</h2>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Name your product and define its primary category.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-sm font-medium">Product Title</label>
                <input
                  className="input bg-gray-100 dark:bg-gray-700 border w-full"
                  placeholder="E.g. Minimal Oversized Tee"
                  value={form.title}
                  onChange={(e) => updateField("title", e.target.value)}
                  onBlur={(e) => trySuggestSKU(e.target.value)}
                />
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  This is what customers see in listings and search.
                </p>
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium">SKU</label>
                <input
                  className="input bg-gray-100 dark:bg-gray-700 border w-full"
                  placeholder="Auto-suggested or custom SKU"
                  value={form.sku}
                  onChange={(e) => updateField("sku", e.target.value, false)}
                />
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Keep it unique to make inventory easier to track.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-sm font-medium">Category</label>
                <select
                  className="input bg-gray-100 dark:bg-gray-700 border w-full"
                  value={form.category}
                  onChange={(e) => updateField("category", e.target.value)}
                >
                  <option value="">Select Category</option>
                  {categories.map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium">Tags</label>
                <input
                  className="input bg-gray-100 dark:bg-gray-700 border w-full"
                  placeholder="Tags (editable, comma separated)"
                  value={form.tags}
                  onChange={(e) => updateField("tags", e.target.value, false)}
                />
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Used for search & recommendations. Auto-updated from fields.
                </p>
              </div>
            </div>
          </section>

          {/* COLLECTIONS */}
          <section className="pt-4 border-t border-gray-200 dark:border-gray-700 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-semibold text-lg">Collections</h2>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Add this product to themed collections for easier discovery.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {collectionsList.map((c) => (
                <label
                  key={c}
                  className="flex items-center gap-2 bg-gray-100 dark:bg-gray-700 p-2 rounded-lg cursor-pointer text-sm border border-transparent hover:border-gray-300 dark:hover:border-gray-500 transition"
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
          <section className="pt-4 border-t border-gray-200 dark:border-gray-700 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-semibold text-lg">Product Attributes</h2>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Define the type, feel, and style of this product.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className="text-sm font-medium">Gender</label>
                <select
                  className="input bg-gray-100 dark:bg-gray-700 border w-full"
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
                <label className="text-sm font-medium">Material</label>
                <select
                  className="input bg-gray-100 dark:bg-gray-700 border w-full"
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
                <label className="text-sm font-medium">Fabric GSM</label>
                <select
                  className="input bg-gray-100 dark:bg-gray-700 border w-full"
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
                <label className="text-sm font-medium">Pattern</label>
                <select
                  className="input bg-gray-100 dark:bg-gray-700 border w-full"
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
                <label className="text-sm font-medium">Fit Type</label>
                <select
                  className="input bg-gray-100 dark:bg-gray-700 border w-full"
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
                <label className="text-sm font-medium">Neck Type</label>
                <select
                  className="input bg-gray-100 dark:bg-gray-700 border w-full"
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
                <label className="text-sm font-medium">Sleeve Type</label>
                <select
                  className="input bg-gray-100 dark:bg-gray-700 border w-full"
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
          <section className="pt-4 border-t border-gray-200 dark:border-gray-700 space-y-2">
            <h2 className="font-semibold text-lg">Description</h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Highlight what makes this piece special. Keep it punchy but clear.
            </p>
            <textarea
              className="input bg-gray-100 dark:bg-gray-700 border w-full h-28 mt-1"
              value={form.description}
              onChange={(e) => updateField("description", e.target.value, false)}
            />
          </section>

          {/* SIZES */}
          <section className="pt-4 border-t border-gray-200 dark:border-gray-700 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-semibold text-lg">Sizes & Pricing</h2>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Manage available sizes, stock levels, and per-size pricing.
                </p>
              </div>
              <button
                type="button"
                onClick={addSizeRow}
                className="text-xs px-3 py-1 rounded border bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition"
              >
                + Add Size
              </button>
            </div>

            <div className="space-y-2">
              <div className="grid grid-cols-3 gap-3 text-xs font-medium text-gray-500 dark:text-gray-400">
                <span>Size</span>
                <span>Stock</span>
                <span>Price</span>
              </div>

              {sizes.map((s, i) => (
                <div key={i} className="grid grid-cols-3 gap-3 items-center">
                  <input
                    className="input bg-gray-100 dark:bg-gray-700 border"
                    value={s.size}
                    placeholder="Size"
                    onChange={(e) => {
                      const cp = [...sizes];
                      cp[i].size = e.target.value.toUpperCase();
                      setSizes(cp);
                    }}
                  />
                  <input
                    className="input bg-gray-100 dark:bg-gray-700 border"
                    value={s.stock}
                    type="number"
                    placeholder="Stock"
                    onChange={(e) => {
                      const cp = [...sizes];
                      cp[i].stock = e.target.value;
                      setSizes(cp);
                    }}
                  />
                  <input
                    className="input bg-gray-100 dark:bg-gray-700 border"
                    value={s.price}
                    type="number"
                    placeholder="Price"
                    onChange={(e) => {
                      const cp = [...sizes];
                      cp[i].price = e.target.value;
                      setSizes(cp);
                    }}
                  />
                </div>
              ))}
            </div>
          </section>

          {/* FLAGS / PROMOTIONS */}
          <section className="pt-4 border-t border-gray-200 dark:border-gray-700 space-y-3">
            <h2 className="font-semibold text-lg">Visibility & Promotions</h2>
            <div className="flex flex-wrap gap-5 items-center mt-1">
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

              <div className="flex items-center gap-2">
                <input
                  type="number"
                  className="input w-32 bg-gray-100 dark:bg-gray-700 border"
                  placeholder="Discount %"
                  value={form.discount}
                  onChange={(e) =>
                    updateField("discount", e.target.value, false)
                  }
                />
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  Applied on all sizes.
                </span>
              </div>
            </div>
          </section>

          {/* COLOR SECTION */}
          <section className="pt-4 border-t border-gray-200 dark:border-gray-700 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-semibold text-lg">Colors & Swatches</h2>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Set up color variants with their own images.
                </p>
              </div>
              <button
                type="button"
                className="text-xs px-3 py-1 rounded border bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition"
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
                  className="p-3 border rounded-lg bg-gray-100 dark:bg-gray-700 space-y-3"
                >
                  <div className="flex justify-between items-start gap-3">
                    <div className="flex gap-3 items-center flex-1">
                      <div className="space-y-1 flex-1">
                        <label className="text-xs font-medium">
                          Color Name
                        </label>
                        <input
                          className="input bg-white dark:bg-gray-800 border w-full"
                          placeholder="E.g. Jet Black"
                          value={c.name}
                          onChange={(e) => {
                            const copy = [...colors];
                            copy[colorIndex].name = e.target.value;
                            setColors(copy);
                          }}
                        />
                      </div>

                      <div className="space-y-1 flex-shrink-0">
                        <label className="text-xs font-medium">
                          Color Swatch
                        </label>
                        <input
                          type="color"
                          className="w-12 h-10 border rounded"
                          value={c.hex}
                          onChange={(e) => {
                            const copy = [...colors];
                            copy[colorIndex].hex = e.target.value;
                            setColors(copy);
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
                          setColors(colors.filter((_, idx) => idx !== colorIndex));
                        }}
                      >
                        Remove
                      </button>
                    )}
                  </div>

                  {/* EXISTING color images */}
                  {!!(c.images || []).length && (
                    <div className="mt-2">
                      <p className="text-xs font-medium mb-1">
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
                                className={`w-20 h-20 object-cover rounded border ${
                                  removed ? "opacity-40" : ""
                                }`}
                              />
                              <button
                                type="button"
                                onClick={() => {
                                  setRemovedColorImagesMap((m) => {
                                    const cp = { ...m };
                                    if (!cp[colorIndex])
                                      cp[colorIndex] = new Set();
                                    if (cp[colorIndex].has(url))
                                      cp[colorIndex].delete(url);
                                    else cp[colorIndex].add(url);
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
                    <p className="text-xs font-medium mb-1">
                      Add / Replace Color Images
                    </p>
                    <div className="grid grid-cols-5 gap-3">
                      {newColorImages[colorIndex].map((img, idx) => (
                        <label
                          key={idx}
                          className="w-full h-20 border-2 border-dashed rounded flex justify-center items-center cursor-pointer overflow-hidden bg-gray-200 dark:bg-gray-800"
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
                              const cp = [...newColorImages];
                              cp[colorIndex][idx] = file;
                              setNewColorImages(cp);
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
          <section className="pt-4 border-t border-gray-200 dark:border-gray-700 space-y-3">
            <h2 className="font-semibold text-lg">Product Gallery</h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              These images are used across the store for this product.
            </p>

            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {existingImages.map((url, idx) => {
                const removed = removedImages.includes(url);
                return (
                  <div key={idx} className="relative">
                    <img
                      src={url}
                      className={`w-24 h-24 object-cover rounded border ${
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
                  className="w-24 h-24 border-2 border-dashed rounded flex justify-center items-center cursor-pointer overflow-hidden bg-gray-200 dark:bg-gray-800"
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
                      const cp = [...newImages];
                      cp[i] = f;
                      setNewImages(cp);
                    }}
                  />
                </label>
              ))}
            </div>
          </section>

          {/* SUBMIT */}
          <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
            <button className="w-full py-3 bg-yellow-600 text-white rounded-lg font-semibold tracking-wide shadow-sm hover:shadow-md transform hover:-translate-y-0.5 transition">
              {loading ? "Updating..." : "Update Product"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductUpdate;
