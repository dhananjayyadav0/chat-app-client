import React from "react";
import { useSelector } from "react-redux";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  Outlet,
  useLocation,
} from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Auth from "./global/auth/authController.jsx";
import ChatComponent from "./components/discussion/ChatComponent.jsx";

// Protected Route Wrapper (All Routes Are Protected Except Login)
const ProtectedRoute = () => {
  const user = useSelector((state) => state.user);
  const location = useLocation();
  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }
  return <Outlet />;
};

function App() {
  return (
    <>
      <BrowserRouter>
        <ToastContainer />
        <Routes>
          {/* Public route: Login page only */}
          <Route path="/login" element={<Auth />} />
          {/* All other routes are protected */}
          <Route element={<ProtectedRoute />}>
            <Route path="/discussion" element={<ChatComponent />} />
          </Route>

          {/* Redirect all unknown routes to login */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
