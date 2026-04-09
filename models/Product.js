import mongoose from 'mongoose'

const ProductSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  description: {
    type: String,
    default: '',
  },
  price: {
    type: Number,
    required: true,
    min: 0,
  },
  categories: {
    type: [String],
    default: [],
    validate: {
      validator: (v) =>
        v.every((c) => ['micro', 'scene', 'mentalism'].includes(c)),
      message: 'Недопустимая категория',
    },
  },
  productTypes: {
    type: [String],
    default: [],
    validate: {
      validator: (v) =>
        v.every((t) => ['equipment', 'app', 'infoproduct'].includes(t)),
      message: 'Недопустимый тип товара',
    },
  },
  images: {
    type: [String],
    default: [],
  },
  videoUrl: {
    type: String,
    default: '',
  },
  inStock: {
    type: Boolean,
    default: true,
  },
  isNewArrival: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
})

export default mongoose.models.Product ||
  mongoose.model('Product', ProductSchema)
