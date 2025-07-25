import { Request, Response } from "express";
import { successResponse } from "../../../helpers/response";
import CuisineService from "../../../services/admin/v1/cuisine.service";
import { validater } from "../../../helpers/validator";
import {
  createCuisineSchema,
  updateCuisineSchema,
} from "../../../schemas/admin/v1/cuisine.schema";
import { ValidationException } from "../../../helpers/exceptions";
import prisma from "../../../../prisma/client";
import { CuisineCollection } from "../../../resources/admin/v1/cuisine/cuisine.collection";
import { CuisineResource } from "../../../resources/admin/v1/cuisine/cuisine.resource";

class CuisineController {
  private cuisineService: CuisineService;

  constructor() {
    this.cuisineService = new CuisineService();
  }

  async findAll(req: Request, res: Response) {
    const { page = 1, perPage = 10 } = req.query;

    if (page && perPage) {
      const cuisines = await this.cuisineService.findByPaginate(+page, +perPage);
      return successResponse(
        res,
        "Cuisine list successfully",
        CuisineCollection.withPagination(cuisines)
      );
    }

    const cuisines = await this.cuisineService.findAll();
    return successResponse(
      res,
      "Cuisine list successfully",
      CuisineCollection.toCollection(cuisines)
    );
  }

  async findOne(req: Request, res: Response) {
    const { id } = req.params;
    const cuisine = await this.cuisineService.findOne(+id);
    return successResponse(
      res,
      "Cuisine detail successfully",
      CuisineResource.toResource(cuisine)
    );
  }

  async create(req: Request, res: Response) {
    const { data, error, success } = await validater(
      createCuisineSchema,
      req.body
    );

    if (!success) {
      throw new ValidationException("Cuisine created failed", error);
    }

    const cuisine = await this.cuisineService.create(data);
    return successResponse(
      res,
      "Cuisine created successfully",
      CuisineResource.toResource(cuisine)
    );
  }

  async update(req: Request, res: Response) {
    const { id } = req.params;
    const { name } = req.body;

    if (name) {
      const existingCuisine = await prisma.cuisine.findFirst({
        where: {
          name,
          NOT: { id: +id },
        },
      });

      if (existingCuisine) {
        throw new ValidationException("Cuisine updated failed", [
          {
            field: "name",
            issue: "Name is already exist",
          },
        ]);
      }
    }

    const { data, error, success } = await validater(
      updateCuisineSchema,
      req.body
    );

    if (!success) {
      throw new ValidationException("Cuisine updated failed", error);
    }

    const cuisine = await this.cuisineService.update(+id, data);
    return successResponse(
      res,
      "Cuisine updated successfully",
      CuisineResource.toResource(cuisine)
    );
  }

  async destroy(req: Request, res: Response) {
    const { id } = req.params;
    await this.cuisineService.destroy(+id);
    return successResponse(res, "Cuisine deleted successfully");
  }
}

export default CuisineController;
