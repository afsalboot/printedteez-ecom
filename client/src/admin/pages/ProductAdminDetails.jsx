import React, { useEffect, useMemo, useState } from "react";
import { AlertTriangle, ArrowLeft, Box, CircleAlert, PackageX, Pencil } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router";
import { fetchProductById } from "../../redux/slices/productSlice";

const LOW_STOCK_LIMIT = 5;
const cardClass =
  "rounded-[1.8rem] border border-white/60 bg-white/95 p-6 shadow-[0_18px_40px_rgba(15,23,42,0.06)] backdrop-blur-sm";

const formatCurrency = (value) =>
  `Rs. ${Number(value || 0).toLocaleString("en-IN", {
    maximumFractionDigits: 0,
  })}`;

const ProductAdminDetails = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { product, loading } = useSelector((state) => state.products || {});
  const [selectedColorIndex, setSelectedColorIndex] = useState(0);

  useEffect(() => {
    if (id) dispatch(fetchProductById(id));
  }, [dispatch, id]);

  useEffect(() => {
    setSelectedColorIndex(0);
  }, [product?._id]);

  const colorVariants = useMemo(() => {
    if (!product) return [];
    if (Array.isArray(product.colors) && product.colors.length > 0) {
      return product.colors.map((color) => ({
        ...color,
        sizes: Array.isArray(color.sizes) ? color.sizes : [],
      }));
    }
    return [
      {
        name: "Default",
        hex: "#111827",
        images: Array.isArray(product.images) ? product.images : [],
        sizes: Array.isArray(product.sizes) ? product.sizes : [],
      },
    ];
  }, [product]);

  const selectedColor = colorVariants[selectedColorIndex] || colorVariants[0] || null;
  const selectedSizes = Array.isArray(selectedColor?.sizes) ? selectedColor.sizes : [];

  const totals = useMemo(() => {
    let soldOutVariants = [];
    let lowStockVariants = [];
    let soldOutColors = [];
    let lowStockColors = [];

    colorVariants.forEach((color) => {
      const colorTotal = (color.sizes || []).reduce(
        (sum, size) => sum + Number(size.stock || 0),
        0
      );

      if (colorTotal <= 0) {
        soldOutColors.push(color.name);
      } else if (colorTotal <= LOW_STOCK_LIMIT) {
        lowStockColors.push({ name: color.name, stock: colorTotal });
      }

      (color.sizes || []).forEach((size) => {
        const stock = Number(size.stock || 0);
        const label = `${color.name} / ${size.size}`;
        if (stock <= 0) soldOutVariants.push(label);
        else if (stock <= LOW_STOCK_LIMIT) {
          lowStockVariants.push({ label, stock });
        }
      });
    });

    return { soldOutVariants, lowStockVariants, soldOutColors, lowStockColors };
  }, [colorVariants]);

  const sizeChartRows = useMemo(
    () =>
      Array.isArray(product?.sizeChart)
        ? product.sizeChart.filter((row) => row.size)
        : [],
    [product]
  );

  if (loading || !product) {
    return (
      <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(178,26,21,0.08),_transparent_28%),linear-gradient(180deg,_#f8f4ef_0%,_#f1ebe4_100%)] p-5 text-slate-900">
        <div className="mx-auto max-w-7xl rounded-[1.8rem] border border-white/60 bg-white/95 p-8 text-center shadow-[0_18px_40px_rgba(15,23,42,0.06)]">
          Loading product details...
        </div>
      </div>
    );
  }

  const primaryImage =
    selectedColor?.images?.[0] || product.images?.[0] || "https://placehold.co/900x1100?text=Product";
  const totalStock = selectedSizes.reduce((sum, size) => sum + Number(size.stock || 0), 0);
  const lowestPrice = selectedSizes.length
    ? Math.min(...selectedSizes.map((size) => Number(size.price || 0)))
    : 0;

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
            <p className="mt-4 text-[11px] font-semibold uppercase tracking-[0.3em] text-[#B21A15]">
              Products / Details
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
              {product.title}
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600">
              Inspect variant inventory, identify low-stock or sold-out combinations, and review the size chart before editing.
            </p>
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => navigate(`/admin/products/edit/${product._id}`)}
              className="inline-flex items-center gap-2 rounded-full bg-[#B21A15] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#97150f]"
            >
              <Pencil className="h-4 w-4" />
              Edit Product
            </button>
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_380px]">
          <div className="space-y-6">
            <section className={cardClass}>
              <div className="overflow-hidden rounded-[1.8rem] border border-slate-200 bg-[#fbfaf7]">
                <div className="grid gap-4 p-4 md:grid-cols-[110px_minmax(0,1fr)]">
                  <div className="flex gap-3 overflow-x-auto md:flex-col">
                    {(selectedColor?.images?.length ? selectedColor.images : product.images || []).map(
                      (image, index) => (
                        <img
                          key={`${image}-${index}`}
                          src={image}
                          alt={`${product.title} ${index + 1}`}
                          className="h-24 w-24 shrink-0 rounded-[1.2rem] border border-slate-200 object-cover"
                        />
                      )
                    )}
                  </div>
                  <div className="overflow-hidden rounded-[1.6rem] bg-[#f2ece6]">
                    <img
                      src={primaryImage}
                      alt={product.title}
                      className="h-full min-h-[420px] w-full object-cover"
                    />
                  </div>
                </div>
              </div>
            </section>

            <section className={cardClass}>
              <div className="mb-5">
                <h2 className="text-xl font-semibold">Inventory Alerts</h2>
                <p className="mt-1 text-xs leading-5 text-slate-500">
                  Alerts trigger when a color or size has `5` or fewer units left, or is fully sold out.
                </p>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-[1.5rem] border border-amber-200 bg-amber-50 p-4">
                  <div className="flex items-center gap-2 text-sm font-semibold text-amber-700">
                    <AlertTriangle className="h-4 w-4" />
                    Low Stock Sizes
                  </div>
                  <div className="mt-3 space-y-2 text-sm text-amber-900">
                    {totals.lowStockVariants.length ? (
                      totals.lowStockVariants.map((entry) => (
                        <p key={entry.label}>{entry.label}: {entry.stock} left</p>
                      ))
                    ) : (
                      <p>No low-stock size variants.</p>
                    )}
                  </div>
                </div>

                <div className="rounded-[1.5rem] border border-rose-200 bg-rose-50 p-4">
                  <div className="flex items-center gap-2 text-sm font-semibold text-rose-700">
                    <PackageX className="h-4 w-4" />
                    Sold Out Sizes
                  </div>
                  <div className="mt-3 space-y-2 text-sm text-rose-900">
                    {totals.soldOutVariants.length ? (
                      totals.soldOutVariants.map((entry) => <p key={entry}>{entry}</p>)
                    ) : (
                      <p>No sold-out size variants.</p>
                    )}
                  </div>
                </div>

                <div className="rounded-[1.5rem] border border-orange-200 bg-orange-50 p-4">
                  <div className="flex items-center gap-2 text-sm font-semibold text-orange-700">
                    <CircleAlert className="h-4 w-4" />
                    Low Stock Colors
                  </div>
                  <div className="mt-3 space-y-2 text-sm text-orange-900">
                    {totals.lowStockColors.length ? (
                      totals.lowStockColors.map((entry) => (
                        <p key={entry.name}>{entry.name}: {entry.stock} total left</p>
                      ))
                    ) : (
                      <p>No low-stock colors.</p>
                    )}
                  </div>
                </div>

                <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-4">
                  <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                    <Box className="h-4 w-4" />
                    Sold Out Colors
                  </div>
                  <div className="mt-3 space-y-2 text-sm text-slate-900">
                    {totals.soldOutColors.length ? (
                      totals.soldOutColors.map((entry) => <p key={entry}>{entry}</p>)
                    ) : (
                      <p>No sold-out colors.</p>
                    )}
                  </div>
                </div>
              </div>
            </section>

            <section className={cardClass}>
              <div className="mb-5 flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-xl font-semibold">Size Chart</h2>
                  <p className="mt-1 text-xs leading-5 text-slate-500">
                    Garment measurements for each size. Add values like length, width, and chest.
                  </p>
                </div>
              </div>

              {sizeChartRows.length > 0 ? (
                <div className="overflow-x-auto rounded-[1.4rem] border border-slate-200">
                  <table className="min-w-full bg-white text-sm">
                    <thead className="bg-[#f8f4ef] text-slate-600">
                      <tr>
                        <th className="px-4 py-3 text-left font-semibold">Size</th>
                        <th className="px-4 py-3 text-left font-semibold">Length</th>
                        <th className="px-4 py-3 text-left font-semibold">Width</th>
                        <th className="px-4 py-3 text-left font-semibold">Chest</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sizeChartRows.map((row) => (
                        <tr key={row.size} className="border-t border-slate-100">
                          <td className="px-4 py-3 font-semibold text-slate-900">{row.size}</td>
                          <td className="px-4 py-3 text-slate-700">{row.length || "-"}</td>
                          <td className="px-4 py-3 text-slate-700">{row.width || "-"}</td>
                          <td className="px-4 py-3 text-slate-700">{row.chest || "-"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="rounded-[1.4rem] border border-dashed border-slate-200 bg-[#fbfaf7] px-4 py-6 text-sm text-slate-500">
                  No garment measurement size chart added yet.
                </div>
              )}
            </section>
          </div>

          <aside className="space-y-6 xl:sticky xl:top-8 xl:self-start">
            <section className={cardClass}>
              <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#B21A15]">
                Snapshot
              </p>
              <div className="mt-5 grid gap-3">
                <div className="rounded-[1.4rem] bg-[#fbfaf7] px-4 py-4">
                  <p className="text-[11px] uppercase tracking-[0.18em] text-slate-500">
                    SKU
                  </p>
                  <p className="mt-2 font-semibold text-slate-900">{product.sku || "--"}</p>
                </div>
                <div className="rounded-[1.4rem] bg-[#fbfaf7] px-4 py-4">
                  <p className="text-[11px] uppercase tracking-[0.18em] text-slate-500">
                    Selected Color
                  </p>
                  <p className="mt-2 font-semibold text-slate-900">{selectedColor?.name || "--"}</p>
                </div>
                <div className="rounded-[1.4rem] bg-[#fbfaf7] px-4 py-4">
                  <p className="text-[11px] uppercase tracking-[0.18em] text-slate-500">
                    Color Stock
                  </p>
                  <p className="mt-2 font-semibold text-slate-900">{totalStock}</p>
                </div>
                <div className="rounded-[1.4rem] bg-[#fbfaf7] px-4 py-4">
                  <p className="text-[11px] uppercase tracking-[0.18em] text-slate-500">
                    Starting Price
                  </p>
                  <p className="mt-2 font-semibold text-slate-900">
                    {lowestPrice ? formatCurrency(lowestPrice) : "--"}
                  </p>
                </div>
              </div>
            </section>

            <section className={cardClass}>
              <h2 className="text-xl font-semibold">Colors</h2>
              <div className="mt-4 space-y-3">
                {colorVariants.map((color, index) => {
                  const colorStock = (color.sizes || []).reduce(
                    (sum, size) => sum + Number(size.stock || 0),
                    0
                  );
                  const isLow = colorStock > 0 && colorStock <= LOW_STOCK_LIMIT;
                  const isSoldOut = colorStock <= 0;

                  return (
                    <button
                      key={color.name}
                      type="button"
                      onClick={() => setSelectedColorIndex(index)}
                      className={`w-full rounded-[1.4rem] border px-4 py-4 text-left transition ${
                        selectedColorIndex === index
                          ? "border-[#B21A15] bg-[#fff5f2]"
                          : "border-slate-200 bg-[#fbfaf7] hover:border-slate-300"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <span
                            className="h-5 w-5 rounded-full border border-black/10"
                            style={{ backgroundColor: color.hex || "#111827" }}
                          />
                          <div>
                            <p className="font-semibold text-slate-900">{color.name}</p>
                            <p className="text-xs text-slate-500">
                              {(color.sizes || []).length} sizes
                            </p>
                          </div>
                        </div>
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${
                            isSoldOut
                              ? "bg-rose-100 text-rose-700"
                              : isLow
                              ? "bg-amber-100 text-amber-700"
                              : "bg-emerald-100 text-emerald-700"
                          }`}
                        >
                          {isSoldOut ? "Sold out" : isLow ? `${colorStock} left` : colorStock}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </section>

            <section className={cardClass}>
              <h2 className="text-xl font-semibold">Selected Inventory</h2>
              <div className="mt-4 space-y-3">
                {selectedSizes.map((size) => {
                  const stock = Number(size.stock || 0);
                  const isLow = stock > 0 && stock <= LOW_STOCK_LIMIT;
                  const isSoldOut = stock <= 0;

                  return (
                    <div
                      key={`${selectedColor?.name}-${size.size}`}
                      className="rounded-[1.4rem] border border-slate-200 bg-[#fbfaf7] px-4 py-4"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="font-semibold text-slate-900">{size.size}</p>
                          <p className="text-sm text-slate-500">{formatCurrency(size.price)}</p>
                        </div>
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${
                            isSoldOut
                              ? "bg-rose-100 text-rose-700"
                              : isLow
                              ? "bg-amber-100 text-amber-700"
                              : "bg-emerald-100 text-emerald-700"
                          }`}
                        >
                          {isSoldOut ? "Sold out" : isLow ? `${stock} left` : `${stock} in stock`}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default ProductAdminDetails;
