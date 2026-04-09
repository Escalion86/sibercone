import { NextResponse } from 'next/server'
import { isAuthenticated } from '@/lib/auth'
import { uploadFile } from '@/lib/cloud'

export async function POST(request) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const formData = await request.formData()
    const file = formData.get('file')
    const directory = formData.get('directory') || 'sibercone/products'

    if (!file) {
      return NextResponse.json({ error: 'Файл не выбран' }, { status: 400 })
    }

    const cloudFormData = new FormData()
    cloudFormData.append('files', file)
    cloudFormData.append('directory', directory)

    const urls = await uploadFile(file, directory)
    return NextResponse.json({ urls })
  } catch (err) {
    return NextResponse.json(
      { error: err.message || 'Ошибка загрузки' },
      { status: 500 },
    )
  }
}
