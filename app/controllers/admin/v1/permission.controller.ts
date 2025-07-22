import { Request, Response } from "express";
import { successResponse } from "../../../helpers/response";
import PermissionService from "../../../services/admin/v1/permission.service";
import { validater } from "../../../helpers/validator";
import {
  createPermissionSchema,
  updatePermissionSchema,
} from "../../../schemas/admin/v1/permission.schema";
import { ValidationException } from "../../../helpers/exceptions";
import prisma from "../../../../prisma/client";

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

  async create(req: Request, res: Response) {
    const { data, error, success } = await validater(
      createPermissionSchema,
      req.body
    );

    if (!success) {
      throw new ValidationException("Permission created failed", error);
    }

    const permission = await this.permissionService.create(data);
    return successResponse(res, "Permission created successfully", permission);
  }

  async update(req: Request, res: Response) {
    const { id } = req.params;

    updatePermissionSchema.refine(
      async (args: any) => {
        if (!req.body.name) return true;
        const result = await prisma.permission.findFirst({
          where: { name: args.name, NOT: { id: +id } },
        });
        return !result;
      },
      { message: "Name is already exist", path: ["name"] }
    );

    const { data, error, success } = await validater(
      updatePermissionSchema,
      req.body
    );

    if (!success) {
      throw new ValidationException("Permission updated failed", error);
    }

    const permission = await this.permissionService.update(+id, data);
    return successResponse(res, "Permission updated successfully", permission);
  }

  async destroy(req: Request, res: Response) {
    const { id } = req.params;
    await this.permissionService.destroy(+id);
    return successResponse(res, "Permission deleted successfully");
  }
}

export default PermissionController;
