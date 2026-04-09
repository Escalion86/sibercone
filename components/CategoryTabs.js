'use client'

import { useState } from 'react'

const categories = [
  { key: 'all', label: 'Все' },
  { key: 'micro', label: 'Микромагия' },
  { key: 'scene', label: 'Сцена' },
  { key: 'mentalism', label: 'Ментализм' },
]

export default function CategoryTabs({ active, onChange }) {
  return (
    <div className="flex flex-wrap gap-2">
      {categories.map((cat) => (
        <button
          key={cat.key}
          onClick={() => onChange(cat.key)}
          className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-colors ${
            active === cat.key
              ? 'bg-indigo-600 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          {cat.label}
        </button>
      ))}
    </div>
  )
}
