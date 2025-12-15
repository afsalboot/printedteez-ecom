import { createSlice } from "@reduxjs/toolkit";
import api from "../../api/axios.js";

// CREATE FEEDBACK
export const createFeedback = (payload) => async (dispatch) => {
  try {
    dispatch(feedbackStart());
    const { data } = await api.post("/feedback/create-feedback", payload);
    dispatch(addFeedbackSuccess(data));
  } catch (err) {
    dispatch(
      feedbackFail(err.response?.data?.message || "Failed to submit feedback")
    );
  }
};

// LIST FEEDBACK BY PRODUCT
export const listFeedbackByProduct = (productId) => async (dispatch) => {
  try {
    dispatch(feedbackStart());
    const { data } = await api.get(`/feedback/list-feedback/${productId}`);
    dispatch(feedbackSuccess(data));
  } catch (err) {
    dispatch(
      feedbackFail(err.response?.data?.message || "Failed to load feedback")
    );
  }
};

// UPDATE FEEDBACK
export const updateFeedback = (id, payload) => async (dispatch) => {
  try {
    dispatch(feedbackStart());
    const { data } = await api.put(`/feedback/update-feedback/${id}`, payload);
    dispatch(updateFeedbackSuccess(data));
  } catch (err) {
    dispatch(
      feedbackFail(err.response?.data?.message || "Failed to update feedback")
    );
  }
};

// DELETE FEEDBACK
export const deleteFeedback = (id) => async (dispatch) => {
  try {
    dispatch(feedbackStart());
    const { data } = await api.delete(`/feedback/delete-feedback/${id}`);
    dispatch(deleteFeedbackSuccess({ id, message: data.message }));
  } catch (err) {
    dispatch(
      feedbackFail(err.response?.data?.message || "Failed to delete feedback")
    );
  }
};


const feedback = createSlice({
  name: "feedbackData",
  initialState: {
    feedbacks: [],      // list of feedback for a product
    loading: false,
    error: null,
    message: "",
  },

  reducers: {
    feedbackStart: (state) => {
      state.loading = true;
      state.error = null;
      state.message = "";
    },

    feedbackSuccess: (state, action) => {
      state.loading = false;
      state.feedbacks = action.payload; // list feedback by product
    },

    addFeedbackSuccess: (state, action) => {
      state.loading = false;
      state.message = action.payload.message;
      state.feedbacks.unshift(action.payload.feedback);
    },

    updateFeedbackSuccess: (state, action) => {
      state.loading = false;
      state.message = action.payload.message;

      const updated = action.payload.feedback;

      state.feedbacks = state.feedbacks.map((fb) =>
        fb._id === updated._id ? updated : fb
      );
    },

    deleteFeedbackSuccess: (state, action) => {
      state.loading = false;
      state.message = action.payload.message;

      state.feedbacks = state.feedbacks.filter(
        (fb) => fb._id !== action.payload.id
      );
    },

    feedbackFail: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
  },
});

export const {
  feedbackStart,
  feedbackSuccess,
  addFeedbackSuccess,
  updateFeedbackSuccess,
  deleteFeedbackSuccess,
  feedbackFail,
} = feedback.actions;

export default feedback.reducer;
