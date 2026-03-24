import type { RequestHandler } from 'express';

import { getCountries } from '../lib/getCountries';

const maxAge = 3600; // one hour
const sMaxAge = 86400; // one day

/**
 * Express handler that returns an array of Country objects
 * @param req Express request
 * @param res Express response
 */
export const countriesHandler: RequestHandler = async (req, res) => {
  const countriesResult = await getCountries(req.query.ofac === '0');
  if (!countriesResult.success) {
    res.status(500).send({ message: 'Internal server error' });
    return;
  }

  const countries = countriesResult.value;
  res.setHeader('Cache-Control', `public, max-age=${maxAge}`);
  res.setHeader('CDN-Cache-Control', `max-age=${sMaxAge}`);
  res.setHeader('X-Total', countries.length);
  res.send(countries);
};
