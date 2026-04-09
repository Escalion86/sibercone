import { NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import Event from '@/models/Event'

export async function GET(request, { params }) {
  try {
    await dbConnect()
    const { slug } = await params
    const event = await Event.findOne({ slug, published: true }).lean()
    if (!event) {
      return NextResponse.json({ error: 'Событие не найдено' }, { status: 404 })
    }
    return NextResponse.json(event)
  } catch (error) {
    return NextResponse.json(
      { error: 'Ошибка загрузки события' },
      { status: 500 },
    )
  }
}
