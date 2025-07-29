import { Request, Response } from "express";
import { successResponse } from "../../../helpers/response";
import RestaurantService from "../../../services/admin/v1/restaurant.service";
import { validater } from "../../../helpers/validator";
import { ValidationException } from "../../../helpers/exceptions";
import prisma from "../../../../prisma/client";
import { createRestaurantSchema, updateRestaurantSchema } from "../../../schemas/admin/v1/restaurant.schema";
import { RestaurantCollection } from "../../../resources/admin/v1/restaurant/restaurant.collection";
import { RestaurantResource } from "../../../resources/admin/v1/restaurant/restaurant.resource";

class RestaurantController {
  private restaurantService: RestaurantService;

  constructor() {
    this.restaurantService = new RestaurantService();
  }

  async findAll(req: Request, res: Response) {
    const { page = 1, perPage = 10 } = req.query;

    if (page && perPage) {
      const floors = await this.restaurantService.findByPaginate(+page, +perPage);
      return successResponse(
        res,
        "Restaurant list successfully",
        RestaurantCollection.withPagination(floors)
      );
    }

    const floors = await this.restaurantService.findAll();
    return successResponse(
      res,
      "Restaurant list successfully",
      RestaurantCollection.toCollection(floors)
    );
  }

  async findOne(req: Request, res: Response) {
    const { id } = req.params;
    const restaurant = await this.restaurantService.findOne(+id);
    return successResponse(
      res,
      "Restaurant detail successfully",
      RestaurantResource.toResource(restaurant)
    );
  }

  async create(req: Request, res: Response) {
    const { data, error, success } = await validater(
      createRestaurantSchema,
      req.body
    );

    const existingRestaurant = await prisma.restaurant.findFirst({
      where: {
        name: data.name,
      },
    });

    if (existingRestaurant) {
      throw new ValidationException("Restaurant created failed", [
        {
          field: "name",
          issue: "Name is already exist",
        },
      ]);
    }

    if (!success) {
      throw new ValidationException("Restaurant created failed", error);
    }

    const restaurant = await this.restaurantService.create(data);
    return successResponse(
      res,
      "Restaurant created successfully",
      RestaurantResource.toResource(restaurant)
    );
  }

  async update(req: Request, res: Response) {
    const { id } = req.params;
    const { name } = req.body;

    if (name) {
      const existingRestaurant = await prisma.restaurant.findFirst({
        where: {
          name,
          NOT: { id: +id },
        },
      });

      if (existingRestaurant) {
        throw new ValidationException("Restaurant updated failed", [
          {
            field: "name",
            issue: "Name is already exist",
          },
        ]);
      }
    }

    const { data, error, success } = await validater(
      updateRestaurantSchema,
      req.body
    );

    if (!success) {
      throw new ValidationException("Restaurant updated failed", error);
    }

    const restaurant = await this.restaurantService.update(+id, data);
    return successResponse(
      res,
      "Restaurant updated successfully",
      RestaurantResource.toResource(restaurant)
    );
  }
}

export default RestaurantController;
