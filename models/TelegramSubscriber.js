import mongoose from 'mongoose'

const TelegramSubscriberSchema = new mongoose.Schema({
  chatId: { type: String, required: true, unique: true },
  username: { type: String, default: '' },
  firstName: { type: String, default: '' },
  enabled: { type: Boolean, default: true },
  linkedAt: { type: Date, default: Date.now },
  codeUsed: { type: String, default: '' },
})

export default mongoose.models.TelegramSubscriber ||
  mongoose.model('TelegramSubscriber', TelegramSubscriberSchema)
