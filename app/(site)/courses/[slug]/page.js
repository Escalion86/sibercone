'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { useSession } from 'next-auth/react'
import Link from 'next/link'

export default function CoursePage() {
  const { slug } = useParams()
  const { data: session } = useSession()
  const [course, setCourse] = useState(null)
  const [loading, setLoading] = useState(true)
  const [code, setCode] = useState('')
  const [redeemError, setRedeemError] = useState('')
  const [redeemSuccess, setRedeemSuccess] = useState('')
  const [redeeming, setRedeeming] = useState(false)

  useEffect(() => {
    fetchCourse()
  }, [slug])

  async function fetchCourse() {
    try {
      const res = await fetch(`/api/courses/${slug}`)
      if (res.ok) {
        setCourse(await res.json())
      }
    } catch {
      // ignore
    }
    setLoading(false)
  }

  async function handleRedeem(e) {
    e.preventDefault()
    setRedeemError('')
    setRedeemSuccess('')
    setRedeeming(true)

    try {
      const res = await fetch('/api/account/redeem-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: code.trim() }),
      })
      const data = await res.json()

      if (res.ok) {
        setRedeemSuccess('Код активирован! Доступ открыт.')
        setCode('')
        fetchCourse()
      } else {
        setRedeemError(data.error || 'Ошибка активации')
      }
    } catch {
      setRedeemError('Ошибка соединения')
    } finally {
      setRedeeming(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
      </div>
    )
  }

  if (!course) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Курс не найден
        </h1>
        <Link href="/courses" className="text-indigo-600 hover:underline">
          Все курсы
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <Link
        href="/courses"
        className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-indigo-600 mb-6"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="w-4 h-4"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15.75 19.5 8.25 12l7.5-7.5"
          />
        </svg>
        Все курсы
      </Link>

      <h1 className="text-3xl font-bold text-gray-900 mb-4">{course.title}</h1>

      {course.description && (
        <p className="text-gray-600 text-lg mb-8">{course.description}</p>
      )}

      {course.hasAccess ? (
        /* Полный контент курса */
        <div className="space-y-8">
          {course.videoUrl && (
            <div className="rounded-2xl overflow-hidden bg-black aspect-video">
              <iframe
                src={course.videoUrl.replace('watch?v=', 'embed/')}
                className="w-full h-full"
                allowFullScreen
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              />
            </div>
          )}

          {course.images?.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {course.images.map((img, i) => (
                <img
                  key={i}
                  src={img}
                  alt={`${course.title} — ${i + 1}`}
                  className="rounded-xl w-full object-cover"
                />
              ))}
            </div>
          )}

          {course.content && (
            <div className="prose prose-gray max-w-none bg-white rounded-2xl border border-gray-100 p-8">
              {course.content.split('\n').map((paragraph, i) => (
                <p key={i}>{paragraph}</p>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* Заблокированный контент */
        <div className="space-y-6">
          {course.images?.[0] && (
            <div className="rounded-2xl overflow-hidden">
              <img
                src={course.images[0]}
                alt={course.title}
                className="w-full max-h-80 object-cover"
              />
            </div>
          )}

          <div className="bg-gray-50 rounded-2xl border border-gray-200 p-8 text-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-12 h-12 text-gray-400 mx-auto mb-4"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z"
              />
            </svg>

            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Доступ ограничен
            </h2>
            <p className="text-gray-600 mb-6">
              Для доступа к материалам курса введите код активации
            </p>

            {course.price > 0 && (
              <p className="text-2xl font-bold text-gray-900 mb-6">
                {course.price.toLocaleString('ru-RU')} ₽
              </p>
            )}

            {session ? (
              <form
                onSubmit={handleRedeem}
                className="max-w-md mx-auto space-y-4"
              >
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="Введите код доступа (SC-...)"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-center text-lg tracking-widest focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
                {redeemError && (
                  <p className="text-sm text-red-600">{redeemError}</p>
                )}
                {redeemSuccess && (
                  <p className="text-sm text-green-600">{redeemSuccess}</p>
                )}
                <button
                  type="submit"
                  disabled={redeeming || !code.trim()}
                  className="w-full px-6 py-3 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50"
                >
                  {redeeming ? 'Проверка...' : 'Активировать код'}
                </button>
              </form>
            ) : (
              <div>
                <p className="text-sm text-gray-500 mb-4">
                  Для активации кода необходимо войти в аккаунт
                </p>
                <Link
                  href="/auth/login"
                  className="inline-block px-6 py-3 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-colors"
                >
                  Войти
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
