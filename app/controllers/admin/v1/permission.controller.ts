import { Request, Response } from "express";
import { successResponse } from "../../../helpers/response";
import PermissionService from "../../../services/admin/v1/permission.service";
import { permissionScope } from "../../../scopes/admin/v1/permission.scope";

class PermissionController {
  private permissionService: PermissionService;

  constructor() {
    this.permissionService = new PermissionService();
  }

  async findAll(req: Request, res: Response) {
    const { page, perPage } = req.query;

    const where = permissionScope(req.query);

    if (page && perPage) {
      const permissions = await this.permissionService.findByPaginate(+page, +perPage, where);
      return successResponse(res, "Permission list successfully", permissions);
    }

    const permissions = await this.permissionService.findAll(where);
    return successResponse(res, "Permission list successfully", permissions);
  }

  async findCommonAll(req: Request, res: Response) {
    const where = permissionScope(req.query);
    const permissions = await this.permissionService.findCommonAll(where);

    return successResponse(res, "Common Permission list successfully", permissions);
  }

  async findOne(req: Request, res: Response) {
    const { id } = req.params;
    const permission = await this.permissionService.findOne(+id);
    return successResponse(res, "Permission detail successfully", permission);
  }
}

export default PermissionController;
