'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Navbar from '../components/Navbar'

export default function ToolsPage() {
  const router = useRouter()
  const [tools, setTools] = useState<any[]>([])
  const [editTool, setEditTool] = useState<any>(null)
  const [user, setUser] = useState<any>(null)
  const [allCategories, setAllCategories] = useState<any[]>([])
  const [allRoles, setAllRoles] = useState<any[]>([])
  const [selectedCategories, setSelectedCategories] = useState<number[]>([])
  const [selectedRoles, setSelectedRoles] = useState<number[]>([])
  const [toast, setToast] = useState('')
  const [toastType, setToastType] = useState<'success' | 'error'>('success')
  const [filterName, setFilterName] = useState('')
  const [filterRole, setFilterRole] = useState('')
  const [filterCategory, setFilterCategory] = useState('')
  const [filterTag, setFilterTag] = useState('')
  const [hoveredStar, setHoveredStar] = useState<{toolId: number, star: number} | null>(null)

  useEffect(() => {
    const userData = localStorage.getItem('user')
    if (userData) setUser(JSON.parse(userData))
    loadTools()
    const token = localStorage.getItem('token')
    fetch('http://localhost:8000/api/categories', {
      headers: { 'Authorization': `Bearer ${token}` }
    }).then(r => r.json()).then(data => setAllCategories(Array.isArray(data) ? data : []))
    fetch('http://localhost:8000/api/roles', {
      headers: { 'Authorization': `Bearer ${token}` }
    }).then(r => r.json()).then(data => setAllRoles(Array.isArray(data) ? data : []))
  }, [])

  function showToast(msg: string, type: 'success' | 'error' = 'success') {
    setToast(msg)
    setToastType(type)
    setTimeout(() => setToast(''), 3000)
  }

  async function loadTools() {
    const token = localStorage.getItem('token')
    const res = await fetch('http://localhost:8000/api/tools', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    const data = await res.json()
    setTools(Array.isArray(data) ? data : [])
  }

  async function deleteTool(id: number) {
    const token = localStorage.getItem('token')
    const res = await fetch(`http://localhost:8000/api/tools/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    })
    if (res.status === 403) {
      showToast('Нямате право да изтривате инструменти!', 'error')
      return
    }
    showToast('Инструментът е изтрит успешно!')
    loadTools()
  }

  function startEdit(tool: any) {
    setEditTool({...tool})
    setSelectedCategories(tool.categories ? tool.categories.map((c: any) => c.id) : [])
    setSelectedRoles(tool.roles ? tool.roles.map((r: any) => r.id) : [])
  }

  function toggleCategory(id: number) {
    setSelectedCategories(prev =>
      prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
    )
  }

  function toggleRole(id: number) {
    setSelectedRoles(prev =>
      prev.includes(id) ? prev.filter(r => r !== id) : [...prev, id]
    )
  }

  async function saveTool() {
    const token = localStorage.getItem('token')
    const res = await fetch(`http://localhost:8000/api/tools/${editTool.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        ...editTool,
        category_ids: selectedCategories,
        role_ids: selectedRoles
      })
    })
    if (res.status === 403) {
      showToast('Нямате право да редактирате инструменти!', 'error')
      setEditTool(null)
      return
    }
    setEditTool(null)
    showToast('Инструментът е обновен успешно!')
    loadTools()
  }

  function renderStars(tool: any) {
    const avg = tool.ratings_avg_score || 0
    const isHovered = hoveredStar?.toolId === tool.id
    const activeStars = isHovered ? hoveredStar!.star : Math.round(avg)
    return [1, 2, 3, 4, 5].map(star => (
      <span
        key={star}
        onMouseEnter={() => setHoveredStar({ toolId: tool.id, star })}
        onMouseLeave={() => setHoveredStar(null)}
        className={`text-sm cursor-pointer transition-colors ${
          star <= activeStars ? 'text-yellow-400' : 'text-gray-300'
        }`}
      >
        ★
      </span>
    ))
  }

  const filteredTools = tools.filter((tool: any) => {
    const matchName = tool.name?.toLowerCase().includes(filterName.toLowerCase())
    const matchRole = filterRole === '' || tool.role === filterRole
    const matchCategory = filterCategory === '' || (tool.categories && tool.categories.some((c: any) => c.name === filterCategory))
    const matchTag = filterTag === '' || (tool.tags && tool.tags.some((t: any) => t.name.toLowerCase().includes(filterTag.toLowerCase())))
    return matchName && matchRole && matchCategory && matchTag
  })

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100">
      {toast && (
        <div className={`fixed top-4 right-4 text-white px-6 py-3 rounded-xl shadow-lg z-50 ${
          toastType === 'success' ? 'bg-green-500' : 'bg-red-500'
        }`}>
          {toastType === 'success' ? '✅' : '❌'} {toast}
        </div>
      )}

      <Navbar user={user} />

      <div className="max-w-6xl mx-auto px-4 py-10">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">🤖 AI Инструменти</h2>
            <p className="text-gray-500 mt-1 text-sm">Открий и управлявай AI инструментите на екипа</p>
          </div>
          {(user?.role === 'owner' || user?.role === 'backend' || user?.role === 'frontend') && (
            <button
              onClick={() => router.push('/add-tool')}
              className="px-5 py-2.5 rounded-xl text-sm font-medium bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white transition shadow-lg shadow-indigo-200"
            >
              ➕ Добави инструмент
            </button>
          )}
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-sm border border-indigo-100 p-4 mb-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <input
            placeholder="🔍 Търси по име..."
            value={filterName}
            onChange={e => setFilterName(e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
          />
          <select
            value={filterRole}
            onChange={e => setFilterRole(e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
          >
            <option value="">Всички роли</option>
            {allRoles.map((r: any) => (
              <option key={r.id} value={r.name}>{r.name}</option>
            ))}
          </select>
          <select
            value={filterCategory}
            onChange={e => setFilterCategory(e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
          >
            <option value="">Всички категории</option>
            {allCategories.map((c: any) => (
              <option key={c.id} value={c.name}>{c.name}</option>
            ))}
          </select>
          <input
            placeholder="🏷️ Филтър по таг..."
            value={filterTag}
            onChange={e => setFilterTag(e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
          />
        </div>

        {/* Edit Modal */}
        {editTool && (
          <div className="fixed inset-0 bg-black/60 z-50 overflow-y-auto">
            <div className="min-h-screen px-4 py-10 flex items-start justify-center">
              <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 space-y-4">
                <h2 className="text-xl font-bold text-gray-900">✏️ Редактирай инструмент</h2>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Име *</label>
                  <input value={editTool.name || ''} onChange={e => setEditTool({...editTool, name: e.target.value})} className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Линк</label>
                  <input value={editTool.link || ''} onChange={e => setEditTool({...editTool, link: e.target.value})} className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400" placeholder="https://..." />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Документация</label>
                  <input value={editTool.documentation || ''} onChange={e => setEditTool({...editTool, documentation: e.target.value})} className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400" placeholder="https://docs..." />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Описание</label>
                  <textarea value={editTool.description || ''} onChange={e => setEditTool({...editTool, description: e.target.value})} className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400" rows={3} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Как се използва</label>
                  <textarea value={editTool.how_to_use || ''} onChange={e => setEditTool({...editTool, how_to_use: e.target.value})} className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400" rows={3} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Примери</label>
                  <textarea value={editTool.examples || ''} onChange={e => setEditTool({...editTool, examples: e.target.value})} className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400" rows={2} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Видео линк</label>
                  <input value={editTool.video_url || ''} onChange={e => setEditTool({...editTool, video_url: e.target.value})} className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400" placeholder="https://youtube.com/..." />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ниво на трудност</label>
                  <select value={editTool.difficulty || 'beginner'} onChange={e => setEditTool({...editTool, difficulty: e.target.value})} className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400">
                    <option value="beginner">Начинаещ</option>
                    <option value="intermediate">Средно ниво</option>
                    <option value="advanced">Напреднал</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Категории</label>
                  <div className="grid grid-cols-2 gap-2">
                    {allCategories.map((cat: any) => (
                      <label key={cat.id} className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                        <input type="checkbox" checked={selectedCategories.includes(cat.id)} onChange={() => toggleCategory(cat.id)} className="rounded" />
                        {cat.name}
                      </label>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Роли</label>
                  <div className="grid grid-cols-2 gap-2">
                    {allRoles.map((r: any) => (
                      <label key={r.id} className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                        <input type="checkbox" checked={selectedRoles.includes(r.id)} onChange={() => toggleRole(r.id)} className="rounded" />
                        {r.name}
                      </label>
                    ))}
                  </div>
                </div>
                <div className="flex gap-3 pt-2">
                  <button onClick={saveTool} className="flex-1 bg-gradient-to-r from-indigo-500 to-purple-500 text-white py-2.5 rounded-lg text-sm font-medium transition">Запази</button>
                  <button onClick={() => setEditTool(null)} className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2.5 rounded-lg text-sm font-medium transition">Откажи</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tools Grid */}
        {filteredTools.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <div className="text-5xl mb-4">🔍</div>
            <p className="text-lg">Няма намерени инструменти</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTools.map((tool: any) => (
              <div key={tool.id} className="bg-white rounded-2xl shadow-sm border-2 border-indigo-100 hover:border-purple-300 p-6 hover:shadow-xl hover:scale-105 hover:-translate-y-1 transition-all duration-200 flex flex-col">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-3 mb-2">
  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
    {tool.name?.charAt(0).toUpperCase()}
  </div>
  <div className="flex-1">
    <h3
      onClick={() => router.push(`/tools/${tool.id}`)}
      className="text-lg font-semibold text-gray-900 cursor-pointer hover:text-indigo-600 transition leading-tight"
    >
      {tool.name}
    </h3>
    {tool.difficulty && (
      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
        tool.difficulty === 'beginner' ? 'bg-green-100 text-green-700' :
        tool.difficulty === 'intermediate' ? 'bg-yellow-100 text-yellow-700' :
        'bg-red-100 text-red-700'
      }`}>
        {tool.difficulty === 'beginner' ? '🟢 Начинаещ' :
         tool.difficulty === 'intermediate' ? '🟡 Средно' : '🔴 Напреднал'}
      </span>
    )}
  </div>
</div>
                </div>
                <p className="text-sm text-gray-500 mb-3 flex-1">{tool.description}</p>
                {tool.link && (
                  <a href={tool.link} target="_blank" className="text-sm text-indigo-500 hover:text-indigo-700 mb-3 inline-block transition">
                    🔗 Отвори инструмента
                  </a>
                )}
                <div className="flex flex-wrap gap-1 mb-3">
                  {tool.categories && tool.categories.map((c: any) => (
                    <span key={c.id} className="bg-indigo-50 text-indigo-600 text-xs px-2 py-1 rounded-full border border-indigo-100">
                      {c.name}
                    </span>
                  ))}
                </div>
                <div className="flex flex-wrap gap-1 mb-3">
                  {tool.tags && tool.tags.map((t: any) => (
                    <span key={t.id} className="bg-purple-50 text-purple-600 text-xs px-2 py-1 rounded-full border border-purple-100">
                      #{t.name}
                    </span>
                  ))}
                </div>
                <div className="flex items-center justify-between mt-auto pt-3 border-t border-gray-100">
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1">
                      {renderStars(tool)}
                      <span className="text-xs text-gray-400">({tool.ratings_count || 0})</span>
                    </div>
                    <span className="text-xs text-gray-400">💬 {tool.comments_count || 0}</span>
                  </div>
                  <div className="flex gap-2">
                    {(user?.role === 'owner' || user?.role === 'backend' || user?.role === 'frontend') && (
                      <button onClick={() => startEdit(tool)} className="text-sm bg-indigo-500 hover:bg-indigo-600 text-white px-3 py-1.5 rounded-lg transition">
                        ✏️
                      </button>
                    )}
                    {user?.role === 'owner' && (
                      <button onClick={() => deleteTool(tool.id)} className="text-sm bg-red-500 hover:bg-red-600 text-white px-3 py-1.5 rounded-lg transition">
                        🗑️
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}