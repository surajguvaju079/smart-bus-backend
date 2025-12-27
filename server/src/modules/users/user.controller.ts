import { Router, Request, Response } from 'express';
import { UserService } from './user.service';
import { UserRepository } from './user.repository';
import { validate } from '@shared/middleware/validation.middleware';
import {
  createUserSchema,
  updateUserSchema,
  getUserSchema,
  listUsersSchema,
} from './user.schema.js';
import { Controller, AsyncHandler } from '@shared/types/index';
import { Authenticate, AuthorizeRoles } from '@/shared/middleware/auth.middleware';
import { ROLES } from '@/shared/constants/constant';

export class UserController implements Controller {
  public path = '/users';
  public router = Router();
  private userService: UserService;

  constructor() {
    this.userService = new UserService(new UserRepository());
    this.initializeRoutes();
  }

  private initializeRoutes() {
    // Create User
    this.router.post('/', validate(createUserSchema), this.createUser);

    // Get Users with Pagination and Role-Based Access Control
    this.router.get(
      '/',
      validate(listUsersSchema),
      /*  Authenticate,
      AuthorizeRoles(ROLES.ADMIN, ROLES.DRIVER), */
      this.getUsers
    );

    // Get User by ID
    this.router.get(
      '/:id',
      validate(getUserSchema),
      /*    Authenticate,
      AuthorizeRoles(ROLES.ADMIN, ROLES.USER, ROLES.DRIVER, ROLES.GUEST),
    */ this.getUserById
    );

    // Update User
    this.router.patch('/:id', validate(updateUserSchema), this.updateUser);

    // Delete User
    this.router.delete('/:id', validate(getUserSchema), this.deleteUser);
  }

  private createUser: AsyncHandler = async (req, res) => {
    const response = await this.userService.createUser(req.body);
    console.log('Create User Response:', response);
    res.status(response.statusCode).json(response.toJSON());
  };

  private getUsers: AsyncHandler = async (req, res) => {
    const { page, limit } = req.query as any;
    const response = await this.userService.getUsers(page, limit);
    res.status(response.statusCode).json(response.toJSON());
  };

  private getUserById: AsyncHandler = async (req, res) => {
    const response = await this.userService.getUserById(Number(req.params.id));
    res.status(response.statusCode).json(response.toJSON());
  };

  private updateUser: AsyncHandler = async (req, res) => {
    const response = await this.userService.updateUser(Number(req.params.id), req.body);
    res.status(response.statusCode).json(response.toJSON());
  };

  private deleteUser: AsyncHandler = async (req, res) => {
    const response = await this.userService.deleteUser(Number(req.params.id));
    res.status(response.statusCode).json(response.toJSON());
  };
}
