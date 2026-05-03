import React from "react";
import Theme from "../../ui/Theme";

const Settings = () => {
  return (
    <div className="p-6 bg-gray-100 dark:bg-gray-900 min-h-screen text-gray-900 dark:text-gray-100">
      <div className="max-w-4xl mx-auto">
        
        {/* HEADER */}
        <div className="mb-6">
          <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">
            Admin / Settings
          </p>
          <h1 className="text-2xl font-bold mt-1">Settings</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Customize your admin panel preferences.
          </p>
        </div>

        {/* THEME CARD */}
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow p-6 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">Dark Mode</h2>
            <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
              Toggle dark theme for the admin dashboard.
            </p>
          </div>

          {/* THEME SWITCH */}
          <Theme />
        </div>

      </div>
    </div>
  );
};

export default Settings;
