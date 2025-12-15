import { createSlice } from "@reduxjs/toolkit";
import api from "../../api/axios.js";

/* FETCH ALL PRODUCTS */
export const fetchProducts =
  (params = {}) =>
  async (dispatch) => {
    try {
      dispatch(productStart());

      const query = new URLSearchParams(params).toString();
      const { data } = await api.get(`/product/all-products?${query}`);

      dispatch(productListSuccess(data));
    } catch (err) {
      dispatch(productFail(err.response?.data?.message || "Failed to load products"));
    }
  };

/* SINGLE PRODUCT */
export const fetchProductById = (id) => async (dispatch) => {
  try {
    dispatch(productStart());
    const { data } = await api.get(`/product/get-product/${id}`);
    dispatch(productDetailsSuccess(data.product || data));
  } catch (err) {
    dispatch(productFail(err.response?.data?.message || "Failed to load product"));
  }
};

/* CREATE PRODUCT */
export const createProduct = (formData) => async (dispatch) => {
  try {
    dispatch(productStart());
    const { data } = await api.post("/product/create-product", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    dispatch(productCreated(data));
  } catch (err) {
    dispatch(productFail(err.response?.data?.message || "Failed to create product"));
  }
};

/* UPDATE PRODUCT */
export const updateProduct = (id, formData) => async (dispatch) => {
  try {
    dispatch(productStart());
    const { data } = await api.put(`/product/update-product/${id}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    dispatch(productUpdated(data.product));
  } catch (err) {
    dispatch(productFail(err.response?.data?.message || "Failed to update product"));
  }
};

/* DELETE PRODUCT */
export const deleteProduct = (id) => async (dispatch) => {
  try {
    dispatch(productStart());
    await api.delete(`/product/delete-product/${id}`);
    dispatch(productDeleted(id));
  } catch (err) {
    dispatch(productFail(err.response?.data?.message || "Failed to delete product"));
  }
};

/* FEATURED TOGGLE */
export const toggleFeatured = (id) => async (dispatch) => {
  try {
    dispatch(productStart());
    const { data } = await api.patch(`/product/toggle-featured/${id}`);
    dispatch(toggleFeaturedSuccess(data));
  } catch (err) {
    dispatch(productFail(err.response?.data?.message || "Failed to toggle featured"));
  }
};

/* SKU SUGGEST */
export const suggestSKU = (title) => async () => {
  try {
    const { data } = await api.get(`/product/sku-suggest?title=${encodeURIComponent(title)}`);
    return data.suggestedSKU;
  } catch (err) {
    console.error("SKU Suggest Error:", err);
    return null;
  }
};

/* CATEGORIES */
export const fetchCategories = () => async (dispatch) => {
  try {
    dispatch(productStart());
    const { data } = await api.get("/product/categories");
    dispatch(categoryListSuccess(data));
  } catch (err) {
    dispatch(productFail(err.response?.data?.message || "Failed to load categories"));
  }
};

/* HOME SECTIONS */
export const fetchFeaturedProducts = () => async (dispatch) => {
  try {
    dispatch(productStart());
    const { data } = await api.get("/product/all-products?featured=true&limit=10");
    dispatch(setFeaturedProducts(data.products));
  } catch {
    dispatch(productFail("Failed to load featured products"));
  }
};

export const fetchNewArrivals = () => async (dispatch) => {
  try {
    dispatch(productStart());
    const { data } = await api.get("/product/all-products?sort=new&limit=10");
    dispatch(setNewArrivals(data.products));
  } catch {
    dispatch(productFail("Failed to load new arrivals"));
  }
};

export const fetchBestSellers = () => async (dispatch) => {
  try {
    dispatch(productStart());
    const { data } = await api.get("/product/all-products?sort=salesCount&limit=10");
    dispatch(setBestSellers(data.products));
  } catch {
    dispatch(productFail("Failed to load best sellers"));
  }
};

export const fetchTrendingProducts = () => async (dispatch) => {
  try {
    dispatch(productStart());
    const { data } = await api.get("/product/all-products?sort=views&limit=10");
    dispatch(setTrendingProducts(data.products));
  } catch {
    dispatch(productFail("Failed to load trending products"));
  }
};

export const fetchFlashSaleProducts = () => async (dispatch) => {
  try {
    dispatch(productStart());
    const { data } = await api.get("/product/all-products?flashSale=true&limit=10");
    dispatch(setFlashSaleProducts(data.products));
  } catch {
    dispatch(productFail("Failed to load flash sale products"));
  }
};

export const fetchLimitedEditionProducts = () => async (dispatch) => {
  try {
    dispatch(productStart());
    const { data } = await api.get("/product/all-products?limitedEdition=true&limit=10");
    dispatch(setLimitedEditionProducts(data.products));
  } catch {
    dispatch(productFail("Failed to load limited edition products"));
  }
};

export const fetchRecommendedProducts = () => async (dispatch) => {
  try {
    dispatch(productStart());
    const { data } = await api.get("/product/recommended");
    dispatch(setRecommendedProducts(data.products));
  } catch {
    dispatch(productFail("Failed to load recommendations"));
  }
};

/* -------------------- DEALS -------------------- */
export const fetchDeals = () => async (dispatch) => {
  try {
    const { data } = await api.get("/coupon/active-offers");
    dispatch(setDeals(data.offers));
  } catch {}
};


/* -------------------- SLICE -------------------- */
const products = createSlice({
  name: "productData",
  initialState: {
    products: [],
    product: null,
    categories: [],
    featuredProducts: [],
    trendingProducts: [],
    newArrivals: [],
    bestSellers: [],
    flashSaleProducts: [],
    limitedEditionProducts: [],
    recommendedProducts: [],
    deals: [],
    total: 0,
    totalPages: 0,
    page: 1,
    loading: false,
    error: null,
    message: "",
  },

  reducers: {
    productStart: (state) => {
      state.loading = true;
      state.error = null;
      state.message = "";
    },

    productListSuccess: (state, action) => {
      state.loading = false;
      state.products = action.payload.products || [];
      state.total = action.payload.total || 0;
      state.totalPages = action.payload.totalPages || 1;
      state.page = action.payload.page || 1;
    },

    productDetailsSuccess: (state, action) => {
      state.loading = false;
      state.product = action.payload;
    },

    productCreated: (state, action) => {
      state.loading = false;
      state.message = action.payload.message;

      const product = action.payload.product;
      if (product && state.page === 1) {
        state.products = [product, ...state.products];
      }
    },

    productUpdated: (state, action) => {
      state.loading = false;
      state.message = "Product updated successfully";

      const updated = action.payload;
      state.products = state.products.map((p) =>
        p._id === updated._id ? updated : p
      );

      if (state.product?._id === updated._id) {
        state.product = updated;
      }
    },

    productDeleted: (state, action) => {
      state.loading = false;
      state.message = "Product deleted successfully";
      state.products = state.products.filter((p) => p._id !== action.payload);

      if (state.product?._id === action.payload) {
        state.product = null;
      }
    },

    toggleFeaturedSuccess: (state, action) => {
      state.loading = false;
      const updated = action.payload.product;
      state.message = action.payload.message;

      state.products = state.products.map((p) =>
        p._id === updated._id ? updated : p
      );

      if (state.product?._id === updated._id) {
        state.product = updated;
      }
    },

    productFail: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },

    categoryListSuccess: (state, action) => {
      state.loading = false;
      state.categories = action.payload || [];
    },

    setFeaturedProducts: (state, action) => {
      state.featuredProducts = action.payload;
    },

    setTrendingProducts: (state, action) => {
      state.trendingProducts = action.payload;
    },

    setNewArrivals: (state, action) => {
      state.newArrivals = action.payload;
    },

    setBestSellers: (state, action) => {
      state.bestSellers = action.payload;
    },

    setFlashSaleProducts: (state, action) => {
      state.flashSaleProducts = action.payload;
    },

    setLimitedEditionProducts: (state, action) => {
      state.limitedEditionProducts = action.payload;
    },

    setRecommendedProducts: (state, action) => {
      state.recommendedProducts = action.payload;
    },

    setDeals: (state, action) => {
      state.deals = action.payload;
    },
  },
});

export const {
  productStart,
  productListSuccess,
  productDetailsSuccess,
  productCreated,
  productUpdated,
  productDeleted,
  toggleFeaturedSuccess,
  productFail,
  categoryListSuccess,
  setFeaturedProducts,
  setTrendingProducts,
  setNewArrivals,
  setBestSellers,
  setFlashSaleProducts,
  setLimitedEditionProducts,
  setRecommendedProducts,
  setDeals,
} = products.actions;

export default products.reducer;
