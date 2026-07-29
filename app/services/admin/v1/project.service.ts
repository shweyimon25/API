import prisma from "../../../../prisma/client";
import {
  DeliverableStatus,
  Permission,
  Prisma,
  ProjectStatus,
  Status,
} from "@prisma/client";
import {
  NotFoundException,
  ValidationException,
} from "../../../helpers/exceptions";
import {
  CreateProjectInput,
  UpdateProjectInput,
} from "../../../schemas/admin/v1/project.schema";
import { generateProjectCode } from "../../../helpers/project-code";
import { formatDateDMY } from "../../../helpers/helper";
import {
  assertCanEditProject,
  assertFullControl,
  UserWithRole,
} from "../../../helpers/permission";

const projectOwnerSelect = {
  id: true,
  userId: true,
  user: {
    select: {
      id: true,
      name: true,
      email: true,
      employeeId: true,
      status: true,
      role: {
        select: {
          id: true,
          name: true,
          permission: true,
        },
      },
    },
  },
} satisfies Prisma.ProjectOwnerSelect;

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
  projectOwners: {
    select: projectOwnerSelect,
    orderBy: { id: "asc" as const },
  },
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
  private uniqueOwnerIds(ownerIds: number[]) {
    return [...new Set(ownerIds)];
  }

  private async assertValidProjectOwners(ownerIds: number[]) {
    const uniqueIds = this.uniqueOwnerIds(ownerIds);

    const users = await prisma.user.findMany({
      where: {
        id: { in: uniqueIds },
      },
      select: {
        id: true,
        status: true,
        role: {
          select: {
            permission: true,
          },
        },
      },
    });

    const foundIds = new Set(users.map((user) => user.id));
    const missingIds = uniqueIds.filter((id) => !foundIds.has(id));

    if (missingIds.length > 0) {
      throw new ValidationException("Failed to save project", [
        {
          field: "ownerIds",
          issue: `User(s) not found: ${missingIds.join(", ")}`,
        },
      ]);
    }

    const invalidOwners = users.filter(
      (user) =>
        user.status !== Status.ACTIVE ||
        user.role.permission !== Permission.PROJECT_MANAGEMENT,
    );

    if (invalidOwners.length > 0) {
      throw new ValidationException("Failed to save project", [
        {
          field: "ownerIds",
          issue:
            "All project owners must be ACTIVE users with PROJECT_MANAGEMENT permission",
        },
      ]);
    }

    return uniqueIds;
  }

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

    return {
      ...project,
      deliveriables: project.deliveriables.map((item) => ({
        ...item,
        tac: formatDateDMY(item.tac),
      })),
    };
  }

  async create(
    createProjectInput: CreateProjectInput,
    currentUser: UserWithRole,
  ) {
    assertFullControl(currentUser);

    const { ownerIds, ...projectData } = createProjectInput;

    if (projectData.status === ProjectStatus.COMPLETED) {
      throw new ValidationException("Failed to create project", [
        {
          field: "status",
          issue:
            "Project cannot be created as COMPLETED. Complete all deliverables first.",
        },
      ]);
    }

    const validOwnerIds = await this.assertValidProjectOwners(ownerIds);

    const project = await prisma.project.create({
      data: {
        ...projectData,
        code: await generateProjectCode(),
        status: projectData.status ?? ProjectStatus.OPEN,
        totalPercentage: 0,
        projectOwners: {
          create: validOwnerIds.map((userId) => ({ userId })),
        },
      },
    });

    return this.findOne(project.id);
  }

  async update(
    id: number,
    updateProjectInput: UpdateProjectInput,
    currentUser: UserWithRole,
  ) {
    await assertCanEditProject(currentUser, id);

    const existingProject = await prisma.project.findUnique({
      where: { id },
    });

    if (!existingProject) {
      throw new NotFoundException("Project not found");
    }

    const {
      name,
      achievements,
      nextPlans,
      remark,
      department,
      keyProjects,
      projectPhase,
      objectives,
      keyResults,
      rag,
      risk,
      strategicAlignment,
      currentStatus,
      status,
      stage,
      ownerIds,
    } = updateProjectInput;

    if (status === ProjectStatus.COMPLETED) {
      await this.assertCanComplete(id);
    }

    const validOwnerIds =
      ownerIds !== undefined
        ? await this.assertValidProjectOwners(ownerIds)
        : undefined;

    await prisma.$transaction(async (tx) => {
      await tx.project.update({
        where: { id },
        data: {
          ...(name !== undefined && { name }),
          ...(achievements !== undefined && { achievements }),
          ...(nextPlans !== undefined && { nextPlans }),
          ...(remark !== undefined && { remark }),
          ...(department !== undefined && { department }),
          ...(keyProjects !== undefined && { keyProjects }),
          ...(projectPhase !== undefined && { projectPhase }),
          ...(objectives !== undefined && { objectives }),
          ...(keyResults !== undefined && { keyResults }),
          ...(rag !== undefined && { rag }),
          ...(risk !== undefined && { risk }),
          ...(strategicAlignment !== undefined && { strategicAlignment }),
          ...(currentStatus !== undefined && { currentStatus }),
          ...(status !== undefined && { status }),
          ...(stage !== undefined && { stage }),
        },
      });

      if (validOwnerIds !== undefined) {
        await tx.projectOwner.deleteMany({
          where: { projectId: id },
        });

        await tx.projectOwner.createMany({
          data: validOwnerIds.map((userId) => ({
            userId,
            projectId: id,
          })),
        });
      }
    });

    return this.findOne(id);
  }
}

export default ProjectService;
