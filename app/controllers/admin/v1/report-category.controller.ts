import { ReportCategoryCollection } from "./../../../resources/admin/v1/report-category/report-category.collection";
import { Request, Response } from "express";
import { successResponse } from "../../../helpers/response";
import { validater } from "../../../helpers/validator";
import { ValidationException } from "../../../helpers/exceptions";
import ReportCategoryService from "../../../services/admin/v1/report-category.service";
import { ReportCategoryResource } from "../../../resources/admin/v1/report-category/report-category.resource";
import {
  createReportCategorySchema,
  updateReportCategorySchema,
} from "../../../schemas/admin/v1/report-category.schema";
import { reportCategoryScope } from "../../../scopes/admin/v1/report-category.scope";

class ReportCategoryController {
  private reportCategoryService: ReportCategoryService;

  constructor() {
    this.reportCategoryService = new ReportCategoryService();
  }

  async findAll(req: Request, res: Response) {
    const { page, perPage } = req.query;

    const where = reportCategoryScope(req.query);

    if (page && perPage) {
      const reportCategorys = await this.reportCategoryService.findByPaginate(+page, +perPage, where);
      return successResponse(
        res,
        "ReportCategory list successfully",
        ReportCategoryCollection.withPagination(reportCategorys)
      );
    }

    const reportCategorys = await this.reportCategoryService.findAll(where);

    return successResponse(
      res,
      "ReportCategory list successfully",
      ReportCategoryCollection.toCollection(reportCategorys)
    );
  }

  async findCommonAll(req: Request, res: Response) {
    const where = reportCategoryScope(req.query);

    const reportCategorys = await this.reportCategoryService.findCommonAll(where);
    
    return successResponse(
      res,
      "ReportCategory list successfully",
      ReportCategoryCollection.toCommonCollection(reportCategorys)
    );
  }

  async findOne(req: Request, res: Response) {
    const reportCategory = await this.reportCategoryService.findOne(+req.params.id);

    return successResponse(
      res,
      "ReportCategory detail successfully",
      ReportCategoryResource.toResource(reportCategory)
    );
  }

  async create(req: Request, res: Response) {
    const { data, error, success } = await validater(
      createReportCategorySchema,
      req.body
    );

    if (!success) {
      throw new ValidationException("ReportCategory created failed", error);
    }

    const reportCategory = await this.reportCategoryService.create(data);

    return successResponse(
      res,
      "ReportCategory created successfully",
      ReportCategoryResource.toResource(reportCategory)
    );
  }

  async update(req: Request, res: Response) {
    const { data, error, success } = await validater(
      updateReportCategorySchema,
      req.body
    );

    if (!success) {
      throw new ValidationException("ReportCategory updated failed", error);
    }

    const reportCategory = await this.reportCategoryService.update(+req.params.id, data);

    return successResponse(
      res,
      "ReportCategory updated successfully",
      ReportCategoryResource.toResource(reportCategory)
    );
  }

  async destroy(req: Request, res: Response) {
    await this.reportCategoryService.destroy(+req.params.id);
    return successResponse(res, "ReportCategory deleted successfully");
  }
}

export default ReportCategoryController;
