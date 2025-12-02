import { BaseSeeder } from '@adonisjs/lucid/seeders'
import User from '#models/user'
import Employee from '#models/employee'
import Post from '#models/post'
import Department from '#models/department'
import RwaCountry from '#models/rwa_country'
import { DateTime } from 'luxon'

export default class MainSeeder extends BaseSeeder {
  public async run() {
    /**
     * 1) Récupérer le RWA Togo (créé dans RwaCountrySeeder)
     */
    const rwaTogo = await RwaCountry.findBy('accessCode', 'TG_RWAI1')
    if (!rwaTogo) {
      throw new Error('RWA Togo introuvable. Lance d’abord RwaCountrySeeder.')
    }
    const rwaTogoId = rwaTogo.id

    /**
     * 2) Utilisateurs par défaut (upsert par email)
     */
    const usersPayload = [
      {
        nom: 'ESSOWAVARO',
        prenom: 'Yaya Latifou',
        email: 'dg@reliancewa.com',
        role: 'DG' as const,
        password: 'password123',
        actif: true,
        rwaCountryId: rwaTogoId,
      },
      {
        nom: 'PANASSA',
        prenom: 'Rodrigue',
        email: 'drh@reliancewa.com',
        role: 'DRH' as const,
        password: 'password123',
        actif: true,
        rwaCountryId: rwaTogoId,
      },
      {
        nom: 'KODAH',
        prenom: 'Ephrem',
        email: 'admin@reliancewa.com',
        role: 'Admin' as const,
        password: 'password123',
        actif: true,
        rwaCountryId: rwaTogoId,
      },
    ]

    for (const u of usersPayload) {
      const existing = await User.findBy('email', u.email)
      if (existing) {
        existing.merge(u)
        await existing.save()
        console.log(`↷ User déjà existant, mise à jour : ${u.email}`)
      } else {
        await User.create(u)
        console.log(`✔ User créé : ${u.email}`)
      }
    }

    // Récupérer l’admin (utilisé pour userId dans Post / Employee)
    const adminUser = await User.findByOrFail('email', 'admin@reliancewa.com')
    const adminUserId = adminUser.id

    /**
     * 3) Départements (upsert par nom)
     */
    const departmentsPayload = [
      {
        nom: 'Direction',
        responsable: 'Yaya Latifou ESSOWAVARO',
        nombreEmployes: 0,
        description: 'Equipe dirigeante',
      },
      {
        nom: 'Administration',
        responsable: 'Rodrigue PANASSA',
        nombreEmployes: 0,
        description: 'Gestion administrative',
      },
      {
        nom: 'Marketing et Communication',
        responsable: 'Charlotte MALM',
        nombreEmployes: 0,
        description: 'Marketing Communication et production audio-visuelle',
      },
      {
        nom: 'Commercial',
        responsable: 'Walter TAYE',
        nombreEmployes: 0,
        description: 'Ventes, prospection et relations clients',
      },
      {
        nom: 'Technique et développement',
        responsable: 'Ephrem KODAH',
        nombreEmployes: 0,
        description:
          'Innovation, recherches et développement, programmation, analyse et maintenance',
      },
      {
        nom: 'Comptabilité finances',
        responsable: 'Valeureux INCONNU',
        nombreEmployes: 0,
        description: 'Gestion financière et comptabilité',
      },
    ]

    for (const d of departmentsPayload) {
      const existing = await Department.findBy('nom', d.nom)
      if (existing) {
        existing.merge(d)
        await existing.save()
        console.log(`↷ Département déjà existant, mise à jour : ${d.nom}`)
      } else {
        await Department.create(d)
        console.log(`✔ Département créé : ${d.nom}`)
      }
    }

    /**
     * 4) Postes (upsert par intitule)
     */
    const postsPayload = [
      {
        intitule: 'Directeur Général',
        departement: 'Direction',
        description: "Direction générale de l'entreprise",
      },
      {
        intitule: 'Assistante de Direction',
        departement: 'Administration',
        description: 'Assistance à la direction',
      },
      {
        intitule: 'Directeur des ressources humaines',
        departement: 'Administration',
        description: 'Direction ressources humaine et management employés',
      },
      {
        intitule: 'Designer graphique en chef',
        departement: 'Marketing et Communication',
        description: 'Création graphique et communication visuelle',
      },
      {
        intitule: 'Directeur artistique',
        departement: 'Marketing et Communication',
        description: 'Direction production audio-visuelle',
      },
      {
        intitule: 'Metteur en scène',
        departement: 'Marketing et Communication',
        description: 'Coordonnateur production audio-visuelle',
      },
      {
        intitule: 'Chargé production audio et voix-off',
        departement: 'Marketing et Communication',
        description: 'Coordonnateur production audio',
      },
      {
        intitule: 'Influenceur(se) réseaux sociaux',
        departement: 'Marketing et Communication',
        description: 'Gestion identité médias et réseaux sociaux',
      },
      {
        intitule: 'Monteur et post-producteur',
        departement: 'Marketing et Communication',
        description:
          'Coordonnateur cadrage, montage et post-production audio-visuelle',
      },
      {
        intitule: 'Community Manager',
        departement: 'Marketing et Communication',
        description:
          'Gestion réseaux sociaux, communauté et publications',
      },
      {
        intitule: 'Directeur Commercial',
        departement: 'Commercial',
        description: "Direction de l'équipe commerciale",
      },
      {
        intitule: 'Commercial',
        departement: 'Commercial',
        description: 'Prospection et relations clientes',
      },
      {
        intitule: 'Analyste Programmeur',
        departement: 'Technique et développement',
        description:
          'Analyse, conception système, développement logiciel et pilotage de projet informatique',
      },
      {
        intitule: 'Développeur Senior',
        departement: 'Technique et développement',
        description: "Développement d'applications",
      },
    ]

    for (const p of postsPayload) {
      const existing = await Post.findBy('intitule', p.intitule)
      const data = {
        ...p,
        rwaCountryId: rwaTogoId,
        userId: adminUserId,
      }

      if (existing) {
        existing.merge(data)
        await existing.save()
        console.log(`↷ Poste déjà existant, mise à jour : ${p.intitule}`)
      } else {
        await Post.create(data)
        console.log(`✔ Poste créé : ${p.intitule}`)
      }
    }

    /**
     * 5) Employés (upsert par contact)
     */
    const employeesPayload = [
      {
        nom: 'DOH',
        prenom: 'Keli Princesse',
        dateNaissance: DateTime.fromISO('2001-03-03'),
        contact: '+228 91 19 20 20',
        adresse: 'Lomé, Togo',
        poste: 'Assistante de Direction',
        departement: 'Administration',
        datePriseFonction: DateTime.fromISO('2025-03-01'),
        salaire: 850000,
        typeContrat: 'CDI',
        dureeContrat: 0,
        actif: true,
      },
      {
        nom: 'DIATA',
        prenom: 'Velias Venunye',
        dateNaissance: DateTime.fromISO('1998-08-22'),
        contact: '+228 91 01 00 54',
        adresse: 'Lomé, Togo',
        poste: 'Designer graphique',
        departement: 'Marketing et Communication',
        datePriseFonction: DateTime.fromISO('2021-06-15'),
        salaire: 750000,
        typeContrat: 'CDI',
        dureeContrat: 0,
        actif: true,
      },
    ]

    for (const e of employeesPayload) {
      const existing = await Employee.findBy('contact', e.contact)
      const data = {
        ...e,
        rwaCountryId: rwaTogoId,
        userId: adminUserId,
      }

      if (existing) {
        existing.merge(data)
        await existing.save()
        console.log(`↷ Employé déjà existant, mise à jour : ${e.nom} ${e.prenom}`)
      } else {
        await Employee.create(data)
        console.log(`✔ Employé créé : ${e.nom} ${e.prenom}`)
      }
    }
  }
}
