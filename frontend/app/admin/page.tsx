'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Navbar from '../components/Navbar'

type User = {
  id: number
  name: string
  email: string
  role: 'owner' | 'backend' | 'frontend' | 'designer' | 'qa' | 'pm'
}

type Category = {
  id: number
  name: string
}

type Role = {
  id: number
  name: string
}

type Tool = {
  id: number
  name: string
  status: 'pending' | 'approved' | 'rejected'
  categories?: Category[]
  roles?: Role[]
}

type Log = {
  id: number
  action: 'create' | 'update' | 'delete' | 'approve' | 'reject'
  created_at: string
  user?: { name: string }
  data?: { name: string }
}

export default function AdminPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [tools, setTools] = useState<Tool[]>([])
  const [logs, setLogs] = useState<Log[]>([])
  const [activeTab, setActiveTab] = useState<'tools' | 'logs'>('tools')
  const [filterStatus, setFilterStatus] = useState('')
  const [filterCategory, setFilterCategory] = useState('')
  const [filterRole, setFilterRole] = useState('')
  const [toast, setToast] = useState('')
  const [allCategories, setAllCategories] = useState<Category[]>([])
  const [allRoles, setAllRoles] = useState<Role[]>([])

  useEffect(() => {
    const userData = localStorage.getItem('user')
    if (!userData) { router.push('/login'); return }
    const parsed: User = JSON.parse(userData)
    if (parsed.role !== 'owner') { router.push('/dashboard'); return }
    setUser(parsed)
    loadData()
  }, [])

  async function loadData() {
    const token = localStorage.getItem('token')
    const headers = { 'Authorization': `Bearer ${token}` }

    fetch('http://localhost:8000/api/admin/tools', { headers })
      .then(r => r.json())
      .then(data => setTools(Array.isArray(data) ? data : []))

    fetch('http://localhost:8000/api/admin/logs', { headers })
      .then(r => r.json())
      .then(data => setLogs(Array.isArray(data) ? data : []))

    fetch('http://localhost:8000/api/categories', { headers })
      .then(r => r.json())
      .then(data => setAllCategories(Array.isArray(data) ? data : []))

    fetch('http://localhost:8000/api/roles', { headers })
      .then(r => r.json())
      .then(data => setAllRoles(Array.isArray(data) ? data : []))
  }

  function showToast(msg: string) {
    setToast(msg)
    setTimeout(() => setToast(''), 3000)
  }

  async function approveTool(id: number) {
    const token = localStorage.getItem('token')
    await fetch(`http://localhost:8000/api/admin/tools/${id}/approve`, {
      method: 'PUT',
      headers: { 'Authorization': `Bearer ${token}` }
    })
    showToast('Инструментът е одобрен!')
    loadData()
  }

  async function rejectTool(id: number) {
    const token = localStorage.getItem('token')
    await fetch(`http://localhost:8000/api/admin/tools/${id}/reject`, {
      method: 'PUT',
      headers: { 'Authorization': `Bearer ${token}` }
    })
    showToast('Инструментът е отказан!')
    loadData()
  }

  const filteredTools = tools.filter(tool => {
    const matchStatus = filterStatus === '' || tool.status === filterStatus
    const matchCategory = filterCategory === '' || (tool.categories && tool.categories.some(c => c.name === filterCategory))
    const matchRole = filterRole === '' || (tool.roles && tool.roles.some(r => r.name === filterRole))
    return matchStatus && matchCategory && matchRole
  })

  if (!user) return null

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100">
      {toast && (
        <div className="fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-xl shadow-lg z-50">
          ✅ {toast}
        </div>
      )}

      <Navbar user={user} />

      <div className="max-w-6xl mx-auto px-4 py-10">
        <h2 className="text-2xl font-bold text-gray-900 mb-8">👑 Админ панел</h2>

        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab('tools')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              activeTab === 'tools' ? 'bg-black text-white' : 'bg-white text-gray-600 border border-gray-200'
            }`}
          >
            🛠️ Инструменти ({tools.length})
          </button>
          <button
            onClick={() => setActiveTab('logs')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              activeTab === 'logs' ? 'bg-black text-white' : 'bg-white text-gray-600 border border-gray-200'
            }`}
          >
            📋 Одит лог ({logs.length})
          </button>
        </div>

        {activeTab === 'tools' && (
          <>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 mb-6 grid grid-cols-1 sm:grid-cols-3 gap-3">
              <select
                value={filterStatus}
                onChange={e => setFilterStatus(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
              >
                <option value="">Всички статуси</option>
                <option value="pending">Чакащи</option>
                <option value="approved">Одобрени</option>
                <option value="rejected">Отказани</option>
              </select>
              <select
                value={filterCategory}
                onChange={e => setFilterCategory(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
              >
                <option value="">Всички категории</option>
                {allCategories.map(c => (
                  <option key={c.id} value={c.name}>{c.name}</option>
                ))}
              </select>
              <select
                value={filterRole}
                onChange={e => setFilterRole(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
              >
                <option value="">Всички роли</option>
                {allRoles.map(r => (
                  <option key={r.id} value={r.name}>{r.name}</option>
                ))}
              </select>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left px-4 py-3 text-gray-600 font-medium">Инструмент</th>
                    <th className="text-left px-4 py-3 text-gray-600 font-medium">Категории</th>
                    <th className="text-left px-4 py-3 text-gray-600 font-medium">Роли</th>
                    <th className="text-left px-4 py-3 text-gray-600 font-medium">Статус</th>
                    <th className="text-left px-4 py-3 text-gray-600 font-medium">Действия</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTools.map(tool => (
                    <tr key={tool.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium text-gray-900">{tool.name}</td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1">
                          {tool.categories && tool.categories.map(c => (
                            <span key={c.id} className="bg-blue-50 text-blue-600 text-xs px-2 py-0.5 rounded-full">{c.name}</span>
                          ))}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1">
                          {tool.roles && tool.roles.map(r => (
                            <span key={r.id} className="bg-purple-50 text-purple-600 text-xs px-2 py-0.5 rounded-full">{r.name}</span>
                          ))}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                          tool.status === 'approved' ? 'bg-green-100 text-green-700' :
                          tool.status === 'rejected' ? 'bg-red-100 text-red-700' :
                          'bg-yellow-100 text-yellow-700'
                        }`}>
                          {tool.status === 'approved' ? '✅ Одобрен' :
                           tool.status === 'rejected' ? '❌ Отказан' : '⏳ Чакащ'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          {tool.status !== 'approved' && (
                            <button
                              onClick={() => approveTool(tool.id)}
                              className="bg-green-500 hover:bg-green-600 text-white text-xs px-3 py-1.5 rounded-lg transition"
                            >
                              Одобри
                            </button>
                          )}
                          {tool.status !== 'rejected' && (
                            <button
                              onClick={() => rejectTool(tool.id)}
                              className="bg-red-500 hover:bg-red-600 text-white text-xs px-3 py-1.5 rounded-lg transition"
                            >
                              Откажи
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {activeTab === 'logs' && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-4 py-3 text-gray-600 font-medium">Потребител</th>
                  <th className="text-left px-4 py-3 text-gray-600 font-medium">Действие</th>
                  <th className="text-left px-4 py-3 text-gray-600 font-medium">Инструмент</th>
                  <th className="text-left px-4 py-3 text-gray-600 font-medium">Дата</th>
                </tr>
              </thead>
              <tbody>
                {logs.map(log => (
                  <tr key={log.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-900">{log.user?.name}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                        log.action === 'create' ? 'bg-green-100 text-green-700' :
                        log.action === 'update' ? 'bg-blue-100 text-blue-700' :
                        log.action === 'delete' ? 'bg-red-100 text-red-700' :
                        log.action === 'approve' ? 'bg-purple-100 text-purple-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {log.action === 'create' ? '➕ Добавен' :
                         log.action === 'update' ? '✏️ Редактиран' :
                         log.action === 'delete' ? '🗑️ Изтрит' :
                         log.action === 'approve' ? '✅ Одобрен' :
                         '❌ Отказан'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{log.data?.name}</td>
                    <td className="px-4 py-3 text-gray-400">{new Date(log.created_at).toLocaleString('bg-BG')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
