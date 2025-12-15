import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchProfile,
  updateProfile,
} from "../redux/slices/userSlice"; // 🔁 adjust path/extension if needed

const UpdateProfile = () => {
  const dispatch = useDispatch();

  // user slice state
  const { profile, loading, error, message } = useSelector(
    (state) => state.user
  );

  // local form state
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
  });
  const [avatarFile, setAvatarFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");

  // fetch profile on mount
  useEffect(() => {
    dispatch(fetchProfile());
  }, [dispatch]);

  // when profile loads, fill form + preview
  useEffect(() => {
    if (profile) {
      setForm({
        name: profile.name || profile.fullName || "",
        email: profile.email || "",
        // your object had: mobile: 9123456781
        phone: profile.mobile?.toString() || profile.phone || "",
      });

      if (profile.profileImageUrl || profile.avatarUrl) {
        setPreviewUrl(profile.profileImageUrl || profile.avatarUrl);
      }
    }
  }, [profile]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setAvatarFile(file);

    // preview selected image
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const fd = new FormData();
    fd.append("name", form.name);
    fd.append("email", form.email);

    // send phone as "mobile" (matches your user object)
    if (form.phone) {
      fd.append("mobile", form.phone);
    }

    // field name must match backend (change if needed)
    if (avatarFile) {
      fd.append("avatar", avatarFile);
      // or fd.append("avatar", avatarFile);
    }

    dispatch(updateProfile(fd));
  };

  if (loading && !profile) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <p className="text-lg font-medium">Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="min-h-[80vh] px-4 py-6 flex justify-center">
      <div className="w-full max-w-xl border rounded-2xl p-6 shadow-sm bg-white/80 dark:bg-neutral-900/80">
        <h1 className="text-2xl font-semibold mb-2">Update Profile</h1>
        <p className="text-sm text-gray-500 mb-4">
          Manage your personal information and profile picture.
        </p>

        {/* Status messages */}
        {error && (
          <p className="mb-3 text-xs text-red-600 bg-red-50 border border-red-100 px-3 py-2 rounded-lg">
            {error}
          </p>
        )}
        {message && (
          <p className="mb-3 text-xs text-green-600 bg-green-50 border border-green-100 px-3 py-2 rounded-lg">
            {message}
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-5 text-sm">
          {/* Avatar */}
          <div>
            <label className="block mb-2 text-xs font-medium text-gray-600">
              Profile Photo
            </label>
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center text-lg font-semibold">
                {previewUrl ? (
                  <img
                    src={previewUrl}
                    alt="Avatar preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  (form.name || form.email || "?")[0]?.toUpperCase()
                )}
              </div>
              <div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="text-xs"
                />
                <p className="text-[11px] text-gray-500 mt-1">
                  JPG, PNG under ~2MB recommended.
                </p>
              </div>
            </div>
          </div>

          {/* Name */}
          <div>
            <label className="block mb-1 text-xs text-gray-500">
              Full Name
            </label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleInputChange}
              className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-1 focus:ring-black/70 dark:bg-neutral-950"
              placeholder="Enter your full name"
            />
          </div>

          {/* Email */}
          <div>
            <label className="block mb-1 text-xs text-gray-500">Email</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleInputChange}
              className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-1 focus:ring-black/70 dark:bg-neutral-950"
              placeholder="Enter your email"
            />
          </div>

          {/* Phone */}
          <div>
            <label className="block mb-1 text-xs text-gray-500">Phone</label>
            <input
              type="text"
              name="phone"
              value={form.phone}
              onChange={handleInputChange}
              className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-1 focus:ring-black/70 dark:bg-neutral-950"
              placeholder="Enter your phone number"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-2 rounded-lg border font-medium hover:bg-gray-100 dark:hover:bg-neutral-800 disabled:opacity-60"
          >
            {loading ? "Saving..." : "Save Changes"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default UpdateProfile;
