import { z } from 'zod';

export const userSchema = z.object({
  id: z.number(),
  email: z.string().email(),
  name: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const createUserSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email format'),
    name: z.string().min(2, 'Name must be at least 2 characters'),
  }),
});

export const updateUserSchema = z.object({
  params: z.object({
    id: z.string().transform(Number),
  }),
  body: z
    .object({
      email: z.string().email().optional(),
      name: z.string().min(2).optional(),
    })
    .refine((data) => Object.keys(data).length > 0, {
      message: 'At least one field must be provided',
    }),
});

export const getUserSchema = z.object({
  params: z.object({
    id: z.string().transform(Number),
  }),
});

export const listUsersSchema = z.object({
  query: z.object({
    page: z.string().transform(Number).pipe(z.number().min(1)).default(1),
    limit: z.string().transform(Number).pipe(z.number().min(1).max(100)).default(10),
  }),
});

export type User = z.infer<typeof userSchema>;
export type CreateUserDTO = z.infer<typeof createUserSchema>['body'];
export type UpdateUserDTO = z.infer<typeof updateUserSchema>['body'];
