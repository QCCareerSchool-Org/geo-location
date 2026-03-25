import { getCache } from '@vercel/functions';
import type { Result } from 'generic-result-type';
import { failure, success } from 'generic-result-type';
import type { RowDataPacket } from 'mysql2';

import { memoryCacheMs } from '../config';
import { pool } from '../pool';

interface ProvinceRow extends RowDataPacket {
  name: string;
}

export const getProvinceName = async (countryCode: string, provinceCode: string): Promise<Result<string | undefined>> => {
  const cache = getCache();
  const key = `province:${countryCode}:${provinceCode}`;

  const cached = await cache.get(key);
  if (cached && typeof cached === 'string') {
    return success(cached);
  }

  try {
    await using connection = await pool.getConnection();
    const [ rows ] = await connection.query<ProvinceRow[]>('SELECT name FROM provinces WHERE country_code = ? AND code = ? LIMIT 1', [ countryCode, provinceCode ]);
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
