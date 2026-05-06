import { Response } from 'express';
import { ServiceResponse } from '@/shared/types';

export const handleServiceResponse = (serviceResponse: ServiceResponse, res: Response) => {
  return res.status(serviceResponse.statusCode).json(serviceResponse.toJSON());
};
