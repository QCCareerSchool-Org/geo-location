import { getReader } from './getReader.mts';
import { secureIp } from './secureIp.mts';

export interface GeoLocation {
  countryCode: string;
  countryName: string;
  provinceCode: string | null;
  provinceName: string | null;
}

const defaultLocation: Readonly<GeoLocation> = {
  countryCode: 'US',
  countryName: 'United States',
  provinceCode: 'MD',
  provinceName: 'Maryland',
};

export const getLocation = async (ip?: string): Promise<GeoLocation> => {
  // if we can't determine the ip address, send the default values
  if (typeof ip === 'undefined') {
    return defaultLocation;
  }

  // filter for the Office's IP address
  if (secureIp(ip)) {
    return {
      countryCode: 'CA',
      countryName: 'Canada',
      provinceCode: 'ON',
      provinceName: 'Ontario',
    };
  }

  const reader = await getReader();

  const response = reader.get(ip);
  if (typeof response?.country !== 'undefined') { // got a response
    const result: GeoLocation = {
      countryCode: response.country.iso_code,
      countryName: response.country.names.en,
      provinceCode: null,
      provinceName: null,
    };
    const subdivisions = response.subdivisions?.[0];
    if (subdivisions) {
      result.provinceCode = subdivisions.iso_code;
      result.provinceName = subdivisions.names.en;
    } else {
      if (result.countryCode === 'CA') {
        result.provinceCode = 'ON';
        result.provinceName = 'Ontario';
      } else if (result.countryCode === 'US') {
        result.provinceCode = 'MD';
        result.provinceName = 'Maryland';
      } else if (result.countryCode === 'AU') {
        result.provinceCode = 'NSW';
        result.provinceName = 'New South Wales';
      }
    }
    return result;
  }

  return defaultLocation;
};
