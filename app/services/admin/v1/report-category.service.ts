import prisma from "../../../../prisma/client";
import { NotFoundException } from "../../../helpers/exceptions";
import {
  CreateReportCategoryInput,
  UpdateReportCategoryInput,
} from "../../../schemas/admin/v1/report-category.schema";
import { Prisma, Status } from "@prisma/client";

class ReportCategoryService {
  async findAll(where?: Prisma.ReportCategoryWhereInput) {
    const categories = await prisma.reportCategory.findMany({
      where,
      orderBy: {
        id: "desc",
      },
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
            username: true,
          },
        },
        updatedBy: {
          select: {
            id: true,
            name: true,
            email: true,
            username: true,
          },
        },
      },
    });

    return categories;
  }

  async findByPaginate(page: number, perPage: number, where?: Prisma.ReportCategoryWhereInput) {
    const categories = await prisma.reportCategory.findMany({
      where,
      orderBy: {
        id: "desc",
      },
      skip: (page - 1) * perPage,
      take: perPage,
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
            username: true,
          },
        },
        updatedBy: {
          select: {
            id: true,
            name: true,
            email: true,
            username: true,
          },
        },
      },
    });

    const totalReportCategory = await prisma.reportCategory.count({
      where,
    });

    return {
      data: categories,
      meta: {
        totalCount: totalReportCategory,
        totalPages: Math.ceil(totalReportCategory / perPage),
        currentPage: page,
        perPage,
        prevPage: page > 1 ? page - 1 : null,
        nextPage: page < Math.ceil(totalReportCategory / perPage) ? page + 1 : null,
        hasPrevPage: page > 1,
        hasNextPage: page < Math.ceil(totalReportCategory / perPage),
      },
    };
  }

  async findOne(id: number) {
    const reportCategory = await prisma.reportCategory.findUnique({
      where: {
        id,
      },
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
            username: true,
          },
        },
        updatedBy: {
          select: {
            id: true,
            name: true,
            email: true,
            username: true,
          },
        },
      },
    });

    if (!reportCategory) {
      throw new NotFoundException("ReportCategory not found");
    }

    return reportCategory;
  }

  async findCommonAll(where?: Prisma.ReportCategoryWhereInput) {
    const categories = await prisma.reportCategory.findMany({
      where: {
        ...where,
        status: Status.ACTIVE,
      },
      orderBy: {
        id: "desc",
      },
      select: {
        id: true,
        name: true,
      },
    });

    return categories;
  }

  async create(createReportCategoryInput: CreateReportCategoryInput) {
    const { name, status } = createReportCategoryInput;
    const reportCategory = await prisma.reportCategory.create({
      data: {
        name,
        status: status ?? Status.ACTIVE,
      },
    });

    return this.findOne(reportCategory.id);
  }

  async update(id: number, updateReportCategoryInput: UpdateReportCategoryInput) {
    const { name, status } = updateReportCategoryInput;

    // Check reportCategory exists
    const existingReportCategory = await prisma.reportCategory.findUnique({
      where: {
        id,
      },
    });

    if (!existingReportCategory) {
      throw new NotFoundException("ReportCategory not found");
    }

    await prisma.reportCategory.update({
      where: {
        id,
      },
      data: {
        name: name ?? existingReportCategory.name,
        status: status ?? existingReportCategory.status,
      },
    });

    return this.findOne(id);
  }

  async destroy(id: number) {
    const reportCategory = await this.findOne(id);

    await prisma.reportCategory.delete({
      where: { id },
    });

    return reportCategory;
  }
}

export default ReportCategoryService;
