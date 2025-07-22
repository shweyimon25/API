import path from "path";
import { v4 as uuidv4 } from "uuid";
import { BadRequestException } from "./exceptions";
import AWS from "aws-sdk";

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY!,
  secretAccessKey: process.env.AWS_SECRET_KEY!,
  region: process.env.AWS_REGION!,
});

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

  const bucketName = process.env.AWS_BUCKET_NAME!;

  const s3Params = {
    Bucket: bucketName,
    Key: `${folderName}/${uniqueName}`,
    Body: file.buffer,
    ContentType: file.mimetype,
    ACL: "public-read",
  };

  const uploadResult = await s3.upload(s3Params).promise();

  return {
    fileSize: file.size,
    fileMimeType: file.mimetype,
    fileName: uniqueName,
    fileUrl: uploadResult.Location,
  };
};
