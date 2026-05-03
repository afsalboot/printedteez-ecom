import React, { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Heart, ShoppingCart } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router";
import { fetchProductById } from "../redux/slices/productSlice";
import RecommendedSection from "../components/RecommendedSection";
import { addToCart } from "../redux/slices/cartSlice";
import { toggleWishlist } from "../redux/slices/wishlistSlice";

const formatCurrency = (value) =>
  `Rs. ${Number(value || 0).toLocaleString("en-IN", {
    maximumFractionDigits: 0,
  })}`;

const LOW_STOCK_LIMIT = 5;

const ProductDetails = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { product, loading } = useSelector((s) => s.products);
  const cartItems = useSelector((s) => s.cart?.items || []);
  const { token } = useSelector((s) => s.auth || {});
  const { items: wishlistItems = [], loading: wishlistLoading } = useSelector(
    (s) => s.wishlist || {}
  );

  const [selectedImage, setSelectedImage] = useState("");
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [showSpecs, setShowSpecs] = useState(true);

  useEffect(() => {
    if (id) dispatch(fetchProductById(id));
  }, [dispatch, id]);

  const getDisplayImages = () => {
    if (!product) return [];
    if (selectedColor?.images?.length > 0) return selectedColor.images;
    if (product.images?.length > 0) return product.images;
    return [];
  };

  useEffect(() => {
    if (!product) return;

    const nextColor = product.colors?.[0] || null;
    const nextImages =
      nextColor?.images?.length > 0
        ? nextColor.images
        : product.images?.length > 0
        ? product.images
        : [];

    setSelectedColor(nextColor);
    setSelectedSize("");
    setSelectedImage(nextImages[0] || "");
    setQuantity(1);
  }, [product]);

  useEffect(() => {
    const images = getDisplayImages();
    setSelectedImage(images[0] || "");
    setSelectedSize("");
    setQuantity(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedColor]);

  const displayImages = useMemo(() => getDisplayImages(), [product, selectedColor]);
  const selectedColorSizes = selectedColor?.sizes?.length
    ? selectedColor.sizes
    : product?.sizes || [];
  const selectedSizeData =
    selectedColorSizes.find((size) => size.size === selectedSize) || null;
  const lowestPrice = selectedColorSizes.length
    ? Math.min(...selectedColorSizes.map((size) => Number(size.price) || 0))
    : 0;
  const displayPrice = selectedSizeData?.price ?? lowestPrice;
  const totalStock =
    selectedColorSizes.reduce((acc, size) => acc + (size.stock || 0), 0) || 0;
  const outOfStock = totalStock === 0;
  const selectedStock = selectedSizeData?.stock ?? 0;
  const maxQuantity = selectedSizeData
    ? Math.max(selectedSizeData.stock || 1, 1)
    : Math.max(totalStock, 1);
  const selectedSizeLowStock =
    selectedSizeData &&
    Number(selectedSizeData.stock || 0) > 0 &&
    Number(selectedSizeData.stock || 0) <= LOW_STOCK_LIMIT;

  if (loading || !product) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center gap-3 text-sm text-gray-500">
          <span className="h-10 w-10 animate-spin rounded-full border-2 border-dashed border-gray-300" />
          <p>Loading product details...</p>
        </div>
      </div>
    );
  }

  const collectionsArray = Array.isArray(product.collections)
    ? product.collections
    : product.collections
    ? [product.collections]
    : [];
  const specs = [
    ["Material", product.material],
    ["Fit", product.fitType],
    ["Neck Type", product.neckType],
    ["Sleeve Type", product.sleeveType],
    ["Fabric Weight", product.fabricWeight],
    ["Pattern", product.pattern],
    ["Gender", product.sexCategory],
    ["Category", product.category],
  ];
  const isWishlisted = wishlistItems.some(
    (item) => (item?._id || item)?.toString() === product._id?.toString()
  );

  const inCart = cartItems.some((item) => {
    const itemProductId =
      item.productId?._id || item.productId || item.product?._id;
    const sameProduct = itemProductId?.toString() === product._id?.toString();
    const sameSize = !selectedSize || item.size === selectedSize;
    const sameColor = !selectedColor || item.color === selectedColor.name;

    return sameProduct && sameSize && sameColor;
  });

  const handleAddToCart = () => {
    if (!selectedSize && selectedColorSizes.length > 0) {
      alert("Please select a size");
      return;
    }

    if (!selectedColor && product.colors?.length > 0) {
      alert("Please select a color");
      return;
    }

    dispatch(
      addToCart({
        productId: product._id,
        product: product._id,
        size: selectedSize || null,
        color: selectedColor?.name || null,
        quantity,
        qty: quantity,
        price: displayPrice || 0,
        title: product.title,
        image: selectedImage,
      })
    );
  };

  const handleWishlistToggle = () => {
    if (!token) {
      alert("Please log in to save products to your wishlist.");
      navigate("/login");
      return;
    }

    dispatch(toggleWishlist(product._id)).then((result) => {
      if (!result?.ok && result?.error) {
        alert(result.error);
      }
    });
  };

  const incrementQuantity = () =>
    setQuantity((prev) => Math.min(prev + 1, Math.max(maxQuantity, 1)));
  const decrementQuantity = () => setQuantity((prev) => Math.max(prev - 1, 1));

  return (
    <div className="bg-[#f7f3ee] text-gray-900">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-wrap items-center gap-3 text-sm text-gray-500">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:border-black hover:text-black"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>
          <span>/</span>
          <button
            type="button"
            onClick={() => navigate("/shop")}
            className="transition hover:text-black"
          >
            {product.category || "Products"}
          </button>
          <span>/</span>
          <span className="truncate text-gray-800">{product.title}</span>
        </div>

        <div className="grid gap-8 lg:grid-cols-[minmax(0,1.1fr)_420px] xl:gap-12">
          <section className="min-w-0">
            <div className="overflow-hidden rounded-[2rem] border border-black/5 bg-white shadow-sm">
              <div className="grid gap-4 p-4 md:grid-cols-[88px_minmax(0,1fr)]">
                {displayImages.length > 1 && (
                  <div className="order-2 flex gap-3 overflow-x-auto md:order-1 md:flex-col md:overflow-x-hidden">
                    {displayImages.map((img, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => setSelectedImage(img)}
                        className={`h-20 w-20 shrink-0 overflow-hidden rounded-2xl border transition ${
                          selectedImage === img
                            ? "border-[#B21A15]"
                            : "border-black/10 hover:border-black/30"
                        }`}
                      >
                        <img
                          src={img}
                          alt={`${product.title} thumbnail ${index + 1}`}
                          className="h-full w-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                )}

                <div className="order-1 overflow-hidden rounded-[1.6rem] bg-[#f4efe9] md:order-2">
                  <div className="flex min-h-[24rem] items-center justify-center sm:min-h-[32rem]">
                    {selectedImage ? (
                      <img
                        src={selectedImage}
                        alt={product.title}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <p className="text-sm text-gray-500">No image available</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </section>

          <aside className="min-w-0">
            <div className="rounded-[2rem] border border-black/5 bg-white p-6 shadow-sm sm:p-7">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#B21A15]">
                    PrintedTeez
                  </p>
                  <h1 className="mt-2 text-3xl font-semibold leading-tight text-gray-950">
                    {product.title}
                  </h1>
                </div>

                <button
                  type="button"
                  onClick={handleWishlistToggle}
                  disabled={wishlistLoading}
                  className={`inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border transition ${
                    isWishlisted
                      ? "border-[#B21A15] bg-[#B21A15] text-white"
                      : "border-black/10 text-gray-700 hover:border-[#B21A15] hover:text-[#B21A15]"
                  } ${wishlistLoading ? "cursor-not-allowed opacity-70" : ""}`}
                >
                  <Heart className={`h-4 w-4 ${isWishlisted ? "fill-current" : ""}`} />
                </button>
              </div>

              <div className="mt-5 flex flex-wrap items-center gap-2">
                {product.featured && (
                  <span className="rounded-full bg-black px-3 py-1 text-xs font-medium text-white">
                    Featured
                  </span>
                )}
                {product.limitedEdition && (
                  <span className="rounded-full bg-[#2d2a2a] px-3 py-1 text-xs font-medium text-white">
                    Limited Edition
                  </span>
                )}
                {product.discount > 0 && (
                  <span className="rounded-full bg-[#fff1ef] px-3 py-1 text-xs font-medium text-[#B21A15]">
                    {product.discount}% OFF
                  </span>
                )}
              </div>

              <div className="mt-6 border-y border-black/5 py-5">
                <div className="flex flex-wrap items-end gap-3">
                  <p className="text-3xl font-semibold text-gray-950">
                    {displayPrice ? formatCurrency(displayPrice) : "Price unavailable"}
                  </p>
                  {product.discount > 0 && product.mrp ? (
                    <p className="pb-1 text-sm text-gray-400 line-through">
                      {formatCurrency(product.mrp)}
                    </p>
                  ) : null}
                </div>
                <p className="mt-2 text-sm text-gray-500">
                  SKU: <span className="font-medium text-gray-700">{product.sku}</span>
                </p>
              </div>

              <p className="mt-5 text-sm leading-7 text-gray-600">
                {product.description || "A clean everyday essential with a more premium feel and an easy fit."}
              </p>

              {collectionsArray.length > 0 && (
                <div className="mt-5 flex flex-wrap gap-2">
                  {collectionsArray.map((collection, index) => (
                    <span
                      key={index}
                      className="rounded-full border border-black/10 px-3 py-1 text-xs text-gray-600"
                    >
                      {collection}
                    </span>
                  ))}
                </div>
              )}

              {product.colors?.length > 0 && (
                <div className="mt-7">
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-gray-800">
                      Color
                    </h2>
                    <span className="text-xs text-gray-500">
                      {selectedColor?.name || "Select"}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2.5">
                    {product.colors.map((color, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => setSelectedColor(color)}
                        className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm transition ${
                          selectedColor?.name === color.name
                            ? "border-[#B21A15] bg-[#B21A15] text-white"
                            : "border-black/10 text-gray-700 hover:border-black/30"
                        }`}
                      >
                        <span
                          className="h-4 w-4 rounded-full border border-black/10"
                          style={{ backgroundColor: color.hex }}
                        />
                        {color.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {selectedColorSizes.length > 0 && (
                <div className="mt-7">
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-gray-800">
                      Size
                    </h2>
                    <span
                      className={`text-xs ${
                        selectedSizeLowStock ? "font-semibold text-amber-600" : "text-gray-500"
                      }`}
                    >
                      {selectedSizeData
                        ? selectedStock === 0
                          ? "Out of stock"
                          : selectedSizeLowStock
                          ? `Only ${selectedStock} left`
                          : ""
                        : "Select a size"}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2.5">
                    {selectedColorSizes.map((size, index) => (
                      <button
                        key={index}
                        type="button"
                        disabled={size.stock === 0}
                        onClick={() => {
                          setSelectedSize(size.size);
                          setQuantity(1);
                        }}
                        className={`min-w-[5.75rem] rounded-2xl border px-4 py-3 text-sm font-medium transition ${
                          selectedSize === size.size
                            ? "border-black bg-black text-white"
                            : "border-black/10 text-gray-800 hover:border-black/30"
                        } ${
                          size.stock === 0
                            ? "cursor-not-allowed opacity-35 line-through"
                            : ""
                        }`}
                      >
                        <span className="block">{size.size}</span>
                        {Number(size.stock || 0) > 0 &&
                        Number(size.stock || 0) <= LOW_STOCK_LIMIT ? (
                          <span
                            className={`mt-1 block text-[11px] font-semibold ${
                              selectedSize === size.size
                                ? "text-white/85"
                                : "text-amber-600"
                            }`}
                          >
                            {size.stock} left
                          </span>
                        ) : null}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="mt-7 grid gap-4">
                <div>
                  <p className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-gray-800">
                    Quantity
                  </p>
                  <div className="inline-flex items-center rounded-full border border-black/10 px-3 py-2">
                    <button
                      type="button"
                      onClick={decrementQuantity}
                      className="flex h-8 w-8 items-center justify-center rounded-full text-lg transition hover:bg-gray-100"
                    >
                      -
                    </button>
                    <span className="min-w-[2.5rem] text-center text-base font-semibold">
                      {quantity}
                    </span>
                    <button
                      type="button"
                      onClick={incrementQuantity}
                      disabled={outOfStock || maxQuantity <= quantity}
                      className="flex h-8 w-8 items-center justify-center rounded-full text-lg transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-35"
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  {inCart ? (
                    <button
                      type="button"
                      onClick={() => navigate("/cart")}
                      className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-green-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-green-700"
                    >
                      <ShoppingCart className="h-4 w-4" />
                      View Cart
                    </button>
                  ) : (
                    <button
                      type="button"
                      disabled={outOfStock}
                      onClick={handleAddToCart}
                      className={`inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-semibold transition ${
                        outOfStock
                          ? "cursor-not-allowed bg-gray-200 text-gray-500"
                          : "bg-black text-white hover:bg-gray-900"
                      }`}
                    >
                      <ShoppingCart className="h-4 w-4" />
                      {outOfStock ? "Notify Me" : "Add to Cart"}
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={handleWishlistToggle}
                    disabled={wishlistLoading}
                    className={`inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full border px-6 py-3 text-sm font-semibold transition ${
                      isWishlisted
                        ? "border-[#B21A15] bg-[#B21A15] text-white"
                        : "border-black/10 text-gray-800 hover:border-[#B21A15] hover:text-[#B21A15]"
                    } ${wishlistLoading ? "cursor-not-allowed opacity-70" : ""}`}
                  >
                    <Heart className={`h-4 w-4 ${isWishlisted ? "fill-current" : ""}`} />
                    {isWishlisted ? "Wishlisted" : "Save"}
                  </button>
                </div>
              </div>
            </div>
          </aside>
        </div>

        <section className="mt-10 grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start">
          <div className="rounded-[2rem] border border-black/5 bg-white p-6 shadow-sm sm:p-7">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#B21A15]">
                  Details
                </p>
                <h2 className="mt-2 text-2xl font-semibold text-gray-950">
                  Product Specifications
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setShowSpecs((prev) => !prev)}
                className="rounded-full border border-black/10 px-4 py-2 text-xs font-medium text-gray-600 transition hover:border-black hover:text-black"
              >
                {showSpecs ? "Hide" : "Show"}
              </button>
            </div>

            {showSpecs && (
              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                {specs.map(([label, value]) => (
                  <div
                    key={label}
                    className="rounded-[1.4rem] bg-[#f8f4ef] px-4 py-4"
                  >
                    <p className="text-xs font-medium uppercase tracking-[0.16em] text-gray-500">
                      {label}
                    </p>
                    <p className="mt-2 text-sm font-medium text-gray-900">
                      {value || "-"}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {!showSpecs && (
              <p className="mt-6 text-sm text-gray-500">
                Tap show to view fabric, fit, and category details.
              </p>
            )}
          </div>

          <div className="self-start rounded-[2rem] border border-black/5 bg-[#201c1b] p-6 text-white shadow-sm sm:p-7">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-white/55">
              Quick Notes
            </p>
              <div className="mt-5 space-y-4 text-sm leading-6 text-white/72">
              <p>Clean layout, everyday styling, and a more premium presentation.</p>
              <p>Best paired with relaxed denim, cargos, or neutral layering pieces.</p>
              <p>Stock and size availability update based on the selected color.</p>
            </div>
          </div>
        </section>

        <div className="mt-16">
          <RecommendedSection />
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
