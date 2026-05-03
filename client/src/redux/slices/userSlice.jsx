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

export const fetchSavedAddresses = () => async (dispatch) => {
  try {
    dispatch(userStart());
    const { data } = await api.get("/user/addresses");
    dispatch(addressesSuccess(data));
  } catch (err) {
    dispatch(
      userFail(err.response?.data?.message || "Failed to load saved addresses")
    );
  }
};

export const saveAddress = (body) => async (dispatch) => {
  try {
    dispatch(userStart());
    const { data } = await api.post("/user/addresses", body);
    dispatch(addressesUpdated(data));
    return { ok: true };
  } catch (err) {
    dispatch(userFail(err.response?.data?.message || "Failed to save address"));
    return { ok: false };
  }
};

export const editSavedAddress = (addressId, body) => async (dispatch) => {
  try {
    dispatch(userStart());
    const { data } = await api.put(`/user/addresses/${addressId}`, body);
    dispatch(addressesUpdated(data));
    return { ok: true };
  } catch (err) {
    dispatch(userFail(err.response?.data?.message || "Failed to update address"));
    return { ok: false };
  }
};

export const removeSavedAddress = (addressId) => async (dispatch) => {
  try {
    dispatch(userStart());
    const { data } = await api.delete(`/user/addresses/${addressId}`);
    dispatch(addressesUpdated(data));
    return { ok: true };
  } catch (err) {
    dispatch(userFail(err.response?.data?.message || "Failed to delete address"));
    return { ok: false };
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
    savedAddresses: [],
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

    addressesSuccess: (state, action) => {
      state.loading = false;
      state.savedAddresses = action.payload;
    },

    addressesUpdated: (state, action) => {
      state.loading = false;
      state.savedAddresses = action.payload.savedAddresses || [];
      state.message = action.payload.message || "";
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

    clearUserFeedback: (state) => {
      state.error = null;
      state.message = "";
    },
  },
});

export const {
  userStart,
  profileSuccess,
  updateProfileSuccess,
  addressesSuccess,
  addressesUpdated,
  usersListSuccess,
  userDeleted,
  passwordChanged,
  resetSuccess,
  userFail,
  clearUserFeedback,
} = user.actions;

export default user.reducer;
