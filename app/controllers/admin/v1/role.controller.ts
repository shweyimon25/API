import { Request, Response } from "express";
import { successResponse } from "../../../helpers/response";
import RoleService from "../../../services/admin/v1/role.service";
import { validater } from "../../../helpers/validator";
import {
  createRoleSchema,
  updateRoleSchema,
} from "../../../schemas/admin/v1/role.schema";
import { ValidationException } from "../../../helpers/exceptions";
import prisma from "../../../../prisma/client";
import { RoleCollection } from "../../../resources/admin/v1/role/role.collection";
import { RoleResource } from "../../../resources/admin/v1/role/role.resource";

class RoleController {
  private roleService: RoleService;

  constructor() {
    this.roleService = new RoleService();
  }

  async findAll(req: Request, res: Response) {
    const { page = 1, perPage = 10 } = req.query;

    if (page && perPage) {
      const roles = await this.roleService.findByPaginate(+page, +perPage);
      return successResponse(
        res,
        "Role list successfully",
        RoleCollection.withPagination(roles)
      );
    }

    const roles = await this.roleService.findAll();
    return successResponse(
      res,
      "Role list successfully",
      RoleCollection.toCollection(roles)
    );
  }

  async findOne(req: Request, res: Response) {
    const { id } = req.params;
    const role = await this.roleService.findOne(+id);
    return successResponse(
      res,
      "Role detail successfully",
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

    const role = await this.roleService.create(data);
    return successResponse(
      res,
      "Role created successfully",
      RoleResource.toResource(role)
    );
  }

  async update(req: Request, res: Response) {
    const { id } = req.params;
    const { name } = req.body;

    if (name) {
      const existingRole = await prisma.role.findFirst({
        where: {
          name,
          NOT: { id: +id },
        },
      });

      if (existingRole) {
        throw new ValidationException("Role updated failed", [
          {
            field: "name",
            issue: "Name is already exist",
          },
        ]);
      }
    }

    const { data, error, success } = await validater(
      updateRoleSchema,
      req.body
    );

    if (!success) {
      throw new ValidationException("Role updated failed", error);
    }

    const role = await this.roleService.update(+id, data);
    return successResponse(
      res,
      "Role updated successfully",
      RoleResource.toResource(role)
    );
  }

  async destroy(req: Request, res: Response) {
    const { id } = req.params;
    await this.roleService.destroy(+id);
    return successResponse(res, "Role deleted successfully");
  }
}

export default RoleController;
