import nodemailer from 'nodemailer'

let transporter = null

function getTransporter() {
  if (!transporter && process.env.SMTP_HOST) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 465,
      secure: (Number(process.env.SMTP_PORT) || 465) === 465,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    })
  }
  return transporter
}

export async function sendEmail({ to, subject, html }) {
  const transport = getTransporter()
  if (!transport) {
    console.warn('SMTP not configured, skipping email')
    return null
  }

  return transport.sendMail({
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    to,
    subject,
    html,
  })
}

export function formatNewProductEmail(product) {
  const siteUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'
  const productUrl = `${siteUrl}/products/${product.slug}`
  const image = product.images?.[0]
    ? `<img src="${product.images[0]}" alt="${product.name}" style="max-width:100%;border-radius:12px;margin-bottom:16px;" />`
    : ''

  return `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;">
      <h1 style="color:#1f2937;font-size:24px;">Sibercone</h1>
      <hr style="border:none;border-top:1px solid #e5e7eb;margin:16px 0;" />
      <h2 style="color:#4f46e5;font-size:20px;">Новый товар: ${product.name}</h2>
      ${image}
      <p style="color:#4b5563;font-size:14px;line-height:1.6;">
        ${(product.description || '').slice(0, 300)}${(product.description || '').length > 300 ? '...' : ''}
      </p>
      <p style="font-size:18px;font-weight:bold;color:#1f2937;">
        ${product.price?.toLocaleString('ru-RU')} ₽
      </p>
      <a href="${productUrl}" style="display:inline-block;padding:12px 24px;background:#4f46e5;color:#fff;text-decoration:none;border-radius:8px;font-size:14px;font-weight:500;">
        Посмотреть товар
      </a>
      <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0 12px;" />
      <p style="color:#9ca3af;font-size:12px;">
        Вы получили это письмо, потому что подписаны на новинки Sibercone.
        <a href="${siteUrl}/account" style="color:#4f46e5;">Отписаться</a>
      </p>
    </div>
  `
}

export function formatOrderConfirmationEmail(order) {
  const siteUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'
  const itemsHtml = order.items
    .map(
      (item) =>
        `<tr>
          <td style="padding:8px;border-bottom:1px solid #e5e7eb;">${item.name}</td>
          <td style="padding:8px;border-bottom:1px solid #e5e7eb;text-align:center;">${item.quantity}</td>
          <td style="padding:8px;border-bottom:1px solid #e5e7eb;text-align:right;">${item.price?.toLocaleString('ru-RU')} ₽</td>
        </tr>`,
    )
    .join('')

  return `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;">
      <h1 style="color:#1f2937;font-size:24px;">Sibercone</h1>
      <hr style="border:none;border-top:1px solid #e5e7eb;margin:16px 0;" />
      <h2 style="color:#059669;font-size:20px;">Заказ оформлен!</h2>
      <p style="color:#4b5563;">Спасибо за заказ, ${order.customerName}!</p>
      <table style="width:100%;border-collapse:collapse;margin:16px 0;">
        <thead>
          <tr style="background:#f9fafb;">
            <th style="padding:8px;text-align:left;font-size:13px;color:#6b7280;">Товар</th>
            <th style="padding:8px;text-align:center;font-size:13px;color:#6b7280;">Кол-во</th>
            <th style="padding:8px;text-align:right;font-size:13px;color:#6b7280;">Цена</th>
          </tr>
        </thead>
        <tbody>${itemsHtml}</tbody>
      </table>
      <p style="font-size:18px;font-weight:bold;color:#1f2937;text-align:right;">
        Итого: ${order.total?.toLocaleString('ru-RU')} ₽
      </p>
      <p style="color:#4b5563;font-size:14px;">
        Мы свяжемся с вами для подтверждения заказа и уточнения деталей оплаты.
      </p>
      <a href="${siteUrl}/account" style="display:inline-block;padding:12px 24px;background:#4f46e5;color:#fff;text-decoration:none;border-radius:8px;font-size:14px;font-weight:500;">
        Мои заказы
      </a>
    </div>
  `
}
