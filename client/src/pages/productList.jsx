import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchProducts } from "../redux/slices/productSlice.jsx";
import ProductCard from "../components/ProductCard.jsx";
import { useSearchParams, Link } from "react-router";

const ProductList = () => {
  const dispatch = useDispatch();
  const { products = [], loading } = useSelector((state) => state.products);

  const [searchParams] = useSearchParams();
  const category = searchParams.get("category");

  useEffect(() => {
    const params = {};
    if (category) params.category = category;
    dispatch(fetchProducts(params));
  }, [category, dispatch]);

  const hasProducts = products && products.length > 0;

  // Decide where "back" should go
  const backTo = category ? "/" : "/shop";
  const backLabel = category ? "Back to Home" : "Back to Shop";

  return (
    <div className="bg-white dark:bg-black min-h-screen">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header / Filter Info */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-6 pb-3 border-b border-gray-200/70 dark:border-gray-800">
          <div>
            <h1 className="text-2xl md:text-3xl font-semibold text-gray-900 dark:text-gray-100">
              {category ? "Category Results" : "All Products"}
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {hasProducts
                ? `${products.length} product${
                    products.length > 1 ? "s" : ""
                  } found`
                : loading
                ? "Fetching products..."
                : "No products available for this filter."}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 justify-between md:justify-end">
            {category && (
              <div className="flex items-center gap-2 text-sm">
                <span className="text-gray-600 dark:text-gray-300">
                  Category:
                </span>
                <span className="px-3 py-1 rounded-full bg-gray-100 dark:bg-gray-800 text-blue-500 text-xs font-medium">
                  {category}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-100/80 dark:bg-gray-900/40 p-3 animate-pulse flex flex-col gap-3"
              >
                <div className="w-full h-40 rounded-lg bg-gray-300 dark:bg-gray-800" />
                <div className="h-3 w-3/4 rounded bg-gray-300 dark:bg-gray-800" />
                <div className="h-3 w-1/2 rounded bg-gray-300 dark:bg-gray-800" />
                <div className="h-8 w-full rounded bg-gray-300 dark:bg-gray-800 mt-1" />
              </div>
            ))}
          </div>
        )}

        {/* No Products */}
        {!loading && !hasProducts && (
          <div className="text-center mt-20">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-900 mb-4">
              <span className="text-2xl">🛒</span>
            </div>
            <p className="text-gray-700 dark:text-gray-200 text-lg font-medium mb-2">
              No products found
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-5">
              {category
                ? "This category has no products yet. Try exploring other sections from the homepage."
                : "Try clearing filters or explore all available styles in our shop."}
            </p>
            <Link
              to={backTo}
              className="inline-block px-5 py-2.5 rounded-full bg-black text-white text-sm font-medium hover:opacity-90 transition"
            >
              {backLabel}
            </Link>
          </div>
        )}

        {/* Product List */}
        {!loading && hasProducts && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((product) => {
              const price = product.sizes?.length
                ? Math.min(...product.sizes.map((s) => s.price))
                : "N/A";

              const totalStock = product.sizes?.reduce(
                (acc, s) => acc + (s.stock || 0),
                0
              );

              const lowStock = product.sizes?.some(
                (s) => s.stock > 0 && s.stock < 4
              );

              let badge = null;
              if (totalStock === 0) {
                badge = "Out of Stock";
              } else if (lowStock) {
                badge = "Low Stock";
              }

              return (
                <div key={product._id} className="flex justify-center">
                  <ProductCard
                    id={product._id}
                    image={
                      product.colors?.[0]?.images?.[0] ||
                      product.images?.[0] ||
                      "/no-image.png"
                    }
                    title={product.title || product.name}
                    price={price}
                    badge={badge}
                  />
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductList;
