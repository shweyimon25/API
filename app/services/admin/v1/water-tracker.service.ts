import prisma from "../../../../prisma/client";
import { NotFoundException, ValidationException } from "../../../helpers/exceptions";
import {
  CreateWaterTrackerInput,
  UpdateWaterTrackerInput,
} from "../../../schemas/admin/v1/water-tracker.schema";

interface WaterTrackerFilters {
  memberId?: number;
  date?: string;
}

class WaterTrackerService {
  private where(filters?: WaterTrackerFilters) {
    const where: any = {};

    if (filters?.memberId) {
      where.memberId = filters.memberId;
    }

    if (filters?.date) {
      where.date = filters.date;
    }

    return where;
  }

  async findAll(filters?: WaterTrackerFilters) {
    const waterTrackers = await prisma.waterTracker.findMany({
      where: this.where(filters),
      orderBy: {
        id: "desc",
      },
      include: {
        member: {
          select: {
            id: true,
            name: true,
            code: true,
            email: true,
          },
        },
      },
    });

    return waterTrackers;
  }

  async findByPaginate(
    page: number,
    perPage: number,
    filters?: WaterTrackerFilters
  ) {
    const waterTrackers = await prisma.waterTracker.findMany({
      where: this.where(filters),
      orderBy: {
        id: "desc",
      },
      skip: (page - 1) * perPage,
      take: perPage,
      include: {
        member: {
          select: {
            id: true,
            name: true,
            code: true,
            email: true,
          },
        },
      },
    });

    const totalCount = await prisma.waterTracker.count({
      where: this.where(filters),
    });

    return {
      data: waterTrackers,
      meta: {
        totalCount,
        totalPages: Math.ceil(totalCount / perPage),
        currentPage: page,
        perPage,
        prevPage: page > 1 ? page - 1 : null,
        nextPage: page < Math.ceil(totalCount / perPage) ? page + 1 : null,
        hasPrevPage: page > 1,
        hasNextPage: page < Math.ceil(totalCount / perPage),
      },
    };
  }

  async findOne(id: number) {
    const waterTracker = await prisma.waterTracker.findUnique({
      where: {
        id,
      },
      include: {
        member: {
          select: {
            id: true,
            name: true,
            code: true,
            email: true,
          },
        },
      },
    });

    if (!waterTracker) {
      throw new NotFoundException("Water tracker not found");
    }

    return waterTracker;
  }

  async create(createWaterTrackerInput: CreateWaterTrackerInput) {
    const { date, memberId, dailyWater } = createWaterTrackerInput;

    // Check member exists
    const member = await prisma.member.findUnique({
      where: {
        id: memberId,
      },
    });

    if (!member) {
      throw new ValidationException("Failed to create water tracker", [
        {
          field: "memberId",
          issue: "Member not found",
        },
      ]);
    }

    const waterTracker = await prisma.waterTracker.create({
      data: {
        date,
        memberId,
        dailyWater: dailyWater ?? 0,
      },
    });

    return this.findOne(waterTracker.id);
  }

  async update(id: number, updateWaterTrackerInput: UpdateWaterTrackerInput) {
    const { date, memberId, dailyWater } = updateWaterTrackerInput;

    const existing = await this.findOne(id);

    // Check member exists if being updated
    if (memberId && memberId !== existing.memberId) {
      const member = await prisma.member.findUnique({
        where: {
          id: memberId,
        },
      });

      if (!member) {
        throw new ValidationException("Failed to update water tracker", [
          {
            field: "memberId",
            issue: "Member not found",
          },
        ]);
      }
    }

    await prisma.waterTracker.update({
      where: {
        id,
      },
      data: {
        date: date ?? existing.date,
        memberId: memberId ?? existing.memberId,
        dailyWater: dailyWater ?? existing.dailyWater,
      },
    });

    return this.findOne(id);
  }

  async destroy(id: number) {
    const waterTracker = await this.findOne(id);

    await prisma.waterTracker.delete({
      where: {
        id,
      },
    });

    return waterTracker;
  }
}

export default WaterTrackerService;

