import { Router, Request, Response } from 'express';
import { AuthService } from './auth.service';
import { AsyncHandler, Controller } from '@/shared/types';
import { AuthRepository } from './auth.repository';
import { loginUserSchema } from './auth.schema';
import { validate } from '@/shared/middleware/validation.middleware';

export class AuthController implements Controller {
  public path = '/auth';
  public router = Router();
  private authService: AuthService;

  constructor() {
    this.authService = new AuthService(new AuthRepository());
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post('/login', validate(loginUserSchema), this.loginUser);
  }

  private loginUser: AsyncHandler = async (req, res) => {
    console.log('Login attempt with data:', req.body);
    const { email, password } = req.body;

    const response = await this.authService.loginUser({ email, password });

    res.status(response.statusCode).json(response.toJSON());
  };
}
