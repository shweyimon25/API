import {
  CreatePlaceInput,
  UpdatePlaceInput,
} from "./../../../schemas/admin/v1/place.schema";
import prisma from "../../../../prisma/client";
import { NotFoundException } from "../../../helpers/exceptions";
import { Prisma, Status } from "@prisma/client";

class PlaceService {
  async findAll(where?: Prisma.PlaceWhereInput) {
    const places = await prisma.place.findMany({
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

    return places;
  }

  async findByPaginate(page: number, perPage: number, where?: Prisma.PlaceWhereInput) {
    const places = await prisma.place.findMany({
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

    const totalPlaces = await prisma.place.count({
      where,
    });

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

    if (!place) {
      throw new NotFoundException("Place not found");
    }

    return place;
  }

  async findCommonAll(where?: Prisma.PlaceWhereInput) {
    const places = await prisma.place.findMany({
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

    return places;
  }

  async create(createPlaceInput: CreatePlaceInput) {
    const { name, status } = createPlaceInput;
    const place = await prisma.place.create({
      data: {
        name,
        status: status ?? Status.ACTIVE,
      },
    });

    return this.findOne(place.id);
  }

  async update(id: number, updatePlaceInput: UpdatePlaceInput) {
    const { name, status } = updatePlaceInput;

    const existingPlace = await prisma.place.findUnique({
      where: {
        id,
      },
    });

    if (!existingPlace) {
      throw new NotFoundException("Place not found");
    }

    await prisma.place.update({
      where: {
        id,
      },
      data: {
        name: name ?? existingPlace.name,
        status: status ?? existingPlace.status,
      },
    });

    return this.findOne(id);
  }

  async destroy(id: number) {
    const place = await this.findOne(id);

    await prisma.place.delete({
      where: { id },
    });

    return place;
  }
}

export default PlaceService;
