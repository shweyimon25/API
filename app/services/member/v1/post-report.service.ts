import prisma from "../../../../prisma/client";
import {
  NotFoundException,
  ValidationException,
} from "../../../helpers/exceptions";
import {
  CreatePostReportInput
} from "../../../schemas/member/v1/post-report.schema";
import { Prisma, Status } from "@prisma/client";

class PostReportService {

  async findOne(id: number) {
    const postReport = await prisma.postReport.findUnique({
      where: {
        id,
      },
      include: {
        member: {
          select: {
            id: true,
            name: true,
          },
        },
        socialPost:{select: { id: true, caption: true }},
        shopPost:{select: { id: true, caption: true }},
        reportCategories: {
          select: {
            id: true,
          }
        }
      },
    });

    if (!postReport) {
      throw new NotFoundException("Post Repor not found");
    }

    return postReport;
  }

  async create(createPostReportInput: CreatePostReportInput, memberId: number) {
    try {
      const { name, social_post_id, shop_post_id, categ_id } = createPostReportInput;
      if (categ_id && categ_id.length > 0) {
        const existingReportCategory = await prisma.reportCategory.findMany({
          where: {
            id: { in: categ_id },
            status: Status.ACTIVE,
          },
          select: { id: true },
        });

        const existingReportCategoryIds = existingReportCategory.map((p) => p.id);
        const invalidReportCategoryIds = categ_id.filter(
          (id) => !existingReportCategoryIds.includes(id)
        );

        if (invalidReportCategoryIds.length > 0) {
          return {
            jsonrpc: "2.0",
            id: null,
            result: {
              isFullFilled: false,
              message: `Failed to create report: Invalid categories`,
              error: `Category IDs ${invalidReportCategoryIds.join(", ")} are invalid or inactive`
            }
          };
        }
      }

      const postReport = await prisma.postReport.create({
        data: {
          name: name as string,
          socialPostId: social_post_id ? social_post_id : undefined,
          shopPostId: shop_post_id ? shop_post_id : undefined,
          reportCategories: {
            connect: categ_id?.map((id: number) => ({ id })) || []
          },
          memberId: memberId, 
        },
      });

      const result = await this.findOne(postReport.id);
      return {
        jsonrpc: "2.0",
        id: null,
        result: {
          isFullFilled: true,
          data: result
        }
      };

    } catch (error: any) {
      return {
        jsonrpc: "2.0",
        id: null,
        result: {
          isFullFilled: false,
          message: `Failed to create post report`,
          error: error.message || error
        }
      };
    }
  }

}

export default PostReportService;
