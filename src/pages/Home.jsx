import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Sun, Moon } from "lucide-react"; // Optional: npm install lucide-react
import { useNavigate } from "react-router-dom"; // Import the hook
export default function Home() {
  const navigate = useNavigate();
  const [pressStart, setPressStart] = useState(false);
  const [systemReady, setSystemReady] = useState(false);
  const [isDark, setIsDark] = useState(true); // Default to Dark for game feel

  useEffect(() => {
    const timer = setTimeout(() => setSystemReady(true), 1000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div
      className={`min-h-screen transition-colors duration-700 font-sans overflow-hidden flex flex-col items-center justify-center selection:bg-blue-500 selection:text-white ${
        isDark ? "bg-[#0A0A0A] text-[#F2F2F2]" : "bg-[#FDFDFD] text-[#1A1A1A]"
      }`}
    >
      {/* THEME TOGGLE BUTTON */}
      <button
        onClick={() => setIsDark(!isDark)}
        className="fixed top-8 right-32 z-[60] p-2 rounded-full border border-current opacity-20 hover:opacity-100 transition-all active:scale-90"
      >
        {isDark ? <Sun size={16} /> : <Moon size={16} />}
      </button>

      {/* BACKGROUND DEPTH: Grid that adapts to theme */}
      <div
        className="fixed inset-0 z-0 pointer-events-none opacity-[0.05]"
        style={{
          backgroundImage: `linear-gradient(${isDark ? "#fff" : "#000"} 1px, transparent 1px), linear-gradient(90deg, ${isDark ? "#fff" : "#000"} 1px, transparent 1px)`,
          backgroundSize: "40px 40px",
        }}
      />

      {/* VIGNETTE: Stronger in dark mode */}
      <div
        className={`fixed inset-0 z-0 pointer-events-none transition-opacity duration-700 ${
          isDark
            ? "shadow-[inset_0_0_200px_rgba(0,0,0,0.8)] opacity-100"
            : "shadow-[inset_0_0_150px_rgba(0,0,0,0.05)] opacity-50"
        }`}
      />

      {/* MAIN CONTENT */}
      <main className="relative z-10 flex flex-col items-center">
        {/* LOGO CONTAINER */}
        <div
          className={`relative mb-12 transition-all duration-1000 transform ${systemReady ? "scale-100 opacity-100" : "scale-90 opacity-0"}`}
        >
          <img
            src="/logo.png"
            alt="Pylotix"
            className={`w-40 h-40 md:w-56 md:h-56 object-contain relative z-10 transition-all duration-700 ${
              isDark
                ? "drop-shadow-[0_0_30px_rgba(59,130,246,0.4)]"
                : "drop-shadow-none"
            }`}
          />

          {/* Circular Scanline Animation */}
          <div
            className={`absolute inset-0 border-[1px] rounded-full animate-ping scale-[1.2] ${
              isDark ? "border-blue-400/30" : "border-blue-500/20"
            }`}
          />

          {/* Dynamic Reflection */}
          <div
            className={`absolute -bottom-8 left-1/2 -translate-x-1/2 w-32 h-4 blur-xl rounded-full transition-colors duration-700 ${
              isDark ? "bg-blue-500/20" : "bg-black/5"
            }`}
          />
        </div>

        {/* TITLE */}
        <div
          className={`text-center space-y-2 transition-all duration-1000 delay-300 ${systemReady ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"}`}
        >
          <h1 className="text-4xl md:text-6xl font-black tracking-[0.25em] uppercase italic">
            PYLOTIX
          </h1>
          <p className="text-[10px] md:text-xs font-bold tracking-[0.8em] uppercase opacity-30">
            The Skill Tracker
          </p>
        </div>

        {/* INTERACTIVE PROMPT */}
        <div
          className={`mt-24 transition-all duration-1000 delay-700 ${systemReady ? "opacity-100" : "opacity-0"}`}
        >
          <Link
            to="/dashboard"
            onMouseEnter={() => setPressStart(true)}
            onMouseLeave={() => setPressStart(false)}
            className="group relative flex flex-col items-center gap-4"
          >
            <div
              className={`w-16 h-16 rounded-full border-2 transition-all duration-300 flex items-center justify-center ${
                pressStart
                  ? "bg-blue-500 border-blue-500 scale-110 shadow-[0_0_20px_rgba(59,130,246,0.5)]"
                  : `bg-transparent ${isDark ? "border-white/10" : "border-black/10"}`
              }`}
            >
              <div
                className={`w-0 h-0 border-t-[6px] border-t-transparent border-l-[10px] border-b-[6px] border-b-transparent ml-1 transition-colors ${
                  pressStart
                    ? "border-l-white"
                    : isDark
                      ? "border-l-white/40"
                      : "border-l-black"
                }`}
              />
            </div>

            <span
              className={`text-[11px] font-black uppercase tracking-[0.5em] transition-all ${
                pressStart
                  ? "text-blue-500 opacity-100"
                  : "opacity-40 animate-pulse"
              }`}
            >
              Press to Start
            </span>
          </Link>
        </div>
      </main>

      {/* CRT SCANLINE EFFECT: Becomes more visible in dark mode */}
      <div
        className={`fixed inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%] transition-opacity duration-700 ${
          isDark ? "opacity-[0.04]" : "opacity-[0.02]"
        }`}
      />
    </div>
  );
}
