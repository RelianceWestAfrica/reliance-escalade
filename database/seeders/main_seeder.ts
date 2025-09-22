import { BaseSeeder } from '@adonisjs/lucid/seeders'
import User from '#models/user'
import Employee from '#models/employee'
import Post from '#models/post'
import Department from '#models/department'
import { DateTime } from 'luxon'

export default class extends BaseSeeder {
  async run() {
    // Créer les utilisateurs par défaut
    await User.createMany([
      {
        nom: 'ESSOWAVARO',
        prenom: 'Yaya Latifou',
        email: 'dg@reliancewa.com',
        role: 'DG',
        password: 'password123',
        actif: true
      },
      {
        nom: 'PANASSA',
        prenom: 'Rodrigue',
        email: 'drh@reliancewa.com',
        role: 'DRH',
        password: 'password123',
        actif: true
      },
      {
        nom: 'KODAH',
        prenom: 'Ephrem',
        email: 'admin@reliancewa.com',
        role: 'Admin',
        password: 'password123',
        actif: true
      }
    ])

    // Créer les départements
    await Department.createMany([
      {
        nom: 'Direction',
        responsable: 'Yaya Latifou ESSOWAVARO',
        nombreEmployes: 0,
        description: 'Equipe dirigeante'
      },
      {
        nom: 'Administration',
        responsable: 'Rodrigue PANASSA',
        nombreEmployes: 0,
        description: 'Gestion administrative'
      },
      {
        nom: 'Marketing et Communication',
        responsable: 'Charlotte MALM',
        nombreEmployes: 0,
        description: 'Marketing Communication et production audio-visuelle'
      },
      {
        nom: 'Commercial',
        responsable: 'Walter TAYE',
        nombreEmployes: 0,
        description: 'Ventes, prospection et relations clients'
      },
      {
        nom: 'Technique et développement',
        responsable: 'Ephrem KODAH',
        nombreEmployes: 0,
        description: 'Innovation, recherches et développement, programmation, analyse et maintenance'
      },
      {
        nom: 'Comptabilité finances',
        responsable: 'Valeureux INCONNU',
        nombreEmployes: 0,
        description: 'Gestion financière et comptabilité'
      }
    ])

    // Créer quelques postes
    await Post.createMany([
      {
        intitule: 'Directeur Général',
        departement: 'Direction',
        description: 'Direction générale de l\'entreprise'
      },
      {
        intitule: 'Assistante de Direction',
        departement: 'Administration',
        description: 'Assistance à la direction'
      },
      {
        intitule: 'Directeur des ressources humaines',
        departement: 'Administration',
        description: 'Direction ressources humaine et management employés'
      },
      {
        intitule: 'Designer graphique en chef',
        departement: 'Marketing et Communication',
        description: 'Création graphique et communication visuelle'
      },
      {
        intitule: 'Directeur artistique',
        departement: 'Marketing et Communication',
        description: 'Direction production audio-visuelle'
      },
      {
        intitule: 'Metteur en scène',
        departement: 'Marketing et Communication',
        description: 'Coordonnateur production audio-visuelle'
      },
      {
        intitule: 'Chargé production audio et voix-off',
        departement: 'Marketing et Communication',
        description: 'Coordonnateur production audio'
      },
      {
        intitule: 'Influenceur(se) réseaux sociaux',
        departement: 'Marketing et Communication',
        description: 'Gestion identité médias et réseaux sociaux'
      },
      {
        intitule: 'Monteur et post-producteur',
        departement: 'Marketing et Communication',
        description: 'Coordonnateur cadrage, montage et post-production audio-visuelle'
      },
      {
        intitule: 'Community Manager',
        departement: 'Marketing et Communication',
        description: 'Gestion réseaux sociaux, communauté et publications'
      },
      {
        intitule: 'Directeur Commercial',
        departement: 'Commercial',
        description: 'Direction de l\'équipe commerciale'
      },
      {
        intitule: 'Commercial',
        departement: 'Commercial',
        description: 'Prospection et relations clientes'
      },
      {
        intitule: 'Analyste Programmeur',
        departement: 'Technique et développement',
        description: 'Analyse, conception système, développement logiciel et pilotage de projet informatique'
      },
      {
        intitule: 'Développeur Senior',
        departement: 'Technique et développement',
        description: 'Développement d\'applications'
      }
    ])

    // Créer quelques employés
    await Employee.createMany([
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
        actif: true
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
        actif: true
      }
    ])
  }
}
