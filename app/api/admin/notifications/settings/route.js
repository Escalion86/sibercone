import { NextResponse } from 'next/server'
import { isAuthenticated } from '@/lib/auth'
import dbConnect from '@/lib/mongodb'
import NotificationSettings, {
  DEFAULT_NOTIFICATION_SETTINGS,
} from '@/models/NotificationSettings'

export async function GET() {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: 'Не авторизован' }, { status: 401 })
  }
  try {
    await dbConnect()
    const settings = await NotificationSettings.findOneAndUpdate(
      { key: 'admin' },
      { $setOnInsert: DEFAULT_NOTIFICATION_SETTINGS },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    ).lean()
    return NextResponse.json(settings)
  } catch (error) {
    console.error('Ошибка загрузки настроек уведомлений:', error)
    return NextResponse.json({ error: 'Ошибка загрузки настроек' }, { status: 500 })
  }
}

export async function PATCH(request) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: 'Не авторизован' }, { status: 401 })
  }
  try {
    const body = await request.json()
    const update = {}
    for (const key of ['newOrder', 'newUser', 'codeRedeemed']) {
      if (typeof body[key] === 'boolean') update[key] = body[key]
    }
    await dbConnect()
    const settings = await NotificationSettings.findOneAndUpdate(
      { key: 'admin' },
      { $set: update, $setOnInsert: { key: 'admin' } },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    ).lean()
    return NextResponse.json(settings)
  } catch (error) {
    console.error('Ошибка сохранения настроек уведомлений:', error)
    return NextResponse.json({ error: 'Ошибка сохранения настроек' }, { status: 500 })
  }
}
