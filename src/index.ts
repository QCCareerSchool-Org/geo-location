import compression from 'compression';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import requestIp from 'request-ip';

import { clientGeoLocationHandler } from './handlers/clientGeoLocationHandler';
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
const helmetOptions = {
  referrerPolicy: false, // already done in apache
  noSniff: false, // already done in apache
  frameguard: false, // already done in apache
} as const;

const HTTP_PORT = 15002;

const router = express.Router();
router.get('/provinces', provincesHandler);
router.get('/countries', countriesHandler);
router.get('/clientIp', clientGeoLocationHandler);
router.get('/ip', requestIp.mw(), geoLocationHandler);
router.get('/css', requestIp.mw(), cssHandler);

const app: express.Express = express();
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

app.listen(HTTP_PORT, () => {
  logger.info(`Server running on port ${HTTP_PORT}`);
});
