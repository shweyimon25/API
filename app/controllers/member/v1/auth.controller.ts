import { Request, Response } from "express";
import prisma from "../../../../prisma/client";
import { validater } from "../../../helpers/validator";
import { BadRequestException, UnauthorizedException, ValidationException } from "../../../helpers/exceptions";
import { comparePassword, generateToken } from "../../../helpers/helper";
import { successResponse } from "../../../helpers/response";
import { sigInSchema, signUpSchema } from "../../../schemas/member/v1/auth.route";

class AuthController {
    async signIn(req: Request, res: Response) {
        const { data, error, success } = await validater(sigInSchema, req.body);

        if (!success) {
            throw new ValidationException("Unauthorized", error);
        }

        const member = await prisma.member.findFirst({
            where: {
                OR: [
                    { email: data.loginProviderValue },
                    { phone: data.loginProviderValue },
                ],
                status: true,
            },
        });

        if (!member) {
            throw new UnauthorizedException();
        }

        const passwordCompress = comparePassword(data.password, member.password);

        if (!passwordCompress) {
            throw new UnauthorizedException();
        }

        const token: string = generateToken(member, "30d");

        return successResponse(res, "User sign in successfully", {
            user: member,
            token,
        });
    }

    async signUp(req: Request, res: Response) {
        const { data, error, success } = await validater(signUpSchema, req.body);

        if (!success) {
            throw new ValidationException("Failed to sign up", error);
        }


    }
}

export default AuthController;
