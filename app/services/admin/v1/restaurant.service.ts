import prisma from "../../../../prisma/client";
import { BadRequestException } from "../../../helpers/exceptions";
import {
  CreateRestaurantInput,
  UpdateRestaurantInput,
} from "../../../schemas/admin/v1/restaurant.schema";

class RestaurantService {
  async findAll() {
    const restaurants = await prisma.restaurant.findMany({
      orderBy: {
        id: "desc",
      },
      include: {
        type: true,
        profile: true,
      },
    });

    return restaurants;
  }

  async findByPaginate(page: number, perPage: number) {
    const restaurants = await prisma.restaurant.findMany({
      orderBy: {
        id: "desc",
      },
      skip: (page - 1) * perPage,
      take: perPage,
      include: {
        type: true,
        profile: true,
      },
    });

    const totalRestaurants = await prisma.restaurant.count();

    return {
      data: restaurants,
      meta: {
        totalCount: totalRestaurants,
        totalPages: Math.ceil(totalRestaurants / perPage),
        currentPage: page,
        perPage,
        prevPage: page > 1 ? page - 1 : null,
        nextPage: page < Math.ceil(totalRestaurants / perPage) ? page + 1 : null,
        hasPrevPage: page > 1,
        hasNextPage: page < Math.ceil(totalRestaurants / perPage),
      },
    };
  }

  async findOne(id: number) {
    const restaurant = await prisma.restaurant.findUnique({
      where: {
        id,
      },
      include: {
        type: true,
        profile: true,
      },
    });

    if (!restaurant) {
      throw new BadRequestException("Restaurant not found");
    }

    return restaurant;
  }

  async create(createRestaurantInput: CreateRestaurantInput) {
    const { name, typeId, logoUrl, bannerUrl, phone, address, lineId, facebookUrl, coordinateLatitude, coordinateLongitude, preBookingPeriod, openDays, openTime, status }: any = createRestaurantInput;

    const restaurant = await prisma.restaurant.create({
      data: {
        name,
        type: {
          connect: {
            id: typeId,
          },
        },
        profile: {
          create: {
            logoUrl,
            bannerUrl,
            phone,
            address,
            lineId,
            facebookUrl,
            coordinateLatitude,
            coordinateLongitude,
            preBookingPeriod,
            openDays,
            openTime
          },
        },
        status,
      },
    });

    return this.findOne(restaurant.id);
  }

  async update(id: number, updateRestaurantInput: UpdateRestaurantInput) {
    const { name } = updateRestaurantInput;

    const restaurant = await prisma.restaurant.findUnique({
      where: {
        id,
      },
    });

    if (!restaurant) {
      throw new BadRequestException("Restaurant not found");
    }

    await prisma.restaurant.update({
      where: {
        id,
      },
      data: {
        name: name || restaurant.name,
      },
    });

    return this.findOne(id);
  }
}

export default RestaurantService;
