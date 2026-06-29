import type { Result } from 'generic-result-type';
import { failure, success } from 'generic-result-type';
import type { RowDataPacket } from 'mysql2';

import type { Province } from '../domain/province';
import { pool } from '../pool.js';

interface ProvinceRow extends RowDataPacket {
  code: string;
  name: string;
  display: string;
}

export const getProvinces = async (countryCode: string): Promise<Result<Province[]>> => {
  const sql = 'SELECT code, name, display FROM provinces WHERE country_code = ? ORDER BY `order`, name';

  try {
    await using connection = await pool.getConnection();
    const [ rows ] = await connection.query<ProvinceRow[]>(sql, [ countryCode ]);
    return success(rows);
  } catch (err) {
    return failure(err instanceof Error ? err : Error(String(err)));
  }
};
