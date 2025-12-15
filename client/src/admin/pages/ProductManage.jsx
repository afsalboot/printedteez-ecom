import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchProducts, deleteProduct } from "../../redux/slices/productSlice";
import { useNavigate } from "react-router";
import {
  PackagePlus,
  Grid,
  List,
  Search as SearchIcon,
  Filter as FilterIcon,
  RefreshCw,
  Tag,
  Boxes,
  IndianRupee,
  ArrowUpDown,
} from "lucide-react";
import ProductCard from "../components/ProductCard";

const ProductManage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { products = [], loading } = useSelector((s) => s.products || {});

  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [stockFilter, setStockFilter] = useState("all");
  const [sortField, setSortField] = useState("name");
  const [sortOrder, setSortOrder] = useState("asc");
  const [view, setView] = useState("grid");
  const [page, setPage] = useState(1);
  const perPage = 8;

  useEffect(() => {
    dispatch(fetchProducts());
  }, [dispatch]);

  useEffect(() => {
    setPage(1);
  }, [search, categoryFilter, minPrice, maxPrice, stockFilter, sortField, sortOrder]);

  const categoriesWithCount = useMemo(() => {
    const map = {};
    products.forEach((p) => {
      const cat = p.category || "Uncategorized";
      map[cat] = (map[cat] || 0) + 1;
    });
    return [
      { name: "All", count: products.length },
      ...Object.keys(map).map((key) => ({ name: key, count: map[key] })),
    ];
  }, [products]);

  const isInStock = (p) =>
    Array.isArray(p.sizes)
      ? p.sizes.some((s) => Number(s.stock) > 0)
      : Number(p.stock || 0) > 0;

  const filtered = useMemo(() => {
    let arr = [...products];

    const q = search.trim().toLowerCase();

    if (q)
      arr = arr.filter(
        (p) =>
          p.name?.toLowerCase().includes(q) ||
          p.category?.toLowerCase().includes(q)
      );

    if (categoryFilter !== "All")
      arr = arr.filter((p) => p.category === categoryFilter);

    const getPrice = (p) =>
      Array.isArray(p.sizes)
        ? Number(p.sizes[0]?.price || 0)
        : Number(p.price || 0);

    if (minPrice) arr = arr.filter((p) => getPrice(p) >= Number(minPrice));
    if (maxPrice) arr = arr.filter((p) => getPrice(p) <= Number(maxPrice));

    if (stockFilter === "in") arr = arr.filter((p) => isInStock(p));
    if (stockFilter === "out") arr = arr.filter((p) => !isInStock(p));

    arr.sort((a, b) => {
      let av = a[sortField];
      let bv = b[sortField];

      if (sortField === "price") {
        av = getPrice(a);
        bv = getPrice(b);
      } else {
        av = (av || "").toString().toLowerCase();
        bv = (bv || "").toString().toLowerCase();
      }

      if (sortOrder === "asc") return av > bv ? 1 : -1;
      return av < bv ? 1 : -1;
    });

    return arr;
  }, [
    products,
    search,
    categoryFilter,
    minPrice,
    maxPrice,
    stockFilter,
    sortField,
    sortOrder,
  ]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const paginated = filtered.slice((page - 1) * perPage, page * perPage);

  const handleEdit = (product) =>
    navigate(`/admin/products/edit/${product._id}`);

  const handleDelete = (id) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;
    dispatch(deleteProduct(id));
  };

  const resetFilters = () => {
    setSearch("");
    setCategoryFilter("All");
    setMinPrice("");
    setMaxPrice("");
    setStockFilter("all");
    setSortField("name");
    setSortOrder("asc");
    setPage(1);
  };

  return (
    <div className="p-6 bg-gray-100 dark:bg-gray-900 min-h-screen text-gray-900 dark:text-gray-100">
      <div className="max-w-6xl mx-auto">
        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-6">
          <div>
            <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">
              Products / Manage
            </p>
            <h1 className="text-2xl font-semibold mt-1">Product Management</h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Search, filter, and manage all products in your catalog.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/admin/products/create")}
              className="bg-red-600 px-4 py-2 rounded text-white flex items-center gap-2 text-sm hover:bg-red-700 transition shadow-sm"
            >
              <PackagePlus className="w-4 h-4" /> Create Product
            </button>

            <div className="flex gap-1 p-1 bg-gray-100 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
              <button
                onClick={() => setView("grid")}
                className={`p-2 rounded-md ${
                  view === "grid"
                    ? "bg-gray-300 dark:bg-gray-700"
                    : "hover:bg-gray-200 dark:hover:bg-gray-700"
                }`}
                title="Grid view"
              >
                <Grid className="w-4 h-4" />
              </button>

              <button
                onClick={() => setView("list")}
                className={`p-2 rounded-md ${
                  view === "list"
                    ? "bg-gray-300 dark:bg-gray-700"
                    : "hover:bg-gray-200 dark:hover:bg-gray-700"
                }`}
                title="List view"
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* FILTER PANEL */}
        <div className="mb-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-4 space-y-3 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <FilterIcon className="w-4 h-4" />
              <span>Filters</span>
            </div>

            <button
              onClick={resetFilters}
              className="flex items-center gap-2 text-xs px-3 py-1 rounded border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <RefreshCw className="w-3 h-3" />
              <span className="hidden sm:inline">Reset</span>
              <span className="sr-only">Reset filters</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:items-end">
            {/* Search */}
            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-600 dark:text-gray-400 flex items-center gap-1">
                <SearchIcon className="w-3 h-3" />
                <span className="hidden sm:inline">Search</span>
                <span className="sr-only">Search by name or category</span>
              </label>
              <div className="relative">
                <SearchIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search name or category…"
                  className="input w-full h-10 pl-9 pr-3 border rounded bg-white dark:bg-gray-800 dark:border-gray-700 text-sm"
                />
              </div>
            </div>

            {/* Category + Stock */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs font-medium text-gray-600 dark:text-gray-400">
                <span className="flex items-center gap-1">
                  <Tag className="w-3 h-3" />
                  <span className="hidden sm:inline">Category</span>
                  <span className="sr-only">Filter by category</span>
                </span>
                <span className="flex items-center gap-1">
                  <Boxes className="w-3 h-3" />
                  <span className="hidden sm:inline">Stock</span>
                  <span className="sr-only">Filter by stock status</span>
                </span>
              </div>
              <div className="flex gap-2">
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="input flex-1 h-10 px-3 border rounded bg-white dark:bg-gray-800 dark:border-gray-700 text-sm"
                >
                  {categoriesWithCount.map((c) => (
                    <option key={c.name} value={c.name}>
                      {c.name} {c.name !== "All" ? `(${c.count})` : ""}
                    </option>
                  ))}
                </select>

                <select
                  value={stockFilter}
                  onChange={(e) => setStockFilter(e.target.value)}
                  className="input h-10 px-3 border rounded bg-white dark:bg-gray-800 dark:border-gray-700 text-sm"
                >
                  <option value="all">All</option>
                  <option value="in">In</option>
                  <option value="out">Out</option>
                </select>
              </div>
            </div>

            {/* Price + Sort */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs font-medium text-gray-600 dark:text-gray-400">
                <span className="flex items-center gap-1">
                  <IndianRupee className="w-3 h-3" />
                  <span className="hidden sm:inline">Price</span>
                  <span className="sr-only">Price range</span>
                </span>
                <span className="flex items-center gap-1">
                  <ArrowUpDown className="w-3 h-3" />
                  <span className="hidden sm:inline">Sort</span>
                  <span className="sr-only">Sort field and order</span>
                </span>
              </div>

              <div className="flex flex-wrap gap-2 items-end">
                <input
                  type="number"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  placeholder="Min"
                  className="input w-20 h-10 px-2 border rounded bg-white dark:bg-gray-800 dark:border-gray-700 text-sm"
                />
                <input
                  type="number"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  placeholder="Max"
                  className="input w-20 h-10 px-2 border rounded bg-white dark:bg-gray-800 dark:border-gray-700 text-sm"
                />
                <select
                  value={sortField}
                  onChange={(e) => setSortField(e.target.value)}
                  className="input flex-1 h-10 px-3 border rounded bg-white dark:bg-gray-800 dark:border-gray-700 text-sm"
                >
                  <option value="name">Name</option>
                  <option value="category">Category</option>
                  <option value="price">Price</option>
                </select>
                <button
                  type="button"
                  onClick={() =>
                    setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"))
                  }
                  className="flex items-center justify-center h-10 w-10 rounded border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <ArrowUpDown
                    className={`w-4 h-4 transition-transform ${
                      sortOrder === "desc" ? "rotate-180" : ""
                    }`}
                  />
                  <span className="sr-only">Toggle sort order</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Product Count */}
        <p className="text-gray-500 dark:text-gray-400 text-sm mb-3">
          {loading
            ? "Loading products..."
            : `${filtered.length} product${
                filtered.length !== 1 ? "s" : ""
              } — Showing ${
                filtered.length === 0 ? 0 : (page - 1) * perPage + 1
              } to ${Math.min(page * perPage, filtered.length)}`}
        </p>

        {/* GRID/LIST VIEW */}
        {loading ? (
          <div className="py-10 text-center text-sm text-gray-500 dark:text-gray-400">
            Fetching products…
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-10 text-center text-sm text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700">
            No products found with the current filters.
          </div>
        ) : view === "grid" ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {paginated.map((p) => (
              <ProductCard
                key={p._id}
                product={p}
                view="grid"
                onEdit={() => handleEdit(p)}
                onDelete={() => handleDelete(p._id)}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {paginated.map((p) => (
              <ProductCard
                key={p._id}
                product={p}
                view="list"
                onEdit={() => handleEdit(p)}
                onDelete={() => handleDelete(p._id)}
              />
            ))}
          </div>
        )}

        {/* Pagination */}
        {filtered.length > 0 && (
          <div className="flex justify-between items-center mt-6">
            {page > 1 ? (
              <button
                onClick={() => setPage(page - 1)}
                className="px-3 py-1 rounded bg-gray-200 dark:bg-gray-700 text-sm hover:bg-gray-300 dark:hover:bg-gray-600"
              >
                Prev
              </button>
            ) : (
              <div />
            )}

            <div className="flex gap-1">
              {Array.from({ length: totalPages }).map((_, i) => {
                const num = i + 1;
                if (
                  num === 1 ||
                  num === totalPages ||
                  (num >= page - 1 && num <= page + 1)
                ) {
                  return (
                    <button
                      key={num}
                      onClick={() => setPage(num)}
                      className={`px-3 py-1 rounded text-sm ${
                        num === page
                          ? "bg-gray-800 text-white dark:bg-gray-200 dark:text-black"
                          : "bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600"
                      }`}
                    >
                      {num}
                    </button>
                  );
                }
                return null;
              })}
            </div>

            {page < totalPages ? (
              <button
                onClick={() => setPage(page + 1)}
                className="px-3 py-1 rounded bg-gray-200 dark:bg-gray-700 text-sm hover:bg-gray-300 dark:hover:bg-gray-600"
              >
                Next
              </button>
            ) : (
              <div />
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductManage;
