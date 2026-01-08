import { AsyncHandler, Controller } from '@/shared/types';
import { Router } from 'express';
import { DriverService } from './driver.service';
import { DriverRepository } from './driver.repository';
import { validate } from '@/shared/middleware/validation.middleware';
import { userLoginSchema } from '../auth/auth.schema';
import { createDriverSchema } from './driver.schema';

export class DriverController implements Controller {
  public path = '/drivers';
  public router = Router();
  public driverService: DriverService;

  constructor() {
    this.driverService = new DriverService(new DriverRepository());
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post('/register', validate(createDriverSchema), this.createDriver);
  }

  private createDriver: AsyncHandler = async (req, res) => {
    const response = await this.driverService.create(req.body);
    res.status(response.statusCode).json(response.toJSON());
  };
}
