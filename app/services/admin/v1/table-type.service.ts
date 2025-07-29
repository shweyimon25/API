import prisma from "../../../../prisma/client";
import { BadRequestException } from "../../../helpers/exceptions";
import { CreateTableTypeInput, UpdateTableTypeInput } from "../../../schemas/admin/v1/table-type.schema";

class TableTypeService {
  async findAll() {
    const types = await prisma.tableType.findMany({
      orderBy: {
        id: "desc",
      },
      select: {
        id: true,
        name: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return types;
  }

  async findByPaginate(page: number, perPage: number) {
    const types = await prisma.tableType.findMany({
      orderBy: {
        id: "desc",
      },
      skip: (page - 1) * perPage,
      take: perPage,
      select: {
        id: true,
        name: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    const totalTypes = await prisma.tableType.count();

    return {
      data: types,
      meta: {
        totalCount: totalTypes,
        totalPages: Math.ceil(totalTypes / perPage),
        currentPage: page,
        perPage,
        prevPage: page > 1 ? page - 1 : null,
        nextPage: page < Math.ceil(totalTypes / perPage) ? page + 1 : null,
        hasPrevPage: page > 1,
        hasNextPage: page < Math.ceil(totalTypes / perPage),
      },
    };
  }

  async findOne(id: number) {
    const type = await prisma.tableType.findUnique({
      where: {
        id,
      },
      select: {
        id: true,
        name: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!type) {
      throw new BadRequestException("Table Type not found");
    }

    return type;
  }

  async create(createTableTypeInput: CreateTableTypeInput) {
    const { name } = createTableTypeInput;

    const type = await prisma.tableType.create({
      data: {
        name,
      },
    });

    return this.findOne(type.id);
  }

  async update(id: number, updateTableTypeInput: UpdateTableTypeInput) {
    const { name } = updateTableTypeInput;

    const type = await prisma.tableType.findUnique({
      where: {
        id,
      },
    });

    if (!type) {
      throw new BadRequestException("Table Type not found");
    }

    await prisma.tableType.update({
      where: {
        id,
      },
      data: {
        name: name || type.name,
      },
    });

    return this.findOne(id);
  }

  async destroy(id: number) {
    await this.findOne(id);
    await prisma.tableType.delete({ where: { id } });
  }
}

export default TableTypeService;
