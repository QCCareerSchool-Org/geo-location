import * as HttpStatus from '@qccareerschool/http-status';

import { asyncWrapper } from '../lib/asyncWrapper';
import { GeoLocation, getLocation } from '../lib/getLocation';

/**
 * Express handler that returns a customized css stylesheet depending on the ip address of the visitor
 * @param req Express request
 * @param res Express response
 */
export const cssHandler = asyncWrapper(async (req, res) => {
  const MAX_AGE = 300; // five mintutes

  if (typeof req.clientIp === 'undefined') {
    throw new HttpStatus.InternalServerError('req.clientIp is undefined. Missing middleware?');
  }

  try {
    const result = await getLocation(req.clientIp);
    res.setHeader('Content-Type', 'text/css');
    res.setHeader('Cache-Control', `private, max-age=${MAX_AGE}`); // response depends on ip address, so private cache only
    res.send(prepareCSS(result, typeof req.query.amp === 'undefined'));
  } catch (err) {
    throw new HttpStatus.InternalServerError(err.message);
  }
});

export const prepareCSS = (geoLocation: GeoLocation, important = true): string => {
  const imp = important ? '!important' : '';
  let css = `/* ${JSON.stringify(geoLocation)} */`;
  if (geoLocation.countryCode === 'CA') {
    css += `
.no-ca{display:none${imp}}
.us-only{display:none${imp}}
.gb-only{display:none${imp}}
.au-only{display:none${imp}}
.nz-only{display:none${imp}}
.xx-only{display:none${imp}}`;
    if (geoLocation.provinceCode === 'ON') {
      css += `
.no-ontario{display:none${imp}}`;
    } else {
      css += `
.ontario-only{display:none${imp}}`;
    }
  } else if (geoLocation.countryCode === 'US') {
    css += `
.no-us{display:none${imp}}
.ca-only{display:none${imp}}
.gb-only{display:none${imp}}
.au-only{display:none${imp}}
.nz-only{display:none${imp}}
.xx-only{display:none${imp}}
.ontario-only{display:none${imp}}`;
  } else if ([ 'GB', 'IM', 'GG', 'JE' ].indexOf(geoLocation.countryCode) !== -1) {
    css += `
.no-gb{display:none${imp}}
.ca-only{display:none${imp}}
.us-only{display:none${imp}}
.au-only{display:none${imp}}
.nz-only{display:none${imp}}
.xx-only{display:none${imp}}
.ontario-only{display:none${imp}}`;
  } else if ([ 'AU', 'CX', 'CC' ].indexOf(geoLocation.countryCode) !== -1) {
    css += `
.no-au{display:none${imp}}
.ca-only{display:none${imp}}
.us-only{display:none${imp}}
.gb-only{display:none${imp}}
.nz-only{display:none${imp}}
.xx-only{display:none${imp}}
.ontario-only{display:none${imp}}`;
  } else if ([ 'NZ', 'PN' ].indexOf(geoLocation.countryCode) !== -1) {
    css += `
.no-nz{display:none${imp}}
.ca-only{display:none${imp}}
.us-only{display:none${imp}}
.gb-only{display:none${imp}}
.au-only{display:none${imp}}
.xx-only{display:none${imp}}
.ontario-only{display:none${imp}}`;
  } else {
    css += `
.no-xx{display:none${imp}}
.ca-only{display:none${imp}}
.us-only{display:none${imp}}
.gb-only{display:none${imp}}
.au-only{display:none${imp}}
.nz-only{display:none${imp}}
.ontario-only{display:none${imp}}`;
  }
  return css;
};
