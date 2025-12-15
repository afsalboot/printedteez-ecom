import { createSlice } from "@reduxjs/toolkit";
import api from "../../api/axios.js";

export const adminLogin = (credentials) => async (dispatch) => {
  try {
    dispatch(adminStart());

    const { data } = await api.post("/admin/admin-login", credentials);

    localStorage.setItem("adminToken", data.token);
    localStorage.setItem("admin", JSON.stringify(data.admin));

    dispatch(adminSuccess(data));
    return data; 
  } catch (err) {
    dispatch(adminFail(err.response?.data?.message || "Admin login failed"));
  }
};


const admin = createSlice({
  name: "adminData",
  initialState: {
    admin: JSON.parse(localStorage.getItem("admin")) || null,
    adminToken: localStorage.getItem("adminToken") || "",
    loading: false,
    error: null,
  },

  reducers: {
    adminStart: (state) => {
      state.loading = true;
      state.error = null;
    },

    adminSuccess: (state, action) => {
      state.loading = false;
      state.admin = action.payload.admin;
      state.adminToken = action.payload.token;
    },

    adminFail: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },

    adminLogout: (state) => {
      state.admin = null;
      state.adminToken = "";
      localStorage.removeItem("admin");
      localStorage.removeItem("adminToken");
    },
  },
});

export const { adminStart, adminSuccess, adminFail, adminLogout } = admin.actions;
export default admin.reducer;
