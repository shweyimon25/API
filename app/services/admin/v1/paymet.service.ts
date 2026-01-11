import prisma from "../../../../prisma/client";
import { NotFoundException } from "../../../helpers/exceptions";
import { PaymentStatus, Prisma } from "@prisma/client";
import { UpdatePaymentStatusInput } from "../../../schemas/admin/v1/payment.schema";

interface PaymentFilters {
    status?: PaymentStatus;
    search?: string;
}

class PaymentService {

    private where(filters?: PaymentFilters) {
        const where: any = {};

        if (filters?.status) {
            where.status = filters.status;
        }

        return where;
    }

    async findByPaginate(page: number, perPage: number, filters?: PaymentFilters) {
        const payments = await prisma.payment.findMany({
            where: this.where(filters),
            orderBy: {
                id: "desc",
            },
            skip: (page - 1) * perPage,
            take: perPage,
        });

        const totalPayments = await prisma.payment.count({
            where: this.where(filters),
        });

        return {
            data: payments,
            meta: {
                totalCount: totalPayments,
                totalPages: Math.ceil(totalPayments / perPage),
                currentPage: page,
                perPage,
            },
            prevPage: page > 1 ? page - 1 : null,
            nextPage: page < Math.ceil(totalPayments / perPage) ? page + 1 : null,
            hasPrevPage: page > 1,
            hasNextPage: page < Math.ceil(totalPayments / perPage),
        };
    }

    async findAll(filters?: PaymentFilters) {
        const payments = await prisma.payment.findMany({
            where: this.where(filters),
            orderBy: {
                id: "desc",
            },
            include: {
                member: {
                    select: {
                        id: true,
                        name: true,
                    }
                },
                memberPlan: {
                    select: {
                        id: true,
                        name: true,
                    }
                },
                memberType: {
                    select: {
                        id: true,
                        name: true,
                    }
                },
                approvedBy: {
                    select: {
                        id: true,
                        name: true,
                    }
                },
                cancelledBy: {
                    select: {
                        id: true,
                        name: true,
                    }
                }
            }
        });

        return payments;
    }

    async findOne(id: number) {
        const payment = await prisma.payment.findUnique({
            where: { id },
        });

        if (!payment) {
            throw new NotFoundException("Payment not found");
        }

        return payment;
    }

    async update(id: number, updatePaymentStatusInput: UpdatePaymentStatusInput, memberId: number) {
        await this.findOne(id);

        const { status } = updatePaymentStatusInput;

        if (status === PaymentStatus.CONFIRMED || status === PaymentStatus.PAID) {
            await prisma.payment.update({
                where: { id },
                data: {
                    ...updatePaymentStatusInput,
                    approvedBy: {
                        connect: {
                            id: memberId
                        }
                    },
                    approvedAt: new Date(),
                    cancelledReason: null,
                    cancelledAt: null,
                    cancelledById: undefined
                }
            });
        }

        if (status === PaymentStatus.CANCELLED) {
            await prisma.payment.update({
                where: { id },
                data: {
                    ...updatePaymentStatusInput,
                    cancelledBy: {
                        connect: {
                            id: memberId
                        }
                    },
                    cancelledAt: new Date(),
                    cancelledReason: updatePaymentStatusInput.cancelledReason,
                    approvedAt: null,
                    approvedById: undefined
                }
            });
        }

        return this.findOne(id);
    }
}

export default PaymentService; 