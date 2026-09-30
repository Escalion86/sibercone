import mongoose from 'mongoose'

const NotificationSettingsSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true, default: 'admin' },
  newOrder: { type: Boolean, default: true },
  newUser: { type: Boolean, default: true },
  codeRedeemed: { type: Boolean, default: false },
})

export const DEFAULT_NOTIFICATION_SETTINGS = {
  newOrder: true,
  newUser: true,
  codeRedeemed: false,
}

export default mongoose.models.NotificationSettings ||
  mongoose.model('NotificationSettings', NotificationSettingsSchema)
