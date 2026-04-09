'use client'

import { useState, useEffect, useCallback } from 'react'
import ProductCard from '@/components/ProductCard'

const categories = [
  { key: 'all', label: 'Все' },
  { key: 'micro', label: 'Микромагия' },
  { key: 'scene', label: 'Сцена' },
  { key: 'mentalism', label: 'Ментализм' },
]

const productTypes = [
  { key: 'all', label: 'Все' },
  { key: 'equipment', label: 'Реквизит' },
  { key: 'app', label: 'Приложение' },
  { key: 'infoproduct', label: 'Инфопродукт' },
]

const sortOptions = [
  { key: 'newest', label: 'Сначала новые' },
  { key: 'price_asc', label: 'Цена: по возрастанию' },
  { key: 'price_desc', label: 'Цена: по убыванию' },
  { key: 'name', label: 'По названию' },
]

export default function ProductsPage() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('all')
  const [type, setType] = useState('all')
  const [sort, setSort] = useState('newest')
  const [inStockOnly, setInStockOnly] = useState(false)
  const [filtersOpen, setFiltersOpen] = useState(false)

  const fetchProducts = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (category !== 'all') params.set('category', category)
      if (type !== 'all') params.set('type', type)
      if (search.trim()) params.set('search', search.trim())
      if (sort !== 'newest') params.set('sort', sort)
      if (inStockOnly) params.set('inStock', '1')

      const url = `/api/products${params.toString() ? '?' + params : ''}`
      const res = await fetch(url)
      const data = await res.json()
      setProducts(Array.isArray(data) ? data : [])
    } catch {
      setProducts([])
    }
    setLoading(false)
  }, [category, type, search, sort, inStockOnly])

  useEffect(() => {
    const timeout = setTimeout(fetchProducts, search ? 300 : 0)
    return () => clearTimeout(timeout)
  }, [fetchProducts])

  const activeFiltersCount =
    (category !== 'all' ? 1 : 0) +
    (type !== 'all' ? 1 : 0) +
    (inStockOnly ? 1 : 0)

  const resetFilters = () => {
    setCategory('all')
    setType('all')
    setSort('newest')
    setInStockOnly(false)
    setSearch('')
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <div className="flex flex-col gap-6 mb-8">
        {/* Заголовок и поиск */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h1 className="text-3xl font-bold text-gray-900">Каталог товаров</h1>
          <div className="relative w-full sm:w-80">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
              />
            </svg>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Поиск товаров..."
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
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
                    d="M6 18 18 6M6 6l12 12"
                  />
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* Кнопка фильтров (мобильная) и сортировка */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setFiltersOpen(!filtersOpen)}
            className={`sm:hidden inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border transition-colors ${
              activeFiltersCount > 0
                ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                : 'border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}
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
                d="M10.5 6h9.75M10.5 6a1.5 1.5 0 1 1-3 0m3 0a1.5 1.5 0 1 0-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-9.75 0h9.75"
              />
            </svg>
            Фильтры
            {activeFiltersCount > 0 && (
              <span className="w-5 h-5 rounded-full bg-indigo-600 text-white text-xs flex items-center justify-center">
                {activeFiltersCount}
              </span>
            )}
          </button>

          {/* Фильтры (десктоп — всегда видны, мобильные — по кнопке) */}
          <div
            className={`w-full sm:w-auto sm:flex flex-wrap items-center gap-3 ${filtersOpen ? 'flex' : 'hidden sm:flex'}`}
          >
            {/* Категории */}
            <div className="flex flex-wrap gap-1.5">
              {categories.map((cat) => (
                <button
                  key={cat.key}
                  onClick={() => setCategory(cat.key)}
                  className={`px-3.5 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    category === cat.key
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            <div className="hidden sm:block w-px h-6 bg-gray-200" />

            {/* Типы */}
            <div className="flex flex-wrap gap-1.5">
              {productTypes.map((pt) => (
                <button
                  key={pt.key}
                  onClick={() => setType(pt.key)}
                  className={`px-3.5 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    type === pt.key
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {pt.label}
                </button>
              ))}
            </div>

            <div className="hidden sm:block w-px h-6 bg-gray-200" />

            {/* В наличии */}
            <label className="flex items-center gap-2 cursor-pointer text-sm text-gray-600">
              <input
                type="checkbox"
                checked={inStockOnly}
                onChange={(e) => setInStockOnly(e.target.checked)}
                className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
              />
              В наличии
            </label>
          </div>

          {/* Сортировка */}
          <div className="ml-auto">
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm bg-white text-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {sortOptions.map((opt) => (
                <option key={opt.key} value={opt.key}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Сброс */}
          {activeFiltersCount > 0 && (
            <button
              onClick={resetFilters}
              className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
            >
              Сбросить
            </button>
          )}
        </div>
      </div>

      {/* Результаты */}
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-gray-500 text-lg">Товары не найдены</p>
          {activeFiltersCount > 0 && (
            <button
              onClick={resetFilters}
              className="mt-4 text-sm text-indigo-600 hover:text-indigo-700 font-medium"
            >
              Сбросить фильтры
            </button>
          )}
        </div>
      ) : (
        <>
          <p className="text-sm text-gray-500 mb-4">
            {products.length}{' '}
            {products.length === 1
              ? 'товар'
              : products.length < 5
                ? 'товара'
                : 'товаров'}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        </>
      )}
    </div>
  )
}
