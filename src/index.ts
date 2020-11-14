import * as HttpStatus from '@qccareerschool/http-status';
import bodyParser from 'body-parser';
import compression from 'compression';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import maxmind, { Reader, CityResponse } from 'maxmind';
import requestIp from 'request-ip';

import { logger } from './logger';
import { pool } from './pool';

export type IGeoLocation = {
  countryCode: string;
  countryName: string;
  provinceCode: string | null;
  provinceName: string | null;
}

const corsOptions: cors.CorsOptions = {
  allowedHeaders: [ 'Content-Type' ],
  exposedHeaders: [ 'Cache-Control', 'X-Total' ],
  origin: [
    /^(.*\.)?qccareerschool\.com$/,
    /^(.*\.)?qcmakeupacademy\.com$/,
    /^(.*\.)?qceventplanning\.com$/,
    /^(.*\.)?qcdesignschool\.com$/,
    /^(.*\.)?doggroomingcourse\.com$/,
    /^(.*\.)?winghill\.com$/,
    /^(.*\.)?qcwellnessstudies\.com$/,
    /^https:\/\/qccareerschool-com-.*\.now\.sh$/,
    /http:\/\/(.*\.)localhost:3000/,
    'http://localhost:3000',
    'http://localhost:4200',
    'http://localhost:8000',
    'http://192.168.6.197:3000',
    'https://blissful-hopper-b5c7db.netlify.com',
    /www-qcwellnessstudies-com\.now\.sh$/,
    /\.qccareerschool\.now\.sh$/,
  ],
};

const app: express.Express = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(compression());
app.use(helmet({ hsts: false, frameguard: false })); // NGINX will do these
app.use(cors(corsOptions));

const router = express.Router();

router.get('/ip', requestIp.mw(), getGeoIP);
router.get('/provinces', getProvinces);
router.get('/countries', getCountries);
router.get('/css', requestIp.mw(), getCSS);

app.use('/geoLocation', router);

const HTTP_PORT = 15002;

app.listen(HTTP_PORT, () => {
  logger.info(`Server running on port ${HTTP_PORT}`);
});

let cityLookup: Reader<CityResponse>;
maxmind.open<CityResponse>('/usr/share/GeoIP/GeoLite2-City.mmdb').then(c => {
  cityLookup = c;
}).catch(err => {
  logger.error('Error opening maxmind database', err);
  throw err;
});

/**
 *
 * @param req Express request
 * @param res Express response
 */
export function getGeoIP(req: express.Request, res: express.Response): void {

  const MAX_AGE = 600; // ten minutes

  const ip = (req as any).clientIp;
  if (typeof ip  === 'undefined') {
    res.status(HttpStatus.INTERNAL_SERVER_ERROR).send({ message: 'req.clientIp is undefined. Missing middleware?' });
    return;
  }

  getLocation(ip, (err, result) => {
    if (err) {
      logger.error('Unable to perform geo lookup', err);
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).send(err);
      return;
    }

    res.setHeader('Cache-Control', `private, max-age=${MAX_AGE}`);
    res.send(result);
  });

}

/**
 *
 * @param req Express request
 * @param res Express response
 */
export async function getProvinces(req: express.Request, res: express.Response): Promise<void> {

  const MAX_AGE = 86400; // one day

  try {

    if (typeof req.query.countryCode === 'undefined')
      throw new HttpStatus.BadRequest('"countryCode" is required');

    const p = await pool;

    const connection = await p.getConnection();

    try {

      const sql = 'SELECT code, name, display FROM provinces WHERE country_code = ? order by `order`';
      const provinces = await connection.query(sql, req.query.countryCode);

      res.setHeader('Cache-Control', `public, max-age=${MAX_AGE}`); // one day
      res.setHeader('X-Total', provinces.length);
      res.send(provinces);

    } finally {
      p.releaseConnection(connection);
    }

  } catch (err) {
    if (err instanceof HttpStatus.HttpResponse && err.isClientError()) {
      res.status(err.statusCode).send({ message: err.message });
      return;
    }
    logger.error('Could not get provinces', err);
    res.status(HttpStatus.INTERNAL_SERVER_ERROR).send({ error: err, message: err.message });
  }

}

/**
 *
 * @param req Express request
 * @param res Express response
 */
export async function getCountries(req: express.Request, res: express.Response): Promise<void> {

  const MAX_AGE = 86400; // one day

  try {

    const p = await pool;

    const connection = await p.getConnection();

    try {

      let sql: string;
      if (req.query.ofac && req.query.ofac !== '0') {
        sql = 'SELECT code, name FROM countries ORDER BY name';
      } else {
        sql = 'SELECT code, name FROM countries WHERE ofac = 0 ORDER BY name';
      }
      const countries = await connection.query(sql, req.query.countryCode);

      res.setHeader('Cache-Control', `public, max-age=${MAX_AGE}`); // one day
      res.setHeader('X-Total', countries.length);
      res.send(countries);

    } finally {
      p.releaseConnection(connection);
    }

  } catch (err) {
    if (err instanceof HttpStatus.HttpResponse && err.isClientError()) {
      res.status(err.statusCode).send({ message: err.message });
      return;
    }
    logger.error('Could not get counties', err);
    res.status(HttpStatus.INTERNAL_SERVER_ERROR).send({ error: err, message: err.message });
  }

}

/**
 *
 * @param req Express request
 * @param res Express response
 */
export function getCSS(req: express.Request, res: express.Response): void {

  const MAX_AGE = 14400; // four hours

  const ip = (req as any).clientIp;
  if (typeof ip  === 'undefined') {
    const message = 'req.clientIp is undefined. Missing middleware?';
    logger.error(message);
    res.status(HttpStatus.INTERNAL_SERVER_ERROR).send({ message });
    return;
  }

  getLocation(ip, (err, result) => {
    if (err) {
      logger.error('Unable to perform geo lookup', err);
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).send(err);
      return;
    }
    if (typeof result === 'undefined') {
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).send('undefined result');
      return;
    }
    res.setHeader('Content-Type', 'text/css');
    res.setHeader('Cache-Control', `private, max-age=${MAX_AGE}`); // we rely on ip address so private cache only
    res.send(prepareCSS(result, typeof req.query.amp === 'undefined' ? true : false));
  });

}

function getLocation(ip: string | null, cb: (err: Error | null, result?: IGeoLocation) => void): void {

  // prepare the result with default values
  const returnResult: IGeoLocation = {
    countryCode: 'US',
    countryName: 'United States',
    provinceCode: null,
    provinceName: null,
  };

  // if we can't determine the ip address, send the default values
  if (ip === null) {
    return cb(null, returnResult);
  }

  // filter for the Office's IP address
  if (secureIp(ip)) {
    return cb(null, {
      countryCode: 'CA',
      countryName: 'Canada',
      provinceCode: null,
      provinceName: null,
    });
  }

  if (typeof cityLookup !== 'undefined') {

    // look up the location based on the ip address
    const response = cityLookup.get(ip);

    if (response !== null) { // gor a response
      if (typeof response.country !== 'undefined') {
        returnResult.countryCode = response.country.iso_code;
        returnResult.countryName = response.country.names.en;
      }
      if (typeof response.subdivisions !== 'undefined') {
        returnResult.provinceCode = response.subdivisions[0].iso_code;
        returnResult.provinceName = response.subdivisions[0].names.en;
      }
    }

  } else {
    logger.warn('reader no initialized');
  }

  return cb(null, returnResult);
}

function prepareCSS(geoLocation: IGeoLocation, important = true): string {
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
}

function secureIp(ip: string): boolean {
	return ip === '76.70.16.51' || ip === '72.143.75.26';
}
