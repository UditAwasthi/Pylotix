import React, { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import './activity.css'

export default function Activity() {
  const heatmapRef = useRef(null)
  const weeklyRef = useRef(null)
  const [currentStreak, setCurrentStreak] = useState(0)
  const [activeDay, setActiveDay] = useState('---')
  const [monthlyFocus, setMonthlyFocus] = useState('---')
  const [density, setDensity] = useState('0%')
  const [spikeDay, setSpikeDay] = useState('---')

  useEffect(() => {
    function renderHeatmap() {
      const grid = heatmapRef.current
      if (!grid) return
      grid.innerHTML = ''
      for (let i = 0; i < 371; i++) {
        const cell = document.createElement('div')
        cell.className = 'heat-cell'
        const weight = Math.random()
        if (weight > 0.95) cell.classList.add('heat-4')
        else if (weight > 0.8) cell.classList.add('heat-3')
        else if (weight > 0.6) cell.classList.add('heat-1')
        grid.appendChild(cell)
      }
    }

    function calculateStreak() {
      const courses = JSON.parse(localStorage.getItem('allCourses') || '[]')
      const streak = courses.length > 0 ? Math.floor(Math.random() * 5) + 1 : 0
      setCurrentStreak(streak)
    }

    function renderWeeklyPulse() {
      const chart = weeklyRef.current
      if (!chart) return
      const days = [40, 70, 45, 90, 65, 30, 20]
      chart.innerHTML = days.map(val => `<div class="bar" style="height: ${val}%"></div>`).join('')
      const maxVal = Math.max(...days)
      const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
      const bestDay = dayNames[days.indexOf(maxVal)]
      setActiveDay(bestDay)
      setSpikeDay(bestDay)
    }

    function updateInsights() {
      const courses = JSON.parse(localStorage.getItem('allCourses') || '[]')
      const d = Math.min(courses.length * 12, 100)
      setDensity(d + '%')
      const monthNames = ['January','February','March','April','May','June','July','August','September','October','November','December']
      setMonthlyFocus(monthNames[new Date().getMonth()])
    }

    renderHeatmap()
    calculateStreak()
    renderWeeklyPulse()
    updateInsights()
  }, [])

  return (
    <div className="antialiased min-h-screen">
      <nav className="flex justify-between items-center px-10 py-8 relative z-50">
        <div className="flex items-center gap-3">
          <Link to="/dashboard" className="w-5 h-5 bg-white rounded-[5px]" />
          <span className="font-bold text-sm tracking-tight uppercase">SkillTracker</span>
        </div>
        <div className="flex gap-8 text-[10px] font-bold text-white/40 uppercase tracking-widest">
          <Link to="/dashboard" className="hover:text-white">Vectors</Link>
          <Link to="/activity" className="text-white">Activity</Link>
          <Link to="/profile" className="hover:text-white">Profile</Link>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-6 py-12">
        <header className="mb-12">
          <h1 className="text-4xl font-extrabold tracking-tighter mb-2">NEURAL_ACTIVITY_LOG</h1>
          <p className="text-white/40 text-[10px] font-bold uppercase tracking-[0.4em]">Real-time engagement matrix</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="glass squircle p-8 flex justify-between items-center relative overflow-hidden">
            <div>
              <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest mb-1">Current Streak</p>
              <h2 id="currentStreak" className="text-4xl font-extrabold italic">{currentStreak}</h2>
            </div>
          </div>
          <div className="glass squircle p-8">
            <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest mb-1">Most Active Day</p>
            <h2 id="activeDay" className="text-2xl font-bold uppercase">{activeDay}</h2>
          </div>
          <div className="glass squircle p-8">
            <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest mb-1">Monthly Focus</p>
            <h2 id="monthlyFocus" className="text-2xl font-bold uppercase">{monthlyFocus}</h2>
          </div>
        </div>

        <div className="glass squircle p-8 mb-10">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Yearly Contribution Matrix</h3>
            <div className="flex gap-2 items-center text-[10px] text-white/20">
              <span>Less</span>
              <div className="w-2 h-2 heat-cell" />
              <div className="w-2 h-2 heat-cell heat-1" />
              <div className="w-2 h-2 heat-cell heat-3" />
              <div className="w-2 h-2 heat-cell heat-4" />
              <span>More</span>
            </div>
          </div>
          <div id="heatmap" ref={heatmapRef} className="heatmap-grid" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="glass squircle p-8">
            <h3 className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-8">Weekly Productivity Pulse</h3>
            <div id="weeklyChart" ref={weeklyRef} className="bar-container" />
            <div className="flex justify-between mt-4 text-[9px] font-bold text-white/20 uppercase tracking-widest">
              <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
            </div>
          </div>
          <div className="glass squircle p-8">
            <h3 className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-4">Neural Insights</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-white/40">Knowledge Density</span>
                <span id="density" className="text-sm font-bold">{density}</span>
              </div>
              <div className="w-full h-1 bg-white/5 rounded-full">
                <div id="densityBar" className="h-full bg-indigo-500 rounded-full" style={{ width: density }} />
              </div>
              <p className="text-[11px] text-white/20 leading-relaxed mt-4"><span className="text-indigo-400">AI Note:</span> Your activity spikes on <span id="spikeDay" className="text-white">{spikeDay}</span>. Shift heavy modules to this window for maximum retention.</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
