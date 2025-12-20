import { useDispatch } from "react-redux";
import { logout } from "../redux/slices/authSlice.jsx";
import { persistor } from "../redux/store/Store.jsx";
import { useNavigate } from "react-router";

const dispatch = useDispatch();
const navigate = useNavigate();

export const handleLogout = async () => {
  // 1️⃣ Clear redux auth state
  dispatch(logout());

  // 2️⃣ SAFELY stop persistence
  await persistor.pause();
  await persistor.flush();

  // 3️⃣ Remove persisted redux data
  localStorage.removeItem("persist:root");

  // 4️⃣ Redirect user
  navigate("/login", { replace: true });
};
