import { PaymentTypes, Status } from "@prisma/client";
import prisma from "../../../../prisma/client";
import { NotFoundException } from "../../../helpers/exceptions";

interface BankInformationFilters {
  paymentTypes?: PaymentTypes;
  search?: string;
}

class BankInformationService {
  private where(filters?: BankInformationFilters) {
    const where: any = {
      status: Status.ACTIVE,
      deletedAt: null,
    };

    if (filters?.paymentTypes) {
      where.paymentTypes = filters.paymentTypes as PaymentTypes;
    }

    if (filters?.search) {
      where.OR = [
        {
          bankAccountHolder: {
            contains: filters.search,
          },
        },
        {
          bankAccountNumber: {
            contains: filters.search,
          },
        },
        {
          phone: {
            contains: filters.search,
          },
        },
      ];
    }

    return where;
  }

  async findAll(filters?: BankInformationFilters) {
    const bankInformations = await prisma.bankInformation.findMany({
      where: this.where(filters),
      orderBy: {
        id: "desc",
      },
    });

    return bankInformations;
  }

  async findOne(id: number) {
    const bankInformation = await prisma.bankInformation.findUnique({
      where: {
        id,
        status: Status.ACTIVE,
        deletedAt: null,
      },
    });

    if (!bankInformation) {
      throw new NotFoundException("Bank information not found");
    }

    return bankInformation;
  }
}

export default BankInformationService;
