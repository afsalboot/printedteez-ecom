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

const getProductTitle = (product) =>
  product.title || product.name || "Untitled Product";

const getProductPrice = (product) =>
  Array.isArray(product.sizes)
    ? Number(product.sizes[0]?.price || 0)
    : Number(product.price || 0);

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

    if (q) {
      arr = arr.filter(
        (p) =>
          getProductTitle(p).toLowerCase().includes(q) ||
          p.category?.toLowerCase().includes(q) ||
          p.sku?.toLowerCase().includes(q)
      );
    }

    if (categoryFilter !== "All") {
      arr = arr.filter((p) => p.category === categoryFilter);
    }

    if (minPrice) {
      arr = arr.filter((p) => getProductPrice(p) >= Number(minPrice));
    }
    if (maxPrice) {
      arr = arr.filter((p) => getProductPrice(p) <= Number(maxPrice));
    }

    if (stockFilter === "in") arr = arr.filter((p) => isInStock(p));
    if (stockFilter === "out") arr = arr.filter((p) => !isInStock(p));

    arr.sort((a, b) => {
      let av = a[sortField];
      let bv = b[sortField];

      if (sortField === "price") {
        av = getProductPrice(a);
        bv = getProductPrice(b);
      } else if (sortField === "name") {
        av = getProductTitle(a).toLowerCase();
        bv = getProductTitle(b).toLowerCase();
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

  useEffect(() => {
    if (page > totalPages) setPage(1);
  }, [page, totalPages]);

  const handleEdit = (product) =>
    navigate(`/admin/products/edit/${product._id}`);
  const handleView = (product) =>
    navigate(`/admin/products/${product._id}`);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;
    await dispatch(deleteProduct(id));
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
    <div className="rounded-[32px] border border-red-100/70 bg-white/80 p-6 text-gray-900 shadow-[0_24px_80px_rgba(15,23,42,0.06)] backdrop-blur-sm">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs uppercase tracking-wide text-red-500">
              Products / Manage
            </p>
            <h1 className="mt-1 text-3xl font-semibold">Product Management</h1>
            <p className="mt-2 text-sm text-gray-600">
              Search, filter, and manage all products in your catalog.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/admin/products/create")}
              className="flex items-center gap-2 rounded-2xl bg-red-600 px-4 py-2.5 text-sm text-white shadow-sm transition hover:bg-red-700"
            >
              <PackagePlus className="h-4 w-4" /> Create Product
            </button>

            <div className="flex gap-1 rounded-2xl border border-red-100 bg-red-50 p-1">
              <button
                onClick={() => setView("grid")}
                className={`rounded-xl p-2 ${
                  view === "grid"
                    ? "bg-white text-red-700 shadow-sm"
                    : "text-gray-500 hover:bg-white/70"
                }`}
                title="Grid view"
              >
                <Grid className="h-4 w-4" />
              </button>

              <button
                onClick={() => setView("list")}
                className={`rounded-xl p-2 ${
                  view === "list"
                    ? "bg-white text-red-700 shadow-sm"
                    : "text-gray-500 hover:bg-white/70"
                }`}
                title="List view"
              >
                <List className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        <div className="mb-4 space-y-3 rounded-[28px] border border-red-100 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-sm font-semibold text-gray-900">
              <FilterIcon className="h-4 w-4 text-red-500" />
              <span>Filters</span>
            </div>

            <button
              onClick={resetFilters}
              className="flex items-center gap-2 rounded-xl border border-red-100 px-3 py-2 text-xs text-gray-600 hover:bg-red-50"
            >
              <RefreshCw className="h-3 w-3" />
              <span className="hidden sm:inline">Reset</span>
              <span className="sr-only">Reset filters</span>
            </button>
          </div>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-3 md:items-end">
            <div className="space-y-1">
              <label className="flex items-center gap-1 text-xs font-medium text-gray-600">
                <SearchIcon className="h-3 w-3 text-red-500" />
                <span className="hidden sm:inline">Search</span>
              </label>
              <div className="relative">
                <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search title, category, or SKU..."
                  className="input h-11 w-full rounded-2xl border border-red-100 bg-red-50/40 pl-9 pr-3 text-sm"
                />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs font-medium text-gray-600">
                <span className="flex items-center gap-1">
                  <Tag className="h-3 w-3 text-red-500" />
                  <span className="hidden sm:inline">Category</span>
                </span>
                <span className="flex items-center gap-1">
                  <Boxes className="h-3 w-3 text-red-500" />
                  <span className="hidden sm:inline">Stock</span>
                </span>
              </div>
              <div className="flex gap-2">
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="input h-11 flex-1 rounded-2xl border border-red-100 bg-red-50/40 px-3 text-sm"
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
                  className="input h-11 rounded-2xl border border-red-100 bg-red-50/40 px-3 text-sm"
                >
                  <option value="all">All</option>
                  <option value="in">In</option>
                  <option value="out">Out</option>
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs font-medium text-gray-600">
                <span className="flex items-center gap-1">
                  <IndianRupee className="h-3 w-3 text-red-500" />
                  <span className="hidden sm:inline">Price</span>
                </span>
                <span className="flex items-center gap-1">
                  <ArrowUpDown className="h-3 w-3 text-red-500" />
                  <span className="hidden sm:inline">Sort</span>
                </span>
              </div>

              <div className="flex flex-wrap items-end gap-2">
                <input
                  type="number"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  placeholder="Min"
                  className="input h-11 w-20 rounded-2xl border border-red-100 bg-red-50/40 px-2 text-sm"
                />
                <input
                  type="number"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  placeholder="Max"
                  className="input h-11 w-20 rounded-2xl border border-red-100 bg-red-50/40 px-2 text-sm"
                />
                <select
                  value={sortField}
                  onChange={(e) => setSortField(e.target.value)}
                  className="input h-11 flex-1 rounded-2xl border border-red-100 bg-red-50/40 px-3 text-sm"
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
                  className="flex h-11 w-11 items-center justify-center rounded-2xl border border-red-100 hover:bg-red-50"
                >
                  <ArrowUpDown
                    className={`h-4 w-4 transition-transform ${
                      sortOrder === "desc" ? "rotate-180" : ""
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>
        </div>

        <p className="mb-3 text-sm text-gray-500">
          {loading
            ? "Loading products..."
            : `${filtered.length} product${
                filtered.length !== 1 ? "s" : ""
              } - Showing ${
                filtered.length === 0 ? 0 : (page - 1) * perPage + 1
              } to ${Math.min(page * perPage, filtered.length)}`}
        </p>

        {loading ? (
          <div className="py-10 text-center text-sm text-gray-500">
            Fetching products...
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-[28px] border border-red-100 bg-white py-10 text-center text-sm text-gray-500">
            No products found with the current filters.
          </div>
        ) : view === "grid" ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {paginated.map((p) => (
              <ProductCard
                key={p._id}
                product={p}
                view="grid"
                onView={handleView}
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
                onView={handleView}
                onEdit={() => handleEdit(p)}
                onDelete={() => handleDelete(p._id)}
              />
            ))}
          </div>
        )}

        {filtered.length > 0 && (
          <div className="mt-6 flex items-center justify-between">
            {page > 1 ? (
              <button
                onClick={() => setPage(page - 1)}
                className="rounded-xl border border-red-100 bg-white px-3 py-2 text-sm hover:bg-red-50"
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
                      className={`rounded-xl px-3 py-2 text-sm ${
                        num === page
                          ? "bg-red-600 text-white"
                          : "border border-red-100 bg-white hover:bg-red-50"
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
                className="rounded-xl border border-red-100 bg-white px-3 py-2 text-sm hover:bg-red-50"
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
