import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import auth from "../services/auth";

export default function SignIn() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  /* =========================
     LOCAL LOGIN
  ========================= */
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch("http://localhost:5500/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok) {
        auth.setSession(data);
        navigate("/dashboard");
      } else {
        alert(data.error || "Access Denied.");
      }
    } catch (err) {
      console.error("Login Error:", err);
      alert("Backend unreachable");
    }
  };

  /* =========================
     GOOGLE LOGIN
  ========================= */
  const handleGoogleLogin = () => {
    // Open backend Google OAuth route in system browser
    window.electronAPI.openExternal(
      "http://localhost:5500/auth/google"
    );
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col justify-center items-center px-10">
      <div className="w-full max-w-[420px]">
        <h1 className="text-5xl font-extrabold mb-6">
          WELCOME <span className="text-white/20 italic">BACK.</span>
        </h1>

        <form
          onSubmit={handleSubmit}
          className="space-y-6 bg-white/5 p-8 rounded-3xl"
        >
          <input
            type="email"
            required
            placeholder="name@domain.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-5 py-4 bg-black border border-white/20 rounded-xl"
          />

          <input
            type="password"
            required
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-5 py-4 bg-black border border-white/20 rounded-xl"
          />

          <button className="w-full bg-white text-black py-4 rounded-xl font-bold">
            Establish Connection →
          </button>
        </form>

        {/* Google Login */}
        <button
          onClick={handleGoogleLogin}
          className="w-full mt-4 border border-white/20 py-4 rounded-xl font-semibold hover:bg-white hover:text-black transition"
        >
          Continue with Google
        </button>

        <p className="text-xs text-white/40 mt-6 text-center">
          New Operator?{" "}
          <Link to="/signup" className="text-white hover:underline">
            Initialize Here
          </Link>
        </p>
      </div>
    </div>
  );
}