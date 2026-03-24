import { getCache } from '@vercel/functions';
import type { Result } from 'generic-result-type';
import { failure, success } from 'generic-result-type';
import type { RowDataPacket } from 'mysql2';

import { pool } from '../pool';

interface CountryRow extends RowDataPacket {
  name: string;
}

export const getCountryName = async (code: string): Promise<Result<string>> => {
  const cache = getCache();
  const key = `country:${code}`;

  const cached = await cache.get(key);
  if (cached && typeof cached === 'string') {
    return success(cached);
  }

  try {
    await using connection = await pool.getConnection();
    const [ rows ] = await connection.query<CountryRow[]>('SELECT name FROM countries WHERE code = ? LIMIT 1', [ code ]);
    const countryRow = rows[0];
    if (!countryRow) {
      return failure(Error('Not found'));
    }

    try {
      await cache.set(key, countryRow.name, { ttl: 3600 });
    } catch (err) {
      console.error(err);
    }

    return success(countryRow.name);

  } catch (err) {
    return failure(err instanceof Error ? err : Error(String(err)));
  }
};
