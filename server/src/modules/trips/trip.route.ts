import { Router } from 'express';
import { Controller } from '@/shared/types';
import { validate } from '@/shared/middleware/validation.middleware';
import { TripController } from './trip.controller';
import { createTripSchema } from './trip.schema';

export class TripRoute implements Controller {
  public path = '/trips';
  public router = Router();
  private tripController = new TripController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post('/create', validate(createTripSchema), this.tripController.create);
    this.router.get('/', this.tripController.get);
    this.router.get('/driver/:id', this.tripController.getByDriverId);
  }
}

export const tripRouteDocs = [
  [
    '/trips/create',
    {
      post: {
        summary: 'Create trip',
        description:
          'Creates a trip after validating that the driver exists and the vehicle does not already have an ongoing trip.',
        tags: ['Trips'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/TripCreateRequest' },
            },
          },
        },
        responses: {
          '201': {
            description: 'Trip created successfully',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/TripCreateResponse' },
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
          '404': {
            description: 'Driver not found',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
          '409': {
            description: 'Trip with this vehicle is already moving',
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
  [
    '/trips',
    {
      get: {
        summary: 'List trips',
        tags: ['Trips'],
        parameters: [
          {
            name: 'page',
            in: 'query',
            required: false,
            schema: { type: 'integer', minimum: 1, default: 1 },
          },
          {
            name: 'limit',
            in: 'query',
            required: false,
            schema: { type: 'integer', minimum: 1, default: 10 },
          },
        ],
        responses: {
          '200': {
            description: 'Trips fetched successfully',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/TripListResponse' },
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
  [
    '/trips/driver/{id}',
    {
      get: {
        summary: 'List trips by driver ID',
        tags: ['Trips'],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'integer', minimum: 1 },
            description: 'Driver ID',
          },
          {
            name: 'page',
            in: 'query',
            required: false,
            schema: { type: 'integer', minimum: 1, default: 1 },
          },
          {
            name: 'limit',
            in: 'query',
            required: false,
            schema: { type: 'integer', minimum: 1, default: 10 },
          },
        ],
        responses: {
          '200': {
            description: 'Trips for the driver fetched successfully',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/TripListResponse' },
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
