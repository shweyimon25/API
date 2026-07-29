import prisma from "../../../../prisma/client";
import { DeliverableStatus, Prisma, ProjectStatus } from "@prisma/client";
import {
  NotFoundException,
  ValidationException,
} from "../../../helpers/exceptions";
import {
  CreateProjectInput,
  UpdateProjectInput,
} from "../../../schemas/admin/v1/project.schema";
import { generateProjectCode } from "../../../helpers/project-code";

const projectSelect = {
  id: true,
  code: true,
  name: true,
  achievements: true,
  nextPlans: true,
  remark: true,
  department: true,
  keyProjects: true,
  projectPhase: true,
  objectives: true,
  keyResults: true,
  rag: true,
  risk: true,
  strategicAlignment: true,
  currentStatus: true,
  status: true,
  stage: true,
  totalPercentage: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.ProjectSelect;

const projectDetailSelect = {
  ...projectSelect,
  deliveriables: {
    select: {
      id: true,
      deliverable: true,
      tac: true,
      completedPercentage: true,
      status: true,
      createdAt: true,
      updatedAt: true,
    },
    orderBy: { id: "asc" as const },
  },
} satisfies Prisma.ProjectSelect;

class ProjectService {
  private async assertCanComplete(projectId: number) {
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      select: {
        totalPercentage: true,
        deliveriables: {
          select: {
            id: true,
            status: true,
          },
        },
      },
    });

    if (!project) {
      throw new NotFoundException("Project not found");
    }

    if (project.deliveriables.length === 0) {
      throw new ValidationException("Failed to update project", [
        {
          field: "status",
          issue:
            "Project cannot be COMPLETED without deliverables that are all COMPLETED and total 100%",
        },
      ]);
    }

    const allCompleted = project.deliveriables.every(
      (item) => item.status === DeliverableStatus.COMPLETED,
    );

    if (!allCompleted) {
      throw new ValidationException("Failed to update project", [
        {
          field: "status",
          issue:
            "All deliverables must be COMPLETED before project can be COMPLETED",
        },
      ]);
    }

    if (Math.round(project.totalPercentage) !== 100) {
      throw new ValidationException("Failed to update project", [
        {
          field: "status",
          issue:
            "Project totalPercentage must be 100% before it can be COMPLETED",
        },
      ]);
    }
  }

  async findAll(where?: Prisma.ProjectWhereInput) {
    return prisma.project.findMany({
      where,
      orderBy: { id: "desc" },
      select: projectSelect,
    });
  }

  async findByPaginate(
    page: number,
    perPage: number,
    where?: Prisma.ProjectWhereInput,
  ) {
    const projects = await prisma.project.findMany({
      where,
      orderBy: { id: "desc" },
      skip: (page - 1) * perPage,
      take: perPage,
      select: projectSelect,
    });

    const totalProjects = await prisma.project.count({ where });

    return {
      data: projects,
      meta: {
        totalCount: totalProjects,
        totalPages: Math.ceil(totalProjects / perPage),
        currentPage: page,
        perPage,
        prevPage: page > 1 ? page - 1 : null,
        nextPage: page < Math.ceil(totalProjects / perPage) ? page + 1 : null,
        hasPrevPage: page > 1,
        hasNextPage: page < Math.ceil(totalProjects / perPage),
      },
    };
  }

  async findOne(id: number) {
    const project = await prisma.project.findUnique({
      where: { id },
      select: projectDetailSelect,
    });

    if (!project) {
      throw new NotFoundException("Project not found");
    }

    return project;
  }

  async create(createProjectInput: CreateProjectInput) {
    if (createProjectInput.status === ProjectStatus.COMPLETED) {
      throw new ValidationException("Failed to create project", [
        {
          field: "status",
          issue:
            "Project cannot be created as COMPLETED. Complete all deliverables first.",
        },
      ]);
    }

    const project = await prisma.project.create({
      data: {
        ...createProjectInput,
        code: await generateProjectCode(),
        status: createProjectInput.status ?? ProjectStatus.OPEN,
        totalPercentage: 0,
      },
    });

    return this.findOne(project.id);
  }

}

export default ProjectService;
