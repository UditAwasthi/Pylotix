import React, { useEffect, useRef, useState } from 'react'
import auth from './auth.js'
import './roadmap.css'

export default function Roadmap() {
  const [step, setStep] = useState(1)
  const [userInput, setUserInput] = useState('')
  const [questions, setQuestions] = useState([])
  const [selectedAnswers, setSelectedAnswers] = useState({})
  const [loading, setLoading] = useState(false)
  const [roadmap, setRoadmap] = useState(null)

  const levelsRef = useRef(null)
  const pathRef = useRef(null)

  function showLoader(show) {
    setLoading(show)
  }

  async function getQuestions() {
    setSelectedAnswers({})
    const msg = userInput.trim()
    if (!msg) return

    showLoader(true)
    try {
      const res = await auth.authFetch('http://localhost:5500/roadmap/getQuestions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic: msg }),
      })

      const data = await res.json()
      setQuestions(data.questions || [])
      setStep(2)
    } catch (e) {
      alert('Failed to connect. Please try again.')
    } finally {
      showLoader(false)
    }
  }

  function setAnswer(key, val) {
    setSelectedAnswers((s) => ({ ...s, [key]: val }))
  }

  async function generateFinalRoadmap() {
    showLoader(true)
    try {
      const res = await auth.authFetch('http://localhost:5500/roadmap/getRoadmap', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic: userInput, duration_months: 6, answers: selectedAnswers }),
      })

      const result = await res.json()
      if (!result.success) {
        alert('Generation failed.')
        return
      }

      setRoadmap(result.roadmap)
      setStep(3)
      // draw path after next paint
      setTimeout(drawPath, 50)

      // add resize listener
      let resizeTimer
      const onResize = () => {
        clearTimeout(resizeTimer)
        resizeTimer = setTimeout(drawPath, 100)
      }
      window.addEventListener('resize', onResize)
    } catch (e) {
      console.error(e)
      alert('Error generating roadmap.')
    } finally {
      showLoader(false)
    }
  }

  function drawPath() {
    const anchors = levelsRef.current?.querySelectorAll('.anchor-dot') || []
    const svgContainer = levelsRef.current
    const pathEl = pathRef.current
    if (!anchors || anchors.length < 2 || !svgContainer || !pathEl) return

    const containerRect = svgContainer.getBoundingClientRect()
    let pathD = ''

    anchors.forEach((anchor, index) => {
      const rect = anchor.getBoundingClientRect()
      const x = rect.left + rect.width / 2 - containerRect.left
      const y = rect.top + rect.height / 2 - containerRect.top

      if (index === 0) {
        pathD += `M ${x} ${y}`
      } else {
        const prevAnchor = anchors[index - 1]
        const prevRect = prevAnchor.getBoundingClientRect()
        const prevX = prevRect.left + prevRect.width / 2 - containerRect.left
        const prevY = prevRect.top + prevRect.height / 2 - containerRect.top

        const cp1x = prevX
        const cp1y = prevY + (y - prevY) / 2
        const cp2x = x
        const cp2y = prevY + (y - prevY) / 2

        pathD += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${x} ${y}`
      }
    })

    pathEl.setAttribute('d', pathD)
  }

  useEffect(() => {
    // redraw when roadmap changes
    if (step === 3) setTimeout(drawPath, 60)
  }, [roadmap, step])

  // Renderers
  if (step === 1)
    return (
      <div className="p-4 md:p-8 lg:p-12">
        <div className="max-w-5xl mx-auto space-y-10 relative z-10">
          <header className="text-center pt-8 pb-4">
            <span className="label-caps text-gray-500">The Architect's Journey</span>
            <h1 className="text-5xl md:text-6xl font-bold tracking-tight mt-3 text-gray-900 zen-serif">A Clear Path.</h1>
          </header>

          <div className="widget p-8 md:p-14 min-h-[500px] flex flex-col">
            <div id="step-1" className="max-w-2xl mx-auto w-full text-center my-auto space-y-8">
              <h2 className="text-3xl font-medium zen-serif text-gray-800">What do you wish to master?</h2>

              <div className="flex flex-col gap-6 mt-6">
                <input id="userInput" value={userInput} onChange={(e) => setUserInput(e.target.value)} type="text" placeholder="e.g., I want to become a Flutter Developer in 6 months..." className="zen-input w-full px-8 py-5 rounded-2xl outline-none text-lg text-center" />
                <button onClick={getQuestions} className="btn-primary px-10 py-4 font-medium mx-auto text-lg shadow-md">Begin</button>
              </div>
            </div>
          </div>
        </div>

        {loading && (
          <div id="loader" className="fixed inset-0 bg-[#f5f5f7]/90 flex items-center justify-center z-50">
            <div className="flex flex-col items-center gap-6 bg-white p-10 rounded-3xl shadow-xl border border-gray-100">
              <div className="w-12 h-12 border-4 border-gray-200 border-t-black rounded-full animate-spin" />
              <p className="text-gray-800 font-medium">Crafting your path...</p>
            </div>
          </div>
        )}
      </div>
    )

  if (step === 2)
    return (
      <div className="p-4 md:p-8 lg:p-12">
        <div className="max-w-5xl mx-auto space-y-10 relative z-10">
          <div className="widget p-8 md:p-14 min-h-[500px] flex flex-col">
            <div id="step-2" className="space-y-10 w-full">
              <div className="text-center">
                <h2 className="text-3xl font-medium zen-serif text-gray-800">Refine Your Focus</h2>
                <p className="text-gray-500 mt-2">Select the parameters of your journey.</p>
              </div>

              <div id="questions-area" className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {questions.map((q) => (
                  <div key={q.key} className="flex flex-col p-6 rounded-3xl bg-gray-50/50 border border-gray-100">
                    <span className="label-caps mb-2">{q.key.replace('_', ' ')}</span>
                    <p className="font-medium text-lg text-gray-900 mb-5">{q.question}</p>
                    <div className="flex flex-wrap gap-2 mt-auto">
                      {q.options.map((opt) => (
                        <button key={opt} onClick={() => {
                          if (opt === 'Other') {
                            const custom = prompt('Please specify:')
                            if (custom) setAnswer(q.key, custom)
                          } else setAnswer(q.key, opt)
                        }} className={`btn-modern btn-${q.key} px-5 py-2 text-sm font-medium ${selectedAnswers[q.key] === opt ? 'active' : ''}`}>
                          {opt}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div className="text-center mt-12 pt-6 border-t border-gray-100">
                <button onClick={generateFinalRoadmap} className="btn-primary px-12 py-4 font-medium text-lg shadow-md">Generate Map</button>
              </div>
            </div>
          </div>
        </div>

        {loading && (
          <div id="loader" className="fixed inset-0 bg-[#f5f5f7]/90 flex items-center justify-center z-50">
            <div className="flex flex-col items-center gap-6 bg-white p-10 rounded-3xl shadow-xl border border-gray-100">
              <div className="w-12 h-12 border-4 border-gray-200 border-t-black rounded-full animate-spin" />
              <p className="text-gray-800 font-medium">Crafting your path...</p>
            </div>
          </div>
        )}
      </div>
    )

  // step 3
  return (
    <div className="p-4 md:p-8 lg:p-12">
      <div className="max-w-5xl mx-auto space-y-10 relative z-10">
        <div className="widget p-8 md:p-14 min-h-[500px] flex flex-col">
          <div id="step-3" className="relative w-full">
            <div className="text-center mb-16">
              <span id="roadmap-lang" className="label-caps bg-gray-100 text-gray-800 px-3 py-1 rounded-full">{roadmap?.primary_language || 'Curriculum'}</span>
              <h2 id="roadmap-title" className="text-4xl font-bold mt-4 text-gray-900 zen-serif">{roadmap?.target_role || roadmap?.skill || 'Roadmap'}</h2>
            </div>

            <div className="game-container" id="game-map" ref={levelsRef}>
              <svg id="svg-path-container">
                <path id="connector-path" ref={pathRef} className="path-line" d="" />
              </svg>

              <div id="levels-container">
                {roadmap?.roadmap?.map((month) => (
                  month.weeks.map((week, wIndex) => {
                    const globalIndex = (month.month - 1) * (month.weeks.length) + (wIndex + 1)
                    const posClass = globalIndex % 2 === 0 ? 'right' : 'left'
                    return (
                      <div key={`${month.month}-${wIndex}`} className={`level-row ${posClass}`}>
                        <div className="level-card p-7">
                          <div className="hanko-badge">{globalIndex}</div>
                          <div className="anchor-dot" />
                          <div className="mb-4">
                            <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">Month {month.month} • Act {week.week}</span>
                          </div>
                          <h3 className="text-xl font-bold mb-4 text-gray-900 leading-tight">{week.focus}</h3>
                          <ul className="space-y-3 mb-6">
                            {week.tasks?.slice(0,3).map((t, i) => (
                              <li key={i} className="flex items-start gap-3 text-sm text-gray-600">
                                <span className="mt-1.5 w-1.5 h-1.5 bg-gray-300 rounded-full flex-shrink-0" />
                                <span className="leading-relaxed">{t}</span>
                              </li>
                            ))}
                          </ul>
                          <div className="pt-4 mt-auto border-t border-gray-100">
                            <p className="text-sm font-medium text-[#d9381e]">Outcome: <span className="text-gray-800 font-normal">{week.outcome}</span></p>
                          </div>
                        </div>
                      </div>
                    )
                  })
                ))}
              </div>
            </div>

            <div className="text-center mt-16 pt-10 border-t border-gray-100">
              <button onClick={() => window.location.reload()} className="text-sm font-medium text-gray-500 hover:text-black transition-colors">Start a New Journey</button>
            </div>
          </div>
        </div>
      </div>

      {loading && (
        <div id="loader" className="fixed inset-0 bg-[#f5f5f7]/90 flex items-center justify-center z-50">
          <div className="flex flex-col items-center gap-6 bg-white p-10 rounded-3xl shadow-xl border border-gray-100">
            <div className="w-12 h-12 border-4 border-gray-200 border-t-black rounded-full animate-spin" />
            <p className="text-gray-800 font-medium">Crafting your path...</p>
          </div>
        </div>
      )}
    </div>
  )
}
