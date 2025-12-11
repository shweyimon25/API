import bcrypt from "bcrypt";
import jwt, { Secret, SignOptions } from "jsonwebtoken";
import dotenv from "dotenv";
import { Prisma, PrismaClient } from "@prisma/client";
import slugify from "slugify";
import { BadRequestException } from "./exceptions";

const prisma = new PrismaClient();
dotenv.config();

export const hashPassword = (password: string) => bcrypt.hashSync(password, 10);

export const comparePassword = (password: string, hashPassword: string) =>
  bcrypt.compareSync(password, hashPassword);

export const generateToken = (
  user: string | Buffer | object,
  expiresIn?: SignOptions["expiresIn"]
) => {
  const secret = process.env.JWT_SECRET as Secret;

  const options: SignOptions = {
    expiresIn: expiresIn ?? "30d",
  };

  return jwt.sign(user, secret, options);
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

export const toKebabCase = (text: string) => {
  return text.toLowerCase().trim().replace(/\s+/g, "-");
};

export const generateMemberCode = async () => {
  let code: string;
  let isUnique = false;

  while (!isUnique) {
    code = "YC" + Math.random().toString(36).substring(2, 8).toUpperCase();
    
    const existing = await prisma.member.findUnique({
      where: { code },
    });

    if (!existing) {
      isUnique = true;
    }
  }

  return code!;
};