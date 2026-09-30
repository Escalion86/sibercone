import { NextResponse } from 'next/server'
import { isAuthenticated } from '@/lib/auth'
import dbConnect from '@/lib/mongodb'
import PushSubscription from '@/models/PushSubscription'

export async function DELETE(request, { params }) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: 'Не авторизован' }, { status: 401 })
  }
  try {
    const { id } = await params
    await dbConnect()
    const removed = await PushSubscription.findByIdAndDelete(id)
    if (!removed) {
      return NextResponse.json({ error: 'Устройство не найдено' }, { status: 404 })
    }
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Ошибка удаления устройства:', error)
    return NextResponse.json({ error: 'Ошибка удаления' }, { status: 500 })
  }
}
