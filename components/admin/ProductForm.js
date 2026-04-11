'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import ImageUploader from './ImageUploader'
import RichTextEditor from './RichTextEditor'

import SlugLabel from './SlugLabel'

const categories = [
  { value: 'micro', label: 'Микромагия' },
  { value: 'scene', label: 'Сцена' },
  { value: 'mentalism', label: 'Ментализм' },
]

const productTypes = [
  { value: 'equipment', label: 'Реквизит' },
  { value: 'app', label: 'Приложение' },
  { value: 'infoproduct', label: 'Инфопродукт' },
]

export default function ProductForm({ product, isEdit }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [form, setForm] = useState({
    name: product?.name || '',
    slug: product?.slug || '',
    description: product?.description || '',
    shortDescription: product?.shortDescription || '',
    price: product?.price || '',
    categories: product?.categories || [],
    productTypes: product?.productTypes || [],
    images: product?.images || [],
    videoUrl: product?.videoUrl || '',
    inStock: product?.inStock !== false,
    isNewArrival: product?.isNewArrival || false,
  })

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  const generateSlug = (name) => {
    return name
      .toLowerCase()
      .replace(/[^a-zа-яё0-9\s-]/gi, '')
      .replace(/\s+/g, '-')
      .replace(/^-|-$/g, '')
  }

  const handleNameChange = (e) => {
    const name = e.target.value
    setForm((prev) => ({
      ...prev,
      name,
      slug: isEdit ? prev.slug : generateSlug(name),
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const url = isEdit
        ? `/api/admin/products/${product._id}`
        : '/api/admin/products'

      const res = await fetch(url, {
        method: isEdit ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          price: Number(form.price),
        }),
      })

      if (res.ok) {
        router.push('/admin/products')
        router.refresh()
      } else {
        const data = await res.json()
        setError(data.error || 'Ошибка сохранения')
      }
    } catch {
      setError('Ошибка соединения')
    } finally {
      setLoading(false)
    }
  }

  const cloudDirectory = `sibercone/products/${form.slug || 'temp'}`

  return (
    <form onSubmit={handleSubmit} className="max-w-3xl space-y-6">
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
          {error}
        </div>
      )}

      <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-5">
        <h2 className="text-lg font-semibold text-gray-900">
          Основная информация
        </h2>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Название *
          </label>
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleNameChange}
            required
            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>

        <div>
          <SlugLabel />
          <input
            type="text"
            name="slug"
            value={form.slug}
            onChange={handleChange}
            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent font-mono"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Описание
          </label>
          <RichTextEditor
            value={form.description}
            onChange={(description) =>
              setForm((prev) => ({
                ...prev,
                description,
              }))
            }
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Короткое описание (для карточки)
          </label>
          <textarea
            name="shortDescription"
            value={form.shortDescription}
            onChange={handleChange}
            rows={2}
            maxLength={220}
            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-y"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Цена (₽) *
          </label>
          <input
            type="number"
            name="price"
            value={form.price}
            onChange={handleChange}
            required
            min="0"
            step="1"
            className="w-full sm:w-1/2 px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Категории
          </label>
          <div className="flex flex-wrap gap-3 mt-1">
            {categories.map((cat) => (
              <label
                key={cat.value}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl border cursor-pointer transition-colors text-sm ${
                  form.categories.includes(cat.value)
                    ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                    : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
                }`}
              >
                <input
                  type="checkbox"
                  checked={form.categories.includes(cat.value)}
                  onChange={() => {
                    setForm((prev) => ({
                      ...prev,
                      categories: prev.categories.includes(cat.value)
                        ? prev.categories.filter((c) => c !== cat.value)
                        : [...prev.categories, cat.value],
                    }))
                  }}
                  className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                />
                {cat.label}
              </label>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Тип товара
          </label>
          <div className="flex flex-wrap gap-3 mt-1">
            {productTypes.map((pt) => (
              <label
                key={pt.value}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl border cursor-pointer transition-colors text-sm ${
                  form.productTypes.includes(pt.value)
                    ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                    : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
                }`}
              >
                <input
                  type="checkbox"
                  checked={form.productTypes.includes(pt.value)}
                  onChange={() => {
                    setForm((prev) => ({
                      ...prev,
                      productTypes: prev.productTypes.includes(pt.value)
                        ? prev.productTypes.filter((t) => t !== pt.value)
                        : [...prev.productTypes, pt.value],
                    }))
                  }}
                  className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                />
                {pt.label}
              </label>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Ссылка на видео (YouTube / VK)
          </label>
          <input
            type="text"
            name="videoUrl"
            value={form.videoUrl}
            onChange={handleChange}
            placeholder="https://youtube.com/watch?v=..."
            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>

        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            name="inStock"
            id="inStock"
            checked={form.inStock}
            onChange={handleChange}
            className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
          />
          <label
            htmlFor="inStock"
            className="text-sm font-medium text-gray-700"
          >
            В наличии
          </label>
        </div>

        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            name="isNewArrival"
            id="isNewArrival"
            checked={form.isNewArrival}
            onChange={handleChange}
            className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
          />
          <label
            htmlFor="isNewArrival"
            className="text-sm font-medium text-gray-700"
          >
            Новинка
          </label>
        </div>
      </div>

      {/* Фотографии */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
        <h2 className="text-lg font-semibold text-gray-900">Фотографии</h2>
        <ImageUploader
          images={form.images}
          onChange={(images) => setForm((prev) => ({ ...prev, images }))}
          directory={cloudDirectory}
        />
      </div>

      {/* Кнопки */}
      <div className="flex items-center gap-4">
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Сохранение...' : isEdit ? 'Сохранить' : 'Создать товар'}
        </button>
        <button
          type="button"
          onClick={() => router.push('/admin/products')}
          className="px-6 py-2.5 border border-gray-200 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors"
        >
          Отмена
        </button>
      </div>
    </form>
  )
}
