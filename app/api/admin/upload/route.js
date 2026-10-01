import { NextResponse } from 'next/server'
import { isAuthenticated } from '@/lib/auth'
import { EscalionCloudError, uploadFilesToEscalionCloud } from '@/lib/cloud'

export async function POST(request) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (!process.env.ESCALIONCLOUD_PASSWORD) {
    return NextResponse.json(
      { error: 'Файловое хранилище не настроено' },
      { status: 503 },
    )
  }

  try {
    const formData = await request.formData()
    const files = formData.getAll('files')
    const directory = formData.get('directory') || 'sibercone/products'

    if (!files.length) {
      return NextResponse.json({ error: 'Файл не выбран' }, { status: 400 })
    }

    const urls = await uploadFilesToEscalionCloud({ files, directory })
    return NextResponse.json({ urls })
  } catch (err) {
    return NextResponse.json(
      { error: err.message || 'Ошибка загрузки' },
      { status: err instanceof EscalionCloudError ? err.status : 502 },
    )
  }
}
