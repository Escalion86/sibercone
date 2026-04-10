const CLOUD_API_URL = process.env.CLOUD_API_URL
const CLOUD_API_PASSWORD = process.env.CLOUD_API_PASSWORD

function getCloudApiBaseUrl() {
  const raw = String(CLOUD_API_URL || '').trim()
  if (!raw) {
    throw new Error('CLOUD_API_URL is not configured')
  }

  const withProtocol = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`

  let url
  try {
    url = new URL(withProtocol)
  } catch {
    throw new Error('CLOUD_API_URL has invalid format')
  }

  // EscalionCloud API работает на api.escalioncloud.ru, а не на основном домене.
  if (url.hostname === 'escalioncloud.ru') {
    url.hostname = 'api.escalioncloud.ru'
  }

  const path = url.pathname.replace(/\/+$/, '')
  if (!path || path === '/') {
    url.pathname = '/api'
  } else if (!path.endsWith('/api')) {
    url.pathname = `${path}/api`
  } else {
    url.pathname = path
  }

  return url.toString().replace(/\/+$/, '')
}

const CLOUD_API_BASE_URL = getCloudApiBaseUrl()

export async function uploadFile(file, directory, fileName) {
  const formData = new FormData()
  formData.append('files', file)
  formData.append('directory', directory)
  if (fileName) {
    formData.append('fileName', fileName)
  }

  console.log('[Cloud Upload] URL:', CLOUD_API_BASE_URL)
  console.log('[Cloud Upload] Directory:', directory)
  console.log(
    '[Cloud Upload] File name:',
    file?.name,
    'Size:',
    file?.size,
    'Type:',
    file?.type,
  )

  const res = await fetch(CLOUD_API_BASE_URL, {
    method: 'POST',
    headers: {
      'x-api-password': CLOUD_API_PASSWORD,
    },
    body: formData,
  })

  console.log('[Cloud Upload] Response status:', res.status, res.statusText)

  const rawText = await res.text()
  console.log('[Cloud Upload] Response body:', rawText)

  if (!res.ok) {
    let err = {}
    try {
      err = JSON.parse(rawText)
    } catch {}
    throw new Error(
      err.message || `Cloud upload failed: ${res.status} — ${rawText}`,
    )
  }

  const urls = JSON.parse(rawText)
  return urls
}

export async function deleteFile(filePath) {
  const res = await fetch(
    `${CLOUD_API_BASE_URL}/deletefile?filePath=${encodeURIComponent(filePath)}`,
    {
      headers: { 'x-api-password': CLOUD_API_PASSWORD },
    },
  )

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.message || `Cloud delete failed: ${res.status}`)
  }

  return res.json()
}

export async function listFiles(directory) {
  const res = await fetch(
    `${CLOUD_API_BASE_URL}/files?directory=${encodeURIComponent(directory)}&noFolders=1`,
    {
      headers: { 'x-api-password': CLOUD_API_PASSWORD },
    },
  )

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.message || `Cloud list failed: ${res.status}`)
  }

  return res.json()
}

export function getCloudDirectory(slug) {
  return `sibercone/products/${slug}`
}
