import { NextResponse } from 'next/server'
import { isAuthenticated } from '@/lib/auth'
import dbConnect from '@/lib/mongodb'
import TelegramSubscriber from '@/models/TelegramSubscriber'

export async function GET() {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: 'Не авторизован' }, { status: 401 })
  }
  try {
    await dbConnect()
    const subscribers = await TelegramSubscriber.find({ enabled: true })
      .sort({ linkedAt: -1 })
      .select('chatId username firstName linkedAt')
      .lean()
    return NextResponse.json({
      count: subscribers.length,
      subscribers,
      botUsername: process.env.TELEGRAM_BOT_USERNAME || null,
    })
  } catch (error) {
    console.error('Ошибка статуса Telegram:', error)
    return NextResponse.json({ error: 'Не удалось загрузить чаты' }, { status: 500 })
  }
}
