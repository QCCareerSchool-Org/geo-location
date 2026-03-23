import * as HttpStatus from '@qccareerschool/http-status';
import type { RequestHandler } from 'express';
import type { RowDataPacket } from 'mysql2';

import { pool } from '../pool.mjs';

export interface Province {
  code: string;
  name: string;
  display: boolean;
}

const MAX_AGE = 300; // five minutes

/**
 * Express handler that returns an array of Province objects for a particular country
 * @param req Express request
 * @param res Express response
 */
export const provincesHandler: RequestHandler = async (req, res) => {
  if (typeof req.query.countryCode === 'undefined') {
    throw new HttpStatus.BadRequest('"countryCode" is required');
  }

  await using connection = await pool.getConnection();
  const sql = 'SELECT code, name, display FROM provinces WHERE country_code = ? order by `order`';
  const [ results ] = await connection.query<RowDataPacket[]>(sql, req.query.countryCode);

  res.setHeader('Cache-Control', `public, max-age=${MAX_AGE}`);
  res.setHeader('X-Total', results.length);
  res.send(results);
};
