const DEFAULT_ESCALIONCLOUD_API_URL = 'https://cloud.escalion.ru/api'
const ESCALIONCLOUD_ORIGIN = 'https://cloud.escalion.ru'

const getApiUrl = () =>
  String(process.env.ESCALIONCLOUD_API_URL || DEFAULT_ESCALIONCLOUD_API_URL).replace(/\/+$/, '')

export class EscalionCloudError extends Error {
  constructor(code, message, status = 502) {
    super(message || code)
    this.name = 'EscalionCloudError'
    this.code = code
    this.status = status
  }
}

const parseResponse = async (response) => {
  const text = await response.text()
  if (!text) return { payload: null, text: '' }
  try {
    return { payload: JSON.parse(text), text }
  } catch {
    return { payload: text, text }
  }
}

const errorMessage = (payload, fallback) => {
  if (typeof payload === 'string' && payload.trim()) return payload.trim()
  return payload?.reason || payload?.message || payload?.error?.message || payload?.data?.error?.message || fallback
}

const upstreamErrorStatus = (status) =>
  [400, 413, 415, 422].includes(status) ? 400 : 502

const requirePassword = () => {
  const password = process.env.ESCALIONCLOUD_PASSWORD
  if (!password) {
    throw new EscalionCloudError('ESCALIONCLOUD_NOT_CONFIGURED', 'Файловое хранилище не настроено', 503)
  }
  return password
}

export function normalizeEscalionCloudUrl(value) {
  const candidate = String(value || '').trim()
  if (!candidate) return ''
  try {
    const url = new URL(candidate, `${ESCALIONCLOUD_ORIGIN}/`)
    if (url.hostname === 'escalioncloud.ru') url.hostname = 'cloud.escalion.ru'
    if (url.protocol !== 'https:' || url.hostname !== 'cloud.escalion.ru') return ''
    return url.toString()
  } catch {
    return ''
  }
}

export function toCloudEscalionUrl(value) {
  const candidate = typeof value === 'string' ? value.trim() : ''
  if (!candidate) return candidate
  try {
    const url = new URL(candidate)
    if (url.hostname === 'escalioncloud.ru' || url.hostname === 'api.escalioncloud.ru') {
      url.protocol = 'https:'
      url.hostname = 'cloud.escalion.ru'
      url.port = ''
      return url.toString()
    }
    return candidate
  } catch {
    return candidate
  }
}

export const normalizeCloudUrls = (values) => Array.isArray(values) ? values.map(toCloudEscalionUrl) : []

export const normalizeProductMedia = (product) => product ? {
  ...product,
  images: normalizeCloudUrls(product.images),
  videoUrl: toCloudEscalionUrl(product.videoUrl),
} : product

export const normalizeCourseMedia = normalizeProductMedia

export const normalizeEventMedia = (event) => event ? {
  ...event,
  image: toCloudEscalionUrl(event.image),
  videoUrl: toCloudEscalionUrl(event.videoUrl),
} : event

export const normalizeOrderMedia = (order) => order ? {
  ...order,
  items: Array.isArray(order.items)
    ? order.items.map((item) => ({ ...item, image: toCloudEscalionUrl(item.image) }))
    : [],
} : order

export const extractEscalionCloudUploadUrl = (row) =>
  normalizeEscalionCloudUrl(typeof row === 'string' ? row : row?.url || row?.fileUrl || row?.path)

export async function uploadFilesToEscalionCloud({ files, directory }) {
  const password = requirePassword()
  if (!Array.isArray(files) || files.length === 0) return []
  const formData = new FormData()
  files.forEach((file) => formData.append('files', file, file.name))
  formData.append('directory', String(directory || ''))
  const apiUrl = getApiUrl()
  console.log('[EscalionCloud upload]', {
    url: apiUrl,
    directory,
    files: files.map(({ name, size, type }) => ({ name, size, type })),
  })
  let response
  try {
    response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'x-api-password': password },
      body: formData,
      cache: 'no-store',
    })
  } catch {
    throw new EscalionCloudError('ESCALIONCLOUD_UNAVAILABLE', 'Файловое хранилище временно недоступно', 502)
  }
  const { payload, text } = await parseResponse(response)
  console.log('[EscalionCloud upload response]', { status: response.status, body: text.slice(0, 500) })
  if (!response.ok || payload?.success === false) {
    throw new EscalionCloudError(
      'ESCALIONCLOUD_UPLOAD_FAILED',
      errorMessage(payload, 'Ошибка загрузки файла в хранилище'),
      upstreamErrorStatus(response.status),
    )
  }
  const value = Array.isArray(payload) ? payload : (payload?.data ?? payload)
  const rows = Array.isArray(value) ? value : value ? [value] : []
  const urls = rows.map(extractEscalionCloudUploadUrl).filter(Boolean)
  if (urls.length !== rows.length || urls.length === 0) {
    throw new EscalionCloudError('ESCALIONCLOUD_INVALID_RESPONSE', 'Хранилище вернуло некорректную ссылку на файл', 502)
  }
  return urls
}

async function cloudGet(path, params) {
  const password = requirePassword()
  const url = new URL(`${getApiUrl()}${path}`)
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined) url.searchParams.set(key, String(value))
  })
  console.log('[EscalionCloud request]', { url: url.toString() })
  let response
  try {
    response = await fetch(url, { headers: { 'x-api-password': password }, cache: 'no-store' })
  } catch {
    throw new EscalionCloudError('ESCALIONCLOUD_UNAVAILABLE', 'Файловое хранилище временно недоступно', 502)
  }
  const { payload, text } = await parseResponse(response)
  console.log('[EscalionCloud response]', { status: response.status, body: text.slice(0, 500) })
  if (!response.ok || payload?.success === false) {
    throw new EscalionCloudError(
      'ESCALIONCLOUD_REQUEST_FAILED',
      errorMessage(payload, 'Ошибка обращения к файловому хранилищу'),
      upstreamErrorStatus(response.status),
    )
  }
  return payload?.data ?? payload
}

export const deleteFile = (filePath) => cloudGet('/deletefile', { filePath })
export const listFiles = (directory, { noFolders } = {}) => cloudGet('/files', { directory, noFolders })

export function getCloudDirectory(slug) {
  return `sibercone/products/${slug}`
}
