import { NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import Product from '@/models/Product'

export async function GET(request) {
  try {
    await dbConnect()

    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const type = searchParams.get('type')
    const search = searchParams.get('search')
    const sort = searchParams.get('sort')
    const inStock = searchParams.get('inStock')

    const filter = {}

    if (category && ['micro', 'scene', 'mentalism'].includes(category)) {
      filter.categories = category
    }
    if (type && ['equipment', 'app', 'infoproduct'].includes(type)) {
      filter.productTypes = type
    }
    if (search && search.trim()) {
      filter.name = { $regex: search.trim(), $options: 'i' }
    }
    if (inStock === '1') {
      filter.inStock = true
    }
    if (searchParams.get('new') === '1') {
      filter.isNewArrival = true
    }

    let sortOption = { createdAt: -1 }
    if (sort === 'price_asc') sortOption = { price: 1 }
    else if (sort === 'price_desc') sortOption = { price: -1 }
    else if (sort === 'name') sortOption = { name: 1 }

    const products = await Product.find(filter).sort(sortOption).lean()

    return NextResponse.json(products)
  } catch (error) {
    return NextResponse.json(
      { error: 'Ошибка загрузки товаров' },
      { status: 500 },
    )
  }
}
