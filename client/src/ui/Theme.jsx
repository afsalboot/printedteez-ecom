// src/ui/Theme.jsx
import { useDispatch, useSelector } from "react-redux";
import { setThemeMode, setDarkMode } from "../redux/slices/uiSlice.jsx";
import { Sun, Moon, Monitor, Smartphone, Tablet } from "lucide-react";
import { useEffect } from "react";

const applyDocumentTheme = (isDark) => {
  if (typeof document === "undefined") return;
  document.documentElement.classList.toggle("dark", isDark);
};

const Theme = () => {
  const dispatch = useDispatch();
  const themeMode = useSelector((state) => state.ui.themeMode);

  // Sync theme with system / user preference
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

  // Listen to system theme changes when in "system" mode
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

  const handleChangeMode = (mode) => {
    dispatch(setThemeMode(mode));
  };

  const buttonBase =
    "px-3 py-2 text-xs sm:text-[11px] rounded-full flex items-center justify-center gap-1 transition flex-1 sm:flex-none";

  const isActive = (mode) => themeMode === mode;

  return (
    <div
      className="
        flex w-full sm:inline-flex sm:w-auto
        items-center 
        bg-gray-200 dark:bg-gray-700 
        rounded-full p-1 text-xs shadow-inner
        gap-1
      "
    >
      {/* System (icon changes by breakpoint: mobile / tablet / desktop) */}
      <button
        type="button"
        onClick={() => handleChangeMode("system")}
        className={`${buttonBase} ${
          isActive("system")
            ? "bg-white text-gray-900 dark:bg-gray-900 dark:text-white"
            : "text-gray-600 dark:text-gray-300"
        }`}
      >
        {/* Mobile icon (default < sm) */}
        <Smartphone size={16} className="block sm:hidden" />

        {/* Tablet icon (sm ≤ width < lg) */}
        <Tablet size={16} className="hidden sm:block lg:hidden" />

        {/* Desktop icon (lg and up) */}
        <Monitor size={16} className="hidden lg:block" />

        <span className="hidden sm:inline">System</span>
      </button>

      {/* Light */}
      <button
        type="button"
        onClick={() => handleChangeMode("light")}
        className={`${buttonBase} ${
          isActive("light")
            ? "bg-white text-gray-900 dark:bg-gray-900 dark:text-white"
            : "text-gray-600 dark:text-gray-300"
        }`}
      >
        <Sun size={16} />
        <span className="hidden sm:inline">Light</span>
      </button>

      {/* Dark */}
      <button
        type="button"
        onClick={() => handleChangeMode("dark")}
        className={`${buttonBase} ${
          isActive("dark")
            ? "bg-white text-gray-900 dark:bg-gray-900 dark:text-white"
            : "text-gray-600 dark:text-gray-300"
        }`}
      >
        <Moon size={16} />
        <span className="hidden sm:inline">Dark</span>
      </button>
    </div>
  );
};

export default Theme;
