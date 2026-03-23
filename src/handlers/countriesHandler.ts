import type { RowDataPacket } from 'mysql2';

import { asyncWrapper } from '../lib/asyncWrapper';
import { pool } from '../pool';

export interface Country {
  code: string;
  name: string;
}

const MAX_AGE = 300; // five minutes

/**
 * Express handler that returns an array of Country objects
 * @param req Express request
 * @param res Express response
 */
export const countriesHandler = asyncWrapper(async (req, res) => {
  await using connection = await pool.getConnection();
  try {
    const sql = req.query.ofac !== '0'
      ? 'SELECT code, name FROM countries ORDER BY name'
      : 'SELECT code, name FROM countries WHERE ofac = 0 ORDER BY name';
    const [ results ] = await connection.query<RowDataPacket[]>(sql, req.query.countryCode);

    res.setHeader('Cache-Control', `public, max-age=${MAX_AGE}`);
    res.setHeader('X-Total', results.length);
    res.send(results);
  } finally {
    connection.release();
  }
});
