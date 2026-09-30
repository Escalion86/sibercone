import { NextResponse } from 'next/server'
import { isAuthenticated } from '@/lib/auth'
import { notifyAdmins } from '@/lib/notifyAdmins'

export async function POST() {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: 'Не авторизован' }, { status: 401 })
  }
  const summary = await notifyAdmins({
    event: 'test',
    title: 'Тестовое уведомление Sibercone',
    body: 'Уведомления администраторов настроены и работают.',
    telegramText: '✅ <b>Тестовое уведомление Sibercone</b>\n\nУведомления администраторов настроены и работают.',
    url: '/admin/notifications',
  })
  return NextResponse.json(summary)
}
