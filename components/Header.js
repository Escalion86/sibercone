'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSession } from 'next-auth/react'
import CartIcon from './CartIcon'
import MobileMenu from './MobileMenu'

const links = [
  { href: '/', label: 'Главная' },
  { href: '/products', label: 'Товары' },
  { href: '/new-arrivals', label: 'Новинки' },
  { href: '/courses', label: 'Обучение' },
  { href: '/sfi', label: 'СФИ' },
  { href: '/delivery', label: 'Доставка и оплата' },
  { href: '/contacts', label: 'Контакты' },
]

function UserIcon() {
  const { data: session } = useSession()

  return (
    <Link
      href={session ? '/account' : '/auth/login'}
      className="p-2 text-gray-600 hover:text-indigo-600 transition-colors"
      title={session ? 'Личный кабинет' : 'Войти'}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
        className="w-6 h-6"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z"
        />
      </svg>
    </Link>
  )
}

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false)
  const pathname = usePathname()

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Бургер (мобильный) */}
            <button
              onClick={() => setMenuOpen(true)}
              className="lg:hidden p-2 text-gray-700 hover:text-indigo-600"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-6 h-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
                />
              </svg>
            </button>

            {/* Логотип */}
            <Link
              href="/"
              className="text-2xl font-bold text-gray-900 tracking-tight"
            >
              Sibercone
            </Link>

            {/* Десктопная навигация */}
            <nav className="hidden lg:flex items-center space-x-1">
              {links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    pathname === link.href
                      ? 'bg-indigo-50 text-indigo-600'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* Корзина + Аккаунт */}
            <div className="flex items-center space-x-2">
              <UserIcon />
              <CartIcon />
            </div>
          </div>
        </div>
      </header>
      <MobileMenu isOpen={menuOpen} onClose={() => setMenuOpen(false)} />
    </>
  )
}
