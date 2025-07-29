import { Request, Response } from "express";
import { successResponse } from "../../../helpers/response";
import { validater } from "../../../helpers/validator";
import {
  createCustomerSchema,
  updateCustomerSchema,
} from "../../../schemas/admin/v1/customer.schema";
import { ValidationException } from "../../../helpers/exceptions";
import prisma from "../../../../prisma/client";
import CustomerService from "../../../services/admin/v1/customer.service";
import { CustomerCollection } from "../../../resources/admin/v1/customer/customer.collection";
import { CustomerResource } from "../../../resources/admin/v1/customer/customer.resource";

class CustomerController {
  private customerService: CustomerService;

  constructor() {
    this.customerService = new CustomerService();
  }

  async findAll(req: Request, res: Response) {
    const { page = 1, perPage = 10 } = req.query;

    if (page && perPage) {
      const customers = await this.customerService.findByPaginate(
        +page,
        +perPage
      );
      return successResponse(
        res,
        "Customer list successfully",
        CustomerCollection.withPagination(customers)
      );
    }

    const customers = await this.customerService.findAll();

    return successResponse(
      res,
      "Customer list successfully",
      CustomerCollection.toCollection(customers)
    );
  }

  async findOne(req: Request, res: Response) {
    const { id } = req.params;
    const customer = await this.customerService.findOne(+id);

    return successResponse(
      res,
      "Customer detail successfully",
      CustomerResource.toResource(customer)
    );
  }

  async create(req: Request, res: Response) {
    const { data, error, success } = await validater(
      createCustomerSchema,
      req.body
    );

    if (!success) {
      throw new ValidationException("Customer created failed", error);
    }

    const customer = await this.customerService.create(data);

    return successResponse(
      res,
      "Customer created successfully",
      CustomerResource.toResource(customer)
    );
  }

  async update(req: Request, res: Response) {
    const { id } = req.params;
    const { name, email, phone } = req.body;

    if (name) {
      const existingCustomer = await prisma.customer.findFirst({
        where: {
          name,
          NOT: { id: +id },
        },
      });

      if (existingCustomer) {
        throw new ValidationException("Customer updated failed", [
          {
            field: "name",
            issue: "Name is already exist",
          },
        ]);
      }
    }

    if (email) {
      const existingCustomer = await prisma.customer.findFirst({
        where: {
          email,
          NOT: { id: +id },
        },
      });

      if (existingCustomer) {
        throw new ValidationException("Customer updated failed", [
          {
            field: "email",
            issue: "Email is already exist",
          },
        ]);
      }
    }

    if (phone) {
      const existingCustomer = await prisma.customer.findFirst({
        where: {
          phone,
          NOT: { id: +id },
        },
      });

      if (existingCustomer) {
        throw new ValidationException("Customer updated failed", [
          {
            field: "phone",
            issue: "Phone is already exist",
          },
        ]);
      }
    }

    const { data, error, success } = await validater(
      updateCustomerSchema,
      req.body
    );

    if (!success) {
      throw new ValidationException("Customer updated failed", error);
    }

    const customer = await this.customerService.update(+id, data);
    return successResponse(
      res,
      "Customer updated successfully",
      CustomerResource.toResource(customer)
    );
  }
}

export default CustomerController;
