import React, { useEffect } from 'react'
import auth from './auth.js'
import './profile.css'

export default function Profile() {
  useEffect(() => {
    loadFromCache()
    init()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function init() {
    try {
      const [profileSnapshot, heatmapSnapshot] = await Promise.all([
        fetchProfile(),
        fetchHeatmap(),
      ])

      localStorage.setItem('user_profile', JSON.stringify(profileSnapshot))
      localStorage.setItem('learning_heatmap', JSON.stringify(heatmapSnapshot.dailyActivity))

      renderProfile(profileSnapshot, heatmapSnapshot.dailyActivity)
    } catch (err) {
      // silently fallback to cache
      const cached = localStorage.getItem('user_profile')
      if (cached) renderProfile(JSON.parse(cached), JSON.parse(localStorage.getItem('learning_heatmap') || '{}'))
      console.error('Profile sync failed', err)
    }
  }

  function loadFromCache() {
    const cachedProfile = localStorage.getItem('user_profile')
    const cachedHeatmap = localStorage.getItem('learning_heatmap')
    if (cachedProfile) renderProfile(JSON.parse(cachedProfile), JSON.parse(cachedHeatmap || '{}'))
  }

  async function fetchProfile() {
    const res = await auth.authFetch('http://localhost:5500/profile/profile', { method: 'GET' })
    if (!res.ok) throw new Error('API Connection Failed')
    return res.json()
  }

  async function fetchHeatmap() {
    const res = await auth.authFetch('http://localhost:5500/learning-time/heatmap', { method: 'GET' })
    if (!res.ok) throw new Error('Heatmap fetch failed')
    return res.json()
  }

  function renderProfile(profileSnapshot = {}, heatmap = {}) {
    try {
      const { user = {}, stats = {}, courses = [] } = profileSnapshot

      const nameEl = document.getElementById('profileName')
      const emailEl = document.getElementById('profileEmail')
      const avatarEl = document.getElementById('navAvatar')
      const syncTimeEl = document.getElementById('syncTime')

      if (nameEl) nameEl.innerText = user.name || 'Accessing...'
      if (emailEl) emailEl.innerText = user.email || ''
      if (avatarEl) avatarEl.src = user.avatar || 'https://loremfaces.net/128/id/1.jpg'
      if (syncTimeEl) syncTimeEl.innerText = new Date().toLocaleTimeString()

      const sec = stats.totalLearningTime || 0
      const timeStr = `${Math.floor(sec / 3600)}h ${Math.floor((sec % 3600) / 60)}m`
      const courseCountStr = String(courses.length).padStart(2, '0')

      const totalAcc = courses.reduce((a, c) => a + calculateAccuracy(c.topicProgress), 0)
      const avgAcc = courses.length ? Math.round(totalAcc / courses.length) : 0

      document.getElementById('totalTime') && (document.getElementById('totalTime').innerText = timeStr)
      document.getElementById('totalTimeLarge') && (document.getElementById('totalTimeLarge').innerText = timeStr)
      document.getElementById('courseCount') && (document.getElementById('courseCount').innerText = courseCountStr)
      document.getElementById('courseCountLarge') && (document.getElementById('courseCountLarge').innerText = courseCountStr)
      document.getElementById('avgAccuracyLarge') && (document.getElementById('avgAccuracyLarge').innerText = `${avgAcc}%`)

      updateGauge('streakRing', 'streakVal', stats.streak || 0, 30, false)
      updateGauge('masteryRing', 'masteryPercent', avgAcc, 100, true)

      renderFullHeatmap(heatmap)
      renderTopicCloud(courses)
      renderVelocityChart()
      renderRadarChart(courses)
      renderCourses(courses)
    } catch (e) {
      console.error('renderProfile error', e)
    }
  }

  function updateGauge(ringId, textId, val, max, isPct) {
    const ring = document.getElementById(ringId)
    const txt = document.getElementById(textId)
    if (!ring || !txt) return
    const circ = 2 * Math.PI * 45
    const pct = Math.min((val / (max || 1)) * 100, 100)
    ring.style.strokeDashoffset = circ - (pct / 100) * circ
    txt.innerText = isPct ? `${val}%` : val
  }

  function renderVelocityChart() {
    const ctx = document.getElementById('weeklyChart')
    if (!ctx || !window.Chart) return
    if (window.vChart) window.vChart.destroy()
    window.vChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        datasets: [
          {
            label: 'Study Time',
            data: [30, 45, 12, 80, 50, 20, 40],
            borderColor: '#000',
            backgroundColor: 'rgba(0,0,0,0.05)',
            fill: true,
            tension: 0.4,
            borderWidth: 3,
            pointRadius: 0,
          },
        ],
      },
      options: { plugins: { legend: { display: false } }, scales: { y: { display: false }, x: { grid: { display: false } } }, maintainAspectRatio: false },
    })
  }

  function renderRadarChart(courses) {
    const ctx = document.getElementById('skillRadar')
    if (!ctx || !window.Chart) return
    if (window.rChart) window.rChart.destroy()
    window.rChart = new Chart(ctx, {
      type: 'radar',
      data: { labels: ['Speed', 'Accuracy', 'Logic', 'Recall', 'Volume'], datasets: [{ data: [80, 90, 70, 60, 85], backgroundColor: 'rgba(0,0,0,0.1)', borderColor: '#000', borderWidth: 2 }] },
      options: { plugins: { legend: { display: false } }, scales: { r: { ticks: { display: false }, grid: { color: '#eee' } } }, maintainAspectRatio: false },
    })
  }

  function renderCourses(courses) {
    const container = document.getElementById('courseList')
    if (!container) return
    container.innerHTML = courses
      .map((c) => {
        const acc = calculateAccuracy(c.topicProgress)
        return `
        <div class="widget p-6 mb-4">
          <div class="flex justify-between items-center mb-4">
            <span class="text-[9px] font-black bg-black text-white px-2 py-1 rounded uppercase tracking-widest">
              ${c.completed ? 'Certified' : 'Ch. ' + (c.progress?.chapterIndex + 1)}
            </span>
            <span class="text-[10px] font-bold text-gray-400 uppercase">
              ${new Date(c.lastAccessedAt).toLocaleDateString()}
            </span>
          </div>
          <h3 class="text-lg font-bold mb-6">${c.title}</h3>
          <div class="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden mb-2">
            <div class="h-full bg-black transition-all duration-1000" style="width: ${acc}%"></div>
          </div>
          <div class="flex justify-between text-[10px] font-black uppercase">
            <span>Mastery Level</span>
            <span>${acc}%</span>
          </div>
        </div>`
      })
      .join('')
  }

  function calculateAccuracy(tp = {}) {
    let c = 0,
      a = 0
    Object.values(tp || {}).forEach((x) => {
      c += x.correctCount || 0
      a += x.attemptedCount || 0
    })
    return a ? Math.round((c / a) * 100) : 0
  }

  function renderFullHeatmap(data = {}) {
    const container = document.getElementById('fullHeatmap')
    if (!container) return
    container.innerHTML = ''

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const startDate = new Date(today)
    startDate.setDate(startDate.getDate() - 364)

    const values = Object.values(data)
    const max = Math.max(...values, 1)

    for (let i = 0; i < 365; i++) {
      const d = new Date(startDate)
      d.setDate(startDate.getDate() + i)

      const key = d.toISOString().slice(0, 10)
      const val = data[key] || 0

      const cell = document.createElement('div')
      cell.className = 'w-3 h-3 rounded-sm transition-all duration-500 ease-out'

      let color = '#f3f4f6'
      if (val > 0.75 * max) color = '#000000'
      else if (val > 0.5 * max) color = '#4b5563'
      else if (val > 0.25 * max) color = '#9ca3af'

      cell.style.backgroundColor = color
      cell.dataset.date = key
      cell.dataset.value = val
      container.appendChild(cell)
    }
  }

  function attachHeatmapTooltips(container) {
    let tooltip
    container.addEventListener('mouseover', (e) => {
      const cell = e.target
      if (!cell.dataset.date) return

      tooltip = document.createElement('div')
      tooltip.className = 'fixed z-50 px-3 py-1 text-[10px] font-bold bg-black text-white rounded shadow-lg pointer-events-none transition-opacity'
      tooltip.innerText = `${cell.dataset.value} min on ${cell.dataset.date}`
      document.body.appendChild(tooltip)
      moveTooltip(e)
    })

    container.addEventListener('mousemove', moveTooltip)
    container.addEventListener('mouseout', () => { if (tooltip) tooltip.remove(); tooltip = null })

    function moveTooltip(e) {
      if (!tooltip) return
      tooltip.style.left = e.clientX + 12 + 'px'
      tooltip.style.top = e.clientY + 12 + 'px'
    }
  }

  // expose logout button
  window.logout = () => auth.logout()

  return (
    <div className="bento-grid px-6 py-8">
      <div className="widget col-span-12 lg:col-span-6 flex items-center gap-8">
        <div className="relative">
          <div className="w-24 h-24 rounded-[32px] overflow-hidden border-4 border-white shadow-xl">
            <img id="navAvatar" src="" alt="User" className="w-full h-full object-cover" />
          </div>
          <div className="absolute -bottom-2 -right-2 bg-green-500 w-6 h-6 rounded-full border-4 border-white"></div>
        </div>
        <div className="flex-1 min-w-0">
          <p className="label-caps">Active Session</p>
          <h1 id="profileName" className="text-4xl font-black tracking-tighter truncate">--</h1>
          <p id="profileEmail" className="text-gray-400 font-medium truncate">--</p>
        </div>
      </div>

      <div className="widget col-span-6 lg:col-span-3 flex flex-col items-center justify-center">
        <span className="label-caps">Consistency</span>
        <div className="ring-container">
          <svg viewBox="0 0 100 100" className="w-full h-full">
            <circle cx="50" cy="50" r="45" stroke="#eee" strokeWidth="8" fill="none" />
            <circle id="streakRing" cx="50" cy="50" r="45" stroke="var(--streak)" strokeWidth="8" fill="none" strokeDasharray="282.7" strokeDashoffset="282.7" strokeLinecap="round" className="progress-ring-circle" />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span id="streakVal" className="text-2xl font-black">0</span>
            <span className="text-[8px] font-bold text-gray-400">STREAK</span>
          </div>
        </div>
      </div>

      <div className="widget col-span-6 lg:col-span-3 flex flex-col items-center justify-center">
        <span className="label-caps">Avg. Mastery</span>
        <div className="ring-container">
          <svg viewBox="0 0 100 100" className="w-full h-full">
            <circle cx="50" cy="50" r="45" stroke="#eee" strokeWidth="8" fill="none" />
            <circle id="masteryRing" cx="50" cy="50" r="45" stroke="var(--mastery)" strokeWidth="8" fill="none" strokeDasharray="282.7" strokeDashoffset="282.7" strokeLinecap="round" className="progress-ring-circle" />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span id="masteryPercent" className="text-2xl font-black">0%</span>
          </div>
        </div>
      </div>

      <div className="widget col-span-12 flex flex-col justify-center py-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 px-4">
          <div>
            <p className="label-caps">Total Time</p>
            <p id="totalTimeLarge" className="text-4xl font-black tracking-tighter">0h 0m</p>
            <p id="totalTime" className="hidden">0h 0m</p>
          </div>
          <div>
            <p className="label-caps">Curriculums</p>
            <p id="courseCountLarge" className="text-4xl font-black tracking-tighter">00</p>
            <p id="courseCount" className="hidden">00</p>
          </div>
          <div>
            <p className="label-caps">Avg. Accuracy</p>
            <p id="avgAccuracyLarge" className="text-4xl font-black tracking-tighter">0%</p>
          </div>
          <div>
            <p className="label-caps">DB Status</p>
            <div className="flex items-baseline gap-2">
              <p className="text-4xl font-black tracking-tighter text-green-500">LIVE</p>
              <span className="text-[10px] font-bold text-gray-400">V.22</span>
            </div>
          </div>
        </div>
      </div>

      <div className="widget col-span-12 lg:col-span-8">
        <span className="label-caps">Learning Velocity (7-Day Trend)</span>
        <div className="h-64 mt-4">
          <canvas id="weeklyChart" />
        </div>
      </div>

      <div className="widget col-span-12 lg:col-span-4">
        <span className="label-caps">Skill Balance (Radar)</span>
        <div className="h-64 mt-4">
          <canvas id="skillRadar" />
        </div>
      </div>

      <div className="widget col-span-12">
        <div className="flex justify-between items-center mb-6">
          <div>
            <span className="label-caps">Activity Architecture</span>
            <h3 className="text-xl font-black tracking-tight">Consistency Heatmap</h3>
          </div>
        </div>
        <div id="fullHeatmap" className="grid grid-flow-col grid-rows-7 gap-1.5 overflow-x-auto pb-4 custom-scrollbar" />
      </div>

      <div className="widget col-span-12 lg:col-span-4">
        <span className="label-caps">Knowledge Spheres</span>
        <div id="topicCloud" className="flex flex-wrap gap-2 mt-4 content-start" />
      </div>

      <div className="col-span-12 lg:col-span-8">
        <div className="flex justify-between items-center mb-6 px-4">
          <h2 className="text-xl font-black uppercase tracking-tight">Active Dossier</h2>
          <span className="text-[10px] font-bold text-gray-400">SORTED BY RECENT</span>
        </div>
        <div id="courseList" className="grid grid-cols-1 md:grid-cols-2 gap-4" />
      </div>

      <footer className="max-w-[1400px] mx-auto mt-12 px-4 flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
        <div className="flex items-center gap-6">
          <span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-green-500"></span> DB: MongoDB_Atlas</span>
          <span>Env: Production_V22</span>
        </div>
        <div className="flex items-center gap-6">
          <span>Last Sync: <span id="syncTime" className="text-black">--:--:--</span></span>
          <button onClick={() => auth.logout()} className="text-red-500 hover:scale-110 transition-transform">Terminate Session</button>
        </div>
      </footer>
    </div>
  )
}
