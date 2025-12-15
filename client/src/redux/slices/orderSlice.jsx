import { createSlice } from "@reduxjs/toolkit";
import api from "../../api/axios.js";

export const createOrder = (body) => async (dispatch) => {
  try {
    dispatch(orderStart());

    const { data } = await api.post("/order/create-order", body);

    // COD orders
    if (data?.order && body.paymentMethod === "cod") {
      dispatch(orderSuccess({ message: data.message }));
      return;
    }

    // Stripe PaymentIntent
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
    const { data } = await api.post("/order/confirm-order", {
      paymentIntentId,
    });
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
    dispatch(orderDetailsSuccess(data.order));
  } catch {
    dispatch(orderFail("Failed to update address"));
  }
};

export const cancelOrder = (id) => async (dispatch) => {
  try {
    dispatch(orderStart());
    const { data } = await api.put(`/order/cancel-order/${id}`);
    dispatch(orderSuccess({ message: data.message }));
  } catch (err) {
    dispatch(orderFail(err.response?.data?.message || "Cancel failed"));
  }
};

export const updateStatus = (id, status) => async (dispatch) => {
  try {
    dispatch(orderStart());
    const { data } = await api.put(`/order/update-status/${id}`, { status });

    dispatch(orderSuccess({ message: "Order status updated" }));
    dispatch(updateAdminOrderState(data.order));
  } catch {
    dispatch(orderFail("Failed to update status"));
  }
};

export const adminOrderList =
  (page = 1) =>
  async (dispatch) => {
    try {
      dispatch(orderStart());
      const { data } = await api.get(`/order/admin/all-orders?page=${page}`);
      dispatch(adminOrdersSuccess(data));
    } catch {
      dispatch(orderFail("Failed to fetch admin orders"));
    }
  };


export const adminDeleteOrder = (id) => async (dispatch) => {
  try {
    dispatch(orderStart());
    const { data } = await api.delete(`/order/admin/order/${id}`);
    dispatch(orderSuccess({ message: data.message }));
    dispatch(removeAdminOrder(id)); 
  } catch (err) {
    dispatch(
      orderFail(err.response?.data?.message || "Failed to delete order")
    );
  }
};

const order = createSlice({
  name: "orderData",
  initialState: {
    myOrders: [],
    orderDetails: null,
    adminOrders: [],
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

    updateAdminOrderState: (state, action) => {
      const updated = action.payload;
      state.adminOrders = state.adminOrders.map((o) =>
        o._id === updated._id ? updated : o
      );
    },

    removeAdminOrder: (state, action) => {
      const id = action.payload;
      state.adminOrders = state.adminOrders.filter((o) => o._id !== id);
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
  stripeInitSuccess,
  adminOrdersSuccess,
  updateAdminOrderState,
  removeAdminOrder,
  orderFail,
  resetOrderState,
} = order.actions;

export default order.reducer;
