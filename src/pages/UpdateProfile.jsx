import React, { useState } from 'react'
import './updateprofile.css'

export default function UpdateProfile() {
  const [avatar, setAvatar] = useState('https://loremfaces.net/128/id/1.jpg')
  const [status, setStatus] = useState('')
  const [statusColor, setStatusColor] = useState('')
  const [selectedFile, setSelectedFile] = useState(null)

  function handleAvatarChange(e) {
    const file = e.target.files?.[0]
    if (!file) return

    setSelectedFile(file)
    setAvatar(URL.createObjectURL(file))
  }

  async function handleSave() {
    if (!selectedFile) {
      setStatus('Please select an image first.')
      setStatusColor('text-red-400')
      return
    }

    const formData = new FormData()
    formData.append('avatar', selectedFile)

    setStatus('Uploading...')
    setStatusColor('text-zinc-400')

    try {
      const response = await fetch('http://localhost:5500/user/update/profile/avatar', {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
        body: formData,
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Upload failed')
      }

      setAvatar(data.avatar)
      setStatus('Profile image updated successfully.')
      setStatusColor('text-green-400')
      setSelectedFile(null)
    } catch (err) {
      setStatus(err.message)
      setStatusColor('text-red-400')
    }
  }

  return (
    <div className="bg-zinc-950 text-zinc-100 min-h-screen flex items-center justify-center">
      <div className="w-full max-w-md bg-zinc-900 rounded-xl shadow-lg p-6">
        <h1 className="text-xl font-semibold mb-4">Edit Profile</h1>

        {/* AVATAR PREVIEW */}
        <div className="flex flex-col items-center gap-3 mb-6">
          <img src={avatar} className="w-32 h-32 rounded-full object-cover border border-zinc-700" alt="Avatar" />
          <label className="cursor-pointer text-sm text-blue-400 hover:underline">
            Change Avatar
            <input type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
          </label>
        </div>

        {/* SAVE BUTTON */}
        <button
          onClick={handleSave}
          className="w-full bg-blue-600 hover:bg-blue-700 transition rounded-lg py-2 font-medium"
        >
          Save Changes
        </button>

        {/* STATUS */}
        {status && <p className={`text-sm text-center mt-3 ${statusColor}`}>{status}</p>}
      </div>
    </div>
  )
}
