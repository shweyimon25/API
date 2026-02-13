import { Prisma, Status } from "@prisma/client";
import prisma from "../../../../prisma/client";
import { NotFoundException } from "../../../helpers/exceptions";

class BankInformationService {
  async findAll(where?: Prisma.BankInformationWhereInput) {
    const bankInformations = await prisma.bankInformation.findMany({
      orderBy: {
        id: "desc",
      },
    });

    return bankInformations;
  }

  async findCommonAll(where?: Prisma.BankInformationWhereInput) {
    const bankInformations = await prisma.bankInformation.findMany({
      where,
      orderBy: {
        id: "desc",
      },
      select: {
        id: true,
        bankAccountHolder: true,
        bankAccountNumber: true,
      },
    });

    return bankInformations;
  }

  async findByPaginate(page: number, perPage: number, where?: Prisma.BankInformationWhereInput) {
    const bankInformations = await prisma.bankInformation.findMany({
      where,
      orderBy: {
        id: "desc",
      },
      skip: (page - 1) * perPage,
      take: perPage,
    });

    const totalBankInformations = await prisma.bankInformation.count({
      where: {
        ...where,
        status: Status.ACTIVE,
      },
    });

    return {
      data: bankInformations,
      meta: {
        totalCount: totalBankInformations,
        totalPages: Math.ceil(totalBankInformations / perPage),
        currentPage: page,
        perPage,
        prevPage: page > 1 ? page - 1 : null,
        nextPage:
          page < Math.ceil(totalBankInformations / perPage) ? page + 1 : null,
        hasPrevPage: page > 1,
        hasNextPage: page < Math.ceil(totalBankInformations / perPage),
      },
    };
  }

  async findOne(id: number) {
    const bankInformation = await prisma.bankInformation.findFirst({
      where: {
        id,
        status: Status.ACTIVE,
      },
    });

    if (!bankInformation) {
      throw new NotFoundException("Bank information not found");
    }

    return bankInformation;
  }
}

export default BankInformationService;
