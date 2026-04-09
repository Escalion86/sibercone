import dbConnect from '@/lib/mongodb'
import Product from '@/models/Product'
import { notFound } from 'next/navigation'
import ProductDetail from './ProductDetail'

export async function generateMetadata({ params }) {
  const { slug } = await params
  await dbConnect()
  const product = await Product.findOne({ slug }).lean()
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
  const product = await Product.findOne({ slug }).lean()

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
