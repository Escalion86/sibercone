import { NextResponse } from 'next/server'
import { verifyPassword, generateToken, COOKIE_NAME } from '@/lib/auth'

export async function POST(request) {
  try {
    const { password } = await request.json()

    if (!password || !verifyPassword(password)) {
      return NextResponse.json({ error: 'Неверный пароль' }, { status: 401 })
    }

    const token = generateToken()
    const response = NextResponse.json({ success: true })

    response.cookies.set(COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 дней
      path: '/',
    })

    return response
  } catch {
    return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 })
  }
}
