'use client'

import { useState, useEffect } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
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

export default function AccountPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [tab, setTab] = useState('orders')
  const [orders, setOrders] = useState([])
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [profileForm, setProfileForm] = useState({
    name: '',
    phone: '',
    subscribedToNews: true,
  })

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login?callbackUrl=/account')
    }
  }, [status, router])

  useEffect(() => {
    if (status === 'authenticated') {
      fetchData()
    }
  }, [status])

  const fetchData = async () => {
    setLoading(true)
    try {
      const [ordersRes, profileRes] = await Promise.all([
        fetch('/api/account/orders'),
        fetch('/api/account/profile'),
      ])
      if (ordersRes.ok) setOrders(await ordersRes.json())
      if (profileRes.ok) {
        const p = await profileRes.json()
        setProfile(p)
        setProfileForm({
          name: p.name,
          phone: p.phone || '',
          subscribedToNews: p.subscribedToNews !== false,
        })
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleSaveProfile = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const res = await fetch('/api/account/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profileForm),
      })
      if (res.ok) {
        const updated = await res.json()
        setProfile(updated)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setSaving(false)
    }
  }

  if (status === 'loading' || loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="text-center text-gray-400">Загрузка...</div>
      </div>
    )
  }

  if (status === 'unauthenticated') return null

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Личный кабинет</h1>
          <p className="text-sm text-gray-500 mt-1">{session?.user?.email}</p>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: '/' })}
          className="px-4 py-2 text-sm text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
        >
          Выйти
        </button>
      </div>

      {/* Табы */}
      <div className="flex gap-1 mb-6 bg-gray-100 p-1 rounded-xl w-fit">
        <button
          onClick={() => setTab('orders')}
          className={`px-5 py-2 rounded-lg text-sm font-medium transition-colors ${
            tab === 'orders'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Мои заказы
        </button>
        <button
          onClick={() => setTab('profile')}
          className={`px-5 py-2 rounded-lg text-sm font-medium transition-colors ${
            tab === 'profile'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Профиль
        </button>
      </div>

      {/* Заказы */}
      {tab === 'orders' && (
        <div>
          {orders.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
              <p className="text-gray-500 mb-4">У вас пока нет заказов</p>
              <Link
                href="/products"
                className="text-indigo-600 text-sm font-medium hover:text-indigo-700"
              >
                Перейти в каталог
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <div
                  key={order._id}
                  className="bg-white rounded-2xl border border-gray-100 p-6"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <span className="text-sm text-gray-500">
                        {new Date(order.createdAt).toLocaleDateString('ru-RU', {
                          day: '2-digit',
                          month: 'long',
                          year: 'numeric',
                        })}
                      </span>
                      <span className="mx-2 text-gray-300">•</span>
                      <span className="text-sm text-gray-500">
                        {deliveryLabels[order.deliveryMethod] ||
                          order.deliveryMethod}
                      </span>
                    </div>
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        statusColors[order.status] ||
                        'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {statusLabels[order.status] || order.status}
                    </span>
                  </div>

                  <div className="space-y-2 mb-4">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                          {item.image ? (
                            <Image
                              src={item.image}
                              alt={item.name}
                              width={40}
                              height={40}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-300 text-xs">
                              —
                            </div>
                          )}
                        </div>
                        <span className="text-sm text-gray-900 flex-1">
                          {item.name}
                        </span>
                        <span className="text-sm text-gray-500">
                          {item.quantity} ×{' '}
                          {item.price?.toLocaleString('ru-RU')} ₽
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="border-t border-gray-100 pt-3 flex justify-between">
                    <span className="text-sm font-medium text-gray-700">
                      Итого
                    </span>
                    <span className="text-sm font-bold text-gray-900">
                      {order.total?.toLocaleString('ru-RU')} ₽
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Профиль */}
      {tab === 'profile' && profile && (
        <div className="bg-white rounded-2xl border border-gray-100 p-6 max-w-lg">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Настройки профиля
          </h2>
          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Имя
              </label>
              <input
                type="text"
                value={profileForm.name}
                onChange={(e) =>
                  setProfileForm((p) => ({ ...p, name: e.target.value }))
                }
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                value={profile.email}
                disabled
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-gray-50 text-gray-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Телефон
              </label>
              <input
                type="tel"
                value={profileForm.phone}
                onChange={(e) =>
                  setProfileForm((p) => ({ ...p, phone: e.target.value }))
                }
                placeholder="+7 (999) 123-45-67"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>

            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="subscribedToNews"
                checked={profileForm.subscribedToNews}
                onChange={(e) =>
                  setProfileForm((p) => ({
                    ...p,
                    subscribedToNews: e.target.checked,
                  }))
                }
                className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
              />
              <label
                htmlFor="subscribedToNews"
                className="text-sm text-gray-700"
              >
                Получать уведомления о новых товарах
              </label>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50"
            >
              {saving ? 'Сохранение...' : 'Сохранить'}
            </button>
          </form>
        </div>
      )}
    </div>
  )
}
