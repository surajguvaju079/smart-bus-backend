import { z } from 'zod';
export const createRouteSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Route name must be at least 2 characters'),
  }),
});

export const getAllRoutesSchema = z.object({
  query: z.object({
    page: z.coerce.number().min(1).default(1),
    limit: z.coerce.number().min(1).max(100).default(10),
  }),
});

export const getRouteSchema = z.object({
  params: z.object({
    id: z.coerce.number().int().nonnegative(),
  }),
});

export const createFullRouteSchema = z.object({
  query: z.object({
    trip_id: z.coerce.number().int().positive().optional(),
  }),

  body: z.object({
    name: z.string().min(1),

    stops: z
      .array(
        z.object({
          name: z.string().min(1),
          latitude: z.number(),
          longitude: z.number(),
          order: z.number().int().positive(),
        })
      )
      .min(1),
  }),
});

export type CreateRouteDTO = z.infer<typeof createRouteSchema>['body'];
