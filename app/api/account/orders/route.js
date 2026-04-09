import { NextResponse } from 'next/server'
import { auth } from '@/lib/nextauth'
import dbConnect from '@/lib/mongodb'
import Order from '@/models/Order'

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  await dbConnect()
  const orders = await Order.find({ userId: session.user.id })
    .sort({ createdAt: -1 })
    .lean()

  return NextResponse.json(orders)
}
