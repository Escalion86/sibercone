'use client'

import { useState, useRef } from 'react'
import Image from 'next/image'

export default function ImageUploader({ images, onChange, directory }) {
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef(null)

  const handleUpload = async (e) => {
    const files = Array.from(e.target.files)
    if (files.length === 0) return

    setUploading(true)
    const newImages = [...images]

    try {
      const formData = new FormData()
      files.forEach((file) => formData.append('files', file))
      formData.append('directory', directory)

      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData,
      })

      if (res.ok) {
        const data = await res.json()
        if (data.urls && Array.isArray(data.urls) && data.urls.length > 0) {
          newImages.push(...data.urls)
        }
      }
    } catch (err) {
      console.error('Upload error:', err)
    }

    onChange(newImages)
    setUploading(false)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleRemove = (index) => {
    const updated = images.filter((_, i) => i !== index)
    onChange(updated)
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
    const files = e.dataTransfer.files
    if (files.length > 0) {
      const input = fileInputRef.current
      const dataTransfer = new DataTransfer()
      for (const file of files) {
        dataTransfer.items.add(file)
      }
      input.files = dataTransfer.files
      handleUpload({ target: input })
    }
  }

  return (
    <div className="space-y-4">
      {/* Превью загруженных */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {images.map((url, index) => (
            <div
              key={index}
              className="relative group aspect-square rounded-xl overflow-hidden border border-gray-200"
            >
              <Image
                src={url}
                alt={`Фото ${index + 1}`}
                fill
                className="object-cover"
                sizes="150px"
              />
              <button
                type="button"
                onClick={() => handleRemove(index)}
                className="absolute top-2 right-2 w-7 h-7 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-sm"
              >
                ×
              </button>
              {index === 0 && (
                <span className="absolute bottom-2 left-2 bg-indigo-600 text-white text-xs px-2 py-0.5 rounded-full">
                  Главная
                </span>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Зона загрузки */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center cursor-pointer hover:border-gray-300 transition-colors"
      >
        {uploading ? (
          <div className="text-sm text-gray-500">Загрузка...</div>
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
                d="M12 16.5V9.75m0 0 3 3m-3-3-3 3M6.75 19.5a4.5 4.5 0 0 1-1.41-8.775 5.25 5.25 0 0 1 10.233-2.33 3 3 0 0 1 3.758 3.848A3.752 3.752 0 0 1 18 19.5H6.75Z"
              />
            </svg>
            <p className="text-sm text-gray-500">
              Перетащите фото сюда или{' '}
              <span className="text-indigo-600">выберите файлы</span>
            </p>
          </>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleUpload}
          className="hidden"
        />
      </div>
    </div>
  )
}
