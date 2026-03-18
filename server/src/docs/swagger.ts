import { OpenApiBuilder, OpenAPIObject } from 'openapi3-ts/oas31';

export const openApiSpec: OpenAPIObject = OpenApiBuilder.create({
  openapi: '3.1.0',
  info: {
    title: 'Smart Bus Server',
    version: '1.0.0',
    description:
      'Complete API documentation for the Smart Bus backend server based on the current controllers, DTOs, validators, and service responses.',
  },
  servers: [
    {
      url: `${process.env.BASE_URL || 'http://localhost:3000'}${process.env.API_PREFIX || '/api/v1'}`,
      description: 'Application API server',
    },
  ],
  tags: [
    { name: 'Auth', description: 'Authentication endpoints' },
    { name: 'Users', description: 'User management endpoints' },
    { name: 'Drivers', description: 'Driver management endpoints' },
    { name: 'Trips', description: 'Trip management endpoints' },
    { name: 'Trip Locations', description: 'Trip location publishing endpoints' },
  ],
})
  .addSecurityScheme('bearerAuth', {
    type: 'http',
    scheme: 'bearer',
    bearerFormat: 'JWT',
    description: 'JWT access token. Send as: Bearer <token>',
  })

  .addSchema('Role', {
    type: 'string',
    enum: ['ADMIN', 'USER', 'DRIVER', 'GUEST'],
  })
  .addSchema('TripStatus', {
    type: 'string',
    enum: ['PLANNED', 'ONGOING', 'COMPLETED', 'CANCELLED'],
  })
  .addSchema('ErrorResponse', {
    type: 'object',
    properties: {
      success: { type: 'boolean', example: false },
      error: {
        type: 'object',
        properties: {
          code: {
            type: 'string',
            enum: [
              'VALIDATION_ERROR',
              'NOT_FOUND',
              'ALREADY_EXISTS',
              'UNAUTHORIZED',
              'FORBIDDEN',
              'BAD_REQUEST',
              'INTERNAL_ERROR',
              'DATABASE_ERROR',
              'SERVICE_UNAVAILABLE',
            ],
          },
          message: { type: 'string' },
          details: {
            oneOf: [
              { type: 'object', additionalProperties: true },
              { type: 'array' },
              { type: 'string' },
            ],
          },
        },
        required: ['code', 'message'],
      },
    },
    required: ['success', 'error'],
  })
  .addSchema('PaginationMeta', {
    type: 'object',
    properties: {
      page: { type: 'integer', example: 1 },
      limit: { type: 'integer', example: 10 },
      total: { type: 'integer', example: 25 },
      totalPages: { type: 'integer', example: 3 },
    },
    required: ['page', 'limit', 'total', 'totalPages'],
  })
  .addSchema('UserDto', {
    type: 'object',
    properties: {
      id: { type: 'integer', example: 1 },
      email: { type: 'string', format: 'email', example: 'user@example.com' },
      name: { type: 'string', example: 'John Doe' },
      role: { $ref: '#/components/schemas/Role' },
      profileImage: { type: ['string', 'null'], example: null },
      isFirstLogin: {
        oneOf: [{ type: 'boolean' }, { type: 'string' }, { type: 'null' }],
        example: false,
      },
      phoneNumber: { type: ['string', 'null'], example: null },
      createdAt: { type: 'string', format: 'date-time' },
      updatedAt: { type: 'string', format: 'date-time' },
    },
    required: [
      'id',
      'email',
      'name',
      'role',
      'profileImage',
      'isFirstLogin',
      'phoneNumber',
      'createdAt',
      'updatedAt',
    ],
  })
  .addSchema('AuthUserDto', {
    type: 'object',
    properties: {
      id: { type: 'integer', example: 1 },
      email: { type: 'string', format: 'email', example: 'driver@example.com' },
      name: { type: 'string', example: 'Driver One' },
      role: { $ref: '#/components/schemas/Role' },
      profileImage: { type: ['string', 'null'], example: null },
      isFirstLogin: {
        oneOf: [{ type: 'boolean' }, { type: 'string' }, { type: 'null' }],
        example: false,
      },
      phoneNumber: { type: ['string', 'null'], example: null },
      createdAt: { type: 'string', format: 'date-time' },
      updatedAt: { type: 'string', format: 'date-time' },
      driver_id: { type: ['integer', 'null'], example: 10 },
      vehicle_number: { type: ['string', 'null'], example: 'BA-01-PA-1234' },
    },
    required: [
      'id',
      'email',
      'name',
      'role',
      'profileImage',
      'isFirstLogin',
      'phoneNumber',
      'createdAt',
      'updatedAt',
    ],
  })
  .addSchema('DriverDto', {
    type: 'object',
    properties: {
      id: { type: 'integer', example: 1 },
      vehicleNumber: { type: 'string', example: 'BA-01-PA-1234' },
      name: { type: 'string', example: 'Driver One' },
      email: { type: 'string', format: 'email', example: 'driver@example.com' },
      currentLatitude: { oneOf: [{ type: 'number' }, { type: 'null' }], example: null },
      currentLongitude: { oneOf: [{ type: 'number' }, { type: 'null' }], example: null },
      isAvailable: { type: 'boolean', example: false },
      isVerified: { type: 'boolean', example: false },
      createdAt: { type: 'string', format: 'date-time' },
      updatedAt: { type: 'string', format: 'date-time' },
    },
    required: [
      'id',
      'vehicleNumber',
      'name',
      'email',
      'currentLatitude',
      'currentLongitude',
      'isAvailable',
      'isVerified',
      'createdAt',
      'updatedAt',
    ],
  })
  .addSchema('TripDto', {
    type: 'object',
    properties: {
      id: { type: 'integer', example: 1 },
      driverId: { type: 'integer', example: 3 },
      startLatitude: { type: 'number', example: 27.7172 },
      startLongitude: { type: 'number', example: 85.324 },
      startLocationName: { type: 'string', example: 'Kathmandu' },
      endLatitude: { type: 'number', example: 27.671 },
      endLongitude: { type: 'number', example: 85.4298 },
      endLocationName: { type: 'string', example: 'Bhaktapur' },
      startTime: { type: 'string', format: 'date-time' },
      endTime: { type: ['string', 'null'], format: 'date-time', example: null },
      createdAt: { type: 'string', format: 'date-time' },
      updatedAt: { type: 'string', format: 'date-time' },
      status: { $ref: '#/components/schemas/TripStatus' },
      vehicleNumber: { type: 'string', example: 'BA-01-PA-1234' },
    },
    required: [
      'id',
      'driverId',
      'startLatitude',
      'startLongitude',
      'startLocationName',
      'endLatitude',
      'endLongitude',
      'endLocationName',
      'startTime',
      'endTime',
      'createdAt',
      'updatedAt',
      'status',
      'vehicleNumber',
    ],
  })
  .addSchema('TripLocationDto', {
    type: 'object',
    properties: {
      id: { type: 'integer', example: 1 },
      tripId: { type: 'integer', example: 1 },
      latitude: { type: 'number', example: 27.7172 },
      longitude: { type: 'number', example: 85.324 },
      timestamp: { type: 'string', format: 'date-time' },
      speed: { oneOf: [{ type: 'number' }, { type: 'null' }], example: 34.5 },
      recordedAt: { type: ['string', 'null'], format: 'date-time', example: null },
    },
    required: ['id', 'tripId', 'latitude', 'longitude', 'timestamp'],
  })
  .addSchema('UserCreateRequest', {
    type: 'object',
    required: ['email', 'name', 'password'],
    properties: {
      email: { type: 'string', format: 'email', example: 'user@example.com' },
      name: { type: 'string', minLength: 2, example: 'John Doe' },
      password: { type: 'string', minLength: 6, example: 'secret123' },
    },
  })
  .addSchema('UserUpdateRequest', {
    type: 'object',
    minProperties: 1,
    properties: {
      email: { type: 'string', format: 'email' },
      name: { type: 'string', minLength: 2 },
      role: { $ref: '#/components/schemas/Role' },
      profile_image: { type: ['string', 'null'] },
      phone_number: { type: ['string', 'null'] },
    },
  })
  .addSchema('LoginRequest', {
    type: 'object',
    required: ['email', 'password'],
    properties: {
      email: { type: 'string', format: 'email', example: 'user@example.com' },
      password: { type: 'string', minLength: 6, example: 'secret123' },
    },
  })
  .addSchema('DriverCreateRequest', {
    type: 'object',
    required: ['license_number', 'vehicle_number', 'email', 'name', 'password'],
    properties: {
      license_number: { type: 'string', minLength: 8, example: 'LIC12345678' },
      vehicle_number: { type: 'string', minLength: 4, example: 'BA-01-PA-1234' },
      email: { type: 'string', format: 'email', example: 'driver@example.com' },
      profile_image: { type: 'string', example: 'https://example.com/profile.jpg' },
      name: { type: 'string', minLength: 2, example: 'Driver One' },
      password: { type: 'string', minLength: 6, example: 'secret123' },
    },
  })
  .addSchema('TripCreateRequest', {
    type: 'object',
    required: [
      'driver_id',
      'start_time',
      'start_location_name',
      'start_latitude',
      'start_longitude',
      'end_location_name',
      'end_latitude',
      'end_longitude',
      'vehicle_number',
    ],
    properties: {
      driver_id: { type: 'integer', minimum: 0, example: 1 },
      start_time: { type: 'string', format: 'date-time', example: '2026-03-18T08:00:00Z' },
      start_location_name: { type: 'string', minLength: 3, example: 'Kathmandu' },
      start_latitude: { type: 'number', example: 27.7172 },
      start_longitude: { type: 'number', example: 85.324 },
      end_location_name: { type: 'string', minLength: 3, example: 'Bhaktapur' },
      end_latitude: { type: 'number', example: 27.671 },
      end_longitude: { type: 'number', example: 85.4298 },
      vehicle_number: { type: 'string', minLength: 4, example: 'BA-01-PA-1234' },
      end_time: { type: 'string', format: 'date-time', example: '2026-03-18T10:00:00Z' },
    },
  })
  .addSchema('TripLocationCreateRequest', {
    type: 'object',
    required: ['trip_id', 'latitude', 'longitude'],
    properties: {
      trip_id: { type: 'integer', minimum: 0, example: 1 },
      latitude: { type: 'number', example: 27.7172 },
      longitude: { type: 'number', example: 85.324 },
      timestamp: { type: 'string', format: 'date-time', example: '2026-03-18T08:05:00Z' },
      speed: { type: 'number', example: 42.1 },
      recorded_at: { type: 'string', format: 'date-time', example: '2026-03-18T08:05:00Z' },
    },
  })
  .addSchema('UserSingleResponse', {
    type: 'object',
    properties: {
      success: { type: 'boolean', example: true },
      responseObject: { $ref: '#/components/schemas/UserDto' },
    },
    required: ['success', 'responseObject'],
  })
  .addSchema('UserListResponse', {
    type: 'object',
    properties: {
      success: { type: 'boolean', example: true },
      responseObject: {
        type: 'object',
        properties: {
          users: {
            type: 'array',
            items: { $ref: '#/components/schemas/UserDto' },
          },
          meta: { $ref: '#/components/schemas/PaginationMeta' },
        },
        required: ['users', 'meta'],
      },
    },
    required: ['success', 'responseObject'],
  })
  .addSchema('AuthResponse', {
    type: 'object',
    properties: {
      success: { type: 'boolean', example: true },
      responseObject: {
        type: 'object',
        properties: {
          user: { $ref: '#/components/schemas/AuthUserDto' },
          access_token: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' },
          refresh_token: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' },
        },
        required: ['user', 'access_token', 'refresh_token'],
      },
    },
    required: ['success', 'responseObject'],
  })
  .addSchema('DriverCreateResponse', {
    type: 'object',
    properties: {
      success: { type: 'boolean', example: true },
      responseObject: {
        type: 'object',
        properties: {
          name: { type: 'string', example: 'Driver One' },
          email: { type: 'string', format: 'email', example: 'driver@example.com' },
        },
        required: ['name', 'email'],
      },
    },
    required: ['success', 'responseObject'],
  })
  .addSchema('DriverListResponse', {
    type: 'object',
    properties: {
      success: { type: 'boolean', example: true },
      responseObject: {
        type: 'array',
        items: { $ref: '#/components/schemas/DriverDto' },
      },
    },
    required: ['success', 'responseObject'],
  })
  .addSchema('TripCreateResponse', {
    type: 'object',
    properties: {
      success: { type: 'boolean', example: true },
      responseObject: {
        type: 'object',
        properties: {
          id: { type: 'integer', example: 1 },
          driver_id: { type: 'integer', example: 1 },
          vehicle_number: { type: 'string', example: 'BA-01-PA-1234' },
          start_location_name: { type: 'string', example: 'Kathmandu' },
          start_latitude: { type: 'number', example: 27.7172 },
          start_longitude: { type: 'number', example: 85.324 },
          end_location_name: { type: 'string', example: 'Bhaktapur' },
          end_latitude: { type: 'number', example: 27.671 },
          end_longitude: { type: 'number', example: 85.4298 },
          status: { $ref: '#/components/schemas/TripStatus' },
          start_time: { type: 'string', format: 'date-time' },
          end_time: { type: ['string', 'null'], format: 'date-time' },
          created_at: { type: 'string', format: 'date-time' },
          updated_at: { type: 'string', format: 'date-time' },
        },
      },
    },
    required: ['success', 'responseObject'],
  })
  .addSchema('TripListResponse', {
    type: 'object',
    properties: {
      success: { type: 'boolean', example: true },
      responseObject: {
        type: 'object',
        properties: {
          trips: {
            type: 'array',
            items: { $ref: '#/components/schemas/TripDto' },
          },
        },
        required: ['trips'],
      },
    },
    required: ['success', 'responseObject'],
  })
  .addSchema('TripLocationCreateResponse', {
    type: 'object',
    properties: {
      success: { type: 'boolean', example: true },
      responseObject: {
        type: 'object',
        properties: {
          message: { type: 'string', example: 'Location published successfully' },
        },
        required: ['message'],
      },
    },
    required: ['success', 'responseObject'],
  })
  .addSchema('DeleteSuccessResponse', {
    type: 'object',
    properties: {
      success: { type: 'boolean', example: true },
      responseObject: { type: 'null', example: null },
    },
    required: ['success', 'responseObject'],
  })

  .addPath('/auth/login', {
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
  })

  .addPath('/users', {
    post: {
      summary: 'Create a new user',
      tags: ['Users'],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/UserCreateRequest' },
          },
        },
      },
      responses: {
        '201': {
          description: 'User created successfully',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/UserSingleResponse' },
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
          description: 'Email already in use',
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
      summary: 'List users',
      tags: ['Users'],
      parameters: [
        {
          name: 'page',
          in: 'query',
          required: false,
          schema: { type: 'integer', minimum: 1, default: 1 },
          description: 'Page number',
        },
        {
          name: 'limit',
          in: 'query',
          required: false,
          schema: { type: 'integer', minimum: 1, maximum: 100, default: 10 },
          description: 'Items per page',
        },
      ],
      responses: {
        '200': {
          description: 'Users fetched successfully',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/UserListResponse' },
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
  })

  .addPath('/users/{id}', {
    get: {
      summary: 'Get user by ID',
      tags: ['Users'],
      parameters: [
        {
          name: 'id',
          in: 'path',
          required: true,
          schema: { type: 'integer', minimum: 1 },
        },
      ],
      responses: {
        '200': {
          description: 'User found',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/UserSingleResponse' },
            },
          },
        },
        '404': {
          description: 'User not found',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ErrorResponse' },
            },
          },
        },
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
          schema: { type: 'integer', minimum: 1 },
        },
      ],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/UserUpdateRequest' },
          },
        },
      },
      responses: {
        '200': {
          description: 'User updated successfully',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/UserSingleResponse' },
            },
          },
        },
        '404': {
          description: 'User not found',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ErrorResponse' },
            },
          },
        },
        '409': {
          description: 'Email already in use',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ErrorResponse' },
            },
          },
        },
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
          schema: { type: 'integer', minimum: 1 },
        },
      ],
      responses: {
        '204': {
          description: 'User deleted successfully',
        },
        '200': {
          description: 'Some setups may still serialize the no-content response body',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/DeleteSuccessResponse' },
            },
          },
        },
        '404': {
          description: 'User not found',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ErrorResponse' },
            },
          },
        },
      },
    },
  })

  .addPath('/drivers', {
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
  })

  .addPath('/trips/create', {
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
  })

  .addPath('/trips', {
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
  })

  .addPath('/trips/driver/{id}', {
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
  })

  .addPath('/trip-locations', {
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
  })

  .getSpec();
