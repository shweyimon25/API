import { Request, Response } from "express";
import { Member } from "@prisma/client";
import PostReportService from "../../../services/member/v1/post-report.service";
import { successResponse } from "../../../helpers/response";
import { validater } from "../../../helpers/validator";
import { ValidationException } from "../../../helpers/exceptions";
import { createPostReportSchema } from "../../../schemas/member/v1/post-report.schema";
import { PostReportResource } from "../../../resources/member/v1/post-report/post-report.resource";

class PostReportController {
    private postReportService: PostReportService;

    constructor() {
        this.postReportService = new PostReportService();
    }

    async create(req: Request, res: Response) {
        // 1. Validation check
        const { data, error, success } = await validater(
          createPostReportSchema,
          req.body
        );

        if (!success) {
          return res.json({
              "jsonrpc": "2.0",
              "id": null,
              "result": {
                "isFullFilled": false,
                "message": `Failed to validate post report: ${error}`,
                "error": error // error detail ထည့်ချင်ရင်
                }
              });
        }

        try {
          const memberId = (req.user as Member).id;
          
          // Service ကနေ jsonrpc format အတိုင်း return ပြန်လာမှာဖြစ်လို့ 
          // တစ်ခါတည်း response အနေနဲ့ သုံးလို့ရပါတယ်။
          const response = await this.postReportService.create(
            data,
            memberId
          );
          return res.status(500).json({
            "jsonrpc": "2.0",
            "id": null,
            "result": {
              "isFullFilled": true,
              "data": PostReportResource.toResource(response.result.data),
            }
          });

        } catch (err: any) {
          // Unexpected server error များအတွက်
          return res.status(500).json({
            "jsonrpc": "2.0",
            "id": null,
            "result": {
              "isFullFilled": false,
              "message": `Something went wrong: ${err}`,
            }
          });
        }
      }
}

export default PostReportController;
