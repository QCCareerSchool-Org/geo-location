import { getReader } from './getReader';
import { secureIp } from './secureIp';

export type GeoLocation = {
  countryCode: string;
  countryName: string;
  provinceCode: string | null;
  provinceName: string | null;
}

export const getLocation = async (ip?: string): Promise<GeoLocation> => {
  // prepare the result with default values
  const result: GeoLocation = {
    countryCode: 'US',
    countryName: 'United States',
    provinceCode: null,
    provinceName: null,
  };

  // if we can't determine the ip address, send the default values
  if (typeof ip === 'undefined') {
    return result;
  }

  // filter for the Office's IP address
  if (secureIp(ip)) {
    return {
      countryCode: 'CA',
      countryName: 'Canada',
      provinceCode: null,
      provinceName: null,
    };
  }

  const reader = await getReader();

  const response = reader.get(ip);
  if (response !== null) { // gor a response
    if (typeof response.country !== 'undefined') {
      result.countryCode = response.country.iso_code;
      result.countryName = response.country.names.en;
    }
    if (typeof response.subdivisions !== 'undefined') {
      result.provinceCode = response.subdivisions[0].iso_code;
      result.provinceName = response.subdivisions[0].names.en;
    }
  }
  return result;
};
