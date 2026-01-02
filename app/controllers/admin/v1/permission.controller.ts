import { Request, Response } from "express";
import { successResponse } from "../../../helpers/response";
import PermissionService from "../../../services/admin/v1/permission.service";

class PermissionController {
  private permissionService: PermissionService;

  constructor() {
    this.permissionService = new PermissionService();
  }

  async findAll(req: Request, res: Response) {
    const { page, perPage, search } = req.query;

    const filters: any = {};

    if (search) {
      filters.search = search as string;
    }

    if (page && perPage) {
      const permissions = await this.permissionService.findByPaginate(
        +page,
        +perPage,
        Object.keys(filters).length > 0 ? filters : undefined
      );
      return successResponse(res, "Permission list successfully", permissions);
    }

    const permissions = await this.permissionService.findAll(Object.keys(filters).length > 0 ? filters : undefined);
    return successResponse(res, "Permission list successfully", permissions);
  }

  async findCommonAll(req: Request, res: Response) {
    const { search } = req.query;

    const filters: any = {};

    if (search) {
      filters.search = search as string;
    }

    const permissions = await this.permissionService.findCommonAll(
      Object.keys(filters).length > 0 ? filters : undefined
    );

    return successResponse(res, "Common Permission list successfully", permissions);
  }

  async findOne(req: Request, res: Response) {
    const { id } = req.params;
    const permission = await this.permissionService.findOne(+id);
    return successResponse(res, "Permission detail successfully", permission);
  }
}

export default PermissionController;
