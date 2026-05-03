import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { listCoupons, updateCoupon } from "../../redux/slices/couponSlice";
import { useNavigate, useParams } from "react-router";
import {
  ArrowLeft,
  CalendarClock,
  PencilLine,
  ShieldCheck,
  Sparkles,
  TicketPercent,
} from "lucide-react";

const cardClass =
  "rounded-[1.8rem] border border-white/60 bg-white/95 p-6 shadow-[0_18px_40px_rgba(15,23,42,0.06)] backdrop-blur-sm";
const inputClass =
  "w-full rounded-2xl border border-slate-200 bg-[#fbfaf7] px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-[#B21A15] focus:bg-white";
const labelClass = "text-sm font-semibold text-slate-800";
const helperClass = "text-xs leading-5 text-slate-500";

const emptyForm = {
  code: "",
  discountType: "",
  amount: "",
  minOrderValue: "",
  usageLimit: "",
  expiryDate: "",
  description: "",
};

const CouponUpdate = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { id } = useParams();

  const { coupons = [], loading, error } = useSelector((s) => s.coupon || {});
  const [form, setForm] = useState(emptyForm);
  const [hasLoadedForm, setHasLoadedForm] = useState(false);

  useEffect(() => {
    dispatch(listCoupons());
  }, [dispatch]);

  const coupon = useMemo(
    () => coupons.find((item) => item._id === id) || null,
    [coupons, id]
  );

  useEffect(() => {
    if (!coupon) return;

    setForm({
      code: coupon.code || "",
      discountType: coupon.discountType || "",
      amount: coupon.amount ?? "",
      minOrderValue: coupon.minOrderValue ?? "",
      usageLimit: coupon.usageLimit ?? "",
      expiryDate: coupon.expiryDate ? coupon.expiryDate.split("T")[0] : "",
      description: coupon.description || "",
    });
    setHasLoadedForm(true);
  }, [coupon]);

  const generateCode = () => {
    const newCode =
      "CPN" + Math.random().toString(36).substring(2, 8).toUpperCase();
    setForm((prev) => ({ ...prev, code: newCode }));
  };

  const autoDescription = () => {
    if (!form.code || !form.discountType || !form.amount) return;

    const type =
      form.discountType === "percentage"
        ? `${form.amount}% OFF`
        : `Flat Rs. ${form.amount} OFF`;

    const minValue = form.minOrderValue
      ? `on orders above Rs. ${form.minOrderValue}`
      : "on all order values";

    const expiry = form.expiryDate
      ? `Valid until ${form.expiryDate}.`
      : "No expiry date.";

    const desc = `Use coupon ${form.code} to get ${type} ${minValue}. ${expiry}`;
    setForm((prev) => ({ ...prev, description: desc }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.code) return alert("Coupon code required");
    if (!form.discountType) return alert("Discount type is required");
    if (!form.amount) return alert("Amount is required");

    const payload = {
      ...form,
      amount: Number(form.amount),
      minOrderValue: form.minOrderValue ? Number(form.minOrderValue) : 0,
      usageLimit: form.usageLimit ? Number(form.usageLimit) : 0,
    };

    await dispatch(updateCoupon(id, payload));
    navigate("/admin/coupons/manage");
  };

  const offerPreview = form.amount
    ? form.discountType === "percentage"
      ? `${form.amount}% OFF`
      : `Rs. ${form.amount} OFF`
    : "--";

  if (!hasLoadedForm && loading) {
    return (
      <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(178,26,21,0.08),_transparent_28%),linear-gradient(180deg,_#f8f4ef_0%,_#f1ebe4_100%)] p-5 text-slate-900">
        <div className="mx-auto max-w-6xl rounded-[1.8rem] border border-white/60 bg-white/95 p-8 text-center shadow-[0_18px_40px_rgba(15,23,42,0.06)]">
          Loading coupon...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(178,26,21,0.08),_transparent_28%),linear-gradient(180deg,_#f8f4ef_0%,_#f1ebe4_100%)] p-5 text-slate-900">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <button
              type="button"
              onClick={() => navigate("/admin/coupons/manage")}
              className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/80 px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-white"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Coupons
            </button>
            <p className="mt-4 text-[11px] font-semibold uppercase tracking-[0.3em] text-[#B21A15]">
              Coupons / Edit
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
              Update Coupon
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600">
              Refine the offer, redemption rules, and customer-facing copy without
              leaving the coupon workflow.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-[1.5rem] border border-white/70 bg-white/80 px-4 py-4 shadow-sm">
              <p className="text-[11px] uppercase tracking-[0.18em] text-slate-500">
                Code
              </p>
              <p className="mt-2 text-xl font-semibold">{form.code || "--"}</p>
            </div>
            <div className="rounded-[1.5rem] border border-white/70 bg-white/80 px-4 py-4 shadow-sm">
              <p className="text-[11px] uppercase tracking-[0.18em] text-slate-500">
                Offer
              </p>
              <p className="mt-2 text-xl font-semibold">{offerPreview}</p>
            </div>
            <div className="rounded-[1.5rem] border border-white/70 bg-white/80 px-4 py-4 shadow-sm">
              <p className="text-[11px] uppercase tracking-[0.18em] text-slate-500">
                Expiry
              </p>
              <p className="mt-2 text-xl font-semibold">
                {form.expiryDate || "Open"}
              </p>
            </div>
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]"
        >
          <div className="space-y-6">
            <section className={cardClass}>
              <div className="mb-5">
                <h2 className="text-xl font-semibold">Basic Details</h2>
                <p className={`mt-1 ${helperClass}`}>
                  Update the coupon code, discount type, and primary value.
                </p>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className={labelClass}>Coupon Code</label>
                  <div className="mt-2 flex gap-2">
                    <input
                      className={inputClass}
                      placeholder="E.g. FESTIVE20"
                      value={form.code}
                      onChange={(e) =>
                        setForm((prev) => ({ ...prev, code: e.target.value }))
                      }
                    />
                    <button
                      type="button"
                      onClick={generateCode}
                      className="rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
                    >
                      Auto
                    </button>
                  </div>
                  <p className={`mt-2 ${helperClass}`}>
                    Replace the current code or generate a fresh campaign token.
                  </p>
                </div>

                <div>
                  <label className={labelClass}>Discount Type</label>
                  <select
                    className={`${inputClass} mt-2`}
                    value={form.discountType}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        discountType: e.target.value,
                      }))
                    }
                  >
                    <option value="">Select Discount Type</option>
                    <option value="percentage">Percentage</option>
                    <option value="fixed">Fixed Amount</option>
                  </select>
                </div>

                <div>
                  <label className={labelClass}>Discount Amount</label>
                  <input
                    type="number"
                    className={`${inputClass} mt-2`}
                    placeholder="E.g. 10 or 250"
                    value={form.amount}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, amount: e.target.value }))
                    }
                  />
                </div>

                <div>
                  <label className={labelClass}>Minimum Order Value</label>
                  <input
                    type="number"
                    className={`${inputClass} mt-2`}
                    placeholder="Optional"
                    value={form.minOrderValue}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        minOrderValue: e.target.value,
                      }))
                    }
                  />
                  <p className={`mt-2 ${helperClass}`}>
                    Leave empty to apply this coupon across all order values.
                  </p>
                </div>
              </div>
            </section>

            <section className={cardClass}>
              <div className="mb-5">
                <h2 className="text-xl font-semibold">Rules & Timing</h2>
                <p className={`mt-1 ${helperClass}`}>
                  Adjust how long the campaign runs and how often it can be used.
                </p>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className={labelClass}>Usage Limit</label>
                  <input
                    type="number"
                    className={`${inputClass} mt-2`}
                    placeholder="Total redemptions allowed"
                    value={form.usageLimit}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        usageLimit: e.target.value,
                      }))
                    }
                  />
                  <p className={`mt-2 ${helperClass}`}>
                    Set to 0 or leave empty to keep usage unlimited.
                  </p>
                </div>

                <div>
                  <label className={labelClass}>Expiry Date</label>
                  <input
                    type="date"
                    className={`${inputClass} mt-2`}
                    value={form.expiryDate}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        expiryDate: e.target.value,
                      }))
                    }
                  />
                  <p className={`mt-2 ${helperClass}`}>
                    Remove the date if the campaign should stay open.
                  </p>
                </div>
              </div>
            </section>

            <section className={cardClass}>
              <div className="mb-5 flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-xl font-semibold">Description</h2>
                  <p className={`mt-1 ${helperClass}`}>
                    Refresh the coupon messaging or auto-write a new description.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={autoDescription}
                  className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-xs font-semibold text-emerald-700 transition hover:bg-emerald-100"
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  Auto Write
                </button>
              </div>

              <textarea
                className={`${inputClass} h-32 resize-none`}
                placeholder="Explain how this coupon works and what customers should know."
                value={form.description}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
              />
            </section>

            {error ? (
              <div className="rounded-[1.4rem] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            ) : null}

            <div className="rounded-[1.8rem] border border-white/60 bg-white/95 p-5 shadow-[0_18px_40px_rgba(15,23,42,0.06)]">
              <button className="w-full rounded-full bg-[#B21A15] px-6 py-4 text-sm font-semibold uppercase tracking-[0.12em] text-white transition hover:bg-[#97150f]">
                {loading ? "Updating..." : "Update Coupon"}
              </button>
            </div>
          </div>

          <aside className="space-y-6 xl:sticky xl:top-8 xl:self-start">
            <div className={cardClass}>
              <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#B21A15]">
                Campaign Snapshot
              </p>
              <div className="mt-5 space-y-3">
                <div className="rounded-[1.4rem] bg-[#fbfaf7] px-4 py-4">
                  <div className="flex items-center gap-2 text-slate-500">
                    <TicketPercent className="h-4 w-4" />
                    <p className="text-[11px] uppercase tracking-[0.18em]">Code</p>
                  </div>
                  <p className="mt-2 font-semibold text-slate-900">
                    {form.code || "--"}
                  </p>
                </div>
                <div className="rounded-[1.4rem] bg-[#fbfaf7] px-4 py-4">
                  <div className="flex items-center gap-2 text-slate-500">
                    <ShieldCheck className="h-4 w-4" />
                    <p className="text-[11px] uppercase tracking-[0.18em]">Offer</p>
                  </div>
                  <p className="mt-2 font-semibold text-slate-900">{offerPreview}</p>
                </div>
                <div className="rounded-[1.4rem] bg-[#fbfaf7] px-4 py-4">
                  <div className="flex items-center gap-2 text-slate-500">
                    <CalendarClock className="h-4 w-4" />
                    <p className="text-[11px] uppercase tracking-[0.18em]">Expiry</p>
                  </div>
                  <p className="mt-2 font-semibold text-slate-900">
                    {form.expiryDate || "No expiry"}
                  </p>
                </div>
              </div>
            </div>

            <div className={cardClass}>
              <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#B21A15]">
                Editing Tips
              </p>
              <div className="mt-4 space-y-4 text-sm leading-6 text-slate-600">
                <p>Keep the public-facing code memorable if customers will type it manually.</p>
                <p>Use a minimum order value when you want the offer to protect lower-margin carts.</p>
                <p>Refresh the description after changing the offer so the campaign stays accurate.</p>
              </div>
            </div>

            <div className={cardClass}>
              <div className="flex items-start gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#fff5f2] text-[#B21A15]">
                  <PencilLine className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900">
                    Current Campaign
                  </p>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    You&apos;re editing an existing coupon, so updates will affect the
                    live campaign once saved.
                  </p>
                </div>
              </div>
            </div>
          </aside>
        </form>
      </div>
    </div>
  );
};

export default CouponUpdate;
