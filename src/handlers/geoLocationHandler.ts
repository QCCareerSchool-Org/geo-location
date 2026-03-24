import type { RequestHandler } from 'express';

import { getLocation } from '../lib/getLocation';

const maxAge = 300; // five minutes

/**
 * Express handler that returns a GeoLocation object depending on the ip address of the visitor
 * @param req Express request
 * @param res Express response
 */
export const geoLocationHandler: RequestHandler = async (req, res) => {
  const location = await getLocation(req.headers['x-vercel-ip-country'], req.headers['x-vercel-ip-country-region']);
  res.setHeader('Cache-Control', `private, max-age=${maxAge}`);
  res.setHeader('CDN-Cache-Control', 'no-store');
  res.send(location);
};
