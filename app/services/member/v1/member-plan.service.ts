import { Status } from "@prisma/client";
import prisma from "../../../../prisma/client";
import { NotFoundException } from "../../../helpers/exceptions";

interface MemberPlanFilters {
  duration?: number;
  search?: string;
  memberTypeId?: number;
}


class MemberPlanService {
  private where(filters?: MemberPlanFilters) {
    const where: any = {};

    if (filters?.duration) {
      where.duration = filters.duration;
    }

    if (filters?.memberTypeId) {
      where.memberTypeId = filters.memberTypeId;
    }

    if (filters?.search) {
      where.name = {
        contains: filters.search,
      };
    }

    return where;
  }

  async findAll(filters: MemberPlanFilters) {
    const memberPlans = await prisma.memberPlan.findMany({
      orderBy: {
        id: "desc",
      },
      where: {
        ...this.where(filters),
        status: Status.ACTIVE
      },
      include: {
        memberType: {
          select: {
            id: true,
            name: true,
            status: true
          }
        }
      }
    });

    return memberPlans;
  }

  async findOne(id: number) {
    const memberPlan = await prisma.memberPlan.findUnique({
      where: {
        id,
        status: Status.ACTIVE
      },
      include: {
        memberType: {
          select: {
            id: true,
            name: true,
            status: true
          }
        },
        pros: {
          select: {
            id: true,
            name: true,
            guard: true,
            status: true,
          }
        },
        cons: {
          select: {
            id: true,
            name: true,
            guard: true,
            status: true
          }
        },
      },
    });

    if (!memberPlan) {
      throw new NotFoundException("Member plan not found");
    }

    return memberPlan;
  }
}

export default MemberPlanService;
