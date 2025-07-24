import { Request, Response } from "express";
import { successResponse } from "../../../helpers/response";
import DrinkService from "../../../services/admin/v1/drink.service";
import { validater } from "../../../helpers/validator";
import { ValidationException } from "../../../helpers/exceptions";
import prisma from "../../../../prisma/client";
import { DrinkResource } from "../../../resources/admin/v1/drink/drink.resource";
import { DrinkCollection } from "../../../resources/admin/v1/drink/drink.collection";
import { createDrinkSchema, updateDrinkSchema } from "../../../schemas/admin/v1/drink.schema";

class DrinkController {
  private drinkService: DrinkService;

  constructor() {
    this.drinkService = new DrinkService();
  }

  async findAll(req: Request, res: Response) {
    const { page = 1, perPage = 10 } = req.query;

    if (page && perPage) {
      const drinks = await this.drinkService.findByPaginate(+page, +perPage);
      return successResponse(
        res,
        "Drink list successfully",
        DrinkCollection.withPagination(drinks)
      );
    }

    const drinks = await this.drinkService.findAll();
    return successResponse(
      res,
      "Drink list successfully",
      DrinkCollection.toCollection(drinks)
    );
  }

  async findOne(req: Request, res: Response) {
    const { id } = req.params;
    const drink = await this.drinkService.findOne(+id);
    return successResponse(
      res,
      "Drink detail successfully",
      DrinkResource.toResource(drink)
    );
  }

  async create(req: Request, res: Response) {
    const { data, error, success } = await validater(
      createDrinkSchema,
      req.body
    );

    if (!success) {
      throw new ValidationException("Drink created failed", error);
    }

    const drink = await this.drinkService.create(data);
    return successResponse(
      res,
      "Drink created successfully",
      DrinkResource.toResource(drink)
    );
  }

  async update(req: Request, res: Response) {
    const { id } = req.params;
    const { name } = req.body;

    if (name) {
      const existingRole = await prisma.role.findFirst({
        where: {
          name,
          NOT: { id: +id },
        },
      });

      if (existingRole) {
        throw new ValidationException("Role updated failed", [
          {
            field: "name",
            issue: "Name is already exist",
          },
        ]);
      }
    }

    const { data, error, success } = await validater(
      updateDrinkSchema,
      req.body
    );

    if (!success) {
      throw new ValidationException("Drink updated failed", error);
    }

    const drink = await this.drinkService.update(+id, data);
    return successResponse(
      res,
      "Drink updated successfully",
      DrinkResource.toResource(drink)
    );
  }

  async destroy(req: Request, res: Response) {
    const { id } = req.params;
    await this.drinkService.destroy(+id);
    return successResponse(res, "Drink deleted successfully");
  }
}

export default DrinkController;
