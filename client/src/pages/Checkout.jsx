// src/pages/Checkout.jsx
import React, { useMemo, useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router";
import { createOrder, resetOrderState } from "../redux/slices/orderSlice";
import { clearCart } from "../redux/slices/cartSlice";
import {
  validateCoupon,
  clearValidatedCoupon,
  getActiveOffers,
} from "../redux/slices/couponSlice";
import { ShoppingCart, CreditCard, Loader2 } from "lucide-react";
import CardPaymentForm from "../components/CardPaymentForm";

const Checkout = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { items: cartItems = [] } = useSelector((s) => s.cart || {});
  const {
    loading: orderLoading,
    error: orderError,
    message,
  } = useSelector((s) => s.order || s.orderData || {});
  const {
    validatedCoupon,
    loading: couponLoading,
    error: couponError,
    activeOffers = [],
  } = useSelector((s) => s.coupon || s.couponData || {});

  const [shipping, setShipping] = useState({
    fullName: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    postalCode: "",
    country: "India",
  });

  const [paymentMethod, setPaymentMethod] = useState("cod"); // "cod" | "card"
  const [couponCode, setCouponCode] = useState("");

  // Clear previous order success/error when entering checkout
  useEffect(() => {
    dispatch(resetOrderState());
  }, [dispatch]);

  // Load offers once
  useEffect(() => {
    dispatch(getActiveOffers());
  }, [dispatch]);

  const totals = useMemo(() => {
    if (!cartItems.length) {
      return { subtotal: 0, totalQty: 0, couponOff: 0, grandTotal: 0 };
    }

    const subtotal = cartItems.reduce(
      (sum, item) => sum + (item.price || 0) * (item.qty || 1),
      0
    );
    const totalQty = cartItems.reduce(
      (sum, item) => sum + (item.qty || 1),
      0
    );

    const couponOff =
      validatedCoupon?.discountAmount && subtotal
        ? Math.min(validatedCoupon.discountAmount, subtotal)
        : 0;

    return {
      subtotal,
      totalQty,
      couponOff,
      grandTotal: subtotal - couponOff,
    };
  }, [cartItems, validatedCoupon]);

  useEffect(() => {
    if (!cartItems.length) navigate("/cart");
  }, [cartItems.length, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setShipping((prev) => ({ ...prev, [name]: value }));
  };

  const handleApplyCoupon = () => {
    const code = couponCode.trim();
    if (!code || !cartItems.length) return;
    dispatch(validateCoupon(code, totals.subtotal));
  };

  const handleRemoveCoupon = () => {
    dispatch(clearValidatedCoupon());
    setCouponCode("");
  };

  const handleSelectCoupon = (offer) => {
    if (!offer?.code) return;
    setCouponCode(offer.code);
    dispatch(validateCoupon(offer.code, totals.subtotal));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!shipping.fullName || !shipping.phone || !shipping.address) {
      alert("Please fill in name, phone and address.");
      return;
    }

    if (!cartItems.length) {
      alert("Your cart is empty.");
      return;
    }

    const apiPaymentMethod =
      paymentMethod === "card" ? "stripe" : paymentMethod;

    const body = {
      items: cartItems.map((item) => ({
        productId: item.productId?._id || item.productId || item._id,
        size: item.size,
        color: item.color,
        qty: item.qty,
        price: item.price,
        image: item.image,
      })),
      shippingAddress: {
        name: shipping.fullName,
        phone: shipping.phone,
        line1: shipping.address,
        city: shipping.city,
        state: shipping.state,
        postalCode: shipping.postalCode,
        country: shipping.country,
      },
      paymentMethod: apiPaymentMethod,
      couponCode: couponCode.trim() || undefined,
    };

    dispatch(createOrder(body));
  };

  // COD success → clear cart + coupon then go to PaymentSuccess page
  useEffect(() => {
    if (!orderLoading && message && paymentMethod === "cod") {
      dispatch(clearCart());
      dispatch(clearValidatedCoupon());
      navigate("/payment-success", {
        state: {
          paymentMethod: "cod",
          amount: totals.grandTotal.toFixed(2),
          // later you can add: orderId
        },
      });
    }
  }, [
    orderLoading,
    message,
    paymentMethod,
    dispatch,
    navigate,
    totals.grandTotal,
  ]);

  const isPlacingOrder = orderLoading;

  const couponObj = validatedCoupon?.coupon || validatedCoupon || null;
  const couponCodeApplied = couponObj?.code || couponObj?.name || "";
  const couponType = couponObj?.type;
  const couponValue = couponObj?.value;

  const eligibleOffers = (activeOffers || []).filter((offer) => {
    const minAmount =
      offer.minSubtotal || offer.minOrderAmount || offer.minAmount || 0;
    return totals.subtotal >= minAmount;
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 dark:from-black dark:to-slate-950">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-gray-900 dark:text-gray-100">
        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-7">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-black text-white dark:bg-white dark:text-black shadow-sm">
              <ShoppingCart className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-semibold leading-tight">
                Checkout
              </h1>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Secure checkout · Complete your order in a few steps
              </p>
            </div>
          </div>

          <div className="flex flex-col items-start md:items-end gap-2 text-xs">
            <div className="inline-flex items-center rounded-full border border-gray-300 dark:border-slate-600 px-3 py-1 uppercase tracking-wide bg-white/60 dark:bg-slate-900/70">
              Step 1: Shipping &amp; Payment
            </div>
            <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
              <span className="hidden sm:inline">Items in cart:</span>
              <span className="font-semibold text-gray-800 dark:text-gray-100">
                {totals.totalQty}
              </span>
            </div>
          </div>
        </div>

        {/* LAYOUT */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* LEFT – Shipping + Payment */}
          <div className="lg:col-span-2 space-y-6">
            <div className="p-5 md:p-6 border border-gray-200 dark:border-slate-700 rounded-2xl bg-white dark:bg-slate-900 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-lg font-semibold">Shipping Address</h2>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1">
                    We’ll only use this to deliver your order.
                  </p>
                </div>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  Fields marked <span className="text-red-500">*</span> are
                  required
                </span>
              </div>

              <form className="space-y-4" onSubmit={handleSubmit}>
                {/* name + phone */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Full Name<span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="fullName"
                      value={shipping.fullName}
                      onChange={handleChange}
                      className="w-full border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-950 px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-300 dark:focus:ring-slate-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Phone<span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={shipping.phone}
                      onChange={handleChange}
                      className="w-full border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-950 px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-300 dark:focus:ring-slate-500"
                      required
                    />
                  </div>
                </div>

                {/* address */}
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Address<span className="text-red-500">*</span>
                  </label>
                  <textarea
                    name="address"
                    rows={3}
                    value={shipping.address}
                    onChange={handleChange}
                    className="w-full border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-950 px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-300 dark:focus:ring-slate-500 resize-none"
                    required
                  />
                </div>

                {/* city / state */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      City
                    </label>
                    <input
                      type="text"
                      name="city"
                      value={shipping.city}
                      onChange={handleChange}
                      className="w-full border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-950 px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-300 dark:focus:ring-slate-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      State
                    </label>
                    <input
                      type="text"
                      name="state"
                      value={shipping.state}
                      onChange={handleChange}
                      className="w-full border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-950 px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-300 dark:focus:ring-slate-500"
                    />
                  </div>
                </div>

                {/* pincode / country */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Pincode
                    </label>
                    <input
                      type="text"
                      name="postalCode"
                      value={shipping.postalCode}
                      onChange={handleChange}
                      className="w-full border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-950 px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-300 dark:focus:ring-slate-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Country
                    </label>
                    <input
                      type="text"
                      name="country"
                      value={shipping.country}
                      onChange={handleChange}
                      className="w-full border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-950 px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-300 dark:focus:ring-slate-500"
                    />
                  </div>
                </div>

                {/* Payment Method */}
                <div className="mt-5 pt-4 border-t border-gray-200 dark:border-slate-700">
                  <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
                    <CreditCard className="w-4 h-4" />
                    Payment Method
                  </h2>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod("cod")}
                      className={`flex-1 border rounded-xl px-4 py-3 text-sm flex items-center justify-between transition-all duration-200 ${
                        paymentMethod === "cod"
                          ? "border-black bg-black text-white dark:border-white dark:bg-white dark:text-black shadow-sm"
                          : "border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-950 hover:border-black dark:hover:border-white hover:shadow-sm"
                      }`}
                    >
                      <div className="flex flex-col items-start">
                        <span className="font-medium text-sm">
                          Cash on Delivery
                        </span>
                        <span className="text-[11px] opacity-80">
                          Pay when your order arrives
                        </span>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPaymentMethod("card")}
                      className={`flex-1 border rounded-xl px-4 py-3 text-sm flex items-center justify-between transition-all duration-200 ${
                        paymentMethod === "card"
                          ? "border-black bg-black text-white dark:border-white dark:bg-white dark:text-black shadow-sm"
                          : "border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-950 hover:border-black dark:hover:border-white hover:shadow-sm"
                      }`}
                    >
                      <div className="flex flex-col items-start">
                        <span className="font-medium text-sm">Card / UPI</span>
                        <span className="text-[11px] opacity-80">
                          Secure online payment
                        </span>
                      </div>
                      <CreditCard className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {orderError && (
                  <p className="text-sm text-red-500 mt-2">{orderError}</p>
                )}

                {/* Place Order */}
                <div className="mt-5">
                  <button
                    type="submit"
                    disabled={isPlacingOrder}
                    className="w-full sm:w-64 flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-black text-white dark:bg-white dark:text-black text-sm font-semibold tracking-wide disabled:opacity-60 hover:bg-gray-900 dark:hover:bg-gray-200 transition-all duration-200 shadow-sm hover:shadow-md"
                  >
                    {isPlacingOrder && (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    )}
                    {paymentMethod === "cod"
                      ? "Place Order (COD)"
                      : "Proceed to Payment"}
                  </button>
                  <p className="mt-2 text-[11px] text-gray-500 dark:text-gray-400">
                    By placing your order, you agree to our Terms &amp;
                    Conditions.
                  </p>
                </div>
              </form>
            </div>
          </div>

          {/* RIGHT – Order Summary + Coupon */}
          <div className="space-y-6">
            {/* Order Summary */}
            <div className="p-5 md:p-6 border border-gray-200 dark:border-slate-700 rounded-2xl bg-white dark:bg-slate-900 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">Order Summary</h2>
                {totals.subtotal > 0 && (
                  <span className="text-[11px] text-gray-500 dark:text-gray-400">
                    Review items before placing your order
                  </span>
                )}
              </div>

              {cartItems.length === 0 ? (
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Your cart is empty.
                </p>
              ) : (
                <>
                  {/* Items */}
                  <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                    {cartItems.map((item) => {
                      const name =
                        item.name ||
                        item.title ||
                        item.productId?.name ||
                        "Product";
                      return (
                        <div
                          key={
                            item._id ||
                            `${item.productId?._id || item.productId}-${
                              item.size
                            }-${item.color}`
                          }
                          className="flex items-center gap-3"
                        >
                          {item.image && (
                            <img
                              src={item.image}
                              alt={name}
                              className="h-14 w-14 rounded-lg object-cover border border-gray-200 dark:border-slate-700"
                            />
                          )}
                          <div className="flex-1">
                            <p className="text-sm font-medium line-clamp-1">
                              {name}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {item.size && (
                                <span className="mr-2">Size: {item.size}</span>
                              )}
                              {item.color && (
                                <span className="mr-2">
                                  Color: {item.color}
                                </span>
                              )}
                            </p>
                            <p className="text-xs mt-1">
                              Qty: {item.qty || 1} × ₹{item.price || 0}
                            </p>
                          </div>
                          <div className="text-sm font-semibold">
                            ₹{((item.price || 0) * (item.qty || 1)).toFixed(2)}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Totals */}
                  <div className="mt-4 pt-4 border-t border-dashed border-gray-200 dark:border-slate-700 space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Subtotal</span>
                      <span>₹{totals.subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                      <span>Items</span>
                      <span>{totals.totalQty}</span>
                    </div>

                    {totals.couponOff > 0 && (
                      <div className="flex justify-between text-sm text-emerald-600 dark:text-emerald-400">
                        <span>Coupon discount</span>
                        <span>- ₹{totals.couponOff.toFixed(2)}</span>
                      </div>
                    )}

                    <div className="flex justify-between font-semibold text-base pt-2 border-t border-gray-200 dark:border-slate-700">
                      <span>Grand Total</span>
                      <span>₹{totals.grandTotal.toFixed(2)}</span>
                    </div>
                    <p className="text-[11px] text-gray-500 dark:text-gray-400">
                      Shipping charges (if any) may be calculated at delivery or
                      on the payment page.
                    </p>
                  </div>
                </>
              )}
            </div>

            {/* Coupon + Offers */}
            <div className="p-5 md:p-6 border border-gray-200 dark:border-slate-700 rounded-2xl bg-white dark:bg-slate-900 shadow-sm">
              <h2 className="text-lg font-semibold mb-3">Apply Coupon</h2>

              {/* Coupon input */}
              <div className="flex flex-col sm:flex-row gap-2 mb-2">
                <input
                  type="text"
                  placeholder="Enter coupon code"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  className="flex-1 border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-950 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-300 dark:focus:ring-slate-500 uppercase"
                />
                <button
                  type="button"
                  onClick={handleApplyCoupon}
                  disabled={couponLoading || !couponCode.trim()}
                  className="px-4 py-2 rounded-lg text-sm font-semibold bg-black text-white dark:bg-white dark:text-black disabled:opacity-60 hover:opacity-90 transition"
                >
                  {couponLoading ? "Applying..." : "Apply"}
                </button>
              </div>

              {couponError && (
                <p className="text-xs text-red-500 mb-2">{couponError}</p>
              )}

              {/* Applied coupon badge */}
              {couponCodeApplied && (
                <div className="flex items-center justify-between text-xs bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-700 px-3 py-2 rounded-lg mb-3">
                  <div>
                    <p className="font-semibold tracking-wide uppercase">
                      {couponCodeApplied}
                    </p>
                    <p className="text-[11px] text-emerald-700 dark:text-emerald-300">
                      {couponType === "percentage"
                        ? `${couponValue}% off applied`
                        : "Coupon applied successfully"}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleRemoveCoupon}
                    className="text-[11px] underline"
                  >
                    Remove
                  </button>
                </div>
              )}

              {/* Auto-suggest offers */}
              <div className="mt-3">
                <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Available Offers
                </p>
                {eligibleOffers.length === 0 ? (
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    No special offers available for this cart value right now.
                  </p>
                ) : (
                  <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                    {eligibleOffers.map((offer) => (
                      <button
                        key={offer._id || offer.code}
                        type="button"
                        onClick={() => handleSelectCoupon(offer)}
                        className="w-full text-left text-xs border border-dashed border-gray-300 dark:border-slate-600 rounded-lg px-3 py-2 hover:border-black dark:hover:border-white transition"
                      >
                        <div className="flex justify-between items-center gap-2">
                          <div>
                            <p className="font-semibold uppercase tracking-wide">
                              {offer.code}
                            </p>
                            <p className="text-[11px] text-gray-500 dark:text-gray-400">
                              {offer.description ||
                                "Tap to apply this offer to your cart"}
                            </p>
                          </div>
                          <span className="text-[11px] px-2 py-1 rounded-full border border-gray-300 dark:border-slate-600">
                            Apply
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Card Payment block */}
            {paymentMethod === "card" && (
              <div className="p-5 border border-gray-200 dark:border-slate-700 rounded-2xl bg-white dark:bg-slate-900 shadow-sm">
                <h2 className="text-lg font-semibold mb-3">Card Payment</h2>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                  After you click “Proceed to Payment” above, enter your card
                  details here to complete the payment.
                </p>
                <CardPaymentForm />
              </div>
            )}
          </div>
          {/* END RIGHT */}
        </div>
      </div>
    </div>
  );
};

export default Checkout;
