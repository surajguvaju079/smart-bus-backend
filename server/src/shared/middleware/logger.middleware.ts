import { NextFunction } from 'express';
import logger from '@/shared/utils/logger';

export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  logger.info({
    method: req.method,
    url: req.url,
    headers: req.headers,
    body: req.body,
    time: new Date().toISOString(),
  });
  next();
};
