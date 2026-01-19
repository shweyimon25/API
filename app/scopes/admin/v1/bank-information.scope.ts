import { Prisma, PaymentTypes, Status } from "@prisma/client";

interface BankInformationScopeQuery {
    bankAccountHolder?: string;
    bankAccountNumber?: string;
    phone?: string;
    paymentTypes?: string;
    status?: string;
}

export const bankInformationScope = (query: BankInformationScopeQuery): Prisma.BankInformationWhereInput => {
    const { bankAccountHolder, bankAccountNumber, phone, paymentTypes, status } = query;

    const where: Prisma.BankInformationWhereInput = {};

    if (bankAccountHolder || bankAccountNumber || phone) {
        where.OR = [];
        if (bankAccountHolder) {
            where.OR.push({
                bankAccountHolder: {
                    contains: bankAccountHolder,
                    mode: "insensitive",
                },
            });
        }
        if (bankAccountNumber) {
            where.OR.push({
                bankAccountNumber: {
                    contains: bankAccountNumber,
                    mode: "insensitive",
                },
            });
        }
        if (phone) {
            where.OR.push({
                phone: {
                    contains: phone,
                    mode: "insensitive",
                },
            });
        }
    }

    if (paymentTypes) {
        where.paymentTypes = paymentTypes as PaymentTypes;
    }

    if (status) {
        where.status = status as Status;
    }

    return where;
};
