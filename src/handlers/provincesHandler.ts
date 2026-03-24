import type { RequestHandler } from 'express';

import { getProvinces } from '../lib/getProvinces';

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
  const countryCode = req.query.countryCode;

  if (typeof countryCode !== 'string') {
    res.status(400).send({ message: '"countryCode" is required' });
    return;
  }

  const provincesResult = await getProvinces(countryCode);
  if (!provincesResult.success) {
    res.status(500).send({ message: 'Internal server error' });
    return;
  }

  const provinces = provincesResult.value;
  res.setHeader('Cache-Control', `public, max-age=${MAX_AGE}`);
  res.setHeader('X-Total', provinces.length);
  res.send(provinces);
};
