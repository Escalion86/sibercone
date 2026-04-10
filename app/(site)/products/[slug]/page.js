import dbConnect from '@/lib/mongodb'
import Product from '@/models/Product'
import { notFound } from 'next/navigation'
import ProductDetail from './ProductDetail'

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

async function findProductBySlug(slugValue) {
  const slugCandidates = getSlugCandidates(slugValue)
  if (slugCandidates.length === 0) return null

  return Product.findOne({ slug: { $in: slugCandidates } }).lean()
}

export async function generateMetadata({ params }) {
  const { slug } = await params
  await dbConnect()
  const product = await findProductBySlug(slug)
  if (!product) return { title: 'Товар не найден' }
  return {
    title: `${product.name} — Sibercone`,
    description:
      product.description?.slice(0, 160) ||
      `Купить ${product.name} в магазине Sibercone`,
  }
}

export default async function ProductPage({ params }) {
  const { slug } = await params
  await dbConnect()
  const product = await findProductBySlug(slug)

  if (!product) {
    notFound()
  }

  const serialized = {
    ...product,
    _id: product._id.toString(),
    createdAt: product.createdAt?.toISOString() || null,
  }

  return <ProductDetail product={serialized} />
}
