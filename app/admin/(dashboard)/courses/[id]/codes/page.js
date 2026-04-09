'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'

export default function CourseCodesPage() {
  const { id } = useParams()
  const [codes, setCodes] = useState([])
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [count, setCount] = useState(5)
  const [courseName, setCourseName] = useState('')

  useEffect(() => {
    fetchData()
  }, [id])

  async function fetchData() {
    try {
      const [codesRes, courseRes] = await Promise.all([
        fetch(`/api/admin/courses/${id}/codes`),
        fetch(`/api/admin/courses/${id}`),
      ])
      const codesData = await codesRes.json()
      const courseData = await courseRes.json()
      setCodes(Array.isArray(codesData) ? codesData : [])
      setCourseName(courseData.title || '')
    } catch {
      setCodes([])
    }
    setLoading(false)
  }

  async function handleGenerate() {
    setGenerating(true)
    try {
      const res = await fetch(`/api/admin/courses/${id}/codes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ count }),
      })
      if (res.ok) {
        const newCodes = await res.json()
        setCodes((prev) => [...newCodes, ...prev])
      }
    } catch {
      alert('Ошибка генерации')
    }
    setGenerating(false)
  }

  function copyCode(code) {
    navigator.clipboard.writeText(code)
  }

  const unusedCodes = codes.filter((c) => !c.used)
  const usedCodes = codes.filter((c) => c.used)

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Link
          href="/admin/courses"
          className="text-sm text-gray-500 hover:text-indigo-600"
        >
          ← Курсы
        </Link>
        <span className="text-gray-300">/</span>
        <h1 className="text-2xl font-bold text-gray-900">
          Коды доступа: {courseName}
        </h1>
      </div>

      {/* Генерация кодов */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Генерация новых кодов
        </h2>
        <div className="flex items-center gap-4">
          <div>
            <label className="block text-sm text-gray-600 mb-1">
              Количество
            </label>
            <input
              type="number"
              value={count}
              onChange={(e) =>
                setCount(Math.min(100, Math.max(1, Number(e.target.value))))
              }
              min="1"
              max="100"
              className="w-24 px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <button
            onClick={handleGenerate}
            disabled={generating}
            className="mt-5 px-6 py-2 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50"
          >
            {generating ? 'Генерация...' : 'Сгенерировать'}
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
        </div>
      ) : (
        <div className="space-y-6">
          {/* Неиспользованные коды */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Свободные коды ({unusedCodes.length})
            </h2>
            {unusedCodes.length === 0 ? (
              <p className="text-gray-500 text-sm">Нет свободных кодов</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                {unusedCodes.map((c) => (
                  <div
                    key={c._id}
                    className="flex items-center justify-between px-4 py-2 bg-green-50 rounded-lg"
                  >
                    <code className="text-sm font-mono text-green-800">
                      {c.code}
                    </code>
                    <button
                      onClick={() => copyCode(c.code)}
                      className="text-xs text-green-600 hover:underline"
                    >
                      Копировать
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Использованные коды */}
          {usedCodes.length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Использованные коды ({usedCodes.length})
              </h2>
              <div className="space-y-2">
                {usedCodes.map((c) => (
                  <div
                    key={c._id}
                    className="flex items-center justify-between px-4 py-2 bg-gray-50 rounded-lg"
                  >
                    <code className="text-sm font-mono text-gray-500">
                      {c.code}
                    </code>
                    <span className="text-xs text-gray-500">
                      {c.userId?.name || c.userId?.email || 'Пользователь'} —{' '}
                      {new Date(c.usedAt).toLocaleDateString('ru-RU')}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
