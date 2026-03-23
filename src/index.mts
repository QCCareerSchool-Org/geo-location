import compression from 'compression';
import cors from 'cors';
import express from 'express';
import type { HelmetOptions } from 'helmet';
import helmet from 'helmet';
import requestIp from 'request-ip';

import { clientGeoLocationHandler } from './handlers/clientGeoLocationHandler.mjs';
import { countriesHandler } from './handlers/countriesHandler.mjs';
import { cssHandler } from './handlers/cssHandler.mjs';
import { errorHandler } from './handlers/errorHandler.mjs';
import { geoLocationHandler } from './handlers/geoLocationHandler.mjs';
import { httpErrorHandler } from './handlers/httpErrorHandler.mjs';
import { provincesHandler } from './handlers/provincesHandler.mjs';
import { logger } from './logger.mjs';

const corsOptions: cors.CorsOptions = {
  exposedHeaders: [ 'X-Total' ],
  origin: [
    /(?:.*\.)?qccareerschool\.com$/u,
    /(?:.*\.)?qcmakeupacademy\.com$/u,
    /(?:.*\.)?qceventplanning\.com$/u,
    /(?:.*\.)?qcdesignschool\.com$/u,
    /(?:.*\.)?doggroomingcourse\.com$/u,
    /(?:.*\.)?winghill\.com$/u,
    /(?:.*\.)?qcwellnessstudies\.com$/u,
    /(?:.*\.)?qcpetstudies\.com$/u,
    /(?:.*-)?qccareerschool\.vercel\.app$/u,
    /(?:.*\.)?localhost(?::\d{1,5})?$/u,
  ],
};

// these are already done by the proxy
const helmetOptions: HelmetOptions = {
  referrerPolicy: false, // already done in apache
  noSniff: false, // already done in apache
  frameguard: false, // already done in apache
  crossOriginResourcePolicy: false,
} as const;

const router = express.Router();
router.get('/provinces', provincesHandler);
router.get('/countries', countriesHandler);
router.get('/clientIp', clientGeoLocationHandler);
router.get('/ip', requestIp.mw(), geoLocationHandler);
router.get('/css', requestIp.mw(), cssHandler);

const app = express();
app.use(cors(corsOptions));
app.use(helmet(helmetOptions));
app.use(compression());
app.use((req, res, next) => {
  if (req.headers['x-forwarded-for'] === '135.23.119.183' || req.headers['x-forwarded-for'] === '173.242.186.194') {
    logger.info(req.headers);
  }
  next();
});
app.use('/geoLocation', router);
app.use(httpErrorHandler);
app.use(errorHandler);

export default app;
