"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.upload = void 0;
const path_1 = __importDefault(require("path"));
const uuid_1 = require("uuid");
const exceptions_1 = require("./exceptions");
const aws_sdk_1 = __importDefault(require("aws-sdk"));
const s3 = new aws_sdk_1.default.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_KEY,
    region: process.env.AWS_REGION,
});
const upload = async (file, folderName = "temp") => {
    const maxFileSize = 10 * 1024 * 1024 * 1024; // 10 GB
    // const allowedMimeTypes = [
    //   "image/*",
    // ];
    if (file.size > maxFileSize) {
        throw new exceptions_1.BadRequestException("File too large");
    }
    // if (!allowedMimeTypes.includes(file.mimetype)) {
    //   throw new BadRequestException("Invalid file type");
    // }
    const fileExtension = path_1.default.extname(file.originalname);
    const uniqueName = `${(0, uuid_1.v4)()}${fileExtension}`;
    const bucketName = process.env.AWS_BUCKET_NAME;
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
exports.upload = upload;
