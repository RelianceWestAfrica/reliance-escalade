import vine from '@vinejs/vine'

export const jobApplicationValidator = vine.compile(
  vine.object({
    cv: vine.file({
      size: '3mb',
      extnames: ['pdf', 'doc', 'docx'],
    }),

    lettre: vine.file({
      size: '3mb',
      extnames: ['pdf', 'doc', 'docx'],
    }),

    diplome: vine.file({
      size: '3mb',
      extnames: ['pdf', 'jpg', 'jpeg', 'png'],
    }),
  })
)
