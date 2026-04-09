import { cookies } from 'next/headers'

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD
const COOKIE_NAME = 'admin_token'

export function generateToken() {
  const payload = `${ADMIN_PASSWORD}_${Date.now()}`
  return Buffer.from(payload).toString('base64')
}

export function verifyPassword(password) {
  return password === ADMIN_PASSWORD
}

export async function isAuthenticated() {
  const cookieStore = await cookies()
  const token = cookieStore.get(COOKIE_NAME)
  if (!token) return false

  try {
    const decoded = Buffer.from(token.value, 'base64').toString('utf-8')
    return decoded.startsWith(ADMIN_PASSWORD + '_')
  } catch {
    return false
  }
}

export { COOKIE_NAME }
