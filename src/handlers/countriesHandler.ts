import { Request, Response } from 'express';

import { pool } from '../pool';

export type Country = {
  code: string;
  name: string;
}

/**
 * Express handler that returns an array of Country objects
 * @param req Express request
 * @param res Express response
 */
export const countriesHandler = async (req: Request, res: Response): Promise<void> => {
  const MAX_AGE = 86400; // one day

  const p = await pool;
  const connection = await p.getConnection();

  try {
    const sql = req.query.ofac !== '0'
      ? 'SELECT code, name FROM countries ORDER BY name'
      : 'SELECT code, name FROM countries WHERE ofac = 0 ORDER BY name';
    const countries: Country[] = await connection.query(sql, req.query.countryCode);

    res.setHeader('Cache-Control', `public, max-age=${MAX_AGE}`); // one day
    res.setHeader('X-Total', countries.length);
    res.send(countries);
  } finally {
    p.releaseConnection(connection);
  }
};
