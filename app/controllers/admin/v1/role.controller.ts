import { Request, Response } from "express";
import { successResponse } from "../../../helpers/response";
import RoleService from "../../../services/admin/v1/role.service";
import { RoleResource } from "../../../resources/admin/v1/role/role.resource";
import { RoleCollection } from "../../../resources/admin/v1/role/role.collection";
import { ValidationException } from "../../../helpers/exceptions";
import { validater } from "../../../helpers/validator";
import {
  createRoleSchema,
  updateRoleSchema,
} from "../../../schemas/admin/v1/role.schema";

class RoleController {
  private roleService: RoleService;

  constructor() {
    this.roleService = new RoleService();
  }

  async findAll(req: Request, res: Response) {
    const { page, perPage, status, search } = req.query;

    const filters: any = {};
    if (status) {
      filters.status = status;
    }
    if (search) {
      filters.search = search as string;
    }

    if (page && perPage) {
      const roles = await this.roleService.findByPaginate(
        +page,
        +perPage,
        Object.keys(filters).length > 0 ? filters : undefined
      );
      return successResponse(
        res,
        "Role list successfully",
        RoleCollection.withPagination(roles)
      );
    }

    const roles = await this.roleService.findAll(
      Object.keys(filters).length > 0 ? filters : undefined
    );

    return successResponse(
      res,
      "Role list successfully",
      RoleCollection.toCollection(roles)
    );
  }

  async findCommonAll(req: Request, res: Response) {
    const { search } = req.query; 

    const filters: any = {};
    if (search) {
      filters.search = search as string;
    }

    const roles = await this.roleService.findCommonAll(filters);
    
    return successResponse(
      res,
      "Common Role list successfully",
      RoleCollection.toCommonCollection(roles)
    );
  }

  async findOne(req: Request, res: Response) {
    const role = await this.roleService.findOne(+req.params.id);
    return successResponse(
      res,
      "Role details successfully",
      RoleResource.toResource(role)
    );
  }

  async create(req: Request, res: Response) {
    const { data, error, success } = await validater(
      createRoleSchema,
      req.body
    );

    if (!success) {
      throw new ValidationException("Role created failed", error);
    }

    const role = await this.roleService.create(data, (req.user as any).id);

    return successResponse(
      res,
      "Role created successfully",
      RoleResource.toResource(role)
    );
  }

  async update(req: Request, res: Response) {
    const { data, error, success } = await validater(
      updateRoleSchema,
      req.body
    );

    if (!success) {
      throw new ValidationException("Role updated failed", error);
    }

    const role = await this.roleService.update(+req.params.id, data, (req.user as any).id);

    return successResponse(
      res,
      "Role updated successfully",
      RoleResource.toResource(role)
    );
  }

  async destroy(req: Request, res: Response) {
    await this.roleService.destory(+req.params.id);
    return successResponse(res, "Role deleted successfully");
  }
}

export default RoleController;
