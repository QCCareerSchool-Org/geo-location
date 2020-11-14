import * as HttpStatus from '@qccareerschool/http-status';

import { asyncWrapper } from '../lib/asyncWrapper';
import { pool } from '../pool';

export type Province = {
  code: string;
  name: string;
  display: boolean;
}

/**
 * Express handler that returns an array of Province objects for a particular country
 * @param req Express request
 * @param res Express response
 */
export const provincesHandler = asyncWrapper(async (req, res) => {
  const MAX_AGE = 86400; // one day

  if (typeof req.query.countryCode === 'undefined') {
    throw new HttpStatus.BadRequest('"countryCode" is required');
  }

  const p = await pool;
  const connection = await p.getConnection();

  try {
    const sql = 'SELECT code, name, display FROM provinces WHERE country_code = ? order by `order`';
    const provinces: Province[] = await connection.query(sql, req.query.countryCode);

    res.setHeader('Cache-Control', `public, max-age=${MAX_AGE}`); // one day
    res.setHeader('X-Total', provinces.length);
    res.send(provinces);

  } finally {
    p.releaseConnection(connection);
  }
});
