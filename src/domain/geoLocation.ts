export interface GeoLocation {
  countryCode: string;
  countryName: string;
  provinceCode: string | null;
  provinceName: string | null;
}

export const defaultLocation: Readonly<GeoLocation> = {
  countryCode: 'US',
  countryName: 'United States',
  provinceCode: 'MD',
  provinceName: 'Maryland',
};
