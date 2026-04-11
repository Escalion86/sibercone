'use client'

import { useRef, useState } from 'react'
import VideoEmbed from '@/components/VideoEmbed'

export default function VideoUploader({ videoUrl, onChange, directory }) {
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef(null)

  const handleUpload = async (e) => {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return

    setUploading(true)

    try {
      const formData = new FormData()
      formData.append('files', files[0])
      formData.append('directory', directory)

      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData,
      })

      if (res.ok) {
        const data = await res.json()
        const uploadedUrl =
          Array.isArray(data.urls) && data.urls.length > 0 ? data.urls[0] : ''
        if (uploadedUrl) {
          onChange(uploadedUrl)
        }
      }
    } catch (err) {
      console.error('Video upload error:', err)
    }

    setUploading(false)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    e.currentTarget.classList.add('border-indigo-400', 'bg-indigo-50')
  }

  const handleDragLeave = (e) => {
    e.preventDefault()
    e.currentTarget.classList.remove('border-indigo-400', 'bg-indigo-50')
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.currentTarget.classList.remove('border-indigo-400', 'bg-indigo-50')

    const files = Array.from(e.dataTransfer.files || [])
    if (files.length === 0) return

    const input = fileInputRef.current
    if (!input) return

    const dataTransfer = new DataTransfer()
    dataTransfer.items.add(files[0])
    input.files = dataTransfer.files
    handleUpload({ target: input })
  }

  return (
    <div className="space-y-4">
      {videoUrl && (
        <div className="relative rounded-xl overflow-hidden border border-gray-200 bg-black/5 p-3">
          <VideoEmbed url={videoUrl} />
          <button
            type="button"
            onClick={() => onChange('')}
            className="absolute top-5 right-5 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center text-base"
            title="Удалить видео"
          >
            ×
          </button>
        </div>
      )}

      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center cursor-pointer hover:border-gray-300 transition-colors"
      >
        {uploading ? (
          <div className="text-sm text-gray-500">Загрузка видео...</div>
        ) : (
          <>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1}
              stroke="currentColor"
              className="w-10 h-10 mx-auto text-gray-300 mb-3"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="m3.75 7.5 4.5 3m0 0 4.5-3m-4.5 3v8.25m0-8.25a3 3 0 1 0-6 0v8.25a3 3 0 0 0 6 0m0-8.25a3 3 0 1 1 6 0v5.25m0 0 3-2.25m-3 2.25 3 2.25"
              />
            </svg>
            <p className="text-sm text-gray-500">
              Перетащите видео сюда или{' '}
              <span className="text-indigo-600">выберите файл</span>
            </p>
          </>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="video/*"
          onChange={handleUpload}
          className="hidden"
        />
      </div>
    </div>
  )
}
