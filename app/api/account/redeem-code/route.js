import { NextResponse } from 'next/server'
import { auth } from '@/lib/nextauth'
import dbConnect from '@/lib/mongodb'
import { AccessCode } from '@/models/Course'

export async function POST(request) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Необходима авторизация' }, { status: 401 })
  }

  try {
    const { code } = await request.json()
    if (!code || typeof code !== 'string') {
      return NextResponse.json({ error: 'Введите код доступа' }, { status: 400 })
    }

    await dbConnect()

    const accessCode = await AccessCode.findOne({
      code: code.trim(),
      used: false,
    }).populate('courseId', 'title slug')

    if (!accessCode) {
      return NextResponse.json(
        { error: 'Код не найден или уже использован' },
        { status: 400 },
      )
    }

    accessCode.used = true
    accessCode.userId = session.user.id
    accessCode.usedAt = new Date()
    await accessCode.save()

    return NextResponse.json({
      success: true,
      course: {
        title: accessCode.courseId.title,
        slug: accessCode.courseId.slug,
      },
    })
  } catch (error) {
    console.error('Redeem code error:', error)
    return NextResponse.json(
      { error: 'Ошибка активации кода' },
      { status: 500 },
    )
  }
}
