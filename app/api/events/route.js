import { NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import Event from '@/models/Event'

export async function GET() {
  try {
    await dbConnect()
    const events = await Event.find({ published: true })
      .sort({ date: -1 })
      .lean()
    return NextResponse.json(events)
  } catch (error) {
    return NextResponse.json(
      { error: 'Ошибка загрузки событий' },
      { status: 500 },
    )
  }
}
