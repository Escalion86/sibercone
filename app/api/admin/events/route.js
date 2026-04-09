import { NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import Event from '@/models/Event'
import { isAuthenticated } from '@/lib/auth'

export async function GET(request) {
  if (!isAuthenticated(request)) {
    return NextResponse.json({ error: 'Не авторизован' }, { status: 401 })
  }
  try {
    await dbConnect()
    const events = await Event.find().sort({ date: -1 }).lean()
    return NextResponse.json(events)
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
    const { title, slug, description, date, location, image, published } = body

    if (!title || !slug || !date) {
      return NextResponse.json(
        { error: 'Заполните обязательные поля' },
        { status: 400 },
      )
    }

    await dbConnect()

    const event = await Event.create({
      title: String(title).trim().slice(0, 300),
      slug: String(slug).trim().slice(0, 200),
      description: String(description || '').slice(0, 5000),
      date: new Date(date),
      location: String(location || '').trim().slice(0, 300),
      image: String(image || '').slice(0, 500),
      published: published !== false,
    })

    return NextResponse.json(event, { status: 201 })
  } catch (error) {
    if (error.code === 11000) {
      return NextResponse.json(
        { error: 'Событие с таким slug уже существует' },
        { status: 400 },
      )
    }
    return NextResponse.json({ error: 'Ошибка создания' }, { status: 500 })
  }
}
