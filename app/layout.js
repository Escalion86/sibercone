import { Inter } from 'next/font/google'
import './globals.css'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { CartProvider } from '@/context/CartContext'
import AuthProvider from '@/components/AuthProvider'

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin', 'cyrillic'],
})

export const metadata = {
  title: 'Sibercone — Магазин реквизита для иллюзионистов',
  description:
    'Интернет-магазин реквизита для фокусников. Микромагия, сценические иллюзии и ментализм.',
  icons: {
    icon: '/logo.png',
    apple: '/logo.png',
  },
}

export default function RootLayout({ children }) {
  return (
    <html lang="ru" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-sans bg-white text-gray-900">
        <AuthProvider>
          <CartProvider>
            <Header />
            <main className="flex-1">{children}</main>
            <Footer />
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
