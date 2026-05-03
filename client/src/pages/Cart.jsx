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
      <div className="bg-[#f7f3ee] px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl rounded-[2rem] border border-black/5 bg-white p-8 text-center shadow-sm">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#f2ebe3] text-[#B21A15]">
            <ShoppingBag className="h-7 w-7" />
          </div>
          <h1 className="mt-5 text-3xl font-semibold text-gray-950">Your cart is waiting</h1>
          <p className="mt-3 text-sm leading-7 text-gray-600">
            Sign in to view saved items, adjust quantities, and continue to checkout.
          </p>
          <button
            onClick={() => navigate("/login")}
            className="mt-6 inline-flex items-center justify-center rounded-full bg-black px-6 py-3 text-sm font-semibold text-white transition hover:bg-gray-900"
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
      <div className="bg-[#f7f3ee] px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl rounded-[2rem] border border-black/5 bg-white p-8 text-center shadow-sm">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#f2ebe3] text-[#B21A15]">
            <ShoppingBag className="h-7 w-7" />
          </div>
          <h1 className="mt-5 text-3xl font-semibold text-gray-950">Your cart is empty</h1>
          <p className="mt-3 text-sm leading-7 text-gray-600">
            Explore the latest drops and add a few favorites before checkout.
          </p>
          <button
            onClick={() => navigate("/shop")}
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-black px-6 py-3 text-sm font-semibold text-white transition hover:bg-gray-900"
          >
            Start Shopping
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#f7f3ee] px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#B21A15]">
              Shopping Bag
            </p>
            <h1 className="mt-2 text-3xl font-semibold text-gray-950 sm:text-4xl">
              Cart overview
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-gray-600">
              Review your pieces, adjust quantities, and move to checkout when everything feels right.
            </p>
          </div>
          <div className="inline-flex items-center gap-3 rounded-full border border-black/10 bg-white px-5 py-3 text-sm text-gray-700 shadow-sm">
            <ShoppingBag className="h-4 w-4 text-[#B21A15]" />
            {totalItems} item{totalItems > 1 ? "s" : ""} in bag
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px]">
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
                  className="rounded-[1.8rem] border border-black/5 bg-white p-4 shadow-sm sm:p-5"
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <button
                      type="button"
                      onClick={() => product._id && navigate(`/product/${product._id}`)}
                      className="flex min-w-0 flex-1 items-center gap-4 text-left"
                    >
                      <img
                        src={image}
                        alt={name}
                        className="h-24 w-24 rounded-[1.2rem] object-cover"
                      />
                      <div className="min-w-0">
                        <h2 className="truncate text-lg font-semibold text-gray-950">
                          {name}
                        </h2>
                        <div className="mt-2 flex flex-wrap gap-2 text-xs text-gray-500">
                          {item.size ? (
                            <span className="rounded-full bg-[#f5f1eb] px-3 py-1">
                              Size {item.size}
                            </span>
                          ) : null}
                          {item.color ? (
                            <span className="rounded-full bg-[#f5f1eb] px-3 py-1">
                              {item.color}
                            </span>
                          ) : null}
                        </div>
                        <p className="mt-3 text-sm font-medium text-[#B21A15]">
                          {formatCurrency(price)}
                        </p>
                      </div>
                    </button>

                    <div className="flex flex-col gap-4 sm:items-end">
                      <div className="inline-flex items-center rounded-full border border-black/10 bg-[#fbf8f4] px-3 py-2">
                        <button
                          type="button"
                          onClick={() => handleDecrease(item)}
                          className="flex h-8 w-8 items-center justify-center rounded-full text-gray-700 transition hover:bg-white"
                        >
                          <Minus className="h-4 w-4" />
                        </button>
                        <span className="min-w-[2.5rem] text-center text-sm font-semibold text-gray-950">
                          {qty}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleIncrease(item)}
                          className="flex h-8 w-8 items-center justify-center rounded-full text-gray-700 transition hover:bg-white"
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>

                      <div className="flex items-center gap-4">
                        <p className="text-base font-semibold text-gray-950">
                          {formatCurrency(price * qty)}
                        </p>
                        <button
                          type="button"
                          onClick={() => dispatch(removeItem(item._id))}
                          className="inline-flex items-center gap-1 text-sm font-medium text-red-600 transition hover:text-red-700"
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
            <div className="rounded-[2rem] border border-black/5 bg-white p-6 shadow-sm sm:p-7">
              <p className="text-[11px] font-semibold uppercase tracking-[0.26em] text-[#B21A15]">
                Summary
              </p>
              <h2 className="mt-2 text-2xl font-semibold text-gray-950">
                Ready for checkout
              </h2>

              <div className="mt-6 space-y-3 border-y border-black/5 py-5 text-sm">
                <div className="flex items-center justify-between text-gray-600">
                  <span>Items</span>
                  <span>{totalItems}</span>
                </div>
                <div className="flex items-center justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span>{formatCurrency(totalAmount)}</span>
                </div>
                <div className="flex items-center justify-between font-semibold text-gray-950">
                  <span>Total</span>
                  <span>{formatCurrency(totalAmount)}</span>
                </div>
              </div>

              <div className="mt-5 space-y-3">
                <div className="flex items-start gap-3 rounded-[1.4rem] bg-[#f7f1ea] px-4 py-4 text-sm text-gray-600">
                  <Truck className="mt-0.5 h-4 w-4 shrink-0 text-[#B21A15]" />
                  Shipping cost and final delivery options are reviewed at checkout.
                </div>
                <div className="flex items-start gap-3 rounded-[1.4rem] bg-[#f7f1ea] px-4 py-4 text-sm text-gray-600">
                  <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-[#B21A15]" />
                  Secure payment options and cash on delivery are both available.
                </div>
              </div>

              <div className="mt-6 grid gap-3">
                <button
                  type="button"
                  onClick={() => navigate("/checkout")}
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-black px-6 py-3 text-sm font-semibold text-white transition hover:bg-gray-900"
                >
                  Continue to Checkout
                  <ArrowRight className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => dispatch(clearCart())}
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-black/10 px-6 py-3 text-sm font-semibold text-gray-800 transition hover:bg-[#faf6f1]"
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
