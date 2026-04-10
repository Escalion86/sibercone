import { NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import Product from '@/models/Product'

function getSlugCandidates(slugValue) {
  const raw = typeof slugValue === 'string' ? slugValue.trim() : ''
  if (!raw) return []

  let decoded = raw
  try {
    decoded = decodeURIComponent(raw)
  } catch {
    decoded = raw
  }

  return Array.from(new Set([decoded, raw]))
}

export async function GET(request, { params }) {
  try {
    await dbConnect()

    const { slug } = await params
    const slugCandidates = getSlugCandidates(slug)
    const product =
      slugCandidates.length > 0
        ? await Product.findOne({ slug: { $in: slugCandidates } }).lean()
        : null

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
