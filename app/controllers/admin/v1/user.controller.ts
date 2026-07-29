import { Request, Response } from "express";
import { successResponse } from "../../../helpers/response";
import { validater } from "../../../helpers/validator";
import {
  createUserSchema,
  updateUserSchema,
} from "../../../schemas/admin/v1/user.schema";
import { ValidationException } from "../../../helpers/exceptions";
import { userScope } from "../../../scopes/admin/v1/user.scope";
import UserService from "../../../services/admin/v1/user.service";

class UserController {
  private userService: UserService;

  constructor() {
    this.userService = new UserService();
  }

  async findAll(req: Request, res: Response) {
    const { page, perPage } = req.query;

    const where = userScope(req.query);

    if (page && perPage) {
      const users = await this.userService.findByPaginate(
        +page,
        +perPage,
        where,
      );
      return successResponse(res, "User list successfully", users);
    }

    const users = await this.userService.findAll(where);

    return successResponse(res, "User list successfully", users);
  }

  async findOne(req: Request, res: Response) {
    const user = await this.userService.findOne(+req.params.id);
    return successResponse(res, "User detail successfully", user);
  }

  async findCommonAll(req: Request, res: Response) {
    const where = userScope(req.query);
    const users = await this.userService.findCommonAll(where);
    return successResponse(res, "User list successfully", users);
  }

  async create(req: Request, res: Response) {
    const { data, error, success } = await validater(
      createUserSchema,
      req.body,
    );

    if (!success) {
      throw new ValidationException("User created failed", error);
    }

    const user = await this.userService.create(data);

    return successResponse(res, "User created successfully", user);
  }

  async update(req: Request, res: Response) {
    const { data, error, success } = await validater(
      updateUserSchema,
      req.body,
    );

    if (!success) {
      throw new ValidationException("User updated failed", error);
    }

    const user = await this.userService.update(+req.params.id, data);

    return successResponse(res, "User updated successfully", user);
  }

  async destroy(req: Request, res: Response) {
    await this.userService.destory(+req.params.id);
    return successResponse(res, "User deleted successfully");
  }
}

export default UserController;
