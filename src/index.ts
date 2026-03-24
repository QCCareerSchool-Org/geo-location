import compression from 'compression';
import type { CorsOptions } from 'cors';
import cors from 'cors';
import express from 'express';
import type { HelmetOptions } from 'helmet';
import helmet from 'helmet';

import { countriesHandler } from './handlers/countriesHandler';
import { cssHandler } from './handlers/cssHandler';
import { geoLocationHandler } from './handlers/geoLocationHandler';
import { globalErrorHandler } from './handlers/globalErrorHandler';
import { provincesHandler } from './handlers/provincesHandler';

const corsOptions: CorsOptions = {
  exposedHeaders: [ 'X-Total' ],
  origin: [
    /\.example2\.com$/u,
    /\.qccareerschool\.com$/u,
    /\.qcdesignschool\.com$/u,
    /\.qceventplanning\.com$/u,
    /\.qcmakeupacademy\.com$/u,
    /\.qcpetstudies\.com$/u,
    /\.qcwellnessstudies\.com$/u,
    /\.winghill\.com$/u,
    /\.pawparentacademy\.com$/u,
    /\.?localhost(?::\d{1,5})?$/u,
  ],
};

// these are already done by the proxy
const helmetOptions: HelmetOptions = {
  referrerPolicy: false, // already done in apache
  noSniff: false, // already done in apache
  frameguard: false, // already done in apache
  crossOriginResourcePolicy: false,
};

const app = express();

app.options('*', cors());
app.use(cors(corsOptions));
app.use(helmet(helmetOptions));
app.use(compression());
app.get('/provinces', provincesHandler);
app.get('/countries', countriesHandler);
app.get('/ip', geoLocationHandler);
app.get('/css', cssHandler);
app.use(globalErrorHandler);

if (process.env.NODE_ENV !== 'production') {
  app.listen(8080);
}

export default app;
