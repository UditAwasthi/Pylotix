import React, { useEffect, useState, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  Zap,
  LogOut,
  Search,
  ChevronRight,
  Activity,
  Moon,
  Sun,
} from "lucide-react";
import auth from "./auth.js";
import "./dashboard.css";

export default function Dashboard() {
  const [courses, setCourses] = useState([]);
  const [isDark, setIsDark] = useState(true);
  const [loadingOverlay, setLoadingOverlay] = useState(false);
  const [topic, setTopic] = useState("");
  const navigate = useNavigate();
  const isMounted = useRef(false);

  useEffect(() => {
    init();
  }, []);

  async function init() {
    if (!localStorage.getItem("accessToken")) {
      navigate("/signin");
      return;
    }
    loadCoursesFromCache();
    syncCoursesFromServer();
    isMounted.current = true;
  }

  // --- LOGIC FUNCTIONS (Consistent with your backend) ---
  function loadCoursesFromCache() {
    try {
      const cached = JSON.parse(localStorage.getItem("allCourses") || "[]");
      setCourses(cached);
    } catch {
      setCourses([]);
    }
  }

  async function syncCoursesFromServer() {
    try {
      const existingCourseIds = (courses || [])
        .map((c) => c?.data?._id)
        .filter(Boolean);
      const res = await fetch("http://localhost:5500/content/getAllCourses", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...auth.getHeaders() },
        body: JSON.stringify({ existingCourseIds }),
      });
      if (res.ok) {
        const newCourses = await res.json();
        if (newCourses.length > 0) {
          const formatted = newCourses.map((c) => ({
            topicName: c.title,
            timestamp: new Date(c.createdAt).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            }),
            data: c,
          }));
          const merged = [...formatted, ...courses];
          setCourses(merged);
          localStorage.setItem("allCourses", JSON.stringify(merged));
        }
      }
    } catch (err) {
      console.warn("Delta sync offline");
    }
  }

  const handleInitiate = async () => {
    if (!topic.trim()) return;
    setLoadingOverlay(true);
    try {
      const res = await fetch("http://localhost:5500/content", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...auth.getHeaders() },
        body: JSON.stringify({ topicName: topic }),
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      const entry = { topicName: topic, timestamp: "NOW", data: data.course };
      const updated = [entry, ...courses];
      localStorage.setItem("allCourses", JSON.stringify(updated));
      localStorage.setItem("courseData", JSON.stringify(entry.data));
      navigate("/course");
    } catch (e) {
      alert("Neural link failed.");
    } finally {
      setLoadingOverlay(false);
    }
  };

  const getUserName = () =>
    JSON.parse(localStorage.getItem("user") || "{}").name || "OPERATOR";

  return (
    <div
      className={`min-h-screen transition-colors duration-700 font-sans overflow-x-hidden flex flex-col selection:bg-blue-500 selection:text-white ${
        isDark ? "bg-[#0A0A0A] text-[#F2F2F2]" : "bg-[#FDFDFD] text-[#1A1A1A]"
      }`}
    >
      {/* THEME & LOGOUT TOGGLES */}
      <div className="fixed top-8 right-8 z-[60] flex gap-4">
        <button
          onClick={() => setIsDark(!isDark)}
          className="p-3 rounded-full border border-current opacity-20 hover:opacity-100 transition-all"
        >
          {isDark ? <Sun size={14} /> : <Moon size={14} />}
        </button>
        <button
          onClick={auth.logout}
          className="p-3 rounded-full border border-red-500/50 text-red-500 opacity-40 hover:opacity-100 transition-all"
        >
          <LogOut size={14} />
        </button>
      </div>

      {/* BACKGROUND ELEMENTS (Matching Home.jsx) */}
      <div
        className="fixed inset-0 z-0 pointer-events-none opacity-[0.05]"
        style={{
          backgroundImage: `linear-gradient(${isDark ? "#fff" : "#000"} 1px, transparent 1px), linear-gradient(90deg, ${isDark ? "#fff" : "#000"} 1px, transparent 1px)`,
          backgroundSize: "60px 60px",
        }}
      />
      <div
        className={`fixed inset-0 z-0 pointer-events-none transition-opacity duration-700 ${isDark ? "shadow-[inset_0_0_200px_rgba(0,0,0,0.9)]" : "shadow-[inset_0_0_150px_rgba(0,0,0,0.05)]"}`}
      />

      {/* HEADER / NAVIGATION */}
      <nav className="relative z-10 w-full max-w-7xl mx-auto px-10 py-10 flex justify-between items-center">
        <Link to="/" className="group flex items-center gap-4">
          <div
            className={`w-8 h-8 rounded-sm rotate-45 border-2 transition-all ${isDark ? "border-blue-500 bg-blue-500/20" : "border-black bg-black/5"}`}
          />
          <span className="font-black text-xl tracking-[0.2em] uppercase italic">
            PYLOTIX
          </span>
        </Link>
        <div className="hidden md:flex gap-10 text-[10px] font-black uppercase tracking-[0.3em] opacity-40">
          <span className="text-blue-500 opacity-100 border-b border-blue-500">
            Archives
          </span>
          <span className="hover:opacity-100 cursor-pointer transition-opacity">
            Network
          </span>
          <span className="hover:opacity-100 cursor-pointer transition-opacity">
            Profile
          </span>
        </div>
      </nav>

      {/* MAIN CONTENT */}
      <main className="relative z-10 flex-1 max-w-5xl mx-auto w-full px-10 pt-10 pb-20">
        {/* WELCOME BLOCK */}
        <section className="mb-20">
          <div className="flex items-center gap-4 mb-4 opacity-30">
            <Activity size={14} className="text-blue-500" />
            <span className="text-[10px] font-black uppercase tracking-[0.4em]">
              Neural Link: {getUserName()}
            </span>
          </div>
          <h1 className="text-5xl md:text-7xl font-black tracking-tighter uppercase italic leading-[0.9]">
            COMMAND <br />
            <span className="opacity-10">CENTER.</span>
          </h1>

          {/* INITIATE BOX */}
          <div className="mt-12 group relative">
            <div
              className={`absolute -inset-1 rounded-2xl blur-md transition-opacity duration-500 opacity-0 group-focus-within:opacity-100 ${isDark ? "bg-blue-500/20" : "bg-black/5"}`}
            />
            <div
              className={`relative flex flex-col md:flex-row gap-2 p-2 rounded-2xl border transition-all ${isDark ? "bg-black border-white/10 group-focus-within:border-blue-500/50" : "bg-white border-black/10"}`}
            >
              <input
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="Domain to acquire..."
                className="flex-1 bg-transparent px-6 py-4 outline-none text-lg font-bold placeholder:opacity-10"
              />
              <button
                onClick={handleInitiate}
                className="bg-blue-500 text-white px-10 py-4 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-blue-600 transition-all active:scale-95"
              >
                Initiate
              </button>
            </div>
          </div>
        </section>

        {/* VECTORS LIST */}
        <section>
          <div className="flex items-center gap-6 mb-10">
            <h2 className="text-[11px] font-black uppercase tracking-[0.6em] opacity-20">
              Active_Archives
            </h2>
            <div className="h-px flex-1 bg-current opacity-5" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {courses.length === 0 ? (
              <div className="col-span-full py-20 border-2 border-dashed border-current opacity-5 rounded-3xl flex items-center justify-center">
                <span className="text-[10px] font-black uppercase tracking-widest">
                  No Vectors Found
                </span>
              </div>
            ) : (
              courses.map((course, idx) => (
                <div
                  key={idx}
                  onClick={() => navigate("/course")}
                  className={`group relative p-8 rounded-2xl border transition-all cursor-pointer overflow-hidden ${
                    isDark
                      ? "bg-white/[0.02] border-white/5 hover:border-blue-500/50"
                      : "bg-black/[0.02] border-black/5 hover:border-black/20"
                  }`}
                >
                  <div className="relative z-10 flex justify-between items-start mb-12">
                    <div
                      className={`p-3 rounded-lg ${isDark ? "bg-blue-500/10 text-blue-500" : "bg-black text-white"}`}
                    >
                      <Zap size={18} />
                    </div>
                    <span className="text-[9px] font-bold opacity-30 uppercase tracking-widest">
                      {course.timestamp}
                    </span>
                  </div>

                  <h3 className="relative z-10 text-2xl font-black uppercase italic tracking-tight group-hover:text-blue-500 transition-colors">
                    {course.topicName}
                  </h3>

                  <div className="relative z-10 flex items-center justify-between mt-6">
                    <span className="text-[10px] font-black uppercase opacity-20 tracking-widest">
                      {course.data?.chapters?.length || 0} Modules
                    </span>
                    <ChevronRight
                      size={16}
                      className="opacity-0 group-hover:opacity-100 translate-x-[-10px] group-hover:translate-x-0 transition-all text-blue-500"
                    />
                  </div>

                  {/* Subtle hover glow */}
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/0 to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              ))
            )}
          </div>
        </section>
      </main>

      {/* LOADING OVERLAY */}
      {loadingOverlay && (
        <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-md flex flex-col items-center justify-center">
          <div className="w-20 h-20 border-2 border-blue-500/20 border-t-blue-500 rounded-full animate-spin mb-8" />
          <span className="text-[10px] font-black uppercase tracking-[0.8em] text-blue-500 animate-pulse">
            Synthesizing
          </span>
        </div>
      )}

      {/* CRT SCANLINE EFFECT (Matching Home.jsx) */}
      <div
        className={`fixed inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%] transition-opacity duration-700 ${
          isDark ? "opacity-[0.04]" : "opacity-[0.02]"
        }`}
      />
    </div>
  );
}
