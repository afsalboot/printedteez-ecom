import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import {
  CreditCard,
  Loader2,
  MapPin,
  ShieldCheck,
  ShoppingBag,
  TicketPercent,
} from "lucide-react";
import { createOrder, resetOrderState } from "../redux/slices/orderSlice";
import { clearCart } from "../redux/slices/cartSlice";
import { fetchProfile, fetchSavedAddresses } from "../redux/slices/userSlice";
import {
  clearValidatedCoupon,
  getActiveOffers,
  validateCoupon,
} from "../redux/slices/couponSlice";
import CardPaymentForm from "../components/CardPaymentForm";

const stripeKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
const stripePromise = stripeKey ? loadStripe(stripeKey) : null;

const formatCurrency = (value) =>
  `Rs. ${Number(value || 0).toLocaleString("en-IN", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`;

const Checkout = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const stripeEnabled = Boolean(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

  const { items: cartItems = [] } = useSelector((s) => s.cart || {});
  const { token } = useSelector((s) => s.auth || {});
  const { profile, savedAddresses = [] } = useSelector((s) => s.user || {});
  const { loading: orderLoading, error: orderError, message } = useSelector(
    (s) => s.order || s.orderData || {}
  );
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
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [couponCode, setCouponCode] = useState("");
  const [selectedSavedAddressId, setSelectedSavedAddressId] = useState("");
  const [addressAutofilled, setAddressAutofilled] = useState(false);

  useEffect(() => {
    dispatch(resetOrderState());
  }, [dispatch]);

  useEffect(() => {
    dispatch(getActiveOffers());
  }, [dispatch]);

  useEffect(() => {
    if (!token) return;
    dispatch(fetchProfile());
    dispatch(fetchSavedAddresses());
  }, [dispatch, token]);

  useEffect(() => {
    const defaultAddress =
      savedAddresses.find((address) => address.isDefault) || savedAddresses[0];

    const hasManualInput = Object.values(shipping).some(
      (value) => typeof value === "string" && value.trim() !== ""
    );

    if (
      defaultAddress &&
      !selectedSavedAddressId &&
      !hasManualInput &&
      !addressAutofilled
    ) {
      setSelectedSavedAddressId(defaultAddress._id);
      setAddressAutofilled(true);
      setShipping({
        fullName: defaultAddress.fullName || "",
        phone: defaultAddress.phone || "",
        address: defaultAddress.line1 || "",
        city: defaultAddress.city || "",
        state: defaultAddress.state || "",
        postalCode: defaultAddress.postalCode || "",
        country: defaultAddress.country || "India",
      });
      return;
    }

    if (!defaultAddress && profile && !hasManualInput && !addressAutofilled) {
      setAddressAutofilled(true);
      setShipping((prev) => ({
        ...prev,
        fullName: prev.fullName || profile.name || "",
        phone: prev.phone || profile.mobile?.toString() || "",
      }));
    }
  }, [addressAutofilled, profile, savedAddresses, selectedSavedAddressId, shipping]);

  const totals = useMemo(() => {
    const subtotal = cartItems.reduce(
      (sum, item) => sum + Number(item.price || 0) * Number(item.qty || 1),
      0
    );
    const totalQty = cartItems.reduce(
      (sum, item) => sum + Number(item.qty || 1),
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
    if (!cartItems.length) {
      navigate("/cart");
    }
  }, [cartItems.length, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (selectedSavedAddressId) setSelectedSavedAddressId("");
    setShipping((prev) => ({ ...prev, [name]: value }));
  };

  const handleSavedAddressSelect = (address) => {
    setSelectedSavedAddressId(address._id);
    setAddressAutofilled(true);
    setShipping({
      fullName: address.fullName || "",
      phone: address.phone || "",
      address: address.line1 || "",
      city: address.city || "",
      state: address.state || "",
      postalCode: address.postalCode || "",
      country: address.country || "India",
    });
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

    const apiPaymentMethod = paymentMethod === "card" ? "stripe" : paymentMethod;

    dispatch(
      createOrder({
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
      })
    );
  };

  useEffect(() => {
    if (!orderLoading && message && paymentMethod === "cod") {
      dispatch(clearCart());
      dispatch(clearValidatedCoupon());
      navigate("/payment-success", {
        state: {
          paymentMethod: "cod",
          amount: totals.grandTotal.toFixed(2),
        },
      });
    }
  }, [dispatch, message, navigate, orderLoading, paymentMethod, totals.grandTotal]);

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
    <div className="bg-[#f7f3ee] px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#B21A15]">
              Checkout
            </p>
            <h1 className="mt-2 text-3xl font-semibold text-gray-950 sm:text-4xl">
              Shipping, payment, and review
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-gray-600">
              A cleaner checkout flow with saved addresses, coupon support, and secure payment confirmation.
            </p>
          </div>
          <div className="inline-flex items-center gap-3 rounded-full border border-black/10 bg-white px-5 py-3 text-sm text-gray-700 shadow-sm">
            <ShoppingBag className="h-4 w-4 text-[#B21A15]" />
            {totals.totalQty} item{totals.totalQty > 1 ? "s" : ""} ready
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_380px]">
          <section className="space-y-6">
            <div className="rounded-[2rem] border border-black/5 bg-white p-6 shadow-sm sm:p-7">
              <div className="mb-5 flex items-start gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#f2ebe3] text-[#B21A15]">
                  <MapPin className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-950">Delivery address</h2>
                  <p className="mt-1 text-sm text-gray-500">
                    Choose a saved address or enter a new one for this order.
                  </p>
                </div>
              </div>

              {savedAddresses.length > 0 && (
                <div className="mb-6 space-y-3">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-medium text-gray-800">Saved addresses</p>
                    <button
                      type="button"
                      onClick={() => navigate("/profile")}
                      className="text-sm font-medium text-[#B21A15]"
                    >
                      Manage
                    </button>
                  </div>
                  <div className="grid gap-3 md:grid-cols-2">
                    {savedAddresses.map((address) => (
                      <button
                        key={address._id}
                        type="button"
                        onClick={() => handleSavedAddressSelect(address)}
                        className={`rounded-[1.4rem] border p-4 text-left transition ${
                          selectedSavedAddressId === address._id
                            ? "border-[#B21A15] bg-[#fff4f2]"
                            : "border-black/10 hover:border-black/20"
                        }`}
                      >
                        <div className="flex items-center justify-between gap-3">
                          <p className="font-semibold text-gray-900">
                            {address.label || "Address"}
                          </p>
                          {address.isDefault ? (
                            <span className="rounded-full bg-[#B21A15] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-white">
                              Default
                            </span>
                          ) : null}
                        </div>
                        <p className="mt-3 text-sm font-medium text-gray-800">
                          {address.fullName}
                        </p>
                        <p className="mt-1 text-xs text-gray-500">{address.phone}</p>
                        <p className="mt-2 text-xs leading-5 text-gray-500">
                          {[address.line1, address.city, address.state, address.postalCode]
                            .filter(Boolean)
                            .join(", ")}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-800">
                      Full Name
                    </label>
                    <input
                      type="text"
                      name="fullName"
                      value={shipping.fullName}
                      onChange={handleChange}
                      required
                      className="w-full rounded-2xl border border-black/10 bg-[#fcfaf7] px-4 py-3 text-sm outline-none transition focus:border-black/25"
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-800">
                      Phone
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={shipping.phone}
                      onChange={handleChange}
                      required
                      className="w-full rounded-2xl border border-black/10 bg-[#fcfaf7] px-4 py-3 text-sm outline-none transition focus:border-black/25"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-800">
                    Address
                  </label>
                  <textarea
                    name="address"
                    rows={4}
                    value={shipping.address}
                    onChange={handleChange}
                    required
                    className="w-full resize-none rounded-2xl border border-black/10 bg-[#fcfaf7] px-4 py-3 text-sm outline-none transition focus:border-black/25"
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-800">
                      City
                    </label>
                    <input
                      type="text"
                      name="city"
                      value={shipping.city}
                      onChange={handleChange}
                      className="w-full rounded-2xl border border-black/10 bg-[#fcfaf7] px-4 py-3 text-sm outline-none transition focus:border-black/25"
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-800">
                      State
                    </label>
                    <input
                      type="text"
                      name="state"
                      value={shipping.state}
                      onChange={handleChange}
                      className="w-full rounded-2xl border border-black/10 bg-[#fcfaf7] px-4 py-3 text-sm outline-none transition focus:border-black/25"
                    />
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-800">
                      Postal Code
                    </label>
                    <input
                      type="text"
                      name="postalCode"
                      value={shipping.postalCode}
                      onChange={handleChange}
                      className="w-full rounded-2xl border border-black/10 bg-[#fcfaf7] px-4 py-3 text-sm outline-none transition focus:border-black/25"
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-800">
                      Country
                    </label>
                    <input
                      type="text"
                      name="country"
                      value={shipping.country}
                      onChange={handleChange}
                      className="w-full rounded-2xl border border-black/10 bg-[#fcfaf7] px-4 py-3 text-sm outline-none transition focus:border-black/25"
                    />
                  </div>
                </div>

                <div className="border-t border-black/5 pt-5">
                  <div className="mb-4 flex items-start gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#f2ebe3] text-[#B21A15]">
                      <CreditCard className="h-5 w-5" />
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold text-gray-950">Payment method</h2>
                      <p className="mt-1 text-sm text-gray-500">
                        Choose how you want to complete this order.
                      </p>
                    </div>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod("cod")}
                      className={`rounded-[1.5rem] border p-4 text-left transition ${
                        paymentMethod === "cod"
                          ? "border-black bg-black text-white"
                          : "border-black/10 bg-[#fcfaf7] text-gray-900 hover:border-black/20"
                      }`}
                    >
                      <p className="text-sm font-semibold">Cash on Delivery</p>
                      <p className={`mt-2 text-xs ${paymentMethod === "cod" ? "text-white/70" : "text-gray-500"}`}>
                        Pay when your order arrives.
                      </p>
                    </button>
                    <button
                      type="button"
                      disabled={!stripeEnabled}
                      onClick={() => setPaymentMethod("card")}
                      className={`rounded-[1.5rem] border p-4 text-left transition ${
                        paymentMethod === "card"
                          ? "border-black bg-black text-white"
                          : "border-black/10 bg-[#fcfaf7] text-gray-900 hover:border-black/20"
                      } ${!stripeEnabled ? "cursor-not-allowed opacity-60" : ""}`}
                    >
                      <p className="text-sm font-semibold">Card / UPI</p>
                      <p className={`mt-2 text-xs ${paymentMethod === "card" ? "text-white/70" : "text-gray-500"}`}>
                        {stripeEnabled
                          ? "Secure online payment with Stripe."
                          : "Stripe is not configured yet."}
                      </p>
                    </button>
                  </div>
                </div>

                {orderError ? (
                  <p className="text-sm text-red-500">{orderError}</p>
                ) : null}

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={orderLoading}
                    className="inline-flex min-w-[240px] items-center justify-center gap-2 rounded-full bg-black px-6 py-3 text-sm font-semibold text-white transition hover:bg-gray-900 disabled:opacity-60"
                  >
                    {orderLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                    {paymentMethod === "cod" ? "Place COD Order" : "Proceed to Payment"}
                  </button>
                  <p className="mt-3 text-[11px] text-gray-500">
                    By continuing, you agree to the store's checkout and delivery terms.
                  </p>
                </div>
              </form>
            </div>
          </section>

          <aside className="space-y-6 lg:sticky lg:top-28 lg:self-start">
            <div className="rounded-[2rem] border border-black/5 bg-white p-6 shadow-sm sm:p-7">
              <p className="text-[11px] font-semibold uppercase tracking-[0.26em] text-[#B21A15]">
                Order Summary
              </p>
              <h2 className="mt-2 text-2xl font-semibold text-gray-950">
                Review before payment
              </h2>

              <div className="mt-5 space-y-3">
                {cartItems.map((item) => {
                  const name =
                    item.name || item.title || item.productId?.name || "Product";
                  return (
                    <div
                      key={
                        item._id ||
                        `${item.productId?._id || item.productId}-${item.size}-${item.color}`
                      }
                      className="flex items-center gap-3 rounded-[1.4rem] bg-[#faf6f1] p-3"
                    >
                      {item.image ? (
                        <img
                          src={item.image}
                          alt={name}
                          className="h-14 w-14 rounded-xl object-cover"
                        />
                      ) : null}
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-gray-900">
                          {name}
                        </p>
                        <p className="mt-1 text-xs text-gray-500">
                          Qty {item.qty || 1}
                          {item.size ? ` · ${item.size}` : ""}
                          {item.color ? ` · ${item.color}` : ""}
                        </p>
                      </div>
                      <p className="text-sm font-semibold text-gray-950">
                        {formatCurrency((item.price || 0) * (item.qty || 1))}
                      </p>
                    </div>
                  );
                })}
              </div>

              <div className="mt-5 space-y-3 border-t border-black/5 pt-5 text-sm">
                <div className="flex items-center justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span>{formatCurrency(totals.subtotal)}</span>
                </div>
                <div className="flex items-center justify-between text-gray-600">
                  <span>Items</span>
                  <span>{totals.totalQty}</span>
                </div>
                {totals.couponOff > 0 ? (
                  <div className="flex items-center justify-between text-emerald-600">
                    <span>Coupon discount</span>
                    <span>- {formatCurrency(totals.couponOff)}</span>
                  </div>
                ) : null}
                <div className="flex items-center justify-between border-t border-black/5 pt-3 text-base font-semibold text-gray-950">
                  <span>Grand Total</span>
                  <span>{formatCurrency(totals.grandTotal)}</span>
                </div>
              </div>
            </div>

            <div className="rounded-[2rem] border border-black/5 bg-white p-6 shadow-sm sm:p-7">
              <div className="flex items-start gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#f2ebe3] text-[#B21A15]">
                  <TicketPercent className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-950">Coupons</h2>
                  <p className="mt-1 text-sm text-gray-500">
                    Apply a code or choose an eligible offer for this cart.
                  </p>
                </div>
              </div>

              <div className="mt-5 flex gap-2">
                <input
                  type="text"
                  placeholder="Enter coupon code"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  className="min-w-0 flex-1 rounded-2xl border border-black/10 bg-[#fcfaf7] px-4 py-3 text-sm uppercase outline-none transition focus:border-black/25"
                />
                <button
                  type="button"
                  onClick={handleApplyCoupon}
                  disabled={couponLoading || !couponCode.trim()}
                  className="rounded-2xl bg-black px-4 py-3 text-sm font-semibold text-white transition hover:bg-gray-900 disabled:opacity-60"
                >
                  {couponLoading ? "Applying..." : "Apply"}
                </button>
              </div>

              {couponError ? (
                <p className="mt-3 text-xs text-red-500">{couponError}</p>
              ) : null}

              {couponCodeApplied ? (
                <div className="mt-4 flex items-center justify-between rounded-[1.4rem] bg-emerald-50 px-4 py-3 text-sm">
                  <div>
                    <p className="font-semibold uppercase text-emerald-700">
                      {couponCodeApplied}
                    </p>
                    <p className="mt-1 text-xs text-emerald-600">
                      {couponType === "percentage"
                        ? `${couponValue}% off applied`
                        : "Coupon applied successfully"}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleRemoveCoupon}
                    className="text-xs font-medium text-emerald-700 underline"
                  >
                    Remove
                  </button>
                </div>
              ) : null}

              <div className="mt-5 space-y-2">
                {eligibleOffers.length === 0 ? (
                  <p className="text-sm text-gray-500">
                    No special offers are available for this cart value right now.
                  </p>
                ) : (
                  eligibleOffers.map((offer) => (
                    <button
                      key={offer._id || offer.code}
                      type="button"
                      onClick={() => handleSelectCoupon(offer)}
                      className="w-full rounded-[1.4rem] border border-dashed border-black/10 px-4 py-3 text-left transition hover:border-black/25 hover:bg-[#faf6f1]"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold uppercase text-gray-900">
                            {offer.code}
                          </p>
                          <p className="mt-1 text-xs text-gray-500">
                            {offer.description || "Tap to apply this offer"}
                          </p>
                        </div>
                        <span className="rounded-full bg-[#f2ebe3] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#B21A15]">
                          Apply
                        </span>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>

            {paymentMethod === "card" ? (
              <div className="rounded-[2rem] border border-black/5 bg-white p-6 shadow-sm sm:p-7">
                <div className="mb-4 flex items-start gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#f2ebe3] text-[#B21A15]">
                    <ShieldCheck className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-gray-950">Secure payment</h2>
                    <p className="mt-1 text-sm text-gray-500">
                      Finish card or UPI payment after the order is initialized.
                    </p>
                  </div>
                </div>
                <Elements stripe={stripePromise}>
                  <CardPaymentForm />
                </Elements>
              </div>
            ) : null}
          </aside>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
