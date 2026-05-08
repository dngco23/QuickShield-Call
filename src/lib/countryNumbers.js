export const COUNTRIES = {
  AU: { name: 'Australia', code: '+61', example: '+61 2 1234 5678' },
  US: { name: 'United States', code: '+1', example: '+1 (555) 012-3456' },
  CA: { name: 'Canada', code: '+1', example: '+1 (555) 012-3456' },
  GB: { name: 'United Kingdom', code: '+44', example: '+44 20 1234 5678' },
  IN: { name: 'India', code: '+91', example: '+91 98765 43210' },
  NZ: { name: 'New Zealand', code: '+64', example: '+64 2 1234 567' },
  SG: { name: 'Singapore', code: '+65', example: '+65 6789 1234' },
  JP: { name: 'Japan', code: '+81', example: '+81 3-1234-5678' },
  DE: { name: 'Germany', code: '+49', example: '+49 30 12345678' },
  FR: { name: 'France', code: '+33', example: '+33 1 23 45 67 89' },
};

export function getDefaultNumberForCountry(countryCode) {
  const country = COUNTRIES[countryCode];
  return country?.example || '+1 (555) 012-3456';
}

export function getCountryOptions() {
  return Object.entries(COUNTRIES).map(([code, data]) => ({
    value: code,
    label: data.name,
  }));
}