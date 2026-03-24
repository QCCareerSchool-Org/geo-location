const countries = [ 'CA', 'US', 'AU' ];

export const needsProvince = (countryCode: string): boolean => countries.includes(countryCode);
