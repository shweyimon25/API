import { Request, Response } from "express";
import { successResponse } from "../../../helpers/response";
import PermissionService from "../../../services/admin/v1/permission.service";

class PermissionController {
  private permissionService: PermissionService;

  constructor() {
    this.permissionService = new PermissionService();
  }

  async findAll(req: Request, res: Response) {
    const { page = 1, perPage = 10 } = req.query;

    if (page && perPage) {
      const permissions = await this.permissionService.findByPaginate(
        +page,
        +perPage
      );
      return successResponse(res, "Permission list successfully", permissions);
    }

    const permissions = await this.permissionService.findAll();
    return successResponse(res, "Permission list successfully", permissions);
  }

  async findOne(req: Request, res: Response) {
    const { id } = req.params;
    const permission = await this.permissionService.findOne(+id);
    return successResponse(res, "Permission detail successfully", permission);
  }
}

export default PermissionController;
