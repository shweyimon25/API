import { comparePassword, generateToken } from "../../../helpers/helper";
import { Request, Response } from "express";
import { successResponse } from "../../../helpers/response";
import { validater } from "../../../helpers/validator";
import { signInSchema } from "../../../schemas/admin/v1/auth.schema";
import {
  UnauthorizedException,
  ValidationException,
} from "../../../helpers/exceptions";
import UserService from "../../../services/admin/v1/user.service";
import { UserResource } from "../../../resources/admin/v1/user/user.resource";
import { Status } from "@prisma/client";
import prisma from "../../../../prisma/client";
class AuthController {
  private userService: UserService;

  constructor() {
    this.userService = new UserService();
  }

  async signIn(req: Request, res: Response) {
    const { data, error, success } = await validater(signInSchema, req.body);

    if (!success) {
      throw new ValidationException("Unauthorized", error);
    }

    const user = await prisma.user.findFirst({
      include: {
        roles: true,
      },
      where: {
        OR: [
          {
            email: data.emailOrUsername,
          },
          {
            username: data.emailOrUsername,
          },
        ],
        status: Status.ACTIVE,
        roles: {
          some: {
            role: {
              name: "SuperAdmin",
            },
          },
        },
      },
    });

    if (!user) {
      throw new UnauthorizedException();
    }

    const passwordCompress = comparePassword(data.password, user.password);

    if (!passwordCompress) {
      throw new UnauthorizedException();
    }

    const token: string = generateToken({
      id: user.id,
      loginType: "admin"
    }, "30d");

    return successResponse(res, "User sign in successfully", {
      user: UserResource.toResource(await this.userService.findOne(user.id)),
      token,
    });
  }

  
}

export default AuthController;
