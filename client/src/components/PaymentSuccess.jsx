import React from "react";
import { useLocation, useNavigate } from "react-router";
import {
  ArrowRight,
  CheckCircle2,
  CreditCard,
  ReceiptText,
  ShoppingBag,
} from "lucide-react";

const formatCurrency = (value) =>
  `Rs. ${Number(value || 0).toLocaleString("en-IN", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`;

const PaymentSuccess = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);

  const orderId = location.state?.orderId || searchParams.get("orderId") || "";
  const amount = location.state?.amount || searchParams.get("amount") || "";
  const paymentMethod =
    location.state?.paymentMethod || searchParams.get("method") || "cod";
  const isCardPayment = paymentMethod === "card" || paymentMethod === "stripe";

  return (
    <div className="bg-[#f7f3ee] px-4 py-14 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl rounded-[2.2rem] border border-black/5 bg-white p-8 shadow-sm sm:p-10">
        <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
          <div>
            <div className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
              <CheckCircle2 className="h-8 w-8" />
            </div>
            <p className="mt-6 text-[11px] font-semibold uppercase tracking-[0.28em] text-[#B21A15]">
              Success
            </p>
            <h1 className="mt-2 text-3xl font-semibold text-gray-950 sm:text-4xl">
              {isCardPayment ? "Payment completed" : "Order placed successfully"}
            </h1>
            <p className="mt-4 max-w-xl text-sm leading-7 text-gray-600">
              {isCardPayment
                ? "Your payment has been confirmed and your order is now moving into processing."
                : "Cash on delivery has been noted and your order is ready for fulfillment."}
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={() => navigate("/orders")}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-black px-6 py-3 text-sm font-semibold text-white transition hover:bg-gray-900"
              >
                {isCardPayment ? (
                  <CreditCard className="h-4 w-4" />
                ) : (
                  <ShoppingBag className="h-4 w-4" />
                )}
                View My Orders
              </button>
              <button
                type="button"
                onClick={() => navigate("/")}
                className="inline-flex items-center justify-center gap-2 rounded-full border border-black/10 px-6 py-3 text-sm font-semibold text-gray-800 transition hover:bg-[#faf6f1]"
              >
                Continue Shopping
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="rounded-[1.8rem] bg-[#171313] p-6 text-white">
            <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.24em] text-white/55">
              <ReceiptText className="h-4 w-4" />
              Order Snapshot
            </div>

            <div className="mt-6 space-y-4 text-sm">
              {orderId ? (
                <div className="rounded-[1.2rem] border border-white/10 bg-white/5 px-4 py-4">
                  <p className="text-white/55">Order ID</p>
                  <p className="mt-2 break-all font-mono text-white">{orderId}</p>
                </div>
              ) : null}

              {isCardPayment && amount ? (
                <div className="rounded-[1.2rem] border border-white/10 bg-white/5 px-4 py-4">
                  <p className="text-white/55">Paid Amount</p>
                  <p className="mt-2 text-lg font-semibold text-white">
                    {formatCurrency(amount)}
                  </p>
                </div>
              ) : null}

              <div className="rounded-[1.2rem] border border-white/10 bg-white/5 px-4 py-4">
                <p className="text-white/55">Payment Method</p>
                <p className="mt-2 font-semibold text-white">
                  {isCardPayment ? "Card / UPI" : "Cash on Delivery"}
                </p>
              </div>

              <div className="rounded-[1.2rem] border border-white/10 bg-white/5 px-4 py-4 leading-6 text-white/75">
                {isCardPayment
                  ? "A confirmation and invoice summary will follow through your registered contact details."
                  : "Please keep your phone nearby. Delivery coordination may happen before dispatch."}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess;
