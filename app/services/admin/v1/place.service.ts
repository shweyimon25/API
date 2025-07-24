import prisma from "../../../../prisma/client";
import { BadRequestException } from "../../../helpers/exceptions";
import {
  CreatePlaceInput,
  UpdatePlaceInput,
} from "../../../schemas/admin/v1/place.schema";

class PlaceService {
  async findAll() {
    const places = await prisma.place.findMany({
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

    return places;
  }

  async findByPaginate(page: number, perPage: number) {
    const places = await prisma.place.findMany({
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

    const totalPlaces = await prisma.place.count();

    return {
      data: places,
      meta: {
        totalCount: totalPlaces,
        totalPages: Math.ceil(totalPlaces / perPage),
        currentPage: page,
        perPage,
        prevPage: page > 1 ? page - 1 : null,
        nextPage: page < Math.ceil(totalPlaces / perPage) ? page + 1 : null,
        hasPrevPage: page > 1,
        hasNextPage: page < Math.ceil(totalPlaces / perPage),
      },
    };
  }

  async findOne(id: number) {
    const place = await prisma.place.findUnique({
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

    if (!place) {
      throw new BadRequestException("Place not found");
    }

    return place;
  }

  async create(createPlaceInput: CreatePlaceInput) {
    const { name } = createPlaceInput;

    const place = await prisma.place.create({
      data: {
        name,
      },
    });

    return this.findOne(place.id);
  }

  async update(id: number, updatePlaceInput: UpdatePlaceInput) {
    const { name } = updatePlaceInput;

    const place = await prisma.place.findUnique({
      where: {
        id,
      },
    });

    if (!place) {
      throw new BadRequestException("Place not found");
    }

    await prisma.place.update({
      where: {
        id,
      },
      data: {
        name: name || place.name,
      },
    });

    return this.findOne(id);
  }

  async destroy(id: number) {
    await this.findOne(id);
    await prisma.place.delete({ where: { id } });
  }
}

export default PlaceService;
