import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import './signup.css'

export default function SignUp() {
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [aiApiKey, setAiApiKey] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSignUp(e) {
    e.preventDefault()
    setLoading(true)

    const payload = {
      name: name.trim(),
      email: email.trim(),
      password,
      aiApiKey: aiApiKey.trim() || null,
    }

    try {
      const res = await fetch('http://localhost:5500/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const data = await res.json()

      if (res.ok) {
        localStorage.setItem('accessToken', data.accessToken)
        localStorage.setItem('operatorName', payload.name)
        navigate('/dashboard')
      } else if (res.status === 409) {
        alert('Identity already exists. Redirecting...')
        navigate('/signin')
      } else {
        alert(data.error || 'Initialization failed')
      }
    } catch {
      alert('Protocol Error: Backend unreachable')
    } finally {
      setLoading(false)
    }
  }

  function handleGetGroqKey() {
    window.open('https://console.groq.com/keys', '_blank')
  }

  return (
    <div className="antialiased min-h-screen flex flex-col justify-between overflow-hidden" style={{ background: '#000' }}>
      {/* NAV */}
      <nav className="flex justify-between items-center px-10 py-8">
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 bg-white rounded-[5px]"></div>
          <span className="font-bold text-sm text-white">SkillTracker</span>
        </div>

        <div className="flex items-center gap-6">
          <span className="text-[11px] font-medium text-white/30 uppercase tracking-widest">Operator Setup</span>
          <Link to="/signin" className="text-xs font-semibold text-white/50 hover:text-white">
            Authorize Existing
          </Link>
        </div>
      </nav>

      {/* MAIN */}
      <main className="px-10 flex-1 flex items-center justify-center">
        <div className="w-full max-w-[420px] animate-ui">
          <div className="mb-10">
            <h1 className="text-5xl font-extrabold tracking-tighter leading-none mb-4 text-white">
              INITIALIZE <br />
              <span className="text-white/20 italic">IDENTITY.</span>
            </h1>
            <p className="text-white/40 text-sm">Register your neural signature to begin acquisition.</p>
          </div>

          <div className="glass squircle p-10">
            <form onSubmit={handleSignUp} className="space-y-5">
              <div>
                <label className="block text-[10px] font-bold text-white/20 uppercase tracking-widest mb-2">Operator Name</label>
                <input
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="input-field w-full px-5 py-4 input-squircle text-sm"
                  placeholder="Udit"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-white/20 uppercase tracking-widest mb-2">Network Email</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-field w-full px-5 py-4 input-squircle text-sm"
                  placeholder="udit@example.com"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-white/20 uppercase tracking-widest mb-2">Access Key</label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-field w-full px-5 py-4 input-squircle text-sm"
                  placeholder="••••••••"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-white/20 uppercase tracking-widest mb-2">AI API Key</label>
                <input
                  type="password"
                  value={aiApiKey}
                  onChange={(e) => setAiApiKey(e.target.value)}
                  className="input-field w-full px-5 py-4 input-squircle text-sm"
                  placeholder="Groq API key"
                />
                <p className="text-[10px] text-white/30 mt-2">
                  Stored securely. Never exposed or returned.
                  <button type="button" onClick={handleGetGroqKey} className="text-white hover:underline ml-1">
                    Generate Groq API Key
                  </button>
                </p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-white text-black py-4 input-squircle font-black text-xs uppercase tracking-widest hover:bg-neutral-200 transition disabled:opacity-50"
              >
                {loading ? 'INITIALIZING...' : 'Establish Identity →'}
              </button>
            </form>

            <div className="mt-8 text-center">
              <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest">
                Already Registered?
                <Link to="/signin" className="text-white hover:underline ml-1">
                  Authorize Access
                </Link>
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* FOOTER */}
      <footer className="px-10 py-10 flex justify-between text-[10px] text-white/30">
        <span>Secure Vault Storage</span>
        <span>SkillTracker Engine · v1.0.4</span>
      </footer>
    </div>
  )
}
