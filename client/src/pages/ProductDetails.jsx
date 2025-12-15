import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useNavigate } from "react-router";
import { fetchProductById } from "../redux/slices/productSlice";
import { ShoppingCart } from "lucide-react";
import RecommendedSection from "../components/RecommendedSection";
import { addToCart } from "../redux/slices/cartSlice";

const ProductDetails = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { product, loading } = useSelector((s) => s.products);
  const cartItems = useSelector((s) => s.cart?.items || []);

  const [selectedImage, setSelectedImage] = useState("");
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [showSpecs, setShowSpecs] = useState(false);

  useEffect(() => {
    if (id) dispatch(fetchProductById(id));
  }, [id, dispatch]);

  const getDisplayImages = () => {
    if (!product) return [];

    if (selectedColor && selectedColor.images?.length > 0) {
      return selectedColor.images;
    }

    if (product.images?.length > 0) {
      return product.images;
    }

    return [];
  };

  useEffect(() => {
    if (!product) return;

    if (product.colors?.length > 0) {
      setSelectedColor(product.colors[0]);
    }

    const imgs = getDisplayImages();
    if (imgs.length > 0) setSelectedImage(imgs[0]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product]);

  useEffect(() => {
    const imgs = getDisplayImages();
    if (imgs.length > 0) setSelectedImage(imgs[0]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedColor]);

  if (loading || !product) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="flex flex-col items-center gap-3 text-gray-500 text-sm">
          <span className="w-10 h-10 rounded-full border-2 border-dashed border-gray-300 animate-spin" />
          <p>Loading product details...</p>
        </div>
      </div>
    );
  }

  const price = product.sizes?.length
    ? Math.min(...product.sizes.map((s) => s.price))
    : "N/A";

  const totalStock = product.sizes?.reduce((acc, s) => acc + (s.stock || 0), 0);
  const outOfStock = totalStock === 0;

  const collectionsArray = Array.isArray(product.collections)
    ? product.collections
    : product.collections
    ? [product.collections]
    : [];

  // inCart logic
  const inCart = cartItems.some((item) => {
    const itemProductId =
      item.productId?._id || item.productId || item.product?._id;

    const sameProduct = itemProductId?.toString() === product._id?.toString();
    const sameSize = !selectedSize || item.size === selectedSize;
    const sameColor = !selectedColor || item.color === selectedColor.name;

    return sameProduct && sameSize && sameColor;
  });

  const handleAddToCart = () => {
    if (!selectedSize && product.sizes?.length > 0) {
      alert("Please select a size");
      return;
    }

    if (!selectedColor && product.colors?.length > 0) {
      alert("Please select a color");
      return;
    }

    const finalPrice = price === "N/A" ? 0 : price;

    const payload = {
      productId: product._id,
      product: product._id,
      size: selectedSize || null,
      color: selectedColor?.name || null,
      quantity,
      qty: quantity,
      price: finalPrice,
      title: product.title,
      image: selectedImage,
    };

    dispatch(addToCart(payload));
  };

  return (
    <div className="bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* BREADCRUMB / CONTEXT */}
        <div className="mb-4 text-xs text-gray-500 flex flex-wrap gap-1 items-center">
          <button
            type="button"
            onClick={() => navigate("/")}
            className="cursor-pointer hover:underline"
          >
            Home
          </button>
          <span>/</span>
          <button
            type="button"
            onClick={() => navigate("/shop")}
            className="cursor-pointer hover:underline"
          >
            {product.category || "Products"}
          </button>
          <span>/</span>
          <span className="text-gray-700 truncate max-w-[60%] sm:max-w-none">
            {product.title}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-10 items-start">
          {/* LEFT IMAGES */}
          <div className="space-y-4">
            <div className="w-full max-w-xl mx-auto bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl overflow-hidden flex justify-center items-center shadow-sm min-h-80 sm:min-h-[420px]">
              {selectedImage ? (
                <img
                  src={selectedImage}
                  alt={product.title}
                  className="object-cover w-full h-full transition-transform duration-300 ease-out hover:scale-105"
                />
              ) : (
                <p className="text-gray-500 text-sm">No Image</p>
              )}
            </div>

            {getDisplayImages().length > 0 && (
              <div className="flex gap-3 mt-3 flex-wrap">
                {getDisplayImages().map((img, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setSelectedImage(img)}
                    className={`w-20 h-20 rounded-lg overflow-hidden border transition-all duration-200
                      ${
                        selectedImage === img
                          ? "border-black shadow-md scale-105"
                          : "border-gray-300 hover:border-black hover:shadow-sm"
                      }
                    `}
                  >
                    <img
                      src={img}
                      alt={`${product.title} thumbnail ${i + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* RIGHT PANEL */}
          <div className="flex flex-col gap-5 lg:gap-6">
            {/* TITLE + BADGES + STATUS */}
            <div className="space-y-2 border-b pb-3">
              <h1 className="text-2xl md:text-3xl lg:text-4xl font-semibold leading-tight">
                {product.title}
              </h1>

              {collectionsArray.length > 0 && (
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  {collectionsArray.map((col, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center rounded-full border border-gray-300 px-3 py-1 uppercase tracking-wide text-[10px] bg-white"
                    >
                      {col}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* BADGES + STOCK + SKU */}
            <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
              {product.featured && (
                <span className="inline-flex items-center rounded-full px-3 py-1 text-[11px] font-semibold bg-black text-white">
                  Featured
                </span>
              )}

              {product.limitedEdition && (
                <span className="inline-flex items-center rounded-full px-3 py-1 text-[11px] font-semibold bg-gray-900 text-gray-100">
                  Limited Edition
                </span>
              )}

              {product.discount > 0 && (
                <span className="inline-flex items-center rounded-full px-3 py-1 text-[11px] font-semibold bg-red-50 text-red-600 border border-red-200">
                  {product.discount}% OFF
                </span>
              )}

              {outOfStock ? (
                <span className="inline-flex items-center rounded-full px-3 py-1 text-[11px] font-semibold bg-red-50 text-red-600 border border-red-200">
                  Out of Stock
                </span>
              ) : (
                <span className="inline-flex items-center rounded-full px-3 py-1 text-[11px] font-semibold bg-green-50 text-green-700 border border-green-200">
                  In Stock ({totalStock})
                </span>
              )}

              <span className="text-[11px] text-gray-500">
                SKU:{" "}
                <span className="font-medium text-gray-700">{product.sku}</span>
              </span>
            </div>  

            {/* PRICE + DESCRIPTION */}
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <p className="text-3xl font-bold text-red-500">
                  ₹{price !== "N/A" ? price : "-"}
                </p>
                {product.discount > 0 && product.mrp && (
                  <p className="text-sm text-gray-500 line-through">
                    ₹{product.mrp}
                  </p>
                )}
              </div>
              <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-line">
                {product.description}
              </p>
            </div>

            {/* COLORS */}
            {product.colors?.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-sm uppercase tracking-wide">
                    Select Color
                  </h3>
                  {selectedColor && (
                    <span className="text-xs text-gray-500">
                      Selected:{" "}
                      <span className="font-medium text-gray-800">
                        {selectedColor.name}
                      </span>
                    </span>
                  )}
                </div>

                <div className="flex gap-3 flex-wrap">
                  {product.colors.map((c, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setSelectedColor(c)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-full border text-sm transition-all duration-200
                        ${
                          selectedColor?.name === c.name
                            ? "border-black bg-black text-white shadow-sm"
                            : "border-gray-300 bg-white hover:border-black hover:shadow-sm"
                        }`}
                    >
                      <span
                        className="w-4 h-4 rounded-full border border-gray-300"
                        style={{ backgroundColor: c.hex }}
                      ></span>
                      {c.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* SIZE */}
            {product.sizes?.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-sm uppercase tracking-wide">
                    Select Size
                  </h3>
                  <button
                    type="button"
                    className="text-xs underline text-gray-500 hover:text-gray-800"
                  >
                    Size Guide
                  </button>
                </div>

                <div className="flex gap-3 flex-wrap">
                  {product.sizes.map((s, i) => (
                    <button
                      key={i}
                      type="button"
                      disabled={s.stock === 0}
                      onClick={() => setSelectedSize(s.size)}
                      className={`
                        px-5 py-2 rounded-full border text-sm font-medium transition-all duration-200
                        ${
                          selectedSize === s.size
                            ? "bg-black text-white border-black shadow-sm"
                            : "bg-white text-gray-800 border-gray-300 hover:border-black hover:shadow-sm"
                        }
                        ${
                          s.stock === 0
                            ? "opacity-40 cursor-not-allowed line-through"
                            : "cursor-pointer"
                        }
                      `}
                    >
                      {s.size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* QUANTITY */}
            <div className="space-y-2">
              <h3 className="font-semibold text-sm uppercase tracking-wide">
                Quantity
              </h3>
              <div className="inline-flex items-center gap-3 border rounded-full px-4 py-2 bg-white shadow-sm">
                <button
                  type="button"
                  onClick={() => quantity > 1 && setQuantity(quantity - 1)}
                  className="w-8 h-8 flex items-center justify-center rounded-full border text-lg leading-none hover:bg-gray-100 transition"
                >
                  -
                </button>

                <p className="text-lg font-semibold min-w-[2rem] text-center">
                  {quantity}
                </p>

                <button
                  type="button"
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-8 h-8 flex items-center justify-center rounded-full border text-lg leading-none hover:bg-gray-100 transition"
                >
                  +
                </button>
              </div>
            </div>

            {/* ADD TO CART / VIEW CART */}
            <div className="pt-2">
              {inCart ? (
                <button
                  type="button"
                  onClick={() => navigate("/cart")}
                  className="flex w-full sm:w-60 justify-center items-center gap-2 px-6 py-3 rounded-full bg-green-600 text-white font-semibold text-sm tracking-wide transition-all duration-200 shadow-sm hover:bg-green-700"
                >
                  <ShoppingCart size={18} />
                  View Cart
                </button>
              ) : (
                <button
                  type="button"
                  disabled={outOfStock}
                  onClick={handleAddToCart}
                  className={`flex w-full sm:w-60 justify-center items-center gap-2 px-6 py-3 rounded-full text-white font-semibold text-sm tracking-wide transition-all duration-200 shadow-sm
                    ${
                      outOfStock
                        ? "bg-gray-300 cursor-not-allowed shadow-none"
                        : "bg-black hover:bg-gray-900 hover:shadow-md"
                    }`}
                >
                  <ShoppingCart size={18} />
                  {outOfStock ? "Notify Me" : "Add to Cart"}
                </button>
              )}
            </div>

            {/* PRODUCT SPECIFICATIONS */}
            <div className="mt-2 p-5 bg-gray-50 rounded-xl border shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-base font-semibold">
                  Product Specifications
                </h3>
                <button
                  type="button"
                  onClick={() => setShowSpecs((prev) => !prev)}
                  className="text-xs text-gray-500 hover:text-gray-800 underline"
                  aria-expanded={showSpecs}
                >
                  {showSpecs ? "Hide" : "Show"}
                </button>
              </div>

              {showSpecs && (
                <div className="grid grid-cols-2 gap-y-2 text-sm">
                  <p className="text-gray-500">Material:</p>
                  <p className="font-medium text-gray-800">
                    {product.material || "-"}
                  </p>

                  <p className="text-gray-500">Neck Type:</p>
                  <p className="font-medium text-gray-800">
                    {product.neckType || "-"}
                  </p>

                  <p className="text-gray-500">Pattern:</p>
                  <p className="font-medium text-gray-800">
                    {product.pattern || "-"}
                  </p>

                  <p className="text-gray-500">Gender:</p>
                  <p className="font-medium text-gray-800">
                    {product.sexCategory || "-"}
                  </p>

                  <p className="text-gray-500">Sleeve Type:</p>
                  <p className="font-medium text-gray-800">
                    {product.sleeveType || "-"}
                  </p>

                  <p className="text-gray-500">Fit Type:</p>
                  <p className="font-medium text-gray-800">
                    {product.fitType || "-"}
                  </p>

                  <p className="text-gray-500">Fabric Weight:</p>
                  <p className="font-medium text-gray-800">
                    {product.fabricWeight || "-"}
                  </p>

                  <p className="text-gray-500">Category:</p>
                  <p className="font-medium text-gray-800">
                    {product.category || "-"}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* RECOMMENDED */}
        <div className="mt-16">
          <RecommendedSection />
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
