import { Router } from 'express';
import { Controller } from '@/shared/types';
import { validate } from '@/shared/middleware/validation.middleware';
import { DriverController } from './driver.controller';
import { createDriverSchema } from './driver.schema';

export class DriverRoute implements Controller {
  public path = '/drivers';
  public router = Router();
  private driverController = new DriverController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post('/', validate(createDriverSchema), this.driverController.createDriver);
    this.router.get('/', this.driverController.getDrivers);
  }
}

export const driverRouteDocs = [
  [
    '/drivers',
    {
      post: {
        summary: 'Create driver',
        description:
          'Creates a user, changes the role to DRIVER, and then creates a linked driver record.',
        tags: ['Drivers'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/DriverCreateRequest' },
            },
          },
        },
        responses: {
          '201': {
            description: 'Driver created successfully',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/DriverCreateResponse' },
              },
            },
          },
          '400': {
            description: 'Validation error',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
          '409': {
            description: 'User with this email already exists',
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
      get: {
        summary: 'List drivers',
        tags: ['Drivers'],
        responses: {
          '200': {
            description: 'Drivers fetched successfully',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/DriverListResponse' },
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
