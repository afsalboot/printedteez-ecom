import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router";
import { clearAuthFeedback, login } from "../redux/slices/authSlice.jsx";

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { user, loading, error } = useSelector((state) => state.auth);

  const [form, setForm] = useState({
    emailOrMobile: "",
    password: "",
  });

  useEffect(() => {
    dispatch(clearAuthFeedback());
  }, [dispatch]);

  useEffect(() => {
    if (user) navigate("/");
  }, [user, navigate]);

  const handleChange = (e) => {
    if (error) dispatch(clearAuthFeedback());
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.emailOrMobile || !form.password) return;
    dispatch(login(form));
  };

  return (
    <div className="min-h-screen bg-[#b40000] relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 opacity-30">
        <div className="w-72 h-72 bg-white/30 rounded-full blur-3xl absolute -top-10 -left-10" />
        <div className="w-72 h-72 bg-black/30 rounded-full blur-3xl absolute bottom-0 right-0" />
      </div>

      <div className="relative min-h-screen max-w-6xl mx-auto px-4 sm:px-6 py-8 md:py-12 flex items-center">
        <div className="w-full grid lg:grid-cols-[1.05fr_0.95fr] gap-8 lg:gap-12 items-center">
          <section className="hidden lg:block text-white">
            <p className="text-xs uppercase tracking-[0.35em] text-white/70 mb-5">
              PrintedTeez
            </p>
            <h1 className="text-5xl xl:text-6xl font-semibold leading-tight">
              Welcome back.
            </h1>
            <p className="mt-5 max-w-md text-white/80 text-base leading-7">
              Sign in to continue shopping, review your cart, and manage your
              orders from one place.
            </p>
          </section>

          <section className="w-full max-w-xl lg:max-w-none mx-auto">
            <div className="text-center lg:hidden mb-6">
              <p className="text-xs uppercase tracking-[0.25em] text-white/80 mb-2">
                PrintedTeez
              </p>
              <h1 className="text-4xl font-semibold text-white">Login</h1>
              <p className="text-sm text-white/80 mt-2">
                Welcome back! Sign in to continue shopping.
              </p>
            </div>

            <div className="w-full bg-white/95 backdrop-blur-sm rounded-[28px] shadow-2xl px-6 sm:px-8 py-7 sm:py-8 border border-white/40">
              <div className="hidden lg:block mb-7">
                <p className="text-xs uppercase tracking-[0.25em] text-red-500/80 mb-2">
                  PrintedTeez
                </p>
                <h2 className="text-4xl font-semibold text-[#7f0000]">Login</h2>
                <p className="text-sm text-gray-500 mt-2">
                  Welcome back! Sign in to continue shopping.
                </p>
              </div>

              {error && (
                <p className="text-sm mb-4 text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-center">
                  {error}
                </p>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Email or Phone
                  </label>
                  <input
                    name="emailOrMobile"
                    placeholder="Enter your email or phone"
                    autoComplete="off"
                    value={form.emailOrMobile}
                    onChange={handleChange}
                    className="w-full h-12 px-4 rounded-xl bg-[#efefef] text-red-700 placeholder-red-300 text-sm outline-none border border-transparent focus:border-red-200 focus:bg-white focus:ring-4 focus:ring-red-100/70 transition"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-3">
                    <label className="text-sm font-medium text-gray-700">
                      Password
                    </label>
                    <span className="text-xs text-red-700 cursor-pointer hover:underline">
                      Forgot Password
                    </span>
                  </div>
                  <input
                    name="password"
                    type="password"
                    autoComplete="off"
                    placeholder="Enter your password"
                    value={form.password}
                    onChange={handleChange}
                    className="w-full h-12 px-4 rounded-xl bg-[#efefef] text-red-700 placeholder-red-300 text-sm outline-none border border-transparent focus:border-red-200 focus:bg-white focus:ring-4 focus:ring-red-100/70 transition"
                    required
                  />
                </div>

                <button
                  disabled={loading}
                  className="mt-2 w-full sm:w-56 mx-auto block bg-white text-red-600 font-semibold py-3 rounded-xl text-lg shadow-md border border-red-100 hover:bg-red-50 disabled:opacity-70 disabled:cursor-not-allowed transition"
                >
                  {loading ? "Logging in..." : "Login"}
                </button>
              </form>

              <p className="text-center text-sm text-gray-600 mt-6">
                Don’t have an account?{" "}
                <Link to="/register" className="underline text-red-600 font-medium">
                  Sign up
                </Link>
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Login;
