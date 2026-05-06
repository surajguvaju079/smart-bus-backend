import { Router } from 'express';
import { Controller } from '@/shared/types';
import { validate } from '@/shared/middleware/validation.middleware';
import { TripLocationController } from './trip-location.controller';
import { TripLocationSchema } from './trip-location.schema';

export class TripLocationRoute implements Controller {
  public path = '/trip-locations';
  public router = Router();
  private tripLocationController = new TripLocationController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post(
      '/',
      validate(TripLocationSchema),
      this.tripLocationController.createTripLocation
    );
  }
}

export const tripLocationRouteDocs = [
  [
    '/trip-locations',
    {
      post: {
        summary: 'Publish trip location',
        description:
          'Validates the trip_id, then publishes the location payload. The current service responds with a success message rather than returning the saved trip location record.',
        tags: ['Trip Locations'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/TripLocationCreateRequest' },
            },
          },
        },
        responses: {
          '201': {
            description: 'Trip location published successfully',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/TripLocationCreateResponse' },
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
            description: 'Trip not found',
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
