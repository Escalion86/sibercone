'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { toPlainText } from '@/lib/richText'

export default function CoursesPage() {
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchCourses() {
      try {
        const res = await fetch('/api/courses')
        const data = await res.json()
        setCourses(Array.isArray(data) ? data : [])
      } catch {
        setCourses([])
      }
      setLoading(false)
    }
    fetchCourses()
  }, [])

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Обучение</h1>
        <p className="mt-2 text-gray-600">
          Профессиональные курсы и обучающие материалы по иллюзионному искусству
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
        </div>
      ) : courses.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-gray-500 text-lg">Курсов пока нет</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => (
            <Link
              key={course._id}
              href={`/courses/${course.slug}`}
              className="group bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-lg transition-shadow"
            >
              {course.images?.[0] ? (
                <div className="aspect-video bg-gray-100 overflow-hidden">
                  <img
                    src={course.images[0]}
                    alt={course.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
              ) : (
                <div className="aspect-video bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1}
                    stroke="currentColor"
                    className="w-12 h-12 text-indigo-300"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M4.26 10.147a60.438 60.438 0 0 0-.491 6.347A48.62 48.62 0 0 1 12 20.904a48.62 48.62 0 0 1 8.232-4.41 60.46 60.46 0 0 0-.491-6.347m-15.482 0a50.636 50.636 0 0 0-2.658-.813A59.906 59.906 0 0 1 12 3.493a59.903 59.903 0 0 1 10.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0 1 12 13.489a50.702 50.702 0 0 1 7.74-3.342"
                    />
                  </svg>
                </div>
              )}
              <div className="p-5">
                <h2 className="text-lg font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors">
                  {course.title}
                </h2>
                {course.description && (
                  <p className="mt-2 text-sm text-gray-600 line-clamp-2">
                    {toPlainText(course.description)}
                  </p>
                )}
                {course.price > 0 && (
                  <p className="mt-3 text-lg font-bold text-gray-900">
                    {course.price.toLocaleString('ru-RU')} ₽
                  </p>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
