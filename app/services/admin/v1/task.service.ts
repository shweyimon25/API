import prisma from "../../../../prisma/client";
import { Prisma, ProjectStatus, TaskStatus } from "@prisma/client";
import {
  NotFoundException,
  ValidationException,
} from "../../../helpers/exceptions";
import {
  CreateTaskInput,
  UpdateTaskInput,
} from "../../../schemas/admin/v1/task.schema";
import { formatDateDMY } from "../../../helpers/helper";
import {
  assertCanEditProject,
  UserWithRole,
} from "../../../helpers/permission";
import { emitSocket, SocketEvents } from "../../../socket";
import ProjectService from "./project.service";

const taskSelect = {
  id: true,
  name: true,
  tac: true,
  completedPercentage: true,
  status: true,
  projectId: true,
  project: {
    select: {
      id: true,
      name: true,
      totalPercentage: true,
      code: true,
    },
  },
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.TaskSelect;

const formatTask = <T extends { tac: Date }>(task: T) => ({
  ...task,
  tac: formatDateDMY(task.tac),
});

type TaskStatusGroup = {
  status: TaskStatus;
  count: number;
  completedPercentage: number;
};

class TaskService {
  private projectService = new ProjectService();

  private async emitProjectUpdated(projectId: number) {
    const project = await this.projectService.findOne(projectId);
    emitSocket(SocketEvents.PROJECT_UPDATED, project);
  }

  async findAll(where?: Prisma.TaskWhereInput) {
    const tasks = await prisma.task.findMany({
      where,
      orderBy: { id: "asc" },
      select: taskSelect,
    });

    return tasks.map(formatTask);
  }

  async findByPaginate(
    page: number,
    perPage: number,
    where?: Prisma.TaskWhereInput,
  ) {
    const tasks = await prisma.task.findMany({
      where,
      orderBy: { id: "asc" },
      skip: (page - 1) * perPage,
      take: perPage,
      select: taskSelect,
    });

    const total = await prisma.task.count({ where });

    return {
      data: tasks.map(formatTask),
      meta: {
        totalCount: total,
        totalPages: Math.ceil(total / perPage),
        currentPage: page,
        perPage,
        prevPage: page > 1 ? page - 1 : null,
        nextPage: page < Math.ceil(total / perPage) ? page + 1 : null,
        hasPrevPage: page > 1,
        hasNextPage: page < Math.ceil(total / perPage),
      },
    };
  }

  async findOne(id: number) {
    const task = await prisma.task.findUnique({
      where: { id },
      select: taskSelect,
    });

    if (!task) {
      throw new NotFoundException("Task not found");
    }

    return formatTask(task);
  }

  private async assertProjectExists(projectId: number) {
    const project = await prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project) {
      throw new ValidationException("Failed to save task", [
        {
          field: "projectId",
          issue: "Project does not exist",
        },
      ]);
    }
  }

  /**
   * Project.totalPercentage = average of task.completedPercentage for that project
   */
  async recalculateTotalPercentage(projectId: number) {
    const aggregate = await prisma.task.aggregate({
      where: { projectId },
      _avg: { completedPercentage: true },
    });

    const totalPercentage = aggregate._avg.completedPercentage ?? 0;

    await prisma.project.update({
      where: { id: projectId },
      data: { totalPercentage },
    });

    return totalPercentage;
  }

  /**
   * Group tasks by status, pick the group with the highest completedPercentage sum,
   * and set that status on the parent project (skips CLOSE projects).
   */
  async syncProjectStatusFromTopTaskPercentage(projectId: number) {
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      select: { id: true, status: true },
    });

    if (!project || project.status === ProjectStatus.CLOSE) {
      return null;
    }

    const tasks = await prisma.task.findMany({
      where: { projectId },
      select: { status: true, completedPercentage: true },
    });

    if (tasks.length === 0) {
      await prisma.project.update({
        where: { id: projectId },
        data: { status: ProjectStatus.OPEN },
      });
      return ProjectStatus.OPEN;
    }

    const grouped = tasks.reduce(
      (acc, task) => {
        if (!acc[task.status]) {
          acc[task.status] = {
            status: task.status,
            count: 0,
            completedPercentage: 0,
          };
        }

        acc[task.status].count++;
        acc[task.status].completedPercentage += task.completedPercentage;

        return acc;
      },
      {} as Record<string, TaskStatusGroup>,
    );

    const topStatusGroup = Object.values(grouped).reduce((top, current) => {
      if (current.completedPercentage > top.completedPercentage) {
        return current;
      }

      if (
        current.completedPercentage === top.completedPercentage &&
        current.count > top.count
      ) {
        return current;
      }

      return top;
    });

    const nextStatus = topStatusGroup.status as unknown as ProjectStatus;

    await prisma.project.update({
      where: { id: projectId },
      data: { status: nextStatus },
    });

    return nextStatus;
  }

  async create(createInput: CreateTaskInput, currentUser: UserWithRole) {
    await this.assertProjectExists(createInput.projectId);
    await assertCanEditProject(currentUser, createInput.projectId);

    const task = await prisma.task.create({
      data: {
        name: createInput.name,
        tac: createInput.tac,
        completedPercentage: createInput.completedPercentage ?? 0,
        projectId: createInput.projectId,
        status: createInput.status ?? TaskStatus.OPEN,
      },
    });

    await this.recalculateTotalPercentage(createInput.projectId);
    await this.syncProjectStatusFromTopTaskPercentage(createInput.projectId);

    const created = await this.findOne(task.id);
    emitSocket(SocketEvents.TASK_CREATED, created);
    await this.emitProjectUpdated(createInput.projectId);
    return created;
  }

  async update(
    id: number,
    updateInput: UpdateTaskInput,
    currentUser: UserWithRole,
  ) {
    const existing = await prisma.task.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException("Task not found");
    }

    await assertCanEditProject(currentUser, existing.projectId);

    if (updateInput.projectId !== undefined) {
      await this.assertProjectExists(updateInput.projectId);
      await assertCanEditProject(currentUser, updateInput.projectId);
    }

    const { name, tac, completedPercentage, projectId, status } = updateInput;

    await prisma.task.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(tac !== undefined && { tac }),
        ...(completedPercentage !== undefined && { completedPercentage }),
        ...(projectId !== undefined && { projectId }),
        ...(status !== undefined && { status }),
      },
    });

    const nextProjectId = projectId ?? existing.projectId;

    await this.recalculateTotalPercentage(nextProjectId);
    await this.syncProjectStatusFromTopTaskPercentage(nextProjectId);

    if (projectId !== undefined && projectId !== existing.projectId) {
      await this.recalculateTotalPercentage(existing.projectId);
      await this.syncProjectStatusFromTopTaskPercentage(existing.projectId);
      await this.emitProjectUpdated(existing.projectId);
    }

    const updated = await this.findOne(id);
    emitSocket(SocketEvents.TASK_UPDATED, updated);
    await this.emitProjectUpdated(nextProjectId);
    return updated;
  }

  async destroy(id: number, currentUser: UserWithRole) {
    const existing = await prisma.task.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException("Task not found");
    }

    await assertCanEditProject(currentUser, existing.projectId);

    await prisma.task.delete({
      where: { id },
    });

    await this.recalculateTotalPercentage(existing.projectId);
    await this.syncProjectStatusFromTopTaskPercentage(existing.projectId);

    emitSocket(SocketEvents.TASK_DELETED, {
      id: existing.id,
      projectId: existing.projectId,
    });
    await this.emitProjectUpdated(existing.projectId);
  }
}

export default TaskService;
