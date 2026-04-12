'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Navbar from '../components/Navbar'

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    const userData = localStorage.getItem('user')
    if (!userData) {
      router.push('/login')
    } else {
      setUser(JSON.parse(userData))
    }
  }, [])

  if (!user) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100">
      <Navbar user={user} />

      <div className="max-w-6xl mx-auto px-4 py-10">
        <div className="mb-10">
          <h2 className="text-3xl font-bold text-gray-900">Добре дошъл, {user.name}! 👋</h2>
          <p className="text-gray-500 mt-1">Ти си с роля: <span className="font-semibold text-gray-700">{user.role}</span></p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <div
            onClick={() => router.push('/tools')}
            className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 cursor-pointer hover:shadow-md hover:border-gray-300 transition"
          >
            <div className="text-4xl mb-4">🛠️</div>
            <h3 className="text-lg font-semibold text-gray-900">Всички инструменти</h3>
            <p className="text-sm text-gray-500 mt-1">Разгледай и управлявай AI инструментите</p>
          </div>

          {(user.role === 'owner' || user.role === 'backend' || user.role === 'frontend') && (
            <div
              onClick={() => router.push('/add-tool')}
              className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 cursor-pointer hover:shadow-md hover:border-gray-300 transition"
            >
              <div className="text-4xl mb-4">➕</div>
              <h3 className="text-lg font-semibold text-gray-900">Добави инструмент</h3>
              <p className="text-sm text-gray-500 mt-1">Добави нов AI инструмент към платформата</p>
            </div>
          )}

          <div
            onClick={() => router.push('/profile')}
            className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 cursor-pointer hover:shadow-md hover:border-gray-300 transition"
          >
            <div className="text-4xl mb-4">👤</div>
            <h3 className="text-lg font-semibold text-gray-900">Моят профил</h3>
            <p className="text-sm text-gray-500 mt-1">Виж и редактирай профилните си данни</p>
          </div>

          {user.role === 'owner' && (
            <div
              onClick={() => router.push('/admin')}
              className="bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl shadow-sm p-6 text-white cursor-pointer hover:shadow-md transition"
            >
              <div className="text-4xl mb-4">👑</div>
              <h3 className="text-lg font-semibold">Owner панел</h3>
              <p className="text-sm opacity-80 mt-1">Имаш пълен достъп до всички функции</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}