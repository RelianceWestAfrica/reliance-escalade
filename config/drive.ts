import env from '#start/env'
import app from '@adonisjs/core/services/app'
import { defineConfig, services } from '@adonisjs/drive'

/**
 * Si UPLOAD_ROOT est défini dans .env, on l'utilise tel quel.
 * Sinon, on crée un dossier "uploads" à la racine du projet.
 */
const uploadsRoot = env.get('UPLOAD_ROOT') || app.makePath('uploads')

const driveConfig = defineConfig({
  /**
   * Service (disk) par défaut
   */
  default: env.get('DRIVE_DISK'),

  /**
   * Déclaration des services (équivalent des "disks")
   */
  services: {
    fs: services.fs({
      location: uploadsRoot,
      visibility: 'public', // ou 'private'
      serveFiles: true, // permet de servir les fichiers
      routeBasePath: '/uploads', // URL de base pour accéder aux fichiers
    }),
  },
})

export default driveConfig
