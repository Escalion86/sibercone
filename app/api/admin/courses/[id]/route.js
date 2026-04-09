import { NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import { Course } from '@/models/Course'
import { isAuthenticated } from '@/lib/auth'

export async function GET(request, { params }) {
  if (!isAuthenticated(request)) {
    return NextResponse.json({ error: 'Не авторизован' }, { status: 401 })
  }
  try {
    await dbConnect()
    const { id } = await params
    const course = await Course.findById(id).lean()
    if (!course) {
      return NextResponse.json({ error: 'Не найдено' }, { status: 404 })
    }
    return NextResponse.json(course)
  } catch (error) {
    return NextResponse.json({ error: 'Ошибка' }, { status: 500 })
  }
}

export async function PUT(request, { params }) {
  if (!isAuthenticated(request)) {
    return NextResponse.json({ error: 'Не авторизован' }, { status: 401 })
  }
  try {
    const body = await request.json()
    const { id } = await params

    await dbConnect()

    const course = await Course.findByIdAndUpdate(
      id,
      {
        title: String(body.title || '').trim().slice(0, 300),
        slug: String(body.slug || '').trim().slice(0, 200),
        description: String(body.description || '').slice(0, 5000),
        content: String(body.content || '').slice(0, 50000),
        videoUrl: String(body.videoUrl || '').slice(0, 500),
        images: Array.isArray(body.images) ? body.images.slice(0, 20) : [],
        price: Number(body.price) || 0,
      },
      { new: true },
    )

    if (!course) {
      return NextResponse.json({ error: 'Не найдено' }, { status: 404 })
    }

    return NextResponse.json(course)
  } catch (error) {
    return NextResponse.json({ error: 'Ошибка обновления' }, { status: 500 })
  }
}

export async function DELETE(request, { params }) {
  if (!isAuthenticated(request)) {
    return NextResponse.json({ error: 'Не авторизован' }, { status: 401 })
  }
  try {
    await dbConnect()
    const { id } = await params
    const course = await Course.findByIdAndDelete(id)
    if (!course) {
      return NextResponse.json({ error: 'Не найдено' }, { status: 404 })
    }
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Ошибка удаления' }, { status: 500 })
  }
}
