import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './success.css'

export default function Success() {
  const navigate = useNavigate()
  const [stats, setStats] = useState({
    accuracy: 0,
    time: '0m',
    modules: '0/0',
    courseName: 'Course',
  })

  useEffect(() => {
    const course = JSON.parse(localStorage.getItem('courseData'))
    if (!course) {
      navigate('/dashboard')
      return
    }

    const topicUID = (course.topicName || 'current_vector').replace(/\s+/g, '_')
    const mastery = JSON.parse(localStorage.getItem(`mastery_${topicUID}`)) || {
      totalCorrect: 0,
      totalAttempted: 0,
      completedQuizzes: 0,
    }

    const learningTimeSeconds = parseInt(localStorage.getItem('learningTime')) || 0
    const minutes = Math.floor(learningTimeSeconds / 60)
    const timeDisplay = minutes > 0 ? `${minutes}m` : `${learningTimeSeconds}s`

    const accuracy =
      mastery.totalAttempted > 0 ? Math.round((mastery.totalCorrect / mastery.totalAttempted) * 100) : 0

    const totalQuizzes = course.chapters.reduce((acc, ch) => {
      return acc + ch.topics.filter((t) => t.quiz && t.quiz.questions?.length > 0).length
    }, 0)

    setStats({
      accuracy,
      time: timeDisplay,
      modules: `${mastery.completedQuizzes}/${totalQuizzes}`,
      courseName: `${course.topicName} Certification`,
    })
  }, [navigate])

  return (
    <div className="min-h-screen flex items-center justify-center p-6" style={{ background: '#050505' }}>
      <div className="max-w-3xl w-full glass p-12 text-center animate-reveal">
        {/* SUCCESS ICON */}
        <div className="mb-8 inline-flex items-center justify-center w-24 h-24 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>

        <h1 className="text-4xl font-extrabold mb-2 tracking-tight text-white">Certification Earned</h1>
        <p className="text-white/40 mb-12 font-light italic">{stats.courseName}</p>

        {/* STATS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
          <div className="stat-card">
            <div className="text-[10px] uppercase tracking-widest text-white/30 mb-2 font-bold">Accuracy</div>
            <div className="text-3xl font-black text-emerald-400">{stats.accuracy}%</div>
          </div>
          <div className="stat-card">
            <div className="text-[10px] uppercase tracking-widest text-white/30 mb-2 font-bold">Time Spent</div>
            <div className="text-3xl font-black text-white">{stats.time}</div>
          </div>
          <div className="stat-card">
            <div className="text-[10px] uppercase tracking-widest text-white/30 mb-2 font-bold">Modules</div>
            <div className="text-3xl font-black text-indigo-400">{stats.modules}</div>
          </div>
        </div>

        {/* ACTIONS */}
        <div className="flex flex-col md:flex-row gap-4 justify-center">
          <button
            onClick={() => navigate('/dashboard')}
            className="px-10 py-4 bg-white text-black font-extrabold rounded-2xl hover:bg-neutral-200 transition active:scale-95 shadow-xl"
          >
            Return to Dashboard
          </button>
          <button
            onClick={() => window.print()}
            className="px-10 py-4 bg-white/5 text-white/60 font-bold rounded-2xl border border-white/5 hover:bg-white/10 transition"
          >
            Print Transcript
          </button>
        </div>
      </div>
    </div>
  )
}
