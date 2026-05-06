import { UserService } from './user.service';
import { UserRepository } from './user.repository';
import { AsyncHandler } from '@shared/types/index';
import { handleServiceResponse } from '@/shared/utils/http-handlers';

export class UserController {
  private userService: UserService;

  constructor() {
    this.userService = new UserService(new UserRepository());
  }

  public createUser: AsyncHandler = async (req, res) => {
    const serviceResponse = await this.userService.createUser(req.body);
    handleServiceResponse(serviceResponse, res);
  };

  public getUsers: AsyncHandler = async (req, res) => {
    const { page, limit } = req.query as any;
    const serviceResponse = await this.userService.getUsers(page, limit);
    handleServiceResponse(serviceResponse, res);
  };

  public getUserById: AsyncHandler = async (req, res) => {
    const serviceResponse = await this.userService.getUserById(Number(req.params.id));
    handleServiceResponse(serviceResponse, res);
  };

  public updateUser: AsyncHandler = async (req, res) => {
    const serviceResponse = await this.userService.updateUser(Number(req.params.id), req.body);
    handleServiceResponse(serviceResponse, res);
  };

  public deleteUser: AsyncHandler = async (req, res) => {
    const serviceResponse = await this.userService.deleteUser(Number(req.params.id));
    handleServiceResponse(serviceResponse, res);
  };
}
