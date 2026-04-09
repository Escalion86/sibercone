import { NextResponse } from 'next/server'
import { auth } from '@/lib/nextauth'
import dbConnect from '@/lib/mongodb'
import User from '@/models/User'

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  await dbConnect()
  const user = await User.findById(session.user.id)
    .select('-password')
    .lean()

  if (!user) {
    return NextResponse.json({ error: 'Пользователь не найден' }, { status: 404 })
  }

  return NextResponse.json(user)
}

export async function PUT(request) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    await dbConnect()
    const { name, phone, subscribedToNews } = await request.json()

    const user = await User.findByIdAndUpdate(
      session.user.id,
      {
        ...(name !== undefined && { name }),
        ...(phone !== undefined && { phone }),
        ...(subscribedToNews !== undefined && { subscribedToNews }),
      },
      { new: true, runValidators: true },
    ).select('-password').lean()

    return NextResponse.json(user)
  } catch (err) {
    return NextResponse.json(
      { error: err.message || 'Ошибка обновления' },
      { status: 500 },
    )
  }
}
