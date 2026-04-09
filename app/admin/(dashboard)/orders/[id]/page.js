'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Image from 'next/image'

const statusLabels = {
  new: 'Новый',
  processing: 'В обработке',
  done: 'Выполнен',
  cancelled: 'Отменён',
}

const statusColors = {
  new: 'bg-blue-50 text-blue-700',
  processing: 'bg-yellow-50 text-yellow-700',
  done: 'bg-green-50 text-green-700',
  cancelled: 'bg-gray-100 text-gray-600',
}

const deliveryLabels = {
  cdek: 'СДЭК',
  pochta: 'Почта России',
  pickup: 'Самовывоз',
}

export default function OrderDetailPage() {
  const { id } = useParams()
  const router = useRouter()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)

  useEffect(() => {
    async function fetchOrder() {
      try {
        const res = await fetch(`/api/admin/orders/${id}`)
        if (res.ok) {
          const data = await res.json()
          setOrder(data)
        }
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchOrder()
  }, [id])

  const handleStatusChange = async (newStatus) => {
    setUpdating(true)
    try {
      const res = await fetch(`/api/admin/orders/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })
      if (res.ok) {
        const data = await res.json()
        setOrder(data)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setUpdating(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-400">Загрузка...</div>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="p-8 text-center">
        <p className="text-red-600">Заказ не найден</p>
      </div>
    )
  }

  return (
    <div className="max-w-3xl">
      <button
        onClick={() => router.push('/admin/orders')}
        className="text-sm text-gray-500 hover:text-gray-700 mb-4 flex items-center gap-1"
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
        Назад к заказам
      </button>

      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          Заказ от {new Date(order.createdAt).toLocaleDateString('ru-RU')}
        </h1>
        <span
          className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
            statusColors[order.status]
          }`}
        >
          {statusLabels[order.status]}
        </span>
      </div>

      {/* Информация о клиенте */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Клиент</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-500">ФИО:</span>
            <p className="font-medium text-gray-900">{order.customerName}</p>
          </div>
          <div>
            <span className="text-gray-500">Телефон:</span>
            <p className="font-medium text-gray-900">{order.phone}</p>
          </div>
          <div className="sm:col-span-2">
            <span className="text-gray-500">Адрес:</span>
            <p className="font-medium text-gray-900">{order.address}</p>
          </div>
          <div>
            <span className="text-gray-500">Доставка:</span>
            <p className="font-medium text-gray-900">
              {deliveryLabels[order.deliveryMethod] || order.deliveryMethod}
            </p>
          </div>
        </div>
      </div>

      {/* Товары */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Товары</h2>
        <div className="space-y-3">
          {order.items.map((item, index) => (
            <div
              key={index}
              className="flex items-center gap-4 p-3 rounded-xl bg-gray-50"
            >
              <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-200 flex-shrink-0">
                {item.image ? (
                  <Image
                    src={item.image}
                    alt={item.name}
                    width={48}
                    height={48}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                    —
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {item.name}
                </p>
                <p className="text-xs text-gray-500">
                  {item.price?.toLocaleString('ru-RU')} ₽ × {item.quantity}
                </p>
              </div>
              <div className="text-sm font-medium text-gray-900">
                {(item.price * item.quantity).toLocaleString('ru-RU')} ₽
              </div>
            </div>
          ))}
        </div>
        <div className="border-t border-gray-200 mt-4 pt-4 flex justify-between">
          <span className="text-base font-semibold text-gray-900">Итого:</span>
          <span className="text-base font-bold text-gray-900">
            {order.total?.toLocaleString('ru-RU')} ₽
          </span>
        </div>
      </div>

      {/* Изменение статуса */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Изменить статус
        </h2>
        <div className="flex flex-wrap gap-2">
          {Object.entries(statusLabels).map(([value, label]) => (
            <button
              key={value}
              onClick={() => handleStatusChange(value)}
              disabled={updating || order.status === value}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors disabled:opacity-50 ${
                order.status === value
                  ? 'bg-indigo-600 text-white'
                  : 'border border-gray-200 text-gray-700 hover:bg-gray-50'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
