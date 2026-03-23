export interface GeoLocation {
  countryCode: string;
  provinceCode: string | null;
}

export const defaultLocation: Readonly<GeoLocation> = {
  countryCode: 'US',
  provinceCode: 'MD',
};
