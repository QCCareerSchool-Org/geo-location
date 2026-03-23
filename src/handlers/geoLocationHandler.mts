import type { RequestHandler } from 'express';

import { getLocation } from '../lib/getLocation.mjs';

const MAX_AGE = 300; // five minutes

/**
 * Express handler that returns a GeoLocation object depending on the ip address of the visitor
 * @param req Express request
 * @param res Express response
 */
export const geoLocationHandler: RequestHandler = (req, res) => {
  const location = getLocation(req.headers['x-vercel-ip-country'], req.headers['x-vercel-ip-country-region']);
  res.setHeader('Cache-Control', `public, max-age=${MAX_AGE}`);
  res.send(location);
};
