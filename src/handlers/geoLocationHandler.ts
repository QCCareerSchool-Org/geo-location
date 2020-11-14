import * as HttpStatus from '@qccareerschool/http-status';

import { asyncWrapper } from '../lib/asyncWrapper';
import { getLocation } from '../lib/getLocation';

/**
 * Express handler that returns a GeoLocation object depending on the ip address of the visitor
 * @param req Express request
 * @param res Express response
 */
export const geoLocationHandler = asyncWrapper(async (req, res) => {
  const MAX_AGE = 600; // ten minutes

  if (typeof req.clientIp === 'undefined') {
    res.status(HttpStatus.INTERNAL_SERVER_ERROR).send({ message: 'req.clientIp is undefined. Missing middleware?' });
    return;
  }

  try {
    const result = await getLocation(req.clientIp);
    res.setHeader('Cache-Control', `private, max-age=${MAX_AGE}`);
    res.send(result);
  } catch(err) {
    throw new HttpStatus.InternalServerError(err.message);
  }
});
