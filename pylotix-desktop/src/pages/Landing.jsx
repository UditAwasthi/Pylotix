import { useNavigate } from "react-router-dom";

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-black text-white flex flex-col justify-between overflow-hidden px-10">
      
      {/* NAV */}
      <nav className="flex justify-between items-center py-8">
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 bg-white rounded-md"></div>
          <span className="font-bold text-sm tracking-tight">
            SkillTracker
          </span>
        </div>

        <div className="flex items-center gap-6">
          <span className="text-[11px] text-white/30 uppercase tracking-widest">
            Version 1.0.4
          </span>

          <button
            onClick={() => navigate("/dashboard")}
            className="bg-white text-black px-6 py-2 rounded-3xl text-xs font-semibold hover:opacity-90 transition"
          >
            Continue
          </button>
        </div>
      </nav>

      {/* MAIN */}
      <main className="flex-1 flex flex-col justify-center">
        <h1 className="text-[clamp(3rem,9vw,9rem)] leading-[0.85] font-extrabold tracking-tight">
          LEARN <br />
          <span className="text-white/20 italic">ANYTHING.</span>
        </h1>

        <p className="max-w-xl mt-10 text-xl font-light text-white/50">
          A streamlined environment designed for pure acquisition.
          Construct your path through any discipline with AI-powered mentorship.
        </p>

        <div className="flex flex-col md:flex-row gap-4 mt-16">
          <div
            onClick={() => navigate("/dashboard")}
            className="bg-white/5 border border-white/10 rounded-3xl p-8 flex-1 cursor-pointer hover:bg-white/10 transition"
          >
            <h2 className="text-2xl font-semibold">
              Prompt your mentor →
            </h2>
          </div>

          <div
            onClick={() => navigate("/dashboard")}
            className="bg-white text-black rounded-3xl p-8 flex-1 cursor-pointer hover:opacity-90 transition"
          >
            <h2 className="text-2xl font-black">
              Start the session →
            </h2>
          </div>
        </div>
      </main>

      {/* FOOTER */}
      <footer className="py-10 flex justify-between items-center text-xs text-white/40">
        <div className="flex gap-10">
          <div>
            <p className="text-[10px] uppercase text-white/20">Logic</p>
            <p>Neural Path Generation</p>
          </div>
          <div>
            <p className="text-[10px] uppercase text-white/20">Engine</p>
            <p>Gemini 1.5 Pro</p>
          </div>
        </div>

        <span className="text-[10px] uppercase text-white/20">
          Obsidian Edition
        </span>
      </footer>
    </div>
  );
}