// src/redux/slices/sectionsSlice.js
import { createSlice } from "@reduxjs/toolkit";
import api from "../../api/axios.js";

// =======================
// THUNKS
// =======================

// GET all sections
export const getSections = () => async (dispatch) => {
  try {
    dispatch(sectionStart());
    const { data } = await api.get("/sections/get-sections");
    dispatch(sectionSuccess(data));
  } catch (err) {
    dispatch(
      sectionFail(err.response?.data?.message || "Failed to load sections")
    );
  }
};

// CREATE section
export const createSection = (sectionData) => async (dispatch) => {
  try {
    dispatch(sectionStart());
    const { data } = await api.post("/sections/create-section", sectionData);
    dispatch(sectionAdd(data));
  } catch (err) {
    dispatch(
      sectionFail(err.response?.data?.message || "Failed to create section")
    );
  }
};

// UPDATE section
export const updateSection = (id, sectionData) => async (dispatch) => {
  try {
    dispatch(sectionStart());
    const { data } = await api.put(
      `/sections/update-Section/${id}`,
      sectionData
    );
    dispatch(sectionUpdate(data));
  } catch (err) {
    dispatch(
      sectionFail(err.response?.data?.message || "Failed to update section")
    );
  }
};

// DELETE section
export const deleteSection = (id) => async (dispatch) => {
  try {
    dispatch(sectionStart());
    await api.delete(`/sections/delete-section/${id}`);
    dispatch(sectionDelete(id));
  } catch (err) {
    dispatch(
      sectionFail(err.response?.data?.message || "Failed to delete section")
    );
  }
};

// =======================
// SLICE
// =======================

const sectionsSlice = createSlice({
  name: "sections",

  initialState: {
    loading: false,
    error: null,
    list: [],
  },

  

  reducers: {
    sectionStart: (state) => {
      state.loading = true;
      state.error = null;
    },

    sectionSuccess: (state, action) => {
      state.loading = false;
      state.list = action.payload;
    },

    sectionAdd: (state, action) => {
      state.loading = false;
      state.list.push(action.payload);
    },

    sectionUpdate: (state, action) => {
      state.loading = false;
      state.list = state.list.map((sec) =>
        sec._id === action.payload._id ? action.payload : sec
      );
    },

    sectionDelete: (state, action) => {
      state.loading = false;
      state.list = state.list.filter((sec) => sec._id !== action.payload);
    },

    sectionFail: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },

    
  },
});



export const {
  sectionStart,
  sectionSuccess,
  sectionAdd,
  sectionUpdate,
  sectionDelete,
  sectionFail,
} = sectionsSlice.actions;

export default sectionsSlice.reducer;
