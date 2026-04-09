const CLOUD_API_URL = process.env.CLOUD_API_URL
const CLOUD_API_PASSWORD = process.env.CLOUD_API_PASSWORD

export async function uploadFile(file, directory, fileName) {
  const formData = new FormData()
  formData.append('files', file)
  formData.append('directory', directory)
  if (fileName) {
    formData.append('fileName', fileName)
  }

  const res = await fetch(`${CLOUD_API_URL}/api`, {
    method: 'POST',
    headers: {
      'x-api-password': CLOUD_API_PASSWORD,
    },
    body: formData,
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.message || `Cloud upload failed: ${res.status}`)
  }

  const urls = await res.json()
  return urls
}

export async function deleteFile(filePath) {
  const res = await fetch(
    `${CLOUD_API_URL}/api/deletefile?filePath=${encodeURIComponent(filePath)}`,
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
    `${CLOUD_API_URL}/api/files?directory=${encodeURIComponent(directory)}&noFolders=1`,
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
