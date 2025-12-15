import { createSlice } from "@reduxjs/toolkit";
import api from "../../api/axios.js";

// SIGNUP
export const signup = (formData) => async (dispatch) => {
  try {
    dispatch(authStart());

    const { data } = await api.post("/auth/signup", formData);

    dispatch(signupSuccess(data.message));
  } catch (err) {
    dispatch(authFail(err.response?.data?.message || "Signup failed"));
  }
};

// LOGIN
export const login = (credentials) => async (dispatch) => {
  try {
    dispatch(authStart());

    const { data } = await api.post("/auth/login", credentials);

    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data.user));

    dispatch(authSuccess(data));
  } catch (err) {
    dispatch(authFail(err.response?.data?.message || "Login failed"));
  }
};


const auth = createSlice({
  name: "authData",
  initialState: {
    user: JSON.parse(localStorage.getItem("user")) || null,
    token: localStorage.getItem("token") || "",
    loading: false,
    error: null,
    successMessage: "",
  },

  reducers: {
    authStart: (state) => {
      state.loading = true;
      state.error = null;
      state.successMessage = "";
    },

    authSuccess: (state, action) => {
      state.loading = false;
      state.user = action.payload.user;
      state.token = action.payload.token;
    },

    signupSuccess: (state, action) => {
      state.loading = false;
      state.successMessage = action.payload;
    },

    authFail: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },

    logout: (state) => {
      state.user = null;
      state.token = "";
      localStorage.removeItem("user");
      localStorage.removeItem("token");
    },
  },
});

export const { authStart, authSuccess, authFail, signupSuccess, logout } =
  auth.actions;

export default auth.reducer;
