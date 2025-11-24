// Country code mapping: 3-letter code from database -> 2-letter ISO code for flags
// Maps common database country codes to ISO 3166-1 alpha-2 codes
export const COUNTRY_CODE_TO_ISO2: Record<string, string> = {
  // Common formats
  'GBR': 'GB', 'GB': 'GB',
  'USA': 'US', 'US': 'US',
  'IRL': 'IE', 'IE': 'IE',
  'AUT': 'AT', 'AT': 'AT',
  'SGP': 'SG', 'SG': 'SG',
  'DEU': 'DE', 'DE': 'DE',
  'CAN': 'CA', 'CA': 'CA',
  'MEX': 'MX', 'MX': 'MX',
  'SAU': 'SA', 'SA': 'SA',
  'NLD': 'NL', 'NL': 'NL',
  'EGY': 'EG', 'EG': 'EG',
  'ARE': 'AE', 'AE': 'AE',
  'SWE': 'SE', 'SE': 'SE',
  'NZL': 'NZ', 'NZ': 'NZ',
  'PAK': 'PK', 'PK': 'PK',
  'AUS': 'AU', 'AU': 'AU',
  'TUR': 'TR', 'TR': 'TR',
  'OMN': 'OM', 'OM': 'OM',
  'FRA': 'FR', 'FR': 'FR',
  'IND': 'IN', 'IN': 'IN',
  'CHN': 'CN', 'CN': 'CN',
  'JPN': 'JP', 'JP': 'JP',
  'BRA': 'BR', 'BR': 'BR',
  'ITA': 'IT', 'IT': 'IT',
  'ESP': 'ES', 'ES': 'ES',
  'POL': 'PL', 'PL': 'PL',
  'BEL': 'BE', 'BE': 'BE',
  'CHE': 'CH', 'CH': 'CH',
  'NOR': 'NO', 'NO': 'NO',
  'DNK': 'DK', 'DK': 'DK',
  'FIN': 'FI', 'FI': 'FI',
  'PRT': 'PT', 'PT': 'PT',
  'GRC': 'GR', 'GR': 'GR',
  'CZE': 'CZ', 'CZ': 'CZ',
  'ROU': 'RO', 'RO': 'RO',
  'HUN': 'HU', 'HU': 'HU',
  'QAT': 'QA', 'QA': 'QA',
  'KWT': 'KW', 'KW': 'KW',
  'BHR': 'BH', 'BH': 'BH',
  'JOR': 'JO', 'JO': 'JO',
  'LBN': 'LB', 'LB': 'LB',
  'YEM': 'YE', 'YE': 'YE',
  'SYR': 'SY', 'SY': 'SY',
  'IRQ': 'IQ', 'IQ': 'IQ',
  'AFG': 'AF', 'AF': 'AF',
  'BGD': 'BD', 'BD': 'BD',
  'LKA': 'LK', 'LK': 'LK',
  'MYS': 'MY', 'MY': 'MY',
  'IDN': 'ID', 'ID': 'ID',
  'PHL': 'PH', 'PH': 'PH',
  'THA': 'TH', 'TH': 'TH',
  'VNM': 'VN', 'VN': 'VN',
  'KOR': 'KR', 'KR': 'KR',
  'ZAF': 'ZA', 'ZA': 'ZA',
  'NGA': 'NG', 'NG': 'NG',
  'KEN': 'KE', 'KE': 'KE',
  'MAR': 'MA', 'MA': 'MA',
  'TUN': 'TN', 'TN': 'TN',
  'DZA': 'DZ', 'DZ': 'DZ',
  'LBY': 'LY', 'LY': 'LY',
  'SDN': 'SD', 'SD': 'SD',
  'SOM': 'SO', 'SO': 'SO',
  'ETH': 'ET', 'ET': 'ET',
  'GHA': 'GH', 'GH': 'GH',
  'UM': 'UM',
  'VI': 'VI',
};

// Country name mapping: ISO 2-letter code -> Full country name
export const ISO2_TO_COUNTRY_NAME: Record<string, string> = {
  'GB': 'United Kingdom',
  'US': 'United States',
  'IE': 'Ireland',
  'AT': 'Austria',
  'SG': 'Singapore',
  'DE': 'Germany',
  'CA': 'Canada',
  'MX': 'Mexico',
  'SA': 'Saudi Arabia',
  'NL': 'Netherlands',
  'EG': 'Egypt',
  'AE': 'United Arab Emirates',
  'SE': 'Sweden',
  'NZ': 'New Zealand',
  'PK': 'Pakistan',
  'AU': 'Australia',
  'TR': 'Turkey',
  'OM': 'Oman',
  'FR': 'France',
  'IN': 'India',
  'CN': 'China',
  'JP': 'Japan',
  'BR': 'Brazil',
  'IT': 'Italy',
  'ES': 'Spain',
  'PL': 'Poland',
  'BE': 'Belgium',
  'CH': 'Switzerland',
  'NO': 'Norway',
  'DK': 'Denmark',
  'FI': 'Finland',
  'PT': 'Portugal',
  'GR': 'Greece',
  'CZ': 'Czech Republic',
  'RO': 'Romania',
  'HU': 'Hungary',
  'QA': 'Qatar',
  'KW': 'Kuwait',
  'BH': 'Bahrain',
  'JO': 'Jordan',
  'LB': 'Lebanon',
  'YE': 'Yemen',
  'SY': 'Syria',
  'IQ': 'Iraq',
  'AF': 'Afghanistan',
  'BD': 'Bangladesh',
  'LK': 'Sri Lanka',
  'MY': 'Malaysia',
  'ID': 'Indonesia',
  'PH': 'Philippines',
  'TH': 'Thailand',
  'VN': 'Vietnam',
  'KR': 'South Korea',
  'ZA': 'South Africa',
  'NG': 'Nigeria',
  'KE': 'Kenya',
  'MA': 'Morocco',
  'TN': 'Tunisia',
  'DZ': 'Algeria',
  'LY': 'Libya',
  'SD': 'Sudan',
  'SO': 'Somalia',
  'ET': 'Ethiopia',
  'GH': 'Ghana',
  'UM': 'U.S. Minor Outlying Islands',
  'VI': 'U.S. Virgin Islands',
};

// Convert database country code to ISO2 code for flags
export function getISO2Code(dbCode: string): string | null {
  const upperCode = dbCode.toUpperCase().trim();
  return COUNTRY_CODE_TO_ISO2[upperCode] || null;
}

// Get full country name from database code
export function getCountryName(dbCode: string): string {
  const iso2 = getISO2Code(dbCode);
  return iso2 ? (ISO2_TO_COUNTRY_NAME[iso2] || dbCode) : dbCode;
}

// Generate color for country (consistent hashing)
const COLORS = [
  '#3b82f6', '#10b981', '#ef4444', '#ec4899', '#f97316',
  '#eab308', '#06b6d4', '#8b5cf6', '#14b8a6', '#f59e0b',
  '#a855f7', '#6366f1', '#22c55e', '#84cc16', '#f43f5e',
] as const;

export function getCountryColor(countryCode: string): string {
  // Simple hash function for consistent colors
  let hash = 0;
  for (let i = 0; i < countryCode.length; i++) {
    hash = countryCode.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % COLORS.length;
  return COLORS[index]!;
}
