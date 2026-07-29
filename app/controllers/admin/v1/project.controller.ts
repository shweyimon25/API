import { Request, Response } from "express";
import { successResponse } from "../../../helpers/response";
import { validater } from "../../../helpers/validator";
import {
  createProjectSchema,
  updateProjectSchema,
} from "../../../schemas/admin/v1/project.schema";
import { ValidationException } from "../../../helpers/exceptions";
import { projectScope } from "../../../scopes/admin/v1/project.scope";
import ProjectService from "../../../services/admin/v1/project.service";
import { UserWithRole } from "../../../helpers/permission";

class ProjectController {
  private projectService: ProjectService;

  constructor() {
    this.projectService = new ProjectService();
  }

  async findAll(req: Request, res: Response) {
    const { page, perPage } = req.query;
    const where = projectScope(req.query);

    if (page && perPage) {
      const projects = await this.projectService.findByPaginate(
        +page,
        +perPage,
        where,
      );
      return successResponse(res, "Project list successfully", projects);
    }

    const projects = await this.projectService.findAll(where);
    return successResponse(res, "Project list successfully", projects);
  }

  async findOne(req: Request, res: Response) {
    const project = await this.projectService.findOne(+req.params.id);
    return successResponse(res, "Project detail successfully", project);
  }

  async create(req: Request, res: Response) {
    const { data, error, success } = await validater(
      createProjectSchema,
      req.body,
    );

    if (!success) {
      throw new ValidationException("Project created failed", error);
    }

    const project = await this.projectService.create(
      data,
      req.user as UserWithRole,
    );
    return successResponse(res, "Project created successfully", project);
  }

  async update(req: Request, res: Response) {
    const { data, error, success } = await validater(
      updateProjectSchema,
      req.body,
    );

    if (!success) {
      throw new ValidationException("Project updated failed", error);
    }

    const project = await this.projectService.update(
      +req.params.id,
      data,
      req.user as UserWithRole,
    );
    return successResponse(res, "Project updated successfully", project);
  }
}

export default ProjectController;
