import { AsyncHandler, Controller } from '@/shared/types';
import { Router } from 'express';
import { DriverService } from './driver.service';
import { DriverRepository } from './driver.repository';
import { validate } from '@/shared/middleware/validation.middleware';
import { createDriverSchema } from './driver.schema';
import { handleServiceResponse } from '@/shared/utils/http-handlers';

export class DriverController implements Controller {
  public path = '/drivers';
  public router = Router();
  public driverService: DriverService;

  constructor() {
    this.driverService = new DriverService(new DriverRepository());
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post('/', validate(createDriverSchema), this.createDriver);
    this.router.get('/', this.getDrivers);
  }

  private createDriver: AsyncHandler = async (req, res) => {
    const serviceResponse = await this.driverService.create(req.body);
    handleServiceResponse(serviceResponse, res);
  };

  private getDrivers: AsyncHandler = async (req, res) => {
    const serviceResponse = await this.driverService.get();
    handleServiceResponse(serviceResponse, res);
  };
}
