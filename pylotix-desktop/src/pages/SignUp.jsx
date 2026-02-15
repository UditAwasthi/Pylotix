import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

export default function SignUp() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    aiApiKey: "",
  });

  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("http://localhost:5500/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (res.ok) {
        localStorage.setItem("accessToken", data.accessToken);
        localStorage.setItem("user", JSON.stringify(data.user));
        navigate("/");
      } else if (res.status === 409) {
        alert("Identity already exists.");
        navigate("/signin");
      } else {
        alert(data.error || "Initialization failed");
      }
    } catch {
      alert("Backend unreachable");
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-black text-white flex justify-center items-center px-10">
      <div className="w-full max-w-[420px]">
        <h1 className="text-5xl font-extrabold mb-6">
          INITIALIZE <span className="text-white/20 italic">IDENTITY.</span>
        </h1>

        <form onSubmit={handleSubmit} className="space-y-5 bg-white/5 p-8 rounded-3xl">
          <input
            name="name"
            required
            placeholder="Operator Name"
            onChange={handleChange}
            className="w-full px-5 py-4 bg-black border border-white/20 rounded-xl"
          />

          <input
            name="email"
            type="email"
            required
            placeholder="Network Email"
            onChange={handleChange}
            className="w-full px-5 py-4 bg-black border border-white/20 rounded-xl"
          />

          <input
            name="password"
            type="password"
            required
            placeholder="Access Key"
            onChange={handleChange}
            className="w-full px-5 py-4 bg-black border border-white/20 rounded-xl"
          />

          <input
            name="aiApiKey"
            type="password"
            placeholder="Groq API Key (optional)"
            onChange={handleChange}
            className="w-full px-5 py-4 bg-black border border-white/20 rounded-xl"
          />

          <button
            disabled={loading}
            className="w-full bg-white text-black py-4 rounded-xl font-bold"
          >
            {loading ? "INITIALIZING..." : "Establish Identity →"}
          </button>
        </form>

        <p className="text-xs text-white/40 mt-6 text-center">
          Already Registered?{" "}
          <Link to="/signin" className="text-white hover:underline">
            Authorize Access
          </Link>
        </p>
      </div>
    </div>
  );
}