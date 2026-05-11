import React, { useState } from "react";
import { CardElement, useElements, useStripe } from "@stripe/react-stripe-js";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router";
import { LockKeyhole } from "lucide-react";
import BrandLoader from "./BrandLoader";
import { confirmOrder } from "../redux/slices/orderSlice";
import { clearCart } from "../redux/slices/cartSlice";
import { clearValidatedCoupon } from "../redux/slices/couponSlice";

const CardPaymentForm = () => {
  const stripe = useStripe();
  const elements = useElements();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const stripeEnabled = Boolean(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

  const { clientSecret, paymentIntentId, loading, error } = useSelector(
    (s) => s.orderData || s.order || {}
  );

  const [cardError, setCardError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  if (!stripeEnabled) {
    return (
      <p className="text-sm text-gray-500">
        Online payments are unavailable until a Stripe publishable key is added.
      </p>
    );
  }

  if (!clientSecret) {
    return (
      <div className="rounded-[1.4rem] bg-[#faf6f1] px-4 py-4 text-sm text-gray-600">
        Click <span className="font-semibold">Proceed to Payment</span> first to initialize your payment session.
      </div>
    );
  }

  const handlePay = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setSubmitting(true);
    setCardError(null);

    const cardElement = elements.getElement(CardElement);
    const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(
      clientSecret,
      {
        payment_method: {
          card: cardElement,
        },
      }
    );

    if (stripeError) {
      setCardError(stripeError.message || "Payment failed");
      setSubmitting(false);
      return;
    }

    if (paymentIntent && paymentIntent.status === "succeeded") {
      await dispatch(confirmOrder(paymentIntentId || paymentIntent.id));
      dispatch(clearCart());
      dispatch(clearValidatedCoupon());

      const rawAmount = paymentIntent.amount_received ?? paymentIntent.amount ?? 0;
      const paidAmount = (rawAmount / 100).toFixed(2);

      navigate("/payment-success", {
        state: {
          paymentMethod: "card",
          amount: paidAmount,
        },
      });
    }

    setSubmitting(false);
  };

  return (
    <form onSubmit={handlePay} className="space-y-4">
      <div className="rounded-[1.5rem] border border-black/10 bg-[#fcfaf7] px-4 py-4">
        <label className="mb-3 flex items-center gap-2 text-sm font-medium text-gray-800">
          <LockKeyhole className="h-4 w-4 text-[#B21A15]" />
          Card details
        </label>
        <div className="rounded-2xl border border-black/10 bg-white px-4 py-4">
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
      </div>

      {cardError || error ? (
        <p className="text-sm text-red-500">{cardError || error}</p>
      ) : null}

      <button
        type="submit"
        disabled={!stripe || submitting || loading}
        className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-black px-6 py-3 text-sm font-semibold text-white transition hover:bg-gray-900 disabled:opacity-60"
      >
        {submitting || loading ? (
          <BrandLoader size="sm" tone="dark" label="Processing" />
        ) : (
          "Pay Securely"
        )}
      </button>

      <p className="text-[11px] leading-5 text-gray-500">
        Your card details are encrypted and securely processed by Stripe.
      </p>
    </form>
  );
};

export default CardPaymentForm;
