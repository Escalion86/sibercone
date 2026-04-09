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
  category: {
    type: String,
    required: true,
    enum: ['micro', 'scene', 'mentalism'],
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
