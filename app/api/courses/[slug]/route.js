import { NextResponse } from 'next/server'
import { auth } from '@/lib/nextauth'
import dbConnect from '@/lib/mongodb'
import { Course, AccessCode } from '@/models/Course'
import { normalizeCourseMedia } from '@/lib/cloud'

export async function GET(request, { params }) {
  try {
    await dbConnect()
    const { slug } = await params
    const course = await Course.findOne({ slug }).lean()

    if (!course) {
      return NextResponse.json({ error: 'Курс не найден' }, { status: 404 })
    }
    const normalizedCourse = normalizeCourseMedia(course)

    // Проверяем, есть ли у пользователя доступ
    const session = await auth()
    let hasAccess = false

    if (session?.user?.id) {
      const access = await AccessCode.findOne({
        courseId: course._id,
        userId: session.user.id,
        used: true,
      }).lean()
      hasAccess = !!access
    }

    // Возвращаем полные данные только при наличии доступа
    if (hasAccess) {
      return NextResponse.json({ ...normalizedCourse, hasAccess: true })
    }

    // Без доступа — только публичная информация (без content)
    return NextResponse.json({
      _id: course._id,
      title: course.title,
      slug: course.slug,
      description: course.description,
      videoUrl: normalizedCourse.videoUrl,
      price: course.price,
      images: normalizedCourse.images,
      hasAccess: false,
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Ошибка загрузки курса' },
      { status: 500 },
    )
  }
}
