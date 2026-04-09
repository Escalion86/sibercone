import { NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import { Course } from '@/models/Course'
import { isAuthenticated } from '@/lib/auth'

export async function GET(request) {
  if (!isAuthenticated(request)) {
    return NextResponse.json({ error: 'Не авторизован' }, { status: 401 })
  }
  try {
    await dbConnect()
    const courses = await Course.find().sort({ createdAt: -1 }).lean()
    return NextResponse.json(courses)
  } catch (error) {
    return NextResponse.json({ error: 'Ошибка' }, { status: 500 })
  }
}

export async function POST(request) {
  if (!isAuthenticated(request)) {
    return NextResponse.json({ error: 'Не авторизован' }, { status: 401 })
  }
  try {
    const body = await request.json()
    const { title, slug, description, content, videoUrl, images, price } = body

    if (!title || !slug) {
      return NextResponse.json(
        { error: 'Заполните обязательные поля' },
        { status: 400 },
      )
    }

    await dbConnect()

    const course = await Course.create({
      title: String(title).trim().slice(0, 300),
      slug: String(slug).trim().slice(0, 200),
      description: String(description || '').slice(0, 5000),
      content: String(content || '').slice(0, 50000),
      videoUrl: String(videoUrl || '').slice(0, 500),
      images: Array.isArray(images) ? images.slice(0, 20) : [],
      price: Number(price) || 0,
    })

    return NextResponse.json(course, { status: 201 })
  } catch (error) {
    if (error.code === 11000) {
      return NextResponse.json(
        { error: 'Курс с таким slug уже существует' },
        { status: 400 },
      )
    }
    return NextResponse.json({ error: 'Ошибка создания' }, { status: 500 })
  }
}
