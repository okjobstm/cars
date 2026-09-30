// Libelles FR pour les valeurs d'enums stockees en base (les `value` restent en anglais).
const LABELS = {
  // fuelType
  Petrol: 'Essence',
  Diesel: 'Gasoil',
  Electric: 'Electrique',
  Hybrid: 'Hybride',
  LPG: 'GPL',
  CNG: 'GNV',
  // transmission
  Manual: 'Manuelle',
  Automatic: 'Automatique',
  CVT: 'CVT',
  'Semi-Automatic': 'Semi-automatique',
  // bodyType
  Sedan: 'Berline',
  SUV: 'SUV',
  Hatchback: 'Compacte',
  Coupe: 'Coupe',
  Convertible: 'Cabriolet',
  Wagon: 'Break',
  Pickup: 'Pick-up',
  Van: 'Fourgon',
  // condition
  Excellent: 'Excellent',
  Good: 'Bon',
  Fair: 'Correct',
  Poor: 'Mauvais',
  // role
  user: 'Utilisateur',
  admin: 'Administrateur'
}

export default function label(value) {
  return LABELS[value] || value
}
