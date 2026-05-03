import React from "react";
import { Pencil, Trash2 } from "lucide-react";

const ProductCard = ({
  product,
  view = "grid",
  showCategoryBadge = true,
  onView,
  onEdit,
  onDelete,
}) => {
  const productTitle = product.title || product.name || "Untitled Product";

  const fallbackImage =
    "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 480 640'><rect width='480' height='640' fill='%23f3f4f6'/><rect x='40' y='40' width='400' height='560' rx='28' fill='%23fee2e2'/><text x='50%25' y='50%25' text-anchor='middle' fill='%23b91c1c' font-family='Arial' font-size='28'>PrintedTeez</text></svg>";

  const [selectedColorIndex, setSelectedColorIndex] = React.useState(0);
  const selectedColor = product.colors?.[selectedColorIndex];
  const selectedSizes =
    Array.isArray(selectedColor?.sizes) && selectedColor.sizes.length > 0
      ? selectedColor.sizes
      : Array.isArray(product.sizes)
      ? product.sizes
      : [];
  const totalStock = selectedSizes.length
    ? selectedSizes.reduce((sum, s) => sum + Number(s.stock || 0), 0)
    : Number(product.stock || 0);
  const inStock = totalStock > 0;
  const price =
    selectedSizes.length > 0
      ? Math.min(...selectedSizes.map((size) => Number(size.price || 0)))
      : product.price ?? product.salePrice ?? "-";
  const displayPrice =
    price === null || price === undefined || price === "" ? "--" : price;
  const stockLabel = selectedColor?.name
    ? `${selectedColor.name}: ${inStock ? `${totalStock} in stock` : "Out of Stock"}`
    : inStock
    ? `${totalStock} in stock`
    : "Out of Stock";

  const colorImages = Array.isArray(selectedColor?.images)
    ? selectedColor.images
    : [];

  const allImages = colorImages.length > 0 ? colorImages : product.images || [];
  const defaultImage = allImages[0] || fallbackImage;

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

  if (view === "list") {
    return (
      <div
        role={onView ? "button" : undefined}
        tabIndex={onView ? 0 : undefined}
        onClick={() => onView?.(product)}
        onKeyDown={(e) => {
          if (onView && (e.key === "Enter" || e.key === " ")) {
            e.preventDefault();
            onView(product);
          }
        }}
        className={`flex w-full gap-5 rounded-[2rem] border border-black/5 bg-[linear-gradient(180deg,_rgba(255,255,255,0.98)_0%,_rgba(255,247,242,0.95)_100%)] p-5 shadow-[0_18px_42px_rgba(15,23,42,0.06)] transition hover:shadow-lg ${
          onView ? "cursor-pointer" : ""
        }`}
      >
        <img
          src={imgToShow}
          alt={productTitle}
          className="h-48 w-32 shrink-0 rounded-[1.35rem] border border-black/5 object-cover"
        />

        <div className="flex grow flex-col justify-center">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-[#fff1ec] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#b42318]">
              {product.category || "Uncategorized"}
            </span>
            <span className="rounded-full border border-black/5 bg-white/90 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">
              SKU {product.sku || "N/A"}
            </span>
          </div>

          <h2 className="mt-3 text-[1.35rem] font-semibold leading-8 text-slate-900">
            {productTitle}
          </h2>

          <p className="mt-3 max-w-4xl line-clamp-3 text-sm leading-6 text-slate-600">
            {product.description || "No product description added yet."}
          </p>

          {product.colors && product.colors.length > 1 && (
            <div className="mt-4 flex flex-wrap items-center gap-2">
              {product.colors.map((clr, idx) => (
                <button
                  key={idx}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedColorIndex(idx);
                    setSlideIndex(0);
                  }}
                  className={`h-4 w-4 rounded-full border ${
                    idx === selectedColorIndex
                      ? "ring-2 ring-blue-500"
                      : "ring-1 ring-gray-300"
                  }`}
                  style={{ backgroundColor: clr.hex || clr.hexCode || clr.name }}
                  title={clr.name}
                />
              ))}
            </div>
          )}
        </div>

        <div className="flex min-w-[220px] flex-col justify-between">
          <div className="rounded-[1.5rem] border border-black/5 bg-white/90 px-5 py-5 text-right shadow-sm">
            <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">
              Starting Price
            </div>
            <div className="mt-2 text-3xl font-bold text-slate-950">
              {displayPrice === "--" ? "Rs. --" : `Rs. ${displayPrice}`}
            </div>

            <span
              className={`mt-4 inline-flex rounded-full px-4 py-1.5 text-sm font-semibold ${
                inStock
                  ? "bg-emerald-100 text-emerald-700"
                  : "bg-rose-100 text-rose-600"
              }`}
            >
              {stockLabel}
            </span>
          </div>

          <div className="mt-5 flex gap-3">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit(product);
              }}
              className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm"
            >
              <Pencil size={15} /> Edit
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(product._id);
              }}
              className="inline-flex items-center gap-2 rounded-full border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-600"
            >
              <Trash2 size={15} /> Delete
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      role={onView ? "button" : undefined}
      tabIndex={onView ? 0 : undefined}
      onClick={() => onView?.(product)}
      onKeyDown={(e) => {
        if (onView && (e.key === "Enter" || e.key === " ")) {
          e.preventDefault();
          onView(product);
        }
      }}
      className={`overflow-hidden rounded-[1.8rem] border border-black/5 bg-[linear-gradient(180deg,_rgba(255,255,255,0.98)_0%,_rgba(255,246,242,0.94)_100%)] shadow-[0_16px_38px_rgba(15,23,42,0.06)] transition hover:shadow-md dark:bg-white/5 ${
        onView ? "cursor-pointer" : ""
      }`}
    >
      <div
        className="relative overflow-hidden bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.6),_rgba(249,240,234,0.95))]"
        onMouseEnter={() => setHovering(true)}
        onMouseLeave={() => {
          setHovering(false);
          setSlideIndex(0);
        }}
      >
        <img
          src={imgToShow}
          alt={productTitle}
          className="h-80 w-full object-cover transition-all duration-300"
        />

        <div className="absolute left-3 right-3 top-3 flex flex-wrap items-start justify-between gap-2">
          {showCategoryBadge ? (
            <span className="max-w-full rounded-full bg-white/90 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-700 shadow">
              {product.category || "Uncategorized"}
            </span>
          ) : (
            <span />
          )}

          <span
            className={`max-w-full rounded-full px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] shadow ${
              inStock
                ? "bg-emerald-200 text-emerald-900"
                : "bg-rose-200 text-rose-900"
            }`}
          >
            {stockLabel}
          </span>
        </div>
      </div>

      {product.colors && product.colors.length > 1 && (
        <div className="mt-3 flex gap-2 px-4">
          {product.colors.map((clr, idx) => (
            <button
              key={idx}
              onClick={(e) => {
                e.stopPropagation();
                setSelectedColorIndex(idx);
                setSlideIndex(0);
              }}
              className={`h-4 w-4 rounded-full border ${
                idx === selectedColorIndex
                  ? "ring-2 ring-blue-500"
                  : "ring-1 ring-gray-300"
              }`}
              style={{ backgroundColor: clr.hex || clr.hexCode || clr.name }}
              title={clr.name}
            />
          ))}
        </div>
      )}

      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-red-500/70">
              PrintedTeez
            </p>
            <p className="mt-2 line-clamp-2 text-[15px] font-semibold leading-6 text-slate-900">
              {productTitle}
            </p>
          </div>
          <div className="shrink-0 rounded-full border border-black/5 bg-white/85 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">
            {product.sku || "N/A"}
          </div>
        </div>

        <div className="mt-4 rounded-[1.35rem] border border-black/5 bg-white/80 p-3 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                Starting price
              </p>
              <p className="mt-1 text-xl font-semibold text-slate-950">
                {displayPrice === "--" ? "Rs. --" : `Rs. ${displayPrice}`}
              </p>
            </div>
            <div className="rounded-full bg-[#f7f4f1] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">
              {product.colors?.length || 0} colors
            </div>
          </div>
        </div>

        <div className="mt-4 flex justify-between gap-3">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit(product);
            }}
            className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-2.5 text-sm font-semibold text-slate-700 shadow-sm"
          >
            <Pencil size={14} /> Edit
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(product._id);
            }}
            className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-full border border-red-200 bg-red-50 px-3 py-2.5 text-sm font-semibold text-red-600"
          >
            <Trash2 size={14} /> Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
