// src/components/CardPaymentForm.jsx
import React, { useState } from "react";
import { useStripe, useElements, CardElement } from "@stripe/react-stripe-js";
import { useDispatch, useSelector } from "react-redux";
import { confirmOrder } from "../redux/slices/orderSlice";
import { clearCart } from "../redux/slices/cartSlice";
import { clearValidatedCoupon } from "../redux/slices/couponSlice";
import { useNavigate } from "react-router";

const CardPaymentForm = () => {
  const stripe = useStripe();
  const elements = useElements();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { clientSecret, paymentIntentId, loading, error } = useSelector(
    (s) => s.orderData || s.order || {}
  );

  const [cardError, setCardError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  if (!clientSecret) {
    // createOrder hasn't returned Stripe data yet
    return (
      <p className="text-sm text-gray-500 dark:text-gray-400">
        Please click “Proceed to Payment” first to initialize payment.
      </p>
    );
  }

  const handlePay = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setSubmitting(true);
    setCardError(null);

    const cardElement = elements.getElement(CardElement);

    const { error: stripeError, paymentIntent } =
      await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
        },
      });

    if (stripeError) {
      console.error(stripeError);
      setCardError(stripeError.message || "Payment failed");
      setSubmitting(false);
      return;
    }

    if (paymentIntent && paymentIntent.status === "succeeded") {
      // tell backend to mark order as paid
      await dispatch(confirmOrder(paymentIntentId || paymentIntent.id));

      // clear cart + coupon in frontend
      dispatch(clearCart());
      dispatch(clearValidatedCoupon());

      // derive paid amount from Stripe (amount is in paise)
      const rawAmount =
        paymentIntent.amount_received ?? paymentIntent.amount ?? 0;
      const paidAmount = (rawAmount / 100).toFixed(2);

      // go to unified PaymentSuccess with card-specific state
      navigate("/payment-success", {
        state: {
          paymentMethod: "card", // or "stripe"
          amount: paidAmount,
          // you can add orderId later if backend returns it
        },
      });
    }

    setSubmitting(false);
  };

  return (
    <form onSubmit={handlePay} className="space-y-4">
      <div className="border border-gray-300 dark:border-slate-600 rounded-lg px-3 py-2 bg-white dark:bg-slate-950">
        <CardElement
          options={{
            style: {
              base: {
                fontSize: "14px",
                color: "#111827",
                "::placeholder": {
                  color: "#9CA3AF",
                },
              },
              invalid: {
                color: "#DC2626",
              },
            },
          }}
        />
      </div>

      {(cardError || error) && (
        <p className="text-xs text-red-500">{cardError || error}</p>
      )}

      <button
        type="submit"
        disabled={!stripe || submitting || loading}
        className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-full bg-black text-white dark:bg-white dark:text-black text-sm font-semibold disabled:opacity-60"
      >
        {submitting || loading ? "Processing..." : "Pay Now"}
      </button>

      <p className="text-[11px] text-gray-500 dark:text-gray-400">
        Your card details are securely processed by Stripe.
      </p>
    </form>
  );
};

export default CardPaymentForm;
