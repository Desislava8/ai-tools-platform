
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function Navbar({ user }: { user: any }) {
  const router = useRouter()
  const [menuOpen, setMenuOpen] = useState(false)

  function logout() {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    router.push('/login')
  }

  const navLinks = [
    { label: '🛠️ Инструменти', href: '/tools', roles: ['owner', 'backend', 'frontend', 'designer', 'qa', 'pm'] },
    { label: '➕ Добави инструмент', href: '/add-tool', roles: ['owner', 'backend', 'frontend'] },
    { label: '👑 Админ панел', href: '/admin', roles: ['owner'] },
    { label: '👤 Профил', href: '/profile', roles: ['owner', 'backend', 'frontend', 'designer', 'qa', 'pm'] },
  ]

  const visibleLinks = navLinks.filter(link => link.roles.includes(user?.role))

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
        <h1
          onClick={() => router.push('/dashboard')}
          className="text-xl font-bold text-gray-900 cursor-pointer hover:text-gray-700 transition"
        >
          🤖 AI Tools Platform
        </h1>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-4">
          {visibleLinks.map(link => (
            <button
              key={link.href}
              onClick={() => router.push(link.href)}
              className="text-sm text-gray-600 hover:text-black transition font-medium"
            >
              {link.label}
            </button>
          ))}
          <span className="text-sm text-gray-400">|</span>
          <span className="text-sm text-gray-500">
            {user?.name} · <span className="font-medium text-gray-700">{user?.role}</span>
          </span>
          <button
            onClick={logout}
            className="text-sm bg-red-500 hover:bg-red-600 text-white px-3 py-1.5 rounded-lg transition"
          >
            Изход
          </button>
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="md:hidden text-gray-600 hover:text-black transition text-xl"
        >
          {menuOpen ? '✕' : '☰'}
        </button>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden bg-white border-t border-gray-200 px-4 py-3 space-y-2">
          {visibleLinks.map(link => (
            <button
              key={link.href}
              onClick={() => { router.push(link.href); setMenuOpen(false) }}
              className="block w-full text-left text-sm text-gray-700 hover:text-black py-2 border-b border-gray-100 transition"
            >
              {link.label}
            </button>
          ))}
          <div className="pt-2 flex justify-between items-center">
            <span className="text-sm text-gray-500">{user?.name} · {user?.role}</span>
            <button
              onClick={logout}
              className="text-sm bg-red-500 hover:bg-red-600 text-white px-3 py-1.5 rounded-lg transition"
            >
              Изход
            </button>
          </div>
        </div>
      )}
    </nav>
  )
}