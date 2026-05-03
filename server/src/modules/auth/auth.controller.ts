import { AuthService } from './auth.service';
import { AsyncHandler } from '@/shared/types';
import { AuthRepository } from './auth.repository';
import { DriverRepository } from '../drivers/driver.repository';
import { handleServiceResponse } from '@/shared/utils/http-handlers';

export class AuthController {
  private authService: AuthService;

  constructor() {
    this.authService = new AuthService(new AuthRepository(), new DriverRepository());
  }

  public loginUser: AsyncHandler = async (req, res) => {
    const { email, password } = req.body;

    const serviceResponse = await this.authService.loginUser({ email, password });

    handleServiceResponse(serviceResponse, res);
  };
}
