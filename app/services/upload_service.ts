// app/services/upload_service.ts
import { inject } from '@adonisjs/core'
import Drive from '@adonisjs/drive/services/main'
import type { MultipartFile } from '@adonisjs/core/bodyparser'
import { randomUUID } from 'node:crypto'
import path from 'node:path'
import fs from 'node:fs'

type DiskName = 'local_private' | 's3'

@inject()
export default class UploadService {
  public async save(
    file: MultipartFile,
    prefix: string,
    diskName: DiskName = (process.env.DRIVE_DISK as DiskName) ?? 'local_private'
  ) {
    if (!file.isValid) {
      throw new Error(JSON.stringify(file.errors))
    }

    const safeExt = (file.extname || '').trim().replace(/\s+/g, '')
    const base = `${Date.now()}-${randomUUID()}`
    const name = safeExt ? `${base}.${safeExt}` : base
    const key = path.posix.join(prefix, name)

    const drive = Drive.use(diskName)

    // 1) Si toBuffer() existe (certaines versions), on l’utilise
    const anyFile = file as unknown as { toBuffer?: () => Promise<Buffer> }
    if (typeof anyFile.toBuffer === 'function') {
      const buffer = await anyFile.toBuffer()
      await drive.put(key, buffer, {
        visibility: 'private',
        contentType: file.headers?.['content-type'],
      })
    } else if (file.tmpPath) {
      // 2) Sinon on lit le fichier temporaire
      const buffer = await fs.promises.readFile(file.tmpPath)
      await drive.put(key, buffer, {
        visibility: 'private',
        contentType: file.headers?.['content-type'],
      })
    } else {
      throw new Error('Impossible de lire le fichier (ni buffer, ni tmpPath, ni stream)')
    }

    return {
      disk: diskName,
      key,
      filename: name,
      size: file.size,
      mime: file.headers?.['content-type'] ?? null,
    }
  }
}
