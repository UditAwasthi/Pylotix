import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"; // Import the hook
export default function SignIn() {
  const navigate = useNavigate(); // Initialize the navigator
  const [isDark, setIsDark] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  // --- GOOGLE LOGIN LOGIC ---
  const handleGoogleLogin = () => {
    setIsAuthenticating(true);

    // 1️⃣ Open OAuth in separate popup window
    const authWindow = window.open(
      "http://localhost:5500/auth/google",
      "GoogleLogin",
      "width=500,height=600",
    );

    // 2️⃣ Poll backend for tokens
    const oauthInterval = setInterval(async () => {
      try {
        const res = await fetch("http://localhost:5500/auth/oauth-tokens");

        if (res.ok) {
          const data = await res.json();

          // Save session
          localStorage.setItem("accessToken", data.accessToken);
          localStorage.setItem("refreshToken", data.refreshToken);

          clearInterval(oauthInterval);
          if (authWindow) authWindow.close();

          // Redirect to Dashboard
          navigate("/dashboard");
        }
      } catch (error) {
        console.error("Auth polling failed", error);
      }
    }, 1500);
  };

  const theme = {
    bg: isDark ? "bg-[#0A0A0B]" : "bg-[#FFFFFF]",
    text: isDark ? "text-slate-100" : "text-slate-900",
    subtext: isDark ? "text-slate-400" : "text-slate-500",
    border: isDark ? "border-slate-800" : "border-slate-100",
    panel: isDark ? "bg-slate-900/20" : "bg-slate-50/50",
  };

  return (
    <div
      className={`min-h-screen flex transition-colors duration-700 font-sans ${theme.bg} ${theme.text}`}
    >
      {/* LEFT PANEL: Clean Branding */}
      <div
        className={`hidden lg:flex w-[40%] flex-col justify-between p-20 border-r ${theme.border} ${theme.panel}`}
      >
        <div
          className={`transition-all duration-1000 ${isLoaded ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-10"}`}
        >
          <div className="flex items-center gap-3 mb-16">
            <img
              src="logo.png"
              alt="Pylotix"
              className="w-8 h-8 object-contain"
            />
            <span className="text-xl font-bold tracking-tight">Pylotix</span>
          </div>

          <h1 className="text-6xl font-extrabold leading-[1.1] mb-8 tracking-tight">
            The future of <br />
            <span className="text-blue-600">skill tracking.</span>
          </h1>
          <p className={`text-xl leading-relaxed max-w-md ${theme.subtext}`}>
            A clinical, data-driven approach to mastering your craft. Sign in to
            access your neural map.
          </p>
        </div>

        <div className="text-sm opacity-30 font-semibold tracking-widest uppercase">
          Neural Node v1.0.4
        </div>
      </div>

      {/* RIGHT PANEL: Auth Gateway */}
      <div className="flex-1 flex flex-col justify-center items-center px-8 relative">
        {/* Subtle Theme Toggle */}
        <button
          onClick={() => setIsDark(!isDark)}
          className={`absolute top-10 right-10 p-3 rounded-full border transition-all ${theme.border} hover:bg-blue-600 hover:text-white`}
        >
          {isDark ? "🔆" : "🌙"}
        </button>

        <div
          className={`w-full max-w-sm space-y-12 transition-all duration-1000 delay-300 ${isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}
        >
          {/* Mobile Logo */}
          <div className="lg:hidden flex justify-center mb-4">
            <img src="logo.png" alt="Pylotix" className="w-12 h-12" />
          </div>

          <header className="text-center lg:text-left space-y-3">
            <h2 className="text-4xl font-bold tracking-tight">Welcome</h2>
            <p className={`${theme.subtext} text-lg`}>
              Use your Google account to establish a secure connection.
            </p>
          </header>

          <div className="space-y-6">
            <button
              onClick={handleGoogleLogin}
              disabled={isAuthenticating}
              className={`w-full flex items-center justify-center gap-4 py-4 rounded-2xl border-2 font-bold text-[15px] transition-all shadow-sm active:scale-[0.98] disabled:opacity-50 ${
                isDark
                  ? "bg-white text-black border-transparent hover:bg-slate-200"
                  : "bg-white text-slate-900 border-slate-200 hover:border-slate-900"
              }`}
            >
              {isAuthenticating ? (
                <div className="w-5 h-5 border-2 border-slate-400 border-t-slate-900 rounded-full animate-spin" />
              ) : (
                <svg width="20" height="20" viewBox="0 0 48 48">
                  <path
                    fill="#EA4335"
                    d="M24 9.5c3.3 0 6.3 1.1 8.6 3.2l6.4-6.4C34.8 2.5 29.8 0 24 0 14.6 0 6.6 5.5 2.6 13.6l7.7 6C12.3 13.7 17.7 9.5 24 9.5z"
                  />
                  <path
                    fill="#4285F4"
                    d="M46.1 24.5c0-1.6-.1-3.1-.4-4.5H24v9h12.5c-.5 2.8-2.1 5.2-4.5 6.8l7 5.4c4.1-3.8 6.5-9.4 6.5-16.7z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M10.3 28.4c-.5-1.5-.8-3.1-.8-4.8s.3-3.3.8-4.8l-7.7-6C.9 16.1 0 19 0 23.6s.9 7.5 2.6 10.8l7.7-6z"
                  />
                  <path
                    fill="#34A853"
                    d="M24 48c6.5 0 11.9-2.1 15.9-5.8l-7-5.4c-2 1.3-4.6 2.1-8.9 2.1-6.3 0-11.7-4.2-13.6-10.1l-7.7 6C6.6 42.5 14.6 48 24 48z"
                  />
                </svg>
              )}
              {isAuthenticating ? "Authenticating..." : "Continue with Google"}
            </button>

            <p
              className={`text-center text-xs leading-relaxed ${theme.subtext} px-4`}
            >
              By continuing, you agree to the Pylotix
              <span className="text-blue-600 cursor-pointer mx-1 hover:underline">
                Terms
              </span>
              and
              <span className="text-blue-600 cursor-pointer mx-1 hover:underline">
                Privacy Policy
              </span>
              .
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
