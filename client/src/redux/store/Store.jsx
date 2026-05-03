import { configureStore, combineReducers } from "@reduxjs/toolkit";
import {
  persistStore,
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from "redux-persist";
import storage from "redux-persist/lib/storage";

// Import slices (default exports)
import authData from "../slices/authSlice.jsx";
import adminData from "../slices/adminSlice.jsx";
import cartData from "../slices/cartSlice.jsx";
import wishlistData from "../slices/wishlistSlice.jsx";
import couponData from "../slices/couponSlice.jsx";
import productData from "../slices/productSlice.jsx";
import orderData from "../slices/orderSlice.jsx";
import feedbackData from "../slices/feedbackSlice.jsx";
import userData from "../slices/userSlice.jsx";
import uiData from "../slices/uiSlice.jsx";
import sectionsData from "../slices/sectionSlice.jsx";
import searchData from "../slices/searchSlice.jsx";

// Combine all reducers
const rootReducer = combineReducers({
  auth: authData,
  admin: adminData,
  cart: cartData,
  wishlist: wishlistData,
  coupon: couponData,
  products: productData,
  order: orderData,
  feedback: feedbackData,
  user: userData,
  ui: uiData,
  sections: sectionsData,
  search: searchData,
});

// Persist config
const persistConfig = {
  key: "root",
  version: 1,
  storage,
  whitelist: ["admin", "auth", "cart", "wishlist","sections"],
};

// Persisted reducers
const persistedReducer = persistReducer(persistConfig, rootReducer);

// Store
export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

// Persistor
export const persistor = persistStore(store);
