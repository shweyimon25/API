import { Request, Response } from "express";
import { successResponse } from "../../../helpers/response";
import UserService from "../../../services/admin/v1/user.service";
import { validater } from "../../../helpers/validator";
import {
  createUserSchema,
  updateUserSchema,
} from "../../../schemas/admin/v1/user.schema";
import { ValidationException } from "../../../helpers/exceptions";
import { UserCollection } from "../../../resources/admin/v1/user/user.collection";
import { UserResource } from "../../../resources/admin/v1/user/user.resource";
import { Prisma, Status, User } from "@prisma/client";

class UserController {
  private userService: UserService;

  constructor() {
    this.userService = new UserService();
  }

  async findAll(req: Request, res: Response) {
    const { page, perPage, name, email, username, status, roleId } = req.query;

    let where: Prisma.UserWhereInput = {};

    if (name || email || username) {
      where.OR = [];
      if (name) {
        where.OR.push({
          name: {
            contains: name as string,
          },
        });
      }
      if (email) {
        where.OR.push({
          email: {
            contains: email as string,
          },
        });
      }
      if (username) {
        where.OR.push({
          username: {
            contains: username as string,
          },
        });
      }
    }

    if (status) {
      where.status = status as Status;
    }

    if (roleId) {
      where.roles = {
        some: {
          roleId: +roleId,
        },
      };
    }

    if (page && perPage) {
      const users = await this.userService.findByPaginate(+page, +perPage, where);
      return successResponse(
        res,
        "User list successfully",
        UserCollection.withPagination(users)
      );
    }

    const users = await this.userService.findAll(where);
    return successResponse(
      res,
      "User list successfully",
      UserCollection.toCollection(users)
    );
  }

  async findCommonAll(req: Request, res: Response) {
    const { name, email, username, roleId } = req.query;

    let where: Prisma.UserWhereInput = {};

    if (name || email || username) {
      where.OR = [];
      if (name) {
        where.OR.push({
          name: {
            contains: name as string,
          },
        });
      }
      if (email) {
        where.OR.push({
          email: {
            contains: email as string,
          },
        });
      }
      if (username) {
        where.OR.push({
          username: {
            contains: username as string,
          },
        });
      }
    }

    if (roleId) {
      where.roles = {
        some: {
          roleId: +roleId,
        },
      };
    }

    const users = await this.userService.findCommonAll(where);
    return successResponse(
      res,
      "Common User list successfully",
      UserCollection.toCommonCollection(users)
    );
  }

  async findOne(req: Request, res: Response) {
    const user = await this.userService.findOne(+req.params.id);
    return successResponse(
      res,
      "User detail successfully",
      UserResource.toResource(user)
    );
  }

  async create(req: Request, res: Response) {
    const { data, error, success } = await validater(
      createUserSchema,
      req.body
    );

    if (!success) {
      throw new ValidationException("User created failed", error);
    }

    const user = await this.userService.create(data, (req.user as User).id);

    return successResponse(
      res,
      "User created successfully",
      UserResource.toResource(user)
    );
  }

  async update(req: Request, res: Response) {
    const { data, error, success } = await validater(
      updateUserSchema,
      req.body
    );

    if (!success) {
      throw new ValidationException("User updated failed", error);
    }

    const user = await this.userService.update(+req.params.id, data, (req.user as User).id);

    return successResponse(
      res,
      "User updated successfully",
      UserResource.toResource(user)
    );
  }

  async destroy(req: Request, res: Response) {
    await this.userService.destory(+req.params.id);
    return successResponse(res, "User deleted successfully");
  }
}

export default UserController;
