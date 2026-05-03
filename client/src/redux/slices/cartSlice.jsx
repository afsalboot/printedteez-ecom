import { createSlice } from "@reduxjs/toolkit";
import api from "../../api/axios.js";

export const getCart = () => async (dispatch) => {
  try {
    dispatch(cartStart()); // ONLY HERE
    const { data } = await api.get("/cart/get-cart");
    dispatch(cartSuccess(data.cart || data));
  } catch (err) {
    dispatch(cartFail(err.response?.data?.message || "Failed to load cart"));
  }
};

export const addToCart = (payload) => async (dispatch) => {
  try {
    dispatch(cartStart());
    const { data } = await api.post("/cart/add-to-cart", payload);
    dispatch(cartSuccess(data.cart || data));
  } catch (err) {
    console.error("addToCart error:", err.response?.data || err.message || err);
    dispatch(cartFail(err.response?.data?.message || "Failed to add to cart"));
  }
};

export const updateQty = ({ itemId, qty }) => async (dispatch) => {
  try {
    const { data } = await api.put("/cart/update-qty", { itemId, qty });
    dispatch(cartSuccess(data.cart));
  } catch (err) {
    dispatch(
      cartFail(err.response?.data?.message || "Failed to update qty")
    );
  }
};


export const removeItem = (itemId) => async (dispatch) => {
  try {
    const { data } = await api.delete(`/cart/remove-cart/${itemId}`);
    dispatch(cartSuccess(data.cart));
  } catch (err) {
    dispatch(cartFail(err.response?.data?.message || "Failed to remove item"));
  }
};

export const clearCart = () => async (dispatch) => {
  try {
    dispatch(cartStart());
    const { data } = await api.delete("/cart/clear-cart");
    dispatch(cartSuccess(data.cart));
  } catch (err) {
    dispatch(cartFail(err.response?.data?.message || "Failed to clear cart"));
  }
};

const cart = createSlice({
  name: "cartData",
  initialState: {
    items: [],
    loading: false,
    error: null,
  },

  reducers: {
    cartStart: (state) => {
      state.loading = true;
      state.error = null;
    },

    cartSuccess: (state, action) => {
      state.loading = false;

      const payload = action.payload || {};

      // If backend returns array directly
      if (Array.isArray(payload)) {
        state.items = payload;
        return;
      }

      // If backend returns { items: [...] }
      if (Array.isArray(payload.items)) {
        state.items = payload.items;
        return;
      }

      // If backend returns { cart: [...] }
      if (Array.isArray(payload.cart)) {
        state.items = payload.cart;
        return;
      }

      state.items = [];
    },

    cartFail: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },

    resetCart: (state) => {
      state.items = [];
    },
  },
});

export const { cartStart, cartSuccess, cartFail, resetCart } = cart.actions;

export default cart.reducer;
