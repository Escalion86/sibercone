# Файловое хранилище Sibercone

Файлы проекта физически лежат на VPS в каталоге
`/home/apps/cloud/client/uploads/<project>/...`. Для Sibercone используются пути
вида `sibercone/products/<slug>`.

Публичный домен файлов и API — `https://cloud.escalion.ru`. Его задаёт
`PUBLIC_BASE_URL` в `/home/apps/cloud/server/.env`. Домены
`escalioncloud.ru` и `api.escalioncloud.ru` больше не используются: их TLS
не работает, а приложение преобразует оставшиеся старые ссылки в актуальный
домен при чтении.

Приложению нужны серверные переменные окружения:

```dotenv
ESCALIONCLOUD_API_URL=https://cloud.escalion.ru/api
ESCALIONCLOUD_PASSWORD=<пароль API>
```

Проверить API напрямую можно так:

```bash
curl -fsS \
  -H "x-api-password: $ESCALIONCLOUD_PASSWORD" \
  -F "directory=sibercone/products/_healthcheck" \
  -F "files=@healthcheck.png;type=image/png" \
  https://cloud.escalion.ru/api

curl -I https://cloud.escalion.ru/uploads/sibercone/products/_healthcheck/<имя-файла>

curl -fsS \
  -H "x-api-password: $ESCALIONCLOUD_PASSWORD" \
  "https://cloud.escalion.ru/api/deletefile?filePath=<путь-из-ответа>"
```

Через приложение загрузка выполняется тем же multipart-контрактом в
`POST /api/admin/upload`, но требует cookie администратора. Пароль облака
никогда не передаётся браузеру.
