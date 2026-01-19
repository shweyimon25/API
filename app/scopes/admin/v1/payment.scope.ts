import { Prisma, PaymentStatus } from "@prisma/client";

interface PaymentScopeQuery {
    status?: string;
    memberId?: string;
    memberPlanId?: string;
    memberTypeId?: string;
    minAmount?: string;
    maxAmount?: string;
}

export const paymentScope = (query: PaymentScopeQuery): Prisma.PaymentWhereInput => {
    const { status, memberId, memberPlanId, memberTypeId, minAmount, maxAmount } = query;

    const where: Prisma.PaymentWhereInput = {};

    if (status) {
        where.status = status as PaymentStatus;
    }

    if (memberId) {
        where.memberId = +memberId;
    }

    if (memberPlanId) {
        where.memberPlanId = +memberPlanId;
    }

    if (memberTypeId) {
        where.memberTypeId = +memberTypeId;
    }

    if (minAmount || maxAmount) {
        where.amount = {};
        if (minAmount) {
            where.amount.gte = +minAmount;
        }
        if (maxAmount) {
            where.amount.lte = +maxAmount;
        }
    }

    return where;
};
