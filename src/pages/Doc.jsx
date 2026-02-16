import React from 'react'
import './doc.css'
import { Link } from 'react-router-dom'

export default function Doc(){
  return (
    <div className="antialiased min-h-screen">
      <nav className="fixed top-0 w-full z-50 glass border-b border-white/5 px-8 py-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-4 h-4 bg-white rounded-[4px]" />
          <span className="font-bold text-sm tracking-tight uppercase">SkillTracker <span className="text-white/40 font-normal ml-2">Docs</span></span>
        </div>
        <div className="flex gap-6 items-center">
          <input type="text" placeholder="Search documentation..." className="bg-white/5 border border-white/10 rounded-full px-4 py-1.5 text-xs focus:outline-none focus:border-white/30 transition-all w-64" />
          <Link to="/" className="text-xs font-semibold text-white/50 hover:text-white transition-colors">Home</Link>
        </div>
      </nav>

      <div className="flex pt-20">
        <aside className="w-72 h-[calc(100vh-80px)] sticky top-20 overflow-y-auto px-6 py-10 border-r border-white/5">
          <div className="mb-10">
            <h3 className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em] mb-4">Getting Started</h3>
            <ul className="space-y-1">
              <li><a href="#" className="sidebar-link block py-2 px-4 text-sm text-white/70 hover:text-white">Introduction</a></li>
              <li><a href="#" className="sidebar-link block py-2 px-4 text-sm text-white/70 hover:text-white">Quick Start Guide</a></li>
              <li><a href="#" className="sidebar-link block py-2 px-4 text-sm text-white/70 hover:text-white">The Neural Engine</a></li>
            </ul>
          </div>

          <div className="mb-10">
            <h3 className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em] mb-4">Core Concepts</h3>
            <ul className="space-y-1">
              <li><a href="#" className="sidebar-link block py-2 px-4 text-sm text-white/70 hover:text-white">Skill Trees</a></li>
              <li><a href="#" className="sidebar-link block py-2 px-4 text-sm text-white/70 hover:text-white">Prompt Engineering</a></li>
              <li><a href="#" className="sidebar-link block py-2 px-4 text-sm text-white/70 hover:text-white">Memory Nodes</a></li>
            </ul>
          </div>

          <div>
            <h3 className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em] mb-4">Advanced</h3>
            <ul className="space-y-1">
              <li><a href="#" className="sidebar-link block py-2 px-4 text-sm text-white/70 hover:text-white">API Reference</a></li>
              <li><a href="#" className="sidebar-link block py-2 px-4 text-sm text-white/70 hover:text-white">Custom Mentors</a></li>
            </ul>
          </div>
        </aside>

        <main className="flex-1 px-16 py-12 max-w-5xl animate-content">
          <header className="mb-12">
            <div className="text-blue-400 text-[10px] font-bold uppercase tracking-widest mb-4">Introduction</div>
            <h1 className="text-5xl font-black mb-6 tracking-tighter">The Neural Path</h1>
            <p className="text-xl text-white/50 font-light leading-relaxed">Learn how SkillTracker utilizes Gemini 1.5 Pro to map out your educational journey through high-dimensional vector space.</p>
          </header>

          <section className="space-y-10">
            <div className="glass squircle p-8">
              <h2 className="text-2xl font-bold mb-4">What is SkillTracker?</h2>
              <p className="text-white/60 leading-7 mb-4">SkillTracker isn't just a dashboard; it's a dynamic environment. By using <code>Neural Path Generation</code>, the system analyzes your current knowledge gaps and builds a bridge to your target expertise.</p>
              <div className="bg-black/40 rounded-xl p-4 border border-white/5"><p className="text-sm italic text-white/40 italic">"The shortest path between two skills is a well-prompted mentor."</p></div>
            </div>

            <div className="space-y-4">
              <h2 className="text-2xl font-bold">Initialization</h2>
              <p className="text-white/60 leading-7">To begin a session via the terminal interface, use the following command structure:</p>
              <pre className="p-6 rounded-2xl overflow-x-auto"><span className="text-blue-400">skilltracker</span> init --mentor <span className="text-emerald-400">"Socratic"</span> --depth <span className="text-emerald-400">0.85</span></pre>
            </div>

            <div className="grid grid-cols-2 gap-6 pt-10 border-t border-white/10">
              <a href="#" className="glass p-6 squircle group hover:border-white/20 transition-all">
                <div className="text-[10px] font-bold text-white/20 uppercase mb-2">Previous</div>
                <div className="text-lg font-semibold group-hover:text-blue-400">← Project Setup</div>
              </a>
              <a href="#" className="glass p-6 squircle group text-right hover:border-white/20 transition-all">
                <div className="text-[10px] font-bold text-white/20 uppercase mb-2">Next</div>
                <div className="text-lg font-semibold group-hover:text-blue-400">Quick Start →</div>
              </a>
            </div>
          </section>

          <footer className="mt-24 pb-12 text-white/20 text-[10px] font-bold uppercase tracking-widest flex justify-between">
            <p>© 2024 SkillTracker Labs</p>
            <div className="flex gap-6">
              <a href="#" className="hover:text-white">Github</a>
              <a href="#" className="hover:text-white">Discord</a>
            </div>
          </footer>
        </main>
      </div>

      <div className="fixed -bottom-[10%] -left-[5%] w-[40%] h-[40%] bg-blue-500/[0.03] rounded-full blur-[120px] pointer-events-none" />
    </div>
  )
}