import { mkdirSync, unlinkSync, existsSync, writeFileSync } from "node:fs";
import { extname, join } from "node:path";
import { randomUUID } from "node:crypto";
import { ValidationException } from "./exceptions";

const ALLOWED_IMAGE_MIME_TYPES = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/gif",
]);

const PROFILE_COVER_DIR = "public/uploads/profile-covers";
const PROFILE_COVER_PUBLIC_PREFIX = "/public/uploads/profile-covers";

export const getUploadedFile = (
  files: Express.Multer.File[] | { [fieldname: string]: Express.Multer.File[] } | undefined,
  fieldname: string,
): Express.Multer.File | undefined => {
  if (!files) {
    return undefined;
  }

  if (Array.isArray(files)) {
    return files.find((file) => file.fieldname === fieldname);
  }

  const matched = files[fieldname];
  return Array.isArray(matched) ? matched[0] : undefined;
};

export const saveProfileCover = (file: Express.Multer.File): string => {
  if (!ALLOWED_IMAGE_MIME_TYPES.has(file.mimetype)) {
    throw new ValidationException("Profile cover upload failed", [
      {
        field: "profileCover",
        issue: "Profile cover must be an image (jpeg, png, webp, or gif)",
      },
    ]);
  }

  const extension = extname(file.originalname).toLowerCase() || mimeToExtension(file.mimetype);
  const filename = `${randomUUID()}${extension}`;
  const absoluteDir = join(process.cwd(), PROFILE_COVER_DIR);

  mkdirSync(absoluteDir, { recursive: true });
  writeFileSync(join(absoluteDir, filename), file.buffer);

  return `${PROFILE_COVER_PUBLIC_PREFIX}/${filename}`;
};

export const deleteUploadedFile = (publicPath?: string | null) => {
  if (!publicPath || !publicPath.startsWith(PROFILE_COVER_PUBLIC_PREFIX)) {
    return;
  }

  const relativePath = publicPath.replace(/^\//, "");
  const absolutePath = join(process.cwd(), relativePath);

  if (existsSync(absolutePath)) {
    unlinkSync(absolutePath);
  }
};

const mimeToExtension = (mimetype: string) => {
  switch (mimetype) {
    case "image/jpeg":
    case "image/jpg":
      return ".jpg";
    case "image/png":
      return ".png";
    case "image/webp":
      return ".webp";
    case "image/gif":
      return ".gif";
    default:
      return "";
  }
};
