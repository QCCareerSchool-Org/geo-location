import { getCache } from '@vercel/functions';
import type { Result } from 'generic-result-type';
import { failure, success } from 'generic-result-type';
import type { RowDataPacket } from 'mysql2';

import { memoryCacheMs } from '../config.js';
import { pool } from '../pool.js';

interface CountryRow extends RowDataPacket {
  name: string;
}

/**
 *
 * @param code the country code
 * @returns the name of the country or undefined if not found
 */
export const getCountryName = async (code: string): Promise<Result<string | undefined>> => {
  const cache = getCache();
  const key = `country:${code}`;

  const cached = await cache.get(key);
  if (cached && typeof cached === 'string') {
    return success(cached);
  }

  try {
    await using connection = await pool.getConnection();
    const [ rows ] = await connection.query<CountryRow[]>('SELECT name FROM countries WHERE code = ? LIMIT 1', [ code ]);
    const value = rows[0]?.name;

    try {
      await cache.set(key, value, { ttl: memoryCacheMs });
    } catch (err) {
      console.warn(err);
    }

    return success(value);

  } catch (err) {
    return failure(err instanceof Error ? err : Error(String(err)));
  }
};
