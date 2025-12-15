// src/redux/slices/uiSlice.jsx
import { createSlice } from "@reduxjs/toolkit";

const getInitialThemeMode = () => {
  if (typeof window === "undefined") return "system";

  const stored = localStorage.getItem("themeMode");
  if (stored === "light" || stored === "dark" || stored === "system") {
    return stored;
  }
  return "system";
};

const initialState = {
  themeMode: getInitialThemeMode(), // 'light' | 'dark' | 'system'
  darkMode: false,                  // will be synced in the Theme component
};

const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    setThemeMode(state, action) {
      state.themeMode = action.payload; // 'light' | 'dark' | 'system'
    },
    setDarkMode(state, action) {
      state.darkMode = action.payload;
    },

    // kept for backward compatibility if you used it elsewhere
    toggleDark(state) {
      state.darkMode = !state.darkMode;
      state.themeMode = state.darkMode ? "dark" : "light";
    },
  },
});

export const { setThemeMode, setDarkMode, toggleDark } = uiSlice.actions;
export default uiSlice.reducer;
