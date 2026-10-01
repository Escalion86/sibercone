import mongoose from 'mongoose'
import { toCloudEscalionUrl } from '@/lib/cloud'

const EventSchema = new mongoose.Schema({
  title: {
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
  date: {
    type: Date,
    required: true,
  },
  location: {
    type: String,
    default: '',
  },
  image: {
    type: String,
    default: '',
    set: toCloudEscalionUrl,
  },
  videoUrl: {
    type: String,
    default: '',
    set: toCloudEscalionUrl,
  },
  published: {
    type: Boolean,
    default: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
})

export default mongoose.models.Event || mongoose.model('Event', EventSchema)
