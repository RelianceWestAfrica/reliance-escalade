import { BaseSeeder } from '@adonisjs/lucid/seeders'
import RwaCountry from '#models/rwa_country'

export default class RwaCountrySeeder extends BaseSeeder {
  public async run() {
    const countries = [
      {
        rwaInstanceName: 'RWA Togo',
        instanceCountry: 'Togo',
        accessCode: 'TG_RWAI1',
        instanceCeo: 'Yaya Latifou ESSOWAVARO',
      },
      {
        rwaInstanceName: 'RWA Ghana',
        instanceCountry: 'Ghana',
        accessCode: 'GH_RWAI2',
        instanceCeo: 'Kwame TOUTHANKAMON',
      },
      {
        rwaInstanceName: 'RWA Nigeria',
        instanceCountry: 'Nigeria',
        accessCode: 'NG_RWAI3',
        instanceCeo: 'Obi CHINEDU',
      },
    ]

    for (const country of countries) {
      const existing = await RwaCountry.findBy('accessCode', country.accessCode)

      if (!existing) {
        await RwaCountry.create(country)
        console.log(`✔ Créé : ${country.rwaInstanceName}`)
      } else {
        console.log(`↷ Déjà existant : ${country.rwaInstanceName} → SKIP`)
      }
    }
  }
}
