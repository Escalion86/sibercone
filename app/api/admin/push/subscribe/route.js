import { NextResponse } from 'next/server'
import { isAuthenticated } from '@/lib/auth'
import dbConnect from '@/lib/mongodb'
import PushSubscription from '@/models/PushSubscription'

function browserLabel(userAgent) {
  const browser = /Edg\//.test(userAgent)
    ? 'Edge'
    : /Firefox\//.test(userAgent)
      ? 'Firefox'
      : /CriOS|Chrome\//.test(userAgent)
        ? 'Chrome'
        : /Safari\//.test(userAgent)
          ? 'Safari'
          : 'Браузер'
  const os = /iPhone|iPad/.test(userAgent)
    ? 'iOS'
    : /Android/.test(userAgent)
      ? 'Android'
      : /Windows/.test(userAgent)
        ? 'Windows'
        : /Mac OS/.test(userAgent)
          ? 'macOS'
          : /Linux/.test(userAgent)
            ? 'Linux'
            : 'неизвестная ОС'
  return `${browser}, ${os}`
}

export async function POST(request) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: 'Не авторизован' }, { status: 401 })
  }

  try {
    const subscription = await request.json()
    if (
      !subscription?.endpoint ||
      !subscription?.keys?.p256dh ||
      !subscription?.keys?.auth
    ) {
      return NextResponse.json(
        { error: 'Некорректная push-подписка' },
        { status: 400 },
      )
    }

    const userAgent = request.headers.get('user-agent') || ''
    await dbConnect()
    const saved = await PushSubscription.findOneAndUpdate(
      { endpoint: subscription.endpoint },
      {
        $set: {
          keys: subscription.keys,
          label: browserLabel(userAgent),
          userAgent,
          failureCount: 0,
        },
        $setOnInsert: { createdAt: new Date() },
      },
      { upsert: true, new: true, runValidators: true },
    )
    return NextResponse.json({ success: true, id: saved._id.toString() })
  } catch (error) {
    console.error('Ошибка сохранения push-подписки:', error)
    return NextResponse.json(
      { error: 'Не удалось сохранить подписку' },
      { status: 500 },
    )
  }
}
