'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

export default function AdminCoursesPage() {
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchCourses()
  }, [])

  async function fetchCourses() {
    try {
      const res = await fetch('/api/admin/courses')
      const data = await res.json()
      setCourses(Array.isArray(data) ? data : [])
    } catch {
      setCourses([])
    }
    setLoading(false)
  }

  async function handleDelete(id) {
    if (!confirm('Удалить курс?')) return
    try {
      await fetch(`/api/admin/courses/${id}`, { method: 'DELETE' })
      setCourses((prev) => prev.filter((c) => c._id !== id))
    } catch {
      alert('Ошибка удаления')
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Курсы</h1>
        <Link
          href="/admin/courses/new"
          className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700 transition-colors"
        >
          Добавить курс
        </Link>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
        </div>
      ) : courses.length === 0 ? (
        <div className="text-center py-20 text-gray-500">Курсов пока нет</div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">
                  Название
                </th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">
                  Цена
                </th>
                <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase">
                  Действия
                </th>
              </tr>
            </thead>
            <tbody>
              {courses.map((course) => (
                <tr key={course._id} className="border-b border-gray-50">
                  <td className="px-6 py-4">
                    <span className="text-sm font-medium text-gray-900">
                      {course.title}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {course.price > 0
                      ? `${course.price.toLocaleString('ru-RU')} ₽`
                      : 'Бесплатно'}
                  </td>
                  <td className="px-6 py-4 text-right space-x-3">
                    <Link
                      href={`/admin/courses/${course._id}/codes`}
                      className="text-sm text-green-600 hover:underline"
                    >
                      Коды
                    </Link>
                    <Link
                      href={`/admin/courses/${course._id}/edit`}
                      className="text-sm text-indigo-600 hover:underline"
                    >
                      Редактировать
                    </Link>
                    <button
                      onClick={() => handleDelete(course._id)}
                      className="text-sm text-red-600 hover:underline"
                    >
                      Удалить
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
