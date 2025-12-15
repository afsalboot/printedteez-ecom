import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchProducts } from "../../redux/slices/productSlice";
import { adminOrderList } from "../../redux/slices/orderSlice";
import { getAllUsers } from "../../redux/slices/userSlice";
import { Package, ShoppingBag, Users, IndianRupee } from "lucide-react";

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

  const totalRevenue = adminOrders.reduce(
    (sum, o) => sum + (o.totalAmount || 0),
    0
  );

  const recentOrders = adminOrders.slice(0, 5);

  return (
    <div className="p-6 bg-gray-100 dark:bg-gray-900 min-h-screen text-gray-900 dark:text-gray-100">
      <div className="max-w-6xl mx-auto">
        {/* HEADER */}
        <div className="mb-6">
          <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">
            Admin / Overview
          </p>
          <h1 className="text-2xl font-bold mt-1">Dashboard Overview</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Quick snapshot of products, orders, users, and overall revenue.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          {/* Products */}
          <div className="p-5 rounded-2xl shadow bg-red-600 text-white dark:bg-red-700 flex items-center justify-between">
            <div>
              <h2 className="text-sm uppercase tracking-wide opacity-80">
                Products
              </h2>
              <p className="text-3xl font-bold mt-1">{products.length}</p>
              <p className="text-xs mt-1 opacity-80">
                Active products in catalog
              </p>
            </div>
            <div className="opacity-70">
              <Package className="w-10 h-10" />
            </div>
          </div>

          {/* Orders */}
          <div className="p-5 rounded-2xl shadow bg-red-600 text-white dark:bg-red-700 flex items-center justify-between">
            <div>
              <h2 className="text-sm uppercase tracking-wide opacity-80">
                Orders
              </h2>
              <p className="text-3xl font-bold mt-1">{adminOrders.length}</p>
              <p className="text-xs mt-1 opacity-80">
                Total orders placed so far
              </p>
            </div>
            <div className="opacity-70">
              <ShoppingBag className="w-10 h-10" />
            </div>
          </div>

          {/* Users */}
          <div className="p-5 rounded-2xl shadow bg-red-600 text-white dark:bg-red-700 flex items-center justify-between">
            <div>
              <h2 className="text-sm uppercase tracking-wide opacity-80">
                Users
              </h2>
              <p className="text-3xl font-bold mt-1">{users.length}</p>
              <p className="text-xs mt-1 opacity-80">
                Registered customers on store
              </p>
            </div>
            <div className="opacity-70">
              <Users className="w-10 h-10" />
            </div>
          </div>

          {/* Revenue */}
          <div className="p-5 rounded-2xl shadow bg-red-600 text-white dark:bg-red-700 flex items-center justify-between">
            <div>
              <h2 className="text-sm uppercase tracking-wide opacity-80">
                Revenue
              </h2>
              <p className="text-3xl font-bold mt-1">
                ₹{totalRevenue.toLocaleString("en-IN")}
              </p>
              <p className="text-xs mt-1 opacity-80">
                Sum of all order totals
              </p>
            </div>
            <div className="opacity-70">
              <IndianRupee className="w-10 h-10" />
            </div>
          </div>
        </div>

        {/* Recent Orders */}
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xl font-semibold">Recent Orders</h2>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            Showing latest {Math.min(5, adminOrders.length)} of{" "}
            {adminOrders.length} order{adminOrders.length !== 1 && "s"}
          </span>
        </div>

        <div className="bg-white dark:bg-gray-800 p-5 shadow rounded-2xl border border-gray-200 dark:border-gray-700">
          {recentOrders.length === 0 ? (
            <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-6">
              No orders yet. Once customers start ordering, you’ll see them
              here.
            </p>
          ) : (
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {recentOrders.map((o) => (
                <div
                  key={o._id}
                  className="py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2"
                >
                  <div className="text-sm">
                    <span className="font-mono text-gray-700 dark:text-gray-300">
                      Order #{o._id.slice(-6)}
                    </span>
                    {o.user?.name && (
                      <span className="ml-2 text-gray-500 dark:text-gray-400">
                        • {o.user.name}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-4 text-sm">
                    <span className="font-semibold text-gray-800 dark:text-gray-100">
                      ₹{(o.totalAmount || 0).toLocaleString("en-IN")}
                    </span>

                    <span className="text-xs px-3 py-1 rounded-full bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-200">
                      {o.status
                        ? o.status.charAt(0).toUpperCase() + o.status.slice(1)
                        : "Unknown"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
