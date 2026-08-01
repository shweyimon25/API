import prisma from "../../../../prisma/client";
import { Prisma } from "@prisma/client";
import { NotFoundException } from "../../../helpers/exceptions";
import { formatDateDMY } from "../../../helpers/helper";

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
  tasks: {
    select: {
      id: true,
      name: true,
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
      tasks: project.tasks.map((item) => ({
        ...item,
        tac: formatDateDMY(item.tac),
      })),
    };
  }
}

export default ProjectService;
