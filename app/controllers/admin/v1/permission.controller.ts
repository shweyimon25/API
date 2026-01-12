import { Request, Response } from "express";
import { successResponse } from "../../../helpers/response";
import PermissionService from "../../../services/admin/v1/permission.service";
import { Prisma } from "@prisma/client";

class PermissionController {
  private permissionService: PermissionService;

  constructor() {
    this.permissionService = new PermissionService();
  }

  async findAll(req: Request, res: Response) {
    const { page, perPage, name } = req.query;

    let where: Prisma.PermissionWhereInput = {};

    if (name) {
      where.name = {
        contains: name as string,
      };
    }

    if (page && perPage) {
      const permissions = await this.permissionService.findByPaginate(+page, +perPage, where);
      return successResponse(res, "Permission list successfully", permissions);
    }

    const permissions = await this.permissionService.findAll(where);
    return successResponse(res, "Permission list successfully", permissions);
  }

  async findCommonAll(req: Request, res: Response) {
    const { name } = req.query;

    let where: Prisma.PermissionWhereInput = {};

    if (name) {
      where.name = {
        contains: name as string,
      };
    }

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
