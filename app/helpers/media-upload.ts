import path from "path";
import { v4 as uuidv4 } from "uuid";
import { BadRequestException } from "./exceptions";

export const upload = async (file: any, folderName: string = "temp") => {
  const maxFileSize = 10 * 1024 * 1024 * 1024; // 10 GB
  // const allowedMimeTypes = [
  //   "image/*",
  // ];

  if (file.size > maxFileSize) {
    throw new BadRequestException("File too large");
  }

  // if (!allowedMimeTypes.includes(file.mimetype)) {
  //   throw new BadRequestException("Invalid file type");
  // }

  const fileExtension = path.extname(file.originalname);
  const uniqueName = `${uuidv4()}${fileExtension}`;

  return {
    fileSize: file.size,
    fileMimeType: file.mimetype,
    fileName: uniqueName,
  };
};
