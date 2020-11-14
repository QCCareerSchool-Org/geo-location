import * as HttpStatus from '@qccareerschool/http-status';
import { NextFunction, Request, Response } from 'express';

import { logger } from '../logger';

export const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction): void => {
  if (err instanceof HttpStatus.HttpResponse && err.isClientError()) {
    res.status(err.statusCode).send({ message: err.message });
    return;
  }
  logger.error('Could not get provinces', err);
  res.status(HttpStatus.INTERNAL_SERVER_ERROR).send({ error: err, message: err.message });
};
