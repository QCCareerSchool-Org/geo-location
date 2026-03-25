import type { RequestHandler } from 'express';

import { browserCacheMs } from '../config.mjs';
import { getLocation } from '../lib/getLocation';

/**
 * Express handler that returns a GeoLocation object depending on the ip address of the visitor
 * @param req Express request
 * @param res Express response
 */
export const geoLocationHandler: RequestHandler = async (req, res) => {
  const location = await getLocation(req.headers['x-vercel-ip-country'], req.headers['x-vercel-ip-country-region']);
  res.setHeader('Cache-Control', `private, max-age=${browserCacheMs}`);
  res.setHeader('CDN-Cache-Control', 'no-store');
  res.send(location);
};
