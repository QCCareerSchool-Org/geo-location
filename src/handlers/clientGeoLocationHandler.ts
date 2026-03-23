import * as HttpStatus from '@qccareerschool/http-status';

import { getLocation } from '../lib/getLocation';
import { RequestHandler } from 'express';

const MAX_AGE = 300; // five minutes

/**
 * Express handler that returns a GeoLocation object depending on the ip address of the visitor
 * @param req Express request
 * @param res Express response
 */
export const clientGeoLocationHandler: RequestHandler = async (req, res) => {
  if (typeof req.query.q === 'undefined') {
    res.status(HttpStatus.BAD_REQUEST).send({ message: 'req.query.q is undefined' });
    return;
  }
  if (typeof req.query.q !== 'string') {
    res.status(HttpStatus.BAD_REQUEST).send({ message: 'invalid value for req.query.q' });
    return;
  }

  try {
    const result = await getLocation(req.query.q);
    res.setHeader('Cache-Control', `private, max-age=${MAX_AGE}`); // response depends on ip address, so private cache only
    res.send(result);
  } catch (err) {
    if (err instanceof Error) {
      throw new HttpStatus.InternalServerError(err.message);
    }
    throw new HttpStatus.InternalServerError(typeof err === 'string' ? err : 'unknown error');
  }
};
