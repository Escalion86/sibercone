'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { toSafeHtml } from '@/lib/richText'

export default function EventPage() {
  const { slug } = useParams()
  const [event, setEvent] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchEvent() {
      try {
        const res = await fetch(`/api/events/${slug}`)
        if (res.ok) {
          setEvent(await res.json())
        }
      } catch {
        // ignore
      }
      setLoading(false)
    }
    fetchEvent()
  }, [slug])

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
      </div>
    )
  }

  if (!event) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Событие не найдено
        </h1>
        <Link href="/sfi" className="text-indigo-600 hover:underline">
          Вернуться к списку
        </Link>
      </div>
    )
  }

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      weekday: 'long',
    })
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <Link
        href="/sfi"
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
        Все события
      </Link>

      {event.image && (
        <div className="rounded-2xl overflow-hidden mb-6">
          <img
            src={event.image}
            alt={event.title}
            className="w-full max-h-96 object-cover"
          />
        </div>
      )}

      <div className="flex items-center gap-3 text-sm text-indigo-600 mb-4">
        <span>{formatDate(event.date)}</span>
        {event.location && (
          <>
            <span className="text-gray-300">·</span>
            <span className="text-gray-600">{event.location}</span>
          </>
        )}
      </div>

      <h1 className="text-3xl font-bold text-gray-900 mb-6">{event.title}</h1>

      {event.description && (
        <div
          className="prose prose-gray max-w-none"
          dangerouslySetInnerHTML={{
            __html: toSafeHtml(event.description),
          }}
        />
      )}
    </div>
  )
}
