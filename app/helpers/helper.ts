import bcrypt from "bcrypt";
import jwt, { Secret, SignOptions } from "jsonwebtoken";
import dotenv from "dotenv";
import { Prisma } from "@prisma/client";
import slugify from "slugify";
import { BadRequestException } from "./exceptions";
import prisma from "../../prisma/client";

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

export const generateOTP = () => {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

  return { otp, expiresAt };
};

export const generateSlug = async (
  columnName: string,
  modelName: Prisma.ModelName
) => {
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

export const generateTimeAgo = (date: Date) => {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const diffInSeconds = diff / 1000;
  const diffInMinutes = diff / (1000 * 60);
  const diffInHours = diff / (1000 * 60 * 60);
  const diffInDays = diff / (1000 * 60 * 60 * 24);
  const diffInMonths = diff / (1000 * 60 * 60 * 24 * 30);
  const diffInYears = diff / (1000 * 60 * 60 * 24 * 365);

  if (diffInSeconds < 60) {
    return `${Math.floor(diffInSeconds)} seconds ago`;
  }
  if (diffInMinutes < 60) {
    return `${Math.floor(diffInMinutes)} minutes ago`;
  }
  if (diffInHours < 24) {
    return `${Math.floor(diffInHours)} hours ago`;
  }
  if (diffInDays < 30) {
    return `${Math.floor(diffInDays)} days ago`;
  }
  if (diffInMonths < 12) {
    return `${Math.floor(diffInMonths)} months ago`;
  }
  return `${Math.floor(diffInYears)} years ago`;
};

export const generateFcmToken = async () => {

};

export const formatDate = (date: string | Date) => {
  const d = date instanceof Date ? date : new Date(date);
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`;
};