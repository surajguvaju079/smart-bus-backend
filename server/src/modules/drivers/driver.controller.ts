import { AsyncHandler } from '@/shared/types';
import { DriverService } from './driver.service';
import { DriverRepository } from './driver.repository';
import { handleServiceResponse } from '@/shared/utils/http-handlers';

export class DriverController {
  public driverService: DriverService;

  constructor() {
    this.driverService = new DriverService(new DriverRepository());
  }

  public createDriver: AsyncHandler = async (req, res) => {
    const serviceResponse = await this.driverService.create(req.body);
    handleServiceResponse(serviceResponse, res);
  };

  public getDrivers: AsyncHandler = async (req, res) => {
    const serviceResponse = await this.driverService.get();
    handleServiceResponse(serviceResponse, res);
  };
}
