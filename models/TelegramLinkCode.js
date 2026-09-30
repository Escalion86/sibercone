import mongoose from 'mongoose'

const TelegramLinkCodeSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true },
  createdAt: { type: Date, default: Date.now },
  expiresAt: { type: Date, required: true, expires: 0 },
})

export default mongoose.models.TelegramLinkCode ||
  mongoose.model('TelegramLinkCode', TelegramLinkCodeSchema)
