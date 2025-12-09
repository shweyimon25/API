import { hashPassword } from './../../../helpers/helper';
import { Request, Response } from "express";
import prisma from "../../../../prisma/client";
import { validater } from "../../../helpers/validator";
import { UnauthorizedException, ValidationException } from "../../../helpers/exceptions";
import { comparePassword, generateToken } from "../../../helpers/helper";
import { successResponse } from "../../../helpers/response";
import { sigInSchema, signUpSchema } from "../../../schemas/member/v1/auth.schema";
import { ProviderType } from '@prisma/client';

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

        // Check for existing email or phone
        if (data.loginProviderType === "EMAIL") {
            const existingEmail = await prisma.member.findFirst({
                where: {
                    email: data.loginProviderValue,
                },
            });
            if (existingEmail) {
                throw new ValidationException("Failed to sign up", [{
                    'field': "loginProviderValue",
                    'issue': "Email already in use"
                }]);
            }
        }

        if (data.loginProviderType === "PHONE") {
            const existingPhone = await prisma.member.findFirst({
                where: {
                    phone: data.loginProviderValue,
                }
            })

            if (existingPhone) {
                throw new ValidationException("Failed to sign up", [{
                    'field': "loginProviderValue",
                    'issue': "Phone number already in use"
                }]);
            }
        }

        const member = await prisma.member.create({
            data: {
                name: data.name,
                code: 'YC' + Math.random().toString(36).substring(2, 8).toUpperCase(),
                email: data.loginProviderType === "EMAIL" ? data.loginProviderValue : null,
                phone: data.loginProviderType === "PHONE" ? data.loginProviderValue : null,
                memberType: { connect: { id: 1 } },
                profile: {
                    create: {
                        address: data.address
                    }
                },
                password: hashPassword(data.password),
                status: true,
                providerTypes: {
                    create: {
                        providerType: data.loginProviderType as ProviderType,
                    }
                }
            },
            select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                code: true,
                status: true,
                createdAt: true,
                updatedAt: true,
                profile: true,
                memberType: true,
                providerTypes: true
            }
        });

        const token: string = generateToken(member, "30d");

        return successResponse(res, "User sign up successfully", {
            user: member,
            token,
        });

    }
}

export default AuthController;
