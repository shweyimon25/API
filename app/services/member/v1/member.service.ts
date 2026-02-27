import { Prisma } from "@prisma/client";
import prisma from "../../../../prisma/client";

class MemberService {
  async findAll(where: Prisma.MemberWhereInput) {
    const members = await prisma.member.findMany({
      where,
      include: {
        profile: {
          select: {
            id: true,
            memberId: true,
            address: true,
            profilePhoto: true,
            coverPhoto: true,
            bio: true,
            gender: true,
            age: true,
            yearOfExp: true,
            reason: true,
            certificates: true,
            photos: true,
          },
        },
        memberType: {
          select: {
            id: true,
            name: true,
            status: true,
            memberPlans: {
              select: {
                id: true,
                name: true,
                price: true,
                duration: true,
                isVideoGroup: true,
                pros: true,
                cons: true,
                status: true,
              },
            },
          },
        },
      },
    });

    return members;
  }

  async findByPaginate(
    page: number,
    perPage: number,
    where?: Prisma.MemberWhereInput,
  ) {
    const members = await prisma.member.findMany({
      where,
      orderBy: { id: "desc" },
      skip: (page - 1) * perPage,
      take: perPage,
      include: {
        profile: {
          select: {
            id: true,
            memberId: true,
            address: true,
            profilePhoto: true,
            coverPhoto: true,
            bio: true,
            gender: true,
            age: true,
            yearOfExp: true,
            reason: true,
            certificates: true,
            photos: true,
          },
        },
        memberType: {
          select: {
            id: true,
            name: true,
            status: true,
            memberPlans: {
              select: {
                id: true,
                name: true,
                price: true,
                duration: true,
                isVideoGroup: true,
                pros: true,
                cons: true,
                status: true,
              },
            },
          },
        },
      },
    });

    const totalMembers = await prisma.member.count({
      where,
    });

    return {
      data: members,
      meta: {
        totalCount: totalMembers,
        totalPages: Math.ceil(totalMembers / perPage),
        currentPage: page,
        perPage,
        prevPage: page > 1 ? page - 1 : null,
        nextPage: page < Math.ceil(totalMembers / perPage) ? page + 1 : null,
        hasPrevPage: page > 1,
        hasNextPage: page < Math.ceil(totalMembers / perPage),
      },
    };
  }

  async findCommonAll(where?: Prisma.MemberWhereInput) {
    const members = await prisma.member.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        code: true,
        profile: {
          select: { profilePhoto: true },
        },
      },
    });

    return members;
  }

  async findOne(id: number) {
    const member = await prisma.member.findUnique({
      where: {
        id,
      },
      include: {
        profile: {
          select: {
            id: true,
            memberId: true,
            address: true,
            profilePhoto: true,
            coverPhoto: true,
            bio: true,
            gender: true,
            age: true,
            yearOfExp: true,
            reason: true,
            certificates: true,
            photos: true,
          },
        },
        memberType: {
          select: {
            id: true,
            name: true,
            status: true,
            memberPlans: {
              select: {
                id: true,
                name: true,
                price: true,
                duration: true,
                isVideoGroup: true,
                pros: true,
                cons: true,
                status: true,
              },
            },
          },
        },
      },
    });

    return member;
  }
}

export default MemberService;
