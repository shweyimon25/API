import {
  CreateMemberPlanInput,
  UpdateMemberPlanInput,
} from "./../../../schemas/admin/v1/member-plan.schema";
import prisma from "../../../../prisma/client";
import { Status } from "@prisma/client";
import {
  BadRequestException,
  NotFoundException,
  ValidationException,
} from "../../../helpers/exceptions";
import MemberTypeService from "./member-type.service";

interface MemberPlanFilters {
  status?: Status;
  search?: string;
  memberTypeId?: number;
}

class MemberPlanService {
  private memberTypeService: MemberTypeService;

  constructor() {
    this.memberTypeService = new MemberTypeService();
  }

  private where(filters?: MemberPlanFilters) {
    const where: any = {};

    if (filters?.status) {
      where.status = filters.status;
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

  async findAll(filters?: MemberPlanFilters) {
    const memberPlans = await prisma.memberPlan.findMany({
      where: this.where(filters),
      orderBy: {
        id: "desc",
      },
    });

    return memberPlans;
  }

  async findByPaginate(
    page: number,
    perPage: number,
    filters?: MemberPlanFilters
  ) {
    const memberPlans = await prisma.memberPlan.findMany({
      where: this.where(filters),
      orderBy: {
        id: "desc",
      },
      skip: (page - 1) * perPage,
      take: perPage,
    });

    const totalMemberPlans = await prisma.memberPlan.count({
      where: this.where(filters),
    });

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

  async findOne(memberPlanId: number) {
    const memberPlan = await prisma.memberPlan.findUnique({
      where: {
        id: memberPlanId,
      },
      include: {
        pros: true,
        cons: true,
      },
    });

    if (!memberPlan) {
      throw new BadRequestException("Member plan not found");
    }

    return memberPlan;
  }

  async create(createMemberPlanInput: CreateMemberPlanInput) {
    // Check member plan name unique
    const existingMemberPlanName = await prisma.memberPlan.findFirst({
      where: {
        name: createMemberPlanInput.name,
      },
    });

    if (existingMemberPlanName) {
      throw new ValidationException("Failed to create new member plan", [
        {
          field: "name",
          issue: "Name is already existed",
        },
      ]);
    }

    // Check member type existed
    const existingMemberType = await this.memberTypeService.findOne(
      createMemberPlanInput.memberTypeId
    );

    if (!existingMemberType) {
      throw new ValidationException("Failed to created member type", [
        {
          field: "memberTypeId",
          issue: "Member type is not existed",
        },
      ]);
    }

    // Check pros existed
    if (
      createMemberPlanInput.proIds &&
      createMemberPlanInput.proIds.length > 0
    ) {
      const existingPros = await prisma.pros.findMany({
        where: {
          id: { in: createMemberPlanInput.proIds },
        },
        select: { id: true },
      });

      const existingProIds = existingPros.map((pro) => pro.id);
      const invalidProIds = createMemberPlanInput.proIds.filter(
        (id) => !existingProIds.includes(id)
      );

      if (invalidProIds.length > 0) {
        throw new ValidationException("Failed to create member plan", [
          {
            field: "proIds",
            issue: `Pro(s) with ID(s) ${invalidProIds.join(", ")} do not exist`,
          },
        ]);
      }
    }

    // Check consultants existed
    if (
      createMemberPlanInput.conIds &&
      createMemberPlanInput.conIds.length > 0
    ) {
      const existingCons = await prisma.cons.findMany({
        where: {
          id: { in: createMemberPlanInput.conIds },
        },
        select: { id: true },
      });

      const existingConIds = existingCons.map((con) => con.id);
      const invalidConIds = createMemberPlanInput.conIds.filter(
        (id) => !existingConIds.includes(id)
      );

      if (invalidConIds.length > 0) {
        throw new ValidationException("Failed to create member plan", [
          {
            field: "conids",
            issue: `Con(s) with ID(s) ${invalidConIds.join(", ")} do not exist`,
          },
        ]);
      }
    }

    // Create new member plan
    const memberPlan = await prisma.memberPlan.create({
      data: {
        name: createMemberPlanInput.name,
        duration: createMemberPlanInput.duration,
        isVideoGroup: createMemberPlanInput.isVideoGroup,
        status: createMemberPlanInput.status ?? Status.ACTIVE,
        memberType: {
          connect: {
            id: existingMemberType.id,
          },
        },
        pros:
          createMemberPlanInput.proIds &&
          createMemberPlanInput.proIds.length > 0
            ? {
                connect: createMemberPlanInput.proIds.map((proId: number) => ({
                  id: proId,
                })),
              }
            : undefined,
        cons:
          createMemberPlanInput.conIds &&
          createMemberPlanInput.conIds.length > 0
            ? {
                connect: createMemberPlanInput.conIds.map((conId: number) => ({
                  id: conId,
                })),
              }
            : undefined,
      },
    });

    return this.findOne(memberPlan.id);
  }

  async update(
    memberPlanId: number,
    updateMemberPlanInput: UpdateMemberPlanInput
  ) {
    // Find old member plan
    const existingMemberPlan = await prisma.memberPlan.findFirst({
      where: {
        id: memberPlanId,
      },
    });

    if (!existingMemberPlan) {
      throw new NotFoundException("Member plan not found");
    }

    // Check existing member plan name
    const existingMemeberPlanName = await prisma.memberPlan.findFirst({
      where: {
        name: updateMemberPlanInput.name,
        NOT: {
          id: memberPlanId,
        },
      },
    });

    if (existingMemeberPlanName) {
      throw new ValidationException("Failed to updated member plan", [
        {
          field: "name",
          issue: "Name is already existed",
        },
      ]);
    }

    // Check member type
    const existingMemberType = await prisma.memberPlan.findFirst({
      where: {
        id: updateMemberPlanInput.memberTypeId,
        NOT: {
          id: memberPlanId,
        },
      },
    });

    if (!existingMemberType) {
      throw new ValidationException("Failed to created member type", [
        {
          field: "memberTypeId",
          issue: "Member type is not existed",
        },
      ]);
    }

    // Check pros existed
    if (
      updateMemberPlanInput.proIds &&
      updateMemberPlanInput.proIds.length > 0
    ) {
      const existingPros = await prisma.pros.findMany({
        where: {
          id: { in: updateMemberPlanInput.proIds },
        },
        select: { id: true },
      });

      const existingProIds = existingPros.map((pro) => pro.id);
      const invalidProIds = updateMemberPlanInput.proIds.filter(
        (id) => !existingProIds.includes(id)
      );

      if (invalidProIds.length > 0) {
        throw new ValidationException("Failed to create member plan", [
          {
            field: "proIds",
            issue: `Pro(s) with ID(s) ${invalidProIds.join(", ")} do not exist`,
          },
        ]);
      }
    }

    // Check consultants existed
    if (
      updateMemberPlanInput.conIds &&
      updateMemberPlanInput.conIds.length > 0
    ) {
      const existingCons = await prisma.cons.findMany({
        where: {
          id: { in: updateMemberPlanInput.conIds },
        },
        select: { id: true },
      });

      const existingConIds = existingCons.map((con) => con.id);
      const invalidConIds = updateMemberPlanInput.conIds.filter(
        (id) => !existingConIds.includes(id)
      );

      if (invalidConIds.length > 0) {
        throw new ValidationException("Failed to create member plan", [
          {
            field: "conids",
            issue: `Con(s) with ID(s) ${invalidConIds.join(", ")} do not exist`,
          },
        ]);
      }
    }

    // Update member plan
    const memberPlan = await prisma.memberPlan.create({
      data: {
        name: updateMemberPlanInput.name ?? existingMemberPlan.name,
        memberTypeId:
          updateMemberPlanInput.memberTypeId ?? existingMemberPlan.memberTypeId,
        price: updateMemberPlanInput.price ?? existingMemberPlan.price,
        duration: updateMemberPlanInput.duration ?? existingMemberPlan.duration,
        isVideoGroup:
          updateMemberPlanInput.isVideoGroup ?? existingMemberPlan.isVideoGroup,
        status: updateMemberPlanInput.status ?? existingMemberPlan.status,
        pros:
          updateMemberPlanInput.proIds &&
          updateMemberPlanInput.proIds.length > 0
            ? {
                connect: updateMemberPlanInput.proIds.map((proId: number) => ({
                  id: proId,
                })),
              }
            : undefined,
        cons:
          updateMemberPlanInput.conIds &&
          updateMemberPlanInput.conIds.length > 0
            ? {
                connect: updateMemberPlanInput.conIds.map((conId: number) => ({
                  id: conId,
                })),
              }
            : undefined,
      },
    });

    return this.findOne(memberPlan.id);
  }

  async destroy(memberPlanId: number) {
    // Find member plan
    await this.findOne(memberPlanId);

    // Delete member plan
    await prisma.memberPlan.delete({
      where: {
        id: memberPlanId,
      },
    });
  }
}

export default MemberPlanService;
