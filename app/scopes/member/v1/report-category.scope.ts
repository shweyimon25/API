import { Prisma, Status } from "@prisma/client";

interface ReportCategoryScopeQuery {
    name?: string;
    status?: string;
}

export const reportCategoryScope = (query: ReportCategoryScopeQuery): Prisma.ReportCategoryWhereInput => {
    const { name, status } = query;

    const where: Prisma.ReportCategoryWhereInput = {
        status: Status.ACTIVE, // Default to active status
    };

    if (name) {
        where.name = {
            contains: name,
            mode: "insensitive",
        };
    }

    if (status) {
        where.status = status as Status;
    }

    return where;
};
