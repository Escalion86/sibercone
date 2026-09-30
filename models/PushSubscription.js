import mongoose from 'mongoose'

const PushSubscriptionSchema = new mongoose.Schema({
  endpoint: { type: String, required: true, unique: true },
  keys: {
    p256dh: { type: String, required: true },
    auth: { type: String, required: true },
  },
  label: { type: String, required: true, trim: true },
  userAgent: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now },
  lastSuccessAt: { type: Date, default: null },
  failureCount: { type: Number, default: 0 },
})

export default mongoose.models.PushSubscription ||
  mongoose.model('PushSubscription', PushSubscriptionSchema)
