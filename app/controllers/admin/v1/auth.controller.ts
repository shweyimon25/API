import { comparePassword, generateToken } from "../../../helpers/helper";
import { Request, Response } from "express";
import { successResponse } from "../../../helpers/response";
import { validater } from "../../../helpers/validator";
import { signInSchema } from "../../../schemas/admin/v1/auth.schema";
import {
  UnauthorizedException,
  ValidationException,
} from "../../../helpers/exceptions";
import { Status } from "@prisma/client";
import prisma from "../../../../prisma/client";
class AuthController {
  async signIn(req: Request, res: Response) {
    const { data, error, success } = await validater(signInSchema, req.body);

    if (!success) {
      throw new ValidationException("Unauthorized", error);
    }

    const user = await prisma.user.findFirst({
      include: {
        role: true,
      },
      where: {
        OR: [
          {
            email: data.email,
          }
        ],
        status: Status.ACTIVE,
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
      token,
    });
  }
}

export default AuthController;
