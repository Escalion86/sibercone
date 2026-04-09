import { NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import Product from '@/models/Product'

export async function GET(request) {
  try {
    await dbConnect()

    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')

    const filter = {}
    if (category && ['micro', 'scene', 'mentalism'].includes(category)) {
      filter.categories = category
    }
    if (searchParams.get('new') === '1') {
      filter.isNewArrival = true
    }

    const products = await Product.find(filter).sort({ createdAt: -1 }).lean()

    return NextResponse.json(products)
  } catch (error) {
    return NextResponse.json(
      { error: 'Ошибка загрузки товаров' },
      { status: 500 },
    )
  }
}
