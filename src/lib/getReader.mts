import type { CityResponse, Reader } from 'maxmind';
import maxmind from 'maxmind';
import path from 'node:path';

let reader: Reader<CityResponse> | undefined = undefined;

export const getReader = async (): Promise<Reader<CityResponse>> => {
  reader ??= await maxmind.open(path.join(process.cwd(), 'maxmind/GeoLite2-City.mmdb'));
  return reader;
};
