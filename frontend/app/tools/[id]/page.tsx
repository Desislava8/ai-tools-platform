'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Navbar from '../../components/Navbar'

type User = {
  id: number
  name: string
  role: 'owner' | 'backend' | 'frontend' | 'designer' | 'qa' | 'pm'
  email: string
}

type Category = {
  id: number
  name: string
}

type Tool = {
  id: number
  name: string
  link?: string
  description?: string
  categories?: Category[]
}

type Comment = {
  id: number
  content: string
  created_at: string
  user?: {
    id: number
    name: string
  }
}

type Ratings = {
  average: number
  count: number
}

export default function ToolDetailPage() {
  const router = useRouter()
  const params = useParams()
  const toolId = params.id
  const [user, setUser] = useState<User | null>(null)
  const [tool, setTool] = useState<Tool | null>(null)
  const [comments, setComments] = useState<Comment[]>([])
  const [ratings, setRatings] = useState<Ratings>({ average: 0, count: 0 })
  const [newComment, setNewComment] = useState('')
  const [userRating, setUserRating] = useState(0)
  const [toast, setToast] = useState('')

  useEffect(() => {
    const userData = localStorage.getItem('user')
    if (!userData) { router.push('/login'); return }
    setUser(JSON.parse(userData))
    loadAll()
  }, [])

  function showToast(msg: string) {
    setToast(msg)
    setTimeout(() => setToast(''), 3000)
  }

  async function loadAll() {
    const token = localStorage.getItem('token')
    const headers = { 'Authorization': `Bearer ${token}` }

    const toolRes = await fetch(`http://localhost:8000/api/tools`, { headers })
    const tools: Tool[] = await toolRes.json()
    const found = tools.find(t => t.id === Number(toolId))
    setTool(found || null)

    fetch(`http://localhost:8000/api/tools/${toolId}/comments`, { headers })
      .then(r => r.json())
      .then(data => setComments(Array.isArray(data) ? data : []))

    fetch(`http://localhost:8000/api/tools/${toolId}/ratings`, { headers })
      .then(r => r.json())
      .then(data => setRatings(data))
  }

  async function submitComment() {
    if (!newComment.trim()) return
    const token = localStorage.getItem('token')
    const res = await fetch(`http://localhost:8000/api/tools/${toolId}/comments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ content: newComment })
    })
    if (res.ok) {
      setNewComment('')
      showToast('Коментарът е добавен!')
      loadAll()
    }
  }

  async function submitRating(score: number) {
    const token = localStorage.getItem('token')
    const res = await fetch(`http://localhost:8000/api/tools/${toolId}/ratings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ score })
    })
    if (res.ok) {
      setUserRating(score)
      showToast('Рейтингът е запазен!')
      loadAll()
    }
  }

  async function deleteComment(id: number) {
    const token = localStorage.getItem('token')
    await fetch(`http://localhost:8000/api/comments/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    })
    showToast('Коментарът е изтрит!')
    loadAll()
  }

  if (!tool) return (
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

      <Navbar user={user!} />

      <div className="max-w-3xl mx-auto px-4 py-10">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">{tool.name}</h1>
          <p className="text-gray-500 mb-4">{tool.description}</p>

          {tool.link && (
            <a href={tool.link} target="_blank" className="text-blue-600 hover:underline text-sm">
              🔗 Отвори инструмента
            </a>
          )}

          <div className="flex flex-wrap gap-1 mt-4">
            {tool.categories && tool.categories.map(c => (
              <span key={c.id} className="bg-blue-50 text-blue-600 text-xs px-2 py-1 rounded-full">{c.name}</span>
            ))}
          </div>

          <div className="mt-6 pt-6 border-t border-gray-100">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Рейтинг</h3>
            <div className="flex items-center gap-2 mb-3">
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map(star => (
                  <span
                    key={star}
                    onClick={() => submitRating(star)}
                    className={`text-2xl cursor-pointer transition ${
                      star <= (userRating || ratings.average) ? 'text-yellow-400' : 'text-gray-300'
                    }`}
                  >
                    ★
                  </span>
                ))}
              </div>
              <span className="text-sm text-gray-500">
                {ratings.average} / 5 ({ratings.count} гласа)
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">💬 Коментари ({comments.length})</h3>

          <div className="mb-4">
            <textarea
              value={newComment}
              onChange={e => setNewComment(e.target.value)}
              placeholder="Напиши коментар..."
              rows={3}
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-black mb-2"
            />
            <button
              onClick={submitComment}
              className="bg-black hover:bg-gray-800 text-white text-sm px-4 py-2 rounded-lg transition"
            >
              Добави коментар
            </button>
          </div>

          <div className="space-y-4">
            {comments.length === 0 && (
              <p className="text-gray-400 text-sm">Няма коментари все още.</p>
            )}
            {comments.map(comment => (
              <div key={comment.id} className="border-b border-gray-100 pb-4">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-sm font-medium text-gray-900">{comment.user?.name}</span>
                    <span className="text-xs text-gray-400 ml-2">
                      {new Date(comment.created_at).toLocaleString('bg-BG')}
                    </span>
                  </div>
                  {(user?.role === 'owner' || comment.user?.id === user?.id) && (
                    <button
                      onClick={() => deleteComment(comment.id)}
                      className="text-red-400 hover:text-red-600 text-xs transition"
                    >
                      Изтрий
                    </button>
                  )}
                </div>
                <p className="text-sm text-gray-600 mt-1">{comment.content}</p>
              </div>
            ))}
          </div>
        </div>

        <button
          onClick={() => router.push('/tools')}
          className="mt-6 text-sm text-gray-600 hover:text-black transition"
        >
          ← Назад към инструментите
        </button>
      </div>
    </div>
  )
}
