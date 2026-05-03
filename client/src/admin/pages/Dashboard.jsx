import React, { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router";
import { fetchProducts } from "../../redux/slices/productSlice";
import { adminOrderList } from "../../redux/slices/orderSlice";
import { getAllUsers } from "../../redux/slices/userSlice";
import {
  AlertTriangle,
  ArrowRight,
  Boxes,
  CheckCircle2,
  Clock3,
  IndianRupee,
  LayoutGrid,
  Package,
  ShoppingBag,
  Sparkles,
  Truck,
  Users,
} from "lucide-react";

const formatCurrency = (value) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value || 0);

const formatDate = (value) => {
  if (!value) return "No date";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "No date";
  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const getOrderAmount = (order) => Number(order?.totalAmount || order?.finalAmount || 0);

const getOrderStatus = (order) => (order?.status || "pending").toLowerCase();

const getProductStock = (product) => {
  if (Array.isArray(product?.colors) && product.colors.length > 0) {
    return product.colors.reduce(
      (sum, color) =>
        sum +
        (Array.isArray(color?.sizes)
          ? color.sizes.reduce((inner, size) => inner + Number(size?.stock || 0), 0)
          : 0),
      0
    );
  }

  if (Array.isArray(product?.sizes) && product.sizes.length > 0) {
    return product.sizes.reduce((sum, size) => sum + Number(size?.stock || 0), 0);
  }

  return Number(product?.stock || 0);
};

const getProductStartingPrice = (product) => {
  if (Array.isArray(product?.colors) && product.colors.length > 0) {
    const prices = product.colors.flatMap((color) =>
      Array.isArray(color?.sizes)
        ? color.sizes
            .map((size) => Number(size?.price || 0))
            .filter((price) => price > 0)
        : []
    );
    return prices.length ? Math.min(...prices) : 0;
  }

  if (Array.isArray(product?.sizes) && product.sizes.length > 0) {
    const prices = product.sizes
      .map((size) => Number(size?.price || 0))
      .filter((price) => price > 0);
    return prices.length ? Math.min(...prices) : 0;
  }

  return Number(product?.price || 0);
};

const StatCard = ({ icon: Icon, label, value, note, tone = "white" }) => {
  const toneClasses =
    tone === "red"
      ? "border-red-200 bg-red-50"
      : tone === "amber"
      ? "border-amber-200 bg-amber-50"
      : "border-red-100 bg-white";

  return (
    <div className={`rounded-[28px] border p-5 shadow-sm ${toneClasses}`}>
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-red-600 text-white">
        <Icon className="h-5 w-5" />
      </div>
      <p className="text-xs uppercase tracking-[0.24em] text-red-500">{label}</p>
      <p className="mt-2 text-3xl font-semibold text-gray-900">{value}</p>
      <p className="mt-2 text-sm text-gray-600">{note}</p>
    </div>
  );
};

const InsightCard = ({ icon: Icon, title, value, note, tone = "slate" }) => {
  const accent =
    tone === "green"
      ? "bg-emerald-50 text-emerald-700"
      : tone === "amber"
      ? "bg-amber-50 text-amber-700"
      : tone === "red"
      ? "bg-red-50 text-red-700"
      : "bg-slate-100 text-slate-700";

  return (
    <div className="rounded-[24px] border border-red-100 bg-white p-4 shadow-sm">
      <div className={`flex h-10 w-10 items-center justify-center rounded-2xl ${accent}`}>
        <Icon className="h-4 w-4" />
      </div>
      <p className="mt-4 text-sm font-semibold text-gray-900">{title}</p>
      <p className="mt-2 text-2xl font-semibold text-gray-900">{value}</p>
      <p className="mt-1 text-xs leading-5 text-gray-500">{note}</p>
    </div>
  );
};

const Dashboard = () => {
  const dispatch = useDispatch();
  const { products = [] } = useSelector((s) => s.products || {});
  const { adminOrders = [] } = useSelector((s) => s.order || {});
  const { users = [] } = useSelector((s) => s.user || {});

  useEffect(() => {
    dispatch(fetchProducts());
    dispatch(adminOrderList());
    dispatch(getAllUsers());
  }, [dispatch]);

  const metrics = useMemo(() => {
    const totalRevenue = adminOrders.reduce((sum, order) => sum + getOrderAmount(order), 0);
    const deliveredOrders = adminOrders.filter(
      (order) => getOrderStatus(order) === "delivered"
    );
    const pendingOrders = adminOrders.filter((order) =>
      ["pending", "processing"].includes(getOrderStatus(order))
    );
    const shippedOrders = adminOrders.filter((order) =>
      ["shipped", "out for delivery"].includes(getOrderStatus(order))
    );

    const featuredProducts = products.filter((product) => product?.featured).length;
    const flashSaleProducts = products.filter((product) => product?.flashSale).length;
    const limitedEditionProducts = products.filter(
      (product) => product?.limitedEdition
    ).length;

    const lowStockProducts = products
      .map((product) => ({
        ...product,
        stock: getProductStock(product),
        price: getProductStartingPrice(product),
      }))
      .filter((product) => product.stock > 0 && product.stock <= 5)
      .sort((a, b) => a.stock - b.stock);

    const outOfStockProducts = products.filter((product) => getProductStock(product) <= 0);

    const categoryMap = products.reduce((acc, product) => {
      const category = product?.category || "Uncategorized";
      acc[category] = (acc[category] || 0) + 1;
      return acc;
    }, {});

    const topCategories = Object.entries(categoryMap)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    const recentOrders = [...adminOrders]
      .sort((a, b) => new Date(b?.createdAt || 0) - new Date(a?.createdAt || 0))
      .slice(0, 6);

    const recentUsers = [...users]
      .sort((a, b) => new Date(b?.createdAt || 0) - new Date(a?.createdAt || 0))
      .slice(0, 5);

    const avgOrderValue = adminOrders.length ? totalRevenue / adminOrders.length : 0;
    const activeCustomers = users.filter((user) => user?.verified).length;

    return {
      totalRevenue,
      avgOrderValue,
      deliveredOrders,
      pendingOrders,
      shippedOrders,
      featuredProducts,
      flashSaleProducts,
      limitedEditionProducts,
      lowStockProducts,
      outOfStockProducts,
      topCategories,
      recentOrders,
      recentUsers,
      activeCustomers,
    };
  }, [adminOrders, products, users]);

  return (
    <div className="rounded-[32px] border border-red-100/70 bg-white/80 p-6 shadow-[0_24px_80px_rgba(15,23,42,0.06)] backdrop-blur-sm">
      <div className="mx-auto max-w-7xl space-y-6">
        <section className="grid gap-4 xl:grid-cols-[1.3fr_0.9fr]">
          <div className="overflow-hidden rounded-[32px] bg-[linear-gradient(135deg,#991b1b_0%,#dc2626_52%,#fecaca_145%)] p-6 text-white shadow-[0_30px_70px_rgba(220,38,38,0.28)]">
            <p className="text-xs uppercase tracking-[0.32em] text-red-100/90">
              Admin / Assessment
            </p>
            <h1 className="mt-3 text-3xl font-semibold sm:text-4xl">
              Business health at a glance
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-red-50/90">
              Review revenue, order movement, catalog risk, and customer activity
              from one place before you jump into deeper admin tasks.
            </p>

            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-white/20 bg-white/10 p-4 backdrop-blur-sm">
                <p className="text-[11px] uppercase tracking-[0.2em] text-red-100/85">
                  Revenue
                </p>
                <p className="mt-2 text-2xl font-semibold">
                  {formatCurrency(metrics.totalRevenue)}
                </p>
              </div>
              <div className="rounded-2xl border border-white/20 bg-white/10 p-4 backdrop-blur-sm">
                <p className="text-[11px] uppercase tracking-[0.2em] text-red-100/85">
                  Avg Order
                </p>
                <p className="mt-2 text-2xl font-semibold">
                  {formatCurrency(metrics.avgOrderValue)}
                </p>
              </div>
              <div className="rounded-2xl border border-white/20 bg-white/10 p-4 backdrop-blur-sm">
                <p className="text-[11px] uppercase tracking-[0.2em] text-red-100/85">
                  Delivered
                </p>
                <p className="mt-2 text-2xl font-semibold">
                  {metrics.deliveredOrders.length}
                </p>
              </div>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-1">
            <InsightCard
              icon={AlertTriangle}
              title="Stock Attention Needed"
              value={metrics.lowStockProducts.length + metrics.outOfStockProducts.length}
              note={`${metrics.lowStockProducts.length} low-stock and ${metrics.outOfStockProducts.length} sold-out products need review.`}
              tone="amber"
            />
            <InsightCard
              icon={Sparkles}
              title="Campaign Ready Catalog"
              value={metrics.featuredProducts + metrics.flashSaleProducts}
              note={`${metrics.featuredProducts} featured and ${metrics.flashSaleProducts} flash-sale items are live right now.`}
              tone="green"
            />
          </div>
        </section>

        <section className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            icon={Package}
            label="Products"
            value={products.length}
            note={`${metrics.outOfStockProducts.length} currently sold out`}
            tone="red"
          />
          <StatCard
            icon={ShoppingBag}
            label="Orders"
            value={adminOrders.length}
            note={`${metrics.pendingOrders.length} pending or processing`}
          />
          <StatCard
            icon={Users}
            label="Customers"
            value={users.length}
            note={`${metrics.activeCustomers} verified accounts`}
          />
          <StatCard
            icon={LayoutGrid}
            label="Collections"
            value={metrics.topCategories.length}
            note="Top active product categories tracked below"
          />
        </section>

        <section className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
          <div className="rounded-[28px] border border-red-100 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between gap-3 border-b border-red-100 pb-4">
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-red-500">
                  Order Flow
                </p>
                <h2 className="mt-2 text-2xl font-semibold text-gray-900">
                  Fulfillment assessment
                </h2>
              </div>
              <Link
                to="/admin/orders"
                className="inline-flex items-center gap-2 rounded-2xl border border-red-100 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-red-50"
              >
                View orders
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="mt-5 grid gap-4 md:grid-cols-3">
              <InsightCard
                icon={Clock3}
                title="Pending Queue"
                value={metrics.pendingOrders.length}
                note="Orders waiting for action or currently processing."
                tone="amber"
              />
              <InsightCard
                icon={Truck}
                title="In Transit"
                value={metrics.shippedOrders.length}
                note="Orders already shipped or out for delivery."
                tone="slate"
              />
              <InsightCard
                icon={CheckCircle2}
                title="Delivered"
                value={metrics.deliveredOrders.length}
                note="Orders completed successfully."
                tone="green"
              />
            </div>

            <div className="mt-6">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Recent Orders</h3>
                <span className="text-xs text-gray-500">
                  Latest {metrics.recentOrders.length} entries
                </span>
              </div>

              {metrics.recentOrders.length === 0 ? (
                <div className="rounded-[24px] border border-dashed border-red-200 bg-red-50/40 px-6 py-10 text-center text-sm text-gray-500">
                  No recent orders yet.
                </div>
              ) : (
                <div className="space-y-3">
                  {metrics.recentOrders.map((order) => (
                    <div
                      key={order._id}
                      className="flex flex-col gap-3 rounded-[22px] border border-red-100 bg-red-50/40 px-4 py-4 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div>
                        <p className="text-sm font-semibold text-gray-900">
                          Order #{order._id?.slice(-6)}
                        </p>
                        <p className="mt-1 text-xs text-gray-500">
                          {order?.user?.name || "Guest customer"} • {formatDate(order?.createdAt)}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-semibold text-gray-900">
                          {formatCurrency(getOrderAmount(order))}
                        </span>
                        <span className="rounded-full bg-white px-3 py-1 text-xs font-medium capitalize text-red-700 shadow-sm">
                          {getOrderStatus(order)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-[28px] border border-red-100 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.24em] text-red-500">
                    Catalog Watch
                  </p>
                  <h2 className="mt-2 text-2xl font-semibold text-gray-900">
                    Inventory alerts
                  </h2>
                </div>
                <Link
                  to="/admin/products/manage"
                  className="inline-flex items-center gap-2 rounded-2xl border border-red-100 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-red-50"
                >
                  Open catalog
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>

              <div className="mt-5 space-y-3">
                {metrics.lowStockProducts.slice(0, 5).map((product) => (
                  <div
                    key={product._id}
                    className="rounded-[22px] border border-amber-200 bg-amber-50 px-4 py-4"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-gray-900">
                          {product.title || product.name || "Untitled product"}
                        </p>
                        <p className="mt-1 text-xs text-gray-500">
                          {product.category || "Uncategorized"} • starts at{" "}
                          {formatCurrency(product.price)}
                        </p>
                      </div>
                      <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-amber-700">
                        {product.stock} left
                      </span>
                    </div>
                  </div>
                ))}

                {metrics.lowStockProducts.length === 0 ? (
                  <div className="rounded-[22px] border border-dashed border-emerald-200 bg-emerald-50 px-4 py-6 text-sm text-emerald-700">
                    No low-stock products right now.
                  </div>
                ) : null}

                {metrics.outOfStockProducts.length > 0 ? (
                  <div className="rounded-[22px] border border-red-200 bg-red-50 px-4 py-4 text-sm text-red-700">
                    {metrics.outOfStockProducts.length} product
                    {metrics.outOfStockProducts.length !== 1 ? "s are" : " is"} fully sold out.
                  </div>
                ) : null}
              </div>
            </div>

            <div className="rounded-[28px] border border-red-100 bg-white p-5 shadow-sm">
              <p className="text-xs uppercase tracking-[0.24em] text-red-500">
                Store Mix
              </p>
              <h2 className="mt-2 text-2xl font-semibold text-gray-900">
                Category and promo balance
              </h2>

              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <InsightCard
                  icon={Boxes}
                  title="Featured"
                  value={metrics.featuredProducts}
                  note="Products highlighted in priority placements."
                  tone="red"
                />
                <InsightCard
                  icon={IndianRupee}
                  title="Flash Sale"
                  value={metrics.flashSaleProducts}
                  note="Products currently configured for urgency pricing."
                  tone="amber"
                />
                <InsightCard
                  icon={Sparkles}
                  title="Limited Edition"
                  value={metrics.limitedEditionProducts}
                  note="Exclusive or special-drop catalog items."
                  tone="green"
                />
                <InsightCard
                  icon={LayoutGrid}
                  title="Top Categories"
                  value={metrics.topCategories.length}
                  note="Best represented groups in the current catalog."
                />
              </div>

              <div className="mt-6 space-y-3">
                {metrics.topCategories.length === 0 ? (
                  <div className="rounded-[22px] border border-dashed border-red-200 bg-red-50/40 px-4 py-6 text-sm text-gray-500">
                    No category distribution available yet.
                  </div>
                ) : (
                  metrics.topCategories.map((category) => (
                    <div key={category.name}>
                      <div className="mb-1 flex items-center justify-between text-sm">
                        <span className="font-medium text-gray-700">{category.name}</span>
                        <span className="text-gray-500">{category.count}</span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-red-100">
                        <div
                          className="h-full rounded-full bg-red-600"
                          style={{
                            width: `${Math.max(
                              12,
                              (category.count / Math.max(products.length, 1)) * 100
                            )}%`,
                          }}
                        />
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
          <div className="rounded-[28px] border border-red-100 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between gap-3 border-b border-red-100 pb-4">
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-red-500">
                  Customer Pulse
                </p>
                <h2 className="mt-2 text-2xl font-semibold text-gray-900">
                  New signups
                </h2>
              </div>
              <Link
                to="/admin/users"
                className="inline-flex items-center gap-2 rounded-2xl border border-red-100 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-red-50"
              >
                Manage users
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="mt-5 space-y-3">
              {metrics.recentUsers.length === 0 ? (
                <div className="rounded-[22px] border border-dashed border-red-200 bg-red-50/40 px-4 py-6 text-sm text-gray-500">
                  No customer records available yet.
                </div>
              ) : (
                metrics.recentUsers.map((user) => (
                  <div
                    key={user._id}
                    className="flex items-center justify-between gap-3 rounded-[22px] border border-red-100 bg-red-50/40 px-4 py-4"
                  >
                    <div>
                      <p className="text-sm font-semibold text-gray-900">
                        {user.name || "Unnamed customer"}
                      </p>
                      <p className="mt-1 text-xs text-gray-500">
                        {user.email || "No email"} • {formatDate(user.createdAt)}
                      </p>
                    </div>
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-medium ${
                        user.verified
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-amber-100 text-amber-700"
                      }`}
                    >
                      {user.verified ? "Verified" : "Pending"}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="rounded-[28px] border border-red-100 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between gap-3 border-b border-red-100 pb-4">
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-red-500">
                  Quick Access
                </p>
                <h2 className="mt-2 text-2xl font-semibold text-gray-900">
                  Useful admin actions
                </h2>
              </div>
            </div>

            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <Link
                to="/admin/products/create"
                className="rounded-[24px] border border-red-100 bg-red-50 p-5 transition hover:border-red-200 hover:bg-red-100/70"
              >
                <p className="text-sm font-semibold text-gray-900">Add new product</p>
                <p className="mt-2 text-sm leading-6 text-gray-600">
                  Launch a new catalog item with images, colors, pricing, and size rows.
                </p>
              </Link>

              <Link
                to="/admin/categories"
                className="rounded-[24px] border border-red-100 bg-white p-5 transition hover:border-red-200 hover:bg-red-50/60"
              >
                <p className="text-sm font-semibold text-gray-900">Tune categories</p>
                <p className="mt-2 text-sm leading-6 text-gray-600">
                  Adjust storefront grouping, order, and category artwork.
                </p>
              </Link>

              <Link
                to="/admin/orders"
                className="rounded-[24px] border border-red-100 bg-white p-5 transition hover:border-red-200 hover:bg-red-50/60"
              >
                <p className="text-sm font-semibold text-gray-900">Process orders</p>
                <p className="mt-2 text-sm leading-6 text-gray-600">
                  Review pending shipments, payment state, and customer progress.
                </p>
              </Link>

              <Link
                to="/admin/coupons"
                className="rounded-[24px] border border-red-100 bg-white p-5 transition hover:border-red-200 hover:bg-red-50/60"
              >
                <p className="text-sm font-semibold text-gray-900">Manage offers</p>
                <p className="mt-2 text-sm leading-6 text-gray-600">
                  Create campaigns and keep discounts aligned with inventory goals.
                </p>
              </Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Dashboard;
