import webpush from 'web-push'
import dbConnect from '@/lib/mongodb'
import PushSubscription from '@/models/PushSubscription'

let vapidConfigured = false

function configureVapid() {
  if (vapidConfigured) return true

  const publicKey = process.env.VAPID_PUBLIC_KEY
  const privateKey = process.env.VAPID_PRIVATE_KEY
  const subject = process.env.VAPID_SUBJECT

  if (!publicKey || !privateKey || !subject) {
    console.warn('Web Push отключён: VAPID-ключи не настроены')
    return false
  }

  webpush.setVapidDetails(subject, publicKey, privateKey)
  vapidConfigured = true
  return true
}

export async function sendPushToAdmins({ title, body, url = '/', tag }) {
  const summary = { sent: 0, failed: 0 }
  if (!configureVapid()) return summary

  await dbConnect()
  const subscriptions = await PushSubscription.find().lean()
  const payload = JSON.stringify({ title, body, url, tag })

  await Promise.all(
    subscriptions.map(async (subscription) => {
      try {
        await webpush.sendNotification(
          {
            endpoint: subscription.endpoint,
            keys: subscription.keys,
          },
          payload,
          { TTL: 60 * 60, urgency: 'high' },
        )
        summary.sent += 1
        await PushSubscription.updateOne(
          { _id: subscription._id },
          { $set: { lastSuccessAt: new Date(), failureCount: 0 } },
        )
      } catch (error) {
        summary.failed += 1
        if (error.statusCode === 404 || error.statusCode === 410) {
          await PushSubscription.deleteOne({ _id: subscription._id })
        } else {
          await PushSubscription.updateOne(
            { _id: subscription._id },
            { $inc: { failureCount: 1 } },
          ).catch((updateError) =>
            console.error('Не удалось обновить счётчик push:', updateError),
          )
        }
        console.error('Ошибка Web Push:', error.message)
      }
    }),
  )

  return summary
}
