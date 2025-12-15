import React from "react";
import { Pencil, Trash2 } from "lucide-react";

const ProductCard = ({
  product,
  view = "grid",
  showCategoryBadge = true,
  onEdit,
  onDelete,
}) => {
  /* ---------------- STOCK (UNITS) ---------------- */
  const totalStock = Array.isArray(product.sizes)
    ? product.sizes.reduce(
        (sum, s) => sum + Number(s.stock || 0),
        0
      )
    : Number(product.stock || 0);

  const inStock = totalStock > 0;

  // If later you store original total separately, you can do:
  // const originalTotal = product.originalTotalStock || totalStock;
  // and render `${totalStock}/${originalTotal} in stock`

  /* ---------------- PRICE ---------------- */
  const price = Array.isArray(product.sizes)
    ? product.sizes[0]?.price
    : product.price ?? product.salePrice ?? "-";

  /* ---------------- IMAGES / COLORS ---------------- */
  const fallbackImage =
    "/mnt/data/1a64898e-d01d-4473-a9fc-e04760c3bdc2.png";

  const [selectedColorIndex, setSelectedColorIndex] = React.useState(0);

  const selectedColor = product.colors?.[selectedColorIndex];

  const colorImages = Array.isArray(selectedColor?.images)
    ? selectedColor.images
    : [];

  const allImages =
    colorImages.length > 0 ? colorImages : product.images || [];

  const defaultImage = allImages[0] || fallbackImage;

  /* ---------------- HOVER SLIDESHOW ---------------- */
  const [slideIndex, setSlideIndex] = React.useState(0);
  const [hovering, setHovering] = React.useState(false);

  React.useEffect(() => {
    if (!hovering || allImages.length < 2) return;

    const interval = setInterval(
      () => setSlideIndex((prev) => (prev + 1) % allImages.length),
      1200
    );

    return () => clearInterval(interval);
  }, [hovering, allImages.length]);

  const imgToShow = hovering ? allImages[slideIndex] : defaultImage;

  /* ======================================================
     LIST VIEW
  ====================================================== */
  if (view === "list") {
    return (
      <div className="w-full flex p-5 border border-gray-200 dark:border-gray-700 rounded-xl hover:shadow-lg transition bg-black/5 dark:bg-white/5">
        {/* LEFT IMAGE */}
        <img
          src={imgToShow}
          alt={product.name}
          className="w-28 h-45 object-cover rounded-lg shrink-0"
        />

        {/* CENTER CONTENT */}
        <div className="flex flex-col justify-center ml-6 grow">
          {/* TITLE */}
          {product.title && (
            <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-1">
              {product.title}
            </h2>
          )}

          {/* NAME */}
          <h3 className="font-semibold text-xl text-gray-900 dark:text-gray-100">
            {product.name}
          </h3>

          {/* SKU */}
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            SKU: {product.sku}
          </p>

          {/* CATEGORY */}
          <p className="text-sm text-gray-400 dark:text-gray-300 mt-1">
            {product.category}
          </p>

          {/* DESCRIPTION */}
          <p className="mt-3 text-sm text-gray-600 dark:text-gray-400 max-w-4xl">
            {product.description}
          </p>

          {/* COLOR SELECTOR */}
          {product.colors && product.colors.length > 1 && (
            <div className="flex gap-1 mt-3">
              {product.colors.map((clr, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setSelectedColorIndex(idx);
                    setSlideIndex(0);
                  }}
                  className={`w-4 h-4 rounded-full border ${
                    idx === selectedColorIndex
                      ? "ring-2 ring-blue-500"
                      : "ring-1 ring-gray-300"
                  }`}
                  style={{ backgroundColor: clr.hexCode || clr.name }}
                  title={clr.name}
                />
              ))}
            </div>
          )}
        </div>

        {/* RIGHT SIDE */}
        <div className="flex flex-col items-end justify-between ml-6">
          {/* PRICE + STOCK */}
          <div className="flex flex-col items-end">
            <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              ₹{price}
            </div>

            <span
              className={`mt-3 px-4 py-1.5 text-sm rounded-full font-semibold ${
                inStock
                  ? "bg-green-500/20 text-green-400"
                  : "bg-red-500/20 text-red-400"
              }`}
            >
              {inStock ? `${totalStock} in stock` : "Out of Stock"}
            </span>
          </div>

          {/* EDIT + DELETE */}
          <div className="flex gap-3 mt-5">
            <button
              onClick={() => onEdit(product)}
              className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-1"
            >
              <Pencil size={16} /> Edit
            </button>

            <button
              onClick={() => onDelete(product._id)}
              className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg flex items-center gap-1"
            >
              <Trash2 size={16} /> Delete
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* ======================================================
     GRID VIEW
  ====================================================== */
  return (
    <div className="w-55 h-auto rounded-xl overflow-hidden hover:shadow-md transition bg-black/5 dark:bg-white/5">
      {/* IMAGE */}
      <div
        className="relative"
        onMouseEnter={() => setHovering(true)}
        onMouseLeave={() => {
          setHovering(false);
          setSlideIndex(0);
        }}
      >
        <img
          src={imgToShow}
          alt={product.title}
          className="w-55 h-80 object-cover rounded-t-xl transition-all duration-300"
        />

        {/* Category Badge */}
        {showCategoryBadge && (
          <span className="absolute left-2 top-2 px-2 py-1 rounded-md text-xs font-semibold bg-black/70 text-white shadow">
            {product.category}
          </span>
        )}

        {/* Stock Badge */}
        <span
          className={`absolute right-2 top-2 px-2 py-1 rounded-md text-xs font-semibold shadow ${
            inStock ? "bg-green-300 text-green-900" : "bg-red-200 text-red-900"
          }`}
        >
          {inStock ? `${totalStock} in stock` : "Out of Stock"}
        </span>
      </div>

      {/* COLOR SELECTOR */}
      {product.colors && product.colors.length > 1 && (
        <div className="flex gap-1 px-2 mt-2">
          {product.colors.map((clr, idx) => (
            <button
              key={idx}
              onClick={() => {
                setSelectedColorIndex(idx);
                setSlideIndex(0);
              }}
              className={`w-4 h-4 rounded-full border ${
                idx === selectedColorIndex
                  ? "ring-2 ring-blue-500"
                  : "ring-1 ring-gray-300"
              }`}
              style={{ backgroundColor: clr.hexCode || clr.name }}
              title={clr.name}
            />
          ))}
        </div>
      )}

      {/* DETAILS */}
      <div className="p-2">
        <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
          {product.title}
        </p>

        <div className="mt-1 flex items-center justify-between">
          <p className="text-sm text-gray-600 dark:text-gray-400">₹{price}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {product.sku}
          </p>
        </div>

        {/* EDIT + DELETE */}
        <div className="flex justify-between mt-3">
          <button
            onClick={() => onEdit(product)}
            className="text-blue-600 dark:text-blue-400 flex items-center gap-1 text-sm"
          >
            <Pencil size={14} /> Edit
          </button>

          <button
            onClick={() => onDelete(product._id)}
            className="text-red-600 dark:text-red-400 flex items-center gap-1 text-sm"
          >
            <Trash2 size={14} /> Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
