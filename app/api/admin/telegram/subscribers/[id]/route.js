import { NextResponse } from 'next/server'
import { isAuthenticated } from '@/lib/auth'
import dbConnect from '@/lib/mongodb'
import TelegramSubscriber from '@/models/TelegramSubscriber'

export async function DELETE(request, { params }) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: 'Не авторизован' }, { status: 401 })
  }
  try {
    const { id } = await params
    await dbConnect()
    const subscriber = await TelegramSubscriber.findByIdAndUpdate(
      id,
      { enabled: false },
      { new: true },
    )
    if (!subscriber) {
      return NextResponse.json({ error: 'Чат не найден' }, { status: 404 })
    }
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Ошибка отключения Telegram-чата:', error)
    return NextResponse.json({ error: 'Ошибка отключения' }, { status: 500 })
  }
}
