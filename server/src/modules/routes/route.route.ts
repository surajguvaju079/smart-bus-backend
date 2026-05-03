import { Router } from 'express';
import { Controller } from '@/shared/types';
import { validate } from '@/shared/middleware/validation.middleware';
import { RouteController } from './route.controller';
import {
  createFullRouteSchema,
  createRouteSchema,
  getAllRoutesSchema,
  getRouteSchema,
} from './route.schema';

export class RouteRoute implements Controller {
  public path = '/routes';
  public router = Router();
  private routeController = new RouteController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post('/', validate(createRouteSchema), this.routeController.createRoute);
    this.router.get('/', validate(getAllRoutesSchema), this.routeController.getRoutes);
    this.router.get('/one/:id', validate(getRouteSchema), this.routeController.getRouteByRouteId);
    this.router.post(
      '/full',
      validate(createFullRouteSchema),
      this.routeController.createFullRoute
    );
    this.router.get('/:id', validate(getRouteSchema), this.routeController.getRoute);
  }
}

const paginatedRouteParams = [
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
    schema: { type: 'integer', minimum: 1, maximum: 100, default: 10 },
  },
];

const routeIdParam = {
  name: 'id',
  in: 'path',
  required: true,
  schema: { type: 'integer', minimum: 0 },
};

export const routeRouteDocs = [
  [
    '/routes',
    {
      post: {
        summary: 'Create route',
        tags: ['Routes'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/RouteCreateRequest' },
            },
          },
        },
        responses: {
          '201': {
            description: 'Route created successfully',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/RouteSingleResponse' },
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
      get: {
        summary: 'List routes',
        tags: ['Routes'],
        parameters: paginatedRouteParams,
        responses: {
          '200': {
            description: 'Routes fetched successfully',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/RouteListResponse' },
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
    '/routes/{id}',
    {
      get: {
        summary: 'Get trip route with stops',
        description:
          'Fetches the route assigned to a trip by resolving the route ID from the trip ID.',
        tags: ['Routes'],
        parameters: [{ ...routeIdParam, description: 'Trip ID' }],
        responses: {
          '200': {
            description: 'Route found',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/RouteWithStopsResponse' },
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
  [
    '/routes/one/{id}',
    {
      get: {
        summary: 'Get route by route ID with stops',
        description: 'Fetches a route directly by route ID and includes its configured stops.',
        tags: ['Routes'],
        parameters: [{ ...routeIdParam, description: 'Route ID' }],
        responses: {
          '200': {
            description: 'Route found',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/RouteWithStopsResponse' },
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
  [
    '/routes/full',
    {
      post: {
        summary: 'Create full route with stops and optionally link to trip',
        tags: ['Routes'],
        parameters: [
          {
            name: 'trip_id',
            in: 'query',
            required: false,
            schema: { type: 'integer', minimum: 1 },
            description: 'Optional trip ID to link the new route to an existing trip',
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/FullRouteCreateRequest' },
            },
          },
        },
        responses: {
          '200': {
            description: 'Full route created successfully',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/FullRouteCreateResponse' },
              },
            },
          },
          '400': {
            description: 'Validation error or duplicate stop order',
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
