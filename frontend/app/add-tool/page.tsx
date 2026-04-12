'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Navbar from '../components/Navbar'

export default function AddToolPage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [link, setLink] = useState('')
  const [description, setDescription] = useState('')
  const [howToUse, setHowToUse] = useState('')
  const [examples, setExamples] = useState('')
  const [documentation, setDocumentation] = useState('')
  const [selectedCategories, setSelectedCategories] = useState<number[]>([])
  const [selectedRoles, setSelectedRoles] = useState<number[]>([])
  const [videoUrl, setVideoUrl] = useState('')
  const [difficulty, setDifficulty] = useState('beginner')
  const [tags, setTags] = useState('')
  const [screenshots, setScreenshots] = useState('')
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState<'success' | 'error'>('success')
  const [categories, setCategories] = useState<any[]>([])
  const [roles, setRoles] = useState<any[]>([])
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    const userData = localStorage.getItem('user')
    if (!userData) { router.push('/login'); return }
    setUser(JSON.parse(userData))
    const token = localStorage.getItem('token')
    if (!token) { router.push('/login'); return }
    fetch('http://localhost:8000/api/categories', {
      headers: { 'Authorization': `Bearer ${token}` }
    }).then(r => r.json()).then(data => setCategories(Array.isArray(data) ? data : []))
    fetch('http://localhost:8000/api/roles', {
      headers: { 'Authorization': `Bearer ${token}` }
    }).then(r => r.json()).then(data => setRoles(Array.isArray(data) ? data : []))
  }, [])

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

  async function handleSubmit() {
    if (!name.trim()) {
      setMessage('Грешка: Името на инструмента е задължително!')
      setMessageType('error')
      return
    }
    if (link && !link.startsWith('http')) {
      setMessage('Грешка: Линкът трябва да започва с http:// или https://')
      setMessageType('error')
      return
    }
    if (documentation && !documentation.startsWith('http')) {
      setMessage('Грешка: Документацията трябва да започва с http:// или https://')
      setMessageType('error')
      return
    }
    if (videoUrl && !videoUrl.startsWith('http')) {
      setMessage('Грешка: Видео линкът трябва да започва с http:// или https://')
      setMessageType('error')
      return
    }

    const token = localStorage.getItem('token')
    const tagsArray = tags.split(',').map(t => t.trim()).filter(t => t !== '')
    const res = await fetch('http://localhost:8000/api/tools', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        name,
        link,
        description,
        how_to_use: howToUse,
        examples,
        documentation,
        video_url: videoUrl,
        difficulty,
        category_ids: selectedCategories,
        role_ids: selectedRoles,
        tags: tagsArray,
        screenshots
      })
    })

    if (res.ok) {
      setMessage('Инструментът е запазен успешно!')
      setMessageType('success')
      setName('')
      setLink('')
      setDescription('')
      setHowToUse('')
      setExamples('')
      setDocumentation('')
      setVideoUrl('')
      setSelectedCategories([])
      setSelectedRoles([])
      setTags('')
      setScreenshots('')
    } else {
      setMessage('Грешка при запазване!')
      setMessageType('error')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100">
      <Navbar user={user} />

      <div className="max-w-2xl mx-auto px-4 py-10">
        <h2 className="text-2xl font-bold text-gray-900 mb-8">➕ Добави AI инструмент</h2>

        {message && (
          <div className={`border rounded-lg px-4 py-3 text-sm mb-6 ${
            messageType === 'success'
              ? 'bg-green-50 border-green-200 text-green-600'
              : 'bg-red-50 border-red-200 text-red-600'
          }`}>
            {message}
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Име на инструмента *</label>
            <input
              placeholder="пр. ChatGPT"
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-black"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Линк към инструмента</label>
            <input
              placeholder="https://..."
              value={link}
              onChange={e => setLink(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-black"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Официална документация (линк)</label>
            <input
              placeholder="https://docs..."
              value={documentation}
              onChange={e => setDocumentation(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-black"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Описание</label>
            <textarea
              placeholder="Кратко описание на инструмента..."
              value={description}
              onChange={e => setDescription(e.target.value)}
              rows={3}
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-black"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Как се използва</label>
            <textarea
              placeholder="Стъпки за използване..."
              value={howToUse}
              onChange={e => setHowToUse(e.target.value)}
              rows={3}
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-black"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Реални примери (опционално)</label>
            <textarea
              placeholder="Примери за употреба..."
              value={examples}
              onChange={e => setExamples(e.target.value)}
              rows={3}
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-black"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Линк към видео ресурс</label>
            <input
              placeholder="https://youtube.com/..."
              value={videoUrl}
              onChange={e => setVideoUrl(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-black"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Ниво на трудност</label>
            <select
              value={difficulty}
              onChange={e => setDifficulty(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-black"
            >
              <option value="beginner">Начинаещ</option>
              <option value="intermediate">Средно ниво</option>
              <option value="advanced">Напреднал</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Категории</label>
            <div className="grid grid-cols-2 gap-2">
              {categories.length === 0 ? (
                <p className="text-sm text-gray-400 col-span-2">Зареждане...</p>
              ) : (
                categories.map((cat: any) => (
                  <label key={cat.id} className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedCategories.includes(cat.id)}
                      onChange={() => toggleCategory(cat.id)}
                      className="rounded"
                    />
                    {cat.name}
                  </label>
                ))
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Препоръчителни роли</label>
            <div className="grid grid-cols-2 gap-2">
              {roles.length === 0 ? (
                <p className="text-sm text-gray-400 col-span-2">Зареждане...</p>
              ) : (
                roles.map((r: any) => (
                  <label key={r.id} className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedRoles.includes(r.id)}
                      onChange={() => toggleRole(r.id)}
                      className="rounded"
                    />
                    {r.name}
                  </label>
                ))
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Тагове (разделени със запетая)</label>
            <input
              placeholder="пр. AI, NLP, chatbot"
              value={tags}
              onChange={e => setTags(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-black"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Линкове към скрийншоти (разделени със запетая)</label>
            <input
              placeholder="https://example.com/img1.png, https://example.com/img2.png"
              value={screenshots}
              onChange={e => setScreenshots(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-black"
            />
          </div>

          <button
            onClick={handleSubmit}
            className="w-full bg-black hover:bg-gray-800 text-white font-medium py-2.5 rounded-lg transition"
          >
            Запази инструмент
          </button>
          <button
            onClick={() => router.push('/dashboard')}
            className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2.5 rounded-lg transition"
          >
            Назад
          </button>
        </div>
      </div>
    </div>
  )
}