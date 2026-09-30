const fcfa = new Intl.NumberFormat('fr-FR', {
  style: 'currency',
  currency: 'XAF',
  maximumFractionDigits: 0,
})

export const formatPrice = (value) => fcfa.format(value || 0)