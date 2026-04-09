import { NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import Product from '@/models/Product'
import { isAuthenticated } from '@/lib/auth'

export async function GET(request, { params }) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  await dbConnect()
  const { id } = await params
  const product = await Product.findById(id).lean()

  if (!product) {
    return NextResponse.json({ error: 'Товар не найден' }, { status: 404 })
  }

  return NextResponse.json(product)
}

export async function PUT(request, { params }) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    await dbConnect()
    const { id } = await params
    const body = await request.json()

    const product = await Product.findByIdAndUpdate(
      id,
      {
        name: body.name,
        slug: body.slug,
        description: body.description || '',
        price: Number(body.price),
        categories: body.categories || [],
        productTypes: body.productTypes || [],
        images: body.images || [],
        videoUrl: body.videoUrl || '',
        inStock: body.inStock !== false,
        isNewArrival: body.isNewArrival || false,
      },
      { new: true, runValidators: true },
    )

    if (!product) {
      return NextResponse.json({ error: 'Товар не найден' }, { status: 404 })
    }

    return NextResponse.json(product)
  } catch (err) {
    return NextResponse.json(
      { error: err.message || 'Ошибка обновления' },
      { status: 500 },
    )
  }
}

export async function DELETE(request, { params }) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    await dbConnect()
    const { id } = await params

    const product = await Product.findByIdAndDelete(id)
    if (!product) {
      return NextResponse.json({ error: 'Товар не найден' }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    return NextResponse.json(
      { error: err.message || 'Ошибка удаления' },
      { status: 500 },
    )
  }
}
