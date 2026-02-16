import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import auth from './auth.js'
import './course.css'

export default function Course() {
  const navigate = useNavigate()
  const [course, setCourse] = useState(null)
  const [progressData, setProgressData] = useState(null)
  const [currentChapterIdx, setCurrentChapterIdx] = useState(0)
  const [currentTopicIdx, setCurrentTopicIdx] = useState(0)

  useEffect(() => {
    const c = JSON.parse(localStorage.getItem('courseData'))
    if (!c) return navigate('/dashboard')
    setCourse(c)
    (async () => {
      const pd = await fetchCourseProgress(c._id)
      setProgressData(pd)
      if (pd?.progress) {
        setCurrentChapterIdx(pd.progress.chapterIndex ?? 0)
        setCurrentTopicIdx(pd.progress.topicIndex ?? 0)
      }
      await tryCompleteCourseIfEligible(c, pd)
    })()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function fetchCourseProgress(courseId) {
    try {
      const res = await fetch(`http://localhost:5500/progress/${courseId}`, { headers: auth.getHeaders() })
      if (!res.ok) return null
      return await res.json()
    } catch {
      return null
    }
  }

  function getTopicProgress(cIdx, tIdx) {
    return progressData?.topicProgress?.[`${cIdx}:${tIdx}`]
  }

  function isTopicCompleted(cIdx, tIdx) {
    return getTopicProgress(cIdx, tIdx)?.quizPassed === true
  }

  function buildChapterQuiz(chapter) {
    const questions = []
    chapter.topics.forEach((t) => { if (t.quiz?.questions) questions.push(...t.quiz.questions) })
    return questions.length ? { questions } : null
  }

  async function tryCompleteCourseIfEligible(localCourse, pd) {
    const localProgress = pd || progressData
    if (!localProgress || localProgress.completed) return
    const allTopics = localCourse.chapters.flatMap((ch) => ch.topics)
    const passedCount = Object.values(localProgress.topicProgress || {}).filter((t) => t.quizPassed === true).length
    if (allTopics.length && passedCount === allTopics.length) {
      const res = await auth.authFetch('http://localhost:5500/course/complete', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ courseId: localCourse._id }) })
      if (res.ok) {
        const updated = await res.json()
        setProgressData(updated)
      }
    }
  }

  function updateMasteryDisplay() {
    if (!progressData || !progressData.topicProgress) return { progressPercent: 0, accuracyPercent: 0 }
    const topics = Object.values(progressData.topicProgress)
    const correct = topics.reduce((s, t) => s + (t.correctCount || 0), 0)
    const attempted = topics.reduce((s, t) => s + (t.attemptedCount || 0), 0)
    const completed = topics.filter((t) => t.quizPassed === true).length
    const totalTopics = course.chapters.flatMap((ch) => ch.topics).length
    const progressPercent = totalTopics ? Math.round((completed / totalTopics) * 100) : 0
    const accuracyPercent = attempted ? Math.round((correct / attempted) * 100) : 0
    return { progressPercent, accuracyPercent }
  }

  function goToTopic(c, t) {
    setCurrentChapterIdx(c)
    setCurrentTopicIdx(t)
    // ensure UI scroll to top if needed
    document.getElementById('content') && (document.getElementById('content').scrollTop = 0)
  }

  async function handleNext() {
    if (!course) return
    const chapter = course.chapters[currentChapterIdx]
    const isLastTopic = currentTopicIdx === chapter.topics.length - 1

    // course completed
    if (progressData?.completed) {
      return navigate('/success')
    }

    if (isLastTopic && !isTopicCompleted(currentChapterIdx, currentTopicIdx)) {
      const quiz = buildChapterQuiz(chapter)
      if (quiz) {
        localStorage.setItem('activeQuiz', JSON.stringify(quiz))
        localStorage.setItem('quizReturnPath', JSON.stringify({ chapterIndex: currentChapterIdx, topicIndex: currentTopicIdx, chapterTitle: chapter.chapterTitle }))
        return navigate('/quiz')
      }
    }

    await auth.authFetch('http://localhost:5500/progress/update', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ courseId: course._id, chapterIndex: currentChapterIdx, topicIndex: currentTopicIdx }) })

    const pd = await fetchCourseProgress(course._id)
    setProgressData(pd)
    await tryCompleteCourseIfEligible(course, pd)

    if (currentTopicIdx < chapter.topics.length - 1) setCurrentTopicIdx((i) => i + 1)
    else if (currentChapterIdx < course.chapters.length - 1) { setCurrentChapterIdx((i) => i + 1); setCurrentTopicIdx(0) }
  }

  function handlePrev() {
    if (currentTopicIdx > 0) setCurrentTopicIdx((i) => i - 1)
    else if (currentChapterIdx > 0) { const prev = currentChapterIdx - 1; setCurrentChapterIdx(prev); setCurrentTopicIdx(course.chapters[prev].topics.length - 1) }
  }

  if (!course) return null

  const chapter = course.chapters[currentChapterIdx]
  const topic = chapter.topics[currentTopicIdx]
  const { progressPercent, accuracyPercent } = updateMasteryDisplay()

  return (
    <div className="h-screen flex">
      <aside className="w-80 glass-sidebar flex flex-col z-20">
        <div className="p-8">
          <div className="flex flex-col gap-6 mb-12">
            <a onClick={() => navigate('/dashboard')} className="flex items-center gap-2 text-[10px] font-black text-white/30 uppercase tracking-[0.3em] hover:text-white transition" style={{ cursor: 'pointer' }}>← Exit to Dashboard</a>
            <div className="flex items-center gap-3"><div className="w-2 h-8 bg-indigo-600 rounded-full" /><h1 className="text-xs font-black uppercase tracking-[0.4em]">Mastery Mode</h1></div>
          </div>
          <nav id="chapterList" className="space-y-6 overflow-y-auto max-h-[55vh] pr-2">
            {course.chapters.map((ch, cIdx) => (
              <div key={cIdx} className="mb-6">
                <div className="px-4 mb-2 text-[8px] uppercase text-white/30">{ch.chapterTitle}</div>
                {ch.topics.map((t, tIdx) => (
                  <button key={tIdx} onClick={() => goToTopic(cIdx, tIdx)} className={`w-full px-4 py-3 text-left text-[11px] ${isTopicCompleted(cIdx, tIdx) ? 'text-emerald-400' : 'text-white/30'} ${cIdx === currentChapterIdx && tIdx === currentTopicIdx ? 'font-bold text-white' : 'hover:text-white/60'}`}>
                    {t.title}
                  </button>
                ))}
              </div>
            ))}
          </nav>
        </div>

        <div className="mt-auto p-8 border-t border-white/5 bg-black/20 space-y-6">
          <div>
            <div className="flex justify-between text-[9px] mb-3 text-white/20 font-black tracking-widest uppercase"><span>Neural Acquisition</span><span id="progressText" className="text-white/60">{progressPercent}%</span></div>
            <div className="h-[2px] w-full bg-white/5 rounded-full overflow-hidden"><div id="progressBar" className="h-full progress-liquid" style={{ width: `${progressPercent}%` }} /></div>
          </div>
          <div className="flex justify-between items-center"><span className="text-[9px] text-white/20 font-black uppercase tracking-widest">Accuracy</span><span id="accuracyText" className="text-sm font-bold italic text-indigo-400">{accuracyPercent}%</span></div>
        </div>
      </aside>

      <main className="flex-1 flex flex-col bg-[#030303]">
        <header className="h-20 flex items-center justify-between px-12 border-b border-white/5 bg-black/40 backdrop-blur-md">
          <div className="text-[10px] font-bold uppercase tracking-widest text-white/20">Vector / <span id="currentChapterName" className="text-white/60 italic">{chapter.chapterTitle}</span></div>
        </header>

        <section id="content" className="flex-1 overflow-y-auto px-12 py-16">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-5xl font-black italic uppercase mb-6">{topic.title}</h1>
            <p className="text-white/40 mb-10">{topic.content.description}</p>
            {topic.content.sections.map((sec, i) => sec.type === 'text' ? <p key={i} className="text-white/70 mb-4">{sec.value}</p> : <pre key={i}><code>{sec.code}</code></pre>)}
          </div>
        </section>

        <footer className="h-24 px-12 flex items-center justify-between border-t border-white/5 bg-black/60 backdrop-blur-md">
          <button id="prevBtn" onClick={handlePrev} className="text-[10px] font-black uppercase tracking-widest text-white/20 hover:text-white transition">← Previous Segment</button>
          <button id="nextBtn" onClick={handleNext} className="px-10 py-4 bg-white text-black rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-indigo-50 transition">Complete & Continue</button>
        </footer>
      </main>
    </div>
  )
}
