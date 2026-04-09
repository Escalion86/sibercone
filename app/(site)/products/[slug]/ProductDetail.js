'use client'

import Link from 'next/link'
import ProductGallery from '@/components/ProductGallery'
import VideoEmbed from '@/components/VideoEmbed'
import { useCart } from '@/context/CartContext'

const categoryLabels = {
  micro: 'Микромагия',
  scene: 'Сцена',
  mentalism: 'Ментализм',
}

const productTypeLabels = {
  equipment: 'Реквизит',
  app: 'Приложение',
  infoproduct: 'Инфопродукт',
}

export default function ProductDetail({ product }) {
  const { addItem } = useCart()

  const handleAdd = () => {
    if (!product.inStock) return
    addItem({
      productId: product._id,
      name: product.name,
      price: product.price,
      image: product.images?.[0] || '',
      slug: product.slug,
    })
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Хлебные крошки */}
      <nav className="flex items-center gap-2 text-sm text-gray-500 mb-8">
        <Link href="/" className="hover:text-indigo-600 transition-colors">
          Главная
        </Link>
        <span>/</span>
        <Link
          href="/products"
          className="hover:text-indigo-600 transition-colors"
        >
          Товары
        </Link>
        <span>/</span>
        <span className="text-gray-900 truncate">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
        {/* Галерея */}
        <ProductGallery images={product.images} name={product.name} />

        {/* Информация */}
        <div className="flex flex-col">
          <div className="flex flex-wrap gap-2 mb-4">
            {(product.categories || []).map((cat) => (
              <span
                key={cat}
                className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-indigo-50 text-indigo-600"
              >
                {categoryLabels[cat] || cat}
              </span>
            ))}
            {(product.productTypes || []).map((pt) => (
              <span
                key={pt}
                className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-50 text-purple-600"
              >
                {productTypeLabels[pt] || pt}
              </span>
            ))}
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
            {product.name}
          </h1>

          <div className="flex items-center gap-4 mb-6">
            <span className="text-3xl font-bold text-gray-900">
              {product.price.toLocaleString('ru-RU')} ₽
            </span>
            <span
              className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                product.inStock
                  ? 'bg-green-50 text-green-700'
                  : 'bg-red-50 text-red-700'
              }`}
            >
              {product.inStock ? 'В наличии' : 'Нет в наличии'}
            </span>
          </div>

          <button
            onClick={handleAdd}
            disabled={!product.inStock}
            className={`w-full sm:w-auto px-8 py-3.5 rounded-xl text-sm font-medium transition-colors mb-8 ${
              product.inStock
                ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                : 'bg-gray-200 text-gray-500 cursor-not-allowed'
            }`}
          >
            {product.inStock ? 'Добавить в корзину' : 'Нет в наличии'}
          </button>

          {product.description && (
            <div className="prose prose-gray max-w-none">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Описание
              </h3>
              <div className="text-gray-600 leading-relaxed whitespace-pre-line">
                {product.description}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Видео */}
      {product.videoUrl && (
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Видео</h2>
          <div className="max-w-3xl">
            <VideoEmbed url={product.videoUrl} />
          </div>
        </div>
      )}
    </div>
  )
}
