
import React from 'react'
import { Routes, Route, Link } from 'react-router-dom'
import Home from './pages/Home'
import Roadmap from './pages/Roadmap'
import Dashboard from './pages/Dashboard'
import Course from './pages/Course'
import Activity from './pages/Activity'
import Community from './pages/Community'
import Doc from './pages/Doc'
import Productivity from './pages/Productivity'
import Profile from './pages/Profile'
import Quiz from './pages/Quiz'
import SignIn from './pages/SignIn'
import SignUp from './pages/SignUp'
import Success from './pages/Success'
import UpdateProfile from './pages/UpdateProfile'
import YouTube from './pages/YouTube'

export default function App() {
  return (
    <div>
  
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/signin" element={<SignIn />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/roadmap" element={<Roadmap />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/course" element={<Course />} />
          <Route path="/activity" element={<Activity />} />
          <Route path="/community" element={<Community />} />
          <Route path="/doc" element={<Doc />} />
          <Route path="/productivity" element={<Productivity />} />
          <Route path="/quiz" element={<Quiz />} />
          <Route path="/success" element={<Success />} />
          <Route path="/updateprofile" element={<UpdateProfile />} />
          <Route path="/youtube" element={<YouTube />} />
        </Routes>
      </main>
    </div>
  )
}
