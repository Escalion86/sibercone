import { NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import Product from '@/models/Product'

export async function GET(request, { params }) {
  try {
    await dbConnect()

    const { slug } = await params
    const product = await Product.findOne({ slug }).lean()

    if (!product) {
      return NextResponse.json({ error: 'Товар не найден' }, { status: 404 })
    }

    return NextResponse.json(product)
  } catch (error) {
    return NextResponse.json(
      { error: 'Ошибка загрузки товара' },
      { status: 500 },
    )
  }
}
