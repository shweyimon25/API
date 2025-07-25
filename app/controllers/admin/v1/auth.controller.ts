import { comparePassword, generateToken } from "../../../helpers/helper";
import { Request, Response } from "express";
import { successResponse } from "../../../helpers/response";
import { validater } from "../../../helpers/validator";
import { signInSchema } from "../../../schemas/admin/v1/auth.schema";
import {
  UnauthorizedException,
  ValidationException,
} from "../../../helpers/exceptions";
import prisma from "../../../../prisma/client";
import UserService from "../../../services/admin/v1/user.service";
import { UserResource } from "../../../resources/admin/v1/user/user.resource";

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
      where: {
        email: data.email,
        status: true,
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

    const token: string = generateToken(user, "30d");

    return successResponse(res, "User sign in successfully", {
      user: UserResource.toResource(await this.userService.findOne(user.id)),
      token,
    });
  }
}

export default AuthController;
