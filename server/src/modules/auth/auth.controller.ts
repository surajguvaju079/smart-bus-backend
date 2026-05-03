import { Router } from 'express';
import { AuthService } from './auth.service';
import { AsyncHandler, Controller } from '@/shared/types';
import { AuthRepository } from './auth.repository';
import { loginUserSchema } from './auth.schema';
import { validate } from '@/shared/middleware/validation.middleware';
import { DriverRepository } from '../drivers/driver.repository';
import { handleServiceResponse } from '@/shared/utils/http-handlers';

export class AuthController implements Controller {
  public path = '/auth';
  public router = Router();
  private authService: AuthService;

  constructor() {
    this.authService = new AuthService(new AuthRepository(), new DriverRepository());
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post('/login', validate(loginUserSchema), this.loginUser);
  }

  private loginUser: AsyncHandler = async (req, res) => {
    const { email, password } = req.body;

    const serviceResponse = await this.authService.loginUser({ email, password });

    handleServiceResponse(serviceResponse, res);
  };
}
