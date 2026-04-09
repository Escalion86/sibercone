import { NextResponse } from 'next/server'
import crypto from 'crypto'
import dbConnect from '@/lib/mongodb'
import { AccessCode } from '@/models/Course'
import { isAuthenticated } from '@/lib/auth'

export async function GET(request, { params }) {
  if (!isAuthenticated(request)) {
    return NextResponse.json({ error: 'Не авторизован' }, { status: 401 })
  }
  try {
    await dbConnect()
    const { id } = await params
    const codes = await AccessCode.find({ courseId: id })
      .populate('userId', 'name email')
      .sort({ createdAt: -1 })
      .lean()
    return NextResponse.json(codes)
  } catch (error) {
    return NextResponse.json({ error: 'Ошибка' }, { status: 500 })
  }
}

export async function POST(request, { params }) {
  if (!isAuthenticated(request)) {
    return NextResponse.json({ error: 'Не авторизован' }, { status: 401 })
  }
  try {
    const { count = 1 } = await request.json()
    const { id } = await params
    const quantity = Math.min(Math.max(1, Number(count)), 100)

    await dbConnect()

    const codes = []
    for (let i = 0; i < quantity; i++) {
      const code = crypto.randomBytes(6).toString('hex').toUpperCase()
      codes.push({
        code: `SC-${code}`,
        courseId: id,
      })
    }

    const created = await AccessCode.insertMany(codes)
    return NextResponse.json(created, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { error: 'Ошибка генерации кодов' },
      { status: 500 },
    )
  }
}
