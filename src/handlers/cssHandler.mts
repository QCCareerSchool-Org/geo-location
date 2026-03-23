import type { RequestHandler } from 'express';

import type { GeoLocation } from '../domain/geoLocation.mjs';
import { getLocation } from '../lib/getLocation.mjs';

const MAX_AGE = 300; // five mintutes

/**
 * Express handler that returns a customized css stylesheet depending on the ip address of the visitor
 * @param req Express request
 * @param res Express response
 */
export const cssHandler: RequestHandler = (req, res) => {
  const result = getLocation(req.headers['x-vercel-ip-country'], req.headers['x-vercel-ip-country-region']);
  res.setHeader('Content-Type', 'text/css');
  res.setHeader('Cache-Control', `private, max-age=${MAX_AGE}`); // response depends on ip address, so private cache only
  res.send(prepareCSS(result, typeof req.query.amp === 'undefined'));
};

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
  } else if ([ 'GB', 'IM', 'GG', 'JE' ].includes(geoLocation.countryCode)) {
    css += `
.no-gb{display:none${imp}}
.ca-only{display:none${imp}}
.us-only{display:none${imp}}
.au-only{display:none${imp}}
.nz-only{display:none${imp}}
.xx-only{display:none${imp}}
.ontario-only{display:none${imp}}`;
  } else if ([ 'AU', 'CX', 'CC' ].includes(geoLocation.countryCode)) {
    css += `
.no-au{display:none${imp}}
.ca-only{display:none${imp}}
.us-only{display:none${imp}}
.gb-only{display:none${imp}}
.nz-only{display:none${imp}}
.xx-only{display:none${imp}}
.ontario-only{display:none${imp}}`;
  } else if ([ 'NZ', 'PN' ].includes(geoLocation.countryCode)) {
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
