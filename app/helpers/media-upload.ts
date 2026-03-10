import path from "path";
import { promises as fs } from "node:fs";
import { v4 as uuidv4 } from "uuid";
import { BadRequestException } from "./exceptions";
import AWS from "aws-sdk";

export interface FileInfo {
  fileSize: string;
  fileMimeType: string;
  fileName: string;
  fileUrl: string;
}

// Lazy initialization of S3 client to ensure env vars are loaded
let s3: AWS.S3 | null = null;

const getS3Client = (): AWS.S3 => {
  if (!s3) {
    const endpoint = process.env.OSS_ENDPOINT || process.env.OSS_END_POINT;
    const accessKeyId = process.env.OSS_ACCESS_KEY_ID || process.env.OSS_ACCESS_KEY;
    const secretAccessKey = process.env.OSS_ACCESS_KEY_SECRET || process.env.OSS_SECRET_KEY;
    const region = process.env.OSS_REGION;

    if (!endpoint || !accessKeyId || !secretAccessKey) {
      throw new Error(
        "Missing required OSS credentials. Please set OSS_ENDPOINT (or OSS_END_POINT), OSS_ACCESS_KEY_ID (or OSS_ACCESS_KEY), and OSS_ACCESS_KEY_SECRET (or OSS_SECRET_KEY)"
      );
    }

    s3 = new AWS.S3({
      endpoint,
      accessKeyId,
      secretAccessKey,
      region: region || "us-east-1",
      s3ForcePathStyle: true,
      signatureVersion: "v4",
    });
  }
  return s3;
};

export const upload = async (file: any, folderName: string = "temp") => {
  const maxFileSize = 10 * 1024 * 1024 * 1024;

  if (file.size > maxFileSize) {
    throw new BadRequestException("File too large");
  }

  const fileExtension = path.extname(file.originalname);
  const uniqueName = `${uuidv4()}${fileExtension}`;
  const key = `${folderName}/${uniqueName}`;
  const bucketName = "yc-fitness-uat";

  if (process.env.NODE_ENV === "development") {
    const relativePath = path.join("public", "uploads", folderName);
    const absolutePath = path.join(process.cwd(), relativePath);
    await fs.mkdir(absolutePath, { recursive: true });

    const fileDiskPath = path.join(absolutePath, uniqueName);
    await fs.writeFile(fileDiskPath, file.buffer);

    const rawBaseUrl =
      process.env.APP_URL || `http://localhost:${process.env.PORT || 3030}`;
    const baseUrl = rawBaseUrl.replace(/\/+$/, "");

    return {
      fileSize: file.size,
      fileMimeType: file.mimetype,
      fileName: uniqueName,
      fileUrl: `${baseUrl}/public/uploads/${key}`,
    };
  }

  const s3Client = getS3Client();
  await s3Client
    .putObject({
      Bucket: bucketName,
      Key: key,
      Body: file.buffer,
      ACL: "public-read",
      ContentType: file.mimetype,
    })
    .promise();

  const fileUrl = `https://${bucketName}.sgp1.digitaloceanspaces.com/${bucketName}/${key}`;

  return {
    fileSize: file.size,
    fileMimeType: file.mimetype,
    fileName: uniqueName,
    fileUrl,
  };
};