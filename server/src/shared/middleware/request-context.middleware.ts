import { Request, Response, NextFunction } from 'express';
import { v4 as uuid } from 'uuid';

export const requestContext = (req: Request, res: Response, next: NextFunction) => {
  const requestId = uuid();
  req.headers['x-request-id'] = requestId;
  (req as any).reqId = requestId;
  res.setHeader('x-request-id', requestId);
  next();
};
