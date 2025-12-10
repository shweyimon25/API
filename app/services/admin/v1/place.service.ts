import {
  CreatePlaceInput,
  UpdatePlaceInput,
} from "./../../../schemas/admin/v1/place.schema";
import prisma from "../../../../prisma/client";
import { NotFoundException } from "../../../helpers/exceptions";

class PlaceService {
  async findAll() {
    const places = await prisma.place.findMany({
      orderBy: {
        id: "desc",
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
    });

    if (!place) {
      throw new NotFoundException("Place not found");
    }

    return place;
  }

  async create(createPlaceInput: CreatePlaceInput) {
    const place = await prisma.place.create({
      data: {
        ...createPlaceInput,
      },
    });

    return this.findOne(place.id);
  }

  async update(id: number, updatePlaceInput: UpdatePlaceInput) {
    const { name } = updatePlaceInput;

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
        name: name || existingPlace.name,
      },
    });

    return this.findOne(id);
  }

  async destroy(id: number) {
    const place = await this.findOne(id);

    await prisma.place.delete({
      where: {
        id,
      },
    });

    return place;
  }
}

export default PlaceService;
