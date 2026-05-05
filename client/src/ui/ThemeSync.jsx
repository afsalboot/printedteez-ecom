import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setDarkMode } from "../redux/slices/uiSlice.jsx";

const applyDocumentTheme = (isDark) => {
  if (typeof document === "undefined") return;
  document.documentElement.classList.toggle("dark", isDark);
};

const ThemeSync = () => {
  const dispatch = useDispatch();
  const themeMode = useSelector((state) => state.ui.themeMode);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const systemPrefersDark =
      window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches;

    const effectiveDark =
      themeMode === "dark" ||
      (themeMode === "system" && systemPrefersDark);

    dispatch(setDarkMode(effectiveDark));
    applyDocumentTheme(effectiveDark);
    localStorage.setItem("themeMode", themeMode);
  }, [themeMode, dispatch]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (themeMode !== "system") return;

    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = (e) => {
      const isDark = e.matches;
      dispatch(setDarkMode(isDark));
      applyDocumentTheme(isDark);
    };

    media.addEventListener("change", handleChange);
    return () => media.removeEventListener("change", handleChange);
  }, [themeMode, dispatch]);

  return null;
};

export default ThemeSync;
