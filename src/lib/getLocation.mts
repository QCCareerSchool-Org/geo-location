import type { GeoLocation } from '../domain/geoLocation.mjs';
import { defaultLocation } from '../domain/geoLocation.mjs';

type Header = string | string[] | undefined;

export const getLocation = (countryHeader: Header, provinceHeader: Header): GeoLocation => {
  if (typeof countryHeader === 'string') {
    const location: GeoLocation = { countryCode: countryHeader, provinceCode: null };
    if (typeof provinceHeader === 'string') {
      location.provinceCode = provinceHeader;
    }
    return location;
  }

  return defaultLocation;
};
