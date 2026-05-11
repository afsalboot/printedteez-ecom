import { createSlice } from "@reduxjs/toolkit";
import api from "../../api/axios";

/* ----------------ASYNC ACTION---------------- */
export const fetchSuggestions = (query) => async (dispatch) => {
  try {
    const normalizedQuery = query.trim();
    if (normalizedQuery.length < 2) return dispatch(clearSuggestions());

    dispatch(searchStart(normalizedQuery));

    const cacheKey = normalizedQuery.toLowerCase();
    const cached = suggestionCache[cacheKey];
    if (cached) {
      dispatch(searchSuccess({ query: normalizedQuery, suggestions: cached }));
      return;
    }

    const { data } = await api.get(
      `/product/search?query=${encodeURIComponent(normalizedQuery)}`
    );

    suggestionCache[cacheKey] = data || [];
    dispatch(searchSuccess({ query: normalizedQuery, suggestions: data || [] }));
  } catch {
    dispatch(searchFail("Search failed"));
  }
};

const suggestionCache = {};

/* ----------------SLICE---------------- */
const searchSlice = createSlice({
  name: "search",
  initialState: {
    suggestions: [],
    loading: false,
    error: null,
    activeQuery: "",
  },

  reducers: {
    searchStart: (state, action) => {
      state.loading = true;
      state.error = null;
      state.activeQuery = action.payload || "";
    },

    searchSuccess: (state, action) => {
      if (action.payload?.query !== state.activeQuery) return;
      state.loading = false;
      state.suggestions = action.payload?.suggestions || [];
      state.error = null;
    },

    clearSuggestions: (state) => {
      state.loading = false;
      state.suggestions = [];
      state.activeQuery = "";
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
