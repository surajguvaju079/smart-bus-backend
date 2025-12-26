import { ROLES } from '@/shared/constants/constant';
import { OpenApiBuilder, OpenAPIObject } from 'openapi3-ts/oas31';

export const openApiSpec: OpenAPIObject = OpenApiBuilder.create({
  openapi: '3.1.0',
  info: {
    title: 'Smart Bus Server',
    version: '1.0.0',
    description: 'API documentation for the Smart Bus backend server',
  },
  servers: [
    {
      url: 'http://localhost:8080/api/v1',
      description: 'Development server',
    },
  ],
})

  .addSecurityScheme('bearerAuth', {
    type: 'http',
    scheme: 'bearer',
    bearerFormat: 'JWT',
    description: 'Enter your JWT token (without "Bearer" prefix)',
  })

  .addPath('/users', {
    post: {
      summary: 'Create a new user',
      tags: ['Users'],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['email', 'name', 'password'],
              properties: {
                email: { type: 'string', format: 'email' },
                name: { type: 'string', minLength: 2 },
                password: { type: 'string', minLength: 6 },
              },
            },
          },
        },
      },
      responses: {
        '201': {
          description: 'User created successfully',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/User',
              },
            },
          },
        },
        '400': { description: 'Validation error' },
        '409': { description: 'User already exists' },
      },
    },
    get: {
      summary: 'List all users',
      tags: ['Users'],
      parameters: [
        {
          name: 'page',
          in: 'query',
          schema: { type: 'integer', minimum: 1, default: 1 },
        },
        {
          name: 'limit',
          in: 'query',
          schema: { type: 'integer', minimum: 1, maximum: 100, default: 10 },
        },
      ],
      responses: {
        '200': {
          description: 'List of users',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/UserListResponse',
              },
            },
          },
        },
      },
    },
  })
  .addPath('/users/{id}', {
    get: {
      summary: 'Get user by ID',
      tags: ['Users'],
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: 'id',
          in: 'path',
          required: true,
          schema: { type: 'integer' },
        },
      ],
      responses: {
        '200': {
          description: 'User found',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/UserResponse',
              },
            },
          },
        },
        '404': { description: 'User not found' },
      },
    },
    patch: {
      summary: 'Update user',
      tags: ['Users'],
      parameters: [
        {
          name: 'id',
          in: 'path',
          required: true,
          schema: { type: 'integer' },
        },
      ],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                email: { type: 'string', format: 'email' },
                name: { type: 'string', minLength: 2 },
              },
            },
          },
        },
      },
      responses: {
        '200': {
          description: 'User updated',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/UserResponse',
              },
            },
          },
        },
        '404': { description: 'User not found' },
      },
    },
    delete: {
      summary: 'Delete user',
      tags: ['Users'],
      parameters: [
        {
          name: 'id',
          in: 'path',
          required: true,
          schema: { type: 'integer' },
        },
      ],
      responses: {
        '204': { description: 'User deleted' },
        '404': { description: 'User not found' },
      },
    },
  })
  .addSchema('User', {
    type: 'object',
    properties: {
      success: { type: 'boolean' },
      responseObject: {
        type: 'object',
        properties: {
          user: {
            type: 'object',
            properties: {
              id: { type: 'integer' },
              email: { type: 'string', format: 'email' },
              name: { type: 'string' },
              role: { type: 'string' },
              createdAt: { type: 'string', format: 'date-time' },
              updatedAt: { type: 'string', format: 'date-time' },
              isFirstLogin: { type: 'boolean' },
              profileImage: { type: ['string', 'null'] },
              phoneNumber: { type: ['string', 'null'] },
            },
          },
        },
      },
    },
  })
  .addSchema('UserResponse', {
    type: 'object',
    properties: {
      success: { type: 'boolean' },
      responseObject: { $ref: '#/components/schemas/User' },
    },
  })
  .addSchema('AuthResponse', {
    type: 'object',
    properties: {
      success: { type: 'boolean' },
      responseObject: {
        type: 'object',
        properties: {
          user: {
            type: 'object',
            properties: {
              id: { type: 'integer' },
              email: { type: 'string', format: 'email' },
              name: { type: 'string' },
              role: { type: 'string' },
              createdAt: { type: 'string', format: 'date-time' },
              updatedAt: { type: 'string', format: 'date-time' },
              isFirstLogin: { type: 'boolean' },
              profileImage: { type: ['string', 'null'] },
              phoneNumber: { type: ['string', 'null'] },
            },
          },
          accessToken: { type: 'string' },
          refreshToken: { type: 'string' },
        },
      },
    },
  })
  .addSchema('UserListResponse', {
    type: 'object',
    properties: {
      success: { type: 'boolean' },
      responseObject: {
        type: 'array',
        items: { $ref: '#/components/schemas/User' },
      },
      meta: {
        type: 'object',
        properties: {
          page: { type: 'integer' },
          limit: { type: 'integer' },
          total: { type: 'integer' },
          totalPages: { type: 'integer' },
        },
      },
    },
  })
  .addPath('/auth/login', {
    post: {
      summary: 'Login user',
      tags: ['Auth'],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['email', 'password'],
              properties: {
                email: { type: 'string', format: 'email' },
                password: { type: 'string' },
              },
            },
          },
        },
      },
      responses: {
        '200': {
          description: 'Login successful',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/AuthResponse',
              },
            },
          },
        },
        '401': { description: 'Invalid credentials' },
      },
    },
  })
  .getSpec();
