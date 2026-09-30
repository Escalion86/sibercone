import { NextResponse } from 'next/server'
import { isAuthenticated } from '@/lib/auth'
import dbConnect from '@/lib/mongodb'
import PushSubscription from '@/models/PushSubscription'

export async function POST(request) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: 'Не авторизован' }, { status: 401 })
  }
  try {
    const { endpoint } = await request.json()
    if (!endpoint) {
      return NextResponse.json({ error: 'endpoint обязателен' }, { status: 400 })
    }
    await dbConnect()
    await PushSubscription.deleteOne({ endpoint })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Ошибка отключения push-подписки:', error)
    return NextResponse.json({ error: 'Ошибка отключения' }, { status: 500 })
  }
}
