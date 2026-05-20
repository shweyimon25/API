import { Prisma, Status } from "@prisma/client";
import prisma from "../../../../prisma/client";
import { NotFoundException } from "../../../helpers/exceptions";

class ReportCategoryService {
  async findAll(where?: Prisma.ReportCategoryWhereInput) {
    const reportCategorys = await prisma.reportCategory.findMany({
      orderBy: {
        id: "desc",
      },
    });
    const totalCount = await prisma.reportCategory.count({
      where,
    });

    return {count : totalCount,
            results : reportCategorys
    };
  }

  async findByPaginate(page: number, perPage: number, where?: Prisma.ReportCategoryWhereInput) {
    const reportCategorys = await prisma.reportCategory.findMany({
      where,
      orderBy: {
        id: "desc",
      },
      skip: (page - 1) * perPage,
      take: perPage,
    });

    const totalReportCategorys = await prisma.reportCategory.count({
      where: {
        ...where,
        status: Status.ACTIVE,
      },
    });

    return {
      data: reportCategorys,
      meta: {
        totalCount: totalReportCategorys,
        totalPages: Math.ceil(totalReportCategorys / perPage),
        currentPage: page,
        perPage,
        prevPage: page > 1 ? page - 1 : null,
        nextPage:
          page < Math.ceil(totalReportCategorys / perPage) ? page + 1 : null,
        hasPrevPage: page > 1,
        hasNextPage: page < Math.ceil(totalReportCategorys / perPage),
      },
    };
  }

  async findOne(id: number) {
    const reportCategory = await prisma.reportCategory.findFirst({
      where: {
        id,
        status: Status.ACTIVE,
      },
    });

    if (!reportCategory) {
      throw new NotFoundException("Report category not found");
    }

    return reportCategory;
  }
}

export default ReportCategoryService;
