import type { ErrorRequestHandler } from 'express';

import { logger } from '../logger';

export const globalErrorHandler: ErrorRequestHandler = (err, req, res, next) => {
  logger.error(err);
  if (!res.headersSent) {
    res.status(500).send(JSON.stringify(err));
  } else {
    next(err);
  }
};
