import { Router } from 'express';
import { Controller } from '@/shared/types';
import { validate } from '@/shared/middleware/validation.middleware';
import { RouteStopController } from './route-stop.controller';
import { addRouteStopsSchema, createRouteStopSchema } from './route-stop.schema';

export class RouteStopRoute implements Controller {
  public path = '/route-stops';
  public router = Router();
  private routeStopController = new RouteStopController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post(
      '/bulk/:id',
      validate(addRouteStopsSchema),
      this.routeStopController.addRouteStops
    );
    this.router.post(
      '/:routeId',
      validate(createRouteStopSchema),
      this.routeStopController.createRouteStop
    );
  }
}

export const routeStopRouteDocs = [
  [
    '/route-stops/{routeId}',
    {
      post: {
        summary: 'Create a single route stop',
        tags: ['Route Stops'],
        parameters: [
          {
            name: 'routeId',
            in: 'path',
            required: true,
            schema: { type: 'integer', minimum: 0 },
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/RouteStopCreateRequest' },
            },
          },
        },
        responses: {
          '201': {
            description: 'Route stop created successfully',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/RouteStopSingleResponse' },
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
    '/route-stops/bulk/{id}',
    {
      post: {
        summary: 'Add multiple route stops to a route',
        tags: ['Route Stops'],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'integer', minimum: 1 },
            description: 'Route ID',
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/BulkRouteStopsCreateRequest' },
            },
          },
        },
        responses: {
          '201': {
            description: 'Route stops added successfully',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/RouteStopListResponse' },
              },
            },
          },
          '400': {
            description: 'Validation error or duplicate stop order detected',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
          '404': {
            description: 'Route not found',
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
