'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

export default function SFIPage() {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchEvents() {
      try {
        const res = await fetch('/api/events')
        const data = await res.json()
        setEvents(Array.isArray(data) ? data : [])
      } catch {
        setEvents([])
      }
      setLoading(false)
    }
    fetchEvents()
  }, [])

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Сибирский Форум Иллюзионистов
        </h1>
        <p className="mt-2 text-gray-600">
          Мероприятия, встречи и события для профессиональных иллюзионистов
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
        </div>
      ) : events.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-gray-500 text-lg">Событий пока нет</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event) => (
            <Link
              key={event._id}
              href={`/sfi/${event.slug}`}
              className="group bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-lg transition-shadow"
            >
              {event.image ? (
                <div className="aspect-video bg-gray-100 overflow-hidden">
                  <img
                    src={event.image}
                    alt={event.title}
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
                      d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5"
                    />
                  </svg>
                </div>
              )}
              <div className="p-5">
                <div className="flex items-center gap-2 text-sm text-indigo-600 mb-2">
                  <span>{formatDate(event.date)}</span>
                  {event.location && (
                    <>
                      <span>·</span>
                      <span className="text-gray-500">{event.location}</span>
                    </>
                  )}
                </div>
                <h2 className="text-lg font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors">
                  {event.title}
                </h2>
                {event.description && (
                  <p className="mt-2 text-sm text-gray-600 line-clamp-2">
                    {event.description}
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
