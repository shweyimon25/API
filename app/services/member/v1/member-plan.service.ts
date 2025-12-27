import prisma from "../../../../prisma/client";
import { NotFoundException } from "../../../helpers/exceptions";

class MemberPlanService {
  async findAll() {
    const memberPlans = await prisma.memberPlan.findMany({
      orderBy: {
        id: "desc",
      },
      include: {
        pros: true,
        cons: true,
      },
    });

    return memberPlans;
  }

  async findByPaginate(page: number, perPage: number) {
    const memberPlans = await prisma.memberPlan.findMany({
      orderBy: {
        id: "desc",
      },
      skip: (page - 1) * perPage,
      take: perPage,
      include: {
        pros: true,
        cons: true,
      },
    });

    const totalMemberPlans = await prisma.memberPlan.count();

    return {
      data: memberPlans,
      meta: {
        totalCount: totalMemberPlans,
        totalPages: Math.ceil(totalMemberPlans / perPage),
        currentPage: page,
        perPage,
        prevPage: page > 1 ? page - 1 : null,
        nextPage:
          page < Math.ceil(totalMemberPlans / perPage) ? page + 1 : null,
        hasPrevPage: page > 1,
        hasNextPage: page < Math.ceil(totalMemberPlans / perPage),
      },
    };
  }

  async findOne(id: number) {
    const memberPlan = await prisma.memberPlan.findUnique({
      where: {
        id,
      },
      include: {
        pros: true,
        cons: true,
      },
    });

    if (!memberPlan) {
      throw new NotFoundException("Member plan not found");
    }

    return memberPlan;
  }
}

export default MemberPlanService;
