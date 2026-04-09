import { NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import User from '@/models/User'
import Product from '@/models/Product'
import { isAuthenticated } from '@/lib/auth'
import { sendEmail, formatNewProductEmail } from '@/lib/email'

export async function POST(request) {
  if (!isAuthenticated(request)) {
    return NextResponse.json({ error: 'Не авторизован' }, { status: 401 })
  }

  try {
    const { productId } = await request.json()
    if (!productId) {
      return NextResponse.json(
        { error: 'productId обязателен' },
        { status: 400 },
      )
    }

    await dbConnect()

    const product = await Product.findById(productId).lean()
    if (!product) {
      return NextResponse.json(
        { error: 'Товар не найден' },
        { status: 404 },
      )
    }

    const subscribers = await User.find(
      { subscribedToNews: true },
      { email: 1 },
    ).lean()

    if (subscribers.length === 0) {
      return NextResponse.json({ sent: 0, message: 'Нет подписчиков' })
    }

    const html = formatNewProductEmail(product)
    let sent = 0
    let failed = 0

    for (const subscriber of subscribers) {
      try {
        await sendEmail({
          to: subscriber.email,
          subject: `Новинка: ${product.name} — Sibercone`,
          html,
        })
        sent++
      } catch (err) {
        console.error(`Failed to send to ${subscriber.email}:`, err.message)
        failed++
      }
    }

    return NextResponse.json({ sent, failed, total: subscribers.length })
  } catch (error) {
    console.error('Notify error:', error)
    return NextResponse.json({ error: 'Ошибка отправки' }, { status: 500 })
  }
}
