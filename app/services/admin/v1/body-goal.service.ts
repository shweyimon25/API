import prisma from "../../../../prisma/client";
import {
    BadRequestException,
} from "../../../helpers/exceptions";
import {
    CreateBodyGoalInput,
    UpdateBodyGoalInput,
} from "../../../schemas/admin/v1/body-goal.schema";
import { Prisma, Status } from "@prisma/client";

class BodyGoalService {
    async findAll(where?: Prisma.BodyGoalWhereInput) {
        const bodyGoals = await prisma.bodyGoal.findMany({
            where,
            orderBy: {
                id: "desc",
            },
            include: {
                createdBy: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        username: true,
                    },
                },
                updatedBy: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        username: true,
                    },
                },
            },
        });

        return bodyGoals;
    }

    async findByPaginate(page: number, perPage: number, where?: Prisma.BodyGoalWhereInput) {
        const bodyGoals = await prisma.bodyGoal.findMany({
            where,
            orderBy: {
                id: "desc",
            },
            skip: (page - 1) * perPage,
            take: perPage,
            include: {
                createdBy: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        username: true,
                    },
                },
                updatedBy: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        username: true,
                    },
                },
            },
        });

        const totalBodyGoals = await prisma.bodyGoal.count({
            where,
        });

        return {
            data: bodyGoals,
            meta: {
                totalCount: totalBodyGoals,
                totalPages: Math.ceil(totalBodyGoals / perPage),
                currentPage: page,
                perPage,
                prevPage: page > 1 ? page - 1 : null,
                nextPage: page < Math.ceil(totalBodyGoals / perPage) ? page + 1 : null,
                hasPrevPage: page > 1,
                hasNextPage: page < Math.ceil(totalBodyGoals / perPage),
            },
        };
    }

  async findOne(id: number) {
    const bodyGoal = await prisma.bodyGoal.findFirst({
      where: {
        id,
      },
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
            username: true,
          },
        },
        updatedBy: {
          select: {
            id: true,
            name: true,
            email: true,
            username: true,
          },
        },
      },
    });

    if (!bodyGoal) {
      throw new BadRequestException("Body goal not found");
    }

    return bodyGoal;
  }

  async findCommonAll(where?: Prisma.BodyGoalWhereInput) {
    const bodyGoals = await prisma.bodyGoal.findMany({
      where: {
        ...where,
        status: Status.ACTIVE,
      },
      orderBy: {
        id: "desc",
      },
      select: {
        id: true,
        name: true,
      },
    });

    return bodyGoals;
  }

    async create(createBodyGoalInput: CreateBodyGoalInput) {
        const { name, status } = createBodyGoalInput;

        const bodyGoal = await prisma.bodyGoal.create({
            data: {
                name,
                status: status ?? Status.ACTIVE,
            },
        });

        return this.findOne(bodyGoal.id);
    }

    async update(id: number, updateBodyGoalInput: UpdateBodyGoalInput) {
        const { name, status } = updateBodyGoalInput;

        const existingBodyGoal = await prisma.bodyGoal.findFirst({
            where: {
                id,
            },
        });

        if (!existingBodyGoal) {
            throw new BadRequestException("Body goal not found");
        }

        await prisma.bodyGoal.update({
            where: {
                id,
            },
            data: {
                name: name ?? existingBodyGoal.name,
                status: status ?? existingBodyGoal.status,
            },
        });

        return this.findOne(id);
    }

    async destroy(id: number) {
        const bodyGoal = await this.findOne(id);

        await prisma.bodyGoal.delete({
            where: { id },
        });

        return bodyGoal;
    }
}

export default BodyGoalService;

