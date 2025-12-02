import { Request, Response } from "express";
import { successResponse } from "../../../helpers/response";
import RoleService from "../../../services/admin/v1/role.service";
import { RoleResource } from "../../../resources/admin/v1/role/role.resource";
import { RoleCollection } from "../../../resources/admin/v1/role/role.collection";

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
        "Role list retrieved successfully",
        RoleCollection.withPagination(roles)
      );
    }

    const roles = await this.roleService.findAll();
    return successResponse(
      res,
      "Role list retrieved successfully",
      RoleCollection.toCollection(roles)
    );
  }

  async findOne(req: Request, res: Response) {
    const { id } = req.params;
    const role = await this.roleService.findOne(+id);
    return successResponse(
      res,
      "Role details retrieved successfully",
      RoleResource.toResource(role)
    );
  }
}

export default RoleController;
