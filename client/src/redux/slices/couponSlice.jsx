import { createSlice } from "@reduxjs/toolkit";
import api from "../../api/axios.js";

// Validate Coupon
export const validateCoupon = (code, subtotal) => async (dispatch) => {
  try {
    dispatch(couponStart());
    const { data } = await api.get(
      `/coupon/validate-coupon?code=${code}&subtotal=${subtotal}`
    );
    // expect something like: { coupon, discountAmount }
    dispatch(couponValidateSuccess(data));
  } catch (err) {
    dispatch(couponFail(err.response?.data?.message || "Invalid coupon"));
  }
};

// List Coupons (Admin)
export const listCoupons = () => async (dispatch) => {
  try {
    dispatch(couponStart());
    const { data } = await api.get("/coupon/list-coupon");
    dispatch(couponListSuccess(data));
  } catch (err) {
    dispatch(couponFail("Failed to load coupons"));
  }
};

// Create Coupon (Admin)
export const createCoupon = (payload) => async (dispatch) => {
  try {
    dispatch(couponStart());
    const { data } = await api.post("/coupon/create-coupon", payload);
    dispatch(couponCreateSuccess(data.message));
    dispatch(listCoupons());
  } catch (err) {
    dispatch(
      couponFail(err.response?.data?.message || "Failed to create coupon")
    );
  }
};

// Update Coupon
export const updateCoupon = (id, payload) => async (dispatch) => {
  try {
    dispatch(couponStart());
    const { data } = await api.put(`/coupon/update-coupon/${id}`, payload);
    dispatch(couponUpdateSuccess(data));
  } catch (err) {
    dispatch(
      couponFail(err.response?.data?.message || "Failed to update coupon")
    );
  }
};

// Delete Coupon
export const deleteCoupon = (id) => async (dispatch) => {
  try {
    dispatch(couponStart());
    const { data } = await api.delete(`/coupon/delete-coupon/${id}`);
    dispatch(couponDeleteSuccess({ message: data.message, id }));
  } catch (err) {
    dispatch(
      couponFail(err.response?.data?.message || "Failed to delete coupon")
    );
  }
};

// Toggle Active / Inactive
export const toggleCouponStatus = (id) => async (dispatch) => {
  try {
    dispatch(couponStart());
    const { data } = await api.patch(`/coupon/toggle-coupon/${id}`);
    dispatch(couponToggleSuccess(data));
    dispatch(listCoupons());
  } catch (err) {
    dispatch(
      couponFail(err.response?.data?.message || "Failed to toggle status")
    );
  }
};

export const getActiveOffers = () => async (dispatch) => {
  try {
    dispatch(couponStart());
    const { data } = await api.get("/coupon/active-offers");
    dispatch(activeOffersSuccess(data.offers));
  } catch (err) {
    dispatch(couponFail("Failed to load active offers"));
  }
};

const coupon = createSlice({
  name: "couponData",
  initialState: {
    coupons: [],
    validatedCoupon: null,
    activeOffers: [],
    loading: false,
    error: null,
    message: "",
  },

  reducers: {
    couponStart: (state) => {
      state.loading = true;
      state.error = null;
      state.message = "";
    },

    couponFail: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },

    couponListSuccess: (state, action) => {
      state.loading = false;
      state.coupons = action.payload;
    },

    couponCreateSuccess: (state, action) => {
      state.loading = false;
      state.message = action.payload;
    },

    couponUpdateSuccess: (state, action) => {
      state.loading = false;
      state.message = action.payload.message;

      const updated = action.payload.coupon;
      const index = state.coupons.findIndex((c) => c._id === updated._id);
      if (index > -1) state.coupons[index] = updated;
    },

    couponDeleteSuccess: (state, action) => {
      state.loading = false;
      state.message = action.payload.message;
      state.coupons = state.coupons.filter((c) => c._id !== action.payload.id);
    },

    couponToggleSuccess: (state, action) => {
      state.loading = false;
      state.message = action.payload.message;
    },

    couponValidateSuccess: (state, action) => {
      state.loading = false;
      state.validatedCoupon = action.payload; // e.g. { coupon, discountAmount }
    },

    activeOffersSuccess: (state, action) => {
      state.loading = false;
      state.activeOffers = action.payload;
    },

    // 🔹 NEW: clear coupon on remove / order complete
    clearValidatedCoupon: (state) => {
      state.validatedCoupon = null;
      state.error = null;
    },
  },
});

export const {
  couponStart,
  couponFail,
  couponListSuccess,
  couponCreateSuccess,
  couponUpdateSuccess,
  couponDeleteSuccess,
  couponToggleSuccess,
  couponValidateSuccess,
  activeOffersSuccess,
  clearValidatedCoupon, // 👈 export this
} = coupon.actions;

export default coupon.reducer;
