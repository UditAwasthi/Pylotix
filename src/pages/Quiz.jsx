import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import auth from './auth.js'
import './quiz.css'

export default function Quiz() {
  const navigate = useNavigate()
  const [questions, setQuestions] = useState([])
  const [idx, setIdx] = useState(0)
  const [selected, setSelected] = useState(null)
  const [revealed, setRevealed] = useState(false)
  const [quizData, setQuizData] = useState(null)
  const [course, setCourse] = useState(null)
  const [returnPath, setReturnPath] = useState(null)

  useEffect(() => {
    const token = localStorage.getItem('accessToken')
    const quizDataStr = localStorage.getItem('activeQuiz')
    const returnPathStr = localStorage.getItem('quizReturnPath')
    const courseDataStr = localStorage.getItem('courseData')

    if (!token || !quizDataStr || !returnPathStr || !courseDataStr) {
      navigate('/dashboard')
      return
    }

    const qData = JSON.parse(quizDataStr)
    const rPath = JSON.parse(returnPathStr)
    const cData = JSON.parse(courseDataStr)

    setQuizData(qData)
    setReturnPath(rPath)
    setCourse(cData)
    setQuestions(qData.questions || [])
  }, [navigate])

  if (!questions.length || !course || !returnPath) {
    return <div className="h-screen flex items-center justify-center text-white">Loading...</div>
  }

  const q = questions[idx]
  const total = questions.length

  function getLocalMastery() {
    const topicUID = (course.topicName || course.title).replace(/\s+/g, '_')
    const masteryKey = `mastery_${topicUID}`
    return JSON.parse(localStorage.getItem(masteryKey)) || {
      quizHistory: {},
      totalCorrect: 0,
      totalAttempted: 0,
      completedQuizzes: 0,
    }
  }

  async function saveAnswer(data) {
    const res = await auth.authFetch('http://localhost:5500/course/submitAnswer', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })

    if (!res.ok) {
      console.error('Submit answer failed')
      throw new Error('Answer submission failed')
    }
    return res.json()
  }

  async function handleValidate() {
    if (selected === null) {
      alert('Select an option')
      return
    }

    const correctIdx = Number(q.correctOptionIndex)

    if (!revealed) {
      // Reveal answer
      setRevealed(true)

      // Save answer to backend
      await saveAnswer({
        courseId: course._id,
        chapterIndex: returnPath.chapterIndex,
        topicIndex: returnPath.topicIndex,
        questionIndex: idx,
        selectedOptionIndex: selected,
        correctOptionIndex: correctIdx,
      })

      return
    }

    // Move to next question or finalize
    if (idx < total - 1) {
      setIdx(idx + 1)
      setSelected(null)
      setRevealed(false)
    } else {
      finalizeChapter()
    }
  }

  async function finalizeChapter() {
    const topicUID = (course.topicName || course.title).replace(/\s+/g, '_')
    const masteryKey = `mastery_${topicUID}`
    const mastery = getLocalMastery()
    mastery.quizHistory[returnPath.chapterTitle] = { passed: true }
    mastery.completedQuizzes += 1
    localStorage.setItem(masteryKey, JSON.stringify(mastery))

    const token = localStorage.getItem('accessToken')
    await fetch('http://localhost:5500/topic-progress/quiz/complete', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        courseId: course._id,
        chapterIndex: returnPath.chapterIndex,
        topicIndex: returnPath.topicIndex,
      }),
    })

    localStorage.removeItem('activeQuiz')
    localStorage.removeItem('quizReturnPath')
    navigate('/course')
  }

  function handleAbort() {
    if (confirm('Abort validation? Progress lost.')) {
      navigate('/course')
    }
  }

  const correctIdx = Number(q.correctOptionIndex)

  return (
    <div className="h-screen flex items-center justify-center p-6" style={{ background: '#000' }}>
      <main className="w-full max-w-3xl">
        <div className="mb-6 flex justify-between items-center">
          <h2 className="text-3xl font-black italic text-white">Chapter Validation</h2>
          <span className="text-sm text-white/40">
            Question {idx + 1} / {total}
          </span>
        </div>

        <div className="border border-white/10 rounded-2xl p-8">
          <h3 className="text-xl font-bold mb-6 text-white">{q.question}</h3>
          <div className="space-y-3">
            {q.options.map((opt, i) => (
              <button
                key={i}
                onClick={() => !revealed && setSelected(i)}
                className={`option-card w-full text-left px-5 py-4 rounded-xl transition-all ${
                  selected === i ? 'selected' : ''
                } ${revealed && i === correctIdx ? 'correct' : ''} ${
                  revealed && selected === i && i !== correctIdx ? 'wrong' : ''
                }`}
              >
                <span className="text-white">
                  {String.fromCharCode(65 + i)}. {opt}
                </span>
              </button>
            ))}
          </div>
          {revealed && (
            <div id="explanation" className="mt-6 text-sm text-white/40">
              {q.explanation || ''}
            </div>
          )}
        </div>

        <div className="flex justify-between mt-6">
          <button onClick={handleAbort} className="text-white/30 hover:text-red-400 text-xs uppercase">
            Abort
          </button>
          <button
            onClick={handleValidate}
            className="px-10 py-4 bg-white text-black rounded-full text-xs font-black uppercase tracking-widest hover:bg-gray-200 transition"
          >
            {!revealed ? 'Validate →' : idx < total - 1 ? 'Next →' : 'Finish Chapter →'}
          </button>
        </div>
      </main>
    </div>
  )
}
