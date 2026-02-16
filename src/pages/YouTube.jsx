import React, { useEffect, useRef, useState } from 'react'
import auth from './auth.js'
import './youtube.css'

export default function YouTube() {
  const wrapperRef = useRef(null)
  const progressFillRef = useRef(null)
  const phaseIndicatorRef = useRef(null)
  const [loading, setLoading] = useState(false)

  const colors = ['#FF5F6D', '#FFC371', '#00F2FF', '#70FF00', '#BF5AF2', '#FF375F']

  useEffect(() => {
    let targetX = 0,
      currentX = 0,
      maxScroll = 0
    const ease = 0.08
    const scrollStep = 500

    function clampScroll() {
      if (wrapperRef.current) {
        maxScroll = -(wrapperRef.current.offsetWidth - window.innerWidth + 300)
        targetX = Math.min(0, Math.max(targetX, maxScroll || 0))
      }
    }

    function animate() {
      if (wrapperRef.current) {
        currentX += (targetX - currentX) * ease
        wrapperRef.current.style.transform = `translate3d(${currentX}px, 0, 0)`

        if (maxScroll !== 0 && progressFillRef.current) {
          const progress = (currentX / maxScroll) * 100
          progressFillRef.current.style.width = `${progress}%`

          const cards = document.querySelectorAll('.video-card')
          const idx = Math.min(cards.length - 1, Math.max(0, Math.floor(Math.abs(currentX) / 550)))
          if (cards[idx]) {
            const c = cards[idx].style.getPropertyValue('--phase-color')
            if (phaseIndicatorRef.current) {
              phaseIndicatorRef.current.style.color = c
              phaseIndicatorRef.current.innerText = `Node 0${cards[idx].dataset.day}`
            }
            document.documentElement.style.setProperty('--current-color', c)
          }
        }
      }
      requestAnimationFrame(animate)
    }
    animate()

    window.addEventListener('wheel', (e) => {
      targetX -= (e.deltaY + e.deltaX) * 0.9
      clampScroll()
    })

    window.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        targetX -= scrollStep
      }
      if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        targetX += scrollStep
      }
      clampScroll()
    })

    clampScroll()

    return () => {
      // Cleanup if needed
    }
  }, [])

  async function handleSubmit(e) {
    e.preventDefault()
    const url = e.target.url?.value?.trim()
    const limit = Number(e.target.minutes?.value || 30)

    if (!url) return

    setLoading(true)

    try {
      const res = await auth.authFetch('http://localhost:5500/youtube/playlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      })

      const data = await res.json()

      if (data.videos && wrapperRef.current) {
        wrapperRef.current.innerHTML = ''
        let currentDay = 1,
          dailyTotal = 0

        data.videos.forEach((video) => {
          const match = video.duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?/)
          const mins = Number(match?.[1] || 0) * 60 + Number(match?.[2] || 0)

          if (dailyTotal + mins > limit && dailyTotal > 0) {
            currentDay++
            dailyTotal = 0
            const div = document.createElement('div')
            div.className = 'phase-divider shrink-0 mx-10 text-[10px] font-black uppercase tracking-[1em]'
            div.style.setProperty('--phase-color', colors[(currentDay - 1) % colors.length])
            div.innerHTML = `PHASE 0${currentDay}`
            wrapperRef.current.appendChild(div)
          }

          const color = colors[(currentDay - 1) % colors.length]
          const cardEl = document.createElement('div')
          cardEl.className = 'video-card glass p-8 squircle w-[480px] shrink-0'
          cardEl.dataset.day = currentDay
          cardEl.style.setProperty('--phase-color', color)
          cardEl.style.setProperty('--phase-glow', `${color}22`)

          cardEl.innerHTML = `
            <div class="flex justify-between items-center mb-8">
              <span class="day-badge px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider">Day ${currentDay}</span>
              <span class="text-[9px] font-mono text-white/20">SEQ_${video.videoId.slice(0, 5)}</span>
            </div>
            <div class="w-full aspect-video squircle overflow-hidden mb-8 ring-1 ring-white/10 shadow-2xl">
              <img src="${video.thumbnails}" class="w-full h-full object-cover" alt="${video.title}">
            </div>
            <h2 class="text-2xl font-bold leading-tight tracking-tighter mb-10 h-16 line-clamp-2">${video.title}</h2>
            <button onclick="window.open('https://youtube.com/watch?v=${video.videoId}')" 
                    class="w-full py-4 squircle text-[10px] font-black uppercase tracking-[0.2em] border border-white/10 hover:bg-white hover:text-black transition-all">
              Initialize Session
            </button>
          `
          if (wrapperRef.current) wrapperRef.current.appendChild(cardEl)

          dailyTotal += mins
        })

        setTimeout(() => {
          // Reset scroll
        }, 200)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="antialiased" style={{ background: '#000', color: '#fff' }}>
      {/* NAV */}
      <nav className="fixed top-0 left-0 w-full flex justify-between items-center px-10 py-10 z-50 pointer-events-none">
        <div className="flex items-center gap-3 pointer-events-auto">
          <div className="w-5 h-5 bg-white rounded-[6px]"></div>
          <span className="font-bold text-base tracking-tighter">SkillTracker</span>
        </div>

        <form onSubmit={handleSubmit} className="glass px-2 py-2 squircle flex gap-2 pointer-events-auto shadow-2xl">
          <input
            name="url"
            placeholder="Paste YouTube Playlist"
            className="bg-transparent px-6 py-2 outline-none text-xs font-medium w-72 text-white/40 focus:text-white"
            required
          />
          <input
            name="minutes"
            type="number"
            placeholder="Mins"
            defaultValue={30}
            className="bg-white/5 px-3 py-2 rounded-2xl outline-none text-[10px] font-bold w-20 text-center"
            required
          />
          <button
            type="submit"
            disabled={loading}
            className="bg-white text-black px-8 py-2 squircle text-[10px] font-black uppercase tracking-widest hover:bg-transparent hover:text-white border border-transparent hover:border-white transition-all disabled:opacity-50"
          >
            {loading ? 'Syncing...' : 'Sync'}
          </button>
        </form>
      </nav>

      {/* SCROLL WRAPPER */}
      <div
        ref={wrapperRef}
        className="fixed top-0 left-0 h-screen flex items-center z-10 will-change-transform px-24 gap-20"
        style={{ display: 'flex', alignItems: 'center' }}
      >
        <div id="empty-state" className="w-screen flex flex-col justify-center">
          <h1 className="text-[12vw] font-black tracking-tighter leading-none opacity-[0.03] select-none">
            CHROMATIC
            <br />
            ENGINE.
          </h1>
        </div>
      </div>

      {/* PROGRESS RAIL */}
      <div id="progress-rail" className="fixed bottom-40 left-[10%] w-[80%] h-[2px] bg-white/5 z-[100]">
        <div ref={progressFillRef} id="progress-fill" className="h-full w-0 bg-white transition-all"></div>
      </div>

      {/* FOOTER */}
      <footer className="fixed bottom-0 left-0 w-full px-10 py-12 flex justify-between items-end z-50 pointer-events-none">
        <div className="flex gap-8">
          <div className="space-y-1">
            <p className="text-[10px] font-bold text-white/20 uppercase tracking-[0.4em]">Current Phase</p>
            <p ref={phaseIndicatorRef} className="text-sm font-bold transition-colors duration-500">
              Node 01
            </p>
          </div>
        </div>

        <div className="flex items-center gap-6 opacity-30 pointer-events-auto">
          <div className="text-[10px] font-bold border border-white/20 px-2 py-1 rounded-md">←</div>
          <span className="text-[9px] font-bold uppercase tracking-widest">Navigate</span>
          <div className="text-[10px] font-bold border border-white/20 px-2 py-1 rounded-md">→</div>
        </div>

        <div className="flex items-center gap-4 opacity-30">
          <span className="text-[9px] font-bold uppercase tracking-widest">Obsidian Chromatic v2.2</span>
        </div>
      </footer>
    </div>
  )
}
