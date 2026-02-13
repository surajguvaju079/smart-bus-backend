import { z } from 'zod';

export const createDriverSchema = z.object({
  body: z.object({
    license_number: z.string().min(8, 'License number must be at least 8 numbers.'),
    vehicle_number: z.string().min(4, 'Vehicle number must be at least 4 numbers.'),
    email: z.email('Invalid email format'),
    profile_image: z.string().optional(),
    name: z.string().min(2, 'Name must be at least 2 characters'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
  }),
});

export const getDriversSchema = z.object({
  params: z.object({
    id: z.string().transform(Number),
  }),
});

export type CreateDriverType = z.infer<typeof createDriverSchema>['body'];
