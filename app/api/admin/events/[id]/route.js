import { NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import Event from '@/models/Event'
import { isAuthenticated } from '@/lib/auth'

export async function GET(request, { params }) {
  if (!isAuthenticated(request)) {
    return NextResponse.json({ error: 'Не авторизован' }, { status: 401 })
  }
  try {
    await dbConnect()
    const { id } = await params
    const event = await Event.findById(id).lean()
    if (!event) {
      return NextResponse.json({ error: 'Не найдено' }, { status: 404 })
    }
    return NextResponse.json(event)
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

    const event = await Event.findByIdAndUpdate(
      id,
      {
        title: String(body.title || '')
          .trim()
          .slice(0, 300),
        slug: String(body.slug || '')
          .trim()
          .slice(0, 200),
        description: String(body.description || '').slice(0, 5000),
        date: new Date(body.date),
        location: String(body.location || '')
          .trim()
          .slice(0, 300),
        image: String(body.image || '').slice(0, 500),
        videoUrl: String(body.videoUrl || '').slice(0, 500),
        published: body.published !== false,
      },
      { new: true },
    )

    if (!event) {
      return NextResponse.json({ error: 'Не найдено' }, { status: 404 })
    }

    return NextResponse.json(event)
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
    const event = await Event.findByIdAndDelete(id)
    if (!event) {
      return NextResponse.json({ error: 'Не найдено' }, { status: 404 })
    }
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Ошибка удаления' }, { status: 500 })
  }
}
