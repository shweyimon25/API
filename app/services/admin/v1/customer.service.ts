import prisma from "../../../../prisma/client";
import { BadRequestException } from "../../../helpers/exceptions";
import { hashPassword } from "../../../helpers/helper";
import {
  CreateCustomerInput,
  UpdateCustomerInput,
} from "../../../schemas/admin/v1/customer.schema";

class CustomerService {
  async findAll() {
    const customers = await prisma.customer.findMany({
      orderBy: {
        id: "desc",
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        balance: true,
        profile: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return customers;
  }

  async findByPaginate(page: number, perPage: number) {
    const customers = await prisma.customer.findMany({
      orderBy: {
        id: "desc",
      },
      skip: (page - 1) * perPage,
      take: perPage,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        balance: true,
        profile: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    const totalCustomers = await prisma.customer.count();

    return {
      data: customers,
      meta: {
        totalCount: totalCustomers,
        totalPages: Math.ceil(totalCustomers / perPage),
        currentPage: page,
        perPage,
        prevPage: page > 1 ? page - 1 : null,
        nextPage: page < Math.ceil(totalCustomers / perPage) ? page + 1 : null,
        hasPrevPage: page > 1,
        hasNextPage: page < Math.ceil(totalCustomers / perPage),
      },
    };
  }

  async findOne(id: number) {
    const customer = await prisma.customer.findUnique({
      where: {
        id,
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        balance: true,
        profile: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!customer) {
      throw new BadRequestException("Customer not found");
    }

    return customer;
  }

  async create(createCustomerInput: CreateCustomerInput) {
    const { name, email, phone, bio, language, avatar, password, status } =
      createCustomerInput;

    const customer = await prisma.customer.create({
      data: {
        name,
        email,
        phone,
        profile: {
          create: {
            bio,
            language,
            avatar,
          },
        },
        status,
        password: hashPassword(password),
      },
    });

    return this.findOne(customer.id);
  }

  async update(id: number, updateCustomerInput: UpdateCustomerInput) {
    const { name, email, phone, bio, language, avatar, password, status } =
      updateCustomerInput;

    const customer = await prisma.customer.findUnique({
      where: {
        id,
      },
      include: {
        profile: true,
      },
    });

    if (!customer) {
      throw new BadRequestException("Customer not found");
    }

    await prisma.customer.update({
      where: {
        id,
      },
      data: {
        name: name || customer.name,
        email: email || customer.email,
        phone: phone || customer.phone,
        profile: {
          update: {
            bio: bio || customer.profile?.bio,
            language: language || customer.profile?.language,
            avatar: avatar || customer.profile?.avatar,
          },
        },
        status,
        password: password ? hashPassword(password) : customer.password,
      },
    });

    return this.findOne(id);
  }
}

export default CustomerService;
