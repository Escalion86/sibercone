import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="bg-gray-50 border-t border-gray-100 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* О компании */}
          <div>
            <img
              src="/logo_with_name_horizontal.png"
              alt="Sibercone"
              className="h-10 w-auto mb-4"
            />
            <p className="text-sm text-gray-600 leading-relaxed">
              Магазин реквизита для иллюзионистов. Микромагия, сценические
              иллюзии и ментализм.
            </p>
          </div>

          {/* Навигация */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">
              Навигация
            </h3>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/products"
                  className="text-sm text-gray-600 hover:text-indigo-600 transition-colors"
                >
                  Каталог товаров
                </Link>
              </li>
              <li>
                <Link
                  href="/delivery"
                  className="text-sm text-gray-600 hover:text-indigo-600 transition-colors"
                >
                  Доставка и оплата
                </Link>
              </li>
              <li>
                <Link
                  href="/contacts"
                  className="text-sm text-gray-600 hover:text-indigo-600 transition-colors"
                >
                  Контакты
                </Link>
              </li>
            </ul>
          </div>

          {/* Контакты */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">
              Контакты
            </h3>
            <ul className="space-y-3">
              <li className="text-sm text-gray-600">
                <a
                  href="mailto:info@sibercone.ru"
                  className="hover:text-indigo-600 transition-colors"
                >
                  info@sibercone.ru
                </a>
              </li>
              <li className="text-sm text-gray-600">
                <a
                  href="https://t.me/sibercone"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-indigo-600 transition-colors"
                >
                  Telegram
                </a>
              </li>
              <li className="text-sm text-gray-600">
                <a
                  href="https://vk.com/sibercone"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-indigo-600 transition-colors"
                >
                  ВКонтакте
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-200 mt-8 pt-8">
          <p className="text-center text-sm text-gray-500">
            © {new Date().getFullYear()} Sibercone. Все права защищены.
          </p>
        </div>
      </div>
    </footer>
  )
}
