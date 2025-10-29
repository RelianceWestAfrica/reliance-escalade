import { defineConfig, drivers } from '@adonisjs/drive'

const driveConfig = defineConfig({
  disk: process.env.DRIVE_DISK ?? 'local_private',

  disks: {
    // Disque local privé: rien n'est servi publiquement
    local_private: drivers.local({
      root: process.env.DRIVE_LOCAL_ROOT!, // ex: /var/uploads/rwa
      visibility: 'private',
      servePublicFiles: false,
    }),

    // (Optionnel) MinIO/S3 prêt pour plus tard
    s3: drivers.s3({
      bucket: process.env.S3_BUCKET!,
      region: process.env.S3_REGION!,
      credentials: {
        accessKeyId: process.env.S3_ACCESS_KEY!,
        secretAccessKey: process.env.S3_SECRET_KEY!,
      },
      endpoint: process.env.S3_ENDPOINT,
      forcePathStyle: (process.env.S3_FORCE_PATH_STYLE ?? 'true') === 'true',
      signedUrl: { expiresIn: Number(process.env.S3_SIGNED_URL_EXPIRES ?? 900) },
    }),
  },
})

export default driveConfig
