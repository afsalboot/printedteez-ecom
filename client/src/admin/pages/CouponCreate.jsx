import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { createCoupon } from "../../redux/slices/couponSlice";
import { useNavigate } from "react-router";
import { ArrowLeft, Sparkles, TicketPercent, CalendarClock, ShieldCheck } from "lucide-react";

const cardClass =
  "rounded-[1.8rem] border border-white/60 bg-white/95 p-6 shadow-[0_18px_40px_rgba(15,23,42,0.06)] backdrop-blur-sm";
const inputClass =
  "w-full rounded-2xl border border-slate-200 bg-[#fbfaf7] px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-[#B21A15] focus:bg-white";
const labelClass = "text-sm font-semibold text-slate-800";
const helperClass = "text-xs leading-5 text-slate-500";

const CouponCreate = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    code: "",
    discountType: "",
    amount: "",
    minOrderValue: "",
    usageLimit: "",
    expiryDate: "",
    description: "",
  });

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
      : "";

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

    try {
      await dispatch(createCoupon(payload));
      navigate("/admin/coupons/manage");
    } catch (err) {
      console.error("Failed to create coupon:", err);
      alert("Failed to create coupon");
    }
  };

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
              Coupons / New
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
              Create Coupon
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600">
              Build a discount campaign with cleaner inputs, clearer structure, and a live summary before publishing.
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
                Discount
              </p>
              <p className="mt-2 text-xl font-semibold">
                {form.amount ? `${form.amount}${form.discountType === "percentage" ? "%" : ""}` : "--"}
              </p>
            </div>
            <div className="rounded-[1.5rem] border border-white/70 bg-white/80 px-4 py-4 shadow-sm">
              <p className="text-[11px] uppercase tracking-[0.18em] text-slate-500">
                Expiry
              </p>
              <p className="mt-2 text-xl font-semibold">{form.expiryDate || "Open"}</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
          <div className="space-y-6">
            <section className={cardClass}>
              <div className="mb-5">
                <h2 className="text-xl font-semibold">Basic Details</h2>
                <p className={`mt-1 ${helperClass}`}>
                  Start with the coupon code, discount type, and primary offer value.
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
                    Use a short memorable code or generate one automatically.
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
                    Leave empty to apply on all order values.
                  </p>
                </div>
              </div>
            </section>

            <section className={cardClass}>
              <div className="mb-5">
                <h2 className="text-xl font-semibold">Rules & Timing</h2>
                <p className={`mt-1 ${helperClass}`}>
                  Define redemption limits and when the coupon expires.
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
                    Set to 0 or leave empty for unlimited usage.
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
                    Leave empty if this campaign should stay open.
                  </p>
                </div>
              </div>
            </section>

            <section className={cardClass}>
              <div className="mb-5 flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-xl font-semibold">Description</h2>
                  <p className={`mt-1 ${helperClass}`}>
                    Auto-generate a customer-facing explanation or write a custom one.
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
                placeholder="Explain how this coupon works, where it applies, and what customers should know."
                value={form.description}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
              />
            </section>

            <div className="rounded-[1.8rem] border border-white/60 bg-white/95 p-5 shadow-[0_18px_40px_rgba(15,23,42,0.06)]">
              <button className="w-full rounded-full bg-[#B21A15] px-6 py-4 text-sm font-semibold uppercase tracking-[0.12em] text-white transition hover:bg-[#97150f]">
                Create Coupon
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
                  <p className="mt-2 font-semibold text-slate-900">{form.code || "--"}</p>
                </div>
                <div className="rounded-[1.4rem] bg-[#fbfaf7] px-4 py-4">
                  <div className="flex items-center gap-2 text-slate-500">
                    <ShieldCheck className="h-4 w-4" />
                    <p className="text-[11px] uppercase tracking-[0.18em]">Offer</p>
                  </div>
                  <p className="mt-2 font-semibold text-slate-900">
                    {form.amount
                      ? form.discountType === "percentage"
                        ? `${form.amount}% OFF`
                        : `Rs. ${form.amount} OFF`
                      : "--"}
                  </p>
                </div>
                <div className="rounded-[1.4rem] bg-[#fbfaf7] px-4 py-4">
                  <div className="flex items-center gap-2 text-slate-500">
                    <CalendarClock className="h-4 w-4" />
                    <p className="text-[11px] uppercase tracking-[0.18em]">Expiry</p>
                  </div>
                  <p className="mt-2 font-semibold text-slate-900">{form.expiryDate || "No expiry"}</p>
                </div>
              </div>
            </div>

            <div className={cardClass}>
              <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#B21A15]">
                Writing Tips
              </p>
              <div className="mt-4 space-y-4 text-sm leading-6 text-slate-600">
                <p>Keep codes easy to remember when the offer is meant for public campaigns.</p>
                <p>Use clear expiry dates for urgency and easier campaign cleanup later.</p>
                <p>Set a minimum order value when you want to protect margin on low-ticket carts.</p>
              </div>
            </div>
          </aside>
        </form>
      </div>
    </div>
  );
};

export default CouponCreate;
