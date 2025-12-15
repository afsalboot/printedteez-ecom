import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { updateCoupon, listCoupons } from "../../redux/slices/couponSlice";
import { useNavigate, useParams } from "react-router";

const CouponUpdate = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { id } = useParams();

  const { coupons } = useSelector((s) => s.coupon);

  const [form, setForm] = useState({
    code: "",
    discountType: "",
    amount: "",
    minOrderValue: "",
    usageLimit: "",
    expiryDate: "",
    description: "",
  });

  useEffect(() => {
    dispatch(listCoupons());
  }, [dispatch]);

  useEffect(() => {
    const coupon = coupons.find((c) => c._id === id);
    if (coupon) {
      setForm({
        code: coupon.code,
        discountType: coupon.discountType,
        amount: coupon.amount,
        minOrderValue: coupon.minOrderValue || "",
        usageLimit: coupon.usageLimit || "",
        expiryDate: coupon.expiryDate ? coupon.expiryDate.split("T")[0] : "",
        description: coupon.description || "",
      });
    }
  }, [coupons, id]);

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
        : `Flat ₹${form.amount} OFF`;

    const minValue = form.minOrderValue
      ? `on orders above ₹${form.minOrderValue}`
      : "";

    const expiry = form.expiryDate
      ? `Valid until ${form.expiryDate}.`
      : "No expiry date.";

    const desc = `Use coupon ${form.code} to get ${type} ${minValue}. ${expiry}`;
    setForm((prev) => ({ ...prev, description: desc }));
  };

  /* ---------------------- Submit update ---------------------- */
  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      ...form,
      amount: Number(form.amount),
      minOrderValue: form.minOrderValue ? Number(form.minOrderValue) : 0,
      usageLimit: form.usageLimit ? Number(form.usageLimit) : 0,
    };

    try {
      await dispatch(updateCoupon({ id, data: payload })).unwrap();
      navigate("/admin/coupons");
    } catch (err) {
      alert("Failed to update coupon");
      console.log(err);
    }
  };

  return (
    <div className="p-6 bg-gray-100 dark:bg-gray-900 min-h-screen text-gray-900 dark:text-gray-100">
      <div className="max-w-3xl mx-auto">
        {/* HEADER */}
        <div className="mb-6">
          <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">
            Coupons / Edit
          </p>
          <h1 className="text-2xl font-semibold mt-1">Update Coupon</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Modify the code, discount, limits, and description for this coupon.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-md border border-gray-200 dark:border-gray-700 space-y-6"
        >
          {/* BASIC SETTINGS */}
          <section className="space-y-4">
            <div>
              <h2 className="text-lg font-semibold">Basic Details</h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Update the coupon code, type, and discount value.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Coupon Code */}
              <div className="space-y-1">
                <label className="text-sm font-medium">Coupon Code</label>
                <div className="flex gap-2">
                  <input
                    className="input flex-1 bg-gray-100 dark:bg-gray-700 dark:text-white"
                    placeholder="Coupon Code"
                    value={form.code}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, code: e.target.value }))
                    }
                  />
                  <button
                    type="button"
                    onClick={generateCode}
                    className="px-3 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition"
                  >
                    Auto
                  </button>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Use a short, clean identifier. Auto will generate a random one.
                </p>
              </div>

              {/* Discount Type */}
              <div className="space-y-1">
                <label className="text-sm font-medium">Discount Type</label>
                <select
                  className="input bg-gray-100 dark:bg-gray-700 dark:text-white"
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
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Choose between a % discount or a flat ₹ amount.
                </p>
              </div>

              {/* Amount */}
              <div className="space-y-1">
                <label className="text-sm font-medium">Discount Amount</label>
                <input
                  type="number"
                  className="input bg-gray-100 dark:bg-gray-700 dark:text-white"
                  placeholder="Amount"
                  value={form.amount}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, amount: e.target.value }))
                  }
                />
              </div>

              {/* Min Order */}
              <div className="space-y-1">
                <label className="text-sm font-medium">
                  Minimum Order Value
                </label>
                <input
                  type="number"
                  className="input bg-gray-100 dark:bg-gray-700 dark:text-white"
                  placeholder="Min Order Value"
                  value={form.minOrderValue}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      minOrderValue: e.target.value,
                    }))
                  }
                />
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Optional. Leave empty to apply on all order values.
                </p>
              </div>

              {/* Usage Limit */}
              <div className="space-y-1">
                <label className="text-sm font-medium">Usage Limit</label>
                <input
                  type="number"
                  className="input bg-gray-100 dark:bg-gray-700 dark:text-white"
                  placeholder="Usage Limit"
                  value={form.usageLimit}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      usageLimit: e.target.value,
                    }))
                  }
                />
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Total times this coupon can be redeemed. 0 = unlimited.
                </p>
              </div>

              {/* Expiry Date */}
              <div className="space-y-1">
                <label className="text-sm font-medium">Expiry Date</label>
                <input
                  type="date"
                  className="input bg-gray-100 dark:bg-gray-700 dark:text-white"
                  value={form.expiryDate}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      expiryDate: e.target.value,
                    }))
                  }
                />
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Leave empty for no expiry.
                </p>
              </div>
            </div>
          </section>

          {/* DESCRIPTION */}
          <section className="pt-4 border-t border-gray-200 dark:border-gray-700 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold">Description</h2>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Refresh the customer-facing description or auto-generate it.
                </p>
              </div>
              <button
                type="button"
                onClick={autoDescription}
                className="px-3 py-2 bg-green-600 text-white rounded text-sm hover:bg-green-700 transition"
              >
                Auto
              </button>
            </div>

            <div className="flex gap-2">
              <textarea
                className="input h-28 flex-1 bg-gray-100 dark:bg-gray-700 dark:text-white"
                placeholder="Description"
                value={form.description}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
              ></textarea>
            </div>
          </section>

          {/* SUBMIT */}
          <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
            <button className="w-full bg-yellow-600 hover:bg-yellow-700 text-white py-3 rounded font-semibold tracking-wide shadow-sm hover:shadow-md transform hover:-translate-y-0.5 transition">
              Update Coupon
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CouponUpdate;
