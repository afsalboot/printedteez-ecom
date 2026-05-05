import React, { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router";
import {
  ArrowRight,
  Minus,
  Plus,
  ShieldCheck,
  ShoppingBag,
  Trash2,
  Truck,
  X,
} from "lucide-react";
import {
  clearCart,
  getCart,
  removeItem,
  updateQty,
} from "../redux/slices/cartSlice";

const formatCurrency = (value) =>
  `Rs. ${Number(value || 0).toLocaleString("en-IN", {
    maximumFractionDigits: 0,
  })}`;

const Cart = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { token } = useSelector((state) => state.auth || {});
  const { items = [], loading, error } = useSelector((state) => state.cart || {});

  useEffect(() => {
    if (token) {
      dispatch(getCart());
    }
  }, [dispatch, token]);

  const totalAmount = useMemo(
    () =>
      items.reduce(
        (sum, item) => sum + Number(item.price || 0) * Number(item.qty || 1),
        0
      ),
    [items]
  );

  const totalItems = useMemo(
    () => items.reduce((sum, item) => sum + Number(item.qty || 1), 0),
    [items]
  );

  const handleIncrease = (item) => {
    dispatch(updateQty({ itemId: item._id, qty: (item.qty || 1) + 1 }));
  };

  const handleDecrease = (item) => {
    const nextQty = (item.qty || 1) - 1;
    if (nextQty <= 0) {
      dispatch(removeItem(item._id));
      return;
    }
    dispatch(updateQty({ itemId: item._id, qty: nextQty }));
  };

  if (!token) {
    return (
      <div className="bg-[#f7f3ee] px-4 py-16 dark:bg-transparent sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl rounded-[2rem] border border-black/5 bg-white p-8 text-center shadow-sm dark:border-white/8 dark:bg-[rgba(20,24,31,0.92)] dark:shadow-[0_22px_44px_rgba(0,0,0,0.3)]">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#f2ebe3] text-[#B21A15] dark:bg-[#2a2022]">
            <ShoppingBag className="h-7 w-7" />
          </div>
          <h1 className="mt-5 text-3xl font-semibold text-gray-950 dark:text-white">Your cart is waiting</h1>
          <p className="mt-3 text-sm leading-7 text-gray-600 dark:text-gray-300">
            Sign in to view saved items, adjust quantities, and continue to checkout.
          </p>
          <button
            onClick={() => navigate("/login")}
            className="mt-6 inline-flex items-center justify-center rounded-full bg-black px-6 py-3 text-sm font-semibold text-white transition hover:bg-gray-900 dark:bg-[#c53a2d] dark:hover:bg-[#d44739]"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return <div className="p-8 text-center text-sm text-gray-500">Loading cart...</div>;
  }

  if (error) {
    return <div className="p-8 text-center text-sm text-red-500">{error}</div>;
  }

  if (!items.length) {
    return (
      <div className="bg-[#f7f3ee] px-4 py-16 dark:bg-transparent sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl rounded-[2rem] border border-black/5 bg-white p-8 text-center shadow-sm dark:border-white/8 dark:bg-[rgba(20,24,31,0.92)] dark:shadow-[0_22px_44px_rgba(0,0,0,0.3)]">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#f2ebe3] text-[#B21A15] dark:bg-[#2a2022]">
            <ShoppingBag className="h-7 w-7" />
          </div>
          <h1 className="mt-5 text-3xl font-semibold text-gray-950 dark:text-white">Your cart is empty</h1>
          <p className="mt-3 text-sm leading-7 text-gray-600 dark:text-gray-300">
            Explore the latest drops and add a few favorites before checkout.
          </p>
          <button
            onClick={() => navigate("/shop")}
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-black px-6 py-3 text-sm font-semibold text-white transition hover:bg-gray-900 dark:bg-[#c53a2d] dark:hover:bg-[#d44739]"
          >
            Start Shopping
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#f7f3ee] px-3 py-6 text-gray-900 dark:bg-transparent dark:text-gray-100 sm:px-6 sm:py-8 lg:px-8 lg:py-10">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex flex-col gap-4 sm:mb-8 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#B21A15]">
              Shopping Bag
            </p>
            <h1 className="mt-2 text-3xl font-semibold text-gray-950 dark:text-white sm:text-4xl">
              Cart overview
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-gray-600 dark:text-gray-300 sm:leading-7">
              Review your pieces, adjust quantities, and move to checkout when everything feels right.
            </p>
          </div>
          <div className="inline-flex items-center gap-3 self-start rounded-full border border-black/10 bg-white px-4 py-3 text-sm text-gray-700 shadow-sm dark:border-white/10 dark:bg-white/6 dark:text-gray-200 sm:px-5">
            <ShoppingBag className="h-4 w-4 text-[#B21A15]" />
            {totalItems} item{totalItems > 1 ? "s" : ""} in bag
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px] lg:gap-8">
          <section className="space-y-4">
            {items.map((item) => {
              const product = item.productId || {};
              const price = Number(item.price || 0);
              const qty = Number(item.qty || 1);
              const image = item.image || product.images?.[0] || "/placeholder.png";
              const name = product.title || item.title || "Product";

              return (
                <article
                  key={item._id}
                  className="rounded-[1.6rem] border border-black/5 bg-white p-3.5 shadow-sm dark:border-white/8 dark:bg-[rgba(20,24,31,0.92)] dark:shadow-[0_18px_36px_rgba(0,0,0,0.28)] sm:rounded-[1.8rem] sm:p-5"
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <button
                      type="button"
                      onClick={() => product._id && navigate(`/product/${product._id}`)}
                      className="flex min-w-0 flex-1 items-start gap-3 text-left sm:items-center sm:gap-4"
                    >
                      <div className="shrink-0 overflow-hidden rounded-[1.2rem] bg-[#f6f1ea] dark:bg-[#1d232c]">
                        <img
                          src={image}
                          alt={name}
                          className="h-24 w-22 object-cover object-center sm:h-24 sm:w-24"
                        />
                      </div>
                      <div className="min-w-0">
                        <h2 className="line-clamp-2 text-base font-semibold leading-snug text-gray-950 dark:text-white sm:text-lg">
                          {name}
                        </h2>
                        <div className="mt-2 flex flex-wrap gap-2 text-xs text-gray-500 dark:text-gray-400">
                          {item.size ? (
                            <span className="rounded-full bg-[#f5f1eb] px-3 py-1 dark:bg-white/6">
                              Size {item.size}
                            </span>
                          ) : null}
                          {item.color ? (
                            <span className="rounded-full bg-[#f5f1eb] px-3 py-1 dark:bg-white/6">
                              {item.color}
                            </span>
                          ) : null}
                        </div>
                        <p className="mt-3 text-sm font-semibold text-[#B21A15]">
                          {formatCurrency(price)}
                        </p>
                      </div>
                    </button>

                    <div className="flex flex-col gap-3 items-start sm:items-end">
                      <div className="inline-flex items-center gap-3 self-start rounded-full border border-black/10 bg-[#fbf8f4] px-2.5 py-2 dark:border-white/10 dark:bg-white/6 sm:px-3">
                        <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-gray-400 dark:text-gray-500 sm:hidden">
                          Qty
                        </span>
                        <div className="inline-flex items-center">
                        <button
                          type="button"
                          onClick={() => handleDecrease(item)}
                          className="flex h-8 w-8 items-center justify-center rounded-full text-gray-700 transition hover:bg-white dark:text-gray-200 dark:hover:bg-white/10"
                        >
                          <Minus className="h-4 w-4" />
                        </button>
                        <span className="min-w-[2rem] text-center text-sm font-semibold text-gray-950 dark:text-white">
                          {qty}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleIncrease(item)}
                          className="flex h-8 w-8 items-center justify-center rounded-full text-gray-700 transition hover:bg-white dark:text-gray-200 dark:hover:bg-white/10"
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                        </div>
                      </div>

                      <div className="flex items-center justify-between gap-4 border-t border-black/5 pt-1 dark:border-white/8 sm:justify-end sm:border-t-0 sm:pt-0">
                        <p className="text-lg font-semibold text-gray-950 dark:text-white sm:text-base">
                          {formatCurrency(price * qty)}
                        </p>
                        <button
                          type="button"
                          onClick={() => dispatch(removeItem(item._id))}
                          className="inline-flex items-center gap-1.5 rounded-full px-2 py-1 text-sm font-medium text-red-600 transition hover:bg-red-50 hover:text-red-700 dark:text-red-300 dark:hover:bg-red-950/30 dark:hover:text-red-200 sm:px-0 sm:py-0"
                        >
                          <Trash2 className="h-4 w-4" />
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </section>

          <aside className="lg:sticky lg:top-28 lg:self-start">
            <div className="rounded-[1.8rem] border border-black/5 bg-white p-5 shadow-sm dark:border-white/8 dark:bg-[rgba(20,24,31,0.94)] dark:shadow-[0_22px_44px_rgba(0,0,0,0.3)] sm:rounded-[2rem] sm:p-7">
              <p className="text-[11px] font-semibold uppercase tracking-[0.26em] text-[#B21A15]">
                Summary
              </p>
              <h2 className="mt-2 text-2xl font-semibold text-gray-950 dark:text-white">
                Ready for checkout
              </h2>

              <div className="mt-6 space-y-3 border-y border-black/5 py-5 text-sm dark:border-white/8">
                <div className="flex items-center justify-between text-gray-600 dark:text-gray-300">
                  <span>Items</span>
                  <span>{totalItems}</span>
                </div>
                <div className="flex items-center justify-between text-gray-600 dark:text-gray-300">
                  <span>Subtotal</span>
                  <span>{formatCurrency(totalAmount)}</span>
                </div>
                <div className="flex items-center justify-between font-semibold text-gray-950 dark:text-white">
                  <span>Total</span>
                  <span>{formatCurrency(totalAmount)}</span>
                </div>
              </div>

              <div className="mt-5 space-y-3">
                <div className="flex items-start gap-3 rounded-[1.4rem] bg-[#f7f1ea] px-4 py-4 text-sm text-gray-600 dark:bg-white/5 dark:text-gray-300">
                  <Truck className="mt-0.5 h-4 w-4 shrink-0 text-[#B21A15]" />
                  Shipping cost and final delivery options are reviewed at checkout.
                </div>
                <div className="flex items-start gap-3 rounded-[1.4rem] bg-[#f7f1ea] px-4 py-4 text-sm text-gray-600 dark:bg-white/5 dark:text-gray-300">
                  <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-[#B21A15]" />
                  Secure payment options and cash on delivery are both available.
                </div>
              </div>

              <div className="mt-6 grid gap-3">
                <button
                  type="button"
                  onClick={() => navigate("/checkout")}
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-black px-6 py-3 text-sm font-semibold text-white transition hover:bg-gray-900 dark:bg-[#c53a2d] dark:shadow-[0_14px_30px_rgba(197,58,45,0.24)] dark:hover:bg-[#d44739]"
                >
                  Continue to Checkout
                  <ArrowRight className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => dispatch(clearCart())}
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-black/10 px-6 py-3 text-sm font-semibold text-gray-800 transition hover:bg-[#faf6f1] dark:border-white/10 dark:text-gray-100 dark:hover:bg-white/6"
                >
                  <X className="h-4 w-4" />
                  Clear Cart
                </button>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default Cart;
