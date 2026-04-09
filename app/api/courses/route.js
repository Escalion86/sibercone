import { NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import { Course } from '@/models/Course'

export async function GET() {
  try {
    await dbConnect()
    const courses = await Course.find()
      .select('title slug description price images createdAt')
      .sort({ createdAt: -1 })
      .lean()
    return NextResponse.json(courses)
  } catch (error) {
    return NextResponse.json(
      { error: 'Ошибка загрузки курсов' },
      { status: 500 },
    )
  }
}
