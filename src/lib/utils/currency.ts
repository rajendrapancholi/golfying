export function formatRegionalPrice(amount: number, region: string = 'GB') {
  const regionMap: Record<string, { locale: string; currency: string }> = {
    'GB': { locale: 'en-GB', currency: 'GBP' },
    'US': { locale: 'en-US', currency: 'USD' },
    'IN': { locale: 'en-IN', currency: 'INR' },
  };

  const { locale, currency } = regionMap[region] || regionMap['GB'];

  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
  }).format(amount);
}
