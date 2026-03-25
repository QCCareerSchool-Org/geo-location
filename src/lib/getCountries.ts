import type { Result } from 'generic-result-type';
import { failure, success } from 'generic-result-type';
import type { RowDataPacket } from 'mysql2';

import type { Country } from '../domain/country';
import { pool } from '../pool.mjs';

interface CountryRow extends RowDataPacket {
  code: string;
  name: string;
}

export const getCountries = async (excludeOfac = false): Promise<Result<Country[]>> => {
  const sql = excludeOfac
    ? 'SELECT code, name FROM countries WHERE ofac = 0 ORDER BY name'
    : 'SELECT code, name FROM countries ORDER BY name';

  try {
    await using connection = await pool.getConnection();
    const [ rows ] = await connection.query<CountryRow[]>(sql);
    return success(rows);
  } catch (err) {
    return failure(err instanceof Error ? err : Error(String(err)));
  }
};
