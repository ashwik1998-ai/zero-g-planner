// Curated list of countries with IANA timezone, flag emoji, and ISO2 code for flag images
export const COUNTRIES = [
    { code: 'IN', name: 'India', iso2: 'in', flag: '🇮🇳', tz: 'Asia/Kolkata' },
    { code: 'US', name: 'United States (ET)', iso2: 'us', flag: '🇺🇸', tz: 'America/New_York' },
    { code: 'US_PT', name: 'United States (PT)', iso2: 'us', flag: '🇺🇸', tz: 'America/Los_Angeles' },
    { code: 'GB', name: 'United Kingdom', iso2: 'gb', flag: '🇬🇧', tz: 'Europe/London' },
    { code: 'DE', name: 'Germany', iso2: 'de', flag: '🇩🇪', tz: 'Europe/Berlin' },
    { code: 'FR', name: 'France', iso2: 'fr', flag: '🇫🇷', tz: 'Europe/Paris' },
    { code: 'JP', name: 'Japan', iso2: 'jp', flag: '🇯🇵', tz: 'Asia/Tokyo' },
    { code: 'CN', name: 'China', iso2: 'cn', flag: '🇨🇳', tz: 'Asia/Shanghai' },
    { code: 'AU', name: 'Australia (Sydney)', iso2: 'au', flag: '🇦🇺', tz: 'Australia/Sydney' },
    { code: 'CA', name: 'Canada (ET)', iso2: 'ca', flag: '🇨🇦', tz: 'America/Toronto' },
    { code: 'BR', name: 'Brazil', iso2: 'br', flag: '🇧🇷', tz: 'America/Sao_Paulo' },
    { code: 'RU', name: 'Russia (Moscow)', iso2: 'ru', flag: '🇷🇺', tz: 'Europe/Moscow' },
    { code: 'SG', name: 'Singapore', iso2: 'sg', flag: '🇸🇬', tz: 'Asia/Singapore' },
    { code: 'AE', name: 'UAE', iso2: 'ae', flag: '🇦🇪', tz: 'Asia/Dubai' },
    { code: 'ZA', name: 'South Africa', iso2: 'za', flag: '🇿🇦', tz: 'Africa/Johannesburg' },
    { code: 'KR', name: 'South Korea', iso2: 'kr', flag: '🇰🇷', tz: 'Asia/Seoul' },
    { code: 'PK', name: 'Pakistan', iso2: 'pk', flag: '🇵🇰', tz: 'Asia/Karachi' },
    { code: 'NG', name: 'Nigeria', iso2: 'ng', flag: '🇳🇬', tz: 'Africa/Lagos' },
    { code: 'MX', name: 'Mexico', iso2: 'mx', flag: '🇲🇽', tz: 'America/Mexico_City' },
    { code: 'ID', name: 'Indonesia', iso2: 'id', flag: '🇮🇩', tz: 'Asia/Jakarta' },
];

export function getCountryByCode(code: string) {
    return COUNTRIES.find(c => c.code === code) ?? COUNTRIES[0]; // default India
}

// Returns a flagcdn.com image URL for a given iso2 code
export function flagUrl(iso2: string, size: '16x12' | '24x18' | '32x24' | '48x36' = '24x18') {
    return `https://flagcdn.com/${size}/${iso2}.png`;
}
