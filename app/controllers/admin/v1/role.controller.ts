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
    const { page, perPage } = req.query;

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
      "Role details successfully",
      RoleResource.toResource(role)
    );
  }

  async create(req: Request, res: Response) {
    const role = await this.roleService.create(req.body);
    return successResponse(
      res,
      "Role created successfully",
      RoleResource.toResource(role)
    );
  }

  async update(req: Request, res: Response) {
    const { id } = req.params;
    const role = await this.roleService.update(+id, req.body);
    return successResponse(
      res,
      "Role updated successfully",
      RoleResource.toResource(role)
    );
  }

  async destroy(req: Request, res: Response) {
    const { id } = req.params;
    await this.roleService.destory(+id);
    return successResponse(
      res,
      "Role deleted successfully",
    );
  }
}

export default RoleController;
