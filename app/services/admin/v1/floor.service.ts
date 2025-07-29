import prisma from "../../../../prisma/client";
import { BadRequestException } from "../../../helpers/exceptions";
import {
  CreateFloorInput,
  UpdateFloorInput,
} from "../../../schemas/admin/v1/floor.schema";

class FloorService {
  async findAll() {
    const floors = await prisma.floor.findMany({
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

    return floors;
  }

  async findByPaginate(page: number, perPage: number) {
    const floors = await prisma.floor.findMany({
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

    const totalFloors = await prisma.floor.count();

    return {
      data: floors,
      meta: {
        totalCount: totalFloors,
        totalPages: Math.ceil(totalFloors / perPage),
        currentPage: page,
        perPage,
        prevPage: page > 1 ? page - 1 : null,
        nextPage: page < Math.ceil(totalFloors / perPage) ? page + 1 : null,
        hasPrevPage: page > 1,
        hasNextPage: page < Math.ceil(totalFloors / perPage),
      },
    };
  }

  async findOne(id: number) {
    const floor = await prisma.floor.findUnique({
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

    if (!floor) {
      throw new BadRequestException("Floor not found");
    }

    return floor;
  }

  async create(createFloorInput: CreateFloorInput) {
    const { name } = createFloorInput;

    const floor = await prisma.floor.create({
      data: {
        name,
      },
    });

    return this.findOne(floor.id);
  }

  async update(id: number, updateFloorInput: UpdateFloorInput) {
    const { name } = updateFloorInput;

    const floor = await prisma.floor.findUnique({
      where: {
        id,
      },
    });

    if (!floor) {
      throw new BadRequestException("Floor not found");
    }

    await prisma.floor.update({
      where: {
        id,
      },
      data: {
        name: name || floor.name,
      },
    });

    return this.findOne(id);
  }

  async destroy(id: number) {
    await this.findOne(id);
    await prisma.floor.delete({ where: { id } });
  }
}

export default FloorService;
