'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Navbar from '../components/Navbar'

export default function ProfilePage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [editing, setEditing] = useState(false)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [toast, setToast] = useState('')
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false)

  useEffect(() => {
    const userData = localStorage.getItem('user')
    if (!userData) {
      router.push('/login')
    } else {
      const parsed = JSON.parse(userData)
      setUser(parsed)
      setName(parsed.name)
      setEmail(parsed.email)
      loadTwoFactorStatus()
    }
  }, [])

  async function loadTwoFactorStatus() {
    const token = localStorage.getItem('token')
    const res = await fetch('http://localhost:8000/api/me', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    const data = await res.json()
    setTwoFactorEnabled(data.two_factor_enabled)
  }

  function showToast(msg: string) {
    setToast(msg)
    setTimeout(() => setToast(''), 3000)
  }

  async function saveProfile() {
    const token = localStorage.getItem('token')
    const res = await fetch('http://localhost:8000/api/me/update', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ name, email, password: password || undefined })
    })

    if (res.ok) {
      const updatedUser = { ...user, name, email }
      localStorage.setItem('user', JSON.stringify(updatedUser))
      setUser(updatedUser)
      setEditing(false)
      setPassword('')
      showToast('Профилът е обновен успешно!')
    } else {
      showToast('Грешка при обновяване!')
    }
  }

  async function toggleTwoFactor() {
    const token = localStorage.getItem('token')
    const res = await fetch('http://localhost:8000/api/me/two-factor', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` }
    })
    const data = await res.json()
    setTwoFactorEnabled(data.two_factor_enabled)
    showToast(data.message)
  }

  if (!user) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100">
      {toast && (
        <div className="fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-xl shadow-lg z-50">
          ✅ {toast}
        </div>
      )}

      <Navbar user={user} />

      <div className="max-w-2xl mx-auto px-4 py-10">
        <h2 className="text-2xl font-bold text-gray-900 mb-8">👤 Моят профил</h2>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
          <div className="flex items-center gap-6 mb-8">
            <div className="w-20 h-20 rounded-full bg-black text-white flex items-center justify-center text-3xl font-bold">
              {user.name?.charAt(0).toUpperCase()}
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">{user.name}</h3>
              <p className="text-gray-500 text-sm">{user.email}</p>
              <span className="inline-block mt-1 bg-gray-100 text-gray-700 text-xs px-3 py-1 rounded-full font-medium">
                {user.role}
              </span>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center py-3 border-b border-gray-100">
              <span className="text-sm text-gray-500">Име</span>
              {editing ? (
                <input
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-black"
                />
              ) : (
                <span className="text-sm font-medium text-gray-900">{user.name}</span>
              )}
            </div>
            <div className="flex justify-between items-center py-3 border-b border-gray-100">
              <span className="text-sm text-gray-500">Email</span>
              {editing ? (
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-black"
                />
              ) : (
                <span className="text-sm font-medium text-gray-900">{user.email}</span>
              )}
            </div>
            {editing && (
              <div className="flex justify-between items-center py-3 border-b border-gray-100">
                <span className="text-sm text-gray-500">Нова парола</span>
                <input
                  type="password"
                  placeholder="Остави празно ако не искаш да сменяш"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-black"
                />
              </div>
            )}
            <div className="flex justify-between items-center py-3 border-b border-gray-100">
              <span className="text-sm text-gray-500">Роля</span>
              <span className="text-sm font-medium text-gray-900">{user.role}</span>
            </div>
            <div className="flex justify-between items-center py-3 border-b border-gray-100">
              <div>
                <span className="text-sm text-gray-500">Двуфакторна автентикация</span>
                <p className="text-xs text-gray-400 mt-0.5">Получавай код на имейла при вход</p>
              </div>
              <div
                onClick={toggleTwoFactor}
                style={{
                  cursor: 'pointer',
                  width: '44px',
                  height: '24px',
                  borderRadius: '12px',
                  backgroundColor: twoFactorEnabled ? 'black' : '#e5e7eb',
                  position: 'relative',
                  transition: 'background-color 0.2s'
                }}
              >
                <div style={{
                  position: 'absolute',
                  top: '4px',
                  left: twoFactorEnabled ? '24px' : '4px',
                  width: '16px',
                  height: '16px',
                  borderRadius: '50%',
                  backgroundColor: 'white',
                  transition: 'left 0.2s'
                }} />
              </div>
            </div>
          </div>

          <div className="flex gap-3 mt-8">
            {editing ? (
              <>
                <button
                  onClick={saveProfile}
                  className="flex-1 bg-black hover:bg-gray-800 text-white py-2.5 rounded-lg text-sm font-medium transition"
                >
                  Запази промените
                </button>
                <button
                  onClick={() => { setEditing(false); setName(user.name); setEmail(user.email); setPassword('') }}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2.5 rounded-lg text-sm font-medium transition"
                >
                  Откажи
                </button>
              </>
            ) : (
              <button
                onClick={() => setEditing(true)}
                className="flex-1 bg-black hover:bg-gray-800 text-white py-2.5 rounded-lg text-sm font-medium transition"
              >
                ✏️ Редактирай профила
              </button>
            )}
          </div>

          <button
            onClick={() => {
              localStorage.removeItem('token')
              localStorage.removeItem('user')
              router.push('/login')
            }}
            className="mt-3 w-full bg-red-500 hover:bg-red-600 text-white py-2.5 rounded-lg text-sm font-medium transition"
          >
            Изход
          </button>
        </div>
      </div>
    </div>
  )
}