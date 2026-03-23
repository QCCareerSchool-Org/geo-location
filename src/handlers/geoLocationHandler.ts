import * as HttpStatus from '@qccareerschool/http-status';

import { getLocation } from '../lib/getLocation';
import { RequestHandler } from 'express';

const MAX_AGE = 300; // five minutes

/**
 * Express handler that returns a GeoLocation object depending on the ip address of the visitor
 * @param req Express request
 * @param res Express response
 */
export const geoLocationHandler: RequestHandler = async (req, res) => {

  if (typeof req.clientIp === 'undefined') {
    res.status(HttpStatus.INTERNAL_SERVER_ERROR).send({ message: 'req.clientIp is undefined. Missing middleware?' });
    return;
  }

  try {
    const result = await getLocation(req.clientIp);
    res.setHeader('Cache-Control', `private, max-age=${MAX_AGE}`); // response depends on ip address, so private cache only
    res.send(result);
  } catch (err) {
    if (err instanceof Error) {
      throw new HttpStatus.InternalServerError(err.message);
    }
    throw new HttpStatus.InternalServerError(typeof err === 'string' ? err : 'unknown error');
  }
};
