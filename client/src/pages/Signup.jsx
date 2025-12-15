import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { signup } from "../redux/slices/authSlice.jsx";
import { Link, useNavigate } from "react-router";

const Signup = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { successMessage, loading, error } = useSelector((state) => state.auth);

  const [form, setForm] = useState({
    name: "",
    email: "",
    mobile: "",
    password: "",
  });

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(signup(form));
  };

  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => navigate("/login"), 1500);
      return () => clearTimeout(timer);
    }
  }, [successMessage, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#b40000] relative overflow-hidden">
      {/* Soft background accents */}
      <div className="pointer-events-none absolute inset-0 opacity-30">
        <div className="w-72 h-72 bg-white/30 rounded-full blur-3xl absolute -top-10 -left-10" />
        <div className="w-72 h-72 bg-black/30 rounded-full blur-3xl absolute bottom-0 right-0" />
      </div>

      <div className="relative w-full max-w-xl px-6 py-10 flex flex-col items-center">
        {/* Header */}
        <div className="mb-8 text-center">
          <p className="text-xs uppercase tracking-[0.25em] text-white/80 mb-2">
            PrintedTeez
          </p>
          <h1 className="text-4xl font-semibold text-white">Sign up</h1>
          <p className="text-sm text-white/80 mt-2">
            Create your account to start shopping.
          </p>
        </div>

        {/* Card */}
        <div className="w-full bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl px-6 py-7">
          {/* Messages */}
          {error && (
            <p className="text-sm mb-3 text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2 text-center">
              {error}
            </p>
          )}
          {successMessage && (
            <p className="text-sm mb-3 text-green-700 bg-green-50 border border-green-200 rounded-lg px-3 py-2 text-center">
              {successMessage}
            </p>
          )}

          <form
            autoComplete="off"
            onSubmit={handleSubmit}
            className="w-full space-y-5"
          >
            {/* Name */}
            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-700">
                Username
              </label>
              <input
                name="name"
                placeholder="Enter your name"
                autoComplete="off"
                value={form.name}
                onChange={handleChange}
                className="w-full p-3 rounded-lg bg-[#e6e6e6] text-red-600 placeholder-red-300 text-sm outline-none focus:ring-2 focus:ring-white/60 focus:border-white"
                required
              />
            </div>

            {/* Email */}
            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-700">
                Email (optional)
              </label>
              <input
                name="email"
                placeholder="Enter your email"
                autoComplete="off"
                value={form.email}
                onChange={handleChange}
                className="w-full p-3 rounded-lg bg-[#e6e6e6] text-red-600 placeholder-red-300 text-sm outline-none focus:ring-2 focus:ring-white/60 focus:border-white"
              />
            </div>

            {/* Phone */}
            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-700">
                Phone (optional)
              </label>
              <input
                name="mobile"
                placeholder="Enter your phone number"
                autoComplete="off"
                value={form.mobile}
                onChange={handleChange}
                className="w-full p-3 rounded-lg bg-[#e6e6e6] text-red-600 placeholder-red-300 text-sm outline-none focus:ring-2 focus:ring-white/60 focus:border-white"
              />
            </div>

            {/* Password */}
            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-700">
                Password
              </label>
              <input
                name="password"
                type="password"
                placeholder="Create a password"
                autoComplete="off"
                value={form.password}
                onChange={handleChange}
                className="w-full p-3 rounded-lg bg-[#e6e6e6] text-red-600 placeholder-red-300 text-sm outline-none focus:ring-2 focus:ring-white/60 focus:border-white"
                required
              />
            </div>

            {/* Submit Button */}
            <button
              disabled={loading}
              className="mt-6 w-52 mx-auto block bg-white text-red-600 font-semibold py-3 rounded-xl text-lg shadow-md hover:opacity-80 disabled:opacity-70 disabled:cursor-not-allowed transition"
            >
              {loading ? "Creating..." : "Sign up"}
            </button>
          </form>
        </div>

        {/* Footer */}
        <p className="text-white mt-6 text-sm">
          Already have an account?{" "}
          <Link to="/login" className="text-blue-200 underline">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;
