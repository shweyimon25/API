"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const media_upload_1 = require("../helpers/media-upload");
const response_1 = require("../helpers/response");
const exceptions_1 = require("../helpers/exceptions");
class MediaController {
    async upload(req, res) {
        const { folderName } = req.body;
        let fileInfo = null;
        if (req.files && req.files.length !== 0) {
            const file = req.files[0];
            fileInfo = await (0, media_upload_1.upload)(file, folderName);
            return (0, response_1.successResponse)(res, "File upload successfully", fileInfo);
        }
        throw new exceptions_1.BadRequestException("File not uploaded");
    }
}
exports.default = MediaController;
