import compression from 'compression';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import requestIp from 'request-ip';

import { logger } from './logger';
import { geoLocationHandler } from './handlers/geoLocationHandler';
import { provincesHandler } from './handlers/provincesHandler';
import { countriesHandler } from './handlers/countriesHandler';
import { cssHandler } from './handlers/cssHandler';
import { errorHandler } from './handlers/errorHandler';
import { httpErrorHandler } from './handlers/httpErrorHandler';

const corsOptions: cors.CorsOptions = {
  allowedHeaders: [ 'Content-Type' ],
  exposedHeaders: [ 'Cache-Control', 'X-Total' ],
  origin: [
    /(?:.*\.)?qccareerschool\.com$/,
    /(?:.*\.)?qcmakeupacademy\.com$/,
    /(?:.*\.)?qceventplanning\.com$/,
    /(?:.*\.)?qcdesignschool\.com$/,
    /(?:.*\.)?doggroomingcourse\.com$/,
    /(?:.*\.)?winghill\.com$/,
    /(?:.*\.)?qcwellnessstudies\.com$/,
    /(?:.*\.)?localhost(?::\d{1,5})?$/,
  ],
};

// these are already done by the proxy
const helmetOptions = {
  contentSecurityPolicy: false,
  referrerPolicy: false,
  noSniff: false,
  frameguard: false,
} as const;

const HTTP_PORT = 15002;

const router = express.Router();
router.get('/provinces', provincesHandler);
router.get('/countries', countriesHandler);
router.get('/ip', requestIp.mw(), geoLocationHandler);
router.get('/css', requestIp.mw(), cssHandler);

const app: express.Express = express();
app.use(cors(corsOptions));
app.use((req, res, next) => { res.header('vary', 'origin,accept-encoding'); next(); });
app.use(helmet(helmetOptions));
app.use(compression());
app.use('/geoLocation', router);
app.use(httpErrorHandler);
app.use(errorHandler);

app.listen(HTTP_PORT, () => {
  logger.info(`Server running on port ${HTTP_PORT}`);
});
