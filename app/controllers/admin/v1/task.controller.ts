import { Request, Response } from "express";
import { successResponse } from "../../../helpers/response";
import { validater } from "../../../helpers/validator";
import {
  createTaskSchema,
  updateTaskSchema,
} from "../../../schemas/admin/v1/task.schema";
import { ValidationException } from "../../../helpers/exceptions";
import { taskScope } from "../../../scopes/admin/v1/task.scope";
import TaskService from "../../../services/admin/v1/task.service";
import { UserWithRole } from "../../../helpers/permission";

class TaskController {
  private taskService: TaskService;

  constructor() {
    this.taskService = new TaskService();
  }

  async findAll(req: Request, res: Response) {
    const { page, perPage } = req.query;
    const where = taskScope(req.query);

    if (page && perPage) {
      const tasks = await this.taskService.findByPaginate(
        +page,
        +perPage,
        where,
      );
      return successResponse(res, "Task list successfully", tasks);
    }

    const tasks = await this.taskService.findAll(where);
    return successResponse(res, "Task list successfully", tasks);
  }

  async findOne(req: Request, res: Response) {
    const task = await this.taskService.findOne(+req.params.id);
    return successResponse(res, "Task detail successfully", task);
  }

  async create(req: Request, res: Response) {
    const { data, error, success } = await validater(
      createTaskSchema,
      req.body,
    );

    if (!success) {
      throw new ValidationException("Task created failed", error);
    }

    const task = await this.taskService.create(data, req.user as UserWithRole);
    return successResponse(res, "Task created successfully", task);
  }

  async update(req: Request, res: Response) {
    const { data, error, success } = await validater(
      updateTaskSchema,
      req.body,
    );

    if (!success) {
      throw new ValidationException("Task updated failed", error);
    }

    const task = await this.taskService.update(
      +req.params.id,
      data,
      req.user as UserWithRole,
    );
    return successResponse(res, "Task updated successfully", task);
  }

  async destroy(req: Request, res: Response) {
    await this.taskService.destroy(+req.params.id, req.user as UserWithRole);
    return successResponse(res, "Task deleted successfully");
  }
}

export default TaskController;
