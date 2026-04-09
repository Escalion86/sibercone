import { NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import Product from '@/models/Product'
import { isAuthenticated } from '@/lib/auth'

export async function GET() {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  await dbConnect()
  const products = await Product.find({}).sort({ createdAt: -1 }).lean()
  return NextResponse.json(products)
}

export async function POST(request) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    await dbConnect()
    const body = await request.json()

    const slug =
      body.slug ||
      body.name
        .toLowerCase()
        .replace(/[^a-zа-яё0-9]+/gi, '-')
        .replace(/^-|-$/g, '')

    const existing = await Product.findOne({ slug })
    if (existing) {
      return NextResponse.json(
        { error: 'Товар с таким URL уже существует' },
        { status: 400 },
      )
    }

    const product = await Product.create({
      name: body.name,
      slug,
      description: body.description || '',
      price: Number(body.price),
      categories: body.categories || [],
      productTypes: body.productTypes || [],
      images: body.images || [],
      videoUrl: body.videoUrl || '',
      inStock: body.inStock !== false,
      isNewArrival: body.isNewArrival || false,
    })

    return NextResponse.json(product, { status: 201 })
  } catch (err) {
    return NextResponse.json(
      { error: err.message || 'Ошибка создания товара' },
      { status: 500 },
    )
  }
}
