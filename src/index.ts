import compression from 'compression';
import cors from 'cors';
import express from 'express';
import type { HelmetOptions } from 'helmet';
import helmet from 'helmet';

import { countriesHandler } from './handlers/countriesHandler';
import { cssHandler } from './handlers/cssHandler';
import { errorHandler } from './handlers/errorHandler';
import { geoLocationHandler } from './handlers/geoLocationHandler';
import { httpErrorHandler } from './handlers/httpErrorHandler';
import { provincesHandler } from './handlers/provincesHandler';
import { logger } from './logger';

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
router.get('/ip', geoLocationHandler);
router.get('/css', cssHandler);

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
