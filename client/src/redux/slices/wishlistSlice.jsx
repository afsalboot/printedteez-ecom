import { createSlice } from "@reduxjs/toolkit";
import api from "../../api/axios.js";

export const getWishlist = () => async (dispatch) => {
  try {
    dispatch(wishStart());
    const { data } = await api.get("/wishlist/get-wish");
    dispatch(wishSuccess(data));
    return { ok: true, items: data };
  } catch (err) {
    const message =
      err.response?.data?.message || "Failed to load wishlist";
    dispatch(wishFail(message));
    return { ok: false, error: message };
  }
};

export const toggleWishlist = (productId) => async (dispatch) => {
  try {
    dispatch(wishStart());
    const { data } = await api.post("/wishlist/toggle", { productId });
    dispatch(wishToggled(data));
    return { ok: true, data };
  } catch (err) {
    const message =
      err.response?.data?.message || "Failed to update wishlist";
    dispatch(wishFail(message));
    return { ok: false, error: message };
  }
};


const wishlist = createSlice({
  name: "wishlistData",
  initialState: {
    items: [],
    loading: false,
    loaded: false,
    error: null,
    message: "",
  },

  reducers: {
    wishStart: (state) => {
      state.loading = true;
      state.error = null;
      state.message = "";
    },

    wishSuccess: (state, action) => {
      state.loading = false;
      state.loaded = true;
      state.items = action.payload; // full wishlist array
    },

    wishToggled: (state, action) => {
      state.loading = false;
      state.loaded = true;
      state.items = action.payload.wishlist;
      state.message = action.payload.message;
    },

    wishFail: (state, action) => {
      state.loading = false;
      state.loaded = true;
      state.error = action.payload;
    },

    clearWishlist: (state) => {
      state.items = [];
      state.loading = false;
      state.loaded = false;
      state.error = null;
      state.message = "";
    },
  },
});

export const { wishStart, wishSuccess, wishToggled, wishFail, clearWishlist } =
  wishlist.actions;

export default wishlist.reducer;
