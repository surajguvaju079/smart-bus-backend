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

export class UserController implements Controller {
  public path = '/users';
  public router = Router();
  private userService: UserService;

  constructor() {
    this.userService = new UserService(new UserRepository());
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post('/', validate(createUserSchema), this.createUser);
    this.router.get('/', validate(listUsersSchema), this.getUsers);
    this.router.get('/:id', validate(getUserSchema), this.getUserById);
    this.router.patch('/:id', validate(updateUserSchema), this.updateUser);
    this.router.delete('/:id', validate(getUserSchema), this.deleteUser);
  }

  private createUser: AsyncHandler = async (req, res) => {
    const response = await this.userService.createUser(req.body);
    res.status(response.statusCode).json(response.toJSON());
  };

  private getUsers: AsyncHandler = async (req, res) => {
    const { page, limit } = req.query as any;
    const response = await this.userService.getUsers(page, limit);

    if (response.isSuccess()) {
      const data = response.getData()!;
      res.status(response.statusCode).json({
        success: true,
        data: data.users,
        meta: data.meta,
      });
    } else {
      res.status(response.statusCode).json(response.toJSON());
    }
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
