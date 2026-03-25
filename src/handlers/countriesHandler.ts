import type { RequestHandler } from 'express';

import { browserCacheMs, cdnCacheMs } from '../config';
import { getCountries } from '../lib/getCountries';

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
  res.setHeader('Cache-Control', `public, max-age=${browserCacheMs}`);
  res.setHeader('CDN-Cache-Control', `max-age=${cdnCacheMs}`);
  res.setHeader('X-Total', countries.length);
  res.send(countries);
};
