import type { RequestHandler } from 'express';

import { getCSS } from '../lib/getCSS';
import { getLocation } from '../lib/getLocation';

const MAX_AGE = 300; // five mintutes

/**
 * Express handler that returns a customized css stylesheet depending on the ip address of the visitor
 * @param req Express request
 * @param res Express response
 */
export const cssHandler: RequestHandler = async (req, res) => {
  const location = await getLocation(req.headers['x-vercel-ip-country'], req.headers['x-vercel-ip-country-region']);
  res.setHeader('Content-Type', 'text/css');
  res.setHeader('Cache-Control', `private, max-age=${MAX_AGE}`); // response depends on ip address, so private cache only
  res.send(getCSS(location, typeof req.query.amp === 'undefined'));
};
