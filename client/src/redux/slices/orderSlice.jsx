import { createSlice } from "@reduxjs/toolkit";
import api from "../../api/axios.js";

export const createOrder = (body) => async (dispatch) => {
  try {
    dispatch(orderStart());
    const { data } = await api.post("/order/create-order", body);

    if (data?.order && body.paymentMethod === "cod") {
      dispatch(orderSuccess({ message: data.message }));
      return;
    }

    dispatch(
      stripeInitSuccess({
        clientSecret: data.clientSecret,
        paymentIntentId: data.paymentIntentId,
      })
    );
  } catch (err) {
    dispatch(orderFail(err.response?.data?.message || "Order creation failed"));
  }
};

export const confirmOrder = (paymentIntentId) => async (dispatch) => {
  try {
    dispatch(orderStart());
    const { data } = await api.post("/order/confirm-order", { paymentIntentId });
    dispatch(orderSuccess({ message: data.message }));
  } catch (err) {
    dispatch(orderFail(err.response?.data?.message || "Payment failed"));
  }
};

export const getMyOrders = () => async (dispatch) => {
  try {
    dispatch(orderStart());
    const { data } = await api.get("/order/get-all-orders");
    dispatch(myOrdersSuccess(data));
  } catch {
    dispatch(orderFail("Failed to get orders"));
  }
};

export const getOrderById = (id) => async (dispatch) => {
  try {
    dispatch(orderStart());
    const { data } = await api.get(`/order/get-order/${id}`);
    dispatch(orderDetailsSuccess(data));
  } catch {
    dispatch(orderFail("Failed to fetch order"));
  }
};

export const updateShippingAddress = (id, body) => async (dispatch) => {
  try {
    dispatch(orderStart());
    const { data } = await api.put(`/order/update-address/${id}`, body);
    dispatch(orderSuccess({ message: data.message }));
    dispatch(syncCustomerOrder(data.order));
    dispatch(orderDetailsSuccess(data.order));
    return { ok: true, order: data.order };
  } catch {
    dispatch(orderFail("Failed to update address"));
    return { ok: false };
  }
};

export const cancelOrder = (id) => async (dispatch) => {
  try {
    dispatch(orderStart());
    const { data } = await api.put(`/order/cancel-order/${id}`);
    dispatch(orderSuccess({ message: data.message }));
    dispatch(syncCustomerOrder(data.order));
    dispatch(orderDetailsSuccess(data.order));
    return { ok: true, order: data.order };
  } catch (err) {
    dispatch(orderFail(err.response?.data?.message || "Cancel failed"));
    return { ok: false };
  }
};

export const updateStatus = (id, status) => async (dispatch) => {
  try {
    dispatch(orderStart());
    const { data } = await api.put(`/order/admin/order/${id}/status`, { status });
    dispatch(orderSuccess({ message: "Order status updated" }));
    dispatch(updateAdminOrderState(data.order));
    return { ok: true };
  } catch (err) {
    dispatch(orderFail(err.response?.data?.message || "Failed to update status"));
    return { ok: false };
  }
};

export const adminOrderList = (page = 1) => async (dispatch) => {
  try {
    dispatch(orderStart());
    const { data } = await api.get(`/order/admin/all-orders?page=${page}`);
    dispatch(adminOrdersSuccess(data));
  } catch (err) {
    dispatch(orderFail(err.response?.data?.message || "Failed to fetch admin orders"));
  }
};

export const fetchAdminOrderDetails = (id) => async (dispatch) => {
  try {
    dispatch(orderStart());
    const { data } = await api.get(`/order/admin/order/${id}`);
    dispatch(adminOrderDetailsSuccess(data));
    return { ok: true, data };
  } catch (err) {
    dispatch(orderFail(err.response?.data?.message || "Failed to fetch order details"));
    return { ok: false };
  }
};

export const updateTrackingDetails = (id, body) => async (dispatch) => {
  try {
    dispatch(orderStart());
    const { data } = await api.put(`/order/admin/order/${id}/tracking`, body);
    dispatch(orderSuccess({ message: data.message }));
    dispatch(updateAdminOrderState(data.order));
    dispatch(updateTrackingState(data.order.tracking || {}));
    return { ok: true };
  } catch (err) {
    dispatch(
      orderFail(err.response?.data?.message || "Failed to update tracking details")
    );
    return { ok: false };
  }
};

export const adminDeleteOrder = (id) => async (dispatch) => {
  try {
    dispatch(orderStart());
    const { data } = await api.delete(`/order/admin/order/${id}`);
    dispatch(orderSuccess({ message: data.message }));
    dispatch(removeAdminOrder(id));
    return { ok: true };
  } catch (err) {
    dispatch(orderFail(err.response?.data?.message || "Failed to delete order"));
    return { ok: false };
  }
};

const order = createSlice({
  name: "orderData",
  initialState: {
    myOrders: [],
    orderDetails: null,
    adminOrders: [],
    selectedAdminOrder: null,
    selectedUserOrders: [],
    loading: false,
    error: null,
    message: "",
    clientSecret: null,
    paymentIntentId: null,
  },

  reducers: {
    orderStart: (state) => {
      state.loading = true;
      state.error = null;
      state.message = "";
    },

    orderSuccess: (state, action) => {
      state.loading = false;
      state.message = action.payload.message;
    },

    myOrdersSuccess: (state, action) => {
      state.loading = false;
      state.myOrders = action.payload;
    },

    orderDetailsSuccess: (state, action) => {
      state.loading = false;
      state.orderDetails = action.payload;
    },

    syncCustomerOrder: (state, action) => {
      const updated = action.payload;
      state.myOrders = state.myOrders.map((order) =>
        order._id === updated._id ? { ...order, ...updated } : order
      );

      if (state.orderDetails?._id === updated._id) {
        state.orderDetails = {
          ...state.orderDetails,
          ...updated,
        };
      }
    },

    stripeInitSuccess: (state, action) => {
      state.loading = false;
      state.clientSecret = action.payload.clientSecret;
      state.paymentIntentId = action.payload.paymentIntentId;
    },

    adminOrdersSuccess: (state, action) => {
      state.loading = false;
      state.adminOrders = action.payload.orders;
      state.totalAdmin = action.payload.total;
      state.pageAdmin = action.payload.page;
    },

    adminOrderDetailsSuccess: (state, action) => {
      state.loading = false;
      state.selectedAdminOrder = action.payload.order;
      state.selectedUserOrders = action.payload.userOrders || [];
    },

    updateAdminOrderState: (state, action) => {
      const updated = action.payload;
      state.adminOrders = state.adminOrders.map((o) =>
        o._id === updated._id ? { ...o, ...updated } : o
      );

      if (state.selectedAdminOrder?._id === updated._id) {
        state.selectedAdminOrder = {
          ...state.selectedAdminOrder,
          ...updated,
        };
      }
    },

    updateTrackingState: (state, action) => {
      if (!state.selectedAdminOrder) return;
      state.selectedAdminOrder = {
        ...state.selectedAdminOrder,
        tracking: action.payload,
      };
    },

    removeAdminOrder: (state, action) => {
      const id = action.payload;
      state.adminOrders = state.adminOrders.filter((o) => o._id !== id);
      if (state.selectedAdminOrder?._id === id) {
        state.selectedAdminOrder = null;
        state.selectedUserOrders = [];
      }
    },

    clearSelectedAdminOrder: (state) => {
      state.selectedAdminOrder = null;
      state.selectedUserOrders = [];
    },

    orderFail: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },

    resetOrderState: (state) => {
      state.loading = false;
      state.error = null;
      state.message = "";
      state.clientSecret = null;
      state.paymentIntentId = null;
    },
  },
});

export const {
  orderStart,
  orderSuccess,
  myOrdersSuccess,
  orderDetailsSuccess,
  syncCustomerOrder,
  stripeInitSuccess,
  adminOrdersSuccess,
  adminOrderDetailsSuccess,
  updateAdminOrderState,
  updateTrackingState,
  removeAdminOrder,
  clearSelectedAdminOrder,
  orderFail,
  resetOrderState,
} = order.actions;

export default order.reducer;
