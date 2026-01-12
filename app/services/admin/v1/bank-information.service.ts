import {
  CreateBankInformationInput,
  UpdateBankInformationInput,
} from "../../../schemas/admin/v1/bank-information.schema";
import prisma from "../../../../prisma/client";
import { PaymentTypes, Prisma, Status } from "@prisma/client";
import {
  NotFoundException,
  ValidationException,
} from "../../../helpers/exceptions";

class BankInformationService {
  async findAll(where?: Prisma.BankInformationWhereInput) {
    const bankInformations = await prisma.bankInformation.findMany({
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

    const totalBankInformations = await prisma.bankInformation.count({
      where,
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
    const bankInformation = await prisma.bankInformation.findUnique({
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

    if (!bankInformation) {
      throw new NotFoundException("Bank information not found");
    }

    return bankInformation;
  }

  async findCommonAll(where?: Prisma.BankInformationWhereInput) {
    const bankInformations = await prisma.bankInformation.findMany({
      where: {
        ...where,
        status: Status.ACTIVE,
        deletedAt: null,
      },
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

  async create(
    createBankInformationInput: CreateBankInformationInput,
    userId: number
  ) {
    const {
      bankAccountHolder,
      bankAccountNumber,
      phone,
      paymentTypes,
      status,
    } = createBankInformationInput;

    // Check if bank account number already exists
    const existingBankAccountNumber = await prisma.bankInformation.findUnique({
      where: {
        bankAccountNumber,
      },
    });

    if (existingBankAccountNumber) {
      throw new ValidationException("Failed to create bank information", [
        {
          field: "bankAccountNumber",
          issue: "Bank account number already exists",
        },
      ]);
    }

    // Create new bank information
    const bankInformation = await prisma.bankInformation.create({
      data: {
        bankAccountHolder,
        bankAccountNumber,
        phone,
        paymentTypes: paymentTypes ?? PaymentTypes.BANK_ACCOUNT,
        status: status ?? Status.ACTIVE,
        createdById: userId,
        updatedById: userId,
      },
    });

    return this.findOne(bankInformation.id);
  }

  async update(
    id: number,
    updateBankInformationInput: UpdateBankInformationInput,
    userId: number
  ) {
    const {
      bankAccountHolder,
      bankAccountNumber,
      phone,
      paymentTypes,
      status,
    } = updateBankInformationInput;

    // Check bank information exists
    const existingBankInformation = await prisma.bankInformation.findUnique({
      where: {
        id,
      },
    });

    if (!existingBankInformation) {
      throw new NotFoundException("Bank information not found");
    }

    // Check if bank account number already exists (if bankAccountNumber is being updated)
    if (
      bankAccountNumber &&
      bankAccountNumber !== existingBankInformation.bankAccountNumber
    ) {
      const existingBankAccountNumber = await prisma.bankInformation.findUnique(
        {
          where: {
            bankAccountNumber,
          },
        }
      );

      if (existingBankAccountNumber) {
        throw new ValidationException("Failed to update bank information", [
          {
            field: "bankAccountNumber",
            issue: "Bank account number already exists",
          },
        ]);
      }
    }

    // Update bank information
    await prisma.bankInformation.update({
      where: {
        id,
      },
      data: {
        bankAccountHolder:
          bankAccountHolder ?? existingBankInformation.bankAccountHolder,
        bankAccountNumber:
          bankAccountNumber ?? existingBankInformation.bankAccountNumber,
        phone: phone ?? existingBankInformation.phone,
        paymentTypes: paymentTypes ?? existingBankInformation.paymentTypes,
        status: status ?? existingBankInformation.status,
        updatedById: userId,
      },
    });

    return this.findOne(id);
  }

  async destroy(id: number) {
    // Find bank information
    const bankInformation = await this.findOne(id);

    // Delete bank information
    await prisma.bankInformation.update({
      where: {
        id,
      },
      data: {
        status: Status.DELETE,
        deletedAt: new Date(),
      },
    });

    return bankInformation;
  }
}

export default BankInformationService;
