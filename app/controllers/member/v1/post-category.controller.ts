import { Request, Response } from "express";
import { successResponse } from "../../../helpers/response";
import prisma from "../../../../prisma/client";

class PostCategoryController {
  async findAll(req: Request, res: Response) {
    const postCategories = await prisma.postCategory.findMany();

    return successResponse(
      res,
      "Post category list successfully",
      postCategories,
    );
  }

  async findOne(req: Request, res: Response) {
    const postCategory = await prisma.postCategory.findUnique({
      where: {
        id: Number(req.params.id),
      },
    });

    if (!postCategory) {
      return res.status(404).json({
        message: "Post category not found",
      });
    }

    return successResponse(
      res,
      "Post category details successfully",
      postCategory,
    );
  }
}

export default PostCategoryController;
