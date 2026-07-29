import { Request, Response } from "express";
import { successResponse } from "../../../helpers/response";
import { projectScope } from "../../../scopes/dashboard/v1/project.scope";
import ProjectService from "../../../services/dashboard/v1/project.service";

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

}

export default ProjectController;
