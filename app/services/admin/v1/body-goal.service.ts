import prisma from "../../../../prisma/client";
import {
    BadRequestException,
} from "../../../helpers/exceptions";
import {
    CreateBodyGoalInput,
    UpdateBodyGoalInput,
} from "../../../schemas/admin/v1/body-goal.schema";
import { Status } from "@prisma/client";

interface BodyGoalFilters {
    status?: Status;
    search?: string;
}

class BodyGoalService {
    private where(filters?: BodyGoalFilters) {
        const where: any = {};

        if (filters?.status) {
            where.status = filters.status;
        }

        if (filters?.search) {
            where.name = {
                contains: filters.search,
            };
        }

        return where;
    }

    async findAll(filters?: BodyGoalFilters) {
        const bodyGoals = await prisma.bodyGoal.findMany({
            where: this.where(filters),
            orderBy: {
                id: "desc",
            },
        });

        return bodyGoals;
    }

    async findByPaginate(page: number, perPage: number, filters?: BodyGoalFilters) {
        const bodyGoals = await prisma.bodyGoal.findMany({
            where: this.where(filters),
            orderBy: {
                id: "desc",
            },
            skip: (page - 1) * perPage,
            take: perPage,
        });

        const totalBodyGoals = await prisma.bodyGoal.count({
            where: this.where(filters),
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
        const bodyGoal = await prisma.bodyGoal.findUnique({
            where: {
                id,
            },
        });

        if (!bodyGoal) {
            throw new BadRequestException("Body goal not found");
        }

        return bodyGoal;
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

        const existingBodyGoal = await prisma.bodyGoal.findUnique({
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
            where: {
                id,
            },
        });

        return bodyGoal;
    }
}

export default BodyGoalService;

