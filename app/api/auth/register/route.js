import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import dbConnect from '@/lib/mongodb'
import User from '@/models/User'

export async function POST(request) {
  try {
    const { name, email, password, phone } = await request.json()

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'Заполните все обязательные поля' },
        { status: 400 },
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Пароль должен содержать минимум 6 символов' },
        { status: 400 },
      )
    }

    await dbConnect()

    const existing = await User.findOne({ email: email.toLowerCase() })
    if (existing) {
      return NextResponse.json(
        { error: 'Пользователь с таким email уже существует' },
        { status: 400 },
      )
    }

    const hashedPassword = await bcrypt.hash(password, 12)

    await User.create({
      name,
      email: email.toLowerCase(),
      phone: phone || '',
      password: hashedPassword,
    })

    return NextResponse.json({ success: true }, { status: 201 })
  } catch (err) {
    return NextResponse.json(
      { error: err.message || 'Ошибка регистрации' },
      { status: 500 },
    )
  }
}
