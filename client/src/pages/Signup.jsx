import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router";
import { clearAuthFeedback, signup } from "../redux/slices/authSlice.jsx";

const Signup = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { successMessage, loading, error, requiresVerification, verifyLink } =
    useSelector((state) => state.auth);

  const [form, setForm] = useState({
    name: "",
    email: "",
    mobile: "",
    password: "",
  });

  useEffect(() => {
    dispatch(clearAuthFeedback());
  }, [dispatch]);

  useEffect(() => {
    if (successMessage && !requiresVerification) {
      const timer = setTimeout(() => navigate("/login"), 1200);
      return () => clearTimeout(timer);
    }
  }, [successMessage, requiresVerification, navigate]);

  const handleChange = (e) => {
    if (error || successMessage) dispatch(clearAuthFeedback());
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(signup(form));
  };

  return (
    <div className="min-h-screen bg-[#b40000] relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 opacity-30">
        <div className="w-72 h-72 bg-white/30 rounded-full blur-3xl absolute -top-10 -left-10" />
        <div className="w-72 h-72 bg-black/30 rounded-full blur-3xl absolute bottom-0 right-0" />
      </div>

      <div className="relative min-h-screen max-w-6xl mx-auto px-4 sm:px-6 py-8 md:py-12 flex items-center">
        <div className="w-full grid lg:grid-cols-[0.95fr_1.05fr] gap-8 lg:gap-12 items-center">
          <section className="w-full max-w-xl lg:max-w-none mx-auto order-2 lg:order-1">
            <div className="text-center lg:hidden mb-6">
              <p className="text-xs uppercase tracking-[0.25em] text-white/80 mb-2">
                PrintedTeez
              </p>
              <h1 className="text-4xl font-semibold text-white">Sign up</h1>
              <p className="text-sm text-white/80 mt-2">
                Create your account to start shopping.
              </p>
            </div>

            <div className="w-full bg-white/95 backdrop-blur-sm rounded-[28px] shadow-2xl px-6 sm:px-8 py-7 sm:py-8 border border-white/40">
              <div className="hidden lg:block mb-7">
                <p className="text-xs uppercase tracking-[0.25em] text-red-500/80 mb-2">
                  PrintedTeez
                </p>
                <h2 className="text-4xl font-semibold text-[#7f0000]">
                  Sign up
                </h2>
                <p className="text-sm text-gray-500 mt-2">
                  Create your account to start shopping.
                </p>
              </div>

              {error && (
                <p className="text-sm mb-4 text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-center">
                  {error}
                </p>
              )}

              {successMessage && (
                <div className="text-sm mb-4 text-green-700 bg-green-50 border border-green-200 rounded-xl px-4 py-4 text-center space-y-2">
                  <p>{successMessage}</p>
                  {requiresVerification ? (
                    <>
                      <p className="text-xs text-gray-600">
                        Please check your email and verify your account before
                        logging in.
                      </p>
                      {verifyLink && (
                        <a
                          href={verifyLink}
                          className="inline-block text-red-600 font-semibold underline break-all"
                          target="_blank"
                          rel="noreferrer"
                        >
                          Open verification link
                        </a>
                      )}
                      <Link
                        to="/login"
                        className="inline-block text-red-600 font-semibold underline"
                      >
                        Go to Login
                      </Link>
                    </>
                  ) : (
                    <p className="text-xs text-gray-600">
                      Redirecting to login...
                    </p>
                  )}
                </div>
              )}

              <form
                autoComplete="off"
                onSubmit={handleSubmit}
                className="space-y-5"
              >
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Username
                  </label>
                  <input
                    name="name"
                    placeholder="Enter your name"
                    value={form.name}
                    onChange={handleChange}
                    className="w-full h-12 px-4 rounded-xl bg-[#efefef] text-red-600 placeholder-red-300 text-sm outline-none border border-transparent focus:border-red-200 focus:bg-white focus:ring-4 focus:ring-red-100/70 transition"
                    required
                  />
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">
                      Email
                    </label>
                    <input
                      name="email"
                      placeholder="Enter your email"
                      value={form.email}
                      onChange={handleChange}
                      className="w-full h-12 px-4 rounded-xl bg-[#efefef] text-red-600 placeholder-red-300 text-sm outline-none border border-transparent focus:border-red-200 focus:bg-white focus:ring-4 focus:ring-red-100/70 transition"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">
                      Phone
                    </label>
                    <input
                      name="mobile"
                      placeholder="Enter your phone number"
                      value={form.mobile}
                      onChange={handleChange}
                      className="w-full h-12 px-4 rounded-xl bg-[#efefef] text-red-600 placeholder-red-300 text-sm outline-none border border-transparent focus:border-red-200 focus:bg-white focus:ring-4 focus:ring-red-100/70 transition"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Password
                  </label>
                  <input
                    name="password"
                    type="password"
                    placeholder="Create a password"
                    value={form.password}
                    onChange={handleChange}
                    className="w-full h-12 px-4 rounded-xl bg-[#efefef] text-red-600 placeholder-red-300 text-sm outline-none border border-transparent focus:border-red-200 focus:bg-white focus:ring-4 focus:ring-red-100/70 transition"
                    required
                  />
                </div>

                <button
                  disabled={loading}
                  className="mt-2 w-full sm:w-56 mx-auto block bg-white text-red-600 font-semibold py-3 rounded-xl text-lg shadow-md border border-red-100 hover:bg-red-50 disabled:opacity-70 transition"
                >
                  {loading ? "Creating..." : "Sign up"}
                </button>
              </form>

              <p className="text-center text-sm text-gray-600 mt-6">
                Already have an account?{" "}
                <Link
                  to="/login"
                  className="text-red-600 underline font-medium"
                >
                  Login
                </Link>
              </p>
            </div>
          </section>

          <section className="hidden lg:block text-white order-1 lg:order-2">
            <p className="text-xs uppercase tracking-[0.35em] text-white/70 mb-5">
              PrintedTeez
            </p>
            <h2 className="text-5xl xl:text-6xl font-semibold leading-tight">
              Create your account.
            </h2>
            <p className="mt-5 max-w-md text-white/80 text-base leading-7">
              Join the store to save favorites, track orders, and move through
              checkout faster next time.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Signup;
