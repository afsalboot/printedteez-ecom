// src/pages/PaymentSuccess.jsx
import React from "react";
import { useNavigate, useLocation } from "react-router";
import { CheckCircle2, CreditCard, ShoppingBag, ArrowRight } from "lucide-react";

const PaymentSuccess = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const searchParams = new URLSearchParams(location.search);

  const orderId =
    location.state?.orderId || searchParams.get("orderId") || "";

  const amount =
    location.state?.amount || searchParams.get("amount") || "";

  const paymentMethodFromState =
    location.state?.paymentMethod || searchParams.get("method") || "cod";

  const isCardPayment =
    paymentMethodFromState === "card" || paymentMethodFromState === "stripe";

  const title = isCardPayment
    ? "Payment successful!"
    : "Order placed successfully!";

  const subtitle = isCardPayment
    ? "Your online payment has been confirmed. We're processing your order now."
    : "Cash on Delivery confirmed. We’ll send updates when your order is shipped.";

  const highlightText = isCardPayment
    ? "Your payment was completed securely via card / UPI."
    : "Please keep exact change ready at the time of delivery.";

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-10 text-gray-900 dark:text-gray-100">
      <div className="w-full max-w-xl border border-gray-200 dark:border-slate-700 rounded-2xl bg-white dark:bg-slate-900 shadow-sm p-6 sm:p-8 space-y-6">
        {/* Icon + title */}
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/40">
            <CheckCircle2 className="w-7 h-7 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-semibold">{title}</h1>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
              {subtitle}
            </p>
          </div>
        </div>

        {/* Order info */}
        <div className="rounded-xl bg-gray-50 dark:bg-slate-950/60 border border-gray-200 dark:border-slate-700 p-4 space-y-2 text-sm">
          {orderId && (
            <p>
              <span className="font-medium">Order ID: </span>
              <span className="font-mono text-xs sm:text-sm">{orderId}</span>
            </p>
          )}

          {isCardPayment && amount && (
            <p>
              <span className="font-medium">Paid Amount: </span>
              <span>₹{amount}</span>
            </p>
          )}

          <p className="text-gray-600 dark:text-gray-400">
            {highlightText}{" "}
            {isCardPayment && (
              <>
                You&apos;ll receive an order update and invoice on your
                registered email or phone.
              </>
            )}
            {!isCardPayment && (
              <>
                Our delivery partner may contact you on your registered phone
                number.
              </>
            )}
          </p>

          <p className="text-xs text-gray-500 dark:text-gray-500">
            You can track your order status anytime from the{" "}
            <span className="font-medium">My Orders</span> section.
          </p>
        </div>

        {/* CTA buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            type="button"
            onClick={() => navigate("/orders")}
            className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-full bg-black text-white dark:bg-white dark:text-black text-sm font-semibold hover:bg-gray-900 dark:hover:bg-gray-200 transition shadow-sm hover:shadow-md"
          >
            {isCardPayment ? (
              <CreditCard className="w-4 h-4" />
            ) : (
              <ShoppingBag className="w-4 h-4" />
            )}
            View My Orders
          </button>

          <button
            type="button"
            onClick={() => navigate("/")}
            className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-full border border-gray-300 dark:border-slate-700 text-sm font-semibold hover:bg-gray-50 dark:hover:bg-slate-800 transition"
          >
            Continue Shopping
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <p className="text-[11px] text-gray-500 dark:text-gray-500 text-center">
          Need help? Contact support from the{" "}
          <span className="font-medium">Help &amp; Support</span> section.
        </p>
      </div>
    </div>
  );
};

export default PaymentSuccess;
