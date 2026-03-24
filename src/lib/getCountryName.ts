import type { Result } from 'generic-result-type';
import { failure, success } from 'generic-result-type';
import type { RowDataPacket } from 'mysql2';

import { pool } from '../pool';

interface CountryRow extends RowDataPacket {
  name: string;
}

export const getCountryName = async (countryCode: string): Promise<Result<string>> => {
  const cachedValue = cache.get(countryCode);
  if (cachedValue) {
    return success(cachedValue);
  }

  try {
    await using connection = await pool.getConnection();
    const [ rows ] = await connection.query<CountryRow[]>('SELECT name FROM countries WHERE code = ? LIMIT 1', [ countryCode ]);
    const countryRow = rows[0];
    if (!countryRow) {
      return failure(Error('Not found'));
    }
    cache.set(countryCode, countryRow.name);
    return success(countryRow.name);
  } catch (err) {
    return failure(err instanceof Error ? err : Error(String(err)));
  }
};

const cache = new Map<string, string>();
