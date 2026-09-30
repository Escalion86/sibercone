import crypto from 'crypto'
import { NextResponse } from 'next/server'
import { isAuthenticated } from '@/lib/auth'
import dbConnect from '@/lib/mongodb'
import TelegramLinkCode from '@/models/TelegramLinkCode'

export async function POST() {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: 'Не авторизован' }, { status: 401 })
  }
  if (!process.env.TELEGRAM_BOT_USERNAME) {
    return NextResponse.json(
      { error: 'TELEGRAM_BOT_USERNAME не настроен' },
      { status: 503 },
    )
  }
  try {
    await dbConnect()
    const code = crypto.randomBytes(6).toString('hex')
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000)
    await TelegramLinkCode.create({ code, expiresAt })
    return NextResponse.json({
      code,
      expiresAt,
      url: `https://t.me/${process.env.TELEGRAM_BOT_USERNAME}?start=${code}`,
    })
  } catch (error) {
    console.error('Ошибка создания кода Telegram:', error)
    return NextResponse.json({ error: 'Не удалось создать ссылку' }, { status: 500 })
  }
}
