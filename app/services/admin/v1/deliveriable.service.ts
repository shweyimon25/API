import prisma from "../../../../prisma/client";
import { DeliverableStatus, Prisma } from "@prisma/client";
import {
  NotFoundException,
  ValidationException,
} from "../../../helpers/exceptions";
import {
  CreateDeliveriableInput,
  UpdateDeliveriableInput,
} from "../../../schemas/admin/v1/deliveriable.schema";
import { formatDateDMY } from "../../../helpers/helper";
import {
  assertCanEditProject,
  UserWithRole,
} from "../../../helpers/permission";

const deliveriableSelect = {
  id: true,
  deliverable: true,
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
} satisfies Prisma.deliveriableSelect;

const formatDeliveriable = <T extends { tac: Date }>(deliveriable: T) => ({
  ...deliveriable,
  tac: formatDateDMY(deliveriable.tac),
});

class DeliveriableService {
  async findAll(where?: Prisma.deliveriableWhereInput) {
    const deliveriables = await prisma.deliveriable.findMany({
      where,
      orderBy: { id: "asc" },
      select: deliveriableSelect,
    });

    return deliveriables.map(formatDeliveriable);
  }

  async findByPaginate(
    page: number,
    perPage: number,
    where?: Prisma.deliveriableWhereInput,
  ) {
    const deliveriables = await prisma.deliveriable.findMany({
      where,
      orderBy: { id: "asc" },
      skip: (page - 1) * perPage,
      take: perPage,
      select: deliveriableSelect,
    });

    const total = await prisma.deliveriable.count({ where });

    return {
      data: deliveriables.map(formatDeliveriable),
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
    const deliveriable = await prisma.deliveriable.findUnique({
      where: { id },
      select: deliveriableSelect,
    });

    if (!deliveriable) {
      throw new NotFoundException("Deliveriable not found");
    }

    return formatDeliveriable(deliveriable);
  }

  private async assertProjectExists(projectId: number) {
    const project = await prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project) {
      throw new ValidationException("Failed to save deliveriable", [
        {
          field: "projectId",
          issue: "Project does not exist",
        },
      ]);
    }
  }

  /**
   * Project.totalPercentage = average of deliverable.completedPercentage for that project
   */
  async recalculateTotalPercentage(projectId: number) {
    const aggregate = await prisma.deliveriable.aggregate({
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

  async create(
    createInput: CreateDeliveriableInput,
    currentUser: UserWithRole,
  ) {
    await this.assertProjectExists(createInput.projectId);
    await assertCanEditProject(currentUser, createInput.projectId);

    const deliveriable = await prisma.deliveriable.create({
      data: {
        deliverable: createInput.deliverable,
        tac: createInput.tac,
        completedPercentage: createInput.completedPercentage ?? 0,
        projectId: createInput.projectId,
        status: createInput.status ?? DeliverableStatus.OPEN,
      },
    });

    await this.recalculateTotalPercentage(createInput.projectId);

    return this.findOne(deliveriable.id);
  }

  async update(
    id: number,
    updateInput: UpdateDeliveriableInput,
    currentUser: UserWithRole,
  ) {
    const existing = await prisma.deliveriable.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException("Deliveriable not found");
    }

    await assertCanEditProject(currentUser, existing.projectId);

    if (updateInput.projectId !== undefined) {
      await this.assertProjectExists(updateInput.projectId);
      await assertCanEditProject(currentUser, updateInput.projectId);
    }

    const { deliverable, tac, completedPercentage, projectId, status } =
      updateInput;

    await prisma.deliveriable.update({
      where: { id },
      data: {
        ...(deliverable !== undefined && { deliverable }),
        ...(tac !== undefined && { tac }),
        ...(completedPercentage !== undefined && { completedPercentage }),
        ...(projectId !== undefined && { projectId }),
        ...(status !== undefined && { status }),
      },
    });

    const nextProjectId = projectId ?? existing.projectId;

    await this.recalculateTotalPercentage(nextProjectId);

    if (projectId !== undefined && projectId !== existing.projectId) {
      await this.recalculateTotalPercentage(existing.projectId);
    }

    return this.findOne(id);
  }

  async destroy(id: number, currentUser: UserWithRole) {
    const existing = await prisma.deliveriable.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException("Deliveriable not found");
    }

    await assertCanEditProject(currentUser, existing.projectId);

    await prisma.deliveriable.delete({
      where: { id },
    });

    await this.recalculateTotalPercentage(existing.projectId);
  }
}

export default DeliveriableService;
