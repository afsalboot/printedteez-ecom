import { createSlice } from "@reduxjs/toolkit";
import api from "../../api/axios.js";

export const getSitePage = (page) => async (dispatch) => {
  try {
    dispatch(sitePageStart());
    const { data } = await api.get(`/site-pages/${page}`);
    dispatch(sitePageLoaded(data));
  } catch (err) {
    dispatch(
      sitePageFail(err.response?.data?.message || "Failed to load page content")
    );
  }
};

export const getAdminSitePages = () => async (dispatch) => {
  try {
    dispatch(sitePageStart());
    const { data } = await api.get("/site-pages/admin/all");
    dispatch(sitePagesLoaded(data));
  } catch (err) {
    dispatch(
      sitePageFail(err.response?.data?.message || "Failed to load page content")
    );
  }
};

export const updateSitePage = (page, payload) => async (dispatch) => {
  try {
    dispatch(sitePageStart());
    const { data } = await api.put(`/site-pages/admin/${page}`, payload);
    dispatch(sitePageUpdated(data));
  } catch (err) {
    dispatch(
      sitePageFail(err.response?.data?.message || "Failed to update page content")
    );
  }
};

const sitePageSlice = createSlice({
  name: "sitePages",
  initialState: {
    loading: false,
    error: null,
    pages: {},
    message: "",
  },
  reducers: {
    sitePageStart: (state) => {
      state.loading = true;
      state.error = null;
      state.message = "";
    },
    sitePageLoaded: (state, action) => {
      state.loading = false;
      state.pages[action.payload.page] = action.payload;
    },
    sitePagesLoaded: (state, action) => {
      state.loading = false;
      state.pages = action.payload.reduce((acc, page) => {
        acc[page.page] = page;
        return acc;
      }, {});
    },
    sitePageUpdated: (state, action) => {
      state.loading = false;
      state.pages[action.payload.page] = action.payload;
      state.message = "Page content updated successfully.";
    },
    sitePageFail: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    clearSitePageMessage: (state) => {
      state.message = "";
    },
  },
});

export const {
  sitePageStart,
  sitePageLoaded,
  sitePagesLoaded,
  sitePageUpdated,
  sitePageFail,
  clearSitePageMessage,
} = sitePageSlice.actions;

export default sitePageSlice.reducer;
