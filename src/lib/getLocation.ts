import { getCountryName } from './getCountryName';
import { getProvinceName } from './getProvinceName';
import { needsProvince } from './needsProvince';
import type { GeoLocation } from '../domain/geoLocation';
import { defaultLocation } from '../domain/geoLocation';

type Header = string | string[] | undefined;

export const getLocation = async (countryHeader: Header, provinceHeader: Header): Promise<GeoLocation> => {
  if (typeof countryHeader === 'string') {
    const location: GeoLocation = {
      countryCode: countryHeader,
      countryName: '',
      provinceCode: null,
      provinceName: null,
    };

    const countryNameResult = await getCountryName(location.countryCode);
    if (countryNameResult.success) {
      location.countryName = countryNameResult.value;
    }

    if (needsProvince(location.countryCode) && typeof provinceHeader === 'string') {
      location.provinceCode = provinceHeader;
      location.provinceName = '';

      const provinceNameResult = await getProvinceName(location.countryCode, location.provinceCode);
      if (provinceNameResult.success) {
        location.provinceName = provinceNameResult.value;
      }
    }

    return location;
  }

  return defaultLocation;
};
