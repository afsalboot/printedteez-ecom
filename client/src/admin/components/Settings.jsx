import React from "react";
import Theme from "../../ui/Theme";

const Settings = () => {
  return (
    <div className="min-h-screen bg-gray-100 p-3 text-gray-900 dark:bg-[#111318] dark:text-gray-100 sm:p-5 md:p-6">
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
        <div className="flex flex-col gap-4 rounded-2xl border border-gray-200 bg-white p-4 shadow dark:border-gray-700 dark:bg-gray-800 sm:flex-row sm:items-center sm:justify-between sm:p-6">
          <div>
            <h2 className="text-lg font-semibold">Dark Mode</h2>
            <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
              Toggle dark theme for the admin dashboard.
            </p>
          </div>

          {/* THEME SWITCH */}
          <div className="w-full sm:w-auto">
            <Theme />
          </div>
        </div>

      </div>
    </div>
  );
};

export default Settings;
