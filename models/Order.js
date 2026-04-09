import mongoose from 'mongoose'

const OrderItemSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true, min: 1 },
    image: { type: String, default: '' },
  },
  { _id: false },
)

const OrderSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },
  customerName: {
    type: String,
    required: true,
    trim: true,
  },
  phone: {
    type: String,
    required: true,
    trim: true,
  },
  address: {
    type: String,
    required: true,
    trim: true,
  },
  deliveryMethod: {
    type: String,
    required: true,
    enum: ['cdek', 'pochta', 'pickup'],
  },
  items: {
    type: [OrderItemSchema],
    required: true,
    validate: [
      (arr) => arr.length > 0,
      'Заказ должен содержать хотя бы один товар',
    ],
  },
  total: {
    type: Number,
    required: true,
    min: 0,
  },
  status: {
    type: String,
    default: 'new',
    enum: ['new', 'processing', 'done', 'cancelled'],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
})

export default mongoose.models.Order || mongoose.model('Order', OrderSchema)
