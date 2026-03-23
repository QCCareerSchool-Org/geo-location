import type { GeoLocation } from '../domain/geoLocation.mts';
import { defaultLocation } from '../domain/geoLocation.mts';

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
