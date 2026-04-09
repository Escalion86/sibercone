import { NextResponse } from 'next/server'
import { auth } from '@/lib/nextauth'
import dbConnect from '@/lib/mongodb'
import Order from '@/models/Order'
import User from '@/models/User'
import { sendTelegramMessage, formatOrderMessage } from '@/lib/telegram'
import { sendEmail, formatOrderConfirmationEmail } from '@/lib/email'

export async function POST(request) {
  try {
    const body = await request.json()

    const { customerName, phone, address, deliveryMethod, items, total } = body

    // Валидация
    if (
      !customerName ||
      typeof customerName !== 'string' ||
      customerName.trim().length < 2
    ) {
      return NextResponse.json(
        { error: 'Укажите ФИО (минимум 2 символа)' },
        { status: 400 },
      )
    }
    if (!phone || typeof phone !== 'string' || phone.trim().length < 6) {
      return NextResponse.json(
        { error: 'Укажите корректный телефон' },
        { status: 400 },
      )
    }
    if (!address || typeof address !== 'string' || address.trim().length < 5) {
      return NextResponse.json(
        { error: 'Укажите адрес доставки' },
        { status: 400 },
      )
    }
    if (!['cdek', 'pochta', 'pickup'].includes(deliveryMethod)) {
      return NextResponse.json(
        { error: 'Некорректный способ доставки' },
        { status: 400 },
      )
    }
    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'Корзина пуста' }, { status: 400 })
    }
    if (typeof total !== 'number' || total <= 0) {
      return NextResponse.json({ error: 'Некорректная сумма' }, { status: 400 })
    }

    // Sanitize items
    const sanitizedItems = items.map((item) => ({
      productId: item.productId,
      name: String(item.name).slice(0, 200),
      price: Number(item.price),
      quantity: Math.max(1, Math.floor(Number(item.quantity))),
      image: String(item.image || '').slice(0, 500),
    }))

    await dbConnect()

    // Получаем сессию (если пользователь авторизован)
    const session = await auth()

    const order = await Order.create({
      userId: session?.user?.id || null,
      customerName: customerName.trim().slice(0, 200),
      phone: phone.trim().slice(0, 30),
      address: address.trim().slice(0, 500),
      deliveryMethod,
      items: sanitizedItems,
      total,
      status: 'new',
    })

    // Отправка в Telegram (не блокируем ответ при ошибке)
    try {
      await sendTelegramMessage(formatOrderMessage(order))
    } catch (tgErr) {
      console.error('Telegram notification failed:', tgErr.message)
    }

    // Email подтверждение (если пользователь авторизован)
    if (session?.user?.id) {
      try {
        const user = await User.findById(session.user.id, { email: 1 }).lean()
        if (user?.email) {
          await sendEmail({
            to: user.email,
            subject: `Заказ оформлен — Sibercone`,
            html: formatOrderConfirmationEmail(order),
          })
        }
      } catch (emailErr) {
        console.error('Order email failed:', emailErr.message)
      }
    }

    return NextResponse.json({ success: true, orderId: order._id.toString() })
  } catch (error) {
    console.error('Order creation error:', error)
    return NextResponse.json(
      { error: 'Ошибка оформления заказа' },
      { status: 500 },
    )
  }
}
