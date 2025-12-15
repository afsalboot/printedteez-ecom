import { createSlice } from "@reduxjs/toolkit";
import api from "../../api/axios.js";

export const fetchProfile = () => async (dispatch) => {
  try {
    dispatch(userStart());
    const { data } = await api.get("/user/get-profile");
    dispatch(profileSuccess(data));
  } catch {
    dispatch(userFail("Failed to load profile"));
  }
};

export const updateProfile = (formData) => async (dispatch) => {
  try {
    dispatch(userStart());
    const { data } = await api.put("/user/update-profile", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    dispatch(updateProfileSuccess(data));
  } catch (err) {
    dispatch(userFail(err.response?.data?.message || "Failed to update profile"));
  }
};

export const changePassword = (body) => async (dispatch) => {
  try {
    dispatch(userStart());
    const { data } = await api.put("/user/change-password", body);
    dispatch(passwordChanged(data.message));
  } catch (err) {
    dispatch(userFail(err.response?.data?.message || "Failed to change password"));
  }
};


export const deleteMyAccount = () => async (dispatch) => {
  try {
    dispatch(userStart());
    const { data } = await api.delete("/user/delete-profile");
    dispatch(resetSuccess(data.message));
  } catch {
    dispatch(userFail("Account deletion failed"));
  }
};

export const requestReset = (email) => async (dispatch) => {
  try {
    dispatch(userStart());
    const { data } = await api.post("/user/request-password-reset", { email });
    dispatch(resetSuccess(data.message));
  } catch (err) {
    dispatch(userFail(err.response?.data?.message || "Failed to request reset link"));
  }
};

export const resetPassword = (body) => async (dispatch) => {
  try {
    dispatch(userStart());
    const { data } = await api.post("/user/reset-password", body);
    dispatch(resetSuccess(data.message));
  } catch (err) {
    dispatch(userFail(err.response?.data?.message || "Failed to reset password"));
  }
};

export const getAllUsers = () => async (dispatch) => {
  try {
    dispatch(userStart());
    const { data } = await api.get("/user/admin/get-users");
    dispatch(usersListSuccess(data));
  } catch {
    dispatch(userFail("Failed to fetch users"));
  }
};

export const deleteUser = (id) => async (dispatch) => {
  try {
    dispatch(userStart());
    const { data } = await api.delete(`/user/admin/delete-user/${id}`);
    dispatch(userDeleted({ id, message: data.message }));
  } catch {
    dispatch(userFail("Failed to delete user"));
  }
};


const user = createSlice({
  name: "userData",
  initialState: {
    profile: null,
    users: [],   // admin users list
    loading: false,
    error: null,
    message: "",
  },

  reducers: {
    userStart: (state) => {
      state.loading = true;
      state.error = null;
      state.message = "";
    },

    profileSuccess: (state, action) => {
      state.loading = false;
      state.profile = action.payload;
    },

    updateProfileSuccess: (state, action) => {
      state.loading = false;
      state.profile = action.payload.user;
      state.message = action.payload.message;
    },

    passwordChanged: (state, action) => {
      state.loading = false;
      state.message = action.payload;
    },

    usersListSuccess: (state, action) => {
      state.loading = false;
      state.users = action.payload;
    },

    userDeleted: (state, action) => {
      state.loading = false;
      state.message = action.payload.message;
      state.users = state.users.filter((u) => u._id !== action.payload.id);
    },

    resetSuccess: (state, action) => {
      state.loading = false;
      state.message = action.payload;
    },

    userFail: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
  },
});

export const {
  userStart,
  profileSuccess,
  updateProfileSuccess,
  usersListSuccess,
  userDeleted,
  passwordChanged,
  resetSuccess,
  userFail,
} = user.actions;

export default user.reducer;
