import { HashRouter, Routes, Route, useNavigate } from "react-router-dom";
import { useEffect } from "react";

import Landing from "./pages/Landing";
import Dashboard from "./pages/Dashboard";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";

function AppRoutes() {
  const navigate = useNavigate();

  useEffect(() => {
    if (!window.electronAPI) return;

    window.electronAPI.onOAuthSuccess((data) => {
      localStorage.setItem("accessToken", data.accessToken);
      localStorage.setItem("refreshToken", data.refreshToken);
      navigate("/dashboard");
    });
  }, [navigate]);

  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/signin" element={<SignIn />} />
      <Route path="/signup" element={<SignUp />} />
    </Routes>
  );
}

export default function App() {
  return (
    <HashRouter>
      <AppRoutes />
    </HashRouter>
  );
}