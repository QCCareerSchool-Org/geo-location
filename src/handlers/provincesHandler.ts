import type { RequestHandler } from 'express';

import { getProvinces } from '../lib/getProvinces';

export interface Province {
  code: string;
  name: string;
  display: boolean;
}

const maxAge = 3600; // one hour
const sMaxAge = 86400; // one day

/**
 * Express handler that returns an array of Province objects for a particular country
 * @param req Express request
 * @param res Express response
 */
export const provincesHandler: RequestHandler = async (req, res) => {
  const countryCode = req.query.countryCode;

  if (typeof countryCode !== 'string') {
    console.warn('countryCode missing');
    res.status(400).send({ message: '"countryCode" is required' });
    return;
  }

  const provincesResult = await getProvinces(countryCode);
  if (!provincesResult.success) {
    console.error(`Error fetching provinces for ${countryCode}`);
    res.status(500).send({ message: 'Internal server error' });
    return;
  }

  const provinces = provincesResult.value;
  res.setHeader('Cache-Control', `public, max-age=${maxAge}`);
  res.setHeader('CDN-Cache-Control', `max-age=${sMaxAge}`);

  if (provinces.length) {
    res.setHeader('X-Total', provinces.length);
    res.send(provinces);
  } else {
    res.status(404).send({ message: 'Not found' });
  }
};
