import maxmind, { CityResponse, Reader } from 'maxmind';

let reader: Reader<CityResponse>;

export const getReader = async (): Promise<Reader<CityResponse>> => {
  if (!reader) {
    reader = await maxmind.open('/usr/share/GeoIP/GeoLite2-City.mmdb');
  }
  return reader;
};
