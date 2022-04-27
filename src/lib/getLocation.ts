import { getReader } from './getReader';
import { secureIp } from './secureIp';

export type GeoLocation = {
  countryCode: string;
  countryName: string;
  provinceCode: string | null;
  provinceName: string | null;
};

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
  if (response !== null && typeof response.country !== 'undefined') { // got a response
    const result: GeoLocation = {
      countryCode: response.country.iso_code,
      countryName: response.country.names.en,
      provinceCode: null,
      provinceName: null,
    };
    if (typeof response.subdivisions !== 'undefined') {
      result.provinceCode = response.subdivisions[0].iso_code;
      result.provinceName = response.subdivisions[0].names.en;
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
