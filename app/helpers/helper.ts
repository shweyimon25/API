import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import prisma from "../../prisma/client";
import slugify from "slugify";
import { BadRequestException } from "./exceptions";
import { Prisma } from "@prisma/client";
dotenv.config();

export const hashPassword = (password: string) => bcrypt.hashSync(password, 10);

export const comparePassword = (password: string, hashPassword: string) =>
  bcrypt.compareSync(password, hashPassword);

export const generateToken = (user: any, expiresIn: string) => {
  return jwt.sign(user, process.env.JWT_SECRET as string, {
    expiresIn: expiresIn || "30d",
  });
};

export const decodeToken = (token: any) =>
  jwt.verify(token, process.env.JWT_SECRET as string);

export const generateSlug = async (columnName: string, modelName: Prisma.ModelName) => {
  const baseSlug = slugify(columnName, { lower: true, strict: true });

  const model = (prisma as Record<string, any>)[modelName];
  if (!model) {
    throw new BadRequestException(
      `Model '${modelName}' does not exist on Prisma client.`
    );
  }

  let slug = baseSlug;
  let counter = 1;

  while (true) {
    const existing = await model.findUnique({
      where: { slug },
    });

    if (!existing) break;

    slug = `${baseSlug}-${counter}`;
    counter++;
  }

  return slug;
};
