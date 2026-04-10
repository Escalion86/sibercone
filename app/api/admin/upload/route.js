import { NextResponse } from 'next/server'
import { isAuthenticated } from '@/lib/auth'
import { uploadFile } from '@/lib/cloud'

export async function POST(request) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const formData = await request.formData()
    const files = formData.getAll('files')
    const directory = formData.get('directory') || 'sibercone/products'

    if (!files.length) {
      return NextResponse.json({ error: 'Файл не выбран' }, { status: 400 })
    }

    // Если uploadFile поддерживает массив файлов, можно передать files
    // const urls = await uploadFile(files, directory)
    // Если нет — отправляем по одному
    let urls = []
    for (const file of files) {
      const result = await uploadFile(file, directory)
      if (Array.isArray(result)) {
        urls = urls.concat(result)
      } else if (result) {
        urls.push(result)
      }
    }
    return NextResponse.json({ urls })
  } catch (err) {
    return NextResponse.json(
      { error: err.message || 'Ошибка загрузки' },
      { status: 500 },
    )
  }
}
