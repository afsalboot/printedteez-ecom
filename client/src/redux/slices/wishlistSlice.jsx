import { createSlice } from "@reduxjs/toolkit";
import api from "../../api/axios.js";

export const getWishlist = () => async (dispatch) => {
  try {
    dispatch(wishStart());
    const { data } = await api.get("/wishlist/get-wish");
    dispatch(wishSuccess(data));
  } catch (err) {
    dispatch(
      wishFail(err.response?.data?.message || "Failed to load wishlist")
    );
  }
};

export const toggleWishlist = (productId) => async (dispatch) => {
  try {
    dispatch(wishStart());
    const { data } = await api.post("/wishlist/toggle", { productId });
    dispatch(wishToggled(data));
  } catch (err) {
    dispatch(
      wishFail(err.response?.data?.message || "Failed to update wishlist")
    );
  }
};


const wishlist = createSlice({
  name: "wishlistData",
  initialState: {
    items: [],
    loading: false,
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
      state.items = action.payload; // full wishlist array
    },

    wishToggled: (state, action) => {
      state.loading = false;
      state.items = action.payload.wishlist;
      state.message = action.payload.message;
    },

    wishFail: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
  },
});

export const { wishStart, wishSuccess, wishToggled, wishFail } = wishlist.actions;

export default wishlist.reducer;
