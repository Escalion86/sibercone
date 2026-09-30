import { NextResponse } from 'next/server'
import { isAuthenticated } from '@/lib/auth'
import dbConnect from '@/lib/mongodb'
import PushSubscription from '@/models/PushSubscription'

export async function GET() {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: 'Не авторизован' }, { status: 401 })
  }

  try {
    await dbConnect()
    const subscriptions = await PushSubscription.find()
      .sort({ createdAt: -1 })
      .select('label createdAt lastSuccessAt failureCount endpoint')
      .lean()
    return NextResponse.json({
      publicKey: process.env.VAPID_PUBLIC_KEY || null,
      enabled: Boolean(
        process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY,
      ),
      count: subscriptions.length,
      subscriptions,
    })
  } catch (error) {
    console.error('Ошибка статуса Web Push:', error)
    return NextResponse.json(
      { error: 'Не удалось загрузить устройства' },
      { status: 500 },
    )
  }
}
