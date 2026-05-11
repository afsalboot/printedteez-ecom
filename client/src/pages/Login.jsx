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
        <div className="animate-login-float absolute -top-10 -left-10 h-72 w-72 rounded-full bg-white/30 blur-3xl" />
        <div className="animate-login-drift absolute bottom-0 right-0 h-72 w-72 rounded-full bg-black/30 blur-3xl" />
        <div className="animate-login-float absolute left-[12%] top-[22%] h-40 w-40 rounded-full bg-[#ffcfbf]/20 blur-3xl [animation-delay:1.1s]" />
      </div>

      <div className="relative min-h-screen max-w-6xl mx-auto px-4 sm:px-6 py-8 md:py-12 flex items-center">
        <div className="w-full grid lg:grid-cols-[1.05fr_0.95fr] gap-8 lg:gap-12 items-center">
          <section className="hidden lg:block text-white">
            <p className="animate-login-reveal mb-5 text-xs uppercase tracking-[0.35em] text-white/70">
              PrintedTeez
            </p>
            <h1 className="animate-login-reveal-delay-1 text-5xl font-semibold leading-tight xl:text-6xl">
              Welcome back.
            </h1>
            <p className="animate-login-reveal-delay-2 mt-5 max-w-md text-base leading-7 text-white/80">
              Sign in to continue shopping, review your cart, and manage your
              orders from one place.
            </p>
          </section>

          <section className="animate-login-reveal-delay-2 mx-auto w-full max-w-xl lg:max-w-none">
            <div className="mb-6 text-center lg:hidden">
              <p className="animate-login-reveal mb-2 text-xs uppercase tracking-[0.25em] text-white/80">
                PrintedTeez
              </p>
              <h1 className="animate-login-reveal-delay-1 text-4xl font-semibold text-white">Login</h1>
              <p className="animate-login-reveal-delay-2 mt-2 text-sm text-white/80">
                Welcome back! Sign in to continue shopping.
              </p>
            </div>

            <div className="animate-login-reveal-delay-3 w-full rounded-[28px] border border-white/40 bg-white/95 px-6 py-7 shadow-2xl backdrop-blur-sm sm:px-8 sm:py-8">
              <div className="mb-7 hidden lg:block">
                <p className="animate-login-reveal mb-2 text-xs uppercase tracking-[0.25em] text-red-500/80">
                  PrintedTeez
                </p>
                <h2 className="animate-login-reveal-delay-1 text-4xl font-semibold text-[#7f0000]">Login</h2>
                <p className="animate-login-reveal-delay-2 mt-2 text-sm text-gray-500">
                  Welcome back! Sign in to continue shopping.
                </p>
              </div>

              {error && (
                <p className="text-sm mb-4 text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-center">
                  {error}
                </p>
              )}

              <form onSubmit={handleSubmit} autoComplete="off" className="space-y-5">
                <div className="animate-login-reveal-delay-1 space-y-2">
                  <label htmlFor="login-email-or-phone" className="text-sm font-medium text-gray-700">
                    Email or Phone
                  </label>
                  <input
                    id="login-email-or-phone"
                    name="emailOrMobile"
                    placeholder="Enter your email or phone"
                    autoComplete="off"
                    autoCapitalize="none"
                    autoCorrect="off"
                    spellCheck={false}
                    data-lpignore="true"
                    data-1p-ignore="true"
                    value={form.emailOrMobile}
                    onChange={handleChange}
                    className="w-full h-12 px-4 rounded-xl bg-[#efefef] text-red-700 placeholder-red-300 text-sm outline-none border border-transparent focus:border-red-200 focus:bg-white focus:ring-4 focus:ring-red-100/70 transition"
                    required
                  />
                </div>

                <div className="animate-login-reveal-delay-2 space-y-2">
                  <div className="flex items-center justify-between gap-3">
                    <label htmlFor="login-password" className="text-sm font-medium text-gray-700">
                      Password
                    </label>
                    <span className="text-xs text-red-700 cursor-pointer hover:underline">
                      Forgot Password
                    </span>
                  </div>
                  <input
                    id="login-password"
                    name="password"
                    type="password"
                    autoComplete="new-password"
                    autoCapitalize="none"
                    autoCorrect="off"
                    spellCheck={false}
                    data-lpignore="true"
                    data-1p-ignore="true"
                    placeholder="Enter your password"
                    value={form.password}
                    onChange={handleChange}
                    className="w-full h-12 px-4 rounded-xl bg-[#efefef] text-red-700 placeholder-red-300 text-sm outline-none border border-transparent focus:border-red-200 focus:bg-white focus:ring-4 focus:ring-red-100/70 transition"
                    required
                  />
                </div>

                <button
                  disabled={loading}
                  className="animate-login-reveal-delay-3 mx-auto mt-2 block w-full rounded-xl border border-red-100 bg-white py-3 text-lg font-semibold text-red-600 shadow-md transition duration-300 hover:-translate-y-0.5 hover:bg-red-50 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-70 sm:w-56"
                >
                  {loading ? "Logging in..." : "Login"}
                </button>
              </form>

              <p className="animate-login-reveal-delay-3 mt-6 text-center text-sm text-gray-600">
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
