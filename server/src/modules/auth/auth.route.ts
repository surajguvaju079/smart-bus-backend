import { Router } from 'express';
import { Controller } from '@/shared/types';
import { validate } from '@/shared/middleware/validation.middleware';
import { AuthController } from './auth.controller';
import { loginUserSchema } from './auth.schema';

export class AuthRoute implements Controller {
  public path = '/auth';
  public router = Router();
  private authController = new AuthController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post('/login', validate(loginUserSchema), this.authController.loginUser);
  }
}

export const authRouteDocs = [
  [
    '/auth/login',
    {
      post: {
        summary: 'Login user',
        description:
          'Authenticates a user using email and password. If the authenticated user is a driver, driver_id and vehicle_number are included in the user object.',
        tags: ['Auth'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/LoginRequest' },
            },
          },
        },
        responses: {
          '200': {
            description: 'Login successful',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/AuthResponse' },
              },
            },
          },
          '401': {
            description: 'Invalid credentials',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
          '500': {
            description: 'Internal server error',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
        },
      },
    },
  ],
] as const;
