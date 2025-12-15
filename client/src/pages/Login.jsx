import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { login } from "../redux/slices/authSlice.jsx";
import { Link, useNavigate } from "react-router";

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { user, loading, error } = useSelector((state) => state.auth);

  const [form, setForm] = useState({
    emailOrMobile: "",
    password: "",
  });

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.emailOrMobile || !form.password) return;
    dispatch(login(form));
  };

  useEffect(() => {
    if (user) navigate("/");
  }, [user, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#b40000] relative overflow-hidden">
      {/* Soft background accents */}
      <div className="pointer-events-none absolute inset-0 opacity-30">
        <div className="w-72 h-72 bg-white/30 rounded-full blur-3xl absolute -top-10 -left-10" />
        <div className="w-72 h-72 bg-black/30 rounded-full blur-3xl absolute bottom-0 right-0" />
      </div>

      <div className="relative w-full max-w-xl px-6 py-10 flex flex-col items-center">
        {/* Heading */}
        <div className="mb-8 text-center">
          <p className="text-xs uppercase tracking-[0.25em] text-white/80 mb-2">
            PrintedTeez
          </p>
          <h1 className="text-4xl font-semibold text-white">Login</h1>
          <p className="text-sm text-white/80 mt-2">
            Welcome back! Sign in to continue shopping.
          </p>
        </div>

        {/* Card */}
        <div className="w-full bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl px-6 py-7">
          {/* Error */}
          {error && (
            <p className="text-sm mb-4 text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2 text-center">
              {error}
            </p>
          )}

          <form onSubmit={handleSubmit} className="w-full space-y-5">
            {/* Email / Phone */}
            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-700">
                Email or Phone
              </label>
              <input
                name="emailOrMobile"
                placeholder="Enter your email or phone"
                autoComplete="off"
                value={form.emailOrMobile}
                onChange={handleChange}
                className="w-full p-3 rounded-lg bg-[#e6e6e6] text-red-700 placeholder-red-300 text-sm outline-none focus:ring-2 focus:ring-white/60 focus:border-white"
                required
              />
            </div>

            {/* Password */}
            <div className="space-y-1 relative">
              <label className="text-xs font-medium text-gray-700">
                Password
              </label>
              <input
                name="password"
                type="password"
                autoComplete="off"
                placeholder="Enter your password"
                value={form.password}
                onChange={handleChange}
                className="w-full p-3 rounded-lg bg-[#e6e6e6] text-red-700 placeholder-red-300 text-sm outline-none focus:ring-2 focus:ring-white/60 focus:border-white"
                required
              />

              <span className="absolute right-0 -bottom-5 text-xs text-red-700 cursor-pointer hover:underline">
                Forgot Password
              </span>
            </div>

            {/* Button */}
            <button
              disabled={loading}
              className="mt-9 w-52 mx-auto block bg-white text-red-600 font-semibold py-3 rounded-xl text-lg shadow-md hover:opacity-80 disabled:opacity-70 disabled:cursor-not-allowed transition"
            >
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>
        </div>

        {/* Footer */}
        <p className="text-white mt-6 text-sm">
          Don’t have an account?{" "}
          <Link to="/register" className="underline text-blue-200">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
