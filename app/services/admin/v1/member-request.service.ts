import { MemberRequestStatus, Prisma } from "@prisma/client";
import prisma from "../../../../prisma/client";
import { BadRequestException, NotFoundException } from "../../../helpers/exceptions";
import { UpdateMemberRequestInput } from "../../../schemas/admin/v1/member-request.schema";
import MemberService from "./member.service";

class MemberRequestService {
    private memberService: MemberService;

    constructor() {
        this.memberService = new MemberService();
    }

    async findAll(where?: Prisma.MemberRequestWhereInput) {
        const memberRequests = await prisma.memberRequest.findMany({
            where,
            orderBy: {
                id: "desc",
            },
        });

        return memberRequests;
    }

    async findByPaginate(page: number, perPage: number, where: Prisma.MemberRequestWhereInput) {
        const memberRequests = await prisma.memberRequest.findMany({
            where,
            orderBy: {
                id: "desc",
            },
            skip: (page - 1) * perPage,
            take: perPage,
        });

        const totalMemberRequests = await prisma.memberRequest.count({
            where
        });

        return {
            data: memberRequests,
            meta: {
                totalCount: totalMemberRequests,
                totalPages: Math.ceil(totalMemberRequests / perPage),
                currentPage: page,
                perPage,
                prevPage: page > 1 ? page - 1 : null,
                nextPage:
                    page < Math.ceil(totalMemberRequests / perPage) ? page + 1 : null,
                hasPrevPage: page > 1,
                hasNextPage: page < Math.ceil(totalMemberRequests / perPage),
            },
        };
    }

    async findOne(id: number) {
        const memberRequest = await prisma.memberRequest.findFirst({
            where: {
                id,
            },
        });

        if (!memberRequest) {
            throw new NotFoundException("Member request not found");
        }

        return memberRequest;
    }

    async update(id: number, updateMemberRequestInput: UpdateMemberRequestInput, userId: number) {
        const { status, rejectedReason } = updateMemberRequestInput;

        const existingMemberRequest = await this.findOne(id);

        if (existingMemberRequest.status === MemberRequestStatus.APPROVED && status === MemberRequestStatus.APPROVED) {
            throw new BadRequestException("Cannot approve this member request because it is already approved. Please make a new request.");
        }

        if (existingMemberRequest.status === MemberRequestStatus.REJECTED && status === MemberRequestStatus.APPROVED) {
            throw new BadRequestException("Cannot approve this member request because it is already rejected. Please make a new request.");
        }

        if (status === MemberRequestStatus.APPROVED) {

            await prisma.memberRequest.update({
                where: {
                    id,
                },
                data: {
                    status: MemberRequestStatus.APPROVED,
                    rejectedReason: null,
                    approvedAt: new Date(),
                    approvedBy: {
                        connect: {
                            id: userId,
                        }
                    },
                },
            });

            await prisma.member.update({
                where: {
                    id: existingMemberRequest.memberId,
                },
                data: {
                    memberTypeId: 2, // Trainer Member Type
                    profile: {
                        upsert: {
                            create: {
                                age: existingMemberRequest.age,
                                gender: existingMemberRequest.gender,
                                yearOfExp: existingMemberRequest.yearOfExp,
                                reason: existingMemberRequest.reason,
                                certificates: existingMemberRequest.certificates as Prisma.InputJsonValue,
                                photos: existingMemberRequest.photos as Prisma.InputJsonValue,
                            },
                            update: {
                                age: existingMemberRequest.age,
                                gender: existingMemberRequest.gender,
                                yearOfExp: existingMemberRequest.yearOfExp,
                                reason: existingMemberRequest.reason,
                                certificates: existingMemberRequest.certificates as Prisma.InputJsonValue,
                                photos: existingMemberRequest.photos as Prisma.InputJsonValue,
                            }
                        }
                    }
                },
            });
        }

        if (status === MemberRequestStatus.REJECTED) {
            await prisma.memberRequest.update({
                where: {
                    id,
                },
                data: {
                    status: MemberRequestStatus.REJECTED,
                    rejectedReason,
                    rejectedAt: new Date(),
                    rejectedBy: {
                        connect: {
                            id: userId,
                        }
                    },
                },
            });
        }

        return this.memberService.findOne(existingMemberRequest.memberId);
    }
}

export default MemberRequestService;
