import type { Result } from 'generic-result-type';
import { failure, success } from 'generic-result-type';
import type { RowDataPacket } from 'mysql2';

import { pool } from '../pool';

interface ProvinceRow extends RowDataPacket {
  name: string;
}

export const getProvinceName = async (countryCode: string, provinceCode: string): Promise<Result<string>> => {
  let provinceCache = cache.get(countryCode);

  // get cached value or create new province cache
  if (provinceCache) {
    const cached = provinceCache.get(provinceCode);
    if (cached) {
      return success(cached);
    }
  } else {
    provinceCache = new Map<string, string>();
    cache.set(countryCode, provinceCache);
  }

  // look up value
  try {
    await using connection = await pool.getConnection();
    const [ rows ] = await connection.query<ProvinceRow[]>('SELECT name FROM provinces WHERE country_code = ? AND code = ? LIMIT 1', [ countryCode, provinceCode ]);
    const provinceRow = rows[0];
    if (!provinceRow) {
      return failure(Error('Not found'));
    }
    provinceCache.set(provinceCode, provinceRow.name);

    return success(provinceRow.name);
  } catch (err) {
    return failure(err instanceof Error ? err : Error(String(err)));
  }
};

const cache = new Map<string, Map<string, string>>();
