import { asyncWrapper } from '../lib/asyncWrapper';
import { pool } from '../pool';

export type Country = {
  code: string;
  name: string;
};

/**
 * Express handler that returns an array of Country objects
 * @param req Express request
 * @param res Express response
 */
export const countriesHandler = asyncWrapper(async (req, res) => {
  const MAX_AGE = 300; // five minutes
  const connection = await (await pool).getConnection();
  try {
    const sql = req.query.ofac !== '0'
      ? 'SELECT code, name FROM countries ORDER BY name'
      : 'SELECT code, name FROM countries WHERE ofac = 0 ORDER BY name';
    const countries: Country[] = await connection.query(sql, req.query.countryCode);

    res.setHeader('Cache-Control', `public, max-age=${MAX_AGE}`);
    res.setHeader('X-Total', countries.length);
    res.send(countries);
  } finally {
    connection.release();
  }
});
