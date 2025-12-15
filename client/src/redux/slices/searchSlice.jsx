import { createSlice } from "@reduxjs/toolkit";
import api from "../../api/axios";

/* ----------------ASYNC ACTION---------------- */
export const fetchSuggestions = (query) => async (dispatch) => {
  try {
    if (!query.trim()) return dispatch(clearSuggestions());

    dispatch(searchStart());

    const { data } = await api.get(
      `/product/search?query=${encodeURIComponent(query)}`
    );

    dispatch(searchSuccess(data));
  } catch {
    dispatch(searchFail("Search failed"));
  }
};

/* ----------------SLICE---------------- */
const searchSlice = createSlice({
  name: "search",
  initialState: {
    suggestions: [],
    loading: false,
    error: null,
  },

  reducers: {
    searchStart: (state) => {
      state.loading = true;
    },

    searchSuccess: (state, action) => {
      state.loading = false;
      state.suggestions = action.payload || [];
      state.error = null;
    },

    clearSuggestions: (state) => {
      state.suggestions = [];
    },

    searchFail: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
  },
});

export const {
  searchStart,
  searchSuccess,
  clearSuggestions,
  searchFail,
} = searchSlice.actions;

export default searchSlice.reducer;
